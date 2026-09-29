import { Vec3 } from 'playcanvas';
import { GAME_CONFIG } from '../../config/game/gameConfig';
import { PLAYER_CHARACTER_PHYSICS } from '../../player/PlayerCharacterPhysics';
import type { StageDefinition, StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  undertowFirstDropNavigationLinks,
  undertowRightSmallDropNavigationLinks
} from './UndertowSpillwayDropNavigation';
import { UNDERTOW_RIGHT_LOW_ROUTE_RAMPS } from './UndertowSpillwayRouteRampGeometry';
import { undertowTemple01ModelXZToProjectXZ } from './UndertowSpillwayModelXZGeometry';
import { UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER } from './UndertowSpillwayMeasurementLedger';
import {
  UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D,
  UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS
} from './UndertowSpillwayUpperGlassReconstructionCandidate';
import { UNDERTOW_UPPER_GLASS_COMPONENT_PROBES } from './UndertowSpillwayUpperGlassControlledCapturePlan';
import { UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';

export type UndertowConnectivityProbeId =
  | 'first-drop-positive-z'
  | 'first-drop-negative-z'
  | 'right-small-drop-positive-z'
  | 'right-small-drop-negative-z'
  | 'right-low-ramp-positive-z'
  | 'right-low-ramp-negative-z'
  | 'right-low-to-underpass-positive-z'
  | 'right-low-to-underpass-negative-z';

export interface UndertowConnectivityProbe {
  id: UndertowConnectivityProbeId;
  from: StageVector3;
  to: StageVector3;
  expectation: 'MUST_REACH' | 'DIAGNOSTIC_GAP';
  notes: string;
}

function midpoint(a: StageVector3, b: StageVector3): StageVector3 {
  return [
    (a[0] + b[0]) * 0.5,
    (a[1] + b[1]) * 0.5,
    (a[2] + b[2]) * 0.5
  ];
}

function modelPoint(x: number, y: number, z: number): StageVector3 {
  const [px, pz] = undertowTemple01ModelXZToProjectXZ([x, z]);
  return [px, y, pz];
}

function navigationLinkById(
  links: readonly ReturnType<typeof undertowFirstDropNavigationLinks>[number][],
  id: string
) {
  const link = links.find((candidate) => candidate.id === id);
  if (!link) throw new Error(`Missing Undertow navigation link '${id}'.`);
  return link;
}

const firstDropLinks = undertowFirstDropNavigationLinks();
const rightDropLinks = undertowRightSmallDropNavigationLinks();
const firstDropPositive = navigationLinkById(firstDropLinks, 'first-drop-positive-z-3');
const firstDropNegative = navigationLinkById(firstDropLinks, 'first-drop-negative-z-3');
const rightDropPositive = navigationLinkById(rightDropLinks, 'right-small-drop-positive-z-3');
const rightDropNegative = navigationLinkById(rightDropLinks, 'right-small-drop-negative-z-3');

const positiveRamp = UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.find(
  (record) => record.side === 'POSITIVE_Z'
)!;
const negativeRamp = UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.find(
  (record) => record.side === 'NEGATIVE_Z'
)!;
const positiveRampUpper = midpoint(
  positiveRamp.mesh.vertices[0]!,
  positiveRamp.mesh.vertices[1]!
);
const positiveRampLower = midpoint(
  positiveRamp.mesh.vertices[2]!,
  positiveRamp.mesh.vertices[3]!
);
const negativeRampUpper = midpoint(
  negativeRamp.mesh.vertices[0]!,
  negativeRamp.mesh.vertices[1]!
);
const negativeRampLower = midpoint(
  negativeRamp.mesh.vertices[2]!,
  negativeRamp.mesh.vertices[3]!
);

// Interior points of the independently audited mirrored underpass polygons.
// Model XZ comes from the Temple01 source frame; project Y=0 is canonical.
const positiveUnderpassInterior = modelPoint(-10, 0, 3);
const negativeUnderpassInterior = modelPoint(10, 0, -3);

export const UNDERTOW_T21D_CONNECTIVITY_PROBES:
  readonly UndertowConnectivityProbe[] = [
  {
    id: 'first-drop-positive-z',
    from: firstDropPositive.start,
    to: firstDropPositive.end,
    expectation: 'MUST_REACH',
    notes:
      'Audits the explicit one-way positive-Z first-drop Detour link from spawn-high to the first-drop landing.'
  },
  {
    id: 'first-drop-negative-z',
    from: firstDropNegative.start,
    to: firstDropNegative.end,
    expectation: 'MUST_REACH',
    notes:
      'Audits the independently built negative-Z first-drop counterpart in the actual Recast QA navmesh.'
  },
  {
    id: 'right-small-drop-positive-z',
    from: rightDropPositive.start,
    to: rightDropPositive.end,
    expectation: 'MUST_REACH',
    notes:
      'Audits the separate positive-Z one-way right-small-drop link from spawn-high to right-low.'
  },
  {
    id: 'right-small-drop-negative-z',
    from: rightDropNegative.start,
    to: rightDropNegative.end,
    expectation: 'MUST_REACH',
    notes:
      'Audits the negative-Z right-small-drop counterpart in the actual Recast QA navmesh.'
  },
  {
    id: 'right-low-ramp-positive-z',
    from: positiveRampLower,
    to: positiveRampUpper,
    expectation: 'MUST_REACH',
    notes:
      'Audits the exact positive-Z FloorConcrete03 physical ramp between first-drop landing and right-low.'
  },
  {
    id: 'right-low-ramp-negative-z',
    from: negativeRampLower,
    to: negativeRampUpper,
    expectation: 'MUST_REACH',
    notes:
      'Audits the exact negative-Z FloorConcrete03 counterpart in the actual Recast QA navmesh.'
  },
  {
    id: 'right-low-to-underpass-positive-z',
    from: positiveRampUpper,
    to: positiveUnderpassInterior,
    expectation: 'DIAGNOSTIC_GAP',
    notes:
      'Diagnostic only: capture evidence says positive-Z right-low connects into the underpass, but the intermediate source route has not yet been fully bound.'
  },
  {
    id: 'right-low-to-underpass-negative-z',
    from: negativeRampUpper,
    to: negativeUnderpassInterior,
    expectation: 'DIAGNOSTIC_GAP',
    notes:
      'Mirrored diagnostic only: the negative-Z source route is likewise not authorized for runtime promotion.'
  }
] as const;

export function undertowT21dConnectivityQaStage(): StageDefinition {
  const package_ = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  return {
    metadata: {
      id: 'undertow-t21d-partial-connectivity-qa',
      displayName: 'Undertow T21-D Partial Connectivity QA',
      worldBounds: package_.worldBounds,
      teamASpawn: package_.teamASpawnFloorPoint,
      teamBSpawn: package_.teamBSpawnFloorPoint,
      teamASpawnSlots: [package_.teamASpawnFloorPoint],
      teamBSpawnSlots: [package_.teamBSpawnFloorPoint],
      tacticalNodes: [],
      splatZones: []
    },
    solids: package_.solids,
    paintSurfaces: package_.paintSurfaces,
    navigationLinks: package_.navigationLinks
  };
}

export function vec3([x, y, z]: StageVector3): Vec3 {
  return new Vec3(x, y, z);
}



export type UndertowPass18bTraversableAnchorKind =
  | 'PAINT_SURFACE'
  | 'GRATE'
  | 'UPPER_GLASS_BROAD';

export interface UndertowPass18bTraversableAnchor {
  id: string;
  kind: UndertowPass18bTraversableAnchorKind;
  point: StageVector3;
}

export function undertowPass18bTraversableQaAnchors():
  readonly UndertowPass18bTraversableAnchor[] {
  const package_ = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  const paint = package_.paintSurfaces.map((surface) => ({
    id: `paint:${surface.backingSolidId}`,
    kind: 'PAINT_SURFACE' as const,
    point: surface.center
  }));
  const grates = package_.solids
    .filter((solid) => solid.id.includes('grate-mesh:'))
    .map((solid) => ({
      id: `grate:${solid.id}`,
      kind: 'GRATE' as const,
      point: [
        solid.center[0],
        solid.center[1] + solid.size[1] * 0.5,
        solid.center[2]
      ] as const
    }));
  const glass = [
    ...UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.positiveZ
      .map((point, index) => ({
        id: `glass:positive-z:${index}`,
        kind: 'UPPER_GLASS_BROAD' as const,
        point
      })),
    ...UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.negativeZ
      .map((point, index) => ({
        id: `glass:negative-z:${index}`,
        kind: 'UPPER_GLASS_BROAD' as const,
        point
      }))
  ];
  return [...paint, ...grates, ...glass];
}

function sharedBoundaryLengthMeters(
  a: readonly (readonly [number, number])[],
  b: readonly (readonly [number, number])[]
): number {
  const key = (point: readonly [number, number]) =>
    `${point[0].toFixed(9)},${point[1].toFixed(9)}`;
  const bKeys = new Set(b.map(key));
  const shared = a.filter((point) => bKeys.has(key(point)));
  if (shared.length !== 2) return 0;
  return Math.hypot(
    shared[0]![0] - shared[1]![0],
    shared[0]![1] - shared[1]![1]
  );
}

const negativeGrateSpawnSharedBoundaryMeters = sharedBoundaryLengthMeters(
  UNDERTOW_VECTOR_TRACES.negativeZGrateMesh.metricPoints,
  UNDERTOW_VECTOR_TRACES.negativeZSpawnSideWhiteFace.metricPoints
);
const positiveGrateSpawnSharedBoundaryMeters = sharedBoundaryLengthMeters(
  UNDERTOW_VECTOR_TRACES.positiveZGrateMesh.metricPoints,
  UNDERTOW_VECTOR_TRACES.positiveZSpawnSideWhiteFace.metricPoints
);
const thinEdgeProbes = UNDERTOW_UPPER_GLASS_COMPONENT_PROBES.filter(
  (probe) => probe.id === 'THIN_EDGE_STRIP'
);

export const UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT = Object.freeze({
  qaStageScope: 'PARTIAL_GEOMETRY_ONLY' as const,
  resolutionPass: '18P' as const,
  auditedAt: '2026-09-29' as const,
  sourceNativeRouteGapAudit: Object.freeze({
    sourceWalkableNodeCountPerSide: 276,
    rightLowContactNodeCountPerSide: 17,
    underpassContactNodeCountPerSide: 8,
    directConnectivityThresholdsMeters: [0.03, 0.08, 0.18, 0.30] as const,
    reachableAtOrBelowMaxDirectThreshold: false,
    relaxedDiscoveryThresholdMeters: 2.0,
    localGapCountTotal: 8,
    localGapCountPerSide: 4,
    strictBridgeThresholdMeters: 0.30,
    strictBridgesWhenAllExcludedSourceIsAllowed: 6,
    strictBridgesAfterFloorLineAndFenceOverlayRemoval: 0,
    ordinaryWalkSurfaceRecovered: false,
    runtimePromotionAuthorized: false,
    offMeshLinkAuthorized: false,
    notes:
      'Resolution Pass 10B reuses the source-native Temple01 route graph from CI #746. Each mirrored side contains 276 walkable candidate components, with 17 right-low contacts and 8 underpass contacts. No path exists at 0.03/0.08/0.18/0.30m adjacency. A relaxed 2.0m discovery path exposes four local gaps per side. Six apparent <=0.30m bridges exist only when excluded source classes are allowed; after removing known FloorLine/FloorFence marking overlays, all eight gaps have zero strict bridge. Therefore no omitted ordinary walk surface or justified Detour link is promoted.'
  }),
  paintAnchorMatrixPass18A: Object.freeze({
    anchorCount: 17,
    directedPairCount: 289,
    reachedDirectedPairCountIncludingSelf: 59,
    missedDirectedPairCount: 230,
    reachedNonSelfDirectedPairCount: 42,
    weakComponentCount: 5,
    stronglyConnectedComponentCount: 7,
    centerOriginStepTopIsSingleton: true,
    centerOriginStepTopReachableAnchorCountIncludingSelf: 1,
    previousTwoGapInventoryWasComplete: false,
    qaRunNumber: 870,
    notes:
      'Pass 18A audits all 17 current paint-surface anchors against one another on the exact inert T21-D Recast package. The matrix exposes five weak connectivity components and seven directed SCCs. In addition to the already-known mirrored right-low-to-underpass gaps, the center-origin +1.5m step-top is a singleton because its canonical center-small-step transition is not represented in navigation. The matrix is diagnostic; missed directed pairs are not automatically bugs because the two spawn-side drops are intentionally one-way.'
  }),
  centerSmallStepGapAudit: Object.freeze({
    transitionEntryIds: [
      'negative-z-center-small-step',
      'positive-z-center-small-step'
    ] as const,
    transitionCount: 2,
    canonicalTransitionKind: 'STEP' as const,
    canonicalDeltaYMeters: 1.5,
    exactTransitionStripsMeasured: true,
    transitionStripsDepthMeters: 0.75,
    stepTopRuntimeSurfaceBound: true,
    runtimeNavigationTransitionBound: false,
    traversalDirectionResolved: false,
    jumpRequirementResolved: false,
    automaticRecastClimbMeters:
      0.10 * 4,
    automaticRecastCanBridgeCanonicalDelta: false,
    offMeshLinkAuthorized: false,
    runtimePromotionAuthorized: false,
    userCaptureRequiredNow: false,
    notes:
      'The measurement ledger already contains two mirrored CONFIRMED STEP transitions at +1.5m and the exact 0.75m-deep strips, while the +1.5m center-origin top face exists in runtime. Current Recast automatic climb is 0.40m, so the 1.5m transition cannot appear automatically. Existing archived evidence does not record lower->upper versus upper->lower traversal direction or whether a jump is required. Pass 18A therefore identifies a missing runtime transition but does not invent a bidirectional/jump/drop off-mesh link.'
  }),

  traversableAnchorMatrixPass18B: Object.freeze({
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
    ] as const,
    upperGlassPositiveBroadInternalAnchorCount: 3,
    upperGlassNegativeBroadInternalAnchorCount: 3,
    upperGlassBroadExternallyConnected: false,
    maximumObservedAnchorSnapMeters: 0.24704275013919783,
    qaRunNumber: 873,
    notes:
      'Pass 18B expands the Pass 18A paint-only matrix to all currently bound traversable authority: 17 paint anchors, two confirmed traversable/uninkable grates, and the six directly verified broad upper-glass route points. The exact current inert package yields 79/625 directed reaches, nine weak components and eleven SCCs. Both grates are singleton nav islands. Each upper-glass side is internally connected across its three broad points but has no path to any non-glass anchor.'
  }),
  grateIngressPass18B: Object.freeze({
    confirmedTraversableGrateCount: 2,
    isolatedGrateAnchorCount: 2,
    negativePlanSharedBoundaryMeters: negativeGrateSpawnSharedBoundaryMeters,
    positivePlanSharedBoundaryMeters: positiveGrateSpawnSharedBoundaryMeters,
    sharesExactPlanBoundaryWithSpawnSideWhiteFace: true,
    adjacentSpawnSideWhiteFaceIsMultiElevation: true,
    adjacentContinuousUpperTerrainRuntimeBindingResolved: false,
    offMeshLinkAuthorized: false,
    userCaptureRequiredNow: false,
    notes:
      'The vector source gives each grate an exact 6.375m plan boundary shared with its mirrored spawn-side white face. That white face is explicitly multi-elevation and is not represented by one convenience slab in T21-D. The grate islands therefore localize a missing adjacent upper-terrain runtime binding; plan adjacency alone does not authorize a flat bridge or off-mesh link.'
  }),
  upperGlassThinEdgeNavigationPass18B: Object.freeze({
    broadNavigationTrianglesPerSide: 46,
    diagnosticCandidateTrianglesPerSide: 48,
    addedThinEdgeTriangleIds: UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS,
    thinEdgeProbeCount: thinEdgeProbes.length,
    thinEdgeMinimumInteriorClearanceMeters:
      Math.min(...thinEdgeProbes.map(
        (probe) => probe.minRoutePointBoundaryClearanceMeters
      )),
    recastCellSizeMeters: GAME_CONFIG.cpu.navigationCellSizeMeters,
    recastWalkableRadiusVoxels: GAME_CONFIG.cpu.navigationWalkableRadiusVoxels,
    recastNominalErosionRadiusMeters:
      GAME_CONFIG.cpu.navigationCellSizeMeters *
      GAME_CONFIG.cpu.navigationWalkableRadiusVoxels,
    baselineAndThinEdgeCandidateMatricesIdentical: true,
    currentPartialCandidateExternalBridgeAdded: false,
    currentGlassIsolationCausedByThinEdgeExclusion: false,
    finalThinEdgeNavigationDispositionResolved: false,
    requiresRetestAfterAdjacentUpperTerrainBinding: true,
    runtimePromotionAuthorized: false,
    qaRunNumber: 874,
    notes:
      'Pass 18B temporarily adds exact upward source triangles 98/99 to the QA-only Glass01 navigation candidate, increasing 46 -> 48 triangles per side. The full 25-anchor reachability matrix is byte-for-byte equivalent at the semantic row/reach level: no bridge appears. The strip has only ~0.046m interior clearance while current Recast nominal erosion is 0.36m. This proves the current broad-glass island is not caused by omitting 98/99, but the final thin-edge disposition remains open until adjacent upper terrain is bound and the final candidate is rebuilt.'
  }),
  sourceNativeUpperTerrainPass18C: Object.freeze({
    sourceAuditScope: 'QA_ONLY_SOURCE_NATIVE_ADJACENCY' as const,
    sourceAuditRunNumber: 886,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    exactTriangleDistanceIncludesEdgeEdge: true,
    grate: Object.freeze({
      qualifiedSourceComponentsPerSide: 8,
      sourceTrianglesPerSide: 16,
      sourceAreaSquareMetersPerSide: 19.054820,
      exactMirrorVertexXor: 0,
      nearestWalkDistanceMeters: 0.335410,
      nearestWalkSourceObject:
        'Fld_Temple01_pCube21525_1__FloorConcrete00' as const,
      sourceGraphReachableAt030Meters: false,
      sourceGraphReachableAt040Meters: true,
      sourceNativeReplacementMatrixReachedPairs: 79,
      sourceNativePlusNearestFloorMatrixReachedPairs: 79,
      remainsSingletonAfterSourceNativeReplacement: true,
      remainsSingletonAfterNearestFloorBinding: true
    }),
    upperGlass: Object.freeze({
      pass13aRouteSeedCountPerSide: 3,
      sourceRouteComponentsPerSide: 3,
      sourceBroadTrianglesPerSide: 6,
      sourceBroadAreaSquareMetersPerSide: 58.171653,
      nearestBridgeMetalDistanceMeters: 0.055902,
      bridgeReachableComponentsAt030MetersPerSide: 24,
      bridgeReachableTrianglesAt030MetersPerSide: 48,
      bridgeReachableAreaSquareMetersPerSide: 9.332461,
      nearestNonBridgeWalkDistanceMeters: 0.700000,
      nearestNonBridgeWalkSourceObject:
        'Fld_Temple01_pCube20989_1__FloorConcrete02' as const,
      bridgeOnlyMatrixReachedPairs: 79,
      bridgePlusNearestFloorMatrixReachedPairs: 79,
      bridgeOnlyExternalGlassReachCount: 0,
      bridgePlusNearestFloorExternalGlassReachCount: 0
    }),
    baselineMatrixReachedPairs: 79,
    geometryOnlyAdjacentBindingChangedConnectivity: false,
    missingAdjacentTriangleHypothesisSufficient: false,
    traversalOrCollisionSemanticsStillRequired: true,
    convenienceGeometryAuthorized: false,
    offMeshLinkAuthorized: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    userCaptureRequiredNow: false,
    notes:
      'Pass 18C re-audits the verified Temple01 OBJ with exact triangle distance including edge-edge pairs, exports QA-only source-native meshes, and feeds them back through the real Recast path. The mirrored grate source union is 16 triangles / 19.054820m² per side with exact source symmetry; it remains a singleton after replacing the vector grate and even after adding its nearest exact FloorConcrete00 component. The three Pass 13A upper-glass route points bind to three exact Glass01 source components per side. Their <=0.30m BridgeMetal neighborhood contains 24 components / 48 triangles per side, but adding that source geometry and the nearest non-Bridge FloorConcrete02 component leaves all six broad-glass anchors externally isolated. All five 25-anchor candidates remain 79/625. Therefore missing adjacent source triangles alone are not the current connectivity cause; traversal/collision semantics must be resolved before any navigation link or runtime promotion.'
  }),
  productionKccTraversalPass18D: Object.freeze({
    qaRunNumber: 891,
    characterMode: 'HUMAN' as const,
    directedProbeCount: 12,
    successfulDirectedProbeCount: 12,
    initiallySettledProbeCount: 12,
    totalAirborneTicks: 0,
    grateFloorDirectedProbeCount: 4,
    glassBridgeDirectedProbeCount: 4,
    bridgeFloorDirectedProbeCount: 4,
    usesSharedProductionCharacterControllerConfiguration: true,
    humanRadiusMeters: PLAYER_CHARACTER_PHYSICS.humanRadiusMeters,
    controllerOffsetMeters: PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters,
    effectiveHumanContactRadiusMeters:
      PLAYER_CHARACTER_PHYSICS.humanRadiusMeters +
      PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters,
    autostepMaxHeightMeters:
      PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters,
    snapToGroundMeters: PLAYER_CHARACTER_PHYSICS.snapToGroundMeters,
    recastNominalErosionRadiusMeters:
      GAME_CONFIG.cpu.navigationCellSizeMeters *
      GAME_CONFIG.cpu.navigationWalkableRadiusVoxels,
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
    userCaptureRequiredNow: false,
    notes:
      'Pass 18D feeds the same verified Pass 18C source-native grate/floor and Glass01/BridgeMetal/floor QA meshes into Rapier using the shared production Human capsule and KCC profile. All 12 mirrored/directed crossings settle successfully and complete with zero airborne ticks, while Pass 18C Recast remains 79/625 with the same islands. This localizes a reconstruction-level Recast/KCC representation mismatch rather than a lack of physically traversable candidate geometry. It does not by itself establish original-game grate walk-on/off directionality or bind the observed upper-glass ingress to one exact source transition, so no off-mesh link or runtime geometry is authorized.'
  }),
  recastRepresentationSweepPass18E: Object.freeze({
    qaRunNumber: 900,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    trustedSnapMeters: GAME_CONFIG.cpu.agentRadiusMeters,
    testedVariantCount: 7,
    production: Object.freeze({
      cellSizeMeters: 0.18,
      walkableRadiusVoxels: 2,
      nominalErosionMeters: 0.36,
      trustedBidirectionallyReachedPairs: 1,
      trustedDirectionReachCount: 2
    }),
    productionZeroErosion: Object.freeze({
      cellSizeMeters: 0.18,
      walkableRadiusVoxels: 0,
      nominalErosionMeters: 0,
      trustedBidirectionallyReachedPairs: 3,
      trustedDirectionReachCount: 6
    }),
    productionOneVoxelErosion: Object.freeze({
      cellSizeMeters: 0.18,
      walkableRadiusVoxels: 1,
      nominalErosionMeters: 0.18,
      trustedBidirectionallyReachedPairs: 2,
      trustedDirectionReachCount: 4
    }),
    finerSameErosion: Object.freeze({
      cellSizeMeters: 0.12,
      walkableRadiusVoxels: 3,
      nominalErosionMeters: 0.36,
      trustedBidirectionallyReachedPairs: 2,
      trustedDirectionReachCount: 4
    }),
    finerAgentRadius: Object.freeze({
      cellSizeMeters: 0.15,
      walkableRadiusVoxels: 2,
      nominalErosionMeters: 0.30,
      trustedBidirectionallyReachedPairs: 2,
      trustedDirectionReachCount: 4
    }),
    finerZeroErosion: Object.freeze({
      cellSizeMeters: 0.09,
      walkableRadiusVoxels: 0,
      nominalErosionMeters: 0,
      trustedBidirectionallyReachedPairs: 2,
      trustedDirectionReachCount: 4
    }),
    productionExtraClimbZeroErosion: Object.freeze({
      cellSizeMeters: 0.18,
      walkableRadiusVoxels: 0,
      walkableClimbVoxels: 8,
      nominalErosionMeters: 0,
      trustedBidirectionallyReachedPairs: 3,
      trustedDirectionReachCount: 6
    }),
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
    userCaptureRequiredNow: false,
    notes:
      'Pass 18E sweeps seven QA-only Recast representations over the six exact source-native KCC-feasible pairs and rejects raw path hits whose start/end snaps exceed the live CPU agent radius (0.30m). No variant trusted-connects all six pairs; the maximum is 3/6. BridgeMetal<->nearest FloorConcrete02 never trusted-connects in any variant, despite Pass 18D Human KCC traversal in both directions on both mirrored sides. The mirrored grate result is unstable and asymmetric under erosion/resolution changes, including a positive-only zero-erosion bridge that disappears again at 0.09m cells, so global Recast tuning is not authorized. By contrast the current 46-triangle runtime broad-glass nav mesh trusted-connects to the exact BridgeMetal neighborhood on both sides under production settings, localizing the tested upper-glass source chain break downstream at BridgeMetal<->FloorConcrete02 rather than at Glass01 itself. No link or runtime change is promoted.'
  }),
  localConnectorExperimentPass18F: Object.freeze({
    qaRunNumber: 908,
    diagnosticOnly: true,
    endpointMethod:
      'EXACT_TRIANGLE_CLOSEST_PAIR_PLUS_TRUSTED_COMBINED_RECAST_COMPONENT_SAMPLE' as const,
    trustedComponentSnapMeters: 0.30,
    candidateConnectorCount: 4,
    testedRadiiMeters: [0.10, 0.18, 0.30] as const,
    baselineReachedDirectedPairs: 79,
    baselineWeakComponentCount: 9,
    baselineStronglyConnectedComponentCount: 11,
    allTestedCandidateMatricesReachedDirectedPairs: 79,
    allTestedCandidateMatricesWeakComponentCount: 9,
    allTestedCandidateMatricesStronglyConnectedComponentCount: 11,
    candidateLinksChangedConnectivity: false,
    sourceBoundaryDistanceMeters: Object.freeze({
      gratePositive: 0.3454057383491051,
      grateNegative: 0.3454057383491022,
      glassPositive: 0.5185586972146101,
      glassNegative: 0.5185586972146126
    }),
    sampledEndpointBoundaryOffsetsMeters: Object.freeze({
      gratePositiveStart: 1.9872737049434641,
      gratePositiveEnd: 1.7340469343833274,
      grateNegativeStart: 2.232005707428001,
      grateNegativeEnd: 3.7509276456701515,
      glassPositiveStart: 3.216527889612188,
      glassPositiveEnd: 1.8492402471551055,
      glassNegativeStart: 3.2163496542765126,
      glassNegativeEnd: 2.3003785443214677
    }),
    minimumSampledEndpointBoundaryOffsetMeters: 1.7340469343833274,
    allSampledBoundaryOffsetsExceedTrustedSnapMeters: true,
    startEndpointMembership: Object.freeze({
      gratePositive: ['grate:UndertowT21D:positive-z-grate-mesh:0'] as const,
      grateNegative: ['grate:UndertowT21D:negative-z-grate-mesh:0'] as const,
      glassPositive: [
        'glass:positive-z:0',
        'glass:positive-z:1',
        'glass:positive-z:2'
      ] as const,
      glassNegative: [
        'glass:negative-z:0',
        'glass:negative-z:1',
        'glass:negative-z:2'
      ] as const
    }),
    endEndpointMutualTrackedAnchorMembershipCount: 0,
    allFourDestinationEndpointsOutsideTrackedAnchorSccs: true,
    syntheticDetourControl: Object.freeze({
      from: 'paint:UndertowT21D:center-origin-step-top-face:0' as const,
      to: 'paint:UndertowT21D:center-low-team-a' as const,
      reachedDirectedPairs: 87,
      weakComponentCount: 8,
      stronglyConnectedComponentCount: 10,
      centerStepRemainsIsolated: false
    }),
    detourMechanismOperational: true,
    oneHopBoundaryConnectorSufficient: false,
    destinationSourceChainBindingStillRequired: true,
    originalTraversalDirectionalityResolved: false,
    connectorPromotionAuthorized: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    userCaptureRequiredNow: false,
    notes:
      'Pass 18F tests four QA-only bidirectional local connector candidates at 0.10/0.18/0.30m radius. All candidate matrices remain exactly 79 directed reaches / 9 weak components / 11 SCCs. A synthetic control link between two known nav islands changes the matrix to 87/8/10 and removes the center-step singleton, proving the Detour link mechanism itself is operational. Candidate starts mutually belong to the intended grate/glass source islands, but all four candidate destination endpoints have zero mutual membership in the tracked 25-anchor graph. The nearest trusted sampled production-nav endpoints are also 1.734-3.751m away from the exact physical source boundaries. Therefore a one-hop boundary connector does not bind the isolated source islands into the current runtime anchor graph; the next task is to recover the remaining source-native destination chain before any connector semantics can be considered. No runtime link is authorized.'
  }),
  destinationSourceChainRecoveryPass18G: Object.freeze({
    qaRunNumber: 915,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    trustedRuntimeSnapMeters: 0.30,
    sourceAdjacencyThresholdsMeters: [0.03, 0.08, 0.18, 0.30] as const,
    relaxedDiscoveryThresholdMeters: 2.0,
    localInventoryMarginMeters: 12.0,
    runtimeSccCount: 11,
    grate: Object.freeze({
      candidateComponentCountPerSide: 42,
      relaxedEdgeCountPerSide: 116,
      relaxedReachableComponentCountPerSide: 8,
      downstreamRuntimeBoundComponentCountPerSide: 2,
      pathExistsAtOrBelow030Meters: false,
      relaxedPathComponentCountPerSide: 4,
      positivePathSourceKinds: [
        'FloorConcrete00',
        'FloorSlope00',
        'FloorConcrete02',
        'FloorSlope00'
      ] as const,
      negativePathSourceKinds: [
        'FloorConcrete00',
        'FloorSlope00',
        'FloorConcrete02',
        'FloorSlope00'
      ] as const,
      positivePathGapsMeters: [0, 0, 0.5185586972146141] as const,
      negativePathGapsMeters: [0, 0, 0.5185586972146133] as const,
      positiveTerminalAnchor:
        'paint:UndertowT21D:spawn-high-positive-z' as const,
      negativeTerminalAnchor:
        'paint:UndertowT21D:spawn-high-negative-z' as const,
      sourceChainStructurallyMirrored: true,
      trustedContinuousRuntimeBindingRecovered: false
    }),
    upperGlass: Object.freeze({
      candidateComponentCountPerSide: 101,
      relaxedEdgeCountPerSide: 353,
      excludedPredecessorBridgeComponentsPerSide: 24,
      relaxedReachableComponentCountPerSide: 58,
      pathToDownstreamRuntimeSccAtOrBelow030Meters: false,
      pathToDownstreamRuntimeSccAtOrBelow200Meters: false,
      positiveDownstreamRuntimeBoundCandidateCount: 10,
      negativeDownstreamRuntimeBoundCandidateCount: 8,
      frontierPairCountPerSide: 1401,
      nearestFrontierGapMeters: 2.074234789,
      nearestFrontierFromSourceKind: 'FloorConcrete01' as const,
      nearestFrontierToSourceKind: 'FloorSlope00' as const,
      nearestFrontierTiedTargetsPerSide: 2,
      sourceFrontierStructurallyMirrored: true,
      exactTransitionSemanticsResolved: false
    }),
    predecessorRuntimeSccExcludedAsTerminal: true,
    globalRecastParameterChangeAuthorized: false,
    convenienceGeometryAuthorized: false,
    offMeshLinkAuthorized: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    userCaptureRequiredNow: false,
    notes:
      'Pass 18G follows the exact Temple01 source-native destination components rather than adding a guessed bridge. On both grate sides, the relaxed source graph yields the same four-component sequence FloorConcrete00 -> FloorSlope00 -> FloorConcrete02 -> FloorSlope00; the first two transitions are exact contact and the final source-surface gap is 0.518558697m before the mirrored spawn-high runtime SCC. No path exists at the trusted <=0.30m adjacency threshold, so this is a localized route candidate, not an authorized navigation connection. On both upper-glass sides, excluding the already-known predecessor Glass/BridgeMetal source neighborhood leaves 101 local candidates / 353 <=2m edges; exactly 58 components are reachable, but none reaches a downstream runtime SCC even at 2.0m. The nearest ordinary-walk frontier is a mirrored 2.074234789m FloorConcrete01 -> FloorSlope00 gap (two tied targets per side). Runtime-bound candidate counts differ 10 vs 8 only because current Recast projection is asymmetric; the source inventory/frontier is mirrored. No connector, slab, global Recast tuning, or runtime geometry is authorized. FULL_STAGE_CONNECTIVITY_QA_PENDING remains activation-blocking.'
  }),
  localGapSourceClassAuditPass18H: Object.freeze({
    sourceAuditRunNumber: 918,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    localMarginMeters: 3.0,
    trustedBridgeMeters: 0.30,
    humanContactMeters: 0.345,
    ordinaryWalkStrictBridgeCandidateCountTotal: 0,
    grate: Object.freeze({
      positiveGapMeters: 0.5185586972146141,
      negativeGapMeters: 0.5185586972146133,
      nearbySourceComponentCountPerSide: 142,
      strictBridgeCandidateCountPerSide: 4,
      humanContactBridgeCandidateCountPerSide: 4,
      floorLineOverlayCandidateCountPerSide: 3,
      nonOverlayCandidateCountPerSide: 1,
      nonOverlaySourceMaterial: 'Fld_Temple01_Object00' as const,
      nonOverlayWalkQualified: false,
      nonOverlaySteepOrNonUpward: true,
      ordinaryWalkBridgeRecovered: false,
      sourceClassPatternMirrored: true
    }),
    upperGlass: Object.freeze({
      nearestFrontierGapMeters: 2.07423478885845,
      tiedFrontierCountPerSide: 2,
      strictBridgeCandidateCountsAcrossTiedFrontiers: [0, 2] as const,
      humanContactBridgeCandidateCountsAcrossTiedFrontiers: [0, 2] as const,
      strictBridgeMaterial: 'Fld_Temple01_FloorLine00' as const,
      strictBridgeCandidatesAreOverlayOnly: true,
      ordinaryWalkBridgeRecovered: false,
      positiveOverlayBridgedTarget:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c12' as const,
      positiveUnbridgedTarget:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c15' as const,
      negativeOverlayBridgedTarget:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c17' as const,
      negativeUnbridgedTarget:
        'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c13' as const,
      mirroredFrontierDisposition: true
    }),
    hiddenOrdinaryWalkSourceRecovered: false,
    overlayOrSteepGeometryAuthorizesTraversal: false,
    exactGapVectorOrTraversalSemanticsStillRequired: true,
    globalRecastParameterChangeAuthorized: false,
    convenienceGeometryAuthorized: false,
    offMeshLinkAuthorized: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    userCaptureRequiredNow: false,
    notes:
      'Pass 18H expands the localized Pass 18G gaps across every nearby Temple01 source material instead of treating material names as walk authority. At each mirrored grate-side 0.518558697m gap, four <=0.30m third-component candidates exist, but three are FloorLine00 marking overlays and the only non-overlay candidate is Object00 with no walk-qualified face and steep/non-upward geometry. At the mirrored 2.074234789m upper-glass frontier, one of the two tied targets per side has two <=0.30m bridge candidates and both are FloorLine00 overlays; the other tied target has none. Across all strict candidates, zero walk-qualified bridge faces are recovered. Therefore neither overlays nor steep Object00 geometry authorizes a navigation connector or slab. Exact gap-vector / original traversal semantics remain required and FULL_STAGE_CONNECTIVITY_QA_PENDING stays active.'
  }),

  exactGapVectorAuditPass18I: Object.freeze({
    sourceAuditRunNumber: 923,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    temple01RegistrationScale: 0.964211,
    grate: Object.freeze({
      positiveProjectGapMeters: 0.5185586972146141,
      negativeProjectGapMeters: 0.5185586972146198,
      modelGapMeters: 0.5,
      modelHorizontalGapMeters: 0.5,
      modelVerticalDeltaMeters: 0,
      closestSeparationAxis: 'MODEL_Z' as const,
      positiveModelDelta: [0, 0, 0.5] as const,
      negativeModelDelta: [0, 0, -0.5] as const,
      positiveEndpointsModel: [
        [-30.5, 9.0, 35.5],
        [-30.5, 9.0, 36.0]
      ] as const,
      negativeEndpointsModel: [
        [30.5, 9.0, -35.5],
        [30.5, 9.0, -36.0]
      ] as const,
      exactHalfMeterModelGap: true,
      purelyHorizontalClosestSeparation: true,
      structurallyMirrored: true
    }),
    upperGlass: Object.freeze({
      projectGapMeters: 2.07423478885845,
      modelGapMeters: 2.0,
      modelHorizontalGapMeters: 2.0,
      modelVerticalDeltaMeters: 0,
      closestSeparationAxis: 'MODEL_Z' as const,
      modelY: 3.0,
      positiveModelZ: [21.5, 19.5] as const,
      negativeModelZ: [-21.5, -19.5] as const,
      absoluteModelXFrontierLines: [4.25, 16.0] as const,
      exactTwoMeterModelGap: true,
      purelyHorizontalClosestSeparation: true,
      tiedFrontiersStructurallyMirrored: true
    }),
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
    userCaptureRequiredNow: false,
    notes:
      'Pass 18I decomposes the Pass 18H endpoint pairs with exact triangle closest-point geometry in both project and Temple01 model coordinates. The mirrored grate-side source separation is exactly 0.5m in model Z at model Y=9.0, with zero vertical delta; the project-space 0.518558697m value is solely the registered XZ scale. The two mirrored upper-glass frontier alternatives are exactly 2.0m in model Z at model Y=3.0, again with zero vertical delta, on |model X|=4.25 and 16.0 lines. Therefore the localized closest separations are horizontal gaps, not height steps. This does not determine original jump/directionality semantics or whether the production KCC can physically cross each exact gap; those remain the next QA boundary.'
  }),

  productionKccExactGapPass18J: Object.freeze({
    qaRunNumber: 930,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    directedProbeCount: 12,
    insetMeters: 0.40,
    humanRadiusMeters: 0.32,
    controllerOffsetMeters: 0.025,
    effectiveHumanContactRadiusMeters: 0.345,
    autostepMaxHeightMeters: 0.34,
    snapToGroundMeters: 0.24,
    grate: Object.freeze({
      directedProbeCount: 4,
      successfulDirectedProbeCount: 4,
      failedDirectedProbeCount: 0,
      allSettledInitially: true,
      totalAirborneTicks: 0,
      allDirectionsRemainGrounded: true,
      maximumDropBelowSurfaceMeters: 0.08481084823608409,
      exactHalfMeterGapGroundedTraversalFeasible: true,
      mirroredBidirectionalPhysicalFeasibility: true
    }),
    upperGlass: Object.freeze({
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
    }),
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
    userCaptureRequiredNow: false,
    notes:
      'Pass 18J drives the shared production Human Rapier KCC directly across the exact Pass 18I same-height source gaps using only the two endpoint walk meshes. All four mirrored/directed 0.5m grate-side probes succeed while remaining grounded for the entire crossing, with zero airborne ticks and <0.085m observed foot drop. All eight mirrored/directed 2.0m upper-glass frontier probes fail the grounded-traversal criterion, become airborne for 20-23 ticks, and drop about 1.99-2.52m even though horizontal motion continues toward the target. Therefore the grate disconnect is further localized as a Recast representation mismatch for a physically ground-traversable narrow gap, while the tested upper-glass frontier cannot be represented as an ordinary grounded walk. This still does not by itself authorize an original-game navigation link or resolve gameplay directionality/jump semantics.'
  }),

  rawBoundaryGrateChainPass18K: Object.freeze({
    qaRunNumber: 935,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    linkRadiusMeters: 0.30,
    candidateLinkCount: 4,
    candidateDirectionality:
      'BIDIRECTIONAL_QA_ONLY_FROM_PASS18D_AND_PASS18J_KCC' as const,
    positiveIngressBoundaryDistanceMeters: 0.3454057383491051,
    negativeIngressBoundaryDistanceMeters: 0.3454057383491022,
    finalGapModelMeters: 0.5,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18K binds the complete eight-component source-native grate continuation per side and tests exactly four QA-only bidirectional links: grate->FloorConcrete00 ingress plus the Pass 18I exact 0.5m FloorConcrete02->FloorSlope00 gap on each side. Using the exact source-boundary endpoints, ingress-only, final-gap-only, and all-four variants remain exactly 79 reached directed pairs / 9 weak components / 11 SCCs; both grate anchors remain singleton islands. Therefore simply adding the complete source chain plus raw-boundary Detour links is insufficient under production Recast erosion.'
  }),
  trustedEndpointGrateChainPass18L: Object.freeze({
    qaRunNumber: 937,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
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
    positiveIngressTrustedEndpointDistanceMeters: 3.338013739086229,
    negativeIngressTrustedEndpointDistanceMeters: 4.996651842296954,
    positiveFinalTrustedEndpointDistanceMeters: 6.370536111620433,
    negativeFinalTrustedEndpointDistanceMeters: 6.360070727543967,
    minimumSourceBoundaryOffsetMeters: 1.7340469343833274,
    maximumSourceBoundaryOffsetMeters: 5.499147868379137,
    connectivityImprovedWithTrustedInteriorEndpoints: true,
    trustedProjectionRemainsLocalToSourceBoundary: false,
    localConnectorSemanticsValidated: false,
    nonlocalProjectionMakesCandidateUnfitForPromotion: true,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18L repeats the same four Pass 18K transitions but moves each endpoint to a <=0.30m-trusted Recast interior point sampled from its own source component. Connectivity rises from 79/9/11 to 89/7/9 and both grate singleton islands join their mirrored spawn-side route clusters. However the trusted nav points are not local to the physical source gaps: source-boundary offsets span 1.734046934-5.499147868m, ingress link endpoint separations are 3.338013739m / 4.996651842m, and the final 0.5m physical gaps become 6.370536112m / 6.360070728m nav-space links. This proves endpoint attachment/erosion is the blocker, but also proves this candidate is a nonlocal shortcut rather than a faithful local connector. No runtime promotion is authorized.'
  }),

  trustedEndpointMinimalityPass18M: Object.freeze({
    qaRunNumber: 941,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18M decomposes the four nonlocal trusted-endpoint links from Pass 18L. Neither ingress-only nor final-gap-only links change the 79/9/11 baseline, and every individual link is likewise inert. The two-link POSITIVE_Z pair alone yields 84/8/10 and resolves only the positive grate singleton; the mirrored NEGATIVE_Z pair produces the same 84/8/10 and resolves only the negative grate singleton. All four links reproduce 89/7/9. Therefore each mirrored grate route contains two independently necessary Recast attachment breaks: grate->source-chain ingress and the later 0.5m FloorConcrete02->FloorSlope00 break. Because the only working endpoints remain the nonlocal Pass 18L projections, this is diagnostic minimality evidence and not promotion authority.'
  }),

  rawBoundaryRadiusSweepPass18N: Object.freeze({
    qaRunNumber: 945,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    testedRadiiMeters: [0.30, 0.36, 0.45, 0.60, 1.00, 1.50, 2.00, 3.00, 4.00, 6.00] as const,
    physicalEndpointCount: 4,
    baselineReachedDirectedPairs: 79,
    baselineWeakComponentCount: 9,
    baselineStronglyConnectedComponentCount: 11,
    bothSidesFailThrough060Meters: true,
    negativeFirstSuccessfulRadiusMeters: 1.0,
    negativeRemainsBidirectionallyConnectedThrough600Meters: true,
    positiveSuccessfulRadiusMetersAtOrBelow600: null,
    positiveForwardEndpointErrorMetersAt600: 46.86031243966464,
    positiveReverseEndpointErrorMetersAt600: 2.9400917651756426,
    negativeForwardEndpointErrorMetersAt100: 0,
    negativeReverseEndpointErrorMetersAt100: 0,
    mirroredSourceProducesAsymmetricRawBoundaryAttachment: true,
    globalRawBoundaryRadiusSolutionFound: false,
    radiusIncreaseIsSafePromotionStrategy: false,
    localConnectorSemanticsValidated: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18N keeps the four Pass 18K physical source-boundary endpoints fixed and sweeps only Detour off-mesh attachment radius from 0.30m to 6.00m. Both mirrored sides remain disconnected through 0.60m. At 1.00m the NEGATIVE_Z pair becomes bidirectionally connected with zero endpoint error and stays connected through 6.00m, but POSITIVE_Z never reaches its spawn-side route even at 6.00m; its forward endpoint error remains 46.860312440m and reverse remains 2.940091765m. Because the source geometry is structurally mirrored, this one-sided threshold is a Recast attachment asymmetry, not authority for a larger production link radius. No global or local radius-only promotion is authorized.'
  }),

  endpointHybridPass18O: Object.freeze({
    qaRunNumber: 949,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    trustedSnapMeters: 0.30,
    trustedLinkRadiusMeters: 0.30,
    rawRadiiMeters: [0.30, 1.00, 6.00] as const,
    baselineReachedDirectedPairs: 79,
    baselineWeakComponentCount: 9,
    baselineStronglyConnectedComponentCount: 11,
    positive: Object.freeze({
      at030RawIngressTrustedFinalConnected: false,
      at030TrustedIngressRawFinalConnected: false,
      at100RawIngressTrustedFinalConnected: false,
      at100TrustedIngressRawFinalConnected: true,
      at100AllRawConnected: false,
      at100AllTrustedConnected: true,
      at600RawIngressTrustedFinalConnected: false,
      at600TrustedIngressRawFinalConnected: true,
      at600AllRawConnected: false,
      at100RawIngressForwardEndpointErrorMeters: 46.86031243966464,
      at100RawIngressReverseEndpointErrorMeters: 2.9400917651756426,
      rawIngressAttachmentResolvedAtOrBelow600: false,
      rawFinalAttachmentResolvedAt100: true
    }),
    negative: Object.freeze({
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
    }),
    positiveOnlyPersistentRawAttachmentBlocker: 'GRATE_TO_FLOORCONCRETE00_INGRESS' as const,
    finalHalfMeterRawAttachmentWorksBothSidesAt100: true,
    mirroredAsymmetryLocalizedToPositiveIngress: true,
    radiusIncreaseStillNotPromotionAuthority: true,
    localConnectorSemanticsValidated: false,
    originalGrateDirectionalityResolved: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18O mixes raw physical-boundary and trusted nonlocal endpoints per break. At 0.30m both hybrid variants fail on both sides while all-trusted succeeds. At 1.00m and 6.00m, POSITIVE_Z succeeds when ingress is trusted and the final 0.5m gap stays raw, but still fails when ingress stays raw and final is trusted; NEGATIVE_Z succeeds in both hybrids and all-raw from 1.00m upward. Therefore the persistent mirrored asymmetry from Pass 18N is isolated specifically to the POSITIVE_Z grate->FloorConcrete00 raw ingress attachment. The later 0.5m raw final-gap attachment is viable on both sides at 1.00m when ingress is already attached. This does not authorize a 1.00m production radius or any runtime link; the positive ingress nav-poly/erosion binding must be localized directly.'
  }),

  ingressEndpointIsolationPass18P: Object.freeze({
    qaRunNumber: 954,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    trustedSnapMeters: 0.30,
    trustedFinalLinkRadiusMeters: 0.30,
    rawIngressRadiiMeters: [0.30, 1.00, 6.00] as const,
    baselineReachedDirectedPairs: 79,
    baselineWeakComponentCount: 9,
    baselineStronglyConnectedComponentCount: 11,
    positive: Object.freeze({
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
    }),
    negative: Object.freeze({
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
    }),
    persistentPositiveAttachmentBlocker:
      'POSITIVE_Z_GRATE_SIDE_RAW_INGRESS_START' as const,
    positiveFloorConcrete00RawIngressEndWorksAt100: true,
    negativeGrateSideRawStartWorksDespiteLargerClosestPointSnap: true,
    closestPointSnapMagnitudeExplainsAsymmetry: false,
    mirroredAsymmetryLocalizedToPositiveGrateSideStart: true,
    radiusIncreaseStillNotPromotionAuthority: true,
    localConnectorSemanticsValidated: false,
    originalGrateDirectionalityResolved: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18P splits the Pass 18O ingress itself into grate-side start and FloorConcrete00-side end endpoints while keeping the later final-gap link trusted. At radius 1.00m and 6.00m, POSITIVE_Z still fails whenever the grate-side start remains raw, even if the FloorConcrete00 end is trusted; replacing only the grate-side start with its trusted interior point makes the raw FloorConcrete00 end succeed. NEGATIVE_Z succeeds with all raw/trusted start/end combinations from 1.00m. The raw-start closest-point snap magnitude is 0.647255m positive versus an even larger 0.740180m negative, so scalar closest-point distance does not explain the asymmetry. The remaining defect boundary is the POSITIVE_Z grate-side raw ingress start attachment/nav-poly identity.'
  }),

  probeCount: UNDERTOW_T21D_CONNECTIVITY_PROBES.length,
  mustReachProbeCount: UNDERTOW_T21D_CONNECTIVITY_PROBES.filter(
    (probe) => probe.expectation === 'MUST_REACH'
  ).length,
  diagnosticGapProbeCount: UNDERTOW_T21D_CONNECTIVITY_PROBES.filter(
    (probe) => probe.expectation === 'DIAGNOSTIC_GAP'
  ).length,
  bothSidesDirectlyProbed: true,
  rightLowToUnderpassResolved: false,
  centerSmallStepNavigationResolved: false,
  upperGlassBroadNavigationReconstructionBound: true,
  upperGlassThinEdgeFrameNavigationAuthorityResolved: false,
  upperGlassNavigationAuthorityResolved: false,
  allTraversableRuntimeGeometryBound: false,
  fullStageConnectivityReady: false,
  knownBlockingTransitions: [
    'right-low-to-underpass-positive-z',
    'right-low-to-underpass-negative-z',
    'center-small-step-positive-z',
    'center-small-step-negative-z'
  ] as const,
  additionalDisconnectedTraversableRegions: [
    'negative-z-grate',
    'positive-z-grate',
    'positive-z-upper-glass-broad',
    'negative-z-upper-glass-broad'
  ] as const,
  missingRequirements: [
    'Authoritative runtime binding for the right-low-to-underpass transition on both mirrored sides, or authoritative traversal semantics that justify a specific link type.',
    'Authoritative traversal semantics for the two already-measured +1.5m center-small-step strips. The STEP geometry/delta is known, but directionality and jump requirement are not recorded, so no CPU off-mesh link may be guessed.',
    'Localize the POSITIVE_Z grate-side raw ingress start to the wrong/no Recast polygon and find the minimum faithful local correction. Pass 18P proves the FloorConcrete00-side raw ingress end works at radius 1.00m once only the grate-side start is trusted, while any variant retaining the POSITIVE_Z raw grate-side start fails through 6.00m. The negative raw grate-side start succeeds despite a larger closest-point snap distance, so inspect polygon/island membership or sweep small in-surface start offsets rather than using scalar snap distance or global radius as a fix. Original grate walk-on/off directionality remains an independent promotion gate.',
    'Resolve the actual upper-glass transition identity. Pass 18J proves all eight no-jump Human KCC probes across the two mirrored 2.0m same-height frontier alternatives become airborne and fail grounded traversal, so a simple walk connector is physically unsupported. Recover authoritative jump/drop/alternate-route semantics or another source-native transition before authoring any upper-glass navigation.',
    'A final production-candidate Recast pass after all traversable Undertow geometry is bound, with spawn-to-major-region, grate, upper-glass, unpaintable traversable-region, and mirrored cross-route probes run against that exact candidate.'
  ] as const,
  notes:
    'Pass 18P preserves Passes 18A-18O and isolates the persistent grate asymmetry to the POSITIVE_Z grate-side raw ingress start endpoint. The FloorConcrete00-side raw end is viable at radius 1.00m once the start is trusted, while retaining the positive raw start fails through 6.00m. NEGATIVE_Z succeeds from 1.00m even though its raw-start closest-point snap is larger, excluding snap magnitude as the explanation. The next safe diagnostic is polygon/island identity or minimal in-surface retreat for that single positive start endpoint; production geometry, Recast globals, and runtime links remain unchanged. The upper-glass transition remains independently unresolved. FULL_STAGE_CONNECTIVITY_QA_PENDING remains activation-blocking.'
});
export function undertowFullStageConnectivityAuditErrors(): readonly string[] {
  const audit = UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT;
  const errors: string[] = [];
  const ids = new Set(UNDERTOW_T21D_CONNECTIVITY_PROBES.map((probe) => probe.id));

  if (audit.probeCount !== 8 || ids.size !== 8) {
    errors.push('connectivity QA must contain eight unique mirrored focused probes');
  }
  if (audit.mustReachProbeCount !== 6 || audit.diagnosticGapProbeCount !== 2) {
    errors.push('connectivity QA focused-probe expectation counts drifted');
  }
  for (const id of [
    'first-drop-positive-z',
    'first-drop-negative-z',
    'right-small-drop-positive-z',
    'right-small-drop-negative-z',
    'right-low-ramp-positive-z',
    'right-low-ramp-negative-z',
    'right-low-to-underpass-positive-z',
    'right-low-to-underpass-negative-z'
  ] as const) {
    if (!ids.has(id)) errors.push(`${id}: mirrored connectivity probe missing`);
  }

  if (
    audit.rightLowToUnderpassResolved ||
    audit.centerSmallStepNavigationResolved ||
    !audit.upperGlassBroadNavigationReconstructionBound ||
    audit.upperGlassThinEdgeFrameNavigationAuthorityResolved ||
    audit.upperGlassNavigationAuthorityResolved ||
    audit.allTraversableRuntimeGeometryBound ||
    audit.fullStageConnectivityReady
  ) {
    errors.push('Pass 18P partial QA must not claim full-stage connectivity readiness');
  }

  const matrix = audit.paintAnchorMatrixPass18A;
  if (
    audit.resolutionPass !== '18P' ||
    matrix.anchorCount !== 17 ||
    matrix.directedPairCount !== 289 ||
    matrix.reachedDirectedPairCountIncludingSelf !== 59 ||
    matrix.missedDirectedPairCount !== 230 ||
    matrix.reachedNonSelfDirectedPairCount !== 42 ||
    matrix.weakComponentCount !== 5 ||
    matrix.stronglyConnectedComponentCount !== 7 ||
    !matrix.centerOriginStepTopIsSingleton ||
    matrix.centerOriginStepTopReachableAnchorCountIncludingSelf !== 1 ||
    matrix.previousTwoGapInventoryWasComplete ||
    matrix.qaRunNumber !== 870
  ) {
    errors.push('Pass 18A 17x17 paint-anchor connectivity matrix drifted');
  }

  const step = audit.centerSmallStepGapAudit;
  const stepEntries = step.transitionEntryIds.map((id) =>
    UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER.entries.find((entry) => entry.id === id)
  );
  if (
    step.transitionCount !== 2 ||
    step.canonicalTransitionKind !== 'STEP' ||
    step.canonicalDeltaYMeters !== 1.5 ||
    !step.exactTransitionStripsMeasured ||
    step.transitionStripsDepthMeters !== 0.75 ||
    !step.stepTopRuntimeSurfaceBound ||
    step.runtimeNavigationTransitionBound ||
    step.traversalDirectionResolved ||
    step.jumpRequirementResolved ||
    Math.abs(step.automaticRecastClimbMeters - 0.4) > 1e-9 ||
    step.automaticRecastCanBridgeCanonicalDelta ||
    step.offMeshLinkAuthorized ||
    step.runtimePromotionAuthorized ||
    step.userCaptureRequiredNow ||
    stepEntries.some(
      (entry) =>
        !entry ||
        entry.featureKind !== 'TRANSITION' ||
        entry.transition.kind !== 'STEP' ||
        entry.transition.deltaYMeters !== 1.5 ||
        entry.confidence !== 'CONFIRMED'
    )
  ) {
    errors.push('Pass 18A center-small-step gap authority boundary drifted');
  }

  if (audit.knownBlockingTransitions.length !== 4) {
    errors.push('Pass 18F must retain both mirrored underpass and center-step gaps');
  }

  const anchors18b = undertowPass18bTraversableQaAnchors();
  const matrix18b = audit.traversableAnchorMatrixPass18B;
  if (
    anchors18b.length !== 25 ||
    anchors18b.filter((anchor) => anchor.kind === 'PAINT_SURFACE').length !== 17 ||
    anchors18b.filter((anchor) => anchor.kind === 'GRATE').length !== 2 ||
    anchors18b.filter((anchor) => anchor.kind === 'UPPER_GLASS_BROAD').length !== 6 ||
    new Set(anchors18b.map((anchor) => anchor.id)).size !== 25 ||
    matrix18b.anchorCount !== 25 ||
    matrix18b.paintAnchorCount !== 17 ||
    matrix18b.grateAnchorCount !== 2 ||
    matrix18b.upperGlassBroadAnchorCount !== 6 ||
    matrix18b.directedPairCount !== 625 ||
    matrix18b.reachedDirectedPairCountIncludingSelf !== 79 ||
    matrix18b.missedDirectedPairCount !== 546 ||
    matrix18b.reachedNonSelfDirectedPairCount !== 54 ||
    matrix18b.weakComponentCount !== 9 ||
    matrix18b.stronglyConnectedComponentCount !== 11 ||
    matrix18b.isolatedAnchorIds.join(',') !==
      'paint:UndertowT21D:center-origin-step-top-face:0,grate:UndertowT21D:negative-z-grate-mesh:0,grate:UndertowT21D:positive-z-grate-mesh:0' ||
    matrix18b.upperGlassPositiveBroadInternalAnchorCount !== 3 ||
    matrix18b.upperGlassNegativeBroadInternalAnchorCount !== 3 ||
    matrix18b.upperGlassBroadExternallyConnected ||
    Math.abs(matrix18b.maximumObservedAnchorSnapMeters - 0.24704275013919783) > 1e-9 ||
    matrix18b.qaRunNumber !== 873
  ) {
    errors.push('Pass 18B 25x25 traversable-anchor connectivity matrix drifted');
  }

  const grate = audit.grateIngressPass18B;
  const grateEntries = [
    'negative-z-grate-mesh',
    'positive-z-grate-mesh'
  ].map((id) =>
    UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER.entries.find((entry) => entry.id === id)
  );
  if (
    grate.confirmedTraversableGrateCount !== 2 ||
    grate.isolatedGrateAnchorCount !== 2 ||
    Math.abs(grate.negativePlanSharedBoundaryMeters - 6.375) > 1e-9 ||
    Math.abs(grate.positivePlanSharedBoundaryMeters - 6.375) > 1e-9 ||
    !grate.sharesExactPlanBoundaryWithSpawnSideWhiteFace ||
    !grate.adjacentSpawnSideWhiteFaceIsMultiElevation ||
    grate.adjacentContinuousUpperTerrainRuntimeBindingResolved ||
    grate.offMeshLinkAuthorized ||
    grate.userCaptureRequiredNow ||
    grateEntries.some(
      (entry) =>
        !entry ||
        entry.featureKind !== 'SURFACE' ||
        entry.confidence !== 'CONFIRMED' ||
        !entry.surface.semantics.includes('GRATE') ||
        !entry.surface.semantics.includes('UNINKABLE')
    )
  ) {
    errors.push('Pass 18B grate-ingress authority boundary drifted');
  }

  const thin = audit.upperGlassThinEdgeNavigationPass18B;
  if (
    thin.broadNavigationTrianglesPerSide !== 46 ||
    thin.diagnosticCandidateTrianglesPerSide !== 48 ||
    thin.addedThinEdgeTriangleIds.join(',') !== '98,99' ||
    thin.thinEdgeProbeCount !== 2 ||
    Math.abs(thin.thinEdgeMinimumInteriorClearanceMeters - 0.046493) > 1e-6 ||
    Math.abs(thin.recastCellSizeMeters - 0.18) > 1e-9 ||
    thin.recastWalkableRadiusVoxels !== 2 ||
    Math.abs(thin.recastNominalErosionRadiusMeters - 0.36) > 1e-9 ||
    !thin.baselineAndThinEdgeCandidateMatricesIdentical ||
    thin.currentPartialCandidateExternalBridgeAdded ||
    thin.currentGlassIsolationCausedByThinEdgeExclusion ||
    thin.finalThinEdgeNavigationDispositionResolved ||
    !thin.requiresRetestAfterAdjacentUpperTerrainBinding ||
    thin.runtimePromotionAuthorized ||
    thin.qaRunNumber !== 874
  ) {
    errors.push('Pass 18B upper-glass thin-edge navigation audit drifted');
  }

  if (
    audit.additionalDisconnectedTraversableRegions.join(',') !==
      'negative-z-grate,positive-z-grate,positive-z-upper-glass-broad,negative-z-upper-glass-broad'
  ) {
    errors.push('Pass 18B disconnected traversable-region inventory drifted');
  }

  const source18c = audit.sourceNativeUpperTerrainPass18C;
  if (
    source18c.sourceAuditScope !== 'QA_ONLY_SOURCE_NATIVE_ADJACENCY' ||
    source18c.sourceAuditRunNumber !== 886 ||
    source18c.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    !source18c.exactTriangleDistanceIncludesEdgeEdge ||
    source18c.baselineMatrixReachedPairs !== 79 ||
    source18c.geometryOnlyAdjacentBindingChangedConnectivity ||
    source18c.missingAdjacentTriangleHypothesisSufficient ||
    !source18c.traversalOrCollisionSemanticsStillRequired ||
    source18c.convenienceGeometryAuthorized ||
    source18c.offMeshLinkAuthorized ||
    source18c.runtimePromotionAuthorized ||
    source18c.activationBlockerCleared ||
    source18c.userCaptureRequiredNow
  ) {
    errors.push('Pass 18C source-native authority boundary drifted');
  }

  const sourceGrate = source18c.grate;
  if (
    sourceGrate.qualifiedSourceComponentsPerSide !== 8 ||
    sourceGrate.sourceTrianglesPerSide !== 16 ||
    Math.abs(sourceGrate.sourceAreaSquareMetersPerSide - 19.054820) > 1e-6 ||
    sourceGrate.exactMirrorVertexXor !== 0 ||
    Math.abs(sourceGrate.nearestWalkDistanceMeters - 0.335410) > 1e-6 ||
    sourceGrate.nearestWalkSourceObject !==
      'Fld_Temple01_pCube21525_1__FloorConcrete00' ||
    sourceGrate.sourceGraphReachableAt030Meters ||
    !sourceGrate.sourceGraphReachableAt040Meters ||
    sourceGrate.sourceNativeReplacementMatrixReachedPairs !== 79 ||
    sourceGrate.sourceNativePlusNearestFloorMatrixReachedPairs !== 79 ||
    !sourceGrate.remainsSingletonAfterSourceNativeReplacement ||
    !sourceGrate.remainsSingletonAfterNearestFloorBinding
  ) {
    errors.push('Pass 18C source-native grate experiment drifted');
  }

  const sourceGlass = source18c.upperGlass;
  if (
    sourceGlass.pass13aRouteSeedCountPerSide !== 3 ||
    sourceGlass.sourceRouteComponentsPerSide !== 3 ||
    sourceGlass.sourceBroadTrianglesPerSide !== 6 ||
    Math.abs(sourceGlass.sourceBroadAreaSquareMetersPerSide - 58.171653) > 1e-6 ||
    Math.abs(sourceGlass.nearestBridgeMetalDistanceMeters - 0.055902) > 1e-6 ||
    sourceGlass.bridgeReachableComponentsAt030MetersPerSide !== 24 ||
    sourceGlass.bridgeReachableTrianglesAt030MetersPerSide !== 48 ||
    Math.abs(sourceGlass.bridgeReachableAreaSquareMetersPerSide - 9.332461) > 1e-6 ||
    Math.abs(sourceGlass.nearestNonBridgeWalkDistanceMeters - 0.7) > 1e-9 ||
    sourceGlass.nearestNonBridgeWalkSourceObject !==
      'Fld_Temple01_pCube20989_1__FloorConcrete02' ||
    sourceGlass.bridgeOnlyMatrixReachedPairs !== 79 ||
    sourceGlass.bridgePlusNearestFloorMatrixReachedPairs !== 79 ||
    sourceGlass.bridgeOnlyExternalGlassReachCount !== 0 ||
    sourceGlass.bridgePlusNearestFloorExternalGlassReachCount !== 0
  ) {
    errors.push('Pass 18C source-native upper-glass experiment drifted');
  }

  const kcc18d = audit.productionKccTraversalPass18D;
  if (
    kcc18d.qaRunNumber !== 891 ||
    kcc18d.characterMode !== 'HUMAN' ||
    kcc18d.directedProbeCount !== 12 ||
    kcc18d.successfulDirectedProbeCount !== 12 ||
    kcc18d.initiallySettledProbeCount !== 12 ||
    kcc18d.totalAirborneTicks !== 0 ||
    kcc18d.grateFloorDirectedProbeCount !== 4 ||
    kcc18d.glassBridgeDirectedProbeCount !== 4 ||
    kcc18d.bridgeFloorDirectedProbeCount !== 4 ||
    !kcc18d.usesSharedProductionCharacterControllerConfiguration ||
    Math.abs(kcc18d.humanRadiusMeters - 0.32) > 1e-9 ||
    Math.abs(kcc18d.controllerOffsetMeters - 0.025) > 1e-9 ||
    Math.abs(kcc18d.effectiveHumanContactRadiusMeters - 0.345) > 1e-9 ||
    Math.abs(kcc18d.autostepMaxHeightMeters - 0.34) > 1e-9 ||
    Math.abs(kcc18d.snapToGroundMeters - 0.24) > 1e-9 ||
    Math.abs(kcc18d.recastNominalErosionRadiusMeters - 0.36) > 1e-9 ||
    kcc18d.pass18cSourceNativeRecastMatrixStillReachedPairs !== 79 ||
    !kcc18d.currentReconstructionPhysicalTraversalFeasible ||
    kcc18d.currentRecastRepresentationMatchesPhysicalTraversal ||
    !kcc18d.navigationDiscretizationMismatchLocalized ||
    kcc18d.originalGrateWalkOnOffSemanticsResolved ||
    kcc18d.exactOriginalGlassIngressSourceBindingResolved ||
    kcc18d.kccResultAloneAuthorizesOriginalGameplaySemantics ||
    kcc18d.offMeshLinkAuthorized ||
    kcc18d.runtimePromotionAuthorized ||
    kcc18d.activationBlockerCleared ||
    kcc18d.userCaptureRequiredNow
  ) {
    errors.push('Pass 18D production-KCC traversal boundary drifted');
  }

  const sweep18e = audit.recastRepresentationSweepPass18E;
  if (
    sweep18e.qaRunNumber !== 900 ||
    sweep18e.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(sweep18e.trustedSnapMeters - 0.30) > 1e-9 ||
    sweep18e.testedVariantCount !== 7 ||
    sweep18e.production.trustedBidirectionallyReachedPairs !== 1 ||
    sweep18e.production.trustedDirectionReachCount !== 2 ||
    sweep18e.productionZeroErosion.trustedBidirectionallyReachedPairs !== 3 ||
    sweep18e.productionZeroErosion.trustedDirectionReachCount !== 6 ||
    sweep18e.productionOneVoxelErosion.trustedBidirectionallyReachedPairs !== 2 ||
    sweep18e.productionOneVoxelErosion.trustedDirectionReachCount !== 4 ||
    sweep18e.finerSameErosion.trustedBidirectionallyReachedPairs !== 2 ||
    sweep18e.finerSameErosion.trustedDirectionReachCount !== 4 ||
    sweep18e.finerAgentRadius.trustedBidirectionallyReachedPairs !== 2 ||
    sweep18e.finerAgentRadius.trustedDirectionReachCount !== 4 ||
    sweep18e.finerZeroErosion.trustedBidirectionallyReachedPairs !== 2 ||
    sweep18e.finerZeroErosion.trustedDirectionReachCount !== 4 ||
    sweep18e.productionExtraClimbZeroErosion.trustedBidirectionallyReachedPairs !== 3 ||
    sweep18e.productionExtraClimbZeroErosion.trustedDirectionReachCount !== 6 ||
    sweep18e.maximumTrustedBidirectionallyReachedPairs !== 3 ||
    sweep18e.allSixSourcePairsTrustedConnectedAnyVariant ||
    sweep18e.bridgeMetalToNearestFloorTrustedConnectedAnyVariant ||
    sweep18e.bothMirroredGrateFloorPairsTrustedConnectedAnyVariant ||
    !sweep18e.zeroErosionProducesMirroredGrateAsymmetry ||
    !sweep18e.finerZeroErosionRemovesPositiveGrateRasterBridge ||
    sweep18e.extraClimbChangesZeroErosionTrustedResult ||
    !sweep18e.runtimeBroadGlassToBridgeTrustedConnectedBothSides ||
    !sweep18e.runtimeBroadGlassToBridgeUsesProductionRecastSettings ||
    !sweep18e.testedGlassChainBreakLocalizedToBridgeMetalFloorGap ||
    sweep18e.currentRuntimeBroadGlassNavigationNeedsReplacement ||
    sweep18e.globalRecastParameterChangeAuthorized ||
    sweep18e.exactOriginalGlassIngressTransitionResolved ||
    sweep18e.originalGrateWalkOnOffSemanticsResolved ||
    sweep18e.offMeshLinkAuthorized ||
    sweep18e.runtimePromotionAuthorized ||
    sweep18e.activationBlockerCleared ||
    sweep18e.userCaptureRequiredNow
  ) {
    errors.push('Pass 18E Recast representation sweep boundary drifted');
  }

  const connector18f = audit.localConnectorExperimentPass18F;
  if (
    connector18f.qaRunNumber !== 908 ||
    !connector18f.diagnosticOnly ||
    connector18f.endpointMethod !==
      'EXACT_TRIANGLE_CLOSEST_PAIR_PLUS_TRUSTED_COMBINED_RECAST_COMPONENT_SAMPLE' ||
    Math.abs(connector18f.trustedComponentSnapMeters - 0.30) > 1e-9 ||
    connector18f.candidateConnectorCount !== 4 ||
    connector18f.testedRadiiMeters.join(',') !== '0.1,0.18,0.3' ||
    connector18f.baselineReachedDirectedPairs !== 79 ||
    connector18f.baselineWeakComponentCount !== 9 ||
    connector18f.baselineStronglyConnectedComponentCount !== 11 ||
    connector18f.allTestedCandidateMatricesReachedDirectedPairs !== 79 ||
    connector18f.allTestedCandidateMatricesWeakComponentCount !== 9 ||
    connector18f.allTestedCandidateMatricesStronglyConnectedComponentCount !== 11 ||
    connector18f.candidateLinksChangedConnectivity ||
    Math.abs(
      connector18f.minimumSampledEndpointBoundaryOffsetMeters -
        1.7340469343833274
    ) > 1e-9 ||
    !connector18f.allSampledBoundaryOffsetsExceedTrustedSnapMeters ||
    connector18f.endEndpointMutualTrackedAnchorMembershipCount !== 0 ||
    !connector18f.allFourDestinationEndpointsOutsideTrackedAnchorSccs ||
    connector18f.syntheticDetourControl.reachedDirectedPairs !== 87 ||
    connector18f.syntheticDetourControl.weakComponentCount !== 8 ||
    connector18f.syntheticDetourControl.stronglyConnectedComponentCount !== 10 ||
    connector18f.syntheticDetourControl.centerStepRemainsIsolated ||
    !connector18f.detourMechanismOperational ||
    connector18f.oneHopBoundaryConnectorSufficient ||
    !connector18f.destinationSourceChainBindingStillRequired ||
    connector18f.originalTraversalDirectionalityResolved ||
    connector18f.connectorPromotionAuthorized ||
    connector18f.runtimePromotionAuthorized ||
    connector18f.activationBlockerCleared ||
    connector18f.userCaptureRequiredNow
  ) {
    errors.push('Pass 18F local connector boundary drifted');
  }

  const chain18g = audit.destinationSourceChainRecoveryPass18G;
  if (
    chain18g.qaRunNumber !== 915 ||
    !chain18g.diagnosticOnly ||
    chain18g.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(chain18g.trustedRuntimeSnapMeters - 0.30) > 1e-9 ||
    chain18g.sourceAdjacencyThresholdsMeters.join(',') !== '0.03,0.08,0.18,0.3' ||
    chain18g.relaxedDiscoveryThresholdMeters !== 2.0 ||
    chain18g.localInventoryMarginMeters !== 12.0 ||
    chain18g.runtimeSccCount !== 11 ||
    chain18g.grate.candidateComponentCountPerSide !== 42 ||
    chain18g.grate.relaxedEdgeCountPerSide !== 116 ||
    chain18g.grate.relaxedReachableComponentCountPerSide !== 8 ||
    chain18g.grate.downstreamRuntimeBoundComponentCountPerSide !== 2 ||
    chain18g.grate.pathExistsAtOrBelow030Meters ||
    chain18g.grate.relaxedPathComponentCountPerSide !== 4 ||
    chain18g.grate.positivePathSourceKinds.join(',') !==
      'FloorConcrete00,FloorSlope00,FloorConcrete02,FloorSlope00' ||
    chain18g.grate.negativePathSourceKinds.join(',') !==
      'FloorConcrete00,FloorSlope00,FloorConcrete02,FloorSlope00' ||
    Math.abs(chain18g.grate.positivePathGapsMeters[2] - 0.5185586972146141) > 1e-9 ||
    Math.abs(chain18g.grate.negativePathGapsMeters[2] - 0.5185586972146133) > 1e-9 ||
    chain18g.grate.positiveTerminalAnchor !==
      'paint:UndertowT21D:spawn-high-positive-z' ||
    chain18g.grate.negativeTerminalAnchor !==
      'paint:UndertowT21D:spawn-high-negative-z' ||
    !chain18g.grate.sourceChainStructurallyMirrored ||
    chain18g.grate.trustedContinuousRuntimeBindingRecovered ||
    chain18g.upperGlass.candidateComponentCountPerSide !== 101 ||
    chain18g.upperGlass.relaxedEdgeCountPerSide !== 353 ||
    chain18g.upperGlass.excludedPredecessorBridgeComponentsPerSide !== 24 ||
    chain18g.upperGlass.relaxedReachableComponentCountPerSide !== 58 ||
    chain18g.upperGlass.pathToDownstreamRuntimeSccAtOrBelow030Meters ||
    chain18g.upperGlass.pathToDownstreamRuntimeSccAtOrBelow200Meters ||
    chain18g.upperGlass.positiveDownstreamRuntimeBoundCandidateCount !== 10 ||
    chain18g.upperGlass.negativeDownstreamRuntimeBoundCandidateCount !== 8 ||
    chain18g.upperGlass.frontierPairCountPerSide !== 1401 ||
    Math.abs(chain18g.upperGlass.nearestFrontierGapMeters - 2.074234789) > 1e-9 ||
    chain18g.upperGlass.nearestFrontierFromSourceKind !== 'FloorConcrete01' ||
    chain18g.upperGlass.nearestFrontierToSourceKind !== 'FloorSlope00' ||
    chain18g.upperGlass.nearestFrontierTiedTargetsPerSide !== 2 ||
    !chain18g.upperGlass.sourceFrontierStructurallyMirrored ||
    chain18g.upperGlass.exactTransitionSemanticsResolved ||
    !chain18g.predecessorRuntimeSccExcludedAsTerminal ||
    chain18g.globalRecastParameterChangeAuthorized ||
    chain18g.convenienceGeometryAuthorized ||
    chain18g.offMeshLinkAuthorized ||
    chain18g.runtimePromotionAuthorized ||
    chain18g.activationBlockerCleared ||
    chain18g.userCaptureRequiredNow
  ) {
    errors.push('Pass 18G destination source-chain recovery boundary drifted');
  }

  const gap18h = audit.localGapSourceClassAuditPass18H;
  if (
    gap18h.sourceAuditRunNumber !== 918 ||
    !gap18h.diagnosticOnly ||
    gap18h.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(gap18h.localMarginMeters - 3.0) > 1e-9 ||
    Math.abs(gap18h.trustedBridgeMeters - 0.30) > 1e-9 ||
    Math.abs(gap18h.humanContactMeters - 0.345) > 1e-9 ||
    gap18h.ordinaryWalkStrictBridgeCandidateCountTotal !== 0 ||
    Math.abs(gap18h.grate.positiveGapMeters - 0.5185586972146141) > 1e-12 ||
    Math.abs(gap18h.grate.negativeGapMeters - 0.5185586972146133) > 1e-12 ||
    gap18h.grate.nearbySourceComponentCountPerSide !== 142 ||
    gap18h.grate.strictBridgeCandidateCountPerSide !== 4 ||
    gap18h.grate.humanContactBridgeCandidateCountPerSide !== 4 ||
    gap18h.grate.floorLineOverlayCandidateCountPerSide !== 3 ||
    gap18h.grate.nonOverlayCandidateCountPerSide !== 1 ||
    gap18h.grate.nonOverlaySourceMaterial !== 'Fld_Temple01_Object00' ||
    gap18h.grate.nonOverlayWalkQualified ||
    !gap18h.grate.nonOverlaySteepOrNonUpward ||
    gap18h.grate.ordinaryWalkBridgeRecovered ||
    !gap18h.grate.sourceClassPatternMirrored ||
    Math.abs(gap18h.upperGlass.nearestFrontierGapMeters - 2.07423478885845) > 1e-12 ||
    gap18h.upperGlass.tiedFrontierCountPerSide !== 2 ||
    gap18h.upperGlass.strictBridgeCandidateCountsAcrossTiedFrontiers.join(',') !== '0,2' ||
    gap18h.upperGlass.humanContactBridgeCandidateCountsAcrossTiedFrontiers.join(',') !== '0,2' ||
    gap18h.upperGlass.strictBridgeMaterial !== 'Fld_Temple01_FloorLine00' ||
    !gap18h.upperGlass.strictBridgeCandidatesAreOverlayOnly ||
    gap18h.upperGlass.ordinaryWalkBridgeRecovered ||
    gap18h.upperGlass.positiveOverlayBridgedTarget !==
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c12' ||
    gap18h.upperGlass.positiveUnbridgedTarget !==
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c15' ||
    gap18h.upperGlass.negativeOverlayBridgedTarget !==
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c17' ||
    gap18h.upperGlass.negativeUnbridgedTarget !==
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c13' ||
    !gap18h.upperGlass.mirroredFrontierDisposition ||
    gap18h.hiddenOrdinaryWalkSourceRecovered ||
    gap18h.overlayOrSteepGeometryAuthorizesTraversal ||
    !gap18h.exactGapVectorOrTraversalSemanticsStillRequired ||
    gap18h.globalRecastParameterChangeAuthorized ||
    gap18h.convenienceGeometryAuthorized ||
    gap18h.offMeshLinkAuthorized ||
    gap18h.runtimePromotionAuthorized ||
    gap18h.activationBlockerCleared ||
    gap18h.userCaptureRequiredNow
  ) {
    errors.push('Pass 18H local gap source-class boundary drifted');
  }

  const vector18i = audit.exactGapVectorAuditPass18I;
  if (
    vector18i.sourceAuditRunNumber !== 923 ||
    !vector18i.diagnosticOnly ||
    vector18i.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(vector18i.temple01RegistrationScale - 0.964211) > 1e-12 ||
    Math.abs(vector18i.grate.positiveProjectGapMeters - 0.5185586972146141) > 1e-12 ||
    Math.abs(vector18i.grate.negativeProjectGapMeters - 0.5185586972146198) > 1e-12 ||
    Math.abs(vector18i.grate.modelGapMeters - 0.5) > 1e-12 ||
    Math.abs(vector18i.grate.modelHorizontalGapMeters - 0.5) > 1e-12 ||
    Math.abs(vector18i.grate.modelVerticalDeltaMeters) > 1e-12 ||
    vector18i.grate.closestSeparationAxis !== 'MODEL_Z' ||
    vector18i.grate.positiveModelDelta.join(',') !== '0,0,0.5' ||
    vector18i.grate.negativeModelDelta.join(',') !== '0,0,-0.5' ||
    !vector18i.grate.exactHalfMeterModelGap ||
    !vector18i.grate.purelyHorizontalClosestSeparation ||
    !vector18i.grate.structurallyMirrored ||
    Math.abs(vector18i.upperGlass.projectGapMeters - 2.07423478885845) > 1e-12 ||
    Math.abs(vector18i.upperGlass.modelGapMeters - 2.0) > 1e-12 ||
    Math.abs(vector18i.upperGlass.modelHorizontalGapMeters - 2.0) > 1e-12 ||
    Math.abs(vector18i.upperGlass.modelVerticalDeltaMeters) > 1e-12 ||
    vector18i.upperGlass.closestSeparationAxis !== 'MODEL_Z' ||
    Math.abs(vector18i.upperGlass.modelY - 3.0) > 1e-12 ||
    vector18i.upperGlass.positiveModelZ.join(',') !== '21.5,19.5' ||
    vector18i.upperGlass.negativeModelZ.join(',') !== '-21.5,-19.5' ||
    vector18i.upperGlass.absoluteModelXFrontierLines.join(',') !== '4.25,16' ||
    !vector18i.upperGlass.exactTwoMeterModelGap ||
    !vector18i.upperGlass.purelyHorizontalClosestSeparation ||
    !vector18i.upperGlass.tiedFrontiersStructurallyMirrored ||
    vector18i.localizedClosestSeparationIsVerticalStep ||
    !vector18i.exactGapWidthAndAxisResolved ||
    vector18i.exactKccFeasibilityAcrossLocalizedGapsResolved ||
    vector18i.originalTraversalDirectionalityResolved ||
    vector18i.originalJumpRequirementResolved ||
    vector18i.globalRecastParameterChangeAuthorized ||
    vector18i.convenienceGeometryAuthorized ||
    vector18i.offMeshLinkAuthorized ||
    vector18i.runtimePromotionAuthorized ||
    vector18i.activationBlockerCleared ||
    vector18i.userCaptureRequiredNow
  ) {
    errors.push('Pass 18I exact gap-vector boundary drifted');
  }

  const kcc18j = audit.productionKccExactGapPass18J;
  if (
    kcc18j.qaRunNumber !== 930 ||
    !kcc18j.diagnosticOnly ||
    kcc18j.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    kcc18j.directedProbeCount !== 12 ||
    Math.abs(kcc18j.insetMeters - 0.40) > 1e-12 ||
    Math.abs(kcc18j.humanRadiusMeters - 0.32) > 1e-12 ||
    Math.abs(kcc18j.controllerOffsetMeters - 0.025) > 1e-12 ||
    Math.abs(kcc18j.effectiveHumanContactRadiusMeters - 0.345) > 1e-12 ||
    Math.abs(kcc18j.autostepMaxHeightMeters - 0.34) > 1e-12 ||
    Math.abs(kcc18j.snapToGroundMeters - 0.24) > 1e-12 ||
    kcc18j.grate.directedProbeCount !== 4 ||
    kcc18j.grate.successfulDirectedProbeCount !== 4 ||
    kcc18j.grate.failedDirectedProbeCount !== 0 ||
    !kcc18j.grate.allSettledInitially ||
    kcc18j.grate.totalAirborneTicks !== 0 ||
    !kcc18j.grate.allDirectionsRemainGrounded ||
    Math.abs(kcc18j.grate.maximumDropBelowSurfaceMeters - 0.08481084823608409) > 1e-12 ||
    !kcc18j.grate.exactHalfMeterGapGroundedTraversalFeasible ||
    !kcc18j.grate.mirroredBidirectionalPhysicalFeasibility ||
    kcc18j.upperGlass.directedProbeCount !== 8 ||
    kcc18j.upperGlass.successfulDirectedProbeCount !== 0 ||
    kcc18j.upperGlass.failedDirectedProbeCount !== 8 ||
    !kcc18j.upperGlass.allSettledInitially ||
    kcc18j.upperGlass.totalAirborneTicks !== 170 ||
    kcc18j.upperGlass.minimumAirborneTicksPerProbe !== 20 ||
    kcc18j.upperGlass.maximumAirborneTicksPerProbe !== 23 ||
    Math.abs(kcc18j.upperGlass.minimumDropBelowSurfaceMeters - 1.988972659111023) > 1e-12 ||
    Math.abs(kcc18j.upperGlass.maximumDropBelowSurfaceMeters - 2.5186204862594606) > 1e-12 ||
    Math.abs(kcc18j.upperGlass.maximumFinalHorizontalErrorMeters - 0.13355062839631762) > 1e-12 ||
    kcc18j.upperGlass.exactTwoMeterGapGroundedTraversalFeasible ||
    !kcc18j.upperGlass.ordinaryGroundedWalkInsufficient ||
    !kcc18j.grateRecastVsKccMismatchFurtherLocalized ||
    !kcc18j.upperGlassSimpleGroundedConnectorPhysicallyUnsupported ||
    kcc18j.originalGameplayTraversalSemanticsResolved ||
    kcc18j.originalGrateDirectionalityResolved ||
    kcc18j.originalUpperGlassJumpOrAlternateRouteResolved ||
    kcc18j.globalRecastParameterChangeAuthorized ||
    kcc18j.convenienceGeometryAuthorized ||
    kcc18j.offMeshLinkAuthorized ||
    kcc18j.runtimePromotionAuthorized ||
    kcc18j.activationBlockerCleared ||
    kcc18j.userCaptureRequiredNow
  ) {
    errors.push('Pass 18J production-KCC exact-gap boundary drifted');
  }

  const chain18k = audit.rawBoundaryGrateChainPass18K;
  if (
    chain18k.qaRunNumber !== 935 ||
    !chain18k.diagnosticOnly ||
    chain18k.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(chain18k.linkRadiusMeters - 0.30) > 1e-12 ||
    chain18k.candidateLinkCount !== 4 ||
    Math.abs(chain18k.positiveIngressBoundaryDistanceMeters - 0.3454057383491051) > 1e-12 ||
    Math.abs(chain18k.negativeIngressBoundaryDistanceMeters - 0.3454057383491022) > 1e-12 ||
    Math.abs(chain18k.finalGapModelMeters - 0.5) > 1e-12 ||
    chain18k.baselineReachedDirectedPairs !== 79 ||
    chain18k.baselineWeakComponentCount !== 9 ||
    chain18k.baselineStronglyConnectedComponentCount !== 11 ||
    chain18k.ingressOnlyReachedDirectedPairs !== 79 ||
    chain18k.finalOnlyReachedDirectedPairs !== 79 ||
    chain18k.combinedReachedDirectedPairs !== 79 ||
    chain18k.combinedWeakComponentCount !== 9 ||
    chain18k.combinedStronglyConnectedComponentCount !== 11 ||
    chain18k.candidateLinksChangedConnectivity ||
    !chain18k.bothGratesRemainIsolated ||
    chain18k.rawSourceBoundaryEndpointsSufficientForDetourBinding ||
    chain18k.runtimePromotionAuthorized ||
    chain18k.activationBlockerCleared
  ) {
    errors.push('Pass 18K raw-boundary grate-chain boundary drifted');
  }

  const chain18l = audit.trustedEndpointGrateChainPass18L;
  if (
    chain18l.qaRunNumber !== 937 ||
    !chain18l.diagnosticOnly ||
    chain18l.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(chain18l.trustedSnapMeters - 0.30) > 1e-12 ||
    Math.abs(chain18l.linkRadiusMeters - 0.30) > 1e-12 ||
    chain18l.candidateLinkCount !== 4 ||
    chain18l.baselineReachedDirectedPairs !== 79 ||
    chain18l.baselineWeakComponentCount !== 9 ||
    chain18l.baselineStronglyConnectedComponentCount !== 11 ||
    chain18l.candidateReachedDirectedPairs !== 89 ||
    chain18l.candidateWeakComponentCount !== 7 ||
    chain18l.candidateStronglyConnectedComponentCount !== 9 ||
    chain18l.baselineIsolatedAnchorCount !== 3 ||
    chain18l.candidateIsolatedAnchorCount !== 1 ||
    !chain18l.bothGratesGainExternalReach ||
    chain18l.positiveGrateReachedAnchorCountIncludingSelf !== 5 ||
    chain18l.negativeGrateReachedAnchorCountIncludingSelf !== 5 ||
    Math.abs(chain18l.positiveIngressTrustedEndpointDistanceMeters - 3.338013739086229) > 1e-12 ||
    Math.abs(chain18l.negativeIngressTrustedEndpointDistanceMeters - 4.996651842296954) > 1e-12 ||
    Math.abs(chain18l.positiveFinalTrustedEndpointDistanceMeters - 6.370536111620433) > 1e-12 ||
    Math.abs(chain18l.negativeFinalTrustedEndpointDistanceMeters - 6.360070727543967) > 1e-12 ||
    Math.abs(chain18l.minimumSourceBoundaryOffsetMeters - 1.7340469343833274) > 1e-12 ||
    Math.abs(chain18l.maximumSourceBoundaryOffsetMeters - 5.499147868379137) > 1e-12 ||
    !chain18l.connectivityImprovedWithTrustedInteriorEndpoints ||
    chain18l.trustedProjectionRemainsLocalToSourceBoundary ||
    chain18l.localConnectorSemanticsValidated ||
    !chain18l.nonlocalProjectionMakesCandidateUnfitForPromotion ||
    chain18l.runtimePromotionAuthorized ||
    chain18l.activationBlockerCleared
  ) {
    errors.push('Pass 18L trusted-endpoint grate-chain boundary drifted');
  }

  const min18m = audit.trustedEndpointMinimalityPass18M;
  if (
    min18m.qaRunNumber !== 941 ||
    !min18m.diagnosticOnly ||
    min18m.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(min18m.trustedSnapMeters - 0.30) > 1e-12 ||
    Math.abs(min18m.linkRadiusMeters - 0.30) > 1e-12 ||
    min18m.candidateLinkCount !== 4 ||
    min18m.baselineReachedDirectedPairs !== 79 ||
    min18m.baselineWeakComponentCount !== 9 ||
    min18m.baselineStronglyConnectedComponentCount !== 11 ||
    min18m.ingressOnlyReachedDirectedPairs !== 79 ||
    min18m.finalOnlyReachedDirectedPairs !== 79 ||
    min18m.everySingleLinkReachedDirectedPairs !== 79 ||
    min18m.positivePairReachedDirectedPairs !== 84 ||
    min18m.positivePairWeakComponentCount !== 8 ||
    min18m.positivePairStronglyConnectedComponentCount !== 10 ||
    min18m.negativePairReachedDirectedPairs !== 84 ||
    min18m.negativePairWeakComponentCount !== 8 ||
    min18m.negativePairStronglyConnectedComponentCount !== 10 ||
    min18m.allFourReachedDirectedPairs !== 89 ||
    min18m.allFourWeakComponentCount !== 7 ||
    min18m.allFourStronglyConnectedComponentCount !== 9 ||
    min18m.linksRequiredPerSideForConnectivityChange !== 2 ||
    !min18m.ingressAndFinalBreakAreIndependentlyNecessaryPerSide ||
    !min18m.eachSidePairResolvesOnlyItsOwnGrateSingleton ||
    !min18m.twoDistinctRecastAttachmentBreaksPerSide ||
    min18m.localConnectorSemanticsValidated ||
    min18m.runtimePromotionAuthorized ||
    min18m.activationBlockerCleared
  ) {
    errors.push('Pass 18M trusted-endpoint minimality boundary drifted');
  }

  const radius18n = audit.rawBoundaryRadiusSweepPass18N;
  if (
    radius18n.qaRunNumber !== 945 ||
    !radius18n.diagnosticOnly ||
    radius18n.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    radius18n.testedRadiiMeters.join(',') !== '0.3,0.36,0.45,0.6,1,1.5,2,3,4,6' ||
    radius18n.physicalEndpointCount !== 4 ||
    radius18n.baselineReachedDirectedPairs !== 79 ||
    radius18n.baselineWeakComponentCount !== 9 ||
    radius18n.baselineStronglyConnectedComponentCount !== 11 ||
    !radius18n.bothSidesFailThrough060Meters ||
    Math.abs(radius18n.negativeFirstSuccessfulRadiusMeters - 1.0) > 1e-12 ||
    !radius18n.negativeRemainsBidirectionallyConnectedThrough600Meters ||
    radius18n.positiveSuccessfulRadiusMetersAtOrBelow600 !== null ||
    Math.abs(radius18n.positiveForwardEndpointErrorMetersAt600 - 46.86031243966464) > 1e-12 ||
    Math.abs(radius18n.positiveReverseEndpointErrorMetersAt600 - 2.9400917651756426) > 1e-12 ||
    Math.abs(radius18n.negativeForwardEndpointErrorMetersAt100) > 1e-12 ||
    Math.abs(radius18n.negativeReverseEndpointErrorMetersAt100) > 1e-12 ||
    !radius18n.mirroredSourceProducesAsymmetricRawBoundaryAttachment ||
    radius18n.globalRawBoundaryRadiusSolutionFound ||
    radius18n.radiusIncreaseIsSafePromotionStrategy ||
    radius18n.localConnectorSemanticsValidated ||
    radius18n.runtimePromotionAuthorized ||
    radius18n.activationBlockerCleared
  ) {
    errors.push('Pass 18N raw-boundary radius sweep drifted');
  }

  const hybrid18o = audit.endpointHybridPass18O;
  if (
    hybrid18o.qaRunNumber !== 949 ||
    !hybrid18o.diagnosticOnly ||
    hybrid18o.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(hybrid18o.trustedSnapMeters - 0.30) > 1e-12 ||
    Math.abs(hybrid18o.trustedLinkRadiusMeters - 0.30) > 1e-12 ||
    hybrid18o.rawRadiiMeters.join(',') !== '0.3,1,6' ||
    hybrid18o.baselineReachedDirectedPairs !== 79 ||
    hybrid18o.baselineWeakComponentCount !== 9 ||
    hybrid18o.baselineStronglyConnectedComponentCount !== 11 ||
    hybrid18o.positive.at030RawIngressTrustedFinalConnected ||
    hybrid18o.positive.at030TrustedIngressRawFinalConnected ||
    hybrid18o.positive.at100RawIngressTrustedFinalConnected ||
    !hybrid18o.positive.at100TrustedIngressRawFinalConnected ||
    hybrid18o.positive.at100AllRawConnected ||
    !hybrid18o.positive.at100AllTrustedConnected ||
    hybrid18o.positive.at600RawIngressTrustedFinalConnected ||
    !hybrid18o.positive.at600TrustedIngressRawFinalConnected ||
    hybrid18o.positive.at600AllRawConnected ||
    Math.abs(hybrid18o.positive.at100RawIngressForwardEndpointErrorMeters - 46.86031243966464) > 1e-12 ||
    Math.abs(hybrid18o.positive.at100RawIngressReverseEndpointErrorMeters - 2.9400917651756426) > 1e-12 ||
    hybrid18o.positive.rawIngressAttachmentResolvedAtOrBelow600 ||
    !hybrid18o.positive.rawFinalAttachmentResolvedAt100 ||
    hybrid18o.negative.at030RawIngressTrustedFinalConnected ||
    hybrid18o.negative.at030TrustedIngressRawFinalConnected ||
    !hybrid18o.negative.at100RawIngressTrustedFinalConnected ||
    !hybrid18o.negative.at100TrustedIngressRawFinalConnected ||
    !hybrid18o.negative.at100AllRawConnected ||
    !hybrid18o.negative.at100AllTrustedConnected ||
    !hybrid18o.negative.at600RawIngressTrustedFinalConnected ||
    !hybrid18o.negative.at600TrustedIngressRawFinalConnected ||
    !hybrid18o.negative.at600AllRawConnected ||
    !hybrid18o.negative.rawIngressAttachmentResolvedAt100 ||
    !hybrid18o.negative.rawFinalAttachmentResolvedAt100 ||
    hybrid18o.positiveOnlyPersistentRawAttachmentBlocker !==
      'GRATE_TO_FLOORCONCRETE00_INGRESS' ||
    !hybrid18o.finalHalfMeterRawAttachmentWorksBothSidesAt100 ||
    !hybrid18o.mirroredAsymmetryLocalizedToPositiveIngress ||
    !hybrid18o.radiusIncreaseStillNotPromotionAuthority ||
    hybrid18o.localConnectorSemanticsValidated ||
    hybrid18o.originalGrateDirectionalityResolved ||
    hybrid18o.runtimePromotionAuthorized ||
    hybrid18o.activationBlockerCleared
  ) {
    errors.push('Pass 18O hybrid grate endpoint boundary drifted');
  }

  const ingress18p = audit.ingressEndpointIsolationPass18P;
  if (
    ingress18p.qaRunNumber !== 954 ||
    !ingress18p.diagnosticOnly ||
    ingress18p.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(ingress18p.trustedSnapMeters - 0.30) > 1e-12 ||
    Math.abs(ingress18p.trustedFinalLinkRadiusMeters - 0.30) > 1e-12 ||
    ingress18p.rawIngressRadiiMeters.join(',') !== '0.3,1,6' ||
    ingress18p.baselineReachedDirectedPairs !== 79 ||
    ingress18p.baselineWeakComponentCount !== 9 ||
    ingress18p.baselineStronglyConnectedComponentCount !== 11 ||
    Math.abs(ingress18p.positive.rawGrateSideStartClosestPointSnapMeters - 0.6472549947142026) > 1e-12 ||
    Math.abs(ingress18p.positive.rawFloorConcrete00SideEndClosestPointSnapMeters - 0.3420302065480327) > 1e-12 ||
    ingress18p.positive.at030RawStartRawEndConnected ||
    ingress18p.positive.at030RawStartTrustedEndConnected ||
    ingress18p.positive.at030TrustedStartRawEndConnected ||
    !ingress18p.positive.at030TrustedStartTrustedEndConnected ||
    ingress18p.positive.at100RawStartRawEndConnected ||
    ingress18p.positive.at100RawStartTrustedEndConnected ||
    !ingress18p.positive.at100TrustedStartRawEndConnected ||
    !ingress18p.positive.at100TrustedStartTrustedEndConnected ||
    ingress18p.positive.at600RawStartRawEndConnected ||
    ingress18p.positive.at600RawStartTrustedEndConnected ||
    !ingress18p.positive.at600TrustedStartRawEndConnected ||
    ingress18p.positive.rawGrateSideStartAttachmentResolvedAtOrBelow600 ||
    !ingress18p.positive.rawFloorConcrete00SideEndAttachmentResolvedAt100 ||
    Math.abs(ingress18p.negative.rawGrateSideStartClosestPointSnapMeters - 0.7401798316876944) > 1e-12 ||
    Math.abs(ingress18p.negative.rawFloorConcrete00SideEndClosestPointSnapMeters - 0.5103195238057004) > 1e-12 ||
    ingress18p.negative.at030RawStartRawEndConnected ||
    !ingress18p.negative.at030TrustedStartTrustedEndConnected ||
    !ingress18p.negative.at100RawStartRawEndConnected ||
    !ingress18p.negative.at100RawStartTrustedEndConnected ||
    !ingress18p.negative.at100TrustedStartRawEndConnected ||
    !ingress18p.negative.at100TrustedStartTrustedEndConnected ||
    !ingress18p.negative.rawGrateSideStartAttachmentResolvedAt100 ||
    !ingress18p.negative.rawFloorConcrete00SideEndAttachmentResolvedAt100 ||
    ingress18p.persistentPositiveAttachmentBlocker !==
      'POSITIVE_Z_GRATE_SIDE_RAW_INGRESS_START' ||
    !ingress18p.positiveFloorConcrete00RawIngressEndWorksAt100 ||
    !ingress18p.negativeGrateSideRawStartWorksDespiteLargerClosestPointSnap ||
    ingress18p.closestPointSnapMagnitudeExplainsAsymmetry ||
    !ingress18p.mirroredAsymmetryLocalizedToPositiveGrateSideStart ||
    !ingress18p.radiusIncreaseStillNotPromotionAuthority ||
    ingress18p.localConnectorSemanticsValidated ||
    ingress18p.originalGrateDirectionalityResolved ||
    ingress18p.runtimePromotionAuthorized ||
    ingress18p.activationBlockerCleared
  ) {
    errors.push('Pass 18P ingress endpoint isolation boundary drifted');
  }

  if (
    audit.sourceNativeRouteGapAudit.sourceWalkableNodeCountPerSide !== 276 ||
    audit.sourceNativeRouteGapAudit.rightLowContactNodeCountPerSide !== 17 ||
    audit.sourceNativeRouteGapAudit.underpassContactNodeCountPerSide !== 8 ||
    audit.sourceNativeRouteGapAudit.directConnectivityThresholdsMeters.join(',') !==
      '0.03,0.08,0.18,0.3' ||
    audit.sourceNativeRouteGapAudit.reachableAtOrBelowMaxDirectThreshold ||
    audit.sourceNativeRouteGapAudit.localGapCountTotal !== 8 ||
    audit.sourceNativeRouteGapAudit.localGapCountPerSide !== 4 ||
    audit.sourceNativeRouteGapAudit.strictBridgeThresholdMeters !== 0.30 ||
    audit.sourceNativeRouteGapAudit.strictBridgesWhenAllExcludedSourceIsAllowed !== 6 ||
    audit.sourceNativeRouteGapAudit.strictBridgesAfterFloorLineAndFenceOverlayRemoval !== 0 ||
    audit.sourceNativeRouteGapAudit.ordinaryWalkSurfaceRecovered ||
    audit.sourceNativeRouteGapAudit.runtimePromotionAuthorized ||
    audit.sourceNativeRouteGapAudit.offMeshLinkAuthorized
  ) {
    errors.push('Pass 10B source-native route-gap localization drifted or overpromoted connectivity');
  }

  if (audit.missingRequirements.length !== 5) {
    errors.push('Pass 18N full-stage connectivity evidence gap is not fully localized');
  }
  return errors;
}
