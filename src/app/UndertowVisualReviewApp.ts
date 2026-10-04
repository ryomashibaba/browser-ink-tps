import {
  AppBase,
  AppOptions,
  calculateNormals,
  CameraComponentSystem,
  Color,
  ContainerHandler,
  createGraphicsDevice,
  DEVICETYPE_WEBGPU,
  Entity,
  FILLMODE_FILL_WINDOW,
  LightComponentSystem,
  Mesh,
  MeshInstance,
  RenderComponentSystem,
  RESOLUTION_AUTO,
  StandardMaterial,
  TextureHandler,
  Vec3
} from 'playcanvas';
import { rasterizeStageFootprint } from '../stage/StageFootprint';
import type {
  StageNavigationLinkDefinition,
  StageSolidDefinition,
  StageVector3
} from '../stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_T21_VISUAL_REVIEW } from '../stage/undertow/UndertowSpillwayVisualReview';

type ReviewView = 'OVERVIEW' | 'TOP' | 'SPAWN_A' | 'SPAWN_B';

interface ReviewMaterials {
  paintBacked: StandardMaterial;
  structure: StandardMaterial;
  visualOnly: StandardMaterial;
  supportOnly: StandardMaterial;
  spawnA: StandardMaterial;
  spawnB: StandardMaterial;
  nav: StandardMaterial;
}

export class UndertowVisualReviewApp {
  public static async boot(
    canvas: HTMLCanvasElement,
    uiRoot: HTMLElement
  ): Promise<UndertowVisualReviewApp> {
    const device = await createGraphicsDevice(canvas, {
      deviceTypes: [DEVICETYPE_WEBGPU],
      antialias: true,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance'
    });
    device.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const options = new AppOptions();
    options.graphicsDevice = device;
    options.componentSystems = [
      RenderComponentSystem,
      CameraComponentSystem,
      LightComponentSystem
    ];
    options.resourceHandlers = [TextureHandler, ContainerHandler];

    const app = new AppBase(canvas);
    app.init(options);
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);

