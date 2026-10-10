import { beforeAll, describe, expect, it } from 'vitest';
import { PerformanceStats } from '../../core/PerformanceStats';
import {
  RecastStageNavigation,
  initializeRecastNavigation
} from '../../navigation/RecastStageNavigation';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import {
  UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS,
  UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_AUDIT,
  UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_SOLIDS,
  UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D,
  UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS,
  undertowUpperGlassReconstructionCandidateErrors,
  undertowUpperGlassReconstructionQaStage
} from './UndertowSpillwayUpperGlassReconstructionCandidate';

beforeAll(async () => {
  await initializeRecastNavigation();
});

describe('T21 Pass 15A upper-glass role-separated reconstruction candidate', () => {
  it('keeps production frozen and exposes only a QA candidate', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_AUDIT.status)
      .toBe('QA_CANDIDATE_ONLY');
    expect(
      UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_AUDIT
        .activationBlockersCleared
    ).toEqual([]);
    expect(
      UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_AUDIT
        .collisionQueryRuntimePromotionAuthorized
    ).toBe(false);
    expect(
      UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_AUDIT
        .navigationRuntimePromotionAuthorized
    ).toBe(false);
  });

  it('uses all source triangles for the collision/query candidate but only the three proven broad top components for navigation', () => {
    expect(UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS).toHaveLength(46);
    expect(UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS).toEqual([98, 99]);
    expect(UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_SOLIDS).toHaveLength(4);

    const collision = UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_SOLIDS.filter(
      (solid) => solid.id.includes('collision-query-candidate')
    );
    const navigation = UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_SOLIDS.filter(
      (solid) => solid.id.includes('broad-navigation-candidate')
    );

    expect(collision).toHaveLength(2);
    expect(navigation).toHaveLength(2);
    expect(collision.every((solid) => solid.triangleMesh?.indices.length === 306))
      .toBe(true);
    expect(navigation.every((solid) => solid.triangleMesh?.indices.length === 138))
      .toBe(true);
    expect(navigation.every((solid) => solid.collisionEnabled === false)).toBe(true);
    expect(navigation.every((solid) => solid.navigationEnabled === true)).toBe(true);
  });

  it('recovers the exact 3D heights of the previously captured support route', () => {
    const positive = UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.positiveZ;
    const negative = UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.negativeZ;
    expect(positive.map((point) => point[1])).toEqual([
      6,
      expect.closeTo(6.735403, 5),
      7.5
    ]);
    expect(negative.map((point) => point[1])).toEqual([
      6,
      expect.closeTo(6.735403, 5),
      7.5
    ]);
  });

  it('builds a QA-only Recast mesh over the three broad support components on both sides', () => {
    const stage = undertowUpperGlassReconstructionQaStage();
    expect(stage.metadata.id).toBe('undertow-t21d-upper-glass-reconstruction-qa');

    const stats = new PerformanceStats();
    const navigation = new RecastStageNavigation(stage, stats);
    expect(stats.cpuNavigationStatus).toBe('READY');

    for (const route of [
      UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.positiveZ,
      UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.negativeZ
    ]) {
      for (let i = 0; i + 1 < route.length; i += 1) {
        const from = route[i]!;
        const to = route[i + 1]!;
        const result = navigation.auditPath(
          { x: from[0], y: from[1], z: from[2] } as any,
          { x: to[0], y: to[1], z: to[2] } as any
        );
        expect(result.startSnapDistanceMeters).toBeLessThan(0.35);
        expect(result.endSnapDistanceMeters).toBeLessThan(0.35);
        expect(result.querySuccess).toBe(true);
        expect(result.reachedTarget).toBe(true);
      }
    }
  });

  it('passes the Pass 15A authority-boundary audit', () => {
    expect(undertowUpperGlassReconstructionCandidateErrors()).toEqual([]);
  });
});
