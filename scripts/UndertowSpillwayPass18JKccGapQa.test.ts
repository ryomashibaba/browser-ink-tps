import RAPIER, { type Collider, type RigidBody } from '@dimforge/rapier3d-compat';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { Vec3 } from 'playcanvas';
import { GAME_CONFIG } from '../src/config/game/gameConfig';
import {
  PLAYER_CHARACTER_PHYSICS,
  createConfiguredPlayerCharacterController
} from '../src/player/PlayerCharacterPhysics';
import {
  RapierStagePhysics,
  initializeRapier
} from '../src/physics/RapierStagePhysics';
import {
  PRODUCTION_STAGE_DEFINITION,
  type StageDefinition,
  type StageSolidDefinition,
  type StageTriangleMeshGeometry,
  type StageVector3
} from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';

interface ChainComponent {
  id: string;
  mesh: StageTriangleMeshGeometry;
}

interface GapVector {
  aComponentId: string;
  bComponentId: string;
  aPointProject: StageVector3;
  bPointProject: StageVector3;
  modelDistanceMeters: number;
  modelVerticalDeltaMeters: number;
}

interface Fixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  pass18g: {
    routes: {
      grate: Record<'POSITIVE_Z' | 'NEGATIVE_Z', { components: ChainComponent[] }>;
      glass: Record<'POSITIVE_Z' | 'NEGATIVE_Z', { components: ChainComponent[] }>;
    };
  };
  pass18i: {
    grate: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GapVector>;
    glass: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GapVector[]>;
  };
}

interface TraverseResult {
  success: boolean;
  settledInitially: boolean;
  groundedTicks: number;
  airborneTicks: number;
  ticks: number;
  finalHorizontalErrorMeters: number;
  minimumFootY: number;
  maximumFootY: number;
  maximumDropBelowSurfaceMeters: number;
  startSurface: StageVector3;
  targetSurface: StageVector3;
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';
const DT = 1 / 60;
const INSET_METERS = 0.40;

function meshBounds(mesh: StageTriangleMeshGeometry): StageVector3 {
  const xs = mesh.vertices.map((vertex) => vertex[0]);
  const ys = mesh.vertices.map((vertex) => vertex[1]);
  const zs = mesh.vertices.map((vertex) => vertex[2]);
  return [
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    Math.max(...zs) - Math.min(...zs)
  ];
}

function collisionSolid(id: string, mesh: StageTriangleMeshGeometry): StageSolidDefinition {
  return {
    id,
    center: [0, 0, 0],
    size: meshBounds(mesh),
    material: 'light',
    render: false,
    projectileBlocker: false,
    cameraBlocker: false,
    collisionEnabled: true,
    navigationEnabled: false,
    collisionBehavior: 'SOLID',
    triangleMesh: mesh
  };
}

function qaStage(id: string, solids: readonly StageSolidDefinition[]): StageDefinition {
  return {
    metadata: {
      id,
      displayName: id,
      worldBounds: UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.worldBounds,
      teamASpawn: [0, 0, 0],
      teamBSpawn: [0, 0, 0],
      teamASpawnSlots: [[0, 0, 0]],
      teamBSpawnSlots: [[0, 0, 0]],
      tacticalNodes: [],
      splatZones: []
    },
    solids,
    paintSurfaces: [],
    navigationLinks: []
  };
}

function nearestVertexIndex(mesh: StageTriangleMeshGeometry, point: StageVector3): number {
  let bestIndex = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < mesh.vertices.length; i += 1) {
    const v = mesh.vertices[i]!;
    const d = Math.hypot(v[0] - point[0], v[1] - point[1], v[2] - point[2]);
    if (d < best) {
      best = d;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function triangleCentroidForVertex(
  mesh: StageTriangleMeshGeometry,
  vertexIndex: number
): StageVector3 {
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const tri = [mesh.indices[i]!, mesh.indices[i + 1]!, mesh.indices[i + 2]!];
    if (!tri.includes(vertexIndex)) continue;
    const a = mesh.vertices[tri[0]]!;
    const b = mesh.vertices[tri[1]]!;
    const c = mesh.vertices[tri[2]]!;
    return [
      (a[0] + b[0] + c[0]) / 3,
      (a[1] + b[1] + c[1]) / 3,
      (a[2] + b[2] + c[2]) / 3
    ];
  }
  throw new Error(`Pass 18J vertex ${vertexIndex} has no triangle`);
}

function insetBoundaryPoint(
  mesh: StageTriangleMeshGeometry,
  boundary: StageVector3
): StageVector3 {
  const vertexIndex = nearestVertexIndex(mesh, boundary);
  const centroid = triangleCentroidForVertex(mesh, vertexIndex);
  const dx = centroid[0] - boundary[0];
  const dz = centroid[2] - boundary[2];
  const horizontal = Math.hypot(dx, dz);
  if (horizontal <= 1e-8) return boundary;
  const scale = Math.min(1, INSET_METERS / horizontal);
  return [
    boundary[0] + dx * scale,
    boundary[1] + (centroid[1] - boundary[1]) * scale,
    boundary[2] + dz * scale
  ];
}

function createHumanCharacter(
  physics: RapierStagePhysics,
  surface: StageVector3
): {
  body: RigidBody;
  collider: Collider;
  character: ReturnType<typeof createConfiguredPlayerCharacterController>;
} {
  const body = physics.world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      surface[0],
      surface[1] + PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters + 0.06,
      surface[2]
    )
  );
  const collider = physics.world.createCollider(
    RAPIER.ColliderDesc.capsule(
      PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
      PLAYER_CHARACTER_PHYSICS.humanRadiusMeters
    ),
    body
  );
  return {
    body,
    collider,
    character: createConfiguredPlayerCharacterController(physics.world)
  };
}

