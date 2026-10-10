import RAPIER, { type Collider, type RigidBody } from '@dimforge/rapier3d-compat';
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
  type StageVector3
} from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_MODEL_XZ_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import { UNDERTOW_VECTOR_TRACES } from '../src/stage/undertow/UndertowSpillwayVectorBlueprint';

type Side = 'POSITIVE_Z' | 'NEGATIVE_Z';
type MetricXZ = readonly [number, number];

interface ProbePoints {
  side: Side;
  sharedEdge: readonly [MetricXZ, MetricXZ];
  sharedMidpoint: MetricXZ;
  topSurface: StageVector3;
  lowerSurface: StageVector3;
  lowerInsetFromSharedEdgeMeters: number;
}

interface TraverseResult {
  reachedTargetSurface: boolean;
  settledInitially: boolean;
  finalGrounded: boolean;
  jumpRequested: boolean;
  groundedTicks: number;
  airborneTicks: number;
  ticks: number;
  finalHorizontalErrorMeters: number;
  finalFootY: number;
  targetFootY: number;
  finalVerticalErrorMeters: number;
  minimumFootY: number;
  maximumFootY: number;
  maximumRiseAboveStartMeters: number;
  maximumDropBelowStartMeters: number;
  startSurface: StageVector3;
  targetSurface: StageVector3;
}

const DT = 1 / 60;
const TOP_Y_METERS = 1.5;
const LOWER_Y_METERS = 0;
const TOP_INSET_METERS = 0.60;
const LOWER_SEARCH_START_METERS = 0.80;
const LOWER_SEARCH_END_METERS = 2.00;
const LOWER_SEARCH_STEP_METERS = 0.05;

function key2([x, z]: MetricXZ): string {
  return `${x.toFixed(9)},${z.toFixed(9)}`;
}

function centroid2(points: readonly MetricXZ[]): MetricXZ {
  return [
    points.reduce((sum, point) => sum + point[0], 0) / points.length,
    points.reduce((sum, point) => sum + point[1], 0) / points.length
  ];
}