    return new UndertowVisualReviewApp(app, canvas, uiRoot);
  }

  private readonly materials: ReviewMaterials;
  private readonly camera: Entity;
  private readonly target = new Vec3();
  private readonly navRoot = new Entity('T21Review:Navigation');
  private readonly keys = new Set<string>();
  private yawDegrees = 35;
  private pitchDegrees = 42;
  private distanceMeters = 70;
  private dragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  private constructor(
    private readonly app: AppBase,
    private readonly canvas: HTMLCanvasElement,
    private readonly uiRoot: HTMLElement
  ) {
    document.title = 'Ink TPS — T21 Undertow Visual Review';
    this.materials = createReviewMaterials();
    this.camera = this.createCamera();
    this.createLighting();
    this.buildReviewedGeometry();
    this.buildSpawnMarkers();
    this.buildNavigationMarkers();
    this.createReviewPanel();
    this.bindControls();
    this.setView('OVERVIEW');
    this.updateCamera();

    this.app.on('update', (dt: number) => {
      this.updateKeyboardNavigation(
        Number.isFinite(dt) ? Math.min(Math.max(dt, 0), 0.05) : 0
      );
      this.updateCamera();
    });
    window.addEventListener('resize', () => this.app.resizeCanvas());
    this.app.start();
  }

  private createCamera(): Entity {
    const world = this.app.scene.layers.getLayerByName('World');
    if (!world) throw new Error('PlayCanvas World layer is unavailable.');

    const camera = new Entity('T21Review:Camera');
    camera.addComponent('camera', {
      clearColor: new Color(0.035, 0.05, 0.065, 1),
      nearClip: 0.1,
      farClip: 500,
      fov: 55,
      layers: [world.id]
    });
    this.app.root.addChild(camera);
    return camera;
  }

  private createLighting(): void {
    this.app.scene.ambientLight = new Color(0.52, 0.56, 0.62);

    const key = new Entity('T21Review:KeyLight');
    key.addComponent('light', {
      type: 'directional',
      color: new Color(1, 0.96, 0.90),
      intensity: 1.55,
      castShadows: true,
      shadowResolution: 2048
    });
    key.setEulerAngles(52, -32, 0);
    this.app.root.addChild(key);

    const fill = new Entity('T21Review:FillLight');
    fill.addComponent('light', {
      type: 'omni',
      color: new Color(0.32, 0.70, 0.95),
      intensity: 1.2,
      range: 90,
      castShadows: false
    });
    fill.setPosition(0, 18, 0);
    this.app.root.addChild(fill);
  }

  private buildReviewedGeometry(): void {
    const root = new Entity('T21Review:Geometry');
    this.app.root.addChild(root);
    const paintBackings = new Set(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.map(
        surface => surface.backingSolidId
      )
    );

    for (const solid of UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids) {
      const material = paintBackings.has(solid.id)
        ? this.materials.paintBacked
        : solid.render === false
          ? this.materials.supportOnly
          : solid.collisionEnabled === false && solid.navigationEnabled === false
            ? this.materials.visualOnly
            : this.materials.structure;
      createReviewSolid(this.app, root, solid, material);
    }
  }

  private buildSpawnMarkers(): void {
    createMarker(
      this.app,
      'T21Review:SpawnA',
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.teamASpawnFloorPoint,
      this.materials.spawnA,
      0.75
    );
    createMarker(
      this.app,
      'T21Review:SpawnB',
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.teamBSpawnFloorPoint,
      this.materials.spawnB,
      0.75
    );
  }

  private buildNavigationMarkers(): void {
    this.app.root.addChild(this.navRoot);
    for (const link of UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.navigationLinks) {
      createNavigationMarker(this.navRoot, link, this.materials.nav);
    }
  }

  private createReviewPanel(): void {
    const bounds = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.worldBounds;
    const width = bounds.maxX - bounds.minX;
    const depth = bounds.maxZ - bounds.minZ;
    const panel = document.createElement('section');
    panel.id = 't21-review-panel';
    panel.className = 'panel';
    panel.innerHTML = `
      <div class="review-title">
        <strong>T21 UNDERTOW VISUAL REVIEW</strong>
        <span>REVIEW ONLY</span>
      </div>
      <p class="review-warning">
        Production remains T20. Only geometry already admitted into the current
        T21-D partial blockout is rendered; deferred geometry is intentionally omitted.
      </p>
      <div class="review-stats">
        <span>Reviewed solids</span><b>${UNDERTOW_T21_VISUAL_REVIEW.solidCount}</b>
        <span>Paint-backed surfaces</span><b>${UNDERTOW_T21_VISUAL_REVIEW.paintSurfaceCount}</b>
        <span>Navigation links</span><b>${UNDERTOW_T21_VISUAL_REVIEW.navigationLinkCount}</b>
        <span>World X/Z span</span><b>${width.toFixed(1)} × ${depth.toFixed(1)} m</b>
      </div>
      <div class="review-actions">
        <button data-review-view="OVERVIEW">Overview</button>
        <button data-review-view="TOP">Top</button>
        <button data-review-view="SPAWN_A">Spawn A</button>
        <button data-review-view="SPAWN_B">Spawn B</button>
        <button id="t21-review-nav-toggle">Nav markers ON</button>
      </div>
      <div class="review-legend">
        <span><i class="paint"></i> paint-backed reviewed geometry</span>
        <span><i class="structure"></i> reviewed structure</span>
        <span><i class="visual"></i> visual-only reviewed source</span>
        <span><i class="support"></i> collision/support-only geometry</span>
        <span><i class="nav"></i> currently authored nav links</span>
      </div>
      <details open>
        <summary>Deferred / not rendered (${UNDERTOW_T21_VISUAL_REVIEW.deferredFeatureIds.length})</summary>
        <ul>
          ${UNDERTOW_T21_VISUAL_REVIEW.deferredFeatureIds
            .map(id => `<li>${escapeHtml(id)}</li>`)
            .join('')}
        </ul>
      </details>
      <details>
        <summary>Activation blockers (${UNDERTOW_T21_VISUAL_REVIEW.activationBlockers.length})</summary>
        <ul>
          ${UNDERTOW_T21_VISUAL_REVIEW.activationBlockers
            .map(id => `<li>${escapeHtml(id)}</li>`)
            .join('')}
        </ul>
      </details>
      <p class="review-help">
        Drag: orbit · Wheel: zoom · WASD: pan · Arrow keys: orbit · Shift: faster
      </p>
    `;
    this.uiRoot.appendChild(panel);

    panel
      .querySelectorAll<HTMLButtonElement>('[data-review-view]')
      .forEach(button => {
        button.addEventListener('click', () => {
          this.setView(button.dataset.reviewView as ReviewView);
        });
      });

    const navToggle = panel.querySelector<HTMLButtonElement>('#t21-review-nav-toggle');
    navToggle?.addEventListener('click', () => {
      this.navRoot.enabled = !this.navRoot.enabled;
      if (navToggle) {
        navToggle.textContent = this.navRoot.enabled
          ? 'Nav markers ON'
          : 'Nav markers OFF';
      }
    });
  }

  private bindControls(): void {
    this.canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      this.dragging = true;
      this.lastPointerX = event.clientX;
      this.lastPointerY = event.clientY;
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener('pointermove', event => {
      if (!this.dragging) return;
      const dx = event.clientX - this.lastPointerX;
      const dy = event.clientY - this.lastPointerY;
      this.lastPointerX = event.clientX;
      this.lastPointerY = event.clientY;
      this.yawDegrees -= dx * 0.22;
      this.pitchDegrees = clamp(this.pitchDegrees + dy * 0.18, 8, 89.5);
    });
    this.canvas.addEventListener('pointerup', event => {
      this.dragging = false;
      if (this.canvas.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }
    });
    this.canvas.addEventListener('pointercancel', () => {
      this.dragging = false;
    });
    this.canvas.addEventListener(
      'wheel',
      event => {
        event.preventDefault();
        this.distanceMeters = clamp(
          this.distanceMeters * Math.exp(event.deltaY * 0.0012),
          6,
          240
        );
      },
      { passive: false }
    );

    window.addEventListener('keydown', event => {
      this.keys.add(event.code);
      if (event.code.startsWith('Arrow')) event.preventDefault();
    });
    window.addEventListener('keyup', event => {
      this.keys.delete(event.code);
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.dragging = false;
    });
  }

  private updateKeyboardNavigation(dt: number): void {
    if (dt <= 0) return;
    const speed =
      Math.max(5, Math.min(34, this.distanceMeters * 0.34)) *
      (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? 2.2 : 1);
    const yaw = this.yawDegrees * Math.PI / 180;
    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = -Math.sin(yaw);

    let forward = 0;
    let right = 0;
    if (this.keys.has('KeyW')) forward += 1;
    if (this.keys.has('KeyS')) forward -= 1;
    if (this.keys.has('KeyD')) right += 1;
    if (this.keys.has('KeyA')) right -= 1;

    this.target.x += (forwardX * forward + rightX * right) * speed * dt;
    this.target.z += (forwardZ * forward + rightZ * right) * speed * dt;

    if (this.keys.has('ArrowLeft')) this.yawDegrees += 70 * dt;
    if (this.keys.has('ArrowRight')) this.yawDegrees -= 70 * dt;
    if (this.keys.has('ArrowUp')) {
      this.pitchDegrees = clamp(this.pitchDegrees - 55 * dt, 8, 89.5);
    }
    if (this.keys.has('ArrowDown')) {
      this.pitchDegrees = clamp(this.pitchDegrees + 55 * dt, 8, 89.5);
    }
  }

  private setView(view: ReviewView): void {
    const bounds = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.worldBounds;
    const centerX = (bounds.minX + bounds.maxX) * 0.5;
    const centerZ = (bounds.minZ + bounds.maxZ) * 0.5;
    const span = Math.max(
      bounds.maxX - bounds.minX,
      bounds.maxZ - bounds.minZ
    );

    if (view === 'TOP') {
      this.target.set(centerX, 2.8, centerZ);
      this.yawDegrees = 0;
      this.pitchDegrees = 89.5;
      this.distanceMeters = Math.max(28, span * 0.72);
      return;
    }

    if (view === 'SPAWN_A' || view === 'SPAWN_B') {
      const source = view === 'SPAWN_A'
        ? UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.teamASpawnFloorPoint
        : UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.teamBSpawnFloorPoint;
      this.target.set(source[0], source[1] - 1.2, source[2]);
      this.yawDegrees = view === 'SPAWN_A' ? 0 : 180;
      this.pitchDegrees = 28;
      this.distanceMeters = Math.max(16, span * 0.23);
      return;
    }

    this.target.set(centerX, 2.8, centerZ);
    this.yawDegrees = 35;
    this.pitchDegrees = 42;
    this.distanceMeters = Math.max(42, span * 0.82);
  }

  private updateCamera(): void {
    const yaw = this.yawDegrees * Math.PI / 180;
    const pitch = this.pitchDegrees * Math.PI / 180;
    const horizontal = this.distanceMeters * Math.cos(pitch);
    const position = new Vec3(
      this.target.x + horizontal * Math.sin(yaw),
      this.target.y + this.distanceMeters * Math.sin(pitch),
      this.target.z + horizontal * Math.cos(yaw)
    );
    this.camera.setPosition(position);
    this.camera.lookAt(this.target);
  }
}