function applyKccTick(
  physics: RapierStagePhysics,
  body: RigidBody,
  collider: Collider,
  character: ReturnType<typeof createConfiguredPlayerCharacterController>,
  desired: Vec3
): boolean {
  const before = body.translation();
  character.computeColliderMovement(
    collider,
    desired,
    undefined,
    undefined,
    (candidate: Collider) => physics.shouldCharacterCollide(candidate, 'HUMAN')
  );
  const corrected = character.computedMovement();
  body.setNextKinematicTranslation({
    x: before.x + corrected.x,
    y: before.y + corrected.y,
    z: before.z + corrected.z
  });
  const grounded = character.computedGrounded();
  physics.step();
  return grounded;
}

function traverseGap(
  id: string,
  sourceMesh: StageTriangleMeshGeometry,
  targetMesh: StageTriangleMeshGeometry,
  sourceBoundary: StageVector3,
  targetBoundary: StageVector3
): TraverseResult {
  const startSurface = insetBoundaryPoint(sourceMesh, sourceBoundary);
  const targetSurface = insetBoundaryPoint(targetMesh, targetBoundary);
  const physics = new RapierStagePhysics(
    DT,
    qaStage(id, [
      collisionSolid(`${id}:source`, sourceMesh),
      collisionSolid(`${id}:target`, targetMesh)
    ])
  );
  physics.step();
  const { body, collider, character } = createHumanCharacter(physics, startSurface);

  let grounded = false;
  for (let tick = 0; tick < 30; tick += 1) {
    grounded = applyKccTick(
      physics,
      body,
      collider,
      character,
      new Vec3(0, -0.12, 0)
    );
    if (grounded) break;
  }

  const settledInitially = grounded;
  let verticalVelocity = grounded ? -0.5 : 0;
  let groundedTicks = 0;
  let airborneTicks = 0;
  let minimumFootY = Number.POSITIVE_INFINITY;
  let maximumFootY = Number.NEGATIVE_INFINITY;
  let ticks = 0;

  for (; ticks < 240; ticks += 1) {
    const p = body.translation();
    const dx = targetSurface[0] - p.x;
    const dz = targetSurface[2] - p.z;
    const horizontalError = Math.hypot(dx, dz);
    if (horizontalError <= 0.16) break;

    const step = Math.min(
      GAME_CONFIG.player.humanSpeedMetersPerSecond * DT,
      horizontalError
    );
    const dirX = horizontalError > 1e-9 ? dx / horizontalError : 0;
    const dirZ = horizontalError > 1e-9 ? dz / horizontalError : 0;
    verticalVelocity = Math.max(
      -GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
      verticalVelocity - GAME_CONFIG.player.gravityMetersPerSecond2 * DT
    );
    grounded = applyKccTick(
      physics,
      body,
      collider,
      character,
      new Vec3(dirX * step, verticalVelocity * DT, dirZ * step)
    );
    if (grounded) {
      groundedTicks += 1;
      if (verticalVelocity < 0) verticalVelocity = -0.5;
    } else {
      airborneTicks += 1;
    }
    const after = body.translation();
    const footY = after.y - PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    minimumFootY = Math.min(minimumFootY, footY);
    maximumFootY = Math.max(maximumFootY, footY);
  }

  const final = body.translation();
  const finalHorizontalErrorMeters = Math.hypot(
    targetSurface[0] - final.x,
    targetSurface[2] - final.z
  );
  const baselineY = Math.min(startSurface[1], targetSurface[1]);
  const maximumDropBelowSurfaceMeters = Number.isFinite(minimumFootY)
    ? Math.max(0, baselineY - minimumFootY)
    : Number.POSITIVE_INFINITY;
  return {
    success:
      settledInitially &&
      finalHorizontalErrorMeters <= 0.20 &&
      maximumDropBelowSurfaceMeters <= 0.60,
    settledInitially,
    groundedTicks,
    airborneTicks,
    ticks,
    finalHorizontalErrorMeters,
    minimumFootY,
    maximumFootY,
    maximumDropBelowSurfaceMeters,
    startSurface,
    targetSurface
  };
}

