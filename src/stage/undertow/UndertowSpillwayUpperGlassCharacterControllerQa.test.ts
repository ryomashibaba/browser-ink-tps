import RAPIER, { type Collider } from '@dimforge/rapier3d-compat';
import { beforeAll, describe, expect, it } from 'vitest';
import { Vec3 } from 'playcanvas';
import {
  PLAYER_CHARACTER_PHYSICS,
  createConfiguredPlayerCharacterController
} from '../../player/PlayerCharacterPhysics';
import {
  RapierStagePhysics,
  initializeRapier,
  type StageCharacterMode
} from '../../physics/RapierStagePhysics';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES,
  type UndertowUpperGlassPhysicsProbe
} from './UndertowSpillwayUpperGlassPhysicsQueryQa';
import {
  UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_SOLIDS,
  UNDERTOW_UPPER_GLASS_PASS15C_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS,
  UNDERTOW_UPPER_GLASS_PASS15C_RECONSTRUCTION_AUTHORITY_AUDIT,
  undertowUpperGlassPass15cAuthorityAuditErrors,
  undertowUpperGlassPass15cQaStage,
  undertowUpperGlassPass15cSolidId
} from './UndertowSpillwayUpperGlassCharacterControllerQa';
import {
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES,
  type UndertowUpperGlassMeshRecord
} from './UndertowSpillwayUpperGlassMeshGeometry';

beforeAll(async () => {
  await initializeRapier();
});

function vec3([x, y, z]: readonly [number, number, number]): Vec3 {
  return new Vec3(x, y, z);
}

function midpoint(
  a: readonly [number, number, number],
  b: readonly [number, number, number]
): Vec3 {
  return new Vec3(
    (a[0] + b[0]) * 0.5,
    (a[1] + b[1]) * 0.5,
    (a[2] + b[2]) * 0.5
  );
}

function triangleNormalYAndArea(
  record: UndertowUpperGlassMeshRecord,
  triangleId: number
): { normalY: number; areaSquareMeters: number } {
  const base = triangleId * 3;
  const ai = record.mesh.indices[base];
  const bi = record.mesh.indices[base + 1];
  const ci = record.mesh.indices[base + 2];
  if (ai === undefined || bi === undefined || ci === undefined) {
    throw new Error(`triangle ${triangleId} is outside ${record.id}`);
  }
  const a = record.mesh.vertices[ai]!;
  const b = record.mesh.vertices[bi]!;
  const c = record.mesh.vertices[ci]!;
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const uz = b[2] - a[2];
  const vx = c[0] - a[0];
  const vy = c[1] - a[1];
  const vz = c[2] - a[2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const twiceArea = Math.hypot(nx, ny, nz);
  return {
    normalY: ny / twiceArea,
    areaSquareMeters: twiceArea * 0.5
  };
}

function makeQaCharacter(
  physics: RapierStagePhysics,
  mode: StageCharacterMode,
  bodyPosition: Vec3
): {
  collider: Collider;
  character: ReturnType<typeof createConfiguredPlayerCharacterController>;
} {
  const body = physics.world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      bodyPosition.x,
      bodyPosition.y,
      bodyPosition.z
    )
  );
  const colliderDesc = mode === 'HUMAN'
    ? RAPIER.ColliderDesc.capsule(
        PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
        PLAYER_CHARACTER_PHYSICS.humanRadiusMeters
      )
    : RAPIER.ColliderDesc.ball(
        PLAYER_CHARACTER_PHYSICS.squidRadiusMeters
      ).setTranslation(
        0,
        PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters,
        0
      );
  const collider = physics.world.createCollider(colliderDesc, body);
  return {
    collider,
    character: createConfiguredPlayerCharacterController(physics.world)
  };
}

function computeMovement(
  physics: RapierStagePhysics,
  mode: StageCharacterMode,
  collider: Collider,
  character: ReturnType<typeof createConfiguredPlayerCharacterController>,
  desired: Vec3
): Vec3 {
  character.computeColliderMovement(
    collider,
    desired,
    undefined,
    undefined,
    (candidate: Collider) => physics.shouldCharacterCollide(candidate, mode)
  );
  const movement = character.computedMovement();
  return new Vec3(movement.x, movement.y, movement.z);
}

function expectTopSupport(
  probe: UndertowUpperGlassPhysicsProbe,
  mode: StageCharacterMode
): void {
  const physics = new RapierStagePhysics(
    1 / 60,
    undertowUpperGlassPass15cQaStage()
  );
  physics.step();

  const surface = midpoint(probe.from, probe.to);
  const gap = 0.35;
  const start = new Vec3(
    surface.x,
    surface.y + PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters + gap,
    surface.z
  );
  const { collider, character } = makeQaCharacter(physics, mode, start);
  const desired = new Vec3(0, -1, 0);
  const corrected = computeMovement(
    physics,
    mode,
    collider,
    character,
    desired
  );
  const finalFootY =
    start.y + corrected.y - PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;

  expect(corrected.y, `${probe.id} / ${mode}`).toBeLessThan(-0.05);
  expect(corrected.y, `${probe.id} / ${mode}`).toBeGreaterThan(-0.95);
  expect(finalFootY, `${probe.id} / ${mode}`).toBeGreaterThanOrEqual(
    surface.y - 0.04
  );
  expect(finalFootY, `${probe.id} / ${mode}`).toBeLessThanOrEqual(
    surface.y + 0.08
  );
  expect(character.computedGrounded(), `${probe.id} / ${mode}`).toBe(true);
}