function createReviewMaterials(): ReviewMaterials {
  return {
    paintBacked: makeMaterial(new Color(0.14, 0.62, 0.70), 0.08),
    structure: makeMaterial(new Color(0.38, 0.43, 0.48), 0.02),
    visualOnly: makeMaterial(new Color(0.63, 0.45, 0.18), 0.08),
    supportOnly: makeMaterial(new Color(0.78, 0.31, 0.16), 0.10),
    spawnA: makeMaterial(new Color(0.05, 0.90, 1.00), 0.55),
    spawnB: makeMaterial(new Color(1.00, 0.10, 0.58), 0.55),
    nav: makeMaterial(new Color(0.50, 1.00, 0.32), 0.48)
  };
}

function makeMaterial(color: Color, emissiveStrength: number): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = color;
  material.emissive = new Color(
    color.r * emissiveStrength,
    color.g * emissiveStrength,
    color.b * emissiveStrength
  );
  material.useMetalness = true;
  material.metalness = 0.04;
  material.gloss = 0.52;
  material.update();
  return material;
}

function createReviewSolid(
  app: AppBase,
  parent: Entity,
  solid: StageSolidDefinition,
  material: StandardMaterial
): void {
  const entity = new Entity(`T21Review:${solid.id}`);
  entity.setPosition(vec3(solid.center));
  if (solid.rotationEulerDegrees) {
    entity.setEulerAngles(
      solid.rotationEulerDegrees[0],
      solid.rotationEulerDegrees[1],
      solid.rotationEulerDegrees[2]
    );
  }

  if (solid.triangleMesh) {
    const positions = solid.triangleMesh.vertices.flatMap(vertex => [...vertex]);
    const indices = [...solid.triangleMesh.indices];
    const mesh = new Mesh(app.graphicsDevice);
    mesh.setPositions(new Float32Array(positions));
    mesh.setNormals(new Float32Array(calculateNormals(positions, indices)));
    mesh.setIndices(new Uint32Array(indices));
    mesh.update();
    const meshInstance = new MeshInstance(mesh, material);
    entity.addComponent('render', {
      meshInstances: [meshInstance],
      castShadows: true,
      receiveShadows: true
    });
    parent.addChild(entity);
    return;
  }

  if (!solid.footprint) {
    entity.addComponent('render', {
      type: 'box',
      material,
      castShadows: true,
      receiveShadows: true
    });
    entity.setLocalScale(vec3(solid.size));
    parent.addChild(entity);
    return;
  }

  const raster = rasterizeStageFootprint(
    solid.size[0],
    solid.size[2],
    solid.footprint
  );
  raster.rectangles.forEach((rect, index) => {
    const piece = new Entity(`T21Review:${solid.id}:footprint:${index}`);
    piece.addComponent('render', {
      type: 'box',
      material,
      castShadows: true,
      receiveShadows: true
    });
    piece.setLocalPosition(
      rect.centerU - solid.size[0] * 0.5,
      0,
      rect.centerV - solid.size[2] * 0.5
    );
    piece.setLocalScale(rect.widthMeters, solid.size[1], rect.depthMeters);
    entity.addChild(piece);
  });
  parent.addChild(entity);
}