function componentById(
  components: ChainComponent[],
  id: string
): ChainComponent {
  const found = components.find((component) => component.id === id);
  if (!found) throw new Error(`Pass 18J missing source component ${id}`);
  return found;
}

beforeAll(async () => {
  await initializeRapier();
});

describe('T21 Pass 18J production-KCC exact horizontal-gap diagnostic', () => {
  it('measures no-jump Human KCC feasibility across the exact Pass 18I gap pairs without promotion', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PLAYER_CHARACTER_PHYSICS.humanRadiusMeters).toBe(0.32);
    expect(PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters).toBe(0.025);
    expect(PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters).toBe(0.34);
    expect(PLAYER_CHARACTER_PHYSICS.snapToGroundMeters).toBe(0.24);

    if (!fixturePath) return;
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const results: Record<string, TraverseResult> = {};
    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const grateGap = fixture.pass18i.grate[side];
      expect(grateGap.modelDistanceMeters).toBeCloseTo(0.5, 12);
      expect(grateGap.modelVerticalDeltaMeters).toBeCloseTo(0, 12);
      const grateComponents = fixture.pass18g.routes.grate[side].components;
      const grateA = componentById(grateComponents, grateGap.aComponentId);
      const grateB = componentById(grateComponents, grateGap.bComponentId);
      results[`grate:${side}:a-to-b`] = traverseGap(
        `pass18j-grate-${side.toLowerCase()}-a-b`,
        grateA.mesh,
        grateB.mesh,
        grateGap.aPointProject,
        grateGap.bPointProject
      );
      results[`grate:${side}:b-to-a`] = traverseGap(
        `pass18j-grate-${side.toLowerCase()}-b-a`,
        grateB.mesh,
        grateA.mesh,
        grateGap.bPointProject,
        grateGap.aPointProject
      );

      const glassComponents = fixture.pass18g.routes.glass[side].components;
      fixture.pass18i.glass[side].forEach((gap, index) => {
        expect(gap.modelDistanceMeters).toBeCloseTo(2.0, 12);
        expect(gap.modelVerticalDeltaMeters).toBeCloseTo(0, 12);
        const a = componentById(glassComponents, gap.aComponentId);
        const b = componentById(glassComponents, gap.bComponentId);
        results[`glass:${side}:${index}:a-to-b`] = traverseGap(
          `pass18j-glass-${side.toLowerCase()}-${index}-a-b`,
          a.mesh,
          b.mesh,
          gap.aPointProject,
          gap.bPointProject
        );
        results[`glass:${side}:${index}:b-to-a`] = traverseGap(
          `pass18j-glass-${side.toLowerCase()}-${index}-b-a`,
          b.mesh,
          a.mesh,
          gap.bPointProject,
          gap.aPointProject
        );
      });
    }

    console.log(
      'T21PASS18J_KCC_EXACT_GAPS',
      JSON.stringify({
        diagnosticOnly: true,
        runtimePromotionAuthorized: false,
        insetMeters: INSET_METERS,
        humanRadiusMeters: PLAYER_CHARACTER_PHYSICS.humanRadiusMeters,
        controllerOffsetMeters: PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters,
        effectiveHumanContactRadiusMeters:
          PLAYER_CHARACTER_PHYSICS.humanRadiusMeters +
          PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters,
        autostepMaxHeightMeters: PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters,
        snapToGroundMeters: PLAYER_CHARACTER_PHYSICS.snapToGroundMeters,
        results
      })
    );

    const entries = Object.entries(results);
    expect(entries).toHaveLength(12);
    expect(entries.every(([, result]) => result.settledInitially)).toBe(true);
    expect(
      entries.every(([, result]) => Number.isFinite(result.finalHorizontalErrorMeters))
    ).toBe(true);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  }, 20000);
});