function expectUndersideBlocking(
  probe: UndertowUpperGlassPhysicsProbe,
  mode: StageCharacterMode
): void {
  const physics = new RapierStagePhysics(
    1 / 60,
    undertowUpperGlassPass15cQaStage()
  );
  physics.step();

  const surface = midpoint(probe.from, probe.to);
  const topOffset = mode === 'HUMAN'
    ? PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters
    : PLAYER_CHARACTER_PHYSICS.squidTopOffsetFromBodyMeters;
  const gap = 0.35;
  // The Rapier KCC keeps a configured skin offset around contact geometry.
  // Use twice that production offset as a vertical contact-envelope tolerance
  // for a sphere meeting the sloped connector; this is still far below the
  // player radius and does not weaken the blocking assertion.
  const verticalContactTolerance =
    PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters * 2;
  const start = new Vec3(
    surface.x,
    surface.y - topOffset - gap,
    surface.z
  );
  const { collider, character } = makeQaCharacter(physics, mode, start);
  const desired = new Vec3(0, 1, 0);
  const corrected = computeMovement(
    physics,
    mode,
    collider,
    character,
    desired
  );
  const finalTopY = start.y + corrected.y + topOffset;

  expect(corrected.y, `${probe.id} / ${mode}`).toBeGreaterThan(0.05);
  expect(corrected.y, `${probe.id} / ${mode}`).toBeLessThan(0.95);
  expect(finalTopY, `${probe.id} / ${mode}`).toBeLessThanOrEqual(
    surface.y + verticalContactTolerance
  );
  expect(finalTopY, `${probe.id} / ${mode}`).toBeGreaterThanOrEqual(
    surface.y - 0.08
  );
}

function expectLateralBlocking(
  probe: UndertowUpperGlassPhysicsProbe,
  mode: StageCharacterMode
): void {
  const physics = new RapierStagePhysics(
    1 / 60,
    undertowUpperGlassPass15cQaStage()
  );
  physics.step();

  const center = midpoint(probe.from, probe.to);
  const normal = vec3(probe.from).sub(vec3(probe.to)).normalize();
  const radius = mode === 'HUMAN'
    ? PLAYER_CHARACTER_PHYSICS.humanRadiusMeters
    : PLAYER_CHARACTER_PHYSICS.squidRadiusMeters;
  const colliderCenterYOffset = mode === 'HUMAN'
    ? 0
    : PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters;
  const startColliderCenter = center.clone().add(
    normal.clone().mulScalar(radius + 0.35)
  );
  const start = new Vec3(
    startColliderCenter.x,
    startColliderCenter.y - colliderCenterYOffset,
    startColliderCenter.z
  );
  const { collider, character } = makeQaCharacter(physics, mode, start);
  const desired = normal.clone().mulScalar(-1.4);
  const corrected = computeMovement(
    physics,
    mode,
    collider,
    character,
    desired
  );
  const finalColliderCenter = startColliderCenter.clone().add(corrected);
  const signedDistance = finalColliderCenter.clone().sub(center).dot(normal);
  const advanceTowardFace = -corrected.dot(normal);

  expect(advanceTowardFace, `${probe.id} / ${mode}`).toBeGreaterThan(0.05);
  expect(advanceTowardFace, `${probe.id} / ${mode}`).toBeLessThan(1.2);
  expect(signedDistance, `${probe.id} / ${mode}`).toBeGreaterThanOrEqual(
    radius - 0.04
  );
}

