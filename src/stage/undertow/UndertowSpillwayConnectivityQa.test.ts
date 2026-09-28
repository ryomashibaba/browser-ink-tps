import { beforeAll, describe, expect, it } from 'vitest';
import { PerformanceStats } from '../../core/PerformanceStats';
import {
  RecastStageNavigation,
  initializeRecastNavigation
} from '../../navigation/RecastStageNavigation';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT,
  UNDERTOW_T21D_CONNECTIVITY_PROBES,
  undertowFullStageConnectivityAuditErrors,
  undertowT21dConnectivityQaStage,
  vec3
} from './UndertowSpillwayConnectivityQa';

beforeAll(async () => {
  await initializeRecastNavigation();
});

describe('T21-D partial Recast connectivity QA', () => {
  it('builds a QA-only navmesh without activating Undertow production runtime', () => {
    const stage = undertowT21dConnectivityQaStage();
    expect(stage.metadata.id).toBe('undertow-t21d-partial-connectivity-qa');
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');

    const stats = new PerformanceStats();
    const navigation = new RecastStageNavigation(stage, stats);
    expect(stats.cpuNavigationStatus).toBe('READY');

    for (const probe of UNDERTOW_T21D_CONNECTIVITY_PROBES) {
      const result = navigation.auditPath(vec3(probe.from), vec3(probe.to));
      console.log(
        'T21NAVQA',
        JSON.stringify({
          id: probe.id,
          expectation: probe.expectation,
          ...result
        })
      );
      expect(Number.isFinite(result.startSnapDistanceMeters)).toBe(true);
      expect(Number.isFinite(result.endSnapDistanceMeters)).toBe(true);

      if (probe.expectation === 'MUST_REACH') {
        expect(result.querySuccess).toBe(true);
        expect(result.reachedTarget).toBe(true);
        expect(result.endpointErrorMeters).toBeLessThan(0.001);
      } else {
        expect([
          'right-low-to-underpass-positive-z',
          'right-low-to-underpass-negative-z'
        ]).toContain(probe.id);
        expect(result.reachedTarget).toBe(false);
        expect(result.endpointErrorMeters).toBeGreaterThan(1);
      }
    }
  });

  it('localizes why the partial Recast pass is not full-stage connectivity QA', () => {
    expect(undertowFullStageConnectivityAuditErrors()).toEqual([]);
    expect(UNDERTOW_T21D_CONNECTIVITY_PROBES).toHaveLength(8);
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT).toMatchObject({
      qaStageScope: 'PARTIAL_GEOMETRY_ONLY',
      probeCount: 8,
      mustReachProbeCount: 6,
      diagnosticGapProbeCount: 2,
      bothSidesDirectlyProbed: true,
      rightLowToUnderpassResolved: false,
      upperGlassBroadNavigationReconstructionBound: true,
      upperGlassThinEdgeFrameNavigationAuthorityResolved: false,
      upperGlassNavigationAuthorityResolved: false,
      allTraversableRuntimeGeometryBound: false,
      fullStageConnectivityReady: false
    });
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.sourceNativeRouteGapAudit)
      .toMatchObject({
        sourceWalkableNodeCountPerSide: 276,
        rightLowContactNodeCountPerSide: 17,
        underpassContactNodeCountPerSide: 8,
        directConnectivityThresholdsMeters: [0.03, 0.08, 0.18, 0.30],
        reachableAtOrBelowMaxDirectThreshold: false,
        localGapCountTotal: 8,
        localGapCountPerSide: 4,
        strictBridgeThresholdMeters: 0.30,
        strictBridgesWhenAllExcludedSourceIsAllowed: 6,
        strictBridgesAfterFloorLineAndFenceOverlayRemoval: 0,
        ordinaryWalkSurfaceRecovered: false,
        runtimePromotionAuthorized: false,
        offMeshLinkAuthorized: false
      });
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).toContain('FULL_STAGE_CONNECTIVITY_QA_PENDING');
  });
  it('Pass 18A diagnostics every current paint-surface anchor against every other anchor', () => {
    const stage = undertowT21dConnectivityQaStage();
    const navigation = new RecastStageNavigation(stage, new PerformanceStats());
    const anchors = stage.paintSurfaces.map((surface) => ({
      id: surface.backingSolidId,
      point: surface.center
    }));

    expect(anchors).toHaveLength(17);
    expect(new Set(anchors.map((anchor) => anchor.id)).size).toBe(17);

    const rows = anchors.map((from) => {
      const reached: string[] = [];
      const missed: string[] = [];
      for (const to of anchors) {
        const result = navigation.auditPath(vec3(from.point), vec3(to.point));
        if (result.reachedTarget) reached.push(to.id);
        else missed.push(to.id);
      }
      return {
        from: from.id,
        reached,
        missed
      };
    });

    console.log('T21NAVMATRIX18A', JSON.stringify(rows));
    expect(rows).toHaveLength(17);
    expect(rows.every((row) => row.reached.includes(row.from))).toBe(true);
  });

});