function createMarker(
  app: AppBase,
  name: string,
  position: StageVector3,
  material: StandardMaterial,
  diameterMeters: number
): void {
  const marker = new Entity(name);
  marker.addComponent('render', {
    type: 'sphere',
    material,
    castShadows: false,
    receiveShadows: false
  });
  marker.setPosition(position[0], position[1] + diameterMeters * 0.65, position[2]);
  marker.setLocalScale(diameterMeters, diameterMeters, diameterMeters);
  app.root.addChild(marker);
}

function createNavigationMarker(
  root: Entity,
  link: StageNavigationLinkDefinition,
  material: StandardMaterial
): void {
  const start = vec3(link.start);
  const end = vec3(link.end);
  const midpoint = start.clone().add(end).mulScalar(0.5);
  const length = start.distance(end);

  const bar = new Entity(`T21Review:Nav:${link.id}`);
  bar.addComponent('render', {
    type: 'box',
    material,
    castShadows: false,
    receiveShadows: false
  });
  bar.setPosition(midpoint);
  bar.lookAt(end);
  bar.setLocalScale(0.12, 0.12, Math.max(0.15, length));
  root.addChild(bar);

  for (const [suffix, point] of [['start', start], ['end', end]] as const) {
    const endpoint = new Entity(`T21Review:Nav:${link.id}:${suffix}`);
    endpoint.addComponent('render', {
      type: 'sphere',
      material,
      castShadows: false,
      receiveShadows: false
    });
    endpoint.setPosition(point);
    endpoint.setLocalScale(0.28, 0.28, 0.28);
    root.addChild(endpoint);
  }
}

function vec3(value: StageVector3): Vec3 {
  return new Vec3(value[0], value[1], value[2]);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char] ?? char)
  );
}
