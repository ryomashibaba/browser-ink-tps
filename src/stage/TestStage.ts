import {
  AppBase,
  Color,
  Entity,
  Mesh,
  MeshInstance,
  StandardMaterial,
  Vec3
} from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { createInkSurfaceMaterial } from '../ink/InkSurfaceMaterial';
import { PaintSurface } from '../ink/PaintSurface';
import type { GpuInkAtlas } from '../ink/GpuInkAtlas';
import {
  TEST_STAGE_DEFINITION,
  type StageDefinition,
  type StageMaterialKey,
  type StageSolidDefinition,
  type StageVector3
} from './StageDefinition';

export { TEST_STAGE_DEFINITION } from './StageDefinition';

export interface StageBuildResult {
  surfaces: PaintSurface[];
}

export function defineTestSurfaces(
  gameplayInk: GameplayInkSystem,
  definition: StageDefinition = TEST_STAGE_DEFINITION
): PaintSurface[] {
  const cell = GAME_CONFIG.ink.cellSizeMeters;
  const tile = GAME_CONFIG.ink.dirtyTileCells;
  const surfaces = definition.paintSurfaces.map((surface) => new PaintSurface(
    surface.id,
    vec3(surface.center),
    vec3(surface.uAxis),
    vec3(surface.vAxis),
    surface.widthMeters,
    surface.heightMeters,
    cell,
    surface.flags,
    tile
  ));

  for (const surface of surfaces) gameplayInk.registerSurface(surface);
  return surfaces;
}

export function buildTestStage(
  app: AppBase,
  definition: StageDefinition,
  surfaces: readonly PaintSurface[],
  atlas: GpuInkAtlas
): StageBuildResult {
  const root = new Entity('StageRoot');
  app.root.addChild(root);

  // Paintable geometry remains generated from the exact frozen PaintSurface basis.
  for (const surface of surfaces) {
    const material = createInkSurfaceMaterial(surface, atlas.texture);
    const mesh = createSurfaceMesh(app, surface);
    const meshInstance = new MeshInstance(mesh, material);
    const entity = new Entity('PaintSurface:' + surface.id);
    entity.addComponent('render', { meshInstances: [meshInstance], castShadows: false, receiveShadows: false });
    root.addChild(entity);
  }

  const materials: Record<StageMaterialKey, StandardMaterial> = {
    dark: makeMaterial(new Color(0.08, 0.11, 0.14), 0.25, 0.78),
    medium: makeMaterial(new Color(0.16, 0.20, 0.23), 0.2, 0.64),
    light: makeMaterial(new Color(0.30, 0.35, 0.38), 0.15, 0.55),
    accent: makeMaterial(new Color(0.44, 0.72, 0.77), 0.35, 0.68)
  };

  // T8: the same solid definitions now drive visible box geometry and Rapier blockers.
  for (const solid of definition.solids) {
    if (!solid.render) continue;
    createSolidBox(root, solid, materials[solid.material]);
  }

  return { surfaces: [...surfaces] };
}

function createSurfaceMesh(app: AppBase, surface: PaintSurface): Mesh {
  const hu = surface.widthMeters * 0.5;
  const hv = surface.heightMeters * 0.5;
  const p0 = point(surface.center, surface.uAxis, -hu, surface.vAxis, -hv);
  const p1 = point(surface.center, surface.uAxis, hu, surface.vAxis, -hv);
  const p2 = point(surface.center, surface.uAxis, hu, surface.vAxis, hv);
  const p3 = point(surface.center, surface.uAxis, -hu, surface.vAxis, hv);

  const positions = new Float32Array([
    p0.x, p0.y, p0.z,
    p1.x, p1.y, p1.z,
    p2.x, p2.y, p2.z,
    p3.x, p3.y, p3.z
  ]);
  const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const mesh = new Mesh(app.graphicsDevice);
  mesh.setPositions(positions);
  mesh.setUvs(0, uvs);
  mesh.setIndices(indices);
  mesh.update();
  return mesh;
}

function point(center: Vec3, u: Vec3, du: number, v: Vec3, dv: number): Vec3 {
  return new Vec3(
    center.x + u.x * du + v.x * dv,
    center.y + u.y * du + v.y * dv,
    center.z + u.z * du + v.z * dv
  );
}

function vec3(value: StageVector3): Vec3 {
  return new Vec3(value[0], value[1], value[2]);
}

function makeMaterial(color: Color, metalness: number, gloss: number): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = color;
  material.useMetalness = true;
  material.metalness = metalness;
  material.gloss = gloss;
  material.update();
  return material;
}

function createSolidBox(
  parent: Entity,
  solid: StageSolidDefinition,
  material: StandardMaterial
): Entity {
  const entity = new Entity(solid.id);
  entity.addComponent('render', { type: 'box', material, castShadows: true, receiveShadows: true });
  entity.setPosition(vec3(solid.center));
  entity.setLocalScale(vec3(solid.size));
  if (solid.rotationEulerDegrees) {
    const rotation = solid.rotationEulerDegrees;
    entity.setEulerAngles(rotation[0], rotation[1], rotation[2]);
  }
  parent.addChild(entity);
  return entity;
}
