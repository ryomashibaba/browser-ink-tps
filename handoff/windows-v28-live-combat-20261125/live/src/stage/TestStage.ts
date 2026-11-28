import {
  AppBase,
  calculateNormals,
  Color,
  Entity,
  Mesh,
  MeshInstance,
  StandardMaterial,
  Vec3
} from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { createInkSurfaceMaterial, configureF4InkVisual } from '../ink/InkSurfaceMaterial';
import {
  F4_PAINT_NORMAL_ALIGNMENT,
  F4_PAINT_PLANE_TOLERANCE,
  PaintSurface
} from '../ink/PaintSurface';
import type { GpuInkAtlas } from '../ink/GpuInkAtlas';
import {
  PRODUCTION_STAGE_DEFINITION,
  TEST_STAGE_DEFINITION,
  type StageDefinition,
  type StageMaterialKey,
  type StageSolidDefinition,
  type StageVector3
} from './StageDefinition';
import { rasterizeStageFootprint } from './StageFootprint';
import { stageSolidTriangleMeshErrors } from './StageTriangleMesh';

export { PRODUCTION_STAGE_DEFINITION, TEST_STAGE_DEFINITION } from './StageDefinition';

export interface StageBuildResult {
  surfaces: PaintSurface[];
}

export function defineTestSurfaces(
  gameplayInk: GameplayInkSystem,
  definition: StageDefinition = PRODUCTION_STAGE_DEFINITION
): PaintSurface[] {
  const cell = GAME_CONFIG.ink.cellSizeMeters;
  const tile = GAME_CONFIG.ink.dirtyTileCells;
  const surfaces = definition.paintSurfaces.map((surface) => {
    const backing = definition.solids.find(
      (candidate) => candidate.id === surface.backingSolidId
    );
    return new PaintSurface(
      surface.id,
      vec3(surface.center),
      vec3(surface.uAxis),
      vec3(surface.vAxis),
      surface.widthMeters,
      surface.heightMeters,
      cell,
      surface.flags,
      tile,
      surface.footprint ?? backing?.footprint
    );
  });

  for (const surface of surfaces) gameplayInk.registerSurface(surface);
  return surfaces;
}

export function buildTestStage(
  app: AppBase,
  definition: StageDefinition,
  surfaces: readonly PaintSurface[],
  atlas: GpuInkAtlas,
  sourceWetInkStyle = false
): StageBuildResult {
  const root = new Entity('StageRoot');
  app.root.addChild(root);

  // Paintable geometry remains generated from the exact frozen PaintSurface basis.
  for (const surface of surfaces) {
    const material = createInkSurfaceMaterial(surface, atlas.texture, sourceWetInkStyle);
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
    createSolidBox(app, root, solid, materials[solid.material]);
  }

  return { surfaces: [...surfaces] };
}

/** Bind the existing raster to the actual F4 triangles, in the same world
 * coordinates sent to Rapier and Recast. The ink shader clips the candidates
 * to the registered plane envelope and samples only the existing atlas. */
export function installF4InkGeometry(
  app: AppBase, root: Entity, surfaces: readonly PaintSurface[], worldTriangles: Float32Array,
  visualPolish = false, visualLightDirection?: Vec3
): () => void {
  const a = new Vec3();
  const b = new Vec3();
  const c = new Vec3();
  const ab = new Vec3();
  const ac = new Vec3();
  const normal = new Vec3();
  const projection = Array.from({ length: 3 }, () => ({
    u: 0, v: 0, signedPlaneDistance: 0, planeDistance: 0, inside: false
  }));
  const overlaps = (x: number, y: number, z: number, min: number, max: number) =>
    Math.max(x, y, z) >= min && Math.min(x, y, z) <= max;
  const solids = root.children.filter(child => !child.name.startsWith('PaintSurface:'))
    .map(child => ({ child, wasEnabled: child.enabled }));
  const entries: {
    entity: Entity; instance: MeshInstance; previous: Mesh; ink: Mesh | null
  }[] = [];
  const restore = () => {
    for (const { child, wasEnabled } of solids) child.enabled = wasEnabled;
    for (const { entity, instance, previous, ink } of entries) {
      instance.mesh = previous;
      instance.material.setParameter('uInkOnly', 0);
      instance.material.setParameter('uF4VisualPolish', 0);
      instance.material.depthBias = 0;
      instance.material.slopeDepthBias = 0;
      entity.enabled = true;
      ink?.destroy();
    }
  };
  try {
    for (const surface of surfaces) {
      const entity = root.findByName('PaintSurface:' + surface.id);
      const instance = entity instanceof Entity ? entity.render?.meshInstances[0] : undefined;
      if (!(entity instanceof Entity) || !instance?.mesh)
        throw Error('F4_REGISTERED_INK_MESH_MISSING_' + surface.id);
      const positions: number[] = [];
      const uvs: number[] = [];
      for (let i = 0; i < worldTriangles.length; i += 9) {
        a.set(worldTriangles[i]!, worldTriangles[i + 1]!, worldTriangles[i + 2]!);
        b.set(worldTriangles[i + 3]!, worldTriangles[i + 4]!, worldTriangles[i + 5]!);
        c.set(worldTriangles[i + 6]!, worldTriangles[i + 7]!, worldTriangles[i + 8]!);
        normal.cross(ab.sub2(b, a), ac.sub2(c, a)).normalize();
        if (Math.abs(normal.dot(surface.normal)) < F4_PAINT_NORMAL_ALIGNMENT) continue;
        const p = surface.projectWorldPoint(a, projection[0]);
        const q = surface.projectWorldPoint(b, projection[1]);
        const r = surface.projectWorldPoint(c, projection[2]);
        if (!overlaps(p.u, q.u, r.u, 0, surface.widthMeters) ||
            !overlaps(p.v, q.v, r.v, 0, surface.heightMeters) ||
            !overlaps(p.signedPlaneDistance, q.signedPlaneDistance, r.signedPlaneDistance,
              -F4_PAINT_PLANE_TOLERANCE, F4_PAINT_PLANE_TOLERANCE)) continue;
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
        for (const { u, v } of projection) uvs.push(u / surface.widthMeters, v / surface.heightMeters);
      }
      const ink = positions.length ? new Mesh(app.graphicsDevice) : null;
      entries.push({ entity, instance, previous: instance.mesh, ink });
      if (!ink) {
        entity.enabled = false;
        continue;
      }
      ink.setPositions(positions);
      ink.setUvs(0, uvs);
      ink.update();
      instance.mesh = ink;
      instance.material.setParameter('uInkOnly', 1);
      configureF4InkVisual(instance.material,visualPolish,visualLightDirection);
      instance.material.depthBias = -4;
      instance.material.slopeDepthBias = -1;
    }
    for (const { child } of solids) child.enabled = false;
  } catch (error) {
    restore();
    throw error;
  }
  return restore;
}

