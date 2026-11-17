import {
  ADDRESS_CLAMP_TO_EDGE,
  AppBase,
  BLEND_NONE,
  Color,
  CULLFACE_NONE,
  Entity,
  FILTER_LINEAR,
  Layer,
  Mesh,
  MeshInstance,
  PIXELFORMAT_RGBA8,
  PRIMITIVE_TRIANGLES,
  PROJECTION_ORTHOGRAPHIC,
  RENDERTARGET_ORIGIN_TOP,
  RenderTarget,
  SEMANTIC_COLOR,
  SEMANTIC_POSITION,
  SEMANTIC_TEXCOORD0,
  SEMANTIC_TEXCOORD1,
  SEMANTIC_TEXCOORD2,
  ShaderMaterial,
  Texture
} from 'playcanvas';
import { drainInkBrushBatch, indexInkBrushSurfaces } from '../core/InkBrushHotPath';
import { packInkBrushRasterRuns, InkBrushRasterScratch, type InkStreamGroup } from '../core/InkBrushRasterStream';
import { allocateSurfaceAtlas } from './AtlasAllocator';
import type { PaintRasterRun } from './GameplayInkSystem';
import type { PaintSurface } from './PaintSurface';
import type { PaintEvent } from './types';

const BRUSH_VERTEX_GLSL = `
attribute vec3 vertex_position;
attribute vec2 aUv0;
attribute vec4 aColor;
attribute vec2 aRectMin;
attribute vec2 aRectMax;
uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;
varying vec2 vUv0;
varying vec4 vInkData;
varying vec2 vAtlasPos;
varying vec2 vRectMin;
varying vec2 vRectMax;
void main(void) {
  gl_Position = matrix_viewProjection * matrix_model * vec4(vertex_position, 1.0);
  vUv0 = aUv0;
  vInkData = aColor;
  vAtlasPos = vertex_position.xy;
  vRectMin = aRectMin;
  vRectMax = aRectMax;
}`;

const BRUSH_FRAGMENT_GLSL = `
precision highp float;
varying vec2 vUv0;
varying vec4 vInkData;
varying vec2 vAtlasPos;
varying vec2 vRectMin;
varying vec2 vRectMax;
void main(void) {
  vec2 p = vUv0 * 2.0 - 1.0;
  if (dot(p, p) > 1.0) discard;
  if (vAtlasPos.x < vRectMin.x || vAtlasPos.y < vRectMin.y ||
      vAtlasPos.x > vRectMax.x || vAtlasPos.y > vRectMax.y) discard;
  gl_FragColor = vec4(vInkData.rgb, 1.0);
}`;

const BRUSH_VERTEX_WGSL = `
attribute vertex_position: vec3f;
attribute aUv0: vec2f;
attribute aColor: vec4f;
attribute aRectMin: vec2f;
attribute aRectMax: vec2f;
uniform matrix_model: mat4x4f;
uniform matrix_viewProjection: mat4x4f;
varying vUv0: vec2f;
varying vInkData: vec4f;
varying vAtlasPos: vec2f;
varying vRectMin: vec2f;
varying vRectMax: vec2f;
@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = uniform.matrix_viewProjection * uniform.matrix_model * vec4f(input.vertex_position, 1.0);
  output.vUv0 = input.aUv0;
  output.vInkData = input.aColor;
  output.vAtlasPos = input.vertex_position.xy;
  output.vRectMin = input.aRectMin;
  output.vRectMax = input.aRectMax;
  return output;
}`;

const BRUSH_FRAGMENT_WGSL = `
varying vUv0: vec2f;
varying vInkData: vec4f;
varying vAtlasPos: vec2f;
varying vRectMin: vec2f;
varying vRectMax: vec2f;
@fragment
fn fragmentMain(input: FragmentInput) -> FragmentOutput {
  let p = input.vUv0 * 2.0 - vec2f(1.0);
  if (dot(p, p) > 1.0) { discard; }
  if (input.vAtlasPos.x < input.vRectMin.x || input.vAtlasPos.y < input.vRectMin.y ||
      input.vAtlasPos.x > input.vRectMax.x || input.vAtlasPos.y > input.vRectMax.y) { discard; }
  var output: FragmentOutput;
  output.color = vec4f(input.vInkData.rgb, 1.0);
  return output;
}`;

interface PendingInkEvent {
  event: PaintEvent;
  paintableRuns: readonly PaintRasterRun[];
}

export class GpuInkAtlas {
  public readonly texture: Texture;
  public readonly atlasSize: number;
  public readonly layer: Layer;
  public readonly renderTarget: RenderTarget;