function midpoint2(a: MetricXZ, b: MetricXZ): MetricXZ {
  return [(a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5];
}

function normalize2(x: number, z: number): MetricXZ {
  const length = Math.hypot(x, z);
  if (length <= 1e-12) throw new Error('Pass 18W zero-length direction');
  return [x / length, z / length];
}

function addScaled2(point: MetricXZ, direction: MetricXZ, meters: number): MetricXZ {
  return [point[0] + direction[0] * meters, point[1] + direction[1] * meters];
}

function pointOnSegment2(
  point: MetricXZ,
  a: MetricXZ,
  b: MetricXZ,
  epsilon = 1e-9
): boolean {
  const cross =
    (point[0] - a[0]) * (b[1] - a[1]) -
    (point[1] - a[1]) * (b[0] - a[0]);
  if (Math.abs(cross) > epsilon) return false;
  const dot =
    (point[0] - a[0]) * (b[0] - a[0]) +
    (point[1] - a[1]) * (b[1] - a[1]);
  if (dot < -epsilon) return false;
  const length2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
  return dot <= length2 + epsilon;
}

function pointInRing(point: MetricXZ, ring: readonly MetricXZ[]): boolean {
  for (let i = 0; i < ring.length; i += 1) {
    if (pointOnSegment2(point, ring[i]!, ring[(i + 1) % ring.length]!)) {
      return true;
    }
  }
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const a = ring[i]!;
    const b = ring[j]!;
    const intersects =
      (a[1] > point[1]) !== (b[1] > point[1]) &&
      point[0] <
        ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0];
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInCenterLow(point: MetricXZ): boolean {
  return UNDERTOW_MODEL_XZ_GEOMETRY
    .filter((item) => item.id.startsWith('center-low-'))
    .some(
      (item) =>
        pointInRing(point, item.projectOuter) &&
        !(item.projectHoles ?? []).some((hole) => pointInRing(point, hole))
    );
}

function stepPoints(side: Side): ProbePoints {
  const top = UNDERTOW_VECTOR_TRACES.centerOriginFace.metricPoints;
  const strip =
    side === 'POSITIVE_Z'
      ? UNDERTOW_VECTOR_TRACES.positiveZCenterStepStrip.metricPoints
      : UNDERTOW_VECTOR_TRACES.negativeZCenterStepStrip.metricPoints;

  const topKeys = new Set(top.map(key2));
  const shared = strip.filter((point) => topKeys.has(key2(point)));
  if (shared.length !== 2) {
    throw new Error(`Pass 18W ${side} shared edge count=${shared.length}`);
  }

  const sharedEdge = [shared[0]!, shared[1]!] as const;
  const sharedMidpoint = midpoint2(sharedEdge[0], sharedEdge[1]);
  const topCentroid = centroid2(top);
  const stripCentroid = centroid2(strip);
  const topDirection = normalize2(
    topCentroid[0] - sharedMidpoint[0],
    topCentroid[1] - sharedMidpoint[1]
  );
  const lowerDirection = normalize2(
    stripCentroid[0] - sharedMidpoint[0],
    stripCentroid[1] - sharedMidpoint[1]
  );

  const topXZ = addScaled2(sharedMidpoint, topDirection, TOP_INSET_METERS);
  let lowerXZ: MetricXZ | null = null;
  let lowerInsetFromSharedEdgeMeters = Number.NaN;
  for (
    let meters = LOWER_SEARCH_START_METERS;
    meters <= LOWER_SEARCH_END_METERS + 1e-9;
    meters += LOWER_SEARCH_STEP_METERS
  ) {
    const candidate = addScaled2(sharedMidpoint, lowerDirection, meters);
    if (!pointInCenterLow(candidate)) continue;
    lowerXZ = candidate;
    lowerInsetFromSharedEdgeMeters = meters;
    break;
  }
  if (!lowerXZ) {
    throw new Error(`Pass 18W ${side} could not locate adjacent center-low point`);
  }

  return {
    side,
    sharedEdge,
    sharedMidpoint,
    topSurface: [topXZ[0], TOP_Y_METERS, topXZ[1]],
    lowerSurface: [lowerXZ[0], LOWER_Y_METERS, lowerXZ[1]],
    lowerInsetFromSharedEdgeMeters
  };
}

function qaStage(id: string): StageDefinition {
  const base = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  return {
    metadata: {
      id,
      displayName: id,
      worldBounds: base.worldBounds,
      teamASpawn: base.teamASpawnFloorPoint,
      teamBSpawn: base.teamBSpawnFloorPoint,
      teamASpawnSlots: [base.teamASpawnFloorPoint],
      teamBSpawnSlots: [base.teamBSpawnFloorPoint],
      tacticalNodes: [],
      splatZones: []
    },
    solids: base.solids,
    paintSurfaces: base.paintSurfaces,
    navigationLinks: []
  };
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

function moveToward(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(target, current + maxDelta);
  if (current > target) return Math.max(target, current - maxDelta);
  return current;
}

function traverseStep(
  id: string,
  startSurface: StageVector3,
  targetSurface: StageVector3,
  jumpRequested: boolean
): TraverseResult {
  const physics = new RapierStagePhysics(DT, qaStage(id));
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
  let horizontalSpeed = 0;
  let jumpPending = jumpRequested;
  let groundedTicks = 0;
  let airborneTicks = 0;
  let minimumFootY = Number.POSITIVE_INFINITY;
  let maximumFootY = Number.NEGATIVE_INFINITY;
  let finalGrounded = grounded;
  let ticks = 0;

  for (; ticks < 240; ticks += 1) {
    const position = body.translation();
    const footY = position.y - PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    const dx = targetSurface[0] - position.x;
    const dz = targetSurface[2] - position.z;
    const horizontalError = Math.hypot(dx, dz);
    const verticalError = Math.abs(targetSurface[1] - footY);
    if (grounded && horizontalError <= 0.16 && verticalError <= 0.12) {
      break;
    }

    const dirX = horizontalError > 1e-9 ? dx / horizontalError : 0;
    const dirZ = horizontalError > 1e-9 ? dz / horizontalError : 0;
    horizontalSpeed = moveToward(
      horizontalSpeed,
      GAME_CONFIG.player.humanSpeedMetersPerSecond,
      GAME_CONFIG.player.groundAccelerationMetersPerSecond2 * DT
    );
    const horizontalStep = Math.min(horizontalSpeed * DT, horizontalError);

    if (jumpPending && grounded) {
      verticalVelocity = GAME_CONFIG.player.jumpSpeedMetersPerSecond;
      grounded = false;
      jumpPending = false;
    }
    verticalVelocity = Math.max(
      -GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
      verticalVelocity - GAME_CONFIG.player.gravityMetersPerSecond2 * DT
    );

    grounded = applyKccTick(
      physics,
      body,
      collider,
      character,
      new Vec3(
        dirX * horizontalStep,
        verticalVelocity * DT,
        dirZ * horizontalStep
      )
    );
    finalGrounded = grounded;
    if (grounded) {
      groundedTicks += 1;
      if (verticalVelocity < 0) verticalVelocity = -0.5;
    } else {
      airborneTicks += 1;
    }

    const after = body.translation();
    const afterFootY = after.y - PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    minimumFootY = Math.min(minimumFootY, afterFootY);
    maximumFootY = Math.max(maximumFootY, afterFootY);
  }

  const final = body.translation();
  const finalFootY = final.y - PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const finalHorizontalErrorMeters = Math.hypot(
    targetSurface[0] - final.x,
    targetSurface[2] - final.z
  );
  const finalVerticalErrorMeters = Math.abs(targetSurface[1] - finalFootY);
  return {
    reachedTargetSurface:
      settledInitially &&
      finalGrounded &&
      finalHorizontalErrorMeters <= 0.20 &&
      finalVerticalErrorMeters <= 0.12,
    settledInitially,
    finalGrounded,
    jumpRequested,
    groundedTicks,
    airborneTicks,
    ticks,
    finalHorizontalErrorMeters,
    finalFootY,
    targetFootY: targetSurface[1],
    finalVerticalErrorMeters,
    minimumFootY,
    maximumFootY,
    maximumRiseAboveStartMeters:
      Number.isFinite(maximumFootY) ? maximumFootY - startSurface[1] : Number.NaN,
    maximumDropBelowStartMeters:
      Number.isFinite(minimumFootY) ? startSurface[1] - minimumFootY : Number.NaN,
    startSurface,
    targetSurface
  };
}

beforeAll(async () => {
  await initializeRapier();
});

describe('T21 Pass 18W center +1.5m step production-KCC diagnostic', () => {
  it('separates walk, normal jump, and natural drop feasibility without authoring navigation', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters).toBe(0.34);
    expect(GAME_CONFIG.player.jumpSpeedMetersPerSecond).toBe(8.2);
    expect(GAME_CONFIG.player.gravityMetersPerSecond2).toBe(28);

    const theoreticalBallisticMaxRiseMeters =
      GAME_CONFIG.player.jumpSpeedMetersPerSecond ** 2 /
      (2 * GAME_CONFIG.player.gravityMetersPerSecond2);

    const probes: Record<string, TraverseResult> = {};
    const geometry: Record<string, ProbePoints> = {};
    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const points = stepPoints(side);
      geometry[side] = points;
      probes[`${side}:lower-to-upper:walk`] = traverseStep(
        `pass18w-${side.toLowerCase()}-lower-upper-walk`,
        points.lowerSurface,
        points.topSurface,
        false
      );
      probes[`${side}:lower-to-upper:jump`] = traverseStep(
        `pass18w-${side.toLowerCase()}-lower-upper-jump`,
        points.lowerSurface,
        points.topSurface,
        true
      );
      probes[`${side}:upper-to-lower:drop`] = traverseStep(
        `pass18w-${side.toLowerCase()}-upper-lower-drop`,
        points.topSurface,
        points.lowerSurface,
        false
      );
    }

    console.log(
      'T21PASS18W_CENTER_STEP_KCC',
      JSON.stringify({
        diagnosticOnly: true,
        runtimePromotionAuthorized: false,
        canonicalStepDeltaMeters: TOP_Y_METERS - LOWER_Y_METERS,
        topInsetMeters: TOP_INSET_METERS,
        lowerSearch: {
          startMeters: LOWER_SEARCH_START_METERS,
          endMeters: LOWER_SEARCH_END_METERS,
          stepMeters: LOWER_SEARCH_STEP_METERS
        },
        humanRadiusMeters: PLAYER_CHARACTER_PHYSICS.humanRadiusMeters,
        controllerOffsetMeters: PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters,
        autostepMaxHeightMeters: PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters,
        jumpSpeedMetersPerSecond: GAME_CONFIG.player.jumpSpeedMetersPerSecond,
        gravityMetersPerSecond2: GAME_CONFIG.player.gravityMetersPerSecond2,
        theoreticalBallisticMaxRiseMeters,
        geometry,
        probes
      })
    );

    expect(Object.keys(probes)).toHaveLength(6);
    expect(Object.values(probes).every((probe) => probe.settledInitially)).toBe(true);

    const positiveWalk = probes['POSITIVE_Z:lower-to-upper:walk']!;
    const negativeWalk = probes['NEGATIVE_Z:lower-to-upper:walk']!;
    const positiveJump = probes['POSITIVE_Z:lower-to-upper:jump']!;
    const negativeJump = probes['NEGATIVE_Z:lower-to-upper:jump']!;
    const positiveDrop = probes['POSITIVE_Z:upper-to-lower:drop']!;
    const negativeDrop = probes['NEGATIVE_Z:upper-to-lower:drop']!;

    expect(positiveWalk.reachedTargetSurface).toBe(false);
    expect(negativeWalk.reachedTargetSurface).toBe(false);
    expect(positiveJump.reachedTargetSurface).toBe(true);
    expect(negativeJump.reachedTargetSurface).toBe(true);
    expect(positiveDrop.reachedTargetSurface).toBe(true);
    expect(negativeDrop.reachedTargetSurface).toBe(true);

    expect(positiveWalk.airborneTicks).toBe(0);
    expect(positiveJump.airborneTicks).toBe(14);
    expect(negativeJump.airborneTicks).toBe(15);
    expect(positiveDrop.airborneTicks).toBe(16);
    expect(negativeDrop.airborneTicks).toBe(16);
    expect(positiveJump.maximumRiseAboveStartMeters).toBeCloseTo(
      1.5292533683776854,
      9
    );
    expect(negativeJump.maximumRiseAboveStartMeters).toBeCloseTo(
      1.5295673656463622,
      9
    );
    expect(positiveDrop.maximumDropBelowStartMeters).toBeCloseTo(
      1.4395598721504212,
      9
    );
    expect(negativeDrop.maximumDropBelowStartMeters).toBeCloseTo(
      1.4753304076194764,
      9
    );

    expect(Number.isFinite(theoreticalBallisticMaxRiseMeters)).toBe(true);
    expect(theoreticalBallisticMaxRiseMeters).toBeCloseTo(
      1.2007142857142856,
      12
    );
    expect(theoreticalBallisticMaxRiseMeters).toBeLessThan(TOP_Y_METERS);
    expect(geometry.POSITIVE_Z.lowerInsetFromSharedEdgeMeters).toBeGreaterThanOrEqual(
      LOWER_SEARCH_START_METERS
    );
    expect(geometry.NEGATIVE_Z.lowerInsetFromSharedEdgeMeters).toBeGreaterThanOrEqual(
      LOWER_SEARCH_START_METERS
    );
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  }, 30000);
});
