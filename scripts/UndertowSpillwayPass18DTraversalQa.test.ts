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

interface FixtureMesh {
  vertices: StageVector3[];
  indices: number[];
}

interface GrateFixture {
  mesh: FixtureMesh;
  nearestWalkMesh: FixtureMesh | null;
}

interface GlassFixture {
  broadMesh: FixtureMesh;
  bridgeMesh: FixtureMesh;
  nearestNonBridgeMesh: FixtureMesh | null;
}

interface Pass18dFixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  grates: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GrateFixture>;
  glass: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GlassFixture>;
}

interface ClosestVertexPair {
  aIndex: number;
  bIndex: number;
  a: StageVector3;
  b: StageVector3;
  distanceMeters: number;
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
  startSurface: StageVector3;
  targetSurface: StageVector3;
  closestVertexDistanceMeters: number;
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';
const DT = 1 / 60;

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

function collisionSolid(
  id: string,
  mesh: StageTriangleMeshGeometry,
  collisionBehavior: StageSolidDefinition['collisionBehavior'] = 'SOLID'
): StageSolidDefinition {
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
    collisionBehavior,
    triangleMesh: mesh
  };
}

function qaStage(
  id: string,
  solids: readonly StageSolidDefinition[]
): StageDefinition {
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

function closestVertexPair(
  aMesh: StageTriangleMeshGeometry,
  bMesh: StageTriangleMeshGeometry
): ClosestVertexPair {
  let best: ClosestVertexPair | null = null;
  for (let ai = 0; ai < aMesh.vertices.length; ai += 1) {
    const a = aMesh.vertices[ai]!;
    for (let bi = 0; bi < bMesh.vertices.length; bi += 1) {
      const b = bMesh.vertices[bi]!;
      const distanceMeters = Math.hypot(
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
      );
      if (!best || distanceMeters < best.distanceMeters) {
        best = { aIndex: ai, bIndex: bi, a, b, distanceMeters };
      }
    }
  }
  if (!best) throw new Error('Pass 18D closest-vertex pair requires non-empty meshes');
  return best;
}

function triangleCentroidForVertex(
  mesh: StageTriangleMeshGeometry,
  vertexIndex: number
): StageVector3 {
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const tri = [
      mesh.indices[i]!,
      mesh.indices[i + 1]!,
      mesh.indices[i + 2]!
    ];
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
  throw new Error(`Pass 18D vertex ${vertexIndex} is not referenced by a triangle`);
}

function insetSurfacePoint(
  mesh: StageTriangleMeshGeometry,
  vertexIndex: number,
  insetMeters = 0.06
): StageVector3 {
  const vertex = mesh.vertices[vertexIndex]!;
  const centroid = triangleCentroidForVertex(mesh, vertexIndex);
  const dx = centroid[0] - vertex[0];
  const dz = centroid[2] - vertex[2];
  const horizontal = Math.hypot(dx, dz);
  if (horizontal <= 1e-8) return vertex;
  const t = Math.min(0.45, insetMeters / horizontal);
  return [
    vertex[0] + dx * t,
    vertex[1] + (centroid[1] - vertex[1]) * t,
    vertex[2] + dz * t
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

function traverseHuman(
  id: string,
  aMesh: StageTriangleMeshGeometry,
  bMesh: StageTriangleMeshGeometry,
  aBehavior: StageSolidDefinition['collisionBehavior'],
  bBehavior: StageSolidDefinition['collisionBehavior'],
  reverse = false
): TraverseResult {
  const pair = closestVertexPair(aMesh, bMesh);
  const sourceMesh = reverse ? bMesh : aMesh;
  const targetMesh = reverse ? aMesh : bMesh;
  const sourceIndex = reverse ? pair.bIndex : pair.aIndex;
  const targetIndex = reverse ? pair.aIndex : pair.bIndex;
  const sourceBehavior = reverse ? bBehavior : aBehavior;
  const targetBehavior = reverse ? aBehavior : bBehavior;
  const startSurface = insetSurfacePoint(sourceMesh, sourceIndex);
  const targetSurface = insetSurfacePoint(targetMesh, targetIndex);

  const physics = new RapierStagePhysics(
    DT,
    qaStage(id, [
      collisionSolid(`${id}:source`, sourceMesh, sourceBehavior),
      collisionSolid(`${id}:target`, targetMesh, targetBehavior)
    ])
  );
  physics.step();

  const { body, collider, character } = createHumanCharacter(
    physics,
    startSurface
  );

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

  for (; ticks < 180; ticks += 1) {
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
    const footY =
      after.y - PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    minimumFootY = Math.min(minimumFootY, footY);
    maximumFootY = Math.max(maximumFootY, footY);
  }

  const final = body.translation();
  const finalHorizontalErrorMeters = Math.hypot(
    targetSurface[0] - final.x,
    targetSurface[2] - final.z
  );
  return {
    success:
      settledInitially &&
      finalHorizontalErrorMeters <= 0.20 &&
      minimumFootY >= Math.min(startSurface[1], targetSurface[1]) - 0.60,
    settledInitially,
    groundedTicks,
    airborneTicks,
    ticks,
    finalHorizontalErrorMeters,
    minimumFootY,
    maximumFootY,
    startSurface,
    targetSurface,
    closestVertexDistanceMeters: pair.distanceMeters
  };
}

beforeAll(async () => {
  await initializeRapier();
});

describe('T21 Pass 18D production-KCC traversal diagnostic', () => {
  it('compares source-native grate/glass gaps against the live Human KCC profile without promoting runtime geometry', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PLAYER_CHARACTER_PHYSICS.humanRadiusMeters).toBe(0.32);
    expect(PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters).toBe(0.025);
    expect(PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters).toBe(0.34);
    expect(PLAYER_CHARACTER_PHYSICS.snapToGroundMeters).toBe(0.24);
    expect(GAME_CONFIG.cpu.navigationCellSizeMeters).toBe(0.18);
    expect(GAME_CONFIG.cpu.navigationWalkableRadiusVoxels).toBe(2);

    if (!fixturePath) return;

    const fixture = JSON.parse(
      readFileSync(fixturePath, 'utf8')
    ) as Pass18dFixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const results: Record<string, TraverseResult> = {};
    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const grate = fixture.grates[side];
      expect(grate.nearestWalkMesh).not.toBeNull();
      results[`grate-floor:${side}:grate-to-floor`] = traverseHuman(
        `pass18d-grate-floor-${side.toLowerCase()}-forward`,
        grate.mesh,
        grate.nearestWalkMesh!,
        'GRATE',
        'SOLID',
        false
      );
      results[`grate-floor:${side}:floor-to-grate`] = traverseHuman(
        `pass18d-grate-floor-${side.toLowerCase()}-reverse`,
        grate.mesh,
        grate.nearestWalkMesh!,
        'GRATE',
        'SOLID',
        true
      );

      const glass = fixture.glass[side];
      expect(glass.broadMesh).toBeDefined();
      expect(glass.nearestNonBridgeMesh).not.toBeNull();
      results[`glass-bridge:${side}:glass-to-bridge`] = traverseHuman(
        `pass18d-glass-bridge-${side.toLowerCase()}-forward`,
        glass.broadMesh,
        glass.bridgeMesh,
        'SOLID',
        'SOLID',
        false
      );
      results[`glass-bridge:${side}:bridge-to-glass`] = traverseHuman(
        `pass18d-glass-bridge-${side.toLowerCase()}-reverse`,
        glass.broadMesh,
        glass.bridgeMesh,
        'SOLID',
        'SOLID',
        true
      );
      results[`bridge-floor:${side}:bridge-to-floor`] = traverseHuman(
        `pass18d-bridge-floor-${side.toLowerCase()}-forward`,
        glass.bridgeMesh,
        glass.nearestNonBridgeMesh!,
        'SOLID',
        'SOLID',
        false
      );
      results[`bridge-floor:${side}:floor-to-bridge`] = traverseHuman(
        `pass18d-bridge-floor-${side.toLowerCase()}-reverse`,
        glass.bridgeMesh,
        glass.nearestNonBridgeMesh!,
        'SOLID',
        'SOLID',
        true
      );
    }

    console.log(
      'T21PASS18D_KCC',
      JSON.stringify({
        effectiveHumanContactRadiusMeters:
          PLAYER_CHARACTER_PHYSICS.humanRadiusMeters +
          PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters,
        recastNominalErosionRadiusMeters:
          GAME_CONFIG.cpu.navigationCellSizeMeters *
          GAME_CONFIG.cpu.navigationWalkableRadiusVoxels,
        results
      })
    );

    const directedResults = Object.values(results);
    expect(directedResults).toHaveLength(12);
    expect(directedResults.every((result) => result.success)).toBe(true);
    expect(
      directedResults.every((result) => result.settledInitially)
    ).toBe(true);
    expect(
      directedResults.reduce((sum, result) => sum + result.airborneTicks, 0)
    ).toBe(0);
    expect(
      directedResults.every((result) => result.groundedTicks > 0)
    ).toBe(true);
  });
});