  private readonly pending: PendingInkEvent[] = [];
  private readonly brushSurfaceIndex: ReadonlyMap<string, PaintSurface>;
  // Only this atlas uses this scratch; pack->mesh.update is synchronous.
  private readonly rasterScratch = new InkBrushRasterScratch();
  private readonly cameraEntity: Entity;
  private readonly batchEntity: Entity;
  private readonly mesh: Mesh;
  private primed = false;
  private clearPending = false;
  private paintedThisFrame = false;
  // W10-B20: default OFF for every other game route / production stage.
  // A primed, persistent atlas needs no idle render-target submission.
  private sourceIdlePostRenderFrames = 0;
  private sourceBrushRenderFrames = 0;
  private sourceClearRenderFrames = 0;

  public sourceIdleCameraStatus() {
    return {
      sourcePreviewOnly: this.suspendIdleSourceCamera,
      primed: this.primed,
      cameraEnabled: this.cameraEntity.camera?.enabled === true,
      atlasTexturePersistent: true,
      pendingEvents: this.pending.length,
      brushRenderFrames: this.sourceBrushRenderFrames,
      clearRenderFrames: this.sourceClearRenderFrames,
      idlePostRenderFrames: this.sourceIdlePostRenderFrames,
      unchangedScoreAuthority: true
    };
  }

