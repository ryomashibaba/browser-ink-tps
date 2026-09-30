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
import { UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES } from './UndertowSpillwayReferenceCatalog';
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
  resolutionPass: '18AN' as const,
  auditedAt: '2026-09-30' as const,
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

  positiveIngressStartRetreatPass18Q: Object.freeze({
    qaRunNumber: 962,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18Q keeps the positive FloorConcrete00 ingress end raw at radius 1.00m and the later final-gap link trusted, then moves only the positive grate-side ingress start from its raw boundary point toward the trusted interior point. The raw start fails, while the first tested nonzero retreat (5% of the 1.987273705m raw-to-trusted vector = 0.099363685m) succeeds bidirectionally and every larger tested fraction through 100% remains connected. NEGATIVE_Z raw ingress remains a successful control. This localizes the positive start attachment transition to less than 0.10m of in-surface retreat, but does not authorize a runtime endpoint or link.'
  }),

  positiveIngressStartFineSweepPass18R: Object.freeze({
    qaRunNumber: 962,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
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
    lastFailedProjectedPoint: [-25.715261459350586, 7.600000381469727, 31.51282501220703] as const,
    firstSuccessfulProjectedPoint: [-25.715261459350586, 7.5, 30.612831115722656] as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18R refines Pass 18Q with a 0-0.100m sweep in 0.005m increments at the same 1.00m ingress radius and trusted final-gap control. POSITIVE_Z fails through 0.035m and succeeds from 0.040m onward. Across that 5mm transition the scalar closest-point distance changes only from 0.645955175m to 0.642448978m, but the closest-point projection jumps from y=7.600000381/z=31.512825012 to y=7.5/z=30.612831116. This discontinuous projection change strongly indicates a nearest-nav-polygon identity boundary rather than a scalar distance threshold. The measurement is diagnostic only; a 40mm endpoint retreat plus 1.00m attachment radius has not yet been proven to be the minimal faithful full-chain representation.'
  }),

  localRawChainRadiusPass18S: Object.freeze({
    qaRunNumber: 967,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    positiveRetreatMeters: 0.040,
    trustedControlRadiusMeters: 0.30,
    testedRadiiMeters: [0.30, 0.36, 0.45, 0.60, 0.75, 0.90, 1.00] as const,
    baselineReachedDirectedPairs: 79,
    baselineWeakComponentCount: 9,
    baselineStronglyConnectedComponentCount: 11,
    positive: Object.freeze({
      localIngressStartSnapMeters: 0.6424489783331878,
      rawIngressEndSnapMeters: 0.3420302065480327,
      rawFinalStartSnapMeters: 0.6870675165796135,
      rawFinalEndSnapMeters: 0.9125402509938235,
      firstSuccessfulIngressRadiusMeters: 0.75,
      firstSuccessfulFinalRadiusMeters: 0.90,
      combinedIngressRadiusMeters: 0.75,
      combinedFinalRadiusMeters: 0.90,
      combinedBidirectionallyReached: true
    }),
    negative: Object.freeze({
      localIngressStartSnapMeters: 0.7401798316876944,
      rawIngressEndSnapMeters: 0.5103195238057004,
      rawFinalStartSnapMeters: 0.688674567555729,
      rawFinalEndSnapMeters: 0.9031123713745141,
      firstSuccessfulIngressRadiusMeters: 0.75,
      firstSuccessfulFinalRadiusMeters: 0.90,
      combinedIngressRadiusMeters: 0.75,
      combinedFinalRadiusMeters: 0.90,
      combinedBidirectionallyReached: true
    }),
    mirroredLocalThresholdsMatch: true,
    positiveFortyMillimeterRetreatRestoresMirroredRadiusBehavior: true,
    ingressThresholdBracketMeters: [0.60, 0.75] as const,
    finalThresholdBracketMeters: [0.75, 0.90] as const,
    minimumAttachmentRadiiFineResolved: false,
    fullMatrixCollateralValidated: false,
    originalGrateDirectionalityResolved: false,
    localConnectorSemanticsValidated: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18S keeps the POSITIVE_Z grate-side ingress start at the Pass 18R 40mm-local point, keeps NEGATIVE_Z at its raw grate-side start, and returns both ingress ends plus both final 0.5m-gap endpoints to raw physical source positions. Sweeping only Detour attachment radius produces the same mirrored thresholds on both sides: ingress first succeeds at 0.75m after failing through 0.60m, final first succeeds at 0.90m after failing through 0.75m, and the combined 0.75m ingress + 0.90m final pair reaches bidirectionally on both sides. This is the first symmetric fully-local raw-chain candidate, but the radius thresholds remain coarse and exceed the normal 0.30m link radius, so they are diagnostic attachment bounds rather than runtime authority.'
  }),

  localRawChainFineRadiusPass18T: Object.freeze({
    qaRunNumber: 972,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    positiveRetreatMeters: 0.040,
    testedIngressRadiiMeters: [0.60, 0.625, 0.65, 0.675, 0.70, 0.725, 0.75] as const,
    testedFinalRadiiMeters: [0.75, 0.775, 0.80, 0.825, 0.85, 0.875, 0.90] as const,
    positive: Object.freeze({
      firstSuccessfulIngressRadiusMeters: 0.65,
      firstSuccessfulFinalRadiusMeters: 0.85,
      combinedIngressRadiusMeters: 0.65,
      combinedFinalRadiusMeters: 0.85,
      combinedBidirectionallyReached: true
    }),
    negative: Object.freeze({
      firstSuccessfulIngressRadiusMeters: 0.725,
      firstSuccessfulFinalRadiusMeters: 0.85,
      combinedIngressRadiusMeters: 0.725,
      combinedFinalRadiusMeters: 0.85,
      combinedBidirectionallyReached: true
    }),
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
    activationBlockerCleared: false,
    notes:
      'Pass 18T refines the Pass 18S coarse radius brackets at 25mm resolution. With the POSITIVE_Z grate-side ingress start retained at the measured 40mm-local point and all other endpoints raw, POSITIVE_Z ingress first succeeds at 0.65m while NEGATIVE_Z ingress first succeeds at 0.725m; the final physical 0.5m gap first succeeds at 0.85m on both sides. Therefore a single mirrored QA candidate exists at ingress radius 0.725m plus final radius 0.85m, with no nonlocal trusted endpoints. The residual ingress threshold asymmetry means these are conservative common attachment radii rather than exact minima. Full-matrix collateral/path-shape QA and original grate directionality remain unresolved.'
  }),

  localCandidateCollateralPass18U: Object.freeze({
    qaRunNumber: 977,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18U applies the Pass 18T common fully-local QA candidate on both sides simultaneously: POSITIVE_Z uses the measured 40mm grate-side start retreat, NEGATIVE_Z remains raw, both ingress links use 0.725m attachment radius, and both final raw 0.5m-gap links use 0.85m. The 25-anchor matrix changes only from 79/9/11 to 89/7/9. Exactly ten directed pairs are added and none removed: each grate joins only its own existing spawn-high/first-drop/right-low/ramp cluster, while all non-grate reachability remains unchanged when grate anchors are ignored. Focused grate<->spawn queries reach with zero endpoint error. This clears the collateral/topology gate for the QA candidate, but original grate traversal directionality and exact minimum radii remain unresolved, so runtime promotion is still forbidden.'
  }),

  correctedGrateDirectionalityEvidencePass18V: Object.freeze({
    evidenceAuditDate: '2026-09-30' as const,
    correctedReferenceCount: 5,
    currentDirectionalityReferenceCount: 3,
    currentRuleVariantReferenceCount: 1,
    terrainMechanicReferenceCount: 1,
    removedMisclassifiedScorchGorgeReferenceCount: 3,
    correctedReferenceIds:
      UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES.map((reference) => reference.id),
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
    requiredCaptureScope:
      'One current post-Ver.7.2.0 Undertow/Matagai Anarchy walk-through that crosses the exact Pass 18U grate chain in both directions, visibly covering both the grate->FloorConcrete00 ingress and the later 0.5m FloorConcrete02->FloorSlope00 break.' as const,
    localConnectorSemanticsValidated: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18V corrects the gameplay evidence catalog before making a directionality decision. Three previously cataloged pages were for Scorch Gorge / Yunoha and are removed from Undertow authority. Correct current Undertow/Matagai sources now independently document spawn-side grate access toward the middle, a post-Ver.7.2.0 Rainmaker grate route advancing from the middle/checkpoint side toward enemy territory (with a second current guide corroborating that route), and the series grate mechanic that humanoid players can walk on horizontal grates. These sources support opposite route-level travel directions and ordinary grate walkability, but they do not directly observe the exact two Pass 18U local breaks in both directions. Therefore bidirectional runtime links remain unpromoted until a controlled current-version capture closes that exact semantic gap.'
  }),

  centerSmallStepKccPass18W: Object.freeze({
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
    walkUp: Object.freeze({
      directedProbeCount: 2,
      successfulProbeCount: 0,
      bothSidesReachTarget: false,
      positiveAirborneTicks: 0,
      negativeAirborneTicks: 230,
      productionKccOrdinaryWalkUpFeasible: false
    }),
    jumpUp: Object.freeze({
      directedProbeCount: 2,
      successfulProbeCount: 2,
      bothSidesReachTarget: true,
      positiveAirborneTicks: 14,
      negativeAirborneTicks: 15,
      positiveMaximumRiseAboveStartMeters: 1.5292533683776854,
      negativeMaximumRiseAboveStartMeters: 1.5295673656463622,
      productionKccNormalJumpUpFeasible: true
    }),
    dropDown: Object.freeze({
      directedProbeCount: 2,
      successfulProbeCount: 2,
      bothSidesReachTarget: true,
      positiveAirborneTicks: 16,
      negativeAirborneTicks: 16,
      positiveMaximumDropBelowStartMeters: 1.4395598721504212,
      negativeMaximumDropBelowStartMeters: 1.4753304076194764,
      productionKccNaturalDropDownFeasible: true
    }),
    productionKccTransitionClass:
      'JUMP_UP_DROP_DOWN_QA_ONLY' as const,
    productionKccPhysicalFeasibilityResolved: true,
    productionKccRequiresJumpForTestedUpwardCrossing: true,
    productionKccAllowsNaturalDownwardDrop: true,
    mirroredOutcomeClassMatches: true,
    originalGameTraversalDirectionalityResolved: false,
    originalGameJumpRequirementResolved: false,
    controlledCurrentVersionCaptureRequired: true,
    requiredCaptureScope:
      'One current post-Ver.7.2.0 Undertow/Matagai center-step capture showing the exact +1.5m strip from lower->upper and upper->lower, including whether ordinary jump input is required upward.' as const,
    offMeshLinkAuthorized: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18W drives the shared production Human KCC across both mirrored +1.5m center-step strips. Ordinary no-jump traversal fails on both sides. A normal Human jump reaches the +1.5m top on both sides, while an unassisted upper->lower traversal drops and lands successfully on both sides. This resolves production-physics feasibility as a mirrored jump-up/drop-down QA class, but does not prove that the original game exposes both directions or requires the same jump behavior at this exact strip. No CPU off-mesh link is authorized until current-version gameplay evidence closes that semantic gate.'
  }),

  upperGlassFullSourceClusterPass18X: Object.freeze({
    qaRunNumber: 993,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
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
    materialInventoryPerSide: Object.freeze({
      BridgeMetal00: 46,
      FloorConcrete00: 1,
      FloorConcrete01: 1,
      FloorConcrete02: 4,
      FloorSlope00: 3,
      GrassFloor00: 3
    }),
    floorSlopeProjectYRangeMeters: [0, 6] as const,
    downstreamOnlyExactSourceGeometryChangedConnectivity: false,
    downstreamOnlyClusterConnectsCurrentGlassScc: false,
    downstreamOnlyClusterConnectsAnyRuntimeNonGlassScc: false,
    immediatePredecessorBridgeMetalWasIntentionallyExcludedByPass18G: true,
    fullPredecessorPlusDownstreamSourceRetestRequired: true,
    twoMeterFrontierLinkAuthorized: false,
    globalRecastParameterChangeAuthorized: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18X adds all 58 Pass 18G relaxed downstream source components per side (116 unique exact meshes total) to the real Recast QA stage without any connector. The full 25-anchor matrix remains exactly 79/9/11 with zero added or removed directed pairs. Only 15/58 components per side retain a <=0.30m trusted Recast representative, and none of those representatives is bidirectionally attached to the current broad-glass SCC, the opposite glass SCC, or any non-glass runtime SCC. The downstream inventory does contain exact FloorSlope00 geometry spanning project Y=0..6, but Pass 18G intentionally excluded the already-known immediate 24-component BridgeMetal predecessor neighborhood per side. Therefore this result rejects a downstream-only geometry promotion and requires one controlled retest with that predecessor neighborhood restored before any conclusion about the source-native ramp chain or the 2m frontier.'
  }),

  upperGlassFullPredecessorChainPass18Y: Object.freeze({
    qaRunNumber: 999,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18Y restores the exact 24-component BridgeMetal predecessor neighborhood per side (using the Pass 18C combined bridge mesh) together with all 58 Pass 18X downstream source components, for 82 logical components per side. The 25-anchor topology remains exactly 79/9/11 with zero pair changes. Crucially, each predecessor mesh has a trusted Recast representative bidirectionally connected to exactly its own three broad-glass anchors, while none of the 15 trusted downstream representatives per side connects to glass or any non-glass runtime anchor. Combined with Pass 18D, which already proved grounded bidirectional Human KCC traversal between BridgeMetal and the nearest FloorConcrete02 source surface, this localizes the remaining Recast representation break to the predecessor->downstream boundary rather than a missing broad ramp chain. A QA-only local connector may now be investigated at that exact boundary, but no connector or runtime promotion is authorized by this diagnostic alone.'
  }),

  upperGlassLocalConnectorPass18Z: Object.freeze({
    qaRunNumber: 1004,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
    trustedSnapMeters: 0.30,
    rawRadiiMeters: [0.30, 0.45, 0.60, 0.85, 1.00, 1.50] as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18Z keeps the full source-side upper-glass chain from Pass 18Y and tests only the exact KCC-feasible BridgeMetal->nearest FloorConcrete02 boundary. The physical closest-surface gap is 0.518558697m on both mirrored sides. Raw exact-boundary Detour links at 0.30/0.45/0.60/0.85/1.00/1.50m attachment radius never attach the floor representative to its own glass SCC and never change the 79/9/11 25-anchor matrix. A 0.30m trusted-endpoint control does attach the nearest floor representative to its own glass SCC on both sides, but the trusted endpoints are nonlocal (about 3.88-4.82m apart, with 1.85-3.22m physical-boundary retreat) and still reach no non-glass runtime anchor; the 25-anchor matrix remains unchanged. Therefore one local physical-boundary connector is insufficient and raw-radius inflation through 1.50m is rejected. The next safe diagnostic is to classify all downstream trusted source representatives under the trusted control to locate the remaining internal Recast breaks; no runtime connector or 2m frontier link is authorized.'
  }),

  upperGlassDownstreamSccClassificationPass18AA: Object.freeze({
    qaRunNumber: 1008,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
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
      'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7' as const,
    negativeOwnGlassConnectedComponentId:
      'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13' as const,
    ownGlassConnectedMaterial: 'FloorConcrete02' as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18AA classifies every <=0.30m-trusted downstream source representative after applying only the same nonlocal diagnostic BridgeMetal->nearest-FloorConcrete02 trusted control from Pass 18Z. Exactly 15/58 downstream components per side have trusted Recast representatives, but only one component per side joins its own glass SCC: FloorConcrete02 c7 on POSITIVE_Z and the mirrored c13 on NEGATIVE_Z. No component joins the opposite glass SCC or any non-glass runtime anchor, and the tracked 25-anchor matrix remains 79/9/11. Therefore the trusted control attaches only the immediate nearest-floor component; it does not make the downstream cluster transitively navigable. The next safe diagnostic is to inspect exact source adjacency from those c7/c13 components to the remaining downstream components and identify the first Recast break. No raw-radius inflation, nonlocal trusted shortcut, 2m frontier link, or runtime promotion is authorized.'
  }),

  upperGlassNearestDownstreamBreakPass18AB: Object.freeze({
    qaRunNumber: 1012,
    diagnosticOnly: true,
    trustedSnapMeters: 0.30,
    seedMaterial: 'FloorConcrete02' as const,
    positiveSeedComponentId:
      'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7' as const,
    negativeSeedComponentId:
      'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13' as const,
    comparedComponentCountPerSide: 57,
    zeroContactCountPerSide: 0,
    componentsWithin003PerSide: 0,
    componentsWithin008PerSide: 0,
    componentsWithin018PerSide: 0,
    componentsWithin030PerSide: 0,
    componentsWithin060PerSide: 3,
    componentsWithin200PerSide: 8,
    positiveNearestBridgeComponentId:
      'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c61' as const,
    positiveNearestSlopeComponentId:
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3' as const,
    positiveSecondBridgeComponentId:
      'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c59' as const,
    negativeNearestBridgeComponentId:
      'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c86' as const,
    negativeNearestSlopeComponentId:
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23' as const,
    negativeSecondBridgeComponentId:
      'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c87' as const,
    positiveNearestBridgeDistanceMeters: 0.5185586972146118,
    positiveNearestSlopeDistanceMeters: 0.5185586972146133,
    positiveSecondBridgeDistanceMeters: 0.5185586972146149,
    negativeNearestBridgeDistanceMeters: 0.5185586972146101,
    negativeNearestSlopeDistanceMeters: 0.5185586972146118,
    negativeSecondBridgeDistanceMeters: 0.5185586972146141,
    nearestCandidateMaterialSet: ['BridgeMetal00', 'FloorSlope00'] as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18AB ranks exact triangle-to-triangle distances from the only downstream component attached to the own-side glass SCC under Pass 18AA (FloorConcrete02 c7 / c13). No remaining source component touches it at <=0.30m. Exactly three mirrored candidates appear by 0.60m, all at ~0.518558697m: two BridgeMetal00 components and one FloorSlope00 component per side. All 14 trusted remaining downstream representatives are still disconnected from the own-side glass SCC and from non-glass runtime anchors. Therefore the first downstream mismatch is localized to a three-way mirrored source neighborhood, not yet to one justified connector. The next safe diagnostic is to classify source-side reachability from each of those three branches before testing any link. No radius inflation, trusted shortcut, 2m frontier link, or runtime promotion is authorized.'
  }),

  upperGlassBranchReachabilityPass18AC: Object.freeze({
    qaRunNumber: 1015,
    diagnosticOnly: true,
    thresholdMeters: [0.60, 0.85, 1.00, 1.50, 2.00] as const,
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
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3' as const,
    positiveImmediateFloorConcreteComponentId:
      'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c2' as const,
    negativeSlopeComponentId:
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23' as const,
    negativeImmediateFloorConcreteComponentId:
      'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c9' as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18AC removes the Pass 18AA FloorConcrete02 seed from traversal and classifies the three mirrored ~0.518558697m branches independently. Both BridgeMetal00 candidates collapse into the same three-component high bridge cluster and remain at Y~6 even with a 2.0m source-edge threshold. The FloorSlope00 candidate is qualitatively different and mirrored: at 0.60m it already reaches the slope plus FloorConcrete00 at Y=3, at 1.50m it reaches six components, and at 2.0m it reaches 14 components spanning Y=0..6 with FloorSlope, FloorConcrete, BridgeMetal, GrassFloor, and FloorConcrete01. Therefore the intended descending source branch is FloorSlope00, not either BridgeMetal branch. The next safe diagnostic is production-Human KCC feasibility across the exact FloorConcrete02 c7/c13 -> FloorSlope00 c3/c23 boundary before any navigation connector is tested.'
  }),

  upperGlassFloorSlopeKccPass18AD: Object.freeze({
    qaRunNumber: 1019,
    diagnosticOnly: true,
    characterMode: 'HUMAN' as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18AD tests only the mirrored FloorConcrete02 c7/c13 -> FloorSlope00 c3/c23 boundary selected by Pass 18AC. The exact closest-surface gap is 0.518558697m with zero boundary vertical delta on both sides. Production Human KCC crosses floor->slope and slope->floor on both sides with zero airborne ticks; all four probes start settled and finish grounded. This resolves physical traversal as an ordinary grounded bidirectional transition for the tested boundary. It does not yet authorize a CPU connector: the next safe diagnostic is a QA-only Recast representation test for this exact boundary while keeping the earlier BridgeMetal->FloorConcrete02 attachment isolated as a diagnostic control.'
  }),

  upperGlassFloorSlopeRecastPass18AE: Object.freeze({
    qaRunNumber: 1023,
    diagnosticOnly: true,
    trustedSnapMeters: 0.30,
    rawRadiiMeters: [0.30, 0.45, 0.60, 0.85, 1.00, 1.50] as const,
    baselineReachedDirectedPairs: 79,
    baselineWeakComponentCount: 9,
    baselineStronglyConnectedComponentCount: 11,
    bridgeFloorControlReachedDirectedPairs: 79,
    bridgeFloorControlWeakComponentCount: 9,
    bridgeFloorControlStronglyConnectedComponentCount: 11,
    positiveFloorSlopeBoundaryDistanceMeters: 0.5185586972146133,
    negativeFloorSlopeBoundaryDistanceMeters: 0.5185586972146118,
    positiveFloorTrustedBoundaryOffsetMeters: 1.8894579836149745,
    positiveSlopeTrustedBoundaryOffsetMeters: 3.570277448680558,
    negativeFloorTrustedBoundaryOffsetMeters: 1.915335904945901,
    negativeSlopeTrustedBoundaryOffsetMeters: 1.2887098420520973,
    positiveTrustedEndpointDistanceMeters: 2.398063193642438,
    negativeTrustedEndpointDistanceMeters: 3.139786329805321,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18AE keeps the Pass 18Z nonlocal BridgeMetal->FloorConcrete02 trusted link only as a diagnostic control, then sweeps a raw exact FloorConcrete02->FloorSlope00 link across the Pass 18AD KCC-feasible 0.518558697m boundary. At 0.30m and 0.45m neither side attaches. At 0.60m NEGATIVE_Z attaches while POSITIVE_Z does not. At 0.85m, 1.00m, and 1.50m both sides attach the slope representative to their own glass SCC. No variant reaches a non-glass runtime anchor and the tracked 25-anchor matrix remains 79/9/11. The trusted floor-slope control also attaches both sides but is nonlocal (2.398m / 3.140m endpoint separation) and is not promotable. The raw physical endpoint candidate is the relevant representation; the next safe step is a fine 0.60-0.85m radius sweep to locate the mirrored common threshold before collateral or promotion is considered.'
  }),

  upperGlassFloorSlopeFineRadiusPass18AF: Object.freeze({
    qaRunNumber: 1027,
    diagnosticOnly: true,
    trustedSnapMeters: 0.30,
    sampledRawRadiiMeters: [
      0.60, 0.625, 0.65, 0.675, 0.70, 0.725, 0.75, 0.775, 0.80, 0.825, 0.85
    ] as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18AF fine-sweeps the exact raw FloorConcrete02->FloorSlope00 boundary from 0.60m through 0.85m in 0.025m increments while retaining the nonlocal BridgeMetal->FloorConcrete02 link only as a diagnostic control. NEGATIVE_Z is already attached at 0.60m. POSITIVE_Z remains detached through 0.775m and first attaches at the sampled 0.80m radius; 0.80m, 0.825m, and 0.85m attach both sides. Every sampled candidate leaves the tracked 25-anchor matrix at 79/9/11 and reaches no non-glass runtime anchor. Therefore 0.80m is the first sampled common radius, not a proven exact minimum and not a production/global radius authority. The upper-glass blocker now returns upstream to the still-unresolved raw BridgeMetal->FloorConcrete02 attachment; further floor-slope threshold refinement is lower priority until that predecessor boundary has a faithful local representation.'
  }),

  upperGlassBridgeFloorEndpointIsolationPass18AG: Object.freeze({
    qaRunNumber: 1031,
    diagnosticOnly: true,
    sourceFixtureVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18AG isolates the upstream BridgeMetal->FloorConcrete02 attachment at the maximum previously tested 1.50m raw radius. Both sides are exactly mirrored: raw/raw fails; raw BridgeMetal + trusted FloorConcrete02 succeeds; trusted BridgeMetal + raw FloorConcrete02 fails; trusted/trusted succeeds. The raw BridgeMetal endpoint is therefore already attachable, while the exact raw FloorConcrete02 boundary endpoint is the common failure source on both sides. Every hybrid leaves the tracked 25-anchor matrix at 79/9/11 and reaches no non-glass runtime anchor. The trusted floor endpoints are 1.849m / 2.300m away from the physical boundary and remain nonlocal diagnostic controls. The next safe diagnostic is a source-mesh-local FloorConcrete02 endpoint retreat/search from the raw boundary toward the interior; do not inflate radius or promote the trusted shortcut.'
  }),

  upperGlassFloorEndpointLocalSearchPass18AH: Object.freeze({
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
    positiveFirstSuccessSourcePoint:
      [-10.67826430970341, 6, 12.118397071136153] as const,
    negativeFirstSuccessSourcePoint:
      [10.907632598231574, 6, -11.92383277567933] as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18AH searches only actual FloorConcrete02 source vertices/triangle centroids while preserving the exact raw BridgeMetal endpoint and the 1.50m diagnostic link radius. The raw floor boundary sample at 0m fails on both sides. The next sampled source point is mirrored at 0.6547373285m inward and succeeds on both sides; every later sampled source point also succeeds. This local point is substantially closer to the physical boundary than the previous trusted controls (1.849m / 2.300m). All selected candidates keep the tracked 25-anchor matrix at 79/9/11 and successful candidates reach no non-glass runtime anchor. The exact continuous retreat threshold is still unresolved because the discrete source sample set has no point between 0 and 0.6547m. The next safe diagnostic is a surface-validated interpolation sweep along that boundary-to-first-success segment.'
  }),

  upperGlassFloorEndpointInterpolationPass18AI: Object.freeze({
    qaRunNumber: 1039,
    diagnosticOnly: true,
    rawRadiusMeters: 1.50,
    interpolationRetreatsMeters: [
      0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45,
      0.50, 0.55, 0.60, 0.65, 0.654737328492778
    ] as const,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18AI interpolates only along the exact FloorConcrete02 source-surface segment between the raw boundary and the Pass 18AH first-success source sample. Every tested point lies on the source floor surface. POSITIVE_Z already attaches at 0.05m retreat after failing at 0m. NEGATIVE_Z fails through 0.10m and first attaches at 0.15m, so the first sampled common retreat is 0.15m and the unresolved common threshold lies in (0.10, 0.15]. A two-sided 0.15m candidate keeps the 25-anchor matrix at 79/9/11 and reaches no non-glass runtime anchor. The 1.50m link radius is still diagnostic-large; first refine the common retreat threshold, then minimize radius for that fixed local endpoint.'
  }),

  upperGlassFloorEndpointFineRetreatPass18AJ: Object.freeze({
    qaRunNumber: 1044,
    diagnosticOnly: true,
    rawRadiusMeters: 1.50,
    sampledRetreatsMeters: [
      0.100, 0.105, 0.110, 0.115, 0.120, 0.125,
      0.130, 0.135, 0.140, 0.145, 0.150
    ] as const,
    baselineReachedDirectedPairs: 79,
    baselineWeakComponentCount: 9,
    baselineStronglyConnectedComponentCount: 11,
    positiveAllFineSamplesConnected: true,
    negativeLastFailureRetreatMeters: 0.125,
    negativeFirstSuccessRetreatMeters: 0.130,
    firstSampledCommonSuccessRetreatMeters: 0.130,
    commonThresholdLowerExclusiveMeters: 0.125,
    commonThresholdUpperInclusiveMeters: 0.130,
    positiveProjectedSnapAtCommonMeters: 0.9997309981886592,
    negativeProjectedSnapAtCommonMeters: 0.9887536400664477,
    allFinePointsSourceSurfaceValid: true,
    commonCandidateReachedDirectedPairs: 79,
    commonCandidateWeakComponentCount: 9,
    commonCandidateStronglyConnectedComponentCount: 11,
    commonCandidateReachesNonGlassRuntimeAnchor: false,
    sampledCommonRetreatResolvedAt5mmGranularity: true,
    exactSub5mmThresholdResolved: false,
    qaCandidateRetreatMeters: 0.130,
    rawRadiusStillDiagnosticLarge: true,
    radiusMinimizationRequiredNext: true,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18AJ fine-sweeps the source-surface-valid FloorConcrete02 endpoint retreat from 0.100m through 0.150m in 0.005m increments with the exact raw BridgeMetal endpoint preserved. POSITIVE_Z succeeds at every fine sample. NEGATIVE_Z fails through 0.125m and first succeeds at 0.130m, making 0.130m the first sampled common retreat at 5mm resolution. The two-sided 0.130m candidate leaves the tracked 25-anchor matrix at 79/9/11 and reaches no non-glass runtime anchor. This is sufficient as the next QA endpoint candidate; the current 1.50m link radius remains diagnostic-large and must now be minimized independently before any combined upper-glass candidate is considered.'
  }),

  upperGlassBridgeFloorRadiusMinimizationPass18AK: Object.freeze({
    qaRunNumber: 1049,
    diagnosticOnly: true,
    fixedRetreatMeters: 0.130,
    bridgeEndpointMode: 'EXACT_RAW_PHYSICAL_ENDPOINT' as const,
    floorEndpointMode: 'PASS18AJ_SOURCE_SURFACE_RETREAT_FIXED' as const,
    bidirectional: true,
    globalRecastSettingsChanged: false,
    coarseRadiiMeters: [
      0.01, 0.025, 0.05, 0.10, 0.20, 0.30,
      0.45, 0.60, 0.80, 1.00, 1.25, 1.50
    ] as const,
    coarseLastCommonFailureRadiusMeters: 0.80,
    coarseFirstCommonSuccessRadiusMeters: 1.00,
    fineLastCommonFailureRadiusMeters: 0.98,
    fineFirstCommonSuccessRadiusMeters: 1.00,
    terminalFineStepMeters: 0.001,
    terminalLastCommonFailureRadiusMeters: 0.994,
    firstSampledCommonSuccessRadiusMeters: 0.995,
    commonThresholdLowerExclusiveMeters: 0.994,
    commonThresholdUpperInclusiveMeters: 0.995,
    positiveFixedEndpointSurfaceDistanceMeters: 0,
    negativeFixedEndpointSurfaceDistanceMeters: 0,
    positiveFixedEndpointProjectedSnapMeters: 0.9997309981886592,
    negativeFixedEndpointProjectedSnapMeters: 0.9887536400664477,
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
    activationBlockerCleared: false,
    notes:
      'Pass 18AK freezes the Pass 18AJ FloorConcrete02 endpoint at the source-surface-valid 0.130m retreat and preserves the exact raw BridgeMetal endpoint while varying only the bidirectional link radius. The coarse sweep brackets common mirrored attachment between 0.80m failure and 1.00m success; a 0.02m fine sweep narrows that to (0.98, 1.00], then a 0.001m terminal sweep finds 0.994m failure and 0.995m first sampled common success. The 0.995m two-sided candidate keeps the tracked 25-anchor matrix at 79/9/11, reaches only each side\'s three own-glass anchors, and reaches no non-glass runtime anchor. This is a QA radius candidate, not an exact threshold or runtime promotion. The next step is to combine it with the independent Pass 18AF FloorConcrete02->FloorSlope00 0.80m QA candidate and audit the full source-native chain.'
  }),


  upperGlassCombinedSourceChainPass18AL: Object.freeze({
    qaRunNumber: 1060,
    diagnosticOnly: true,
    upstreamSourcePass: '18AK' as const,
    upstreamRetreatMeters: 0.130,
    upstreamRadiusMeters: 0.995,
    downstreamSourcePass: '18AF' as const,
    downstreamRadiusMeters: 0.80,
    trustedNonLocalShortcutsUsed: false,
    globalRecastSettingsChanged: false,
    baselineReachedDirectedPairs: 79,
    baselineWeakComponentCount: 9,
    baselineStronglyConnectedComponentCount: 11,
    combinedReachedDirectedPairs: 79,
    combinedWeakComponentCount: 9,
    combinedStronglyConnectedComponentCount: 11,
    combinedAddedTrackedPairs: 0,
    combinedRemovedTrackedPairs: 0,
    bothSidesFloorSlopeConnectedToOwnGlass: true,
    combinedReachesNonGlassRuntimeAnchor: false,
    positiveTrustedConnectedComponentCount: 2,
    negativeTrustedConnectedComponentCount: 2,
    positiveRouteContinuingNextBoundaryDistanceMeters: 0.5185586972146173,
    negativeRouteContinuingNextBoundaryDistanceMeters: 0.5185586972146101,
    positiveRouteContinuingNextFrom:
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3',
    positiveRouteContinuingNextTo:
      'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c2',
    negativeRouteContinuingNextFrom:
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23',
    negativeRouteContinuingNextTo:
      'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c9',
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18AL combines only the frozen Pass 18AK BridgeMetal->FloorConcrete02 candidate and Pass 18AF FloorConcrete02->FloorSlope00 candidate. Both mirrored chains reach FloorSlope00, but the tracked 25-anchor matrix remains 79/9/11 with zero non-glass runtime-anchor connections. Reclassification of the combined candidate identifies the next route-continuing source-adjacent break as FloorSlope00->FloorConcrete00 at the same mirrored 0.518559m physical gap. Nearby high BridgeMetal branches remain non-route dead ends from Pass 18AC and are not promoted.'
  }),

  upperGlassSlopeFloor00KccPass18AM: Object.freeze({
    qaRunNumber: 1060,
    diagnosticOnly: true,
    boundaryClass: 'FloorSlope00->FloorConcrete00' as const,
    effectiveHumanContactRadiusMeters: 0.345,
    positivePhysicalBoundaryDistanceMeters: 0.5185586972146173,
    negativePhysicalBoundaryDistanceMeters: 0.5185586972146101,
    directedTraversalCount: 4,
    successfulDirectedTraversalCount: 4,
    totalAirborneTicks: 0,
    allSettledInitially: true,
    positiveSlopeToFloorFinalErrorMeters: 0.10888470794199546,
    positiveFloorToSlopeFinalErrorMeters: 0.14822835630626588,
    negativeSlopeToFloorFinalErrorMeters: 0.12670558709458002,
    negativeFloorToSlopeFinalErrorMeters: 0.14853104770368533,
    ordinaryWalkBidirectionalOnBothSides: true,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    notes:
      'Pass 18AM reuses the production Human Rapier KCC profile against only the exact mirrored FloorSlope00/FloorConcrete00 source meshes. All four directed traversals settle and cross successfully with zero airborne ticks. This classifies the boundary as ordinary bidirectional Human walking in the reconstructed production movement profile; the remaining disconnect is a navigation representation issue, not a required jump/drop action.'
  }),

  upperGlassSlopeFloor00RadiusPass18AN: Object.freeze({
    qaRunNumber: 1060,
    diagnosticOnly: true,
    humanKccSourcePass: '18AM' as const,
    humanKccBidirectionalSuccess: true,
    upstreamSourcePass: '18AK' as const,
    upstreamRetreatMeters: 0.130,
    upstreamRadiusMeters: 0.995,
    floorSlopeSourcePass: '18AF' as const,
    floorSlopeRadiusMeters: 0.80,
    endpointMode: 'EXACT_RAW_PHYSICAL_PAIR' as const,
    bidirectional: true,
    positivePhysicalBoundaryDistanceMeters: 0.5185586972146173,
    negativePhysicalBoundaryDistanceMeters: 0.5185586972146101,
    coarseLastCommonFailureRadiusMeters: 0.60,
    coarseFirstCommonSuccessRadiusMeters: 0.70,
    fineLastCommonFailureRadiusMeters: 0.66,
    fineFirstCommonSuccessRadiusMeters: 0.67,
    terminalFineStepMeters: 0.001,
    terminalLastCommonFailureRadiusMeters: 0.668,
    firstSampledCommonSuccessRadiusMeters: 0.669,
    commonThresholdLowerExclusiveMeters: 0.668,
    commonThresholdUpperInclusiveMeters: 0.669,
    candidateReachedDirectedPairs: 79,
    candidateWeakComponentCount: 9,
    candidateStronglyConnectedComponentCount: 11,
    bothSidesFloor00BidirectionalToOwnGlass: true,
    candidateReachesNonGlassRuntimeAnchor: false,
    sampledCommonRadiusResolvedAt1mmGranularity: true,
    exactSub1mmThresholdResolved: false,
    qaCandidateRadiusMeters: 0.669,
    globalRecastSettingsChanged: false,
    runtimePromotionAuthorized: false,
    activationBlockerCleared: false,
    nextSourceAdjacentBreakLocalizationRequired: true,
    notes:
      'Pass 18AN keeps the frozen 18AK and 18AF links unchanged and varies only the exact raw FloorSlope00->FloorConcrete00 bidirectional link radius. Common mirrored attachment is bracketed from 0.60m failure to 0.70m success, refined to 0.66m failure / 0.67m success, then to 0.668m failure / 0.669m first sampled success. The 0.669m candidate reaches each side\'s own upper-glass SCC through FloorConcrete00 but leaves the tracked matrix at 79/9/11 and reaches no non-glass runtime anchor. The next safe task is to localize only the first source-adjacent break beyond FloorConcrete00.'
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
    'Close the exact center +1.5m step semantic authority gap with current gameplay evidence. Pass 18W proves production Human KCC ordinary walking cannot climb either mirrored strip, while normal jump-up and natural drop-down both succeed on both sides. This supports a QA-only JUMP_UP_DROP_DOWN transition class, but archived/current public evidence still does not directly prove the original game exposes both directions or requires jump input at this exact strip. Capture the exact lower->upper and upper->lower behavior before authoring CPU off-mesh links.',
    'Close the final grate semantic authority gap with a controlled current post-Ver.7.2.0 Undertow/Matagai capture. Pass 18V removes three misclassified Scorch Gorge references and replaces them with correct current Undertow evidence that documents spawn->middle grate use, middle/checkpoint->enemy grate use, and normal humanoid grate walkability. That is strong route-level bidirectional evidence, but no retained source directly observes both exact Pass 18U local breaks in both directions. Capture one exact grate-chain round trip before promoting the 0.725m ingress / 0.85m final QA candidate.',
    'Continue from the Pass 18AN source-local upper-glass chain. The exact raw FloorSlope00->FloorConcrete00 boundary is ordinary bidirectional Human walking in Pass 18AM and first attaches on both mirrored sides at sampled 0.669m radius in Pass 18AN, but the tracked matrix remains 79/9/11 with no non-glass runtime anchor. Localize only the first source-adjacent break beyond FloorConcrete00; do not replace the chain with a broad frontier shortcut or global Recast tuning.',
    'A final production-candidate Recast pass after all traversable Undertow geometry is bound, with spawn-to-major-region, grate, upper-glass, unpaintable traversable-region, and mirrored cross-route probes run against that exact candidate.'
  ] as const,
  notes:
    'Pass 18AN preserves Passes 18A-18AM and advances only the upper-glass source-local continuation. Pass 18AL proves the frozen 18AK + 18AF chain reaches FloorSlope00 on both mirrored sides without changing the tracked 79/9/11 matrix. Pass 18AM proves the next FloorSlope00<->FloorConcrete00 boundary is ordinary bidirectional Human KCC traversal with zero airborne ticks. Pass 18AN then minimizes only that raw boundary link and finds 0.668m failure / 0.669m first sampled common success, still with no non-glass runtime-anchor connection. The next safe step is to localize the first source-adjacent break beyond FloorConcrete00. Grate and center-step candidates remain semantic-evidence gated. FULL_STAGE_CONNECTIVITY_QA_PENDING remains activation-blocking.'
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
    errors.push('Pass 18AN partial QA must not claim full-stage connectivity readiness');
  }

  const matrix = audit.paintAnchorMatrixPass18A;
  if (
    audit.resolutionPass !== '18AN' ||
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

  const retreat18q = audit.positiveIngressStartRetreatPass18Q;
  if (
    retreat18q.qaRunNumber !== 962 ||
    !retreat18q.diagnosticOnly ||
    retreat18q.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(retreat18q.rawIngressRadiusMeters - 1.00) > 1e-12 ||
    Math.abs(retreat18q.trustedFinalLinkRadiusMeters - 0.30) > 1e-12 ||
    Math.abs(retreat18q.positiveStartTravelMeters - 1.9872737049434641) > 1e-12 ||
    retreat18q.testedFractionCount !== 13 ||
    retreat18q.rawStartConnected ||
    Math.abs(retreat18q.firstSuccessfulFraction - 0.05) > 1e-12 ||
    Math.abs(retreat18q.firstSuccessfulMovedMeters - 0.0993636852471732) > 1e-12 ||
    Math.abs(retreat18q.firstSuccessfulStartSnapMeters - 0.5839682784207668) > 1e-12 ||
    !retreat18q.allTestedFractionsAfterZeroConnected ||
    Math.abs(retreat18q.positiveRawStartSnapMeters - 0.6472549947142026) > 1e-12 ||
    Math.abs(retreat18q.positiveTrustedStartSnapMeters) > 1e-12 ||
    Math.abs(retreat18q.positiveRawEndSnapMeters - 0.3420302065480327) > 1e-12 ||
    !retreat18q.negativeRawControlConnected ||
    !retreat18q.coarseRetreatThresholdLocalizedBelow100Millimeters ||
    !retreat18q.closestPointSnapMagnitudeAloneStillNotExplanatory ||
    retreat18q.localConnectorSemanticsValidated ||
    retreat18q.originalGrateDirectionalityResolved ||
    retreat18q.runtimePromotionAuthorized ||
    retreat18q.activationBlockerCleared
  ) {
    errors.push('Pass 18Q positive ingress start-retreat boundary drifted');
  }

  const fine18r = audit.positiveIngressStartFineSweepPass18R;
  if (
    fine18r.qaRunNumber !== 962 ||
    !fine18r.diagnosticOnly ||
    fine18r.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(fine18r.rawIngressRadiusMeters - 1.00) > 1e-12 ||
    Math.abs(fine18r.trustedFinalLinkRadiusMeters - 0.30) > 1e-12 ||
    Math.abs(fine18r.sweepStartMeters) > 1e-12 ||
    Math.abs(fine18r.sweepEndMeters - 0.100) > 1e-12 ||
    Math.abs(fine18r.sweepStepMeters - 0.005) > 1e-12 ||
    fine18r.testedOffsetCount !== 21 ||
    Math.abs(fine18r.positiveStartTravelMeters - 1.9872737049434641) > 1e-12 ||
    Math.abs(fine18r.lastFailedOffsetMeters - 0.035) > 1e-12 ||
    Math.abs(fine18r.firstSuccessfulOffsetMeters - 0.040) > 1e-12 ||
    Math.abs(fine18r.lastFailedFraction - 0.017612068188159174) > 1e-12 ||
    Math.abs(fine18r.firstSuccessfulFraction - 0.020128077929324768) > 1e-12 ||
    Math.abs(fine18r.lastFailedStartSnapMeters - 0.6459551748278465) > 1e-12 ||
    Math.abs(fine18r.firstSuccessfulStartSnapMeters - 0.6424489783331878) > 1e-12 ||
    fine18r.lastFailedProjectedPoint.join(',') !==
      '-25.715261459350586,7.600000381469727,31.51282501220703' ||
    fine18r.firstSuccessfulProjectedPoint.join(',') !==
      '-25.715261459350586,7.5,30.612831115722656' ||
    Math.abs(fine18r.thresholdBracketWidthMeters - 0.005) > 1e-12 ||
    !fine18r.attachmentTransitionBetween35And40Millimeters ||
    !fine18r.allOffsetsAtOrAbove40MillimetersConnectedThrough100Millimeters ||
    !fine18r.closestPointProjectionChangesDiscontinuouslyAtThreshold ||
    fine18r.scalarSnapDistanceThresholdExplainsTransition ||
    !fine18r.navPolyIdentityBoundaryStronglyIndicated ||
    !fine18r.negativeRawControlConnected ||
    fine18r.minimumFaithfulRuntimeCorrectionResolved ||
    fine18r.localConnectorSemanticsValidated ||
    fine18r.originalGrateDirectionalityResolved ||
    fine18r.runtimePromotionAuthorized ||
    fine18r.activationBlockerCleared
  ) {
    errors.push('Pass 18R positive ingress fine-sweep boundary drifted');
  }

  const local18s = audit.localRawChainRadiusPass18S;
  if (
    local18s.qaRunNumber !== 967 ||
    !local18s.diagnosticOnly ||
    local18s.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(local18s.positiveRetreatMeters - 0.040) > 1e-12 ||
    Math.abs(local18s.trustedControlRadiusMeters - 0.30) > 1e-12 ||
    local18s.testedRadiiMeters.join(',') !== '0.3,0.36,0.45,0.6,0.75,0.9,1' ||
    local18s.baselineReachedDirectedPairs !== 79 ||
    local18s.baselineWeakComponentCount !== 9 ||
    local18s.baselineStronglyConnectedComponentCount !== 11 ||
    Math.abs(local18s.positive.localIngressStartSnapMeters - 0.6424489783331878) > 1e-12 ||
    Math.abs(local18s.positive.rawIngressEndSnapMeters - 0.3420302065480327) > 1e-12 ||
    Math.abs(local18s.positive.rawFinalStartSnapMeters - 0.6870675165796135) > 1e-12 ||
    Math.abs(local18s.positive.rawFinalEndSnapMeters - 0.9125402509938235) > 1e-12 ||
    Math.abs(local18s.positive.firstSuccessfulIngressRadiusMeters - 0.75) > 1e-12 ||
    Math.abs(local18s.positive.firstSuccessfulFinalRadiusMeters - 0.90) > 1e-12 ||
    Math.abs(local18s.positive.combinedIngressRadiusMeters - 0.75) > 1e-12 ||
    Math.abs(local18s.positive.combinedFinalRadiusMeters - 0.90) > 1e-12 ||
    !local18s.positive.combinedBidirectionallyReached ||
    Math.abs(local18s.negative.localIngressStartSnapMeters - 0.7401798316876944) > 1e-12 ||
    Math.abs(local18s.negative.rawIngressEndSnapMeters - 0.5103195238057004) > 1e-12 ||
    Math.abs(local18s.negative.rawFinalStartSnapMeters - 0.688674567555729) > 1e-12 ||
    Math.abs(local18s.negative.rawFinalEndSnapMeters - 0.9031123713745141) > 1e-12 ||
    Math.abs(local18s.negative.firstSuccessfulIngressRadiusMeters - 0.75) > 1e-12 ||
    Math.abs(local18s.negative.firstSuccessfulFinalRadiusMeters - 0.90) > 1e-12 ||
    Math.abs(local18s.negative.combinedIngressRadiusMeters - 0.75) > 1e-12 ||
    Math.abs(local18s.negative.combinedFinalRadiusMeters - 0.90) > 1e-12 ||
    !local18s.negative.combinedBidirectionallyReached ||
    !local18s.mirroredLocalThresholdsMatch ||
    !local18s.positiveFortyMillimeterRetreatRestoresMirroredRadiusBehavior ||
    local18s.ingressThresholdBracketMeters.join(',') !== '0.6,0.75' ||
    local18s.finalThresholdBracketMeters.join(',') !== '0.75,0.9' ||
    local18s.minimumAttachmentRadiiFineResolved ||
    local18s.fullMatrixCollateralValidated ||
    local18s.originalGrateDirectionalityResolved ||
    local18s.localConnectorSemanticsValidated ||
    local18s.runtimePromotionAuthorized ||
    local18s.activationBlockerCleared
  ) {
    errors.push('Pass 18S local raw-chain radius boundary drifted');
  }

  const fine18t = audit.localRawChainFineRadiusPass18T;
  if (
    fine18t.qaRunNumber !== 972 ||
    !fine18t.diagnosticOnly ||
    fine18t.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(fine18t.positiveRetreatMeters - 0.040) > 1e-12 ||
    fine18t.testedIngressRadiiMeters.join(',') !== '0.6,0.625,0.65,0.675,0.7,0.725,0.75' ||
    fine18t.testedFinalRadiiMeters.join(',') !== '0.75,0.775,0.8,0.825,0.85,0.875,0.9' ||
    Math.abs(fine18t.positive.firstSuccessfulIngressRadiusMeters - 0.65) > 1e-12 ||
    Math.abs(fine18t.positive.firstSuccessfulFinalRadiusMeters - 0.85) > 1e-12 ||
    Math.abs(fine18t.positive.combinedIngressRadiusMeters - 0.65) > 1e-12 ||
    Math.abs(fine18t.positive.combinedFinalRadiusMeters - 0.85) > 1e-12 ||
    !fine18t.positive.combinedBidirectionallyReached ||
    Math.abs(fine18t.negative.firstSuccessfulIngressRadiusMeters - 0.725) > 1e-12 ||
    Math.abs(fine18t.negative.firstSuccessfulFinalRadiusMeters - 0.85) > 1e-12 ||
    Math.abs(fine18t.negative.combinedIngressRadiusMeters - 0.725) > 1e-12 ||
    Math.abs(fine18t.negative.combinedFinalRadiusMeters - 0.85) > 1e-12 ||
    !fine18t.negative.combinedBidirectionallyReached ||
    !fine18t.finalThresholdMatchesBothSides ||
    !fine18t.ingressThresholdStillAsymmetricAt25MillimeterResolution ||
    Math.abs(fine18t.commonMirroredCandidateIngressRadiusMeters - 0.725) > 1e-12 ||
    Math.abs(fine18t.commonMirroredCandidateFinalRadiusMeters - 0.85) > 1e-12 ||
    !fine18t.commonMirroredCandidateUsesOnlyLocalRawEndpointsExceptPositiveFortyMillimeterStart ||
    !fine18t.commonMirroredCandidateBidirectionallyFeasibleBothSides ||
    fine18t.exactMinimumAttachmentRadiiResolved ||
    fine18t.fullMatrixCollateralValidated ||
    fine18t.pathShapeValidated ||
    fine18t.originalGrateDirectionalityResolved ||
    fine18t.localConnectorSemanticsValidated ||
    fine18t.runtimePromotionAuthorized ||
    fine18t.activationBlockerCleared
  ) {
    errors.push('Pass 18T local fine-radius boundary drifted');
  }

  const candidate18u = audit.localCandidateCollateralPass18U;
  if (
    candidate18u.qaRunNumber !== 977 ||
    !candidate18u.diagnosticOnly ||
    candidate18u.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(candidate18u.positiveRetreatMeters - 0.040) > 1e-12 ||
    Math.abs(candidate18u.ingressRadiusMeters - 0.725) > 1e-12 ||
    Math.abs(candidate18u.finalRadiusMeters - 0.85) > 1e-12 ||
    candidate18u.candidateLinkCount !== 4 ||
    candidate18u.baselineReachedDirectedPairs !== 79 ||
    candidate18u.baselineWeakComponentCount !== 9 ||
    candidate18u.baselineStronglyConnectedComponentCount !== 11 ||
    candidate18u.candidateReachedDirectedPairs !== 89 ||
    candidate18u.candidateWeakComponentCount !== 7 ||
    candidate18u.candidateStronglyConnectedComponentCount !== 9 ||
    candidate18u.baselineIsolatedAnchorCount !== 3 ||
    candidate18u.candidateIsolatedAnchorCount !== 1 ||
    candidate18u.newlyReachedDirectedPairCount !== 10 ||
    candidate18u.removedDirectedPairCount !== 0 ||
    !candidate18u.nonGrateConnectivityStableIgnoringAddedGrates ||
    !candidate18u.eachGrateReachesExactlyOwnFourAnchorRouteClusterPlusSelf ||
    candidate18u.crossSideGrateAttachmentObserved ||
    candidate18u.upperGlassCollateralAttachmentObserved ||
    candidate18u.centerStepCollateralAttachmentObserved ||
    candidate18u.positiveFocusedForwardPointCount !== 9 ||
    candidate18u.positiveFocusedReversePointCount !== 14 ||
    candidate18u.negativeFocusedForwardPointCount !== 10 ||
    candidate18u.negativeFocusedReversePointCount !== 10 ||
    Math.abs(candidate18u.focusedEndpointErrorMeters) > 1e-12 ||
    !candidate18u.fullMatrixCollateralValidated ||
    !candidate18u.focusedPathEndpointValidated ||
    !candidate18u.candidateTopologyMatchesIntendedGrateRouteClusters ||
    candidate18u.exactMinimumAttachmentRadiiResolved ||
    candidate18u.originalGrateDirectionalityResolved ||
    candidate18u.localConnectorSemanticsValidated ||
    candidate18u.runtimePromotionAuthorized ||
    candidate18u.activationBlockerCleared
  ) {
    errors.push('Pass 18U local candidate collateral boundary drifted');
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

  const evidence18v = audit.correctedGrateDirectionalityEvidencePass18V;
  const evidenceIds18v = new Set(
    UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES.map((reference) => reference.id)
  );
  if (
    evidence18v.evidenceAuditDate !== '2026-09-30' ||
    evidence18v.correctedReferenceCount !== 5 ||
    evidence18v.currentDirectionalityReferenceCount !== 3 ||
    evidence18v.currentRuleVariantReferenceCount !== 1 ||
    evidence18v.terrainMechanicReferenceCount !== 1 ||
    evidence18v.removedMisclassifiedScorchGorgeReferenceCount !== 3 ||
    evidence18v.correctedReferenceIds.join(',') !==
      'CURRENT_SPAWN_TO_CENTER,CURRENT_RAINMAKER_GRATE_ADVANCE,CURRENT_RAINMAKER_GRATE_ADVANCE_CORROBORATION,CURRENT_RULE_VARIANTS,GENERAL_GRATE_WALKABILITY' ||
    evidenceIds18v.size !== 5 ||
    !evidence18v.allStageSpecificReferencesIdentifyUndertow ||
    !evidence18v.currentSpawnToCenterViaGrateDocumented ||
    !evidence18v.currentCenterToEnemyViaGrateDocumented ||
    !evidence18v.currentCenterToEnemyViaGrateCorroborated ||
    !evidence18v.humanoidGrateWalkabilityDocumented ||
    !evidence18v.undertowAnarchyGratePresenceDocumented ||
    !evidence18v.oppositeRouteDirectionsDocumentedAtCurrentStageLevel ||
    evidence18v.exactPass18ULocalBreaksObservedBidirectionally ||
    evidence18v.routeLevelEvidenceAloneAuthorizesExactBidirectionalLinks ||
    evidence18v.originalGrateDirectionalityResolved ||
    !evidence18v.controlledCurrentVersionCaptureRequired ||
    evidence18v.localConnectorSemanticsValidated ||
    evidence18v.runtimePromotionAuthorized ||
    evidence18v.activationBlockerCleared
  ) {
    errors.push('Pass 18V corrected grate directionality evidence boundary drifted');
  }

  const step18w = audit.centerSmallStepKccPass18W;
  if (
    step18w.qaRunNumber !== 988 ||
    !step18w.diagnosticOnly ||
    Math.abs(step18w.canonicalStepDeltaMeters - 1.5) > 1e-12 ||
    step18w.mirroredProbeCount !== 6 ||
    Math.abs(step18w.topInsetMeters - 0.60) > 1e-12 ||
    Math.abs(step18w.lowerInsetFromSharedEdgeMetersPerSide - 0.80) > 1e-12 ||
    Math.abs(step18w.humanRadiusMeters - 0.32) > 1e-12 ||
    Math.abs(step18w.controllerOffsetMeters - 0.025) > 1e-12 ||
    Math.abs(step18w.autostepMaxHeightMeters - 0.34) > 1e-12 ||
    Math.abs(step18w.jumpSpeedMetersPerSecond - 8.2) > 1e-12 ||
    Math.abs(step18w.gravityMetersPerSecond2 - 28) > 1e-12 ||
    Math.abs(step18w.theoreticalBallisticMaxRiseMeters - 1.2007142857142856) > 1e-12 ||
    step18w.walkUp.directedProbeCount !== 2 ||
    step18w.walkUp.successfulProbeCount !== 0 ||
    step18w.walkUp.bothSidesReachTarget ||
    step18w.walkUp.positiveAirborneTicks !== 0 ||
    step18w.walkUp.negativeAirborneTicks !== 230 ||
    step18w.walkUp.productionKccOrdinaryWalkUpFeasible ||
    step18w.jumpUp.directedProbeCount !== 2 ||
    step18w.jumpUp.successfulProbeCount !== 2 ||
    !step18w.jumpUp.bothSidesReachTarget ||
    step18w.jumpUp.positiveAirborneTicks !== 14 ||
    step18w.jumpUp.negativeAirborneTicks !== 15 ||
    Math.abs(step18w.jumpUp.positiveMaximumRiseAboveStartMeters - 1.5292533683776854) > 1e-9 ||
    Math.abs(step18w.jumpUp.negativeMaximumRiseAboveStartMeters - 1.5295673656463622) > 1e-9 ||
    !step18w.jumpUp.productionKccNormalJumpUpFeasible ||
    step18w.dropDown.directedProbeCount !== 2 ||
    step18w.dropDown.successfulProbeCount !== 2 ||
    !step18w.dropDown.bothSidesReachTarget ||
    step18w.dropDown.positiveAirborneTicks !== 16 ||
    step18w.dropDown.negativeAirborneTicks !== 16 ||
    Math.abs(step18w.dropDown.positiveMaximumDropBelowStartMeters - 1.4395598721504212) > 1e-9 ||
    Math.abs(step18w.dropDown.negativeMaximumDropBelowStartMeters - 1.4753304076194764) > 1e-9 ||
    !step18w.dropDown.productionKccNaturalDropDownFeasible ||
    step18w.productionKccTransitionClass !== 'JUMP_UP_DROP_DOWN_QA_ONLY' ||
    !step18w.productionKccPhysicalFeasibilityResolved ||
    !step18w.productionKccRequiresJumpForTestedUpwardCrossing ||
    !step18w.productionKccAllowsNaturalDownwardDrop ||
    !step18w.mirroredOutcomeClassMatches ||
    step18w.originalGameTraversalDirectionalityResolved ||
    step18w.originalGameJumpRequirementResolved ||
    !step18w.controlledCurrentVersionCaptureRequired ||
    step18w.offMeshLinkAuthorized ||
    step18w.runtimePromotionAuthorized ||
    step18w.activationBlockerCleared
  ) {
    errors.push('Pass 18W center-step production-KCC boundary drifted');
  }

  const glass18x = audit.upperGlassFullSourceClusterPass18X;
  if (
    glass18x.qaRunNumber !== 993 ||
    !glass18x.diagnosticOnly ||
    glass18x.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(glass18x.trustedSnapMeters - 0.30) > 1e-12 ||
    glass18x.downstreamSourceComponentCountPerSide !== 58 ||
    glass18x.uniqueDownstreamSourceComponentCount !== 116 ||
    glass18x.excludedImmediatePredecessorBridgeMetalCountPerSide !== 24 ||
    glass18x.baselineReachedDirectedPairs !== 79 ||
    glass18x.baselineWeakComponentCount !== 9 ||
    glass18x.baselineStronglyConnectedComponentCount !== 11 ||
    glass18x.candidateReachedDirectedPairs !== 79 ||
    glass18x.candidateWeakComponentCount !== 9 ||
    glass18x.candidateStronglyConnectedComponentCount !== 11 ||
    glass18x.addedDirectedPairCount !== 0 ||
    glass18x.removedDirectedPairCount !== 0 ||
    glass18x.changedNonGlassRowCount !== 0 ||
    glass18x.trustedRepresentativeCountPerSide !== 15 ||
    glass18x.connectedToOwnGlassComponentCountPerSide !== 0 ||
    glass18x.connectedToOppositeGlassComponentCountPerSide !== 0 ||
    glass18x.connectedToNonGlassComponentCountPerSide !== 0 ||
    glass18x.materialInventoryPerSide.BridgeMetal00 !== 46 ||
    glass18x.materialInventoryPerSide.FloorConcrete00 !== 1 ||
    glass18x.materialInventoryPerSide.FloorConcrete01 !== 1 ||
    glass18x.materialInventoryPerSide.FloorConcrete02 !== 4 ||
    glass18x.materialInventoryPerSide.FloorSlope00 !== 3 ||
    glass18x.materialInventoryPerSide.GrassFloor00 !== 3 ||
    glass18x.floorSlopeProjectYRangeMeters.join(',') !== '0,6' ||
    glass18x.downstreamOnlyExactSourceGeometryChangedConnectivity ||
    glass18x.downstreamOnlyClusterConnectsCurrentGlassScc ||
    glass18x.downstreamOnlyClusterConnectsAnyRuntimeNonGlassScc ||
    !glass18x.immediatePredecessorBridgeMetalWasIntentionallyExcludedByPass18G ||
    !glass18x.fullPredecessorPlusDownstreamSourceRetestRequired ||
    glass18x.twoMeterFrontierLinkAuthorized ||
    glass18x.globalRecastParameterChangeAuthorized ||
    glass18x.runtimePromotionAuthorized ||
    glass18x.activationBlockerCleared
  ) {
    errors.push('Pass 18X upper-glass downstream source-cluster boundary drifted');
  }

  const chain18y = audit.upperGlassFullPredecessorChainPass18Y;
  if (
    chain18y.qaRunNumber !== 999 ||
    !chain18y.diagnosticOnly ||
    chain18y.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(chain18y.trustedSnapMeters - 0.30) > 1e-12 ||
    chain18y.immediatePredecessorLogicalComponentCountPerSide !== 24 ||
    chain18y.downstreamSourceComponentCountPerSide !== 58 ||
    chain18y.fullLogicalComponentCountPerSide !== 82 ||
    chain18y.uniqueDownstreamSourceComponentCount !== 116 ||
    chain18y.sourceSolidCount !== 118 ||
    chain18y.baselineReachedDirectedPairs !== 79 ||
    chain18y.baselineWeakComponentCount !== 9 ||
    chain18y.baselineStronglyConnectedComponentCount !== 11 ||
    chain18y.candidateReachedDirectedPairs !== 79 ||
    chain18y.candidateWeakComponentCount !== 9 ||
    chain18y.candidateStronglyConnectedComponentCount !== 11 ||
    chain18y.addedDirectedPairCount !== 0 ||
    chain18y.removedDirectedPairCount !== 0 ||
    chain18y.changedNonGlassRowCount !== 0 ||
    !chain18y.predecessorTrustedRepresentativeBothSides ||
    !chain18y.predecessorConnectedToOwnGlassBothSides ||
    chain18y.predecessorConnectedToOppositeGlassEitherSide ||
    chain18y.predecessorConnectedToNonGlassEitherSide ||
    chain18y.predecessorBidirectionalOwnGlassAnchorCountPerSide !== 3 ||
    chain18y.trustedDownstreamRepresentativeCountPerSide !== 15 ||
    chain18y.downstreamConnectedToOwnGlassComponentCountPerSide !== 0 ||
    chain18y.downstreamConnectedToOppositeGlassComponentCountPerSide !== 0 ||
    chain18y.downstreamConnectedToNonGlassComponentCountPerSide !== 0 ||
    chain18y.fullSourceChainChangedAnchorConnectivity ||
    !chain18y.immediatePredecessorIngressIntoCurrentGlassResolved ||
    chain18y.downstreamSourceClusterRecastAttachedToPredecessor ||
    !chain18y.recastBreakLocalizedToPredecessorDownstreamBoundary ||
    !chain18y.pass18dGroundedBridgeToNearestFloorKccFeasible ||
    !chain18y.sourceNativeRampChainBroadGeometryMissingHypothesisRejected ||
    !chain18y.localQaConnectorCandidateMayBeInvestigated ||
    chain18y.localQaConnectorPromotionAuthorized ||
    chain18y.twoMeterFrontierLinkAuthorized ||
    chain18y.globalRecastParameterChangeAuthorized ||
    chain18y.runtimePromotionAuthorized ||
    chain18y.activationBlockerCleared
  ) {
    errors.push('Pass 18Y upper-glass full-chain boundary drifted');
  }

  const connector18z = audit.upperGlassLocalConnectorPass18Z;
  if (
    connector18z.qaRunNumber !== 1004 ||
    !connector18z.diagnosticOnly ||
    connector18z.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(connector18z.trustedSnapMeters - 0.30) > 1e-12 ||
    connector18z.rawRadiiMeters.join(',') !== '0.3,0.45,0.6,0.85,1,1.5' ||
    connector18z.baselineReachedDirectedPairs !== 79 ||
    connector18z.baselineWeakComponentCount !== 9 ||
    connector18z.baselineStronglyConnectedComponentCount !== 11 ||
    Math.abs(connector18z.positiveSourceBoundaryDistanceMeters - 0.5185586972146101) > 1e-12 ||
    Math.abs(connector18z.negativeSourceBoundaryDistanceMeters - 0.5185586972146126) > 1e-12 ||
    Math.abs(connector18z.positiveBridgeTrustedBoundaryOffsetMeters - 3.216527889612188) > 1e-9 ||
    Math.abs(connector18z.positiveFloorTrustedBoundaryOffsetMeters - 1.8492402471551055) > 1e-9 ||
    Math.abs(connector18z.negativeBridgeTrustedBoundaryOffsetMeters - 3.2163496542765126) > 1e-9 ||
    Math.abs(connector18z.negativeFloorTrustedBoundaryOffsetMeters - 2.3003785443214677) > 1e-9 ||
    Math.abs(connector18z.positiveTrustedEndpointDistanceMeters - 4.818701016746154) > 1e-9 ||
    Math.abs(connector18z.negativeTrustedEndpointDistanceMeters - 3.879513844745101) > 1e-9 ||
    connector18z.rawVariantCount !== 18 ||
    connector18z.allRawVariantsReachedDirectedPairs !== 79 ||
    connector18z.allRawVariantsWeakComponentCount !== 9 ||
    connector18z.allRawVariantsStronglyConnectedComponentCount !== 11 ||
    connector18z.rawPhysicalBoundaryAttachmentSucceededAtOrBelow150BothSides ||
    connector18z.rawPhysicalBoundaryCandidateChangedAnchorConnectivity ||
    !connector18z.trustedControlFloorJoinsOwnGlassBothSides ||
    connector18z.trustedControlFloorJoinsAnyNonGlassEitherSide ||
    connector18z.trustedControlChangedAnchorConnectivity ||
    !connector18z.trustedControlIsNonlocal ||
    connector18z.oneLocalPhysicalBoundaryConnectorSufficient ||
    !connector18z.downstreamInternalRecastBreaksStillNeedClassification ||
    connector18z.exactRawBoundaryRadiusSolutionFoundAtOrBelow150 ||
    connector18z.radiusInflationAuthorized ||
    connector18z.localConnectorPromotionAuthorized ||
    connector18z.twoMeterFrontierLinkAuthorized ||
    connector18z.globalRecastParameterChangeAuthorized ||
    connector18z.runtimePromotionAuthorized ||
    connector18z.activationBlockerCleared
  ) {
    errors.push('Pass 18Z upper-glass local connector boundary drifted');
  }

  const classification18aa = audit.upperGlassDownstreamSccClassificationPass18AA;
  if (
    classification18aa.qaRunNumber !== 1008 ||
    !classification18aa.diagnosticOnly ||
    classification18aa.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(classification18aa.trustedSnapMeters - 0.30) > 1e-12 ||
    Math.abs(classification18aa.trustedControlLinkRadiusMeters - 0.30) > 1e-12 ||
    classification18aa.downstreamSourceComponentCountPerSide !== 58 ||
    classification18aa.trustedRepresentativeCountPerSide !== 15 ||
    classification18aa.baselineReachedDirectedPairs !== 79 ||
    classification18aa.baselineWeakComponentCount !== 9 ||
    classification18aa.baselineStronglyConnectedComponentCount !== 11 ||
    classification18aa.candidateReachedDirectedPairs !== 79 ||
    classification18aa.candidateWeakComponentCount !== 9 ||
    classification18aa.candidateStronglyConnectedComponentCount !== 11 ||
    Math.abs(classification18aa.positiveSourceBoundaryDistanceMeters - 0.5185586972146101) > 1e-12 ||
    Math.abs(classification18aa.negativeSourceBoundaryDistanceMeters - 0.5185586972146126) > 1e-12 ||
    Math.abs(classification18aa.positiveTrustedEndpointDistanceMeters - 4.818701016746154) > 1e-9 ||
    Math.abs(classification18aa.negativeTrustedEndpointDistanceMeters - 3.879513844745101) > 1e-9 ||
    classification18aa.ownGlassConnectedComponentCountPerSide !== 1 ||
    classification18aa.positiveOwnGlassConnectedComponentId !==
      'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7' ||
    classification18aa.negativeOwnGlassConnectedComponentId !==
      'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13' ||
    classification18aa.ownGlassConnectedMaterial !== 'FloorConcrete02' ||
    classification18aa.oppositeGlassConnectedComponentCountPerSide !== 0 ||
    classification18aa.nonGlassConnectedComponentCountPerSide !== 0 ||
    classification18aa.remainingTrustedDisconnectedComponentCountPerSide !== 14 ||
    !classification18aa.onlyNearestFloorComponentJoinsOwnGlassUnderTrustedControl ||
    classification18aa.downstreamSourceClusterBecomesTransitivelyAttached ||
    classification18aa.downstreamRuntimeSccReached ||
    classification18aa.candidateChangedTrackedAnchorConnectivity ||
    !classification18aa.nextBreakLocalizedImmediatelyDownstreamOfNearestFloor ||
    classification18aa.rawRadiusInflationAuthorized ||
    classification18aa.trustedShortcutPromotionAuthorized ||
    classification18aa.twoMeterFrontierLinkAuthorized ||
    classification18aa.globalRecastParameterChangeAuthorized ||
    classification18aa.runtimePromotionAuthorized ||
    classification18aa.activationBlockerCleared
  ) {
    errors.push('Pass 18AA downstream SCC classification boundary drifted');
  }

  const break18ab = audit.upperGlassNearestDownstreamBreakPass18AB;
  if (
    break18ab.qaRunNumber !== 1012 ||
    !break18ab.diagnosticOnly ||
    Math.abs(break18ab.trustedSnapMeters - 0.30) > 1e-12 ||
    break18ab.seedMaterial !== 'FloorConcrete02' ||
    break18ab.positiveSeedComponentId !==
      'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7' ||
    break18ab.negativeSeedComponentId !==
      'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13' ||
    break18ab.comparedComponentCountPerSide !== 57 ||
    break18ab.zeroContactCountPerSide !== 0 ||
    break18ab.componentsWithin003PerSide !== 0 ||
    break18ab.componentsWithin008PerSide !== 0 ||
    break18ab.componentsWithin018PerSide !== 0 ||
    break18ab.componentsWithin030PerSide !== 0 ||
    break18ab.componentsWithin060PerSide !== 3 ||
    break18ab.componentsWithin200PerSide !== 8 ||
    break18ab.positiveNearestBridgeComponentId !==
      'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c61' ||
    break18ab.positiveNearestSlopeComponentId !==
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3' ||
    break18ab.positiveSecondBridgeComponentId !==
      'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c59' ||
    break18ab.negativeNearestBridgeComponentId !==
      'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c86' ||
    break18ab.negativeNearestSlopeComponentId !==
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23' ||
    break18ab.negativeSecondBridgeComponentId !==
      'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c87' ||
    Math.abs(break18ab.positiveNearestBridgeDistanceMeters - 0.5185586972146118) > 1e-12 ||
    Math.abs(break18ab.positiveNearestSlopeDistanceMeters - 0.5185586972146133) > 1e-12 ||
    Math.abs(break18ab.positiveSecondBridgeDistanceMeters - 0.5185586972146149) > 1e-12 ||
    Math.abs(break18ab.negativeNearestBridgeDistanceMeters - 0.5185586972146101) > 1e-12 ||
    Math.abs(break18ab.negativeNearestSlopeDistanceMeters - 0.5185586972146118) > 1e-12 ||
    Math.abs(break18ab.negativeSecondBridgeDistanceMeters - 0.5185586972146141) > 1e-12 ||
    break18ab.nearestCandidateMaterialSet.join(',') !== 'BridgeMetal00,FloorSlope00' ||
    !break18ab.mirroredThreeWayCandidatePattern ||
    Math.abs(break18ab.nearestBridgeTrustedRepresentativeSnapMeters) > 1e-12 ||
    Math.abs(break18ab.positiveNearestBridgeTrustedBoundaryOffsetMeters - 0.3990619059042479) > 1e-9 ||
    Math.abs(break18ab.negativeNearestBridgeTrustedBoundaryOffsetMeters - 0.5704145669360774) > 1e-9 ||
    break18ab.nearestBridgeOwnGlassMutualEitherSide ||
    break18ab.nearestBridgeNonGlassMutualEitherSide ||
    break18ab.trustedCandidateCountPerSide !== 14 ||
    break18ab.trustedDisconnectedCountPerSide !== 14 ||
    break18ab.singleNextBoundaryResolved ||
    !break18ab.firstBreakLocalizedToThreeWaySourceNeighborhood ||
    !break18ab.nextDiagnosticRequiresBranchClassification ||
    break18ab.rawRadiusInflationAuthorized ||
    break18ab.trustedShortcutPromotionAuthorized ||
    break18ab.twoMeterFrontierLinkAuthorized ||
    break18ab.runtimePromotionAuthorized ||
    break18ab.activationBlockerCleared
  ) {
    errors.push('Pass 18AB nearest downstream break boundary drifted');
  }

  const branch18ac = audit.upperGlassBranchReachabilityPass18AC;
  if (
    branch18ac.qaRunNumber !== 1015 ||
    !branch18ac.diagnosticOnly ||
    branch18ac.thresholdMeters.join(',') !== '0.6,0.85,1,1.5,2' ||
    !branch18ac.seedExcludedFromTraversal ||
    branch18ac.candidateCountPerSide !== 3 ||
    !branch18ac.mirroredBranchPattern ||
    branch18ac.bridgeBranchCountPerSide !== 2 ||
    branch18ac.slopeBranchCountPerSide !== 1 ||
    branch18ac.bridgeBranchComponentCountAt060 !== 3 ||
    branch18ac.bridgeBranchComponentCountAt200 !== 3 ||
    Math.abs(branch18ac.bridgeBranchYMinAt200 - 6) > 1e-12 ||
    Math.abs(branch18ac.bridgeBranchYMaxAt200 - 6.025) > 1e-12 ||
    branch18ac.bridgeBranchReachesYAtOrBelow3 ||
    branch18ac.bridgeBranchReachesYAtOrBelow15 ||
    branch18ac.slopeBranchComponentCountAt060 !== 2 ||
    branch18ac.slopeBranchComponentCountAt085 !== 2 ||
    branch18ac.slopeBranchComponentCountAt100 !== 2 ||
    branch18ac.slopeBranchComponentCountAt150 !== 6 ||
    branch18ac.slopeBranchComponentCountAt200 !== 14 ||
    Math.abs(branch18ac.slopeBranchYMinAt060 - 3) > 1e-12 ||
    Math.abs(branch18ac.slopeBranchYMaxAt060 - 6) > 1e-12 ||
    Math.abs(branch18ac.slopeBranchYMinAt200 - 0) > 1e-12 ||
    Math.abs(branch18ac.slopeBranchYMaxAt200 - 6) > 1e-12 ||
    !branch18ac.slopeBranchReachesYAtOrBelow3At060 ||
    !branch18ac.slopeBranchReachesYAtOrBelow15At200 ||
    branch18ac.slopeBranchFloorSlopeCountAt200 !== 3 ||
    branch18ac.slopeBranchFloorConcreteCountAt200 !== 5 ||
    branch18ac.slopeBranchBridgeMetalCountAt200 !== 3 ||
    branch18ac.positiveSlopeComponentId !==
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3' ||
    branch18ac.positiveImmediateFloorConcreteComponentId !==
      'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c2' ||
    branch18ac.negativeSlopeComponentId !==
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23' ||
    branch18ac.negativeImmediateFloorConcreteComponentId !==
      'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c9' ||
    !branch18ac.floorSlopeBranchIsOnlyDescendingRouteCandidate ||
    !branch18ac.bridgeBranchesRemainHighLocalMetalCluster ||
    !branch18ac.sourceRouteBranchResolved ||
    branch18ac.exactFloorToSlopeTraversalSemanticsResolved ||
    branch18ac.floorToSlopeKccFeasibilityMeasured ||
    branch18ac.floorToSlopeNavigationConnectorAuthorized ||
    branch18ac.rawRadiusInflationAuthorized ||
    branch18ac.trustedShortcutPromotionAuthorized ||
    branch18ac.twoMeterFrontierLinkAuthorized ||
    branch18ac.runtimePromotionAuthorized ||
    branch18ac.activationBlockerCleared
  ) {
    errors.push('Pass 18AC branch reachability boundary drifted');
  }

  const kcc18ad = audit.upperGlassFloorSlopeKccPass18AD;
  if (
    kcc18ad.qaRunNumber !== 1019 ||
    !kcc18ad.diagnosticOnly ||
    kcc18ad.characterMode !== 'HUMAN' ||
    Math.abs(kcc18ad.insetMeters - 0.40) > 1e-12 ||
    Math.abs(kcc18ad.humanRadiusMeters - 0.32) > 1e-12 ||
    Math.abs(kcc18ad.controllerOffsetMeters - 0.025) > 1e-12 ||
    Math.abs(kcc18ad.autostepMaxHeightMeters - 0.34) > 1e-12 ||
    Math.abs(kcc18ad.snapToGroundMeters - 0.24) > 1e-12 ||
    Math.abs(kcc18ad.positiveBoundaryDistanceMeters - 0.5185586972146133) > 1e-12 ||
    Math.abs(kcc18ad.negativeBoundaryDistanceMeters - 0.5185586972146118) > 1e-12 ||
    Math.abs(kcc18ad.positiveBoundaryVerticalDeltaMeters) > 1e-12 ||
    Math.abs(kcc18ad.negativeBoundaryVerticalDeltaMeters) > 1e-12 ||
    kcc18ad.directedProbeCount !== 4 ||
    kcc18ad.successfulDirectedProbeCount !== 4 ||
    kcc18ad.airborneTickCountTotal !== 0 ||
    !kcc18ad.allInitiallySettled ||
    !kcc18ad.allFinallyGrounded ||
    kcc18ad.positiveFloorToSlopeGroundedTicks !== 8 ||
    kcc18ad.positiveSlopeToFloorGroundedTicks !== 8 ||
    kcc18ad.negativeFloorToSlopeGroundedTicks !== 9 ||
    kcc18ad.negativeSlopeToFloorGroundedTicks !== 9 ||
    Math.abs(kcc18ad.maximumFinalHorizontalErrorMeters - 0.15477108986760482) > 1e-9 ||
    Math.abs(kcc18ad.maximumFinalVerticalErrorMeters - 0.06845153690349992) > 1e-9 ||
    Math.abs(kcc18ad.maximumDropBelowStartMeters - 0.0782347869873048) > 1e-9 ||
    Math.abs(kcc18ad.maximumRiseAboveStartMeters - 0.07553304553997453) > 1e-9 ||
    !kcc18ad.mirroredBidirectionalGroundedTraversalFeasible ||
    !kcc18ad.productionKccPhysicalFeasibilityResolved ||
    !kcc18ad.noJumpRequiredForTestedBoundary ||
    !kcc18ad.sourceRouteBranchPhysicallyTraversable ||
    !kcc18ad.recastRepresentationStillUnresolved ||
    kcc18ad.navigationConnectorAuthorized ||
    kcc18ad.runtimePromotionAuthorized ||
    kcc18ad.activationBlockerCleared
  ) {
    errors.push('Pass 18AD floor-slope KCC boundary drifted');
  }

  const recast18ae = audit.upperGlassFloorSlopeRecastPass18AE;
  if (
    recast18ae.qaRunNumber !== 1023 ||
    !recast18ae.diagnosticOnly ||
    Math.abs(recast18ae.trustedSnapMeters - 0.30) > 1e-12 ||
    recast18ae.rawRadiiMeters.join(',') !== '0.3,0.45,0.6,0.85,1,1.5' ||
    recast18ae.baselineReachedDirectedPairs !== 79 ||
    recast18ae.baselineWeakComponentCount !== 9 ||
    recast18ae.baselineStronglyConnectedComponentCount !== 11 ||
    recast18ae.bridgeFloorControlReachedDirectedPairs !== 79 ||
    recast18ae.bridgeFloorControlWeakComponentCount !== 9 ||
    recast18ae.bridgeFloorControlStronglyConnectedComponentCount !== 11 ||
    Math.abs(recast18ae.positiveFloorSlopeBoundaryDistanceMeters - 0.5185586972146133) > 1e-12 ||
    Math.abs(recast18ae.negativeFloorSlopeBoundaryDistanceMeters - 0.5185586972146118) > 1e-12 ||
    Math.abs(recast18ae.positiveFloorTrustedBoundaryOffsetMeters - 1.8894579836149745) > 1e-9 ||
    Math.abs(recast18ae.positiveSlopeTrustedBoundaryOffsetMeters - 3.570277448680558) > 1e-9 ||
    Math.abs(recast18ae.negativeFloorTrustedBoundaryOffsetMeters - 1.915335904945901) > 1e-9 ||
    Math.abs(recast18ae.negativeSlopeTrustedBoundaryOffsetMeters - 1.2887098420520973) > 1e-9 ||
    Math.abs(recast18ae.positiveTrustedEndpointDistanceMeters - 2.398063193642438) > 1e-9 ||
    Math.abs(recast18ae.negativeTrustedEndpointDistanceMeters - 3.139786329805321) > 1e-9 ||
    recast18ae.at030PositiveSlopeOwnGlass ||
    recast18ae.at030NegativeSlopeOwnGlass ||
    recast18ae.at045PositiveSlopeOwnGlass ||
    recast18ae.at045NegativeSlopeOwnGlass ||
    recast18ae.at060PositiveSlopeOwnGlass ||
    !recast18ae.at060NegativeSlopeOwnGlass ||
    !recast18ae.at085PositiveSlopeOwnGlass ||
    !recast18ae.at085NegativeSlopeOwnGlass ||
    !recast18ae.at100PositiveSlopeOwnGlass ||
    !recast18ae.at100NegativeSlopeOwnGlass ||
    !recast18ae.at150PositiveSlopeOwnGlass ||
    !recast18ae.at150NegativeSlopeOwnGlass ||
    !recast18ae.trustedControlPositiveSlopeOwnGlass ||
    !recast18ae.trustedControlNegativeSlopeOwnGlass ||
    recast18ae.anyVariantSlopeReachesNonGlassRuntimeAnchor ||
    !recast18ae.allVariantsTrackedAnchorMatrixUnchanged ||
    Math.abs(recast18ae.firstCoarseCommonRawRadiusMeters - 0.85) > 1e-12 ||
    !recast18ae.negativeRawAttachmentResolvedAt060 ||
    recast18ae.positiveRawAttachmentResolvedAt060 ||
    !recast18ae.positiveRawAttachmentResolvedAt085 ||
    !recast18ae.mirroredCoarseThresholdAsymmetry ||
    recast18ae.commonMinimumRawRadiusResolved ||
    !recast18ae.fineSweepRequiredBetween060And085 ||
    !recast18ae.rawPhysicalBoundaryCandidateRemainsLocal ||
    !recast18ae.bridgeFloorTrustedControlRemainsNonlocalDiagnosticOnly ||
    !recast18ae.trustedFloorSlopeControlIsNonlocal ||
    recast18ae.rawRadiusInflationAuthorized ||
    recast18ae.runtimePromotionAuthorized ||
    recast18ae.activationBlockerCleared
  ) {
    errors.push('Pass 18AE floor-slope Recast boundary drifted');
  }

  const fine18af = audit.upperGlassFloorSlopeFineRadiusPass18AF;
  if (
    fine18af.qaRunNumber !== 1027 ||
    !fine18af.diagnosticOnly ||
    Math.abs(fine18af.trustedSnapMeters - 0.30) > 1e-12 ||
    fine18af.sampledRawRadiiMeters.join(',') !==
      '0.6,0.625,0.65,0.675,0.7,0.725,0.75,0.775,0.8,0.825,0.85' ||
    fine18af.baselineReachedDirectedPairs !== 79 ||
    fine18af.baselineWeakComponentCount !== 9 ||
    fine18af.baselineStronglyConnectedComponentCount !== 11 ||
    fine18af.bridgeFloorControlReachedDirectedPairs !== 79 ||
    fine18af.bridgeFloorControlWeakComponentCount !== 9 ||
    fine18af.bridgeFloorControlStronglyConnectedComponentCount !== 11 ||
    Math.abs(fine18af.negativeFirstSampledSuccessRadiusMeters - 0.60) > 1e-12 ||
    Math.abs(fine18af.positiveLastSampledFailureRadiusMeters - 0.775) > 1e-12 ||
    Math.abs(fine18af.positiveFirstSampledSuccessRadiusMeters - 0.80) > 1e-12 ||
    Math.abs(fine18af.firstSampledCommonSuccessRadiusMeters - 0.80) > 1e-12 ||
    Math.abs(fine18af.commonThresholdLowerExclusiveMeters - 0.775) > 1e-12 ||
    Math.abs(fine18af.commonThresholdUpperInclusiveMeters - 0.80) > 1e-12 ||
    fine18af.at060PositiveSlopeOwnGlass ||
    !fine18af.at060NegativeSlopeOwnGlass ||
    fine18af.at0625PositiveSlopeOwnGlass ||
    !fine18af.at0625NegativeSlopeOwnGlass ||
    fine18af.at065PositiveSlopeOwnGlass ||
    !fine18af.at065NegativeSlopeOwnGlass ||
    fine18af.at0675PositiveSlopeOwnGlass ||
    !fine18af.at0675NegativeSlopeOwnGlass ||
    fine18af.at070PositiveSlopeOwnGlass ||
    !fine18af.at070NegativeSlopeOwnGlass ||
    fine18af.at0725PositiveSlopeOwnGlass ||
    !fine18af.at0725NegativeSlopeOwnGlass ||
    fine18af.at075PositiveSlopeOwnGlass ||
    !fine18af.at075NegativeSlopeOwnGlass ||
    fine18af.at0775PositiveSlopeOwnGlass ||
    !fine18af.at0775NegativeSlopeOwnGlass ||
    !fine18af.at080PositiveSlopeOwnGlass ||
    !fine18af.at080NegativeSlopeOwnGlass ||
    !fine18af.at0825PositiveSlopeOwnGlass ||
    !fine18af.at0825NegativeSlopeOwnGlass ||
    !fine18af.at085PositiveSlopeOwnGlass ||
    !fine18af.at085NegativeSlopeOwnGlass ||
    fine18af.anyVariantSlopeReachesNonGlassRuntimeAnchor ||
    !fine18af.allVariantsTrackedAnchorMatrixUnchanged ||
    !fine18af.mirroredAttachmentThresholdAsymmetryPersists ||
    fine18af.exactCommonThresholdResolved ||
    !fine18af.firstSampledCommonRadiusResolved ||
    !fine18af.rawPhysicalBoundaryCandidateRemainsLocal ||
    !fine18af.bridgeFloorTrustedControlRemainsNonlocalDiagnosticOnly ||
    fine18af.globalRadiusChangeAuthorized ||
    fine18af.rawRadiusInflationAuthorized ||
    fine18af.runtimePromotionAuthorized ||
    fine18af.activationBlockerCleared
  ) {
    errors.push('Pass 18AF floor-slope fine-radius boundary drifted');
  }

  const isolate18ag = audit.upperGlassBridgeFloorEndpointIsolationPass18AG;
  if (
    isolate18ag.qaRunNumber !== 1031 ||
    !isolate18ag.diagnosticOnly ||
    isolate18ag.sourceFixtureVersion !== 'PASS18C_SOURCE_NATIVE_V1' ||
    Math.abs(isolate18ag.rawRadiusMeters - 1.50) > 1e-12 ||
    Math.abs(isolate18ag.trustedRadiusMeters - 0.30) > 1e-12 ||
    Math.abs(isolate18ag.trustedSnapMeters - 0.30) > 1e-12 ||
    isolate18ag.baselineReachedDirectedPairs !== 79 ||
    isolate18ag.baselineWeakComponentCount !== 9 ||
    isolate18ag.baselineStronglyConnectedComponentCount !== 11 ||
    Math.abs(isolate18ag.positiveSourceBoundaryDistanceMeters - 0.5185586972146101) > 1e-12 ||
    Math.abs(isolate18ag.negativeSourceBoundaryDistanceMeters - 0.5185586972146126) > 1e-12 ||
    Math.abs(isolate18ag.positiveBridgeTrustedBoundaryOffsetMeters - 3.216527889612188) > 1e-9 ||
    Math.abs(isolate18ag.positiveFloorTrustedBoundaryOffsetMeters - 1.8492402471551055) > 1e-9 ||
    Math.abs(isolate18ag.negativeBridgeTrustedBoundaryOffsetMeters - 3.2163496542765126) > 1e-9 ||
    Math.abs(isolate18ag.negativeFloorTrustedBoundaryOffsetMeters - 2.3003785443214677) > 1e-9 ||
    Math.abs(isolate18ag.positiveTrustedEndpointDistanceMeters - 4.818701016746154) > 1e-9 ||
    Math.abs(isolate18ag.negativeTrustedEndpointDistanceMeters - 3.879513844745101) > 1e-9 ||
    isolate18ag.positiveRawRawConnected ||
    !isolate18ag.positiveRawBridgeTrustedFloorConnected ||
    isolate18ag.positiveTrustedBridgeRawFloorConnected ||
    !isolate18ag.positiveTrustedTrustedConnected ||
    isolate18ag.negativeRawRawConnected ||
    !isolate18ag.negativeRawBridgeTrustedFloorConnected ||
    isolate18ag.negativeTrustedBridgeRawFloorConnected ||
    !isolate18ag.negativeTrustedTrustedConnected ||
    !isolate18ag.rawBridgeEndpointAttachesOnBothSides ||
    isolate18ag.rawFloorEndpointAttachesOnEitherSide ||
    !isolate18ag.floorEndpointIsCommonAttachmentBlocker ||
    !isolate18ag.bridgeEndpointIsNotAttachmentBlocker ||
    !isolate18ag.hybridResultsMirrored ||
    !isolate18ag.allVariantsTrackedAnchorMatrixUnchanged ||
    isolate18ag.anyVariantReachesNonGlassRuntimeAnchor ||
    !isolate18ag.floorEndpointLocalRetreatRequiredNext ||
    !isolate18ag.trustedFloorEndpointTooNonlocalForPromotion ||
    isolate18ag.rawRadiusInflationAuthorized ||
    isolate18ag.trustedShortcutPromotionAuthorized ||
    isolate18ag.runtimePromotionAuthorized ||
    isolate18ag.activationBlockerCleared
  ) {
    errors.push('Pass 18AG bridge-floor endpoint isolation boundary drifted');
  }

  const search18ah = audit.upperGlassFloorEndpointLocalSearchPass18AH;
  if (
    search18ah.qaRunNumber !== 1035 ||
    !search18ah.diagnosticOnly ||
    Math.abs(search18ah.rawRadiusMeters - 1.50) > 1e-12 ||
    Math.abs(search18ah.trustedSnapMeters - 0.30) > 1e-12 ||
    search18ah.sourceSampleCountPerSide !== 10 ||
    search18ah.selectedSampleCountPerSide !== 6 ||
    search18ah.baselineReachedDirectedPairs !== 79 ||
    search18ah.baselineWeakComponentCount !== 9 ||
    search18ah.baselineStronglyConnectedComponentCount !== 11 ||
    Math.abs(search18ah.positiveTrustedFloorBoundaryOffsetMeters - 1.8492402471551055) > 1e-9 ||
    Math.abs(search18ah.negativeTrustedFloorBoundaryOffsetMeters - 2.3003785443214677) > 1e-9 ||
    Math.abs(search18ah.positiveRawBoundaryProjectedSnapMeters - 1.073626967562852) > 1e-9 ||
    Math.abs(search18ah.negativeRawBoundaryProjectedSnapMeters - 0.9065172851425543) > 1e-9 ||
    Math.abs(search18ah.positiveFirstSuccessRetreatMeters - 0.6547373284927769) > 1e-12 ||
    Math.abs(search18ah.negativeFirstSuccessRetreatMeters - 0.654737328492778) > 1e-12 ||
    Math.abs(search18ah.commonFirstSampledSuccessRetreatMeters - 0.654737328492778) > 1e-12 ||
    Math.abs(search18ah.positiveFirstSuccessProjectedSnapMeters - 0.511221159040814) > 1e-9 ||
    Math.abs(search18ah.negativeFirstSuccessProjectedSnapMeters - 0.5004886229274855) > 1e-9 ||
    search18ah.positiveFirstSuccessSourcePoint.join(',') !==
      '-10.67826430970341,6,12.118397071136153' ||
    search18ah.negativeFirstSuccessSourcePoint.join(',') !==
      '10.907632598231574,6,-11.92383277567933' ||
    Math.abs(search18ah.positiveLastFailureRetreatMeters) > 1e-12 ||
    Math.abs(search18ah.negativeLastFailureRetreatMeters) > 1e-12 ||
    !search18ah.allSelectedCandidatesTrackedAnchorMatrixUnchanged ||
    !search18ah.allSuccessfulCandidatesReachNoNonGlassRuntimeAnchor ||
    !search18ah.firstSampledLocalRetreatMirrored ||
    !search18ah.sourceMeshSampleSearchFindsLocalAlternativeToTrustedShortcut ||
    search18ah.exactContinuousRetreatThresholdResolved ||
    !search18ah.continuousSurfaceSweepRequiredBetweenBoundaryAndFirstSuccess ||
    search18ah.rawRadiusInflationAuthorized ||
    search18ah.trustedShortcutPromotionAuthorized ||
    search18ah.runtimePromotionAuthorized ||
    search18ah.activationBlockerCleared
  ) {
    errors.push('Pass 18AH floor endpoint local-search boundary drifted');
  }

  const interp18ai = audit.upperGlassFloorEndpointInterpolationPass18AI;
  if (
    interp18ai.qaRunNumber !== 1039 ||
    !interp18ai.diagnosticOnly ||
    Math.abs(interp18ai.rawRadiusMeters - 1.50) > 1e-12 ||
    interp18ai.interpolationRetreatsMeters.join(',') !==
      '0,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.654737328492778' ||
    interp18ai.baselineReachedDirectedPairs !== 79 ||
    interp18ai.baselineWeakComponentCount !== 9 ||
    interp18ai.baselineStronglyConnectedComponentCount !== 11 ||
    Math.abs(interp18ai.positiveLastFailureRetreatMeters) > 1e-12 ||
    Math.abs(interp18ai.positiveFirstSuccessRetreatMeters - 0.05) > 1e-12 ||
    Math.abs(interp18ai.negativeLastFailureRetreatMeters - 0.10) > 1e-12 ||
    Math.abs(interp18ai.negativeFirstSuccessRetreatMeters - 0.15) > 1e-12 ||
    Math.abs(interp18ai.firstSampledCommonSuccessRetreatMeters - 0.15) > 1e-12 ||
    Math.abs(interp18ai.commonThresholdLowerExclusiveMeters - 0.10) > 1e-12 ||
    Math.abs(interp18ai.commonThresholdUpperInclusiveMeters - 0.15) > 1e-12 ||
    Math.abs(interp18ai.positiveProjectedSnapAtCommonMeters - 0.9804257137187009) > 1e-9 ||
    Math.abs(interp18ai.negativeProjectedSnapAtCommonMeters - 0.9694454031811923) > 1e-9 ||
    !interp18ai.allInterpolatedPointsSourceSurfaceValid ||
    interp18ai.commonCandidateReachedDirectedPairs !== 79 ||
    interp18ai.commonCandidateWeakComponentCount !== 9 ||
    interp18ai.commonCandidateStronglyConnectedComponentCount !== 11 ||
    interp18ai.commonCandidateReachesNonGlassRuntimeAnchor ||
    !interp18ai.positiveThresholdAlreadyBelowCommonWindow ||
    !interp18ai.negativeThresholdControlsCommonWindow ||
    !interp18ai.mirroredAttachmentThresholdAsymmetryPersists ||
    interp18ai.exactCommonRetreatThresholdResolved ||
    !interp18ai.fineSweepRequiredBetween010And015 ||
    !interp18ai.rawRadiusStillDiagnosticLarge ||
    !interp18ai.radiusMinimizationDeferredUntilRetreatThresholdResolved ||
    interp18ai.runtimePromotionAuthorized ||
    interp18ai.activationBlockerCleared
  ) {
    errors.push('Pass 18AI floor endpoint interpolation boundary drifted');
  }

  const retreat18aj = audit.upperGlassFloorEndpointFineRetreatPass18AJ;
  if (
    retreat18aj.qaRunNumber !== 1044 ||
    !retreat18aj.diagnosticOnly ||
    Math.abs(retreat18aj.rawRadiusMeters - 1.50) > 1e-12 ||
    retreat18aj.sampledRetreatsMeters.join(',') !==
      '0.1,0.105,0.11,0.115,0.12,0.125,0.13,0.135,0.14,0.145,0.15' ||
    retreat18aj.baselineReachedDirectedPairs !== 79 ||
    retreat18aj.baselineWeakComponentCount !== 9 ||
    retreat18aj.baselineStronglyConnectedComponentCount !== 11 ||
    !retreat18aj.positiveAllFineSamplesConnected ||
    Math.abs(retreat18aj.negativeLastFailureRetreatMeters - 0.125) > 1e-12 ||
    Math.abs(retreat18aj.negativeFirstSuccessRetreatMeters - 0.130) > 1e-12 ||
    Math.abs(retreat18aj.firstSampledCommonSuccessRetreatMeters - 0.130) > 1e-12 ||
    Math.abs(retreat18aj.commonThresholdLowerExclusiveMeters - 0.125) > 1e-12 ||
    Math.abs(retreat18aj.commonThresholdUpperInclusiveMeters - 0.130) > 1e-12 ||
    Math.abs(retreat18aj.positiveProjectedSnapAtCommonMeters - 0.9997309981886592) > 1e-9 ||
    Math.abs(retreat18aj.negativeProjectedSnapAtCommonMeters - 0.9887536400664477) > 1e-9 ||
    !retreat18aj.allFinePointsSourceSurfaceValid ||
    retreat18aj.commonCandidateReachedDirectedPairs !== 79 ||
    retreat18aj.commonCandidateWeakComponentCount !== 9 ||
    retreat18aj.commonCandidateStronglyConnectedComponentCount !== 11 ||
    retreat18aj.commonCandidateReachesNonGlassRuntimeAnchor ||
    !retreat18aj.sampledCommonRetreatResolvedAt5mmGranularity ||
    retreat18aj.exactSub5mmThresholdResolved ||
    Math.abs(retreat18aj.qaCandidateRetreatMeters - 0.130) > 1e-12 ||
    !retreat18aj.rawRadiusStillDiagnosticLarge ||
    !retreat18aj.radiusMinimizationRequiredNext ||
    retreat18aj.runtimePromotionAuthorized ||
    retreat18aj.activationBlockerCleared
  ) {
    errors.push('Pass 18AJ floor endpoint fine-retreat boundary drifted');
  }

  const radius18ak = audit.upperGlassBridgeFloorRadiusMinimizationPass18AK;
  if (
    radius18ak.qaRunNumber !== 1049 ||
    !radius18ak.diagnosticOnly ||
    Math.abs(radius18ak.fixedRetreatMeters - 0.130) > 1e-12 ||
    radius18ak.bridgeEndpointMode !== 'EXACT_RAW_PHYSICAL_ENDPOINT' ||
    radius18ak.floorEndpointMode !== 'PASS18AJ_SOURCE_SURFACE_RETREAT_FIXED' ||
    !radius18ak.bidirectional ||
    radius18ak.globalRecastSettingsChanged ||
    radius18ak.coarseRadiiMeters.join(',') !==
      '0.01,0.025,0.05,0.1,0.2,0.3,0.45,0.6,0.8,1,1.25,1.5' ||
    Math.abs(radius18ak.coarseLastCommonFailureRadiusMeters - 0.80) > 1e-12 ||
    Math.abs(radius18ak.coarseFirstCommonSuccessRadiusMeters - 1.00) > 1e-12 ||
    Math.abs(radius18ak.fineLastCommonFailureRadiusMeters - 0.98) > 1e-12 ||
    Math.abs(radius18ak.fineFirstCommonSuccessRadiusMeters - 1.00) > 1e-12 ||
    Math.abs(radius18ak.terminalFineStepMeters - 0.001) > 1e-12 ||
    Math.abs(radius18ak.terminalLastCommonFailureRadiusMeters - 0.994) > 1e-12 ||
    Math.abs(radius18ak.firstSampledCommonSuccessRadiusMeters - 0.995) > 1e-12 ||
    Math.abs(radius18ak.commonThresholdLowerExclusiveMeters - 0.994) > 1e-12 ||
    Math.abs(radius18ak.commonThresholdUpperInclusiveMeters - 0.995) > 1e-12 ||
    Math.abs(radius18ak.positiveFixedEndpointSurfaceDistanceMeters) > 1e-12 ||
    Math.abs(radius18ak.negativeFixedEndpointSurfaceDistanceMeters) > 1e-12 ||
    Math.abs(radius18ak.positiveFixedEndpointProjectedSnapMeters - 0.9997309981886592) > 1e-9 ||
    Math.abs(radius18ak.negativeFixedEndpointProjectedSnapMeters - 0.9887536400664477) > 1e-9 ||
    radius18ak.candidateReachedDirectedPairs !== 79 ||
    radius18ak.candidateWeakComponentCount !== 9 ||
    radius18ak.candidateStronglyConnectedComponentCount !== 11 ||
    !radius18ak.bothSidesOwnGlassBidirectional ||
    radius18ak.candidateReachesNonGlassRuntimeAnchor ||
    !radius18ak.sampledCommonRadiusResolvedAt1mmGranularity ||
    radius18ak.exactSub1mmThresholdResolved ||
    Math.abs(radius18ak.qaCandidateRadiusMeters - 0.995) > 1e-12 ||
    radius18ak.endpointRetreatChangedDuringSweep ||
    !radius18ak.combinedUpstreamDownstreamAuditRequiredNext ||
    radius18ak.runtimePromotionAuthorized ||
    radius18ak.activationBlockerCleared
  ) {
    errors.push('Pass 18AK bridge-floor fixed-retreat radius boundary drifted');
  }

  const combined18al = audit.upperGlassCombinedSourceChainPass18AL;
  if (
    combined18al.qaRunNumber !== 1060 ||
    !combined18al.diagnosticOnly ||
    combined18al.upstreamSourcePass !== '18AK' ||
    Math.abs(combined18al.upstreamRetreatMeters - 0.130) > 1e-12 ||
    Math.abs(combined18al.upstreamRadiusMeters - 0.995) > 1e-12 ||
    combined18al.downstreamSourcePass !== '18AF' ||
    Math.abs(combined18al.downstreamRadiusMeters - 0.80) > 1e-12 ||
    combined18al.trustedNonLocalShortcutsUsed ||
    combined18al.globalRecastSettingsChanged ||
    combined18al.combinedReachedDirectedPairs !== 79 ||
    combined18al.combinedWeakComponentCount !== 9 ||
    combined18al.combinedStronglyConnectedComponentCount !== 11 ||
    combined18al.combinedAddedTrackedPairs !== 0 ||
    combined18al.combinedRemovedTrackedPairs !== 0 ||
    !combined18al.bothSidesFloorSlopeConnectedToOwnGlass ||
    combined18al.combinedReachesNonGlassRuntimeAnchor ||
    Math.abs(combined18al.positiveRouteContinuingNextBoundaryDistanceMeters - 0.5185586972146173) > 1e-9 ||
    Math.abs(combined18al.negativeRouteContinuingNextBoundaryDistanceMeters - 0.5185586972146101) > 1e-9 ||
    combined18al.runtimePromotionAuthorized ||
    combined18al.activationBlockerCleared
  ) {
    errors.push('Pass 18AL combined upper-glass source-chain boundary drifted');
  }

  const kcc18am = audit.upperGlassSlopeFloor00KccPass18AM;
  if (
    kcc18am.qaRunNumber !== 1060 ||
    !kcc18am.diagnosticOnly ||
    kcc18am.boundaryClass !== 'FloorSlope00->FloorConcrete00' ||
    Math.abs(kcc18am.effectiveHumanContactRadiusMeters - 0.345) > 1e-12 ||
    kcc18am.directedTraversalCount !== 4 ||
    kcc18am.successfulDirectedTraversalCount !== 4 ||
    kcc18am.totalAirborneTicks !== 0 ||
    !kcc18am.allSettledInitially ||
    !kcc18am.ordinaryWalkBidirectionalOnBothSides ||
    kcc18am.runtimePromotionAuthorized ||
    kcc18am.activationBlockerCleared
  ) {
    errors.push('Pass 18AM slope-floor00 production-KCC boundary drifted');
  }

  const radius18an = audit.upperGlassSlopeFloor00RadiusPass18AN;
  if (
    radius18an.qaRunNumber !== 1060 ||
    !radius18an.diagnosticOnly ||
    radius18an.humanKccSourcePass !== '18AM' ||
    !radius18an.humanKccBidirectionalSuccess ||
    radius18an.upstreamSourcePass !== '18AK' ||
    Math.abs(radius18an.upstreamRetreatMeters - 0.130) > 1e-12 ||
    Math.abs(radius18an.upstreamRadiusMeters - 0.995) > 1e-12 ||
    radius18an.floorSlopeSourcePass !== '18AF' ||
    Math.abs(radius18an.floorSlopeRadiusMeters - 0.80) > 1e-12 ||
    radius18an.endpointMode !== 'EXACT_RAW_PHYSICAL_PAIR' ||
    !radius18an.bidirectional ||
    Math.abs(radius18an.coarseLastCommonFailureRadiusMeters - 0.60) > 1e-12 ||
    Math.abs(radius18an.coarseFirstCommonSuccessRadiusMeters - 0.70) > 1e-12 ||
    Math.abs(radius18an.fineLastCommonFailureRadiusMeters - 0.66) > 1e-12 ||
    Math.abs(radius18an.fineFirstCommonSuccessRadiusMeters - 0.67) > 1e-12 ||
    Math.abs(radius18an.terminalFineStepMeters - 0.001) > 1e-12 ||
    Math.abs(radius18an.terminalLastCommonFailureRadiusMeters - 0.668) > 1e-12 ||
    Math.abs(radius18an.firstSampledCommonSuccessRadiusMeters - 0.669) > 1e-12 ||
    radius18an.candidateReachedDirectedPairs !== 79 ||
    radius18an.candidateWeakComponentCount !== 9 ||
    radius18an.candidateStronglyConnectedComponentCount !== 11 ||
    !radius18an.bothSidesFloor00BidirectionalToOwnGlass ||
    radius18an.candidateReachesNonGlassRuntimeAnchor ||
    !radius18an.sampledCommonRadiusResolvedAt1mmGranularity ||
    radius18an.exactSub1mmThresholdResolved ||
    Math.abs(radius18an.qaCandidateRadiusMeters - 0.669) > 1e-12 ||
    radius18an.globalRecastSettingsChanged ||
    radius18an.runtimePromotionAuthorized ||
    radius18an.activationBlockerCleared ||
    !radius18an.nextSourceAdjacentBreakLocalizationRequired
  ) {
    errors.push('Pass 18AN slope-floor00 radius boundary drifted');
  }

  if (audit.missingRequirements.length !== 5) {
    errors.push('Pass 18AN full-stage connectivity evidence gap is not fully localized');
  }
  return errors;
}