function createSurfaceMesh(app: AppBase, surface: PaintSurface): Mesh {
  const footprintRects = surface.activeFootprintRectangles;
  if (!footprintRects) {
    const hu = surface.widthMeters * 0.5;
    const hv = surface.heightMeters * 0.5;
    const p0 = point(surface.center, surface.uAxis, -hu, surface.vAxis, -hv);
    const p1 = point(surface.center, surface.uAxis, hu, surface.vAxis, -hv);
    const p2 = point(surface.center, surface.uAxis, hu, surface.vAxis, hv);
    const p3 = point(surface.center, surface.uAxis, -hu, surface.vAxis, hv);

    const mesh = new Mesh(app.graphicsDevice);
    mesh.setPositions(new Float32Array([
      p0.x, p0.y, p0.z,
      p1.x, p1.y, p1.z,
      p2.x, p2.y, p2.z,
      p3.x, p3.y, p3.z
    ]));
    mesh.setUvs(0, new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]));
    mesh.setIndices(new Uint16Array([0, 1, 2, 0, 2, 3]));
    mesh.update();
    return mesh;
  }

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (const rect of footprintRects) {
    const corners = [
      [rect.minU, rect.minV],
      [rect.maxU, rect.minV],
      [rect.maxU, rect.maxV],
      [rect.minU, rect.maxV]
    ] as const;
    const base = positions.length / 3;
    for (const [u, v] of corners) {
      const world = surface.localToWorld(u, v);
      positions.push(world.x, world.y, world.z);
      uvs.push(u / surface.widthMeters, v / surface.heightMeters);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  const mesh = new Mesh(app.graphicsDevice);
  mesh.setPositions(new Float32Array(positions));
  mesh.setUvs(0, new Float32Array(uvs));
  mesh.setIndices(new Uint32Array(indices));
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
  app: AppBase,
  parent: Entity,
  solid: StageSolidDefinition,
  material: StandardMaterial
): Entity {
  const entity = new Entity(solid.id);
  entity.setPosition(vec3(solid.center));
  if (solid.rotationEulerDegrees) {
    const rotation = solid.rotationEulerDegrees;
    entity.setEulerAngles(rotation[0], rotation[1], rotation[2]);
  }

  const meshErrors = stageSolidTriangleMeshErrors(solid);
  if (meshErrors.length > 0) {
    throw new Error(meshErrors.join('; '));
  }

  if (solid.triangleMesh) {
    const positions = solid.triangleMesh.vertices.flatMap(
      (vertex) => [...vertex]
    );
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
    return entity;
  }

  if (!solid.footprint) {
    entity.addComponent('render', { type: 'box', material, castShadows: true, receiveShadows: true });
    entity.setLocalScale(vec3(solid.size));
    parent.addChild(entity);
    return entity;
  }

  const raster = rasterizeStageFootprint(
    solid.size[0],
    solid.size[2],
    solid.footprint
  );
  raster.rectangles.forEach((rect, index) => {
    const piece = new Entity(`${solid.id}:footprint:${index}`);
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
  return entity;
}