  public constructor(
    private readonly app: AppBase,
    surfaces: readonly PaintSurface[],
    atlasSize: number,
    pixelsPerMeter: number,
    gutterPixels: number,
    private readonly suspendIdleSourceCamera = false
  ) {
    this.atlasSize = atlasSize;
    const placements = allocateSurfaceAtlas(surfaces, atlasSize, pixelsPerMeter, gutterPixels);
    for (const surface of surfaces) {
      const rect = placements.get(surface.id);
      if (!rect) throw new Error(`No atlas allocation for PaintSurface ${surface.id}`);
      surface.atlasRect = rect;
    }
    // Cache only the stable surface ID -> object; never cache raster authorization.
    this.brushSurfaceIndex = indexInkBrushSurfaces(surfaces);

    this.texture = new Texture(app.graphicsDevice, {
      name: 'PersistentInkAtlas',
      width: atlasSize,
      height: atlasSize,
      format: PIXELFORMAT_RGBA8,
      mipmaps: false,
      minFilter: FILTER_LINEAR,
      magFilter: FILTER_LINEAR,
      addressU: ADDRESS_CLAMP_TO_EDGE,
      addressV: ADDRESS_CLAMP_TO_EDGE
    });

    this.renderTarget = new RenderTarget({
      name: 'PersistentInkAtlasRT',
      colorBuffer: this.texture,
      depth: false,
      origin: RENDERTARGET_ORIGIN_TOP
    });

    this.layer = new Layer({ name: 'InkAtlasBrushLayer' });
    app.scene.layers.insert(this.layer, 0);

    const material = this.createBrushMaterial();
    this.mesh = new Mesh(app.graphicsDevice);
    this.mesh.clear(true, true);
    this.mesh.setPositions([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.mesh.setUvs(0, [0, 0, 0, 0, 0, 0]);
    this.mesh.setUvs(1, [0, 0, 0, 0, 0, 0]);
    this.mesh.setUvs(2, [0, 0, 0, 0, 0, 0]);
    this.mesh.setColors32([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255]);
    this.mesh.setIndices([0, 1, 2]);
    this.mesh.update(PRIMITIVE_TRIANGLES, false);

    const meshInstance = new MeshInstance(this.mesh, material);
    this.batchEntity = new Entity('InkBrushBatch');
    this.batchEntity.addComponent('render', { meshInstances: [meshInstance], layers: [this.layer.id] });
    this.batchEntity.render!.enabled = false;
    app.root.addChild(this.batchEntity);

    this.cameraEntity = new Entity('InkAtlasCamera');
    this.cameraEntity.addComponent('camera', {
      clearColor: new Color(0.5, 0.0, 0.0, 1.0),
      clearColorBuffer: true,
      clearDepthBuffer: false,
      projection: PROJECTION_ORTHOGRAPHIC,
      orthoHeight: 0.5,
      priority: -100,
      layers: [this.layer.id]
    });
    // Assign explicitly as documented by CameraComponent; this also keeps the intent obvious
    // when PlayCanvas component-data typings change.
    this.cameraEntity.camera!.renderTarget = this.renderTarget;
    this.cameraEntity.setPosition(0.5, 0.5, 2);
    this.cameraEntity.lookAt(0.5, 0.5, 0);
    app.root.addChild(this.cameraEntity);

    // First render clears the persistent atlas to neutral. Subsequent frames preserve contents.
    app.once('postrender', () => {
      if (this.cameraEntity.camera) this.cameraEntity.camera.clearColorBuffer = false;
      this.primed = true;
    });

    app.on('postrender', () => {
      // A single init/clear/brush render pass is sufficient; the atlas
      // texture remains available to all normal world materials while idle.
      const wasPainted = this.paintedThisFrame;
      const wasCleared = this.clearPending;
      if (this.suspendIdleSourceCamera) {
        if (wasPainted) this.sourceBrushRenderFrames++;
        if (wasCleared) this.sourceClearRenderFrames++;
        if (!wasPainted && !wasCleared) this.sourceIdlePostRenderFrames++;
      }
      if (this.paintedThisFrame && this.batchEntity.render) {
        this.batchEntity.render.enabled = false;
        this.paintedThisFrame = false;
      }
      if (this.clearPending && this.cameraEntity.camera) {
        this.cameraEntity.camera.clearColorBuffer = false;
        this.clearPending = false;
        this.primed = true;
      }
      if (this.suspendIdleSourceCamera && this.primed && this.cameraEntity.camera) {
        // Do not clear or destroy the persistent color target. The next
        // accepted brush batch (or explicit clear) re-enables this camera.
        this.cameraEntity.camera.enabled = false;
      }
    });
  }

  /**
   * Only accepted CPU raster runs may be rendered. Never restore an
   * unconditional full-ellipse fallback for events lacking run authority.
   */
  public queue(event: PaintEvent, paintableRuns: readonly PaintRasterRun[] = []): void {
    if (paintableRuns.length === 0) return;
    this.pending.push({ event, paintableRuns });
  }

  public get backlog(): number {
    return this.pending.length;
  }

  public flush(maxEvents: number): { events: number; buildMs: number } {
    if (!this.primed || this.clearPending || this.pending.length === 0 ||
        !Number.isFinite(maxEvents) || maxEvents < 1)
      return { events: 0, buildMs: 0 };

    const started = performance.now();
    // Authoritative row-run order, 16-bit quad limit and event completion are
    // preserved by the GPU-only batch drain; avoid repeated shifts/slices.
    const { batch, completedEvents } = drainInkBrushBatch(
      this.pending, Math.floor(maxEvents), 16_383
    );

    // Render only INK's authoritative runs. Stream these directly into the
    // identical GPU buffers without temporary per-run quad/vertex objects.
    const groups: InkStreamGroup[] = [];
    for (const { event, paintableRuns } of batch) {
      const surface = this.brushSurfaceIndex.get(event.surfaceId);
      if (!surface) continue;
      groups.push({ surface, event, paintableRuns });
    }

    const buffers = packInkBrushRasterRuns(groups, this.rasterScratch);
    if (!buffers) {
      return { events: completedEvents, buildMs: performance.now() - started };
    }

    this.mesh.setPositions(buffers.positions);
    this.mesh.setUvs(0, buffers.uvs);
    this.mesh.setUvs(1, buffers.rectMins);
    this.mesh.setUvs(2, buffers.rectMaxs);
    this.mesh.setColors32(buffers.colors);
    this.mesh.setIndices(buffers.indices);
    this.mesh.update(PRIMITIVE_TRIANGLES, false);

    if (this.batchEntity.render) this.batchEntity.render.enabled = true;
    this.paintedThisFrame = true;
    if (this.suspendIdleSourceCamera && this.cameraEntity.camera)
      this.cameraEntity.camera.enabled = true;
    return { events: completedEvents, buildMs: performance.now() - started };
  }

  public clear(): void {
    this.pending.length = 0;
    if (this.batchEntity.render) this.batchEntity.render.enabled = false;
    if (this.cameraEntity.camera) {
      this.cameraEntity.camera.clearColorBuffer = true;
      if (this.suspendIdleSourceCamera) this.cameraEntity.camera.enabled = true;
    }
    this.clearPending = true;
    this.primed = false;
  }

  public destroy(): void {
    this.rasterScratch.release();
    this.texture.destroy();
    this.renderTarget.destroy();
    this.batchEntity.destroy();
    this.cameraEntity.destroy();
    this.app.scene.layers.remove(this.layer);
  }

  private createBrushMaterial(): ShaderMaterial {
    const material = new ShaderMaterial({
      uniqueName: 'ink-atlas-brush',
      vertexGLSL: BRUSH_VERTEX_GLSL,
      fragmentGLSL: BRUSH_FRAGMENT_GLSL,
      vertexWGSL: BRUSH_VERTEX_WGSL,
      fragmentWGSL: BRUSH_FRAGMENT_WGSL,
      attributes: {
        vertex_position: SEMANTIC_POSITION,
        aUv0: SEMANTIC_TEXCOORD0,
        aColor: SEMANTIC_COLOR,
        aRectMin: SEMANTIC_TEXCOORD1,
        aRectMax: SEMANTIC_TEXCOORD2
      }
    });
    material.blendType = BLEND_NONE;
    material.cull = CULLFACE_NONE;
    material.depthTest = false;
    material.depthWrite = false;
    material.update();
    return material;
  }
}
