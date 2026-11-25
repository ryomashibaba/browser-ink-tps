import {
  CULLFACE_NONE,
  SEMANTIC_POSITION,
  SEMANTIC_TEXCOORD0,
  ShaderMaterial,
  Texture
} from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { surfaceTextureUvRect } from './AtlasCoordinates';
import { F4_PAINT_PLANE_TOLERANCE, type PaintSurface } from './PaintSurface';

const VERTEX_GLSL = `
attribute vec3 vertex_position;
attribute vec2 aUv0;
uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;
varying vec2 vUv0;
varying vec3 vWorldPos;
void main(void) {
  vec4 world = matrix_model * vec4(vertex_position, 1.0);
  gl_Position = matrix_viewProjection * world;
  vUv0 = aUv0;
  vWorldPos = world.xyz;
}`;

export const FRAGMENT_GLSL = `
precision highp float;
uniform sampler2D uInkAtlas;
uniform vec4 uAtlasRect;
uniform vec2 uSurfaceMeters;
uniform float uInkCellSize;
uniform float uAtlasTexelSize;
uniform vec3 uNeutralColor;
uniform vec3 uTeamAColor;
uniform vec3 uTeamBColor;
uniform float uSourceWetInkStyle;
uniform float uInkOnly;
uniform vec4 uF4PaintPlane;
varying vec2 vUv0;
varying vec3 vWorldPos;
void main(void) {
  if (uInkOnly > 0.5 &&
      (any(lessThan(vUv0, vec2(0.0))) || any(greaterThan(vUv0, vec2(1.0))) ||
       abs(dot(uF4PaintPlane.xyz, vWorldPos) - uF4PaintPlane.w) > ${F4_PAINT_PLANE_TOLERANCE})) discard;
  // Keep bilinear filtering inside each authoritative raster cell:
  // no color may leak from a neighboring approved cell into a blocked one.
  vec2 local = clamp(vUv0 * uSurfaceMeters, vec2(0.0), uSurfaceMeters - vec2(1e-5));
  vec2 cellBegin = floor(local / uInkCellSize) * uInkCellSize;
  vec2 cellEnd = min(cellBegin + vec2(uInkCellSize), uSurfaceMeters);
  vec2 minUv = uAtlasRect.xy + (cellBegin / uSurfaceMeters) * uAtlasRect.zw;
  vec2 maxUv = uAtlasRect.xy + (cellEnd / uSurfaceMeters) * uAtlasRect.zw;
  vec2 halfPixel = min(vec2(uAtlasTexelSize * 0.5), (maxUv - minUv) * 0.49);
  vec2 atlasUv = clamp(uAtlasRect.xy + vUv0 * uAtlasRect.zw,
    minUv + halfPixel, maxUv - halfPixel);
  vec4 ink = texture2D(uInkAtlas, atlasUv);
  float coverage = clamp(ink.g, 0.0, 1.0);
  if (uInkOnly > 0.5 && coverage < 0.01) discard;
  float wetness = clamp(ink.b, 0.0, 1.0) * coverage;
  vec3 teamColor = mix(uTeamBColor, uTeamAColor, step(0.5, ink.r));
  vec3 color = mix(uNeutralColor, teamColor, coverage);
  float worldPattern = 0.965 + 0.035 * sin(vWorldPos.x * 1.6 + vWorldPos.z * 1.2);
  color *= worldPattern;
  color += vec3(0.10, 0.12, 0.14) * wetness;
  if (uSourceWetInkStyle > 0.5) {
    // A deliberately SOURCE-only, authored visual treatment. The existing
    // atlas coverage and original footprint STILL determine every ink pixel.
    // Pigment and wet highlights disappear exactly when coverage is zero.
    float stipple = sin(vWorldPos.x * 12.5 + sin(vWorldPos.z * 7.4) * 0.8);
    float flow = sin(vWorldPos.z * 8.1 - vWorldPos.x * 3.7);
    float pigment = 0.89 + 0.15 * (0.5 + 0.5 * stipple * flow);
    float wetGlint = wetness * (0.5 + 0.5 * flow);
    color = mix(uNeutralColor, teamColor * pigment, coverage) * worldPattern;
    color += vec3(0.19, 0.22, 0.25) * wetGlint;
  }
  gl_FragColor = vec4(color, 1.0);
}`;

const VERTEX_WGSL = `
attribute vertex_position: vec3f;
attribute aUv0: vec2f;
uniform matrix_model: mat4x4f;
uniform matrix_viewProjection: mat4x4f;
varying vUv0: vec2f;
varying vWorldPos: vec3f;
@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  let world = uniform.matrix_model * vec4f(input.vertex_position, 1.0);
  output.position = uniform.matrix_viewProjection * world;
  output.vUv0 = input.aUv0;
  output.vWorldPos = world.xyz;
  return output;
}`;

