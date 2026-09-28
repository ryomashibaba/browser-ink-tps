import { beforeAll, describe, expect, it } from 'vitest';
import { PerformanceStats } from '../../core/PerformanceStats';
import {
  RecastStageNavigation,
  initializeRecastNavigation
} from '../../navigation/RecastStageNavigation';
import {
  PRODUCTION_STAGE_DEFINITION,
  type StageDefinition,
  type StageSolidDefinition
} from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS,
  UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D,
  UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS
} from './UndertowSpillwayUpperGlassReconstructionCandidate';
import {
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES
} from './UndertowSpillwayUpperGlassMeshGeometry';
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
      resolutionPass: '18A',
      rightLowToUnderpassResolved: false,
      centerSmallStepNavigationResolved: false,
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
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.paintAnchorMatrixPass18A)
      .toMatchObject({
        anchorCount: 17,
        directedPairCount: 289,
        reachedDirectedPairCountIncludingSelf: 59,
        missedDirectedPairCount: 230,
        reachedNonSelfDirectedPairCount: 42,
        weakComponentCount: 5,
        stronglyConnectedComponentCount: 7,
        centerOriginStepTopIsSingleton: true,
        previousTwoGapInventoryWasComplete: false,
        qaRunNumber: 870
      });
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.centerSmallStepGapAudit)
      .toMatchObject({
        transitionEntryIds: [
          'negative-z-center-small-step',
          'positive-z-center-small-step'
        ],
        transitionCount: 2,
        canonicalTransitionKind: 'STEP',
        canonicalDeltaYMeters: 1.5,
        exactTransitionStripsMeasured: true,
        transitionStripsDepthMeters: 0.75,
        stepTopRuntimeSurfaceBound: true,
        runtimeNavigationTransitionBound: false,
        traversalDirectionResolved: false,
        jumpRequirementResolved: false,
        automaticRecastClimbMeters: 0.4,
        automaticRecastCanBridgeCanonicalDelta: false,
        offMeshLinkAuthorized: false,
        runtimePromotionAuthorized: false,
        userCaptureRequiredNow: false
      });
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.knownBlockingTransitions)
      .toEqual([
        'right-low-to-underpass-positive-z',
        'right-low-to-underpass-negative-z',
        'center-small-step-positive-z',
        'center-small-step-negative-z'
      ]);
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
      return { from: from.id, reached, missed };
    });

    console.log('T21NAVMATRIX18A', JSON.stringify(rows));

    const reachedCount = rows.reduce(
      (sum, row) => sum + row.reached.length,
      0
    );
    expect(reachedCount).toBe(59);
    expect(17 * 17 - reachedCount).toBe(230);
    expect(reachedCount - 17).toBe(42);
    expect(rows.every((row) => row.reached.includes(row.from))).toBe(true);

    const reach = new Map(
      rows.map((row) => [row.from, new Set(row.reached)] as const)
    );
    const ids = anchors.map((anchor) => anchor.id);

    const seenWeak = new Set<string>();
    let weakComponents = 0;
    for (const seed of ids) {
      if (seenWeak.has(seed)) continue;
      weakComponents += 1;
      const stack = [seed];
      seenWeak.add(seed);
      while (stack.length > 0) {
        const current = stack.pop()!;
        for (const candidate of ids) {
          if (seenWeak.has(candidate)) continue;
          if (
            reach.get(current)!.has(candidate) ||
            reach.get(candidate)!.has(current)
          ) {
            seenWeak.add(candidate);
            stack.push(candidate);
          }
        }
      }
    }
    expect(weakComponents).toBe(5);

    const seenStrong = new Set<string>();
    let strongComponents = 0;
    for (const seed of ids) {
      if (seenStrong.has(seed)) continue;
      strongComponents += 1;
      for (const candidate of ids) {
        if (
          reach.get(seed)!.has(candidate) &&
          reach.get(candidate)!.has(seed)
        ) {
          seenStrong.add(candidate);
        }
      }
    }
    expect(strongComponents).toBe(7);

    const centerStep = rows.find(
      (row) => row.from === 'UndertowT21D:center-origin-step-top-face:0'
    );
    expect(centerStep?.reached).toEqual([
      'UndertowT21D:center-origin-step-top-face:0'
    ]);
    expect(centerStep?.missed).toHaveLength(16);
  });


  it('Pass 18B diagnostics paintable plus grate plus verified broad-glass traversable anchors', () => {
    const stage = undertowT21dConnectivityQaStage();
    const navigation = new RecastStageNavigation(stage, new PerformanceStats());

    const paintAnchors = stage.paintSurfaces.map((surface) => ({
      id: `paint:${surface.backingSolidId}`,
      point: surface.center
    }));

    const grateAnchors = stage.solids
      .filter((solid) => solid.id.includes('grate-mesh:'))
      .map((solid) => ({
        id: `grate:${solid.id}`,
        point: [
          solid.center[0],
          solid.center[1] + solid.size[1] * 0.5,
          solid.center[2]
        ] as const
      }));

    const glassAnchors = [
      ...UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.positiveZ
        .map((point, index) => ({
          id: `glass:positive-z:${index}`,
          point
        })),
      ...UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.negativeZ
        .map((point, index) => ({
          id: `glass:negative-z:${index}`,
          point
        }))
    ];

    const anchors = [...paintAnchors, ...grateAnchors, ...glassAnchors];
    expect(paintAnchors).toHaveLength(17);
    expect(grateAnchors).toHaveLength(2);
    expect(glassAnchors).toHaveLength(6);
    expect(anchors).toHaveLength(25);
    expect(new Set(anchors.map((anchor) => anchor.id)).size).toBe(25);

    const rows = anchors.map((from) => {
      const reached: string[] = [];
      const missed: string[] = [];
      let maxStartSnap = 0;
      let maxEndSnap = 0;
      for (const to of anchors) {
        const result = navigation.auditPath(vec3(from.point), vec3(to.point));
        maxStartSnap = Math.max(maxStartSnap, result.startSnapDistanceMeters);
        maxEndSnap = Math.max(maxEndSnap, result.endSnapDistanceMeters);
        if (result.reachedTarget) reached.push(to.id);
        else missed.push(to.id);
      }
      return {
        from: from.id,
        reached,
        missed,
        maxStartSnap,
        maxEndSnap
      };
    });

    console.log('T21NAVMATRIX18B', JSON.stringify(rows));
    expect(rows.every((row) => row.reached.includes(row.from))).toBe(true);
    expect(rows).toHaveLength(25);
  });


  it('Pass 18B proves the unverified thin-edge strip does not bridge current CPU Recast connectivity', () => {
    const baseline = undertowT21dConnectivityQaStage();
    const broadIds = new Set(
      baseline.solids
        .filter((solid) => solid.id.endsWith(':pass15d-broad-navigation-runtime'))
        .map((solid) => solid.id)
    );

    const thinEdgeCandidateSolids: StageSolidDefinition[] =
      UNDERTOW_UPPER_GLASS_SOURCE_MESHES.map((record) => {
        const triangleIds = [
          ...UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS,
          ...UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS
        ];
        const indices = triangleIds.flatMap((triangleId) => {
          const base = triangleId * 3;
          const a = record.mesh.indices[base];
          const b = record.mesh.indices[base + 1];
          const c = record.mesh.indices[base + 2];
          if (a === undefined || b === undefined || c === undefined) {
            throw new Error(`Pass18B thin-edge triangle ${triangleId} is missing`);
          }
          return [a, b, c];
        });
        const sourceId =
          record.side === 'POSITIVE_Z'
            ? 'UndertowT21D:upper-glass-positive-z:pass15d-broad-navigation-runtime'
            : 'UndertowT21D:upper-glass-negative-z:pass15d-broad-navigation-runtime';
        return {
          id: `${sourceId}:pass18b-thin-edge-qa`,
          center: [0, 0, 0],
          size: [20, 10, 20],
          material: 'light',
          render: false,
          projectileBlocker: false,
          cameraBlocker: false,
          collisionEnabled: false,
          navigationEnabled: true,
          triangleMesh: {
            vertices: record.mesh.vertices,
            indices
          }
        };
      });

    const candidate: StageDefinition = {
      ...baseline,
      metadata: {
        ...baseline.metadata,
        id: 'undertow-t21d-pass18b-thin-edge-navigation-qa',
        displayName: 'Undertow T21-D Pass 18B Thin Edge Navigation QA'
      },
      solids: [
        ...baseline.solids.filter((solid) => !broadIds.has(solid.id)),
        ...thinEdgeCandidateSolids
      ]
    };

    const anchors = [
      ...baseline.paintSurfaces.map((surface) => ({
        id: `paint:${surface.backingSolidId}`,
        point: surface.center
      })),
      ...baseline.solids
        .filter((solid) => solid.id.includes('grate-mesh:'))
        .map((solid) => ({
          id: `grate:${solid.id}`,
          point: [
            solid.center[0],
            solid.center[1] + solid.size[1] * 0.5,
            solid.center[2]
          ] as const
        })),
      ...UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.positiveZ
        .map((point, index) => ({
          id: `glass:positive-z:${index}`,
          point
        })),
      ...UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.negativeZ
        .map((point, index) => ({
          id: `glass:negative-z:${index}`,
          point
        }))
    ];
    expect(anchors).toHaveLength(25);

    const matrix = (stage: StageDefinition) => {
      const navigation = new RecastStageNavigation(stage, new PerformanceStats());
      return anchors.map((from) => ({
        from: from.id,
        reached: anchors
          .filter((to) =>
            navigation.auditPath(vec3(from.point), vec3(to.point)).reachedTarget
          )
          .map((to) => to.id)
      }));
    };

    const baselineRows = matrix(baseline);
    const candidateRows = matrix(candidate);
    console.log(
      'T21NAVTHINEDGE18B',
      JSON.stringify({
        broadTrianglesPerSide: UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS.length,
        candidateTrianglesPerSide:
          UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS.length +
          UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS.length,
        baselineRows,
        candidateRows
      })
    );

    expect(UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS).toEqual([98, 99]);
    expect(candidateRows).toEqual(baselineRows);
  });

});
