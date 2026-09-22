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
import { SurfaceFlags } from '../ink/types';
import type { GpuInkAtlas } from '../ink/GpuInkAtlas';

export interface StageBuildResult {
  surfaces: PaintSurface[];
}

export function defineTestSurfaces(gameplayInk: GameplayInkSystem): PaintSurface[] {
  const cell = GAME_CONFIG.ink.cellSizeMeters;
  const tile = GAME_CONFIG.ink.dirtyTileCells;
  const scoreableFloor = SurfaceFlags.Paintable | SurfaceFlags.Swimmable | SurfaceFlags.Scoreable | SurfaceFlags.Floor;
  const scoreableRamp = SurfaceFlags.Paintable | SurfaceFlags.Swimmable | SurfaceFlags.Scoreable | SurfaceFlags.Ramp;
  const wall = SurfaceFlags.Paintable | SurfaceFlags.Swimmable | SurfaceFlags.Wall;

  const rampAngle = 20 * Math.PI / 180;
  const surfaces = [
    new PaintSurface(
      'main-floor', new Vec3(0, 0.03, 0), new Vec3(1, 0, 0), new Vec3(0, 0, 1),
      18, 14, cell, scoreableFloor, tile
    ),
    new PaintSurface(
      'upper-floor', new Vec3(5.1, 2.45, 1.4), new Vec3(1, 0, 0), new Vec3(0, 0, 1),
      7.4, 5.4, cell, scoreableFloor, tile
    ),
    new PaintSurface(
      'ramp-east', new Vec3(5.1, 1.22, -3.25), new Vec3(1, 0, 0), new Vec3(0, Math.sin(rampAngle), Math.cos(rampAngle)),
      5.2, 7.1, cell, scoreableRamp, tile
    ),
    new PaintSurface(
      'wall-west', new Vec3(-6.2, 2.55, -4.7), new Vec3(1, 0, 0), new Vec3(0, 1, 0),
      8.4, 5.0, cell, wall, tile
    )
  ];

  for (const surface of surfaces) gameplayInk.registerSurface(surface);
  return surfaces;
}

export function buildTestStage(app: AppBase, surfaces: readonly PaintSurface[], atlas: GpuInkAtlas): StageBuildResult {
  const root = new Entity('StageRoot');
  app.root.addChild(root);

  // Paintable geometry is generated from the exact same surface basis used by gameplay ink.
  for (const surface of surfaces) {
    const material = createInkSurfaceMaterial(surface, atlas.texture);
    const mesh = createSurfaceMesh(app, surface);
    const meshInstance = new MeshInstance(mesh, material);
    const entity = new Entity(`PaintSurface:${surface.id}`);
    entity.addComponent('render', { meshInstances: [meshInstance], castShadows: false, receiveShadows: false });
    root.addChild(entity);
  }

  const dark = makeMaterial(new Color(0.08, 0.11, 0.14), 0.25, 0.78);
  const medium = makeMaterial(new Color(0.16, 0.20, 0.23), 0.2, 0.64);
  const light = makeMaterial(new Color(0.30, 0.35, 0.38), 0.15, 0.55);
  const accent = makeMaterial(new Color(0.44, 0.72, 0.77), 0.35, 0.68);

  createBox(root, 'MainBase', new Vec3(0, -0.19, 0), new Vec3(18.5, 0.4, 14.5), dark);
  createBox(root, 'UpperSupport', new Vec3(5.1, 1.30, 1.4), new Vec3(7.8, 2.25, 5.8), medium);
  createBox(root, 'LeftPillar', new Vec3(-6.8, 1.25, 3.3), new Vec3(1.6, 2.5, 1.6), medium);
  createBox(root, 'CenterBlock', new Vec3(-1.2, 0.75, -0.7), new Vec3(2.3, 1.5, 2.0), light);
  createBox(root, 'Bridge', new Vec3(-1.0, 2.25, 4.7), new Vec3(7.2, 0.32, 1.25), accent);
  createBox(root, 'WallBacker', new Vec3(-6.2, 2.55, -4.82), new Vec3(8.8, 5.1, 0.18), dark);

  // Non-scoreable decorative boundary rails make the test stage read as a deliberate arena.
  createBox(root, 'RailNorth', new Vec3(0, 0.42, 7.18), new Vec3(18.6, 0.84, 0.25), medium);
  createBox(root, 'RailSouth', new Vec3(0, 0.42, -7.18), new Vec3(18.6, 0.84, 0.25), medium);
  createBox(root, 'RailEast', new Vec3(9.18, 0.42, 0), new Vec3(0.25, 0.84, 14.6), medium);
  createBox(root, 'RailWest', new Vec3(-9.18, 0.42, 0), new Vec3(0.25, 0.84, 14.6), medium);

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

function makeMaterial(color: Color, metalness: number, gloss: number): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = color;
  material.useMetalness = true;
  material.metalness = metalness;
  material.gloss = gloss;
  material.update();
  return material;
}

function createBox(parent: Entity, name: string, position: Vec3, scale: Vec3, material: StandardMaterial): Entity {
  const entity = new Entity(name);
  entity.addComponent('render', { type: 'box', material, castShadows: true, receiveShadows: true });
  entity.setPosition(position);
  entity.setLocalScale(scale);
  parent.addChild(entity);
  return entity;
}
