import { beforeAll, describe, expect, it } from 'vitest';
import { Vec3 } from 'playcanvas';
import {
  RapierStagePhysics,
  initializeRapier
} from '../../physics/RapierStagePhysics';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES,
  UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_QUERY_AUDIT,
  undertowUpperGlassPass15bPhysicsQaStage,
  undertowUpperGlassPass15bPhysicsQueryAuditErrors
} from './UndertowSpillwayUpperGlassPhysicsQueryQa';

beforeAll(async () => {
  await initializeRapier();
});

function vec3([x, y, z]: readonly [number, number, number]): Vec3 {
  return new Vec3(x, y, z);
}

describe('T21 Pass 15B upper-glass Rapier/query QA', () => {
  it('keeps T20 production frozen and all upper-glass authority blockers active', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).toContain('UPPER_GLASS_COLLISION_AUTHORITY_PENDING');
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).toContain('UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING');
    expect(
      UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_QUERY_AUDIT.activationBlockersCleared
    ).toEqual([]);
    expect(
      UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_QUERY_AUDIT.runtimePromotionAuthorized
    ).toBe(false);
  });

  it('hits the candidate from above, below and the broad side on both mirrored structures for every blocking query role', () => {
    const physics = new RapierStagePhysics(
      1 / 60,
      undertowUpperGlassPass15bPhysicsQaStage()
    );
    physics.step();

    expect(UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES).toHaveLength(6);
    for (const probe of UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES) {
      for (const purpose of ['ink-projectile', 'thrown-sub', 'camera'] as const) {
        const hit = physics.castStageSegment(
          vec3(probe.from),
          vec3(probe.to),
          purpose
        );
        expect(hit, `${probe.id} / ${purpose}`).not.toBeNull();
        expect(hit?.solidId).toBe(probe.expectedSolidId);
        expect(Number.isFinite(hit?.distance ?? Number.NaN)).toBe(true);
        expect((hit?.distance ?? -1)).toBeGreaterThan(0);
      }
    }
  });

  it('maps every broad probe hit to a solid character collider for both player forms', () => {
    const physics = new RapierStagePhysics(
      1 / 60,
      undertowUpperGlassPass15bPhysicsQaStage()
    );
    physics.step();

    for (const probe of UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES) {
      const hit = physics.castStageSegment(
        vec3(probe.from),
        vec3(probe.to),
        'camera'
      );
      expect(hit, probe.id).not.toBeNull();
      expect(physics.shouldCharacterCollide(hit!.collider, 'HUMAN')).toBe(true);
      expect(physics.shouldCharacterCollide(hit!.collider, 'SQUID')).toBe(true);
    }
  });

  it('states the remaining evidence boundary precisely instead of treating QA compatibility as original primitive identity', () => {
    const a = UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_QUERY_AUDIT;
    expect(a).toMatchObject({
      resolutionPass: '15B',
      geometryProbeCount: 6,
      expectedQueryHitCount: 18,
      expectedCharacterFilterAllowCount: 12,
      validatesTopBlocking: true,
      validatesUndersideBlocking: true,
      validatesBroadSideBlocking: true,
      validatesOrdinaryInkProjectileBlocking: true,
      validatesThrownSubBodyBlocking: true,
      validatesCameraBlocking: true,
      validatesDynamicCharacterControllerResolution: false,
      validatesThinEdgeStripCollisionOneForOne: false,
      validatesFrameBoundaryOneForOne: false,
      exactOriginalCollisionPrimitiveIdentityResolved: false,
      exactOriginalCameraPrimitiveIdentityResolved: false,
      runtimePromotionAuthorized: false,
      userActionRequiredNow: false
    });
  });

  it('passes the Pass 15B authority-boundary audit', () => {
    expect(undertowUpperGlassPass15bPhysicsQueryAuditErrors()).toEqual([]);
  });
});
