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
  UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS
} from './UndertowSpillwayUpperGlassReconstructionCandidate';
import {
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES
} from './UndertowSpillwayUpperGlassMeshGeometry';
import {
  UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT,
  UNDERTOW_T21D_CONNECTIVITY_PROBES,
  undertowFullStageConnectivityAuditErrors,
  undertowPass18bTraversableQaAnchors,
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
      resolutionPass: '18M',
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
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.traversableAnchorMatrixPass18B)
      .toMatchObject({
        anchorCount: 25,
        paintAnchorCount: 17,
        grateAnchorCount: 2,
        upperGlassBroadAnchorCount: 6,
        directedPairCount: 625,
        reachedDirectedPairCountIncludingSelf: 79,
        missedDirectedPairCount: 546,
        reachedNonSelfDirectedPairCount: 54,
        weakComponentCount: 9,
        stronglyConnectedComponentCount: 11,
        isolatedAnchorIds: [
          'paint:UndertowT21D:center-origin-step-top-face:0',
          'grate:UndertowT21D:negative-z-grate-mesh:0',
          'grate:UndertowT21D:positive-z-grate-mesh:0'
        ],
        upperGlassPositiveBroadInternalAnchorCount: 3,
        upperGlassNegativeBroadInternalAnchorCount: 3,
        upperGlassBroadExternallyConnected: false,
        maximumObservedAnchorSnapMeters: 0.24704275013919783,
        qaRunNumber: 873
      });
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.grateIngressPass18B)
      .toMatchObject({
        confirmedTraversableGrateCount: 2,
        isolatedGrateAnchorCount: 2,
        sharesExactPlanBoundaryWithSpawnSideWhiteFace: true,
        adjacentSpawnSideWhiteFaceIsMultiElevation: true,
        adjacentContinuousUpperTerrainRuntimeBindingResolved: false,
        offMeshLinkAuthorized: false,
        userCaptureRequiredNow: false
      });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.grateIngressPass18B
        .negativePlanSharedBoundaryMeters
    ).toBeCloseTo(6.375, 9);
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.grateIngressPass18B
        .positivePlanSharedBoundaryMeters
    ).toBeCloseTo(6.375, 9);
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.upperGlassThinEdgeNavigationPass18B)
      .toMatchObject({
        broadNavigationTrianglesPerSide: 46,
        diagnosticCandidateTrianglesPerSide: 48,
        addedThinEdgeTriangleIds: [98, 99],
        thinEdgeProbeCount: 2,
        thinEdgeMinimumInteriorClearanceMeters: 0.046493,
        recastCellSizeMeters: 0.18,
        recastWalkableRadiusVoxels: 2,
        recastNominalErosionRadiusMeters: 0.36,
        baselineAndThinEdgeCandidateMatricesIdentical: true,
        currentPartialCandidateExternalBridgeAdded: false,
        currentGlassIsolationCausedByThinEdgeExclusion: false,
        finalThinEdgeNavigationDispositionResolved: false,
        requiresRetestAfterAdjacentUpperTerrainBinding: true,
        runtimePromotionAuthorized: false,
        qaRunNumber: 874
      });
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.additionalDisconnectedTraversableRegions)
      .toEqual([
        'negative-z-grate',
        'positive-z-grate',
        'positive-z-upper-glass-broad',
        'negative-z-upper-glass-broad'
      ]);
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.sourceNativeUpperTerrainPass18C)
      .toMatchObject({
        sourceAuditScope: 'QA_ONLY_SOURCE_NATIVE_ADJACENCY',
        sourceAuditRunNumber: 886,
        sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
        exactTriangleDistanceIncludesEdgeEdge: true,
        baselineMatrixReachedPairs: 79,
        geometryOnlyAdjacentBindingChangedConnectivity: false,
        missingAdjacentTriangleHypothesisSufficient: false,
        traversalOrCollisionSemanticsStillRequired: true,
        convenienceGeometryAuthorized: false,
        offMeshLinkAuthorized: false,
        runtimePromotionAuthorized: false,
        activationBlockerCleared: false,
        userCaptureRequiredNow: false
      });
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.sourceNativeUpperTerrainPass18C.grate)
      .toMatchObject({
        qualifiedSourceComponentsPerSide: 8,
        sourceTrianglesPerSide: 16,
        sourceAreaSquareMetersPerSide: 19.054820,
        exactMirrorVertexXor: 0,
        nearestWalkDistanceMeters: 0.335410,
        nearestWalkSourceObject:
          'Fld_Temple01_pCube21525_1__FloorConcrete00',
        sourceGraphReachableAt030Meters: false,
        sourceGraphReachableAt040Meters: true,
        sourceNativeReplacementMatrixReachedPairs: 79,
        sourceNativePlusNearestFloorMatrixReachedPairs: 79,
        remainsSingletonAfterSourceNativeReplacement: true,
        remainsSingletonAfterNearestFloorBinding: true
      });
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.sourceNativeUpperTerrainPass18C.upperGlass)
      .toMatchObject({
        pass13aRouteSeedCountPerSide: 3,
        sourceRouteComponentsPerSide: 3,
        sourceBroadTrianglesPerSide: 6,
        sourceBroadAreaSquareMetersPerSide: 58.171653,
        nearestBridgeMetalDistanceMeters: 0.055902,
        bridgeReachableComponentsAt030MetersPerSide: 24,
        bridgeReachableTrianglesAt030MetersPerSide: 48,
        bridgeReachableAreaSquareMetersPerSide: 9.332461,
        nearestNonBridgeWalkDistanceMeters: 0.7,
        nearestNonBridgeWalkSourceObject:
          'Fld_Temple01_pCube20989_1__FloorConcrete02',
        bridgeOnlyMatrixReachedPairs: 79,
        bridgePlusNearestFloorMatrixReachedPairs: 79,
        bridgeOnlyExternalGlassReachCount: 0,
        bridgePlusNearestFloorExternalGlassReachCount: 0
      });
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.productionKccTraversalPass18D)
      .toMatchObject({
        qaRunNumber: 891,
        characterMode: 'HUMAN',
        directedProbeCount: 12,
        successfulDirectedProbeCount: 12,
        initiallySettledProbeCount: 12,
        totalAirborneTicks: 0,
        grateFloorDirectedProbeCount: 4,
        glassBridgeDirectedProbeCount: 4,
        bridgeFloorDirectedProbeCount: 4,
        usesSharedProductionCharacterControllerConfiguration: true,
        humanRadiusMeters: 0.32,
        controllerOffsetMeters: 0.025,
        autostepMaxHeightMeters: 0.34,
        snapToGroundMeters: 0.24,
        recastNominalErosionRadiusMeters: 0.36,
        pass18cSourceNativeRecastMatrixStillReachedPairs: 79,
        currentReconstructionPhysicalTraversalFeasible: true,
        currentRecastRepresentationMatchesPhysicalTraversal: false,
        navigationDiscretizationMismatchLocalized: true,
        originalGrateWalkOnOffSemanticsResolved: false,
        exactOriginalGlassIngressSourceBindingResolved: false,
        kccResultAloneAuthorizesOriginalGameplaySemantics: false,
        offMeshLinkAuthorized: false,
        runtimePromotionAuthorized: false,
        activationBlockerCleared: false,
        userCaptureRequiredNow: false
      });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.productionKccTraversalPass18D
        .effectiveHumanContactRadiusMeters
    ).toBeCloseTo(0.345, 12);
    expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.recastRepresentationSweepPass18E)
      .toMatchObject({
        qaRunNumber: 900,
        sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
        trustedSnapMeters: 0.30,
        testedVariantCount: 7,
        maximumTrustedBidirectionallyReachedPairs: 3,
        allSixSourcePairsTrustedConnectedAnyVariant: false,
        bridgeMetalToNearestFloorTrustedConnectedAnyVariant: false,
        bothMirroredGrateFloorPairsTrustedConnectedAnyVariant: false,
        zeroErosionProducesMirroredGrateAsymmetry: true,
        finerZeroErosionRemovesPositiveGrateRasterBridge: true,
        extraClimbChangesZeroErosionTrustedResult: false,
        runtimeBroadGlassToBridgeTrustedConnectedBothSides: true,
        runtimeBroadGlassToBridgeUsesProductionRecastSettings: true,
        testedGlassChainBreakLocalizedToBridgeMetalFloorGap: true,
        currentRuntimeBroadGlassNavigationNeedsReplacement: false,
        globalRecastParameterChangeAuthorized: false,
        exactOriginalGlassIngressTransitionResolved: false,
        originalGrateWalkOnOffSemanticsResolved: false,
        offMeshLinkAuthorized: false,
        runtimePromotionAuthorized: false,
        activationBlockerCleared: false,
        userCaptureRequiredNow: false
      });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.recastRepresentationSweepPass18E
        .production
    ).toMatchObject({
      cellSizeMeters: 0.18,
      walkableRadiusVoxels: 2,
      nominalErosionMeters: 0.36,
      trustedBidirectionallyReachedPairs: 1,
      trustedDirectionReachCount: 2
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.recastRepresentationSweepPass18E
        .productionZeroErosion
    ).toMatchObject({
      trustedBidirectionallyReachedPairs: 3,
      trustedDirectionReachCount: 6
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.recastRepresentationSweepPass18E
        .productionOneVoxelErosion
    ).toMatchObject({
      trustedBidirectionallyReachedPairs: 2,
      trustedDirectionReachCount: 4
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.recastRepresentationSweepPass18E
        .finerSameErosion
    ).toMatchObject({
      trustedBidirectionallyReachedPairs: 2,
      trustedDirectionReachCount: 4
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.recastRepresentationSweepPass18E
        .finerAgentRadius
    ).toMatchObject({
      trustedBidirectionallyReachedPairs: 2,
      trustedDirectionReachCount: 4
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.recastRepresentationSweepPass18E
        .finerZeroErosion
    ).toMatchObject({
      trustedBidirectionallyReachedPairs: 2,
      trustedDirectionReachCount: 4
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.recastRepresentationSweepPass18E
        .productionExtraClimbZeroErosion
    ).toMatchObject({
      walkableClimbVoxels: 8,
      trustedBidirectionallyReachedPairs: 3,
      trustedDirectionReachCount: 6
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localConnectorExperimentPass18F
    ).toMatchObject({
      qaRunNumber: 908,
      diagnosticOnly: true,
      endpointMethod:
        'EXACT_TRIANGLE_CLOSEST_PAIR_PLUS_TRUSTED_COMBINED_RECAST_COMPONENT_SAMPLE',
      trustedComponentSnapMeters: 0.30,
      candidateConnectorCount: 4,
      testedRadiiMeters: [0.10, 0.18, 0.30],
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      allTestedCandidateMatricesReachedDirectedPairs: 79,
      allTestedCandidateMatricesWeakComponentCount: 9,
      allTestedCandidateMatricesStronglyConnectedComponentCount: 11,
      candidateLinksChangedConnectivity: false,
      minimumSampledEndpointBoundaryOffsetMeters: 1.7340469343833274,
      allSampledBoundaryOffsetsExceedTrustedSnapMeters: true,
      endEndpointMutualTrackedAnchorMembershipCount: 0,
      allFourDestinationEndpointsOutsideTrackedAnchorSccs: true,
      detourMechanismOperational: true,
      oneHopBoundaryConnectorSufficient: false,
      destinationSourceChainBindingStillRequired: true,
      originalTraversalDirectionalityResolved: false,
      connectorPromotionAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false,
      userCaptureRequiredNow: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localConnectorExperimentPass18F
        .syntheticDetourControl
    ).toMatchObject({
      reachedDirectedPairs: 87,
      weakComponentCount: 8,
      stronglyConnectedComponentCount: 10,
      centerStepRemainsIsolated: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localConnectorExperimentPass18F
        .startEndpointMembership
    ).toEqual({
      gratePositive: ['grate:UndertowT21D:positive-z-grate-mesh:0'],
      grateNegative: ['grate:UndertowT21D:negative-z-grate-mesh:0'],
      glassPositive: [
        'glass:positive-z:0',
        'glass:positive-z:1',
        'glass:positive-z:2'
      ],
      glassNegative: [
        'glass:negative-z:0',
        'glass:negative-z:1',
        'glass:negative-z:2'
      ]
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localGapSourceClassAuditPass18H
    ).toMatchObject({
      sourceAuditRunNumber: 918,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      localMarginMeters: 3.0,
      trustedBridgeMeters: 0.30,
      humanContactMeters: 0.345,
      ordinaryWalkStrictBridgeCandidateCountTotal: 0,
      hiddenOrdinaryWalkSourceRecovered: false,
      overlayOrSteepGeometryAuthorizesTraversal: false,
      exactGapVectorOrTraversalSemanticsStillRequired: true,
      globalRecastParameterChangeAuthorized: false,
      convenienceGeometryAuthorized: false,
      offMeshLinkAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false,
      userCaptureRequiredNow: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localGapSourceClassAuditPass18H.grate
    ).toMatchObject({
      positiveGapMeters: 0.5185586972146141,
      negativeGapMeters: 0.5185586972146133,
      nearbySourceComponentCountPerSide: 142,
      strictBridgeCandidateCountPerSide: 4,
      humanContactBridgeCandidateCountPerSide: 4,
      floorLineOverlayCandidateCountPerSide: 3,
      nonOverlayCandidateCountPerSide: 1,
      nonOverlaySourceMaterial: 'Fld_Temple01_Object00',
      nonOverlayWalkQualified: false,
      nonOverlaySteepOrNonUpward: true,
      ordinaryWalkBridgeRecovered: false,
      sourceClassPatternMirrored: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localGapSourceClassAuditPass18H.upperGlass
    ).toMatchObject({
      nearestFrontierGapMeters: 2.07423478885845,
      tiedFrontierCountPerSide: 2,
      strictBridgeCandidateCountsAcrossTiedFrontiers: [0, 2],
      humanContactBridgeCandidateCountsAcrossTiedFrontiers: [0, 2],
      strictBridgeMaterial: 'Fld_Temple01_FloorLine00',
      strictBridgeCandidatesAreOverlayOnly: true,
      ordinaryWalkBridgeRecovered: false,
      positiveOverlayBridgedTarget:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c12',
      positiveUnbridgedTarget:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c15',
      negativeOverlayBridgedTarget:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c17',
      negativeUnbridgedTarget:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c13',
      mirroredFrontierDisposition: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.exactGapVectorAuditPass18I
    ).toMatchObject({
      sourceAuditRunNumber: 923,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      temple01RegistrationScale: 0.964211,
      localizedClosestSeparationIsVerticalStep: false,
      exactGapWidthAndAxisResolved: true,
      exactKccFeasibilityAcrossLocalizedGapsResolved: false,
      originalTraversalDirectionalityResolved: false,
      originalJumpRequirementResolved: false,
      globalRecastParameterChangeAuthorized: false,
      convenienceGeometryAuthorized: false,
      offMeshLinkAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false,
      userCaptureRequiredNow: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.exactGapVectorAuditPass18I.grate
    ).toMatchObject({
      positiveProjectGapMeters: 0.5185586972146141,
      negativeProjectGapMeters: 0.5185586972146198,
      modelGapMeters: 0.5,
      modelHorizontalGapMeters: 0.5,
      modelVerticalDeltaMeters: 0,
      closestSeparationAxis: 'MODEL_Z',
      positiveModelDelta: [0, 0, 0.5],
      negativeModelDelta: [0, 0, -0.5],
      exactHalfMeterModelGap: true,
      purelyHorizontalClosestSeparation: true,
      structurallyMirrored: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.exactGapVectorAuditPass18I.upperGlass
    ).toMatchObject({
      projectGapMeters: 2.07423478885845,
      modelGapMeters: 2.0,
      modelHorizontalGapMeters: 2.0,
      modelVerticalDeltaMeters: 0,
      closestSeparationAxis: 'MODEL_Z',
      modelY: 3.0,
      positiveModelZ: [21.5, 19.5],
      negativeModelZ: [-21.5, -19.5],
      absoluteModelXFrontierLines: [4.25, 16.0],
      exactTwoMeterModelGap: true,
      purelyHorizontalClosestSeparation: true,
      tiedFrontiersStructurallyMirrored: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.productionKccExactGapPass18J
    ).toMatchObject({
      qaRunNumber: 930,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      directedProbeCount: 12,
      insetMeters: 0.40,
      humanRadiusMeters: 0.32,
      controllerOffsetMeters: 0.025,
      effectiveHumanContactRadiusMeters: 0.345,
      autostepMaxHeightMeters: 0.34,
      snapToGroundMeters: 0.24,
      grateRecastVsKccMismatchFurtherLocalized: true,
      upperGlassSimpleGroundedConnectorPhysicallyUnsupported: true,
      originalGameplayTraversalSemanticsResolved: false,
      originalGrateDirectionalityResolved: false,
      originalUpperGlassJumpOrAlternateRouteResolved: false,
      globalRecastParameterChangeAuthorized: false,
      convenienceGeometryAuthorized: false,
      offMeshLinkAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false,
      userCaptureRequiredNow: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.productionKccExactGapPass18J.grate
    ).toMatchObject({
      directedProbeCount: 4,
      successfulDirectedProbeCount: 4,
      failedDirectedProbeCount: 0,
      allSettledInitially: true,
      totalAirborneTicks: 0,
      allDirectionsRemainGrounded: true,
      maximumDropBelowSurfaceMeters: 0.08481084823608409,
      exactHalfMeterGapGroundedTraversalFeasible: true,
      mirroredBidirectionalPhysicalFeasibility: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.productionKccExactGapPass18J.upperGlass
    ).toMatchObject({
      directedProbeCount: 8,
      successfulDirectedProbeCount: 0,
      failedDirectedProbeCount: 8,
      allSettledInitially: true,
      totalAirborneTicks: 170,
      minimumAirborneTicksPerProbe: 20,
      maximumAirborneTicksPerProbe: 23,
      minimumDropBelowSurfaceMeters: 1.988972659111023,
      maximumDropBelowSurfaceMeters: 2.5186204862594606,
      maximumFinalHorizontalErrorMeters: 0.13355062839631762,
      exactTwoMeterGapGroundedTraversalFeasible: false,
      ordinaryGroundedWalkInsufficient: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.rawBoundaryGrateChainPass18K
    ).toMatchObject({
      qaRunNumber: 935,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      linkRadiusMeters: 0.30,
      candidateLinkCount: 4,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      ingressOnlyReachedDirectedPairs: 79,
      finalOnlyReachedDirectedPairs: 79,
      combinedReachedDirectedPairs: 79,
      combinedWeakComponentCount: 9,
      combinedStronglyConnectedComponentCount: 11,
      candidateLinksChangedConnectivity: false,
      bothGratesRemainIsolated: true,
      rawSourceBoundaryEndpointsSufficientForDetourBinding: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.trustedEndpointGrateChainPass18L
    ).toMatchObject({
      qaRunNumber: 937,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      trustedSnapMeters: 0.30,
      linkRadiusMeters: 0.30,
      candidateLinkCount: 4,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      candidateReachedDirectedPairs: 89,
      candidateWeakComponentCount: 7,
      candidateStronglyConnectedComponentCount: 9,
      baselineIsolatedAnchorCount: 3,
      candidateIsolatedAnchorCount: 1,
      bothGratesGainExternalReach: true,
      positiveGrateReachedAnchorCountIncludingSelf: 5,
      negativeGrateReachedAnchorCountIncludingSelf: 5,
      connectivityImprovedWithTrustedInteriorEndpoints: true,
      trustedProjectionRemainsLocalToSourceBoundary: false,
      localConnectorSemanticsValidated: false,
      nonlocalProjectionMakesCandidateUnfitForPromotion: true,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.trustedEndpointMinimalityPass18M
    ).toMatchObject({
      qaRunNumber: 941,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      trustedSnapMeters: 0.30,
      linkRadiusMeters: 0.30,
      candidateLinkCount: 4,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      ingressOnlyReachedDirectedPairs: 79,
      finalOnlyReachedDirectedPairs: 79,
      everySingleLinkReachedDirectedPairs: 79,
      positivePairReachedDirectedPairs: 84,
      positivePairWeakComponentCount: 8,
      positivePairStronglyConnectedComponentCount: 10,
      negativePairReachedDirectedPairs: 84,
      negativePairWeakComponentCount: 8,
      negativePairStronglyConnectedComponentCount: 10,
      allFourReachedDirectedPairs: 89,
      allFourWeakComponentCount: 7,
      allFourStronglyConnectedComponentCount: 9,
      linksRequiredPerSideForConnectivityChange: 2,
      ingressAndFinalBreakAreIndependentlyNecessaryPerSide: true,
      eachSidePairResolvesOnlyItsOwnGrateSingleton: true,
      twoDistinctRecastAttachmentBreaksPerSide: true,
      localConnectorSemanticsValidated: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
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

    const anchors = undertowPass18bTraversableQaAnchors();
    expect(anchors).toHaveLength(25);
    expect(anchors.filter((anchor) => anchor.kind === 'PAINT_SURFACE')).toHaveLength(17);
    expect(anchors.filter((anchor) => anchor.kind === 'GRATE')).toHaveLength(2);
    expect(anchors.filter((anchor) => anchor.kind === 'UPPER_GLASS_BROAD')).toHaveLength(6);
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
    const reachedCount = rows.reduce((sum, row) => sum + row.reached.length, 0);
    expect(reachedCount).toBe(79);
    expect(625 - reachedCount).toBe(546);
    expect(reachedCount - 25).toBe(54);
    expect(rows.every((row) => row.reached.includes(row.from))).toBe(true);
    expect(rows).toHaveLength(25);

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
    expect(weakComponents).toBe(9);

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
    expect(strongComponents).toBe(11);

    const isolated = rows
      .filter((row) => row.reached.length === 1 && row.reached[0] === row.from)
      .map((row) => row.from);
    expect(isolated).toEqual([
      'paint:UndertowT21D:center-origin-step-top-face:0',
      'grate:UndertowT21D:negative-z-grate-mesh:0',
      'grate:UndertowT21D:positive-z-grate-mesh:0'
    ]);

    expect(Math.max(
      ...rows.flatMap((row) => [row.maxStartSnap, row.maxEndSnap])
    )).toBeCloseTo(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .traversableAnchorMatrixPass18B.maximumObservedAnchorSnapMeters,
      9
    );

    for (const side of ['positive-z', 'negative-z'] as const) {
      const sideIds = [0, 1, 2].map((index) => `glass:${side}:${index}`);
      for (const id of sideIds) {
        expect(reach.get(id)).toEqual(new Set(sideIds));
      }
    }
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
        const xs = record.mesh.vertices.map((vertex) => vertex[0]);
        const ys = record.mesh.vertices.map((vertex) => vertex[1]);
        const zs = record.mesh.vertices.map((vertex) => vertex[2]);
        return {
          id: `${sourceId}:pass18b-thin-edge-qa`,
          center: [0, 0, 0],
          size: [
            Math.max(...xs) - Math.min(...xs),
            Math.max(...ys) - Math.min(...ys),
            Math.max(...zs) - Math.min(...zs)
          ],
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

    const anchors = undertowPass18bTraversableQaAnchors();
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
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassThinEdgeNavigationPass18B
        .baselineAndThinEdgeCandidateMatricesIdentical
    ).toBe(true);
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassThinEdgeNavigationPass18B
        .currentGlassIsolationCausedByThinEdgeExclusion
    ).toBe(false);
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassThinEdgeNavigationPass18B
        .finalThinEdgeNavigationDispositionResolved
    ).toBe(false);
  });

});