describe('T21 Pass 15C upper-glass dynamic character-controller QA', () => {
  it('keeps T20 production frozen and retains both upper-glass activation blockers', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).toContain('UPPER_GLASS_COLLISION_AUTHORITY_PENDING');
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).toContain('UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING');
    expect(
      UNDERTOW_UPPER_GLASS_PASS15C_RECONSTRUCTION_AUTHORITY_AUDIT
        .activationBlockersCleared
    ).toEqual([]);
    expect(
      UNDERTOW_UPPER_GLASS_PASS15C_RECONSTRUCTION_AUTHORITY_AUDIT
        .productionStageActivationAuthorized
    ).toBe(false);
  });

  it('excludes the thin-edge/frame source neighborhood from the broad reconstruction candidate', () => {
    expect(
      UNDERTOW_UPPER_GLASS_PASS15C_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS
    ).toEqual([94, 95, 96, 97, 98, 99, 100, 101]);
    expect(UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_SOLIDS).toHaveLength(2);
    for (const solid of UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_SOLIDS) {
      expect(solid.triangleMesh?.indices).toHaveLength(94 * 3);
      expect(solid.collisionEnabled).toBe(true);
      expect(solid.navigationEnabled).toBe(false);
      expect(solid.projectileBlocker).toBe(true);
      expect(solid.cameraBlocker).toBe(true);
      expect(solid.render).toBe(false);
    }
  });

  it('re-audits the thin-edge/frame neighborhood from exact source geometry rather than material naming', () => {
    for (const record of UNDERTOW_UPPER_GLASS_SOURCE_MESHES) {
      for (const triangleId of [94, 95] as const) {
        const metric = triangleNormalYAndArea(record, triangleId);
        expect(metric.normalY, `${record.id} / ${triangleId}`).toBeLessThan(-0.68);
        expect(metric.areaSquareMeters, `${record.id} / ${triangleId}`).toBeGreaterThan(0.60);
      }
      for (const triangleId of [98, 99] as const) {
        const metric = triangleNormalYAndArea(record, triangleId);
        expect(metric.normalY, `${record.id} / ${triangleId}`).toBeGreaterThan(0.68);
        expect(metric.areaSquareMeters, `${record.id} / ${triangleId}`).toBeGreaterThan(0.60);
      }
      for (const triangleId of [96, 97, 100, 101] as const) {
        const metric = triangleNormalYAndArea(record, triangleId);
        expect(Math.abs(metric.normalY), `${record.id} / ${triangleId}`).toBeLessThan(1e-8);
        expect(metric.areaSquareMeters, `${record.id} / ${triangleId}`).toBeLessThan(0.04);
      }
      for (const triangleId of [92, 93] as const) {
        const metric = triangleNormalYAndArea(record, triangleId);
        expect(Math.abs(metric.normalY), `${record.id} / ${triangleId}`).toBeLessThan(1e-8);
        expect(metric.areaSquareMeters, `${record.id} / ${triangleId}`).toBeGreaterThan(1.3);
      }
    }
  });

  it('retains broad projectile/thrown-sub/camera query behavior without the excluded edge neighborhood', () => {
    const physics = new RapierStagePhysics(
      1 / 60,
      undertowUpperGlassPass15cQaStage()
    );
    physics.step();

    for (const probe of UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES) {
      for (const purpose of ['ink-projectile', 'thrown-sub', 'camera'] as const) {
        const hit = physics.castStageSegment(
          vec3(probe.from),
          vec3(probe.to),
          purpose
        );
        expect(hit, `${probe.id} / ${purpose}`).not.toBeNull();
        expect(hit?.solidId).toBe(undertowUpperGlassPass15cSolidId(probe.side));
      }
    }
  });

  it('uses the live PlayerController KCC profile to resolve top support, underside blocking and lateral blocking for both player forms', () => {
    let dynamicProbeCount = 0;
    for (const probe of UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES) {
      for (const mode of ['HUMAN', 'SQUID'] as const) {
        if (probe.kind === 'TOP_TO_UNDERSIDE') {
          expectTopSupport(probe, mode);
        } else if (probe.kind === 'UNDERSIDE_TO_TOP') {
          expectUndersideBlocking(probe, mode);
        } else {
          expectLateralBlocking(probe, mode);
        }
        dynamicProbeCount += 1;
      }
    }
    expect(dynamicProbeCount).toBe(12);
  });

  it('freezes only broad reconstruction authority and does not claim original primitive identity', () => {
    expect(
      UNDERTOW_UPPER_GLASS_PASS15C_RECONSTRUCTION_AUTHORITY_AUDIT
    ).toMatchObject({
      resolutionPass: '15C',
      sourceShellTrianglesPerSide: 102,
      broadCollisionQueryTrianglesPerSide: 94,
      excludedThinEdgeFrameNeighborhoodTrianglesPerSide: 8,
      expectedDynamicCharacterProbeCount: 12,
      usesSharedProductionCharacterControllerConfiguration: true,
      validatesBroadTopSupportWithDynamicController: true,
      validatesBroadUndersideBlockingWithDynamicController: true,
      validatesBroadLateralBlockingWithDynamicController: true,
      broadPlayerCollisionReconstructionAuthorityFrozen: true,
      broadProjectileQueryReconstructionAuthorityFrozen: true,
      broadCameraQueryReconstructionAuthorityFrozen: true,
      exactOriginalCollisionPrimitiveIdentityResolved: false,
      exactOriginalCameraPrimitiveIdentityResolved: false,
      thinEdgeStripOneForOneAuthorityResolved: false,
      frameBoundaryOneForOneAuthorityResolved: false,
      wholeGlass01ShellRuntimePromotionAuthorized: false,
      thinEdgeFrameRuntimePromotionAuthorized: false,
      productionStageActivationAuthorized: false,
      userActionRequiredNow: false
    });
  });

  it('passes the Pass 15C reconstruction-authority boundary audit', () => {
    expect(undertowUpperGlassPass15cAuthorityAuditErrors()).toEqual([]);
  });
});
