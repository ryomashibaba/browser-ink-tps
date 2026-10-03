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
      resolutionPass: '18BR',
      rightLowToUnderpassResolved: false,
      centerSmallStepNavigationResolved: false,
      upperGlassBroadNavigationReconstructionBound: true,
      upperGlassThinEdgeFrameNavigationAuthorityResolved: false,
      upperGlassNavigationAuthorityResolved: false,
      allTraversableRuntimeGeometryBound: false,
      fullStageConnectivityReady: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassBridgeFloorRadiusMinimizationPass18AK
    ).toMatchObject({
      qaRunNumber: 1049,
      diagnosticOnly: true,
      fixedRetreatMeters: 0.130,
      bridgeEndpointMode: 'EXACT_RAW_PHYSICAL_ENDPOINT',
      floorEndpointMode: 'PASS18AJ_SOURCE_SURFACE_RETREAT_FIXED',
      bidirectional: true,
      globalRecastSettingsChanged: false,
      coarseLastCommonFailureRadiusMeters: 0.80,
      coarseFirstCommonSuccessRadiusMeters: 1.00,
      fineLastCommonFailureRadiusMeters: 0.98,
      fineFirstCommonSuccessRadiusMeters: 1.00,
      terminalFineStepMeters: 0.001,
      terminalLastCommonFailureRadiusMeters: 0.994,
      firstSampledCommonSuccessRadiusMeters: 0.995,
      commonThresholdLowerExclusiveMeters: 0.994,
      commonThresholdUpperInclusiveMeters: 0.995,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      bothSidesOwnGlassBidirectional: true,
      candidateReachesNonGlassRuntimeAnchor: false,
      sampledCommonRadiusResolvedAt1mmGranularity: true,
      exactSub1mmThresholdResolved: false,
      qaCandidateRadiusMeters: 0.995,
      endpointRetreatChangedDuringSweep: false,
      combinedUpstreamDownstreamAuditRequiredNext: true,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.upperGlassCombinedSourceChainPass18AL
    ).toMatchObject({
      qaRunNumber: 1054,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      globalRecastSettingsChanged: false,
      trustedEndpointsUsedAsLinks: false,
      upstreamSourcePass: '18AK',
      upstreamRetreatMeters: 0.130,
      upstreamRadiusMeters: 0.995,
      floorSlopeSourcePass: '18AF',
      floorSlopeRadiusMeters: 0.80,
      baselineReachedDirectedPairs: 79,
      combinedReachedDirectedPairs: 79,
      combinedWeakComponentCount: 9,
      combinedStronglyConnectedComponentCount: 11,
      combinedAddedTrackedAnchorPairs: 0,
      combinedRemovedTrackedAnchorPairs: 0,
      trustedDownstreamComponentCountPerSide: 15,
      connectedDownstreamComponentCountPerSide: 2,
      connectedMaterialsPerSide: ['FloorConcrete02', 'FloorSlope00'],
      floorSlopeBoundaryOwnGlassConnectedBothSides: true,
      floorSlopeBoundaryReachesNonGlassRuntimeAnchor: false,
      nearestOverallDisconnectedBranchIsRouteDeadEndBridgeMetal: true,
      routeContinuingBoundaryKind: 'FloorSlope00->FloorConcrete00',
      positiveRouteContinuingBoundaryDistanceMeters: 0.5185586972146173,
      negativeRouteContinuingBoundaryDistanceMeters: 0.5185586972146101,
      routeContinuingBoundaryKccValidationRequiredNext: true,
      broadFrontierLinkAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.slopeFloor00KccPass18AM
    ).toMatchObject({
      qaRunNumber: 1056,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      sourceBoundary: 'FloorSlope00->FloorConcrete00',
      characterMode: 'HUMAN',
      directedProbeCount: 4,
      successfulDirectedProbeCount: 4,
      initiallySettledProbeCount: 4,
      totalAirborneTicks: 0,
      positiveBoundaryDistanceMeters: 0.5185586972146173,
      negativeBoundaryDistanceMeters: 0.5185586972146101,
      effectiveHumanContactRadiusMeters: 0.34500000000000003,
      ordinaryWalkingBidirectionalBothSides: true,
      jumpOrAirborneTraversalRequired: false,
      cpuRecastRepresentationStillMissing: true,
      exactRawBoundaryRadiusSweepAuthorizedNext: true,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.slopeFloor00RadiusPass18AN
    ).toMatchObject({
      qaRunNumber: 1060,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      humanKccSourcePass: '18AM',
      humanKccBidirectionalSuccess: true,
      endpointMode: 'EXACT_RAW_PHYSICAL_PAIR',
      bidirectional: true,
      upstreamRetreatMeters: 0.130,
      upstreamRadiusMeters: 0.995,
      floorSlopeRadiusMeters: 0.80,
      positivePhysicalDistanceMeters: 0.5185586972146173,
      negativePhysicalDistanceMeters: 0.5185586972146101,
      coarseLastCommonFailureRadiusMeters: 0.60,
      coarseFirstCommonSuccessRadiusMeters: 0.70,
      fineLastCommonFailureRadiusMeters: 0.66,
      fineFirstCommonSuccessRadiusMeters: 0.67,
      terminalFineStepMeters: 0.001,
      terminalLastCommonFailureRadiusMeters: 0.668,
      firstSampledCommonSuccessRadiusMeters: 0.669,
      commonThresholdLowerExclusiveMeters: 0.668,
      commonThresholdUpperInclusiveMeters: 0.669,
      qaCandidateRadiusMeters: 0.669,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      bothSidesFloor00OwnGlassBidirectional: true,
      candidateReachesNonGlassRuntimeAnchor: false,
      sampledCommonRadiusResolvedAt1mmGranularity: true,
      exactSub1mmThresholdResolved: false,
      nextCombinedChainContinuationAuditRequired: true,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.postFloor00SourceBreakPass18AO
    ).toMatchObject({
      qaRunNumber: 1072,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      trustedSnapMeters: 0.30,
      upstreamSourcePass: '18AK',
      upstreamRetreatMeters: 0.130,
      upstreamRadiusMeters: 0.995,
      floorSlopeSourcePass: '18AF',
      floorSlopeRadiusMeters: 0.80,
      slopeFloor00SourcePass: '18AN',
      slopeFloor00RadiusMeters: 0.669,
      seedMaterial: 'FloorConcrete00',
      seedYRangeMeters: [3, 3],
      bothSeedsOwnGlassConnected: true,
      disconnectedComparedCountPerSide: 55,
      nearestDisconnectedMaterial: 'FloorConcrete02',
      nearestDisconnectedYRangeMeters: [1.5, 1.5],
      positiveNearestDistanceMeters: 1.8236261924604125,
      negativeNearestDistanceMeters: 1.8236261924604125,
      nearestDisconnectedReachesOwnGlassAnchor: false,
      nearestDisconnectedReachesNonGlassRuntimeAnchor: false,
      trustedNonLocalShortcutAuthorized: false,
      exactSourceBoundaryKccValidationRequiredNext: true,
      broadFrontierLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.floor00LowerFloor02KccPass18AP
    ).toMatchObject({
      qaRunNumber: 1079,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      sourcePass: '18AO',
      boundaryClass: 'FloorConcrete00@Y3.0->FloorConcrete02@Y1.5',
      physicalBoundaryDistanceMeters: 1.8236261924604125,
      horizontalGapMeters: 1.0371173944292236,
      verticalDeltaMeters: 1.5,
      humanRadiusMeters: 0.32,
      controllerOffsetMeters: 0.025,
      autostepMaxHeightMeters: 0.34,
      jumpSpeedMetersPerSecond: 8.2,
      gravityMetersPerSecond2: 28,
      directedProbeCount: 6,
      bothLowerToUpperWalkFail: true,
      bothLowerToUpperJumpSucceed: true,
      bothUpperToLowerDropSucceed: true,
      positiveLowerToUpperJumpAirborneTicks: 14,
      negativeLowerToUpperJumpAirborneTicks: 15,
      positiveUpperToLowerDropAirborneTicks: 16,
      negativeUpperToLowerDropAirborneTicks: 15,
      qaTraversalClass: 'JUMP_UP_DROP_DOWN',
      ordinaryWalkingAuthorized: false,
      qaJumpUpFeasible: true,
      qaDropDownFeasible: true,
      originalGameplayDirectionalityResolved: false,
      originalGameplayJumpRequirementResolved: false,
      productionOffMeshLinkAuthorized: false,
      qaOnlyDirectionalLinkDiagnosticAllowed: true,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.directionalAttachmentPass18AQ
    ).toMatchObject({
      qaRunNumber: 1083,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18AP',
      qaTraversalClass: 'JUMP_UP_DROP_DOWN',
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      sampledRadiiMeters: [0.30, 0.60, 1.00, 1.50, 2.00, 2.50, 3.00, 3.50, 4.00],
      physicalBoundaryDistanceMeters: 1.8236261924604125,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      coarseLastCommonFailureRadiusMeters: 0.60,
      coarseFirstCommonSuccessRadiusMeters: 1.00,
      firstJumpOnlyCommonAttachmentRadiusMeters: 1.00,
      firstDropOnlyCommonAttachmentRadiusMeters: 1.00,
      firstBothCommonAttachmentRadiusMeters: 1.00,
      jumpOnlyDirectionalityPreserved: true,
      dropOnlyDirectionalityPreserved: true,
      bothDirectionsAttachAtSameSampledRadius: true,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      candidateReachesNonGlassRuntimeAnchor: false,
      exactRawEndpointsUsed: true,
      qaOnlyDirectionalLinkPlumbingValidated: true,
      exactThresholdResolved: false,
      fineRadiusMinimizationRequiredNext: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.directionalFineRadiusPass18AR
    ).toMatchObject({
      qaRunNumber: 1087,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18AQ',
      qaTraversalClass: 'JUMP_UP_DROP_DOWN',
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      coarseBracketMeters: [0.60, 1.00],
      sampledRadiiMeters: [0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 1.00],
      physicalBoundaryDistanceMeters: 1.8236261924604125,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      lastCommonFailureRadiusMeters: 0.70,
      firstCommonSuccessRadiusMeters: 0.75,
      commonThresholdLowerExclusiveMeters: 0.70,
      commonThresholdUpperInclusiveMeters: 0.75,
      negativeSideFirstSampledAttachmentRadiusMeters: 0.70,
      positiveSideFirstSampledAttachmentRadiusMeters: 0.75,
      firstJumpOnlyCommonAttachmentRadiusMeters: 0.75,
      firstDropOnlyCommonAttachmentRadiusMeters: 0.75,
      firstBothCommonAttachmentRadiusMeters: 0.75,
      jumpOnlyDirectionalityPreserved: true,
      dropOnlyDirectionalityPreserved: true,
      bothDirectionsAttachAtSameCommonSampledRadius: true,
      sideAttachmentAsymmetryObservedAt070Meters: true,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      candidateReachesNonGlassRuntimeAnchor: false,
      exactRawEndpointsUsed: true,
      qaOnlyDirectionalLinkPlumbingValidated: true,
      sampledCommonRadiusResolvedAt50mmGranularity: true,
      exactThresholdResolved: false,
      terminalRadiusSweepRequiredNext: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.directionalTerminalRadiusPass18AS
    ).toMatchObject({
      qaRunNumber: 1091,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18AR',
      qaTraversalClass: 'JUMP_UP_DROP_DOWN',
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      fineBracketMeters: [0.700, 0.750],
      sampledRadiiMeters: [
        0.700, 0.705, 0.710, 0.715, 0.720, 0.725,
        0.730, 0.735, 0.740, 0.745, 0.750
      ],
      physicalBoundaryDistanceMeters: 1.8236261924604125,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      lastCommonFailureRadiusMeters: 0.700,
      firstCommonSuccessRadiusMeters: 0.705,
      commonThresholdLowerExclusiveMeters: 0.700,
      commonThresholdUpperInclusiveMeters: 0.705,
      negativeSideAttachesAt0700Meters: true,
      positiveSideAttachesAt0700Meters: false,
      firstJumpOnlyCommonAttachmentRadiusMeters: 0.705,
      firstDropOnlyCommonAttachmentRadiusMeters: 0.705,
      firstBothCommonAttachmentRadiusMeters: 0.705,
      jumpOnlyDirectionalityPreserved: true,
      dropOnlyDirectionalityPreserved: true,
      bothDirectionsAttachAtSameCommonSampledRadius: true,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      candidateReachesNonGlassRuntimeAnchor: false,
      exactRawEndpointsUsed: true,
      qaOnlyDirectionalLinkPlumbingValidated: true,
      sampledCommonRadiusResolvedAt5mmGranularity: true,
      exactThresholdResolved: false,
      oneMillimeterRadiusSweepRequiredNext: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.directionalOneMmRadiusPass18AT
    ).toMatchObject({
      qaRunNumber: 1095,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18AS',
      qaTraversalClass: 'JUMP_UP_DROP_DOWN',
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      terminalBracketMeters: [0.700, 0.705],
      sampledRadiiMeters: [0.700, 0.701, 0.702, 0.703, 0.704, 0.705],
      physicalBoundaryDistanceMeters: 1.8236261924604125,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      lastCommonFailureRadiusMeters: 0.700,
      firstCommonSuccessRadiusMeters: 0.701,
      commonThresholdLowerExclusiveMeters: 0.700,
      commonThresholdUpperInclusiveMeters: 0.701,
      negativeSideAttachesAt0700Meters: true,
      positiveSideAttachesAt0700Meters: false,
      firstJumpOnlyCommonAttachmentRadiusMeters: 0.701,
      firstDropOnlyCommonAttachmentRadiusMeters: 0.701,
      firstBothCommonAttachmentRadiusMeters: 0.701,
      jumpOnlyDirectionalityPreserved: true,
      dropOnlyDirectionalityPreserved: true,
      bothDirectionsAttachAtSameCommonSampledRadius: true,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      candidateReachesNonGlassRuntimeAnchor: false,
      exactRawEndpointsUsed: true,
      qaOnlyDirectionalLinkPlumbingValidated: true,
      sampledCommonRadiusResolvedAt1mmGranularity: true,
      exactThresholdResolved: false,
      subMillimeterRadiusSweepRequiredNext: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.directionalPointOneMmRadiusPass18AU
    ).toMatchObject({
      qaRunNumber: 1099,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18AT',
      qaTraversalClass: 'JUMP_UP_DROP_DOWN',
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      oneMmBracketMeters: [0.7000, 0.7010],
      sampledRadiiMeters: [
        0.7000, 0.7001, 0.7002, 0.7003, 0.7004, 0.7005,
        0.7006, 0.7007, 0.7008, 0.7009, 0.7010
      ],
      physicalBoundaryDistanceMeters: 1.8236261924604125,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      lastCommonFailureRadiusMeters: 0.7004,
      firstCommonSuccessRadiusMeters: 0.7005,
      commonThresholdLowerExclusiveMeters: 0.7004,
      commonThresholdUpperInclusiveMeters: 0.7005,
      negativeSideAttachesAt07000Meters: true,
      positiveSideAttachesAt07004Meters: false,
      positiveSideAttachesAt07005Meters: true,
      firstJumpOnlyCommonAttachmentRadiusMeters: 0.7005,
      firstDropOnlyCommonAttachmentRadiusMeters: 0.7005,
      firstBothCommonAttachmentRadiusMeters: 0.7005,
      jumpOnlyDirectionalityPreserved: true,
      dropOnlyDirectionalityPreserved: true,
      bothDirectionsAttachAtSameCommonSampledRadius: true,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      candidateReachesNonGlassRuntimeAnchor: false,
      exactRawEndpointsUsed: true,
      qaOnlyDirectionalLinkPlumbingValidated: true,
      sampledCommonRadiusResolvedAtPointOneMmGranularity: true,
      exactThresholdResolved: false,
      engineeringRadiusRefinementComplete: true,
      furtherRadiusRefinementRequired: false,
      semanticAuthorityIsNowPrimaryBlocker: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.lowerFloor02ContinuationPass18AV
    ).toMatchObject({
      qaRunNumber: 1104,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18AU',
      qaDirectionalRadiusMeters: 0.7005,
      qaDirectionalRadiusBracketMeters: [0.7004, 0.7005],
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      jumpOnlyMatrix: [79, 9, 11],
      dropOnlyMatrix: [79, 9, 11],
      bothMatrix: [79, 9, 11],
      dropOnlyConnectedComponentCountPerSide: 5,
      bothConnectedComponentCountPerSide: 5,
      dropOnlyConnectedMaterialsPerSide: {
        FloorConcrete00: 1,
        FloorConcrete02: 3,
        FloorSlope00: 1
      },
      dropOnlyLowerSeedOutboundFromOwnGlassBothSides: true,
      dropOnlyLowerSeedInboundToOwnGlassBothSides: false,
      bothLowerSeedOutboundFromOwnGlassBothSides: true,
      bothLowerSeedInboundToOwnGlassBothSides: true,
      lowerSeedReachesNonGlassRuntimeAnchor: false,
      dropOnlyBothConnectedSetsEqual: true,
      dropOnlyBothNearestFrontierEqual: true,
      lowRouteFromMaterial: 'FloorConcrete02',
      lowRouteFromYRangeMeters: [1.5, 1.5],
      positiveLowSlopeCandidateIds: [
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c5',
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c7'
      ],
      negativeLowSlopeCandidateIds: [
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c26',
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c24'
      ],
      lowSlopeCandidateMaterial: 'FloorSlope00',
      lowSlopeCandidateYRangeMeters: [0, 1.5],
      positiveLowSlopeCandidateDistancesMeters: [
        0.5185586972146101,
        0.5185586972146101
      ],
      negativeLowSlopeCandidateDistancesMeters: [
        0.5185586972146101,
        0.5185586972146133
      ],
      routeContinuingLowSlopeCandidateCountPerSide: 2,
      knownHighBridgeDeadEndTieStillPresent: true,
      lowSlopeProductionKccClassificationRequiredNext: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.lowSlopeKccPass18AW
    ).toMatchObject({
      qaRunNumber: 1108,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      sourcePass: '18AV',
      sourceBoundaryClass: 'FloorConcrete02@Y1.5->FloorSlope00@Y0..1.5',
      candidateCount: 4,
      directedProbeCount: 8,
      effectiveHumanContactRadiusMeters: 0.34500000000000003,
      positiveCandidateDistancesMeters: [
        0.5185586972146101,
        0.5185586972146101
      ],
      negativeCandidateDistancesMeters: [
        0.5185586972146101,
        0.5185586972146133
      ],
      allBoundaryVerticalDeltasMeters: [0, 0, 0, 0],
      successfulDirectedProbeCount: 8,
      settledInitiallyProbeCount: 8,
      totalAirborneTicks: 0,
      maximumFinalHorizontalErrorMeters: 0.15422836803712894,
      ordinaryWalkingBidirectionalAllCandidates: true,
      qaTraversalClass: 'ORDINARY_WALK_BIDIRECTIONAL',
      jumpOrDropSemanticRequired: false,
      cpuRecastRepresentationStillMissing: true,
      exactRawBidirectionalAttachmentDiagnosticAllowedNext: true,
      broadFrontierLinkAuthorized: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.lowSlopeMinimalityRadiusPass18AX
    ).toMatchObject({
      qaRunNumber: 1114,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      sourcePass: '18AW',
      qaTraversalClass: 'ORDINARY_WALK_BIDIRECTIONAL',
      upstreamDirectionalAssumption: 'DROP_ONLY_QA_CONTINUATION',
      upstreamDirectionalRadiusMeters: 0.7005,
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      sampledRadiiMeters: [0.30,0.50,0.60,0.70,0.80,1.00,1.20,1.50],
      candidate1FirstCommonSuccessRadiusMeters: 0.80,
      candidate2FirstCommonSuccessRadiusMeters: 0.70,
      bothFirstCommonSuccessRadiusMeters: 0.80,
      candidate1At070CommonSuccess: false,
      candidate2At070CommonSuccess: true,
      bothAt070CommonSuccess: false,
      candidate1At080CommonSuccess: true,
      candidate2At080CommonSuccess: true,
      bothAt080CommonSuccess: true,
      bothAt080AllLowSlopesBidirectionalBothSides: true,
      singleCandidateLeavesSiblingLowSlopeUnrepresented: true,
      bothLinksRequiredToRepresentAllFourKccValidatedLowSlopes: true,
      qaCandidateRadiusMeters: 0.80,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      candidateReachesNonGlassRuntimeAnchor: false,
      exactRawEndpointsUsed: true,
      radiusRefinementRequiredBeforeContinuation: false,
      nextCombinedFrontierLocalizationRequired: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.lowSlopeContinuationPass18AY
    ).toMatchObject({
      qaRunNumber: 1118,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18AX',
      upstreamDirectionalAssumption: 'DROP_ONLY_QA_CONTINUATION',
      upstreamDirectionalRadiusMeters: 0.7005,
      lowSlopeRadiusMeters: 0.80,
      lowSlopeCandidateMode: 'BOTH',
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      trackedMatrix: [79,9,11],
      trustedComponentCountPerSide: 15,
      connectedComponentCountPerSide: 7,
      disconnectedComponentCountPerSide: 8,
      connectedMaterialsPerSide: {
        FloorConcrete00: 1,
        FloorConcrete02: 3,
        FloorSlope00: 3
      },
      connectedReachesNonGlassRuntimeAnchor: false,
      absoluteNearestBreakIsKnownHighBridgeDeadEnd: true,
      positiveHighRouteDistanceMeters: 1.061284827751945,
      negativeHighRouteDistanceMeters: 1.061284827751945,
      positiveLowRouteDistanceMeters: 1.1595324972956065,
      negativeLowRouteDistanceMeters: 1.1595324972956047,
      mirroredHighAndLowRouteBranchesLocalized: true,
      productionKccClassificationRequiredNext: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.postLowSlopeBranchKccPass18AZ
    ).toMatchObject({
      qaRunNumber: 1122,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      sourcePass: '18AY',
      branchCount: 4,
      directedWalkProbeCount: 8,
      directedJumpProbeCount: 8,
      humanRadiusMeters: 0.32,
      controllerOffsetMeters: 0.025,
      autostepMaxHeightMeters: 0.34,
      jumpSpeedMetersPerSecond: 8.2,
      gravityMetersPerSecond2: 28,
      highBranchPhysicalDistanceMeters: 1.061284827751945,
      highBranchHorizontalGapMeters: 1.0417180801668253,
      highBranchSignedTargetMinusSourceBoundaryYMeters: -0.202851983155254,
      lowBranchPositivePhysicalDistanceMeters: 1.1595324972956065,
      lowBranchNegativePhysicalDistanceMeters: 1.1595324972956047,
      lowBranchHorizontalGapMeters: 1.1595324972956065,
      lowBranchSignedTargetMinusSourceBoundaryYMeters: 0,
      highForwardNoJumpSucceedsBothSides: true,
      highReverseNoJumpSucceedsBothSides: false,
      highForwardJumpSucceedsBothSides: true,
      highReverseJumpSucceedsBothSides: true,
      highQaDirectionalClass: 'FORWARD_NO_JUMP_REVERSE_JUMP_REQUIRED',
      lowForwardNoJumpSucceedsBothSides: false,
      lowReverseNoJumpSucceedsBothSides: true,
      lowForwardJumpSucceedsBothSides: true,
      lowReverseJumpSucceedsBothSides: true,
      lowQaDirectionalClass: 'FORWARD_JUMP_REQUIRED_REVERSE_NO_JUMP',
      mirroredClassificationMatches: true,
      allNormalJumpProbesSucceed: true,
      exactRawDirectionalAttachmentDiagnosticAllowedNext: true,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.postLowSlopeDirectionalAttachmentPass18BA
    ).toMatchObject({
      qaRunNumber: 1126,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18AZ',
      trustedEndpointsUsedAsLinks: false,
      exactRawEndpointsUsed: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      upstreamDirectionalAssumption: 'DROP_ONLY_QA_CONTINUATION',
      upstreamDirectionalRadiusMeters: 0.7005,
      lowSlopeRadiusMeters: 0.80,
      sampledRadiiMeters: [0.30,0.50,0.60,0.70,0.80,1.00,1.20,1.50],
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      baselineHighSourceToTargetBothSides: false,
      baselineHighTargetToSourceBothSides: false,
      baselineLowSourceToTargetBothSides: false,
      baselineLowTargetToSourceBothSides: false,
      highForwardCommonAttachmentFoundThrough150: false,
      highReverseCommonAttachmentFoundThrough150: false,
      allKccDirectionsCommonAttachmentFoundThrough150: false,
      highEndpointLocalSearchRequiredNext: true,
      largerHighRadiusSweepAuthorizedBeforeLocalSearch: false,
      lowForwardLastSampledFailureRadiusMeters: 0.60,
      lowForwardFirstCommonSuccessRadiusMeters: 0.70,
      lowReverseLastSampledFailureRadiusMeters: 0.60,
      lowReverseFirstCommonSuccessRadiusMeters: 0.70,
      lowCommonThresholdLowerExclusiveMeters: 0.60,
      lowCommonThresholdUpperInclusiveMeters: 0.70,
      lowDirectionalAttachmentPreservedAt070: true,
      sampledMatrixStableAt79_9_11: true,
      sampledNonGlassCollateralObserved: false,
      lowRadiusRefinementRequiredBeforeContinuation: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.highLocalEndpointIsolationPass18BB
    ).toMatchObject({
      qaRunNumber: 1130,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BA',
      highLocalSearchRadiusMeters: 1.50,
      localRetreatTargetsMeters: [0,0.05,0.10,0.15,0.20,0.30,0.40,0.50,0.75,1.00,1.25,1.50],
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      positiveRawSourceSnapMeters: 0.4495178167408769,
      positiveRawTargetSnapMeters: 1.5146358772143251,
      negativeRawSourceSnapMeters: 0.4583432481595991,
      negativeRawTargetSnapMeters: 1.5236093815313405,
      selectedSourceCandidateCountPerSide: 1,
      selectedTargetCandidateCountPerSide: 3,
      positiveSourceFirstSuccessFound: false,
      positiveTargetFirstSuccessFound: false,
      negativeSourceFirstSuccessFound: false,
      negativeTargetFirstSuccessFound: false,
      rawSourceEndpointBestAmongSampledLocalCandidatesBothSides: true,
      rawTargetEndpointBestAmongSampledLocalCandidatesBothSides: true,
      localRetreatImprovesAttachment: false,
      sampledMatrixStableAt79_9_11: true,
      sampledNonGlassCollateralObserved: false,
      narrowExactRawRadiusSweepRequiredNext: true,
      broadRadiusExpansionAuthorized: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.highExactRawNarrowRadiusPass18BC
    ).toMatchObject({
      qaRunNumber: 1136,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BB',
      trustedEndpointsUsedAsLinks: false,
      exactRawEndpointsUsed: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      sampledRadiiMeters: [1.500,1.510,1.515,1.520,1.522,1.524,1.525,1.530,1.540,1.550],
      priorPositiveRawTargetSnapMeters: 1.5146358772143251,
      priorNegativeRawTargetSnapMeters: 1.5236093815313405,
      localRetreatImprovedAttachment: false,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      highForwardCommonAttachmentFoundThrough155: false,
      highReverseCommonAttachmentFoundThrough155: false,
      highBothCommonAttachmentFoundThrough155: false,
      sampledMatrixStableAt79_9_11: true,
      sampledNonGlassCollateralObserved: false,
      largerHorizontalRadiusDidNotResolveHighAttachment: true,
      offMeshVerticalExtentDiagnosticRequiredNext: true,
      furtherRadiusExpansionAuthorized: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.highOffMeshSearchExtentPass18BD
    ).toMatchObject({
      qaRunNumber: 1140,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BC',
      recastEndpointSearchModel: 'HORIZONTAL_RADIUS_XZ_VERTICAL_WALKABLE_CLIMB_Y',
      navigationCellHeightMeters: 0.10,
      navigationWalkableClimbVoxels: 4,
      walkableClimbWorldMeters: 0.40,
      fixedHorizontalRadiusMeters: 1.55,
      horizontalRadiiAtWalkableClimbMeters: [1.55,2.00,3.00,4.00],
      verticalHalfExtentsMeters: [0.40,0.50,0.60,0.75,1.00,1.25,1.50,1.60,2.00],
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      positiveSourceHorizontalDeltaMeters: 0.43343928477235505,
      positiveSourceVerticalDeltaMeters: 0.11914971247768058,
      positiveTargetHorizontalDeltaMeters: 1.4735320665755938,
      positiveTargetVerticalDeltaMeters: 0.3504641056060791,
      negativeSourceHorizontalDeltaMeters: 0.4432570201896018,
      negativeSourceVerticalDeltaMeters: 0.1166265286550483,
      negativeTargetHorizontalDeltaMeters: 1.4833485747661919,
      negativeTargetVerticalDeltaMeters: 0.34794044494628906,
      sourceFoundWithin155x040BothSides: true,
      targetFoundWithin155x040BothSides: true,
      allEndpointsFoundAtFrozenWalkableClimb: true,
      horizontalExpansionChangesProjection: false,
      verticalExpansionRequiredForProjection: false,
      simpleEndpointSearchExtentExplainsAttachmentFailure: false,
      intendedNavIslandIdentityDiagnosticRequiredNext: true,
      furtherRadiusExpansionAuthorized: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.highNavIslandIdentityPass18BE
    ).toMatchObject({
      qaRunNumber: 1146,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BD',
      rawEndpointHorizontalRadiusMeters: 1.55,
      rawEndpointVerticalHalfExtentMeters: 0.40,
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      positiveRawSourcePolyRef: 1311,
      positiveRawTargetPolyRef: 1311,
      negativeRawSourcePolyRef: 1220,
      negativeRawTargetPolyRef: 1220,
      rawSourceAndTargetProjectToSamePolyBothSides: true,
      positiveTrustedSourcePolyRef: 1314,
      negativeTrustedSourcePolyRef: 1218,
      rawSourcePolyDiffersFromTrustedSourcePolyBothSides: true,
      rawSourceMutuallyReachableWithTrustedSourceBothSides: true,
      rawTargetMutuallyReachableWithTrustedTargetBothSides: false,
      positiveTrustedTargetLowLevelProjectionSuccess: false,
      negativeTrustedTargetLowLevelProjectionSuccess: false,
      rawSourceMutualOwnGlassAnchorCountPerSide: 3,
      rawTargetMutualOwnGlassAnchorCountPerSide: 3,
      trustedSourceMutualOwnGlassAnchorCountPerSide: 3,
      legacyTrustedTargetMutualAnchorCountPerSide: 0,
      rawTargetProjectsToSourceSideNavIslandBothSides: true,
      highExactRawLinkFailureExplainedByWrongTargetIslandProjection: true,
      diagnosticTrustedRepresentativeCanFalsePositiveOnClosestPointFallback: true,
      directLowLevelRepresentativeValidityAuditRequiredNext: true,
      furtherRadiusExpansionAuthorized: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.directRepresentativeValidityPass18BF
    ).toMatchObject({
      qaRunNumber: 1154,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      sourcePass: '18BE',
      trustedSnapMeters: 0.30,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      componentCountPerSide: 58,
      legacyTrustedCountPerSide: 15,
      directTrustedCountPerSide: 8,
      legacySelectionQueryFailureCountPerSide: 7,
      legacyComponentFalsePositiveCountPerSide: 7,
      falsePositiveBridgeMetalCountPerSide: 6,
      falsePositiveFloorConcrete02CountPerSide: 1,
      directTrustedFloorConcrete02CountPerSide: 3,
      directTrustedFloorSlope00CountPerSide: 3,
      directTrustedFloorConcrete00CountPerSide: 1,
      directTrustedFloorConcrete01CountPerSide: 1,
      highTargetLegacyTrustedButDirectInvalidBothSides: true,
      diagnosticClosestPointFalsePositiveConfirmed: true,
      directLowLevelValidityPolicyRequiredForFurtherFrontierQa: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.directValidFrontierPass18BG
    ).toMatchObject({
      qaRunNumber: 1154,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      sourcePass: '18BF',
      directRepresentativePolicy:
        'NavMeshQuery.findClosestPoint_SUCCESS_REQUIRED_AND_SNAP_LE_0.30',
      upstreamDirectionalAssumption: 'DROP_ONLY_QA_CONTINUATION',
      lowBranchRadiusMeters: 0.70,
      trustedEndpointsUsedAsLinks: false,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      directValidCountPerSide: 8,
      baselineConnectedFromOwnGlassCountPerSide: 7,
      lowLinkedReachedDirectedPairs: 79,
      lowLinkedWeakComponentCount: 9,
      lowLinkedStronglyConnectedComponentCount: 11,
      lowLinkedConnectedFromOwnGlassCountPerSide: 8,
      lowLinkedDisconnectedDirectValidCountPerSide: 0,
      lowLinkedReachesNonGlassRuntimeAnchor: false,
      highTargetDirectValidBothSides: false,
      allDirectValidDownstreamComponentsForwardConnectedAfterLowLink: true,
      noDirectValidHighTargetNavIslandExists: true,
      highTargetNavmeshRasterizationEligibilityDiagnosticRequiredNext: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.highTargetRasterizationPass18BH
    ).toMatchObject({
      qaRunNumber: 1158,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BG',
      navigationCellSizeMeters: 0.18,
      navigationCellHeightMeters: 0.10,
      navigationMaxSlopeDegrees: 52,
      navigationWalkableHeightVoxels: 12,
      navigationWalkableClimbVoxels: 4,
      navigationWalkableRadiusVoxels: 2,
      minRegionArea: 3,
      mergeRegionArea: 8,
      targetVertexCount: 24,
      targetTriangleCount: 8,
      targetUpwardWalkableTriangleCount: 8,
      targetDownwardTriangleCount: 0,
      targetDegenerateTriangleCount: 0,
      targetMinNormalY: 1,
      targetMaxNormalY: 1,
      targetMinSlopeDegrees: 0,
      targetMaxSlopeDegrees: 0,
      sourceOnlyBuildSuccessBothSides: true,
      sourceOnlyDirectTrustedBothSides: true,
      targetOnlyBuildSuccessBothSides: false,
      targetOnlyFailure:
        'Recast navmesh generation failed: Failed to create Detour navmesh data',
      sourcePlusTargetBuildSuccessBothSides: true,
      sourcePlusTargetDirectTrustedTargetBothSides: false,
      sideSourceSoupDirectTrustedTargetBothSides: false,
      fullSourceSoupDirectTrustedTargetBothSides: false,
      targetTriangleWindingOrSlopeExplainsFailure: false,
      surroundingGeometryInteractionRequiredForFailure: false,
      targetMeshIntrinsicallyFailsProductionNavGeneration: true,
      erosionRegionResolutionIsolationRequiredNext: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .highTargetRecastParameterIsolationPass18BI
    ).toMatchObject({
      qaRunNumber: 1162,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BH',
      productionConfigUnchanged: true,
      diagnosticVariantsOnly: true,
      productionCellSizeMeters: 0.18,
      productionWalkableRadiusVoxels: 2,
      productionPhysicalErosionRadiusMeters: 0.36,
      productionMinRegionArea: 3,
      productionMergeRegionArea: 8,
      productionFailsBothSides: true,
      productionNoRegionFilterSucceedsBothSides: false,
      radius1SucceedsBothSides: true,
      radius1NoRegionFilterSucceedsBothSides: true,
      radius0SucceedsBothSides: true,
      radius0NoRegionFilterSucceedsBothSides: true,
      hiresCellSizeMeters: 0.09,
      hiresSamePhysicalErosionWalkableRadiusVoxels: 4,
      hiresSamePhysicalErosionRadiusMeters: 0.36,
      hiresSamePhysicalErosionSucceedsBothSides: true,
      hiresSamePhysicalErosionNoRegionSucceedsBothSides: true,
      hiresRadius0SucceedsBothSides: true,
      hiresRadius0NoRegionFilterSucceedsBothSides: true,
      successfulVariantDirectTrustedBothSides: true,
      regionFilteringExplainsProductionFailure: false,
      physicalErosionMagnitudeAloneExplainsProductionFailure: false,
      coarseRasterResolutionAndVoxelErosionCouplingImplicated: true,
      constantPhysicalErosionResolutionSweepRequiredNext: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .highTargetConstantErosionResolutionPass18BJ
    ).toMatchObject({
      qaRunNumber: 1166,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BI',
      productionConfigUnchanged: true,
      diagnosticVariantsOnly: true,
      nominalPhysicalErosionRadiusMeters: 0.36,
      regionFilteringFixedToProduction: true,
      minRegionArea: 3,
      mergeRegionArea: 8,
      sampledCellSizesMeters: [0.18,0.12,0.09,0.072,0.06],
      sampledWalkableRadiusVoxels: [2,3,4,5,6],
      production018Radius2FailsBothSides: true,
      constantErosion012Radius3FailsBothSides: true,
      constantErosion009Radius4SucceedsBothSides: true,
      constantErosion0072Radius5SucceedsBothSides: true,
      constantErosion006Radius6SucceedsBothSides: true,
      firstSampledDirectTrustedSuccessCellSizeMeters: 0.09,
      firstSampledDirectTrustedSuccessWalkableRadiusVoxels: 4,
      coarsestSampledFailureCellSizeMeters: 0.12,
      positive009SnapMeters: 0.10775650512549592,
      negative009SnapMeters: 0.15211610768324008,
      constantPhysicalErosionResolutionDependenceConfirmed: true,
      integerVoxelConstantErosionSweepHasNoIntermediateSampleBetween012And009: true,
      continuousFootprintClearanceDiagnosticRequiredNext: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.highTargetFootprintClearancePass18BK
    ).toMatchObject({
      qaRunNumber: 1171,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BJ',
      productionConfigUnchanged: true,
      sourceGeometryUnchanged: true,
      nominalPhysicalErosionRadiusMeters: 0.36,
      subdivisions: 160,
      targetMaterial: 'FloorConcrete02',
      targetYRangeMeters: [3,3],
      uniqueEdgeCountPerSide: 16,
      boundarySegmentCountPerSide: 8,
      internalSharedEdgeCountPerSide: 8,
      nonManifoldEdgeCountPerSide: 0,
      sampleCountPerSide: 104328,
      positiveSampledMaximumInteriorClearanceMeters: 0.42781092520205705,
      negativeSampledMaximumInteriorClearanceMeters: 0.42781092520205705,
      sampledMaximumInteriorClearanceSymmetric: true,
      clearanceMarginOverErosionMeters: 0.06781092520205706,
      productionCellSizeMeters: 0.18,
      productionHalfCellMeters: 0.09,
      failedConstantErosionCellSizeMeters: 0.12,
      failedConstantErosionHalfCellMeters: 0.06,
      successfulConstantErosionCellSizeMeters: 0.09,
      successfulConstantErosionHalfCellMeters: 0.045,
      marginBelowProductionHalfCell: true,
      marginBelowFailed012HalfCell: false,
      marginAboveSuccessful009HalfCell: true,
      continuousFootprintSurvivesNominalErosion: true,
      coarseRasterCanEraseNarrowResidualFootprint: true,
      localNavigationFootprintSensitivityDiagnosticRequiredNext: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .highTargetLocalFootprintSensitivityPass18BL
    ).toMatchObject({
      qaRunNumber: 1175,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BK',
      productionConfigUnchanged: true,
      sourceGeometryUnchanged: true,
      diagnosticProxyOnly: true,
      proxyScalingMode: 'XZ_UNIFORM_ABOUT_BK_CLEARANCE_CENTER',
      productionCellSizeMeters: 0.18,
      productionWalkableRadiusVoxels: 2,
      nominalPhysicalErosionRadiusMeters: 0.36,
      baseClearanceMeters: 0.42781092520205705,
      sampledScaleFactors: [
        1.00,1.02,1.04,1.05,1.06,1.08,1.10,1.12,1.15,1.20,1.25,1.30
      ],
      scale120FailsBothSides: true,
      scale125SourceDirectTrustedBothSides: true,
      scale130SourceDirectTrustedBothSides: true,
      firstCommonSourceDirectTrustedScale: 1.25,
      firstCommonPredictedClearanceMeters: 0.5347636565025713,
      firstCommonPredictedResidualAfterErosionMeters: 0.1747636565025713,
      firstCommonEquivalentRadialExpansionMeters: 0.10695273130051426,
      positiveScale125SourceSnapMeters: 0.27660899918483217,
      negativeScale125SourceSnapMeters: 0.24186590277719566,
      positiveScale130SourceSnapMeters: 0.11120592163976542,
      negativeScale130SourceSnapMeters: 0.10118254185490315,
      mirroredFirstSuccessScaleMatches: true,
      localProxyCanRecoverProductionRasterization: true,
      fineScaleSweepRequiredNext: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      trustedNonLocalEndpointUsed: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .highTargetFineFootprintScalePass18BM
    ).toMatchObject({
      qaRunNumber: 1179,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BL',
      coarseScaleBracket: [1.20,1.25],
      productionConfigUnchanged: true,
      sourceGeometryUnchanged: true,
      diagnosticProxyOnly: true,
      proxyScalingMode: 'XZ_UNIFORM_ABOUT_BK_CLEARANCE_CENTER',
      productionCellSizeMeters: 0.18,
      productionWalkableRadiusVoxels: 2,
      nominalPhysicalErosionRadiusMeters: 0.36,
      baseClearanceMeters: 0.42781092520205705,
      sampledScaleFactors: [
        1.200,1.205,1.210,1.215,1.220,1.225,
        1.230,1.235,1.240,1.245,1.250
      ],
      positiveFirstSourceDirectTrustedScale: 1.240,
      negativeFirstSourceDirectTrustedScale: 1.235,
      lastCommonFailureScale: 1.235,
      firstCommonSourceDirectTrustedScale: 1.240,
      commonThresholdLowerExclusiveScale: 1.235,
      commonThresholdUpperInclusiveScale: 1.240,
      firstCommonPredictedClearanceMeters: 0.5304855472505507,
      firstCommonPredictedResidualAfterErosionMeters: 0.17048554725055076,
      firstCommonEquivalentRadialExpansionMeters: 0.10267462204849369,
      positiveScale124SourceSnapMeters: 0.10091274854152288,
      negativeScale124SourceSnapMeters: 0.10003603228522037,
      mirroredFirstSuccessScaleMatches: false,
      commonSourceDirectValidityResolvedAt005ScaleStep: true,
      localProxyCanRecoverProductionRasterization: true,
      terminalScaleSweepRequiredNext: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      trustedNonLocalEndpointUsed: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .highTargetTerminalFootprintScalePass18BN
    ).toMatchObject({
      qaRunNumber: 1184,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BM',
      fineScaleBracket: [1.235,1.240],
      productionConfigUnchanged: true,
      sourceGeometryUnchanged: true,
      diagnosticProxyOnly: true,
      proxyScalingMode: 'XZ_UNIFORM_ABOUT_BK_CLEARANCE_CENTER',
      productionCellSizeMeters: 0.18,
      productionWalkableRadiusVoxels: 2,
      nominalPhysicalErosionRadiusMeters: 0.36,
      baseClearanceMeters: 0.42781092520205705,
      sampledScaleFactors: [1.235,1.236,1.237,1.238,1.239,1.240],
      positiveFirstSourceDirectTrustedScale: 1.237,
      negativeFirstSourceDirectTrustedScale: 1.235,
      lastCommonFailureScale: 1.236,
      firstCommonSourceDirectTrustedScale: 1.237,
      commonThresholdLowerExclusiveScale: 1.236,
      commonThresholdUpperInclusiveScale: 1.237,
      firstCommonPredictedClearanceMeters: 0.5292021144749446,
      firstCommonPredictedResidualAfterErosionMeters: 0.1692021144749446,
      firstCommonEquivalentRadialExpansionMeters: 0.10139118927288757,
      positiveScale1237SourceSnapMeters: 0.1695613439929668,
      negativeScale1237SourceSnapMeters: 0.11637334113146416,
      mirroredFirstSuccessScaleMatches: false,
      commonSourceDirectValidityResolvedAt001ScaleStep: true,
      furtherScaleRefinementRequiredBeforeIntegration: false,
      fullChainProxyIntegrationDiagnosticRequiredNext: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      trustedNonLocalEndpointUsed: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.highProxyFullChainIntegrationPass18BO
    ).toMatchObject({
      qaRunNumber: 1188,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BN',
      productionConfigUnchanged: true,
      sourceGeometryUnchanged: true,
      diagnosticProxyOnly: true,
      highTargetProxyScale: 1.237,
      highTargetProxyMode: 'QA_NAV_MESH_REPLACEMENT_ONLY',
      trustedEndpointsUsedAsLinks: false,
      exactRawEndpointsUsed: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      upstreamDirectionalAssumption: 'DROP_ONLY_QA_CONTINUATION',
      upstreamDirectionalRadiusMeters: 0.7005,
      lowSlopeRadiusMeters: 0.80,
      sampledBranchRadiiMeters: [0.30,0.50,0.60,0.70,0.80,1.00,1.20,1.50],
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      positiveHighTargetRepresentativeSnapMeters: 0,
      negativeHighTargetRepresentativeSnapMeters: 0,
      lowForwardFirstCommonSuccessRadiusMeters: 0.70,
      lowReverseFirstCommonSuccessRadiusMeters: 0.70,
      highForwardCommonSuccessThrough150Meters: false,
      highReverseCommonSuccessThrough150Meters: false,
      allKccDirectionsCommonSuccessThrough150Meters: false,
      trackedMatrixUnchangedAcrossSweep: true,
      candidateReachesNonGlassRuntimeAnchor: false,
      proxyRestoresHighTargetRepresentativeAvailability: true,
      proxyRestoresExactRawHighLinkAttachment: false,
      rawHighEndpointProjectionIdentityDiagnosticRequiredNext: true,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.highProxyRawEndpointIdentityPass18BP
    ).toMatchObject({
      qaRunNumber: 1193,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BO',
      productionConfigUnchanged: true,
      sourceGeometryUnchanged: true,
      diagnosticProxyOnly: true,
      highTargetProxyScale: 1.237,
      highTargetProxyMode: 'QA_NAV_MESH_REPLACEMENT_ONLY',
      rawEndpointHorizontalRadiusMeters: 1.55,
      rawEndpointVerticalHalfExtentMeters: 0.40,
      representativeBoundedHalfExtentAttemptsMeters: [0.30,0.50,1.00,1.55,2.00],
      positiveRawSourceProjectionPolyRef: 1310,
      positiveRawTargetProjectionPolyRef: 1310,
      positiveSourceRepresentativeProjectionPolyRef: 1310,
      positiveTargetRepresentativeProjectionPolyRef: 1343,
      positiveRawSourceSnapMeters: 0.10086465161125907,
      positiveRawTargetSnapMeters: 0.7091240505612121,
      positiveTargetRepresentativeDirectSnapMeters: 3.253249846746704,
      positiveTargetRepresentativeFirstBoundedSuccessHalfExtentMeters: 1.55,
      negativeRawSourceProjectionPolyRef: 1222,
      negativeRawTargetProjectionPolyRef: 1222,
      negativeSourceRepresentativeProjectionPolyRef: 1220,
      negativeTargetRepresentativeDirectProjectionSuccess: false,
      negativeRawSourceSnapMeters: 0.4583432481595991,
      negativeRawTargetSnapMeters: 1.5236093815313405,
      positiveRawTargetProjectsToSourcePoly: true,
      negativeRawTargetProjectsToSourceIsland: true,
      positiveRawTargetOnSourceIsland: true,
      negativeRawTargetOnSourceIsland: true,
      positiveRawTargetOnIntendedTargetIsland: false,
      negativeRawTargetOnIntendedTargetIslandResolved: false,
      positiveLegacyTargetRepresentativeIsDirectTrusted: false,
      negativeLegacyTargetRepresentativeIsDirectTrusted: false,
      fullChainProxyPreservesDirectTrustedHighTargetIslandBothSides: false,
      fullChainProxyContextInvalidatesIsolatedTargetValidity: true,
      proxyContextIsolationDiagnosticRequiredNext: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      trustedNonLocalEndpointUsed: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.highProxyContextIsolationPass18BQ
    ).toMatchObject({
      qaRunNumber: 1199,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BP',
      productionConfigUnchanged: true,
      sourceGeometryUnchanged: true,
      diagnosticProxyOnly: true,
      proxyScalingMode: 'XZ_UNIFORM_ABOUT_BK_CLEARANCE_CENTER',
      highTargetProxyScale: 1.237,
      contextOrder: [
        'TARGET_ONLY',
        'HIGH_SOURCE_PLUS_TARGET',
        'SIDE_ROUTE_SOUP',
        'BOTH_ROUTE_SOUP',
        'FULL_PARTIAL_STAGE_CONTEXT'
      ],
      trustedSnapMeters: 0.30,
      rawEndpointHorizontalRadiusMeters: 1.55,
      rawEndpointVerticalHalfExtentMeters: 0.40,
      positiveInvalidTargetSourceContexts: [
        'HIGH_SOURCE_PLUS_TARGET',
        'SIDE_ROUTE_SOUP',
        'FULL_PARTIAL_STAGE_CONTEXT'
      ],
      positiveInvalidTargetProxyContexts: ['HIGH_SOURCE_PLUS_TARGET'],
      positiveFirstInvalidTargetSourceContext: 'HIGH_SOURCE_PLUS_TARGET',
      positiveFirstInvalidTargetProxyContext: 'HIGH_SOURCE_PLUS_TARGET',
      positiveTargetSourceValidityRecoversAfterInvalid: true,
      positiveTargetProxyValidityRecoversAfterInvalid: true,
      positiveFullTargetSourceDirectTrusted: false,
      positiveFullTargetProxyDirectTrusted: true,
      positiveFullRawTargetSnapMeters: 0.7091240505612121,
      positiveFullRawTargetMutualWithSource: true,
      positiveFullRawTargetMutualWithTargetProxy: false,
      negativeInvalidTargetSourceContexts: [
        'SIDE_ROUTE_SOUP',
        'BOTH_ROUTE_SOUP'
      ],
      negativeInvalidTargetProxyContexts: [],
      negativeFirstInvalidTargetSourceContext: 'SIDE_ROUTE_SOUP',
      negativeFirstInvalidTargetProxyContext: null,
      negativeTargetSourceValidityRecoversAfterInvalid: true,
      negativeTargetProxyValidityRecoversAfterInvalid: false,
      negativeFullTargetSourceDirectTrusted: true,
      negativeFullTargetProxyDirectTrusted: true,
      negativeFullRawTargetSnapMeters: 1.5236093815313405,
      negativeFullRawTargetMutualWithSource: true,
      negativeFullRawTargetMutualWithTargetProxy: false,
      monotonicContextInvalidationModelSupported: false,
      contextDependentValidityRecoveryObserved: true,
      rawTargetStillAbsorbedBySourceIslandBothSides: true,
      individualGeometryContributorIsolationRequiredNext: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      trustedNonLocalEndpointUsed: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
    });

    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.highProxySingleComponentContributorsPass18BR
    ).toMatchObject({
      qaRunNumber: 1204,
      diagnosticOnly: true,
      runtimePromotionAuthorized: false,
      gameplayDirectionalityResolved: false,
      gameplayJumpRequirementResolved: false,
      sourcePass: '18BQ',
      productionConfigUnchanged: true,
      sourceGeometryUnchanged: true,
      diagnosticProxyOnly: true,
      proxyScalingMode: 'XZ_UNIFORM_ABOUT_BK_CLEARANCE_CENTER',
      highTargetProxyScale: 1.237,
      baselineContext: 'HIGH_SOURCE_PLUS_TARGET',
      additiveContextMode: 'ONE_ROUTE_COMPONENT_AT_A_TIME',
      candidateCountPerSide: 57,
      positiveBaselineTargetSourceDirectTrusted: false,
      positiveBaselineTargetProxyDirectTrusted: false,
      positiveSourceValidityFlipCount: 17,
      positiveProxyValidityFlipCount: 24,
      positiveAnyValidityFlipCount: 27,
      positiveStateCounts: {
        source0Proxy0: 30,
        source1Proxy1: 14,
        source0Proxy1: 10,
        source1Proxy0: 3
      },
      positiveRawTargetMovesToProxyIslandCount: 2,
      positiveBestConstructiveContributorId:
        'FldObj_Temple01_PntSet_mesh61_low_1__BridgeMetal00|FldObj_Temple01_PntSet_BridgeMetal00|c63',
      positiveBestConstructiveContributorMaterial:
        'FldObj_Temple01_PntSet_BridgeMetal00',
      positiveBestConstructiveContributorYRange: [5.1,5.1],
      positiveBestConstructiveRawTargetSnapMeters: 0.3791953963411906,
      positiveOtherConstructiveContributorId:
        'FldObj_Temple01_PntSet_mesh61_low_1__BridgeMetal00|FldObj_Temple01_PntSet_BridgeMetal00|c47',
      positiveOtherConstructiveRawTargetSnapMeters: 0.5157739997726296,
      negativeBaselineTargetSourceDirectTrusted: true,
      negativeBaselineTargetProxyDirectTrusted: true,
      negativeSourceValidityFlipCount: 16,
      negativeProxyValidityFlipCount: 5,
      negativeAnyValidityFlipCount: 18,
      negativeStateCounts: {
        source0Proxy1: 13,
        source1Proxy0: 2,
        source0Proxy0: 3,
        source1Proxy1: 39
      },
      negativeRawTargetMovesToProxyIslandCount: 7,
      negativeBestConstructiveContributorId:
        'FldObj_Temple01_PntSet_mesh61_low_1__BridgeMetal00|FldObj_Temple01_PntSet_BridgeMetal00|c148',
      negativeBestConstructiveContributorMaterial:
        'FldObj_Temple01_PntSet_BridgeMetal00',
      negativeBestConstructiveContributorYRange: [5.1,5.1],
      negativeBestConstructiveRawTargetSnapMeters: 0.3643649740994081,
      negativeConstructiveContributorIncludesGrassFloor: true,
      negativeConstructiveContributorIncludesLowSlope: true,
      singleComponentCanMoveRawTargetToProxyIslandBothSides: true,
      contributionEffectsAreMaterialAndContextDependent: true,
      bestConstructiveContributorSuppressionScanRequiredNext: true,
      globalRecastSettingsChanged: false,
      broadFrontierLinkAuthorized: false,
      trustedNonLocalEndpointUsed: false,
      productionOffMeshLinkAuthorized: false,
      activationBlockerCleared: false
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
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.rawBoundaryRadiusSweepPass18N
    ).toMatchObject({
      qaRunNumber: 945,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      testedRadiiMeters: [0.30, 0.36, 0.45, 0.60, 1.00, 1.50, 2.00, 3.00, 4.00, 6.00],
      physicalEndpointCount: 4,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      bothSidesFailThrough060Meters: true,
      negativeFirstSuccessfulRadiusMeters: 1.0,
      negativeRemainsBidirectionallyConnectedThrough600Meters: true,
      positiveSuccessfulRadiusMetersAtOrBelow600: null,
      mirroredSourceProducesAsymmetricRawBoundaryAttachment: true,
      globalRawBoundaryRadiusSolutionFound: false,
      radiusIncreaseIsSafePromotionStrategy: false,
      localConnectorSemanticsValidated: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.endpointHybridPass18O
    ).toMatchObject({
      qaRunNumber: 949,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      trustedSnapMeters: 0.30,
      trustedLinkRadiusMeters: 0.30,
      rawRadiiMeters: [0.30, 1.00, 6.00],
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      positiveOnlyPersistentRawAttachmentBlocker:
        'GRATE_TO_FLOORCONCRETE00_INGRESS',
      finalHalfMeterRawAttachmentWorksBothSidesAt100: true,
      mirroredAsymmetryLocalizedToPositiveIngress: true,
      radiusIncreaseStillNotPromotionAuthority: true,
      localConnectorSemanticsValidated: false,
      originalGrateDirectionalityResolved: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.endpointHybridPass18O.positive
    ).toMatchObject({
      at030RawIngressTrustedFinalConnected: false,
      at030TrustedIngressRawFinalConnected: false,
      at100RawIngressTrustedFinalConnected: false,
      at100TrustedIngressRawFinalConnected: true,
      at100AllRawConnected: false,
      at100AllTrustedConnected: true,
      at600RawIngressTrustedFinalConnected: false,
      at600TrustedIngressRawFinalConnected: true,
      at600AllRawConnected: false,
      rawIngressAttachmentResolvedAtOrBelow600: false,
      rawFinalAttachmentResolvedAt100: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.endpointHybridPass18O.negative
    ).toMatchObject({
      at030RawIngressTrustedFinalConnected: false,
      at030TrustedIngressRawFinalConnected: false,
      at100RawIngressTrustedFinalConnected: true,
      at100TrustedIngressRawFinalConnected: true,
      at100AllRawConnected: true,
      at100AllTrustedConnected: true,
      at600RawIngressTrustedFinalConnected: true,
      at600TrustedIngressRawFinalConnected: true,
      at600AllRawConnected: true,
      rawIngressAttachmentResolvedAt100: true,
      rawFinalAttachmentResolvedAt100: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.ingressEndpointIsolationPass18P
    ).toMatchObject({
      qaRunNumber: 954,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      trustedSnapMeters: 0.30,
      trustedFinalLinkRadiusMeters: 0.30,
      rawIngressRadiiMeters: [0.30, 1.00, 6.00],
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      persistentPositiveAttachmentBlocker:
        'POSITIVE_Z_GRATE_SIDE_RAW_INGRESS_START',
      positiveFloorConcrete00RawIngressEndWorksAt100: true,
      negativeGrateSideRawStartWorksDespiteLargerClosestPointSnap: true,
      closestPointSnapMagnitudeExplainsAsymmetry: false,
      mirroredAsymmetryLocalizedToPositiveGrateSideStart: true,
      radiusIncreaseStillNotPromotionAuthority: true,
      localConnectorSemanticsValidated: false,
      originalGrateDirectionalityResolved: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.ingressEndpointIsolationPass18P.positive
    ).toMatchObject({
      rawGrateSideStartClosestPointSnapMeters: 0.6472549947142026,
      rawFloorConcrete00SideEndClosestPointSnapMeters: 0.3420302065480327,
      at030RawStartRawEndConnected: false,
      at030RawStartTrustedEndConnected: false,
      at030TrustedStartRawEndConnected: false,
      at030TrustedStartTrustedEndConnected: true,
      at100RawStartRawEndConnected: false,
      at100RawStartTrustedEndConnected: false,
      at100TrustedStartRawEndConnected: true,
      at100TrustedStartTrustedEndConnected: true,
      at600RawStartRawEndConnected: false,
      at600RawStartTrustedEndConnected: false,
      at600TrustedStartRawEndConnected: true,
      rawGrateSideStartAttachmentResolvedAtOrBelow600: false,
      rawFloorConcrete00SideEndAttachmentResolvedAt100: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.ingressEndpointIsolationPass18P.negative
    ).toMatchObject({
      rawGrateSideStartClosestPointSnapMeters: 0.7401798316876944,
      rawFloorConcrete00SideEndClosestPointSnapMeters: 0.5103195238057004,
      at030RawStartRawEndConnected: false,
      at030TrustedStartTrustedEndConnected: true,
      at100RawStartRawEndConnected: true,
      at100RawStartTrustedEndConnected: true,
      at100TrustedStartRawEndConnected: true,
      at100TrustedStartTrustedEndConnected: true,
      rawGrateSideStartAttachmentResolvedAt100: true,
      rawFloorConcrete00SideEndAttachmentResolvedAt100: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.positiveIngressStartRetreatPass18Q
    ).toMatchObject({
      qaRunNumber: 962,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      rawIngressRadiusMeters: 1.00,
      trustedFinalLinkRadiusMeters: 0.30,
      positiveStartTravelMeters: 1.9872737049434641,
      testedFractionCount: 13,
      rawStartConnected: false,
      firstSuccessfulFraction: 0.05,
      firstSuccessfulMovedMeters: 0.0993636852471732,
      firstSuccessfulStartSnapMeters: 0.5839682784207668,
      allTestedFractionsAfterZeroConnected: true,
      positiveRawStartSnapMeters: 0.6472549947142026,
      positiveTrustedStartSnapMeters: 0,
      positiveRawEndSnapMeters: 0.3420302065480327,
      negativeRawControlConnected: true,
      coarseRetreatThresholdLocalizedBelow100Millimeters: true,
      closestPointSnapMagnitudeAloneStillNotExplanatory: true,
      localConnectorSemanticsValidated: false,
      originalGrateDirectionalityResolved: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.positiveIngressStartFineSweepPass18R
    ).toMatchObject({
      qaRunNumber: 962,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      rawIngressRadiusMeters: 1.00,
      trustedFinalLinkRadiusMeters: 0.30,
      sweepStartMeters: 0,
      sweepEndMeters: 0.100,
      sweepStepMeters: 0.005,
      testedOffsetCount: 21,
      positiveStartTravelMeters: 1.9872737049434641,
      lastFailedOffsetMeters: 0.035,
      firstSuccessfulOffsetMeters: 0.040,
      lastFailedFraction: 0.017612068188159174,
      firstSuccessfulFraction: 0.020128077929324768,
      lastFailedStartSnapMeters: 0.6459551748278465,
      firstSuccessfulStartSnapMeters: 0.6424489783331878,
      lastFailedProjectedPoint: [
        -25.715261459350586,
        7.600000381469727,
        31.51282501220703
      ],
      firstSuccessfulProjectedPoint: [
        -25.715261459350586,
        7.5,
        30.612831115722656
      ],
      thresholdBracketWidthMeters: 0.005,
      attachmentTransitionBetween35And40Millimeters: true,
      allOffsetsAtOrAbove40MillimetersConnectedThrough100Millimeters: true,
      closestPointProjectionChangesDiscontinuouslyAtThreshold: true,
      scalarSnapDistanceThresholdExplainsTransition: false,
      navPolyIdentityBoundaryStronglyIndicated: true,
      negativeRawControlConnected: true,
      minimumFaithfulRuntimeCorrectionResolved: false,
      localConnectorSemanticsValidated: false,
      originalGrateDirectionalityResolved: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localRawChainRadiusPass18S
    ).toMatchObject({
      qaRunNumber: 967,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      positiveRetreatMeters: 0.040,
      trustedControlRadiusMeters: 0.30,
      testedRadiiMeters: [0.30, 0.36, 0.45, 0.60, 0.75, 0.90, 1.00],
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      mirroredLocalThresholdsMatch: true,
      positiveFortyMillimeterRetreatRestoresMirroredRadiusBehavior: true,
      ingressThresholdBracketMeters: [0.60, 0.75],
      finalThresholdBracketMeters: [0.75, 0.90],
      minimumAttachmentRadiiFineResolved: false,
      fullMatrixCollateralValidated: false,
      originalGrateDirectionalityResolved: false,
      localConnectorSemanticsValidated: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localRawChainRadiusPass18S.positive
    ).toMatchObject({
      localIngressStartSnapMeters: 0.6424489783331878,
      rawIngressEndSnapMeters: 0.3420302065480327,
      rawFinalStartSnapMeters: 0.6870675165796135,
      rawFinalEndSnapMeters: 0.9125402509938235,
      firstSuccessfulIngressRadiusMeters: 0.75,
      firstSuccessfulFinalRadiusMeters: 0.90,
      combinedIngressRadiusMeters: 0.75,
      combinedFinalRadiusMeters: 0.90,
      combinedBidirectionallyReached: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localRawChainRadiusPass18S.negative
    ).toMatchObject({
      localIngressStartSnapMeters: 0.7401798316876944,
      rawIngressEndSnapMeters: 0.5103195238057004,
      rawFinalStartSnapMeters: 0.688674567555729,
      rawFinalEndSnapMeters: 0.9031123713745141,
      firstSuccessfulIngressRadiusMeters: 0.75,
      firstSuccessfulFinalRadiusMeters: 0.90,
      combinedIngressRadiusMeters: 0.75,
      combinedFinalRadiusMeters: 0.90,
      combinedBidirectionallyReached: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localRawChainFineRadiusPass18T
    ).toMatchObject({
      qaRunNumber: 972,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      positiveRetreatMeters: 0.040,
      testedIngressRadiiMeters: [0.60, 0.625, 0.65, 0.675, 0.70, 0.725, 0.75],
      testedFinalRadiiMeters: [0.75, 0.775, 0.80, 0.825, 0.85, 0.875, 0.90],
      finalThresholdMatchesBothSides: true,
      ingressThresholdStillAsymmetricAt25MillimeterResolution: true,
      commonMirroredCandidateIngressRadiusMeters: 0.725,
      commonMirroredCandidateFinalRadiusMeters: 0.85,
      commonMirroredCandidateUsesOnlyLocalRawEndpointsExceptPositiveFortyMillimeterStart: true,
      commonMirroredCandidateBidirectionallyFeasibleBothSides: true,
      exactMinimumAttachmentRadiiResolved: false,
      fullMatrixCollateralValidated: false,
      pathShapeValidated: false,
      originalGrateDirectionalityResolved: false,
      localConnectorSemanticsValidated: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localRawChainFineRadiusPass18T.positive
    ).toMatchObject({
      firstSuccessfulIngressRadiusMeters: 0.65,
      firstSuccessfulFinalRadiusMeters: 0.85,
      combinedIngressRadiusMeters: 0.65,
      combinedFinalRadiusMeters: 0.85,
      combinedBidirectionallyReached: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localRawChainFineRadiusPass18T.negative
    ).toMatchObject({
      firstSuccessfulIngressRadiusMeters: 0.725,
      firstSuccessfulFinalRadiusMeters: 0.85,
      combinedIngressRadiusMeters: 0.725,
      combinedFinalRadiusMeters: 0.85,
      combinedBidirectionallyReached: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.localCandidateCollateralPass18U
    ).toMatchObject({
      qaRunNumber: 977,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      positiveRetreatMeters: 0.040,
      ingressRadiusMeters: 0.725,
      finalRadiusMeters: 0.85,
      candidateLinkCount: 4,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      candidateReachedDirectedPairs: 89,
      candidateWeakComponentCount: 7,
      candidateStronglyConnectedComponentCount: 9,
      baselineIsolatedAnchorCount: 3,
      candidateIsolatedAnchorCount: 1,
      newlyReachedDirectedPairCount: 10,
      removedDirectedPairCount: 0,
      nonGrateConnectivityStableIgnoringAddedGrates: true,
      eachGrateReachesExactlyOwnFourAnchorRouteClusterPlusSelf: true,
      crossSideGrateAttachmentObserved: false,
      upperGlassCollateralAttachmentObserved: false,
      centerStepCollateralAttachmentObserved: false,
      positiveFocusedForwardPointCount: 9,
      positiveFocusedReversePointCount: 14,
      negativeFocusedForwardPointCount: 10,
      negativeFocusedReversePointCount: 10,
      focusedEndpointErrorMeters: 0,
      fullMatrixCollateralValidated: true,
      focusedPathEndpointValidated: true,
      candidateTopologyMatchesIntendedGrateRouteClusters: true,
      exactMinimumAttachmentRadiiResolved: false,
      originalGrateDirectionalityResolved: false,
      localConnectorSemanticsValidated: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.correctedGrateDirectionalityEvidencePass18V
    ).toMatchObject({
      evidenceAuditDate: '2026-09-30',
      correctedReferenceCount: 5,
      currentDirectionalityReferenceCount: 3,
      currentRuleVariantReferenceCount: 1,
      terrainMechanicReferenceCount: 1,
      removedMisclassifiedScorchGorgeReferenceCount: 3,
      correctedReferenceIds: [
        'CURRENT_SPAWN_TO_CENTER',
        'CURRENT_RAINMAKER_GRATE_ADVANCE',
        'CURRENT_RAINMAKER_GRATE_ADVANCE_CORROBORATION',
        'CURRENT_RULE_VARIANTS',
        'GENERAL_GRATE_WALKABILITY'
      ],
      allStageSpecificReferencesIdentifyUndertow: true,
      currentSpawnToCenterViaGrateDocumented: true,
      currentCenterToEnemyViaGrateDocumented: true,
      currentCenterToEnemyViaGrateCorroborated: true,
      humanoidGrateWalkabilityDocumented: true,
      undertowAnarchyGratePresenceDocumented: true,
      oppositeRouteDirectionsDocumentedAtCurrentStageLevel: true,
      exactPass18ULocalBreaksObservedBidirectionally: false,
      routeLevelEvidenceAloneAuthorizesExactBidirectionalLinks: false,
      originalGrateDirectionalityResolved: false,
      controlledCurrentVersionCaptureRequired: true,
      localConnectorSemanticsValidated: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.centerSmallStepKccPass18W
    ).toMatchObject({
      qaRunNumber: 988,
      diagnosticOnly: true,
      canonicalStepDeltaMeters: 1.5,
      mirroredProbeCount: 6,
      topInsetMeters: 0.60,
      lowerInsetFromSharedEdgeMetersPerSide: 0.80,
      humanRadiusMeters: 0.32,
      controllerOffsetMeters: 0.025,
      autostepMaxHeightMeters: 0.34,
      jumpSpeedMetersPerSecond: 8.2,
      gravityMetersPerSecond2: 28,
      theoreticalBallisticMaxRiseMeters: 1.2007142857142856,
      productionKccTransitionClass: 'JUMP_UP_DROP_DOWN_QA_ONLY',
      productionKccPhysicalFeasibilityResolved: true,
      productionKccRequiresJumpForTestedUpwardCrossing: true,
      productionKccAllowsNaturalDownwardDrop: true,
      mirroredOutcomeClassMatches: true,
      originalGameTraversalDirectionalityResolved: false,
      originalGameJumpRequirementResolved: false,
      controlledCurrentVersionCaptureRequired: true,
      offMeshLinkAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.centerSmallStepKccPass18W.walkUp
    ).toMatchObject({
      directedProbeCount: 2,
      successfulProbeCount: 0,
      bothSidesReachTarget: false,
      positiveAirborneTicks: 0,
      negativeAirborneTicks: 230,
      productionKccOrdinaryWalkUpFeasible: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.centerSmallStepKccPass18W.jumpUp
    ).toMatchObject({
      directedProbeCount: 2,
      successfulProbeCount: 2,
      bothSidesReachTarget: true,
      positiveAirborneTicks: 14,
      negativeAirborneTicks: 15,
      productionKccNormalJumpUpFeasible: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.centerSmallStepKccPass18W.dropDown
    ).toMatchObject({
      directedProbeCount: 2,
      successfulProbeCount: 2,
      bothSidesReachTarget: true,
      positiveAirborneTicks: 16,
      negativeAirborneTicks: 16,
      productionKccNaturalDropDownFeasible: true
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.upperGlassFullSourceClusterPass18X
    ).toMatchObject({
      qaRunNumber: 993,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      trustedSnapMeters: 0.30,
      downstreamSourceComponentCountPerSide: 58,
      uniqueDownstreamSourceComponentCount: 116,
      excludedImmediatePredecessorBridgeMetalCountPerSide: 24,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      addedDirectedPairCount: 0,
      removedDirectedPairCount: 0,
      changedNonGlassRowCount: 0,
      trustedRepresentativeCountPerSide: 15,
      connectedToOwnGlassComponentCountPerSide: 0,
      connectedToOppositeGlassComponentCountPerSide: 0,
      connectedToNonGlassComponentCountPerSide: 0,
      materialInventoryPerSide: {
        BridgeMetal00: 46,
        FloorConcrete00: 1,
        FloorConcrete01: 1,
        FloorConcrete02: 4,
        FloorSlope00: 3,
        GrassFloor00: 3
      },
      floorSlopeProjectYRangeMeters: [0, 6],
      downstreamOnlyExactSourceGeometryChangedConnectivity: false,
      downstreamOnlyClusterConnectsCurrentGlassScc: false,
      downstreamOnlyClusterConnectsAnyRuntimeNonGlassScc: false,
      immediatePredecessorBridgeMetalWasIntentionallyExcludedByPass18G: true,
      fullPredecessorPlusDownstreamSourceRetestRequired: true,
      twoMeterFrontierLinkAuthorized: false,
      globalRecastParameterChangeAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.upperGlassFullPredecessorChainPass18Y
    ).toMatchObject({
      qaRunNumber: 999,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      trustedSnapMeters: 0.30,
      immediatePredecessorLogicalComponentCountPerSide: 24,
      downstreamSourceComponentCountPerSide: 58,
      fullLogicalComponentCountPerSide: 82,
      uniqueDownstreamSourceComponentCount: 116,
      sourceSolidCount: 118,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      addedDirectedPairCount: 0,
      removedDirectedPairCount: 0,
      changedNonGlassRowCount: 0,
      predecessorTrustedRepresentativeBothSides: true,
      predecessorConnectedToOwnGlassBothSides: true,
      predecessorConnectedToOppositeGlassEitherSide: false,
      predecessorConnectedToNonGlassEitherSide: false,
      predecessorBidirectionalOwnGlassAnchorCountPerSide: 3,
      trustedDownstreamRepresentativeCountPerSide: 15,
      downstreamConnectedToOwnGlassComponentCountPerSide: 0,
      downstreamConnectedToOppositeGlassComponentCountPerSide: 0,
      downstreamConnectedToNonGlassComponentCountPerSide: 0,
      fullSourceChainChangedAnchorConnectivity: false,
      immediatePredecessorIngressIntoCurrentGlassResolved: true,
      downstreamSourceClusterRecastAttachedToPredecessor: false,
      recastBreakLocalizedToPredecessorDownstreamBoundary: true,
      pass18dGroundedBridgeToNearestFloorKccFeasible: true,
      sourceNativeRampChainBroadGeometryMissingHypothesisRejected: true,
      localQaConnectorCandidateMayBeInvestigated: true,
      localQaConnectorPromotionAuthorized: false,
      twoMeterFrontierLinkAuthorized: false,
      globalRecastParameterChangeAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.upperGlassLocalConnectorPass18Z
    ).toMatchObject({
      qaRunNumber: 1004,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      trustedSnapMeters: 0.30,
      rawRadiiMeters: [0.30, 0.45, 0.60, 0.85, 1.00, 1.50],
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      positiveSourceBoundaryDistanceMeters: 0.5185586972146101,
      negativeSourceBoundaryDistanceMeters: 0.5185586972146126,
      positiveBridgeTrustedBoundaryOffsetMeters: 3.216527889612188,
      positiveFloorTrustedBoundaryOffsetMeters: 1.8492402471551055,
      negativeBridgeTrustedBoundaryOffsetMeters: 3.2163496542765126,
      negativeFloorTrustedBoundaryOffsetMeters: 2.3003785443214677,
      positiveTrustedEndpointDistanceMeters: 4.818701016746154,
      negativeTrustedEndpointDistanceMeters: 3.879513844745101,
      rawVariantCount: 18,
      allRawVariantsReachedDirectedPairs: 79,
      allRawVariantsWeakComponentCount: 9,
      allRawVariantsStronglyConnectedComponentCount: 11,
      rawPhysicalBoundaryAttachmentSucceededAtOrBelow150BothSides: false,
      rawPhysicalBoundaryCandidateChangedAnchorConnectivity: false,
      trustedControlFloorJoinsOwnGlassBothSides: true,
      trustedControlFloorJoinsAnyNonGlassEitherSide: false,
      trustedControlChangedAnchorConnectivity: false,
      trustedControlIsNonlocal: true,
      oneLocalPhysicalBoundaryConnectorSufficient: false,
      downstreamInternalRecastBreaksStillNeedClassification: true,
      exactRawBoundaryRadiusSolutionFoundAtOrBelow150: false,
      radiusInflationAuthorized: false,
      localConnectorPromotionAuthorized: false,
      twoMeterFrontierLinkAuthorized: false,
      globalRecastParameterChangeAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassDownstreamSccClassificationPass18AA
    ).toMatchObject({
      qaRunNumber: 1008,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      trustedSnapMeters: 0.30,
      trustedControlLinkRadiusMeters: 0.30,
      downstreamSourceComponentCountPerSide: 58,
      trustedRepresentativeCountPerSide: 15,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      candidateReachedDirectedPairs: 79,
      candidateWeakComponentCount: 9,
      candidateStronglyConnectedComponentCount: 11,
      positiveSourceBoundaryDistanceMeters: 0.5185586972146101,
      negativeSourceBoundaryDistanceMeters: 0.5185586972146126,
      positiveTrustedEndpointDistanceMeters: 4.818701016746154,
      negativeTrustedEndpointDistanceMeters: 3.879513844745101,
      ownGlassConnectedComponentCountPerSide: 1,
      positiveOwnGlassConnectedComponentId:
        'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7',
      negativeOwnGlassConnectedComponentId:
        'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13',
      ownGlassConnectedMaterial: 'FloorConcrete02',
      oppositeGlassConnectedComponentCountPerSide: 0,
      nonGlassConnectedComponentCountPerSide: 0,
      remainingTrustedDisconnectedComponentCountPerSide: 14,
      onlyNearestFloorComponentJoinsOwnGlassUnderTrustedControl: true,
      downstreamSourceClusterBecomesTransitivelyAttached: false,
      downstreamRuntimeSccReached: false,
      candidateChangedTrackedAnchorConnectivity: false,
      nextBreakLocalizedImmediatelyDownstreamOfNearestFloor: true,
      rawRadiusInflationAuthorized: false,
      trustedShortcutPromotionAuthorized: false,
      twoMeterFrontierLinkAuthorized: false,
      globalRecastParameterChangeAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassNearestDownstreamBreakPass18AB
    ).toMatchObject({
      qaRunNumber: 1012,
      diagnosticOnly: true,
      trustedSnapMeters: 0.30,
      seedMaterial: 'FloorConcrete02',
      positiveSeedComponentId:
        'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7',
      negativeSeedComponentId:
        'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13',
      comparedComponentCountPerSide: 57,
      zeroContactCountPerSide: 0,
      componentsWithin003PerSide: 0,
      componentsWithin008PerSide: 0,
      componentsWithin018PerSide: 0,
      componentsWithin030PerSide: 0,
      componentsWithin060PerSide: 3,
      componentsWithin200PerSide: 8,
      positiveNearestBridgeComponentId:
        'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c61',
      positiveNearestSlopeComponentId:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3',
      positiveSecondBridgeComponentId:
        'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c59',
      negativeNearestBridgeComponentId:
        'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c86',
      negativeNearestSlopeComponentId:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23',
      negativeSecondBridgeComponentId:
        'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c87',
      nearestCandidateMaterialSet: ['BridgeMetal00', 'FloorSlope00'],
      mirroredThreeWayCandidatePattern: true,
      nearestBridgeTrustedRepresentativeSnapMeters: 0,
      positiveNearestBridgeTrustedBoundaryOffsetMeters: 0.3990619059042479,
      negativeNearestBridgeTrustedBoundaryOffsetMeters: 0.5704145669360774,
      nearestBridgeOwnGlassMutualEitherSide: false,
      nearestBridgeNonGlassMutualEitherSide: false,
      trustedCandidateCountPerSide: 14,
      trustedDisconnectedCountPerSide: 14,
      singleNextBoundaryResolved: false,
      firstBreakLocalizedToThreeWaySourceNeighborhood: true,
      nextDiagnosticRequiresBranchClassification: true,
      rawRadiusInflationAuthorized: false,
      trustedShortcutPromotionAuthorized: false,
      twoMeterFrontierLinkAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassBranchReachabilityPass18AC
    ).toMatchObject({
      qaRunNumber: 1015,
      diagnosticOnly: true,
      thresholdMeters: [0.60, 0.85, 1.00, 1.50, 2.00],
      seedExcludedFromTraversal: true,
      candidateCountPerSide: 3,
      mirroredBranchPattern: true,
      bridgeBranchCountPerSide: 2,
      slopeBranchCountPerSide: 1,
      bridgeBranchComponentCountAt060: 3,
      bridgeBranchComponentCountAt200: 3,
      bridgeBranchYMinAt200: 6,
      bridgeBranchYMaxAt200: 6.025,
      bridgeBranchReachesYAtOrBelow3: false,
      bridgeBranchReachesYAtOrBelow15: false,
      slopeBranchComponentCountAt060: 2,
      slopeBranchComponentCountAt085: 2,
      slopeBranchComponentCountAt100: 2,
      slopeBranchComponentCountAt150: 6,
      slopeBranchComponentCountAt200: 14,
      slopeBranchYMinAt060: 3,
      slopeBranchYMaxAt060: 6,
      slopeBranchYMinAt200: 0,
      slopeBranchYMaxAt200: 6,
      slopeBranchReachesYAtOrBelow3At060: true,
      slopeBranchReachesYAtOrBelow15At200: true,
      slopeBranchFloorSlopeCountAt200: 3,
      slopeBranchFloorConcreteCountAt200: 5,
      slopeBranchBridgeMetalCountAt200: 3,
      positiveSlopeComponentId:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3',
      positiveImmediateFloorConcreteComponentId:
        'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c2',
      negativeSlopeComponentId:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23',
      negativeImmediateFloorConcreteComponentId:
        'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c9',
      floorSlopeBranchIsOnlyDescendingRouteCandidate: true,
      bridgeBranchesRemainHighLocalMetalCluster: true,
      sourceRouteBranchResolved: true,
      exactFloorToSlopeTraversalSemanticsResolved: false,
      floorToSlopeKccFeasibilityMeasured: false,
      floorToSlopeNavigationConnectorAuthorized: false,
      rawRadiusInflationAuthorized: false,
      trustedShortcutPromotionAuthorized: false,
      twoMeterFrontierLinkAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassFloorSlopeKccPass18AD
    ).toMatchObject({
      qaRunNumber: 1019,
      diagnosticOnly: true,
      characterMode: 'HUMAN',
      insetMeters: 0.40,
      humanRadiusMeters: 0.32,
      controllerOffsetMeters: 0.025,
      autostepMaxHeightMeters: 0.34,
      snapToGroundMeters: 0.24,
      positiveBoundaryDistanceMeters: 0.5185586972146133,
      negativeBoundaryDistanceMeters: 0.5185586972146118,
      positiveBoundaryVerticalDeltaMeters: 0,
      negativeBoundaryVerticalDeltaMeters: 0,
      directedProbeCount: 4,
      successfulDirectedProbeCount: 4,
      airborneTickCountTotal: 0,
      allInitiallySettled: true,
      allFinallyGrounded: true,
      positiveFloorToSlopeGroundedTicks: 8,
      positiveSlopeToFloorGroundedTicks: 8,
      negativeFloorToSlopeGroundedTicks: 9,
      negativeSlopeToFloorGroundedTicks: 9,
      maximumFinalHorizontalErrorMeters: 0.15477108986760482,
      maximumFinalVerticalErrorMeters: 0.06845153690349992,
      maximumDropBelowStartMeters: 0.0782347869873048,
      maximumRiseAboveStartMeters: 0.07553304553997453,
      mirroredBidirectionalGroundedTraversalFeasible: true,
      productionKccPhysicalFeasibilityResolved: true,
      noJumpRequiredForTestedBoundary: true,
      sourceRouteBranchPhysicallyTraversable: true,
      recastRepresentationStillUnresolved: true,
      navigationConnectorAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassFloorSlopeRecastPass18AE
    ).toMatchObject({
      qaRunNumber: 1023,
      diagnosticOnly: true,
      trustedSnapMeters: 0.30,
      rawRadiiMeters: [0.30, 0.45, 0.60, 0.85, 1.00, 1.50],
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      bridgeFloorControlReachedDirectedPairs: 79,
      bridgeFloorControlWeakComponentCount: 9,
      bridgeFloorControlStronglyConnectedComponentCount: 11,
      positiveFloorSlopeBoundaryDistanceMeters: 0.5185586972146133,
      negativeFloorSlopeBoundaryDistanceMeters: 0.5185586972146118,
      at030PositiveSlopeOwnGlass: false,
      at030NegativeSlopeOwnGlass: false,
      at045PositiveSlopeOwnGlass: false,
      at045NegativeSlopeOwnGlass: false,
      at060PositiveSlopeOwnGlass: false,
      at060NegativeSlopeOwnGlass: true,
      at085PositiveSlopeOwnGlass: true,
      at085NegativeSlopeOwnGlass: true,
      at100PositiveSlopeOwnGlass: true,
      at100NegativeSlopeOwnGlass: true,
      at150PositiveSlopeOwnGlass: true,
      at150NegativeSlopeOwnGlass: true,
      trustedControlPositiveSlopeOwnGlass: true,
      trustedControlNegativeSlopeOwnGlass: true,
      anyVariantSlopeReachesNonGlassRuntimeAnchor: false,
      allVariantsTrackedAnchorMatrixUnchanged: true,
      firstCoarseCommonRawRadiusMeters: 0.85,
      negativeRawAttachmentResolvedAt060: true,
      positiveRawAttachmentResolvedAt060: false,
      positiveRawAttachmentResolvedAt085: true,
      mirroredCoarseThresholdAsymmetry: true,
      commonMinimumRawRadiusResolved: false,
      fineSweepRequiredBetween060And085: true,
      rawPhysicalBoundaryCandidateRemainsLocal: true,
      bridgeFloorTrustedControlRemainsNonlocalDiagnosticOnly: true,
      trustedFloorSlopeControlIsNonlocal: true,
      rawRadiusInflationAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassFloorSlopeFineRadiusPass18AF
    ).toMatchObject({
      qaRunNumber: 1027,
      diagnosticOnly: true,
      trustedSnapMeters: 0.30,
      sampledRawRadiiMeters: [
        0.60, 0.625, 0.65, 0.675, 0.70, 0.725, 0.75, 0.775, 0.80, 0.825, 0.85
      ],
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      bridgeFloorControlReachedDirectedPairs: 79,
      bridgeFloorControlWeakComponentCount: 9,
      bridgeFloorControlStronglyConnectedComponentCount: 11,
      negativeFirstSampledSuccessRadiusMeters: 0.60,
      positiveLastSampledFailureRadiusMeters: 0.775,
      positiveFirstSampledSuccessRadiusMeters: 0.80,
      firstSampledCommonSuccessRadiusMeters: 0.80,
      commonThresholdLowerExclusiveMeters: 0.775,
      commonThresholdUpperInclusiveMeters: 0.80,
      at060PositiveSlopeOwnGlass: false,
      at060NegativeSlopeOwnGlass: true,
      at0625PositiveSlopeOwnGlass: false,
      at0625NegativeSlopeOwnGlass: true,
      at065PositiveSlopeOwnGlass: false,
      at065NegativeSlopeOwnGlass: true,
      at0675PositiveSlopeOwnGlass: false,
      at0675NegativeSlopeOwnGlass: true,
      at070PositiveSlopeOwnGlass: false,
      at070NegativeSlopeOwnGlass: true,
      at0725PositiveSlopeOwnGlass: false,
      at0725NegativeSlopeOwnGlass: true,
      at075PositiveSlopeOwnGlass: false,
      at075NegativeSlopeOwnGlass: true,
      at0775PositiveSlopeOwnGlass: false,
      at0775NegativeSlopeOwnGlass: true,
      at080PositiveSlopeOwnGlass: true,
      at080NegativeSlopeOwnGlass: true,
      at0825PositiveSlopeOwnGlass: true,
      at0825NegativeSlopeOwnGlass: true,
      at085PositiveSlopeOwnGlass: true,
      at085NegativeSlopeOwnGlass: true,
      anyVariantSlopeReachesNonGlassRuntimeAnchor: false,
      allVariantsTrackedAnchorMatrixUnchanged: true,
      mirroredAttachmentThresholdAsymmetryPersists: true,
      exactCommonThresholdResolved: false,
      firstSampledCommonRadiusResolved: true,
      rawPhysicalBoundaryCandidateRemainsLocal: true,
      bridgeFloorTrustedControlRemainsNonlocalDiagnosticOnly: true,
      globalRadiusChangeAuthorized: false,
      rawRadiusInflationAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassBridgeFloorEndpointIsolationPass18AG
    ).toMatchObject({
      qaRunNumber: 1031,
      diagnosticOnly: true,
      sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1',
      rawRadiusMeters: 1.50,
      trustedRadiusMeters: 0.30,
      trustedSnapMeters: 0.30,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      positiveSourceBoundaryDistanceMeters: 0.5185586972146101,
      negativeSourceBoundaryDistanceMeters: 0.5185586972146126,
      positiveBridgeTrustedBoundaryOffsetMeters: 3.216527889612188,
      positiveFloorTrustedBoundaryOffsetMeters: 1.8492402471551055,
      negativeBridgeTrustedBoundaryOffsetMeters: 3.2163496542765126,
      negativeFloorTrustedBoundaryOffsetMeters: 2.3003785443214677,
      positiveTrustedEndpointDistanceMeters: 4.818701016746154,
      negativeTrustedEndpointDistanceMeters: 3.879513844745101,
      positiveRawRawConnected: false,
      positiveRawBridgeTrustedFloorConnected: true,
      positiveTrustedBridgeRawFloorConnected: false,
      positiveTrustedTrustedConnected: true,
      negativeRawRawConnected: false,
      negativeRawBridgeTrustedFloorConnected: true,
      negativeTrustedBridgeRawFloorConnected: false,
      negativeTrustedTrustedConnected: true,
      rawBridgeEndpointAttachesOnBothSides: true,
      rawFloorEndpointAttachesOnEitherSide: false,
      floorEndpointIsCommonAttachmentBlocker: true,
      bridgeEndpointIsNotAttachmentBlocker: true,
      hybridResultsMirrored: true,
      allVariantsTrackedAnchorMatrixUnchanged: true,
      anyVariantReachesNonGlassRuntimeAnchor: false,
      floorEndpointLocalRetreatRequiredNext: true,
      trustedFloorEndpointTooNonlocalForPromotion: true,
      rawRadiusInflationAuthorized: false,
      trustedShortcutPromotionAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassFloorEndpointLocalSearchPass18AH
    ).toMatchObject({
      qaRunNumber: 1035,
      diagnosticOnly: true,
      rawRadiusMeters: 1.50,
      trustedSnapMeters: 0.30,
      sourceSampleCountPerSide: 10,
      selectedSampleCountPerSide: 6,
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      positiveTrustedFloorBoundaryOffsetMeters: 1.8492402471551055,
      negativeTrustedFloorBoundaryOffsetMeters: 2.3003785443214677,
      positiveRawBoundaryProjectedSnapMeters: 1.073626967562852,
      negativeRawBoundaryProjectedSnapMeters: 0.9065172851425543,
      positiveFirstSuccessRetreatMeters: 0.6547373284927769,
      negativeFirstSuccessRetreatMeters: 0.654737328492778,
      commonFirstSampledSuccessRetreatMeters: 0.654737328492778,
      positiveFirstSuccessProjectedSnapMeters: 0.511221159040814,
      negativeFirstSuccessProjectedSnapMeters: 0.5004886229274855,
      positiveFirstSuccessSourcePoint: [
        -10.67826430970341, 6, 12.118397071136153
      ],
      negativeFirstSuccessSourcePoint: [
        10.907632598231574, 6, -11.92383277567933
      ],
      positiveLastFailureRetreatMeters: 0,
      negativeLastFailureRetreatMeters: 0,
      allSelectedCandidatesTrackedAnchorMatrixUnchanged: true,
      allSuccessfulCandidatesReachNoNonGlassRuntimeAnchor: true,
      firstSampledLocalRetreatMirrored: true,
      sourceMeshSampleSearchFindsLocalAlternativeToTrustedShortcut: true,
      exactContinuousRetreatThresholdResolved: false,
      continuousSurfaceSweepRequiredBetweenBoundaryAndFirstSuccess: true,
      rawRadiusInflationAuthorized: false,
      trustedShortcutPromotionAuthorized: false,
      runtimePromotionAuthorized: false,
      activationBlockerCleared: false
    });
    expect(
      UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT
        .upperGlassFloorEndpointInterpolationPass18AI
    ).toMatchObject({
      qaRunNumber: 1039,
      diagnosticOnly: true,
      rawRadiusMeters: 1.50,
      interpolationRetreatsMeters: [
        0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45,
        0.50, 0.55, 0.60, 0.65, 0.654737328492778
      ],
      baselineReachedDirectedPairs: 79,
      baselineWeakComponentCount: 9,
      baselineStronglyConnectedComponentCount: 11,
      positiveLastFailureRetreatMeters: 0,
      positiveFirstSuccessRetreatMeters: 0.05,
      negativeLastFailureRetreatMeters: 0.10,
      negativeFirstSuccessRetreatMeters: 0.15,
      firstSampledCommonSuccessRetreatMeters: 0.15,
      commonThresholdLowerExclusiveMeters: 0.10,
      commonThresholdUpperInclusiveMeters: 0.15,
      positiveProjectedSnapAtCommonMeters: 0.9804257137187009,
      negativeProjectedSnapAtCommonMeters: 0.9694454031811923,
      allInterpolatedPointsSourceSurfaceValid: true,
      commonCandidateReachedDirectedPairs: 79,
      commonCandidateWeakComponentCount: 9,
      commonCandidateStronglyConnectedComponentCount: 11,
      commonCandidateReachesNonGlassRuntimeAnchor: false,
      positiveThresholdAlreadyBelowCommonWindow: true,
      negativeThresholdControlsCommonWindow: true,
      mirroredAttachmentThresholdAsymmetryPersists: true,
      exactCommonRetreatThresholdResolved: false,
      fineSweepRequiredBetween010And015: true,
      rawRadiusStillDiagnosticLarge: true,
      radiusMinimizationDeferredUntilRetreatThresholdResolved: true,
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
