import { Vec3 } from 'playcanvas';
import type { StageDefinition, StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  undertowFirstDropNavigationLinks,
  undertowRightSmallDropNavigationLinks
} from './UndertowSpillwayDropNavigation';
import { UNDERTOW_RIGHT_LOW_ROUTE_RAMPS } from './UndertowSpillwayRouteRampGeometry';
import { undertowTemple01ModelXZToProjectXZ } from './UndertowSpillwayModelXZGeometry';
import { UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER } from './UndertowSpillwayMeasurementLedger';

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


export const UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT = Object.freeze({
  qaStageScope: 'PARTIAL_GEOMETRY_ONLY' as const,
  resolutionPass: '18A' as const,
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
  missingRequirements: [
    'Authoritative runtime binding for the right-low-to-underpass transition on both mirrored sides, or authoritative traversal semantics that justify a specific link type.',
    'Authoritative traversal semantics for the two already-measured +1.5m center-small-step strips. The STEP geometry/delta is known, but directionality and jump requirement are not recorded, so no CPU off-mesh link may be guessed.',
    'Pass 15D binds the three directly verified broad upper-glass components into the inert navmesh. Final closure still requires an explicit thin-edge/frame navigation disposition plus the final production-candidate Recast pass; no unverified edge region may be convenience-filled.',
    'A final production-candidate Recast pass after all traversable Undertow geometry is bound, with spawn-to-major-region, unpaintable traversable-region, and mirrored cross-route probes run against that exact candidate.'
  ] as const,
  notes:
    'Pass 18A expands the previous focused eight-probe QA with a 17x17 directed paint-anchor matrix. The six previously required transitions still pass, and the mirrored right-low-to-underpass route remains unresolved. The matrix also reveals that the +1.5m center-origin step-top is completely isolated in the current navmesh even though its two canonical STEP strips are already measured. Because archived evidence does not resolve the movement semantics needed to encode those steps for CPU navigation, no convenience link is added. FULL_STAGE_CONNECTIVITY_QA_PENDING remains activation-blocking.'
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
    errors.push('Pass 18A partial QA must not claim full-stage connectivity readiness');
  }

  const matrix = audit.paintAnchorMatrixPass18A;
  if (
    audit.resolutionPass !== '18A' ||
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
    errors.push('Pass 18A must retain both mirrored underpass and center-step gaps');
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

  if (audit.missingRequirements.length !== 4) {
    errors.push('Pass 18A full-stage connectivity evidence gap is not fully localized');
  }
  return errors;
}