export const FRAGMENT_WGSL = `
uniform uAtlasRect: vec4f;
uniform uSurfaceMeters: vec2f;
uniform uInkCellSize: f32;
uniform uAtlasTexelSize: f32;
uniform uNeutralColor: vec3f;
uniform uTeamAColor: vec3f;
uniform uTeamBColor: vec3f;
uniform uSourceWetInkStyle: f32;
uniform uInkOnly: f32;
uniform uF4PaintPlane: vec4f;
var uInkAtlas: texture_2d<f32>;
var uInkAtlasSampler: sampler;
varying vUv0: vec2f;
varying vWorldPos: vec3f;
@fragment
fn fragmentMain(input: FragmentInput) -> FragmentOutput {
  if (uniform.uInkOnly > 0.5 &&
      (any(input.vUv0 < vec2f(0.0)) || any(input.vUv0 > vec2f(1.0)) ||
       abs(dot(uniform.uF4PaintPlane.xyz, input.vWorldPos) - uniform.uF4PaintPlane.w) > ${F4_PAINT_PLANE_TOLERANCE})) { discard; }
  let local = clamp(input.vUv0 * uniform.uSurfaceMeters,
    vec2f(0.0), uniform.uSurfaceMeters - vec2f(1e-5));
  let cellBegin = floor(local / uniform.uInkCellSize) * uniform.uInkCellSize;
  let cellEnd = min(cellBegin + vec2f(uniform.uInkCellSize), uniform.uSurfaceMeters);
  let minUv = uniform.uAtlasRect.xy +
    (cellBegin / uniform.uSurfaceMeters) * uniform.uAtlasRect.zw;
  let maxUv = uniform.uAtlasRect.xy +
    (cellEnd / uniform.uSurfaceMeters) * uniform.uAtlasRect.zw;
  let halfPixel = min(vec2f(uniform.uAtlasTexelSize * 0.5),
    (maxUv - minUv) * 0.49);
  let atlasUv = clamp(uniform.uAtlasRect.xy + input.vUv0 * uniform.uAtlasRect.zw,
    minUv + halfPixel, maxUv - halfPixel);
  let ink = textureSample(uInkAtlas, uInkAtlasSampler, atlasUv);
  let coverage = clamp(ink.g, 0.0, 1.0);
  if (uniform.uInkOnly > 0.5 && coverage < 0.01) { discard; }
  let wetness = clamp(ink.b, 0.0, 1.0) * coverage;
  let teamColor = mix(uniform.uTeamBColor, uniform.uTeamAColor, step(0.5, ink.r));
  var color = mix(uniform.uNeutralColor, teamColor, coverage);
  let worldPattern = 0.965 + 0.035 * sin(input.vWorldPos.x * 1.6 + input.vWorldPos.z * 1.2);
  color = color * worldPattern + vec3f(0.10, 0.12, 0.14) * wetness;
  if (uniform.uSourceWetInkStyle > 0.5) {
    let stipple = sin(input.vWorldPos.x * 12.5 +
      sin(input.vWorldPos.z * 7.4) * 0.8);
    let flow = sin(input.vWorldPos.z * 8.1 - input.vWorldPos.x * 3.7);
    let pigment = 0.89 + 0.15 * (0.5 + 0.5 * stipple * flow);
    let wetGlint = wetness * (0.5 + 0.5 * flow);
    color = mix(uniform.uNeutralColor, teamColor * pigment, coverage) *
      worldPattern + vec3f(0.19, 0.22, 0.25) * wetGlint;
  }
  var output: FragmentOutput;
  output.color = vec4f(color, 1.0);
  return output;
}`;

export function createInkSurfaceMaterial(surface: PaintSurface, atlas: Texture, sourceWetInkStyle = false): ShaderMaterial {
  const rect = surface.atlasRect;
  if (!rect) throw new Error(`Surface ${surface.id} has no atlas rect.`);

  const material = new ShaderMaterial({
    uniqueName: `ink-surface-${surface.id}`,
    vertexGLSL: VERTEX_GLSL,
    fragmentGLSL: FRAGMENT_GLSL,
    vertexWGSL: VERTEX_WGSL,
    fragmentWGSL: FRAGMENT_WGSL,
    attributes: {
      vertex_position: SEMANTIC_POSITION,
      aUv0: SEMANTIC_TEXCOORD0
    }
  });

  material.cull = CULLFACE_NONE;
  material.setParameter('uInkOnly', 0);
  material.setParameter('uF4PaintPlane', new Float32Array([
    surface.normal.x, surface.normal.y, surface.normal.z, surface.normal.dot(surface.center)
  ]));
  material.setParameter('uInkAtlas', atlas);
  const sampleRect = surfaceTextureUvRect(surface, rect);
  material.setParameter('uAtlasRect', new Float32Array([
    sampleRect.x,
    sampleRect.y,
    sampleRect.width,
    sampleRect.height
  ]));
  material.setParameter('uSurfaceMeters', new Float32Array([
    surface.widthMeters,
    surface.heightMeters
  ]));
  material.setParameter('uInkCellSize', surface.cellSize);
  material.setParameter('uAtlasTexelSize', 1 / rect.atlasSize);
  material.setParameter('uNeutralColor', new Float32Array(GAME_CONFIG.visual.neutral));
  material.setParameter('uTeamAColor', new Float32Array(GAME_CONFIG.visual.teamA));
  material.setParameter('uTeamBColor', new Float32Array(GAME_CONFIG.visual.teamB));
  // Defaults OFF for every existing production/T20/test stage renderer.
  material.setParameter('uSourceWetInkStyle', sourceWetInkStyle ? 1 : 0);
  material.update();
  return material;
}
