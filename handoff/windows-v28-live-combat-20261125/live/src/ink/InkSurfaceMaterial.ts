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
uniform float uF4VisualPolish;
uniform vec3 uF4LightDir;
uniform vec3 view_position;
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
  bool f4Film = uF4VisualPolish > 0.5 && uInkOnly > 0.5;
  float worldPattern = 1.0;
  if (!f4Film) {
    worldPattern = 0.965 + 0.035 * sin(vWorldPos.x * 1.6 + vWorldPos.z * 1.2);
    color *= worldPattern;
    color += vec3(0.10, 0.12, 0.14) * wetness;
  }
  if (uSourceWetInkStyle > 0.5 && !f4Film) {
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
  // F4 visual-only wet film: one existing atlas sample, unchanged mask.
  if (f4Film) {
    vec3 n = normalize(uF4PaintPlane.xyz);
    vec3 vRaw = view_position - vWorldPos;
    float distanceToEye = max(length(vRaw), 0.001);
    vec3 v = vRaw / distanceToEye;
    n *= dot(n, v) < 0.0 ? -1.0 : 1.0;
    vec3 lightDir = normalize(uF4LightDir);
    vec3 hRaw = lightDir + v;
    vec3 h = hRaw / max(length(hRaw), 0.001);
    vec2 p = local;
    float detail = 1.0 - smoothstep(6.0, 24.0, distanceToEye);
    float pigment = 0.97;
    // Fade fine pigment before it becomes subpixel; skip far-away waves.
    if (detail > 0.0) {
      float ripple = sin(p.x * 8.0 + p.y * 5.0) * sin(p.y * 7.0 - p.x * 3.0);
      pigment += 0.035 * ripple * detail;
    }
    float facing = clamp(dot(n, v), 0.0, 1.0);
    float edge = 1.0 - facing;
    float edge2 = edge * edge;
    float fresnel = edge2 * edge2;
    float nh = clamp(dot(n, h), 0.0, 1.0);
    float nh2 = nh * nh;
    float nh4 = nh2 * nh2;
    float sheen = nh4 * nh4 * nh4;
    float lit = max(dot(n, lightDir), 0.0);
    float glint = (0.035 * fresnel + 0.13 * sheen * lit) * (0.28 * coverage + 0.72 * wetness);
    color = mix(uNeutralColor, teamColor * pigment, coverage);
    color += vec3(0.93, 0.97, 1.0) * glint;
    color = clamp(color, 0.0, 1.0);
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
uniform uF4VisualPolish: f32;
uniform uF4LightDir: vec3f;
uniform view_position: vec3f;
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
  let f4Film = uniform.uF4VisualPolish > 0.5 && uniform.uInkOnly > 0.5;
  var worldPattern = 1.0;
  if (!f4Film) {
    worldPattern = 0.965 + 0.035 * sin(input.vWorldPos.x * 1.6 + input.vWorldPos.z * 1.2);
    color = color * worldPattern + vec3f(0.10, 0.12, 0.14) * wetness;
  }
  if (uniform.uSourceWetInkStyle > 0.5 && !f4Film) {
    let stipple = sin(input.vWorldPos.x * 12.5 +
      sin(input.vWorldPos.z * 7.4) * 0.8);
    let flow = sin(input.vWorldPos.z * 8.1 - input.vWorldPos.x * 3.7);
    let pigment = 0.89 + 0.15 * (0.5 + 0.5 * stipple * flow);
    let wetGlint = wetness * (0.5 + 0.5 * flow);
    color = mix(uniform.uNeutralColor, teamColor * pigment, coverage) *
      worldPattern + vec3f(0.19, 0.22, 0.25) * wetGlint;
  }
  // Same F4 wet-film expression as GLSL; ownership and coverage untouched.
  if (f4Film) {
    var n = normalize(uniform.uF4PaintPlane.xyz);
    let vRaw = uniform.view_position - input.vWorldPos;
    let distanceToEye = max(length(vRaw), 0.001);
    let v = vRaw / distanceToEye;
    n = n * select(1.0, -1.0, dot(n, v) < 0.0);
    let lightDir = normalize(uniform.uF4LightDir);
    let hRaw = lightDir + v;
    let h = hRaw / max(length(hRaw), 0.001);
    let p = local;
    let detail = 1.0 - smoothstep(6.0, 24.0, distanceToEye);
    var pigment = 0.97;
    if (detail > 0.0) {
      let ripple = sin(p.x * 8.0 + p.y * 5.0) * sin(p.y * 7.0 - p.x * 3.0);
      pigment += 0.035 * ripple * detail;
    }
    let facing = clamp(dot(n, v), 0.0, 1.0);
    let edge = 1.0 - facing;
    let edge2 = edge * edge;
    let fresnel = edge2 * edge2;
    let nh = clamp(dot(n, h), 0.0, 1.0);
    let nh2 = nh * nh;
    let nh4 = nh2 * nh2;
    let sheen = nh4 * nh4 * nh4;
    let lit = max(dot(n, lightDir), 0.0);
    let glint = (0.035 * fresnel + 0.13 * sheen * lit) * (0.28 * coverage + 0.72 * wetness);
    color = mix(uniform.uNeutralColor, teamColor * pigment, coverage);
    color = clamp(color + vec3f(0.93, 0.97, 1.0) * glint, vec3f(0.0), vec3f(1.0));
  }
  var output: FragmentOutput;
  output.color = vec4f(color, 1.0);
  return output;
}`;

/** Same optical-only settings for registered floors and new backed walls.
 * Invalid light direction disables the optional wet-film path, never ink. */
export function configureF4InkVisual(material: import('playcanvas').Material,
  enabled: boolean, light?: { x:number; y:number; z:number }): void {
  const valid=!!light&&Number.isFinite(light.x)&&Number.isFinite(light.y)&&
    Number.isFinite(light.z)&&Math.hypot(light.x,light.y,light.z)>1e-6;
  material.setParameter('uF4VisualPolish',enabled&&valid?1:0);
  if(enabled&&valid&&light) material.setParameter('uF4LightDir',
    new Float32Array([light.x,light.y,light.z]));
}

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
  material.setParameter('uF4VisualPolish', 0);
  material.setParameter('uF4LightDir', new Float32Array([0, 1, 0]));
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
