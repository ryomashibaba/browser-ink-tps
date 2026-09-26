import { UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';

export type UndertowGuideLineId =
  | 'TEAM_A_FIRST_DROP_RED'
  | 'TEAM_A_RIGHT_SMALL_DROP_BLUE';

export interface UndertowGuideLineSideObservation {
  lowerGuideSideLineId: UndertowGuideLineId;
  higherGuideSideLineId: UndertowGuideLineId;
  confidence: 'CONFIRMED';
  evidenceIds: readonly string[];
  semanticFloorBinding: 'UNRESOLVED';
  exactDeltaMeters?: never;
  safeToCreateVerticalRelation: false;
  notes: string;
}


export type UndertowSideRegistrationFindingId =
  | 'FIRST_DROP_VIDEO'
  | 'RIGHT_LOW_CAPTURE'
  | 'CORRECTIVE_STILLS'
  | 'POST_7_2_LAYOUT_CROSSCHECK';

export interface UndertowSideRegistrationFinding {
  id: UndertowSideRegistrationFindingId;
  evidenceIds: readonly string[];
  result:
    | 'NO_SHARED_SIDE_REGISTRATION'
    | 'LOCAL_TOPOLOGY_ONLY'
    | 'GUIDE_SIDE_ORDER_ONLY'
    | 'SEMANTIC_CROSSCHECK_ONLY';
  canBindCanonicalFloorSides: false;
  notes: string;
}

export const UNDERTOW_SIDE_REGISTRATION_FINDINGS:
  readonly UndertowSideRegistrationFinding[] = [
    {
      id: 'FIRST_DROP_VIDEO',
      evidenceIds: ['user-first-drop-video'],
      result: 'NO_SHARED_SIDE_REGISTRATION',
      canBindCanonicalFloorSides: false,
      notes:
        'The first-drop video confirms a one-way descent into a recessed area, then shows additional walls, ramps and floor transitions. It never supplies one calibrated view that simultaneously identifies both red- and blue-guide sides.'
    },
    {
      id: 'RIGHT_LOW_CAPTURE',
      evidenceIds: ['user-right-low-capture-2026-09-25'],
      result: 'LOCAL_TOPOLOGY_ONLY',
      canBindCanonicalFloorSides: false,
      notes:
        'The targeted right-low capture confirms the local 1.5m small-drop topology, open floor, ramp exit and underpass connection, but it does not independently register the red first-drop guide side in the same 3D frame.'
    },
    {
      id: 'CORRECTIVE_STILLS',
      evidenceIds: ['user-first-drop-height-stills-2026-09-26'],
      result: 'GUIDE_SIDE_ORDER_ONLY',
      canBindCanonicalFloorSides: false,
      notes:
        'The still pair plus direct user observation establishes a relative order between the floors referred to as below the red and blue guide lines, without canonical floor-node identity or metric delta.'
    },
    {
      id: 'POST_7_2_LAYOUT_CROSSCHECK',
      evidenceIds: ['web-post-7-2-gameplay'],
      result: 'SEMANTIC_CROSSCHECK_ONLY',
      canBindCanonicalFloorSides: false,
      notes:
        'The current-layout description distinguishes the open area after the first drop from the separate open area reached by the small drop. This is consistent with rejecting the guide\'s former shared-middle-floor assumption, but does not by itself identify each visible line side in 3D.'
    }
  ];

export interface UndertowLineSemanticBindingAudit {
  lineId: UndertowGuideLineId;
  vectorTraceId: string;
  geometryIdentityConfidence: 'HIGH';
  lowerSideCanonicalFloorId:
    | 'team-a-first-drop-landing'
    | 'right-low-floor';
  upperSideCanonicalFloorId:
    | 'team-a-spawn-floor'
    | 'right-small-drop-upper';
  lowerSideProjectY: number;
  upperSideProjectY: number;
  sideBindingStatus: 'RESOLVED_BY_TEMPLE01_LOCAL_REGISTRATION';
  evidenceIds: readonly string[];
  notes: string;
}

/**
 * The 2026-09-26 still pair exposed a semantic mistake in the marked guide:
 * measured vector lips were treated as if their map-side faces directly named
 * canonical gameplay floor nodes.
 *
 * The guide-side identities were initially cleared. They are now rebound only
 * because the remodeled Temple01 OBJ was independently registered to the
 * vector plan and both A/B lips matched the expected local height-discontinuity
 * contours within the 0.5m audit raster.
 */
export const UNDERTOW_LINE_SEMANTIC_BINDING_AUDIT:
  readonly UndertowLineSemanticBindingAudit[] = [
    {
      lineId: 'TEAM_A_FIRST_DROP_RED',
      vectorTraceId: UNDERTOW_VECTOR_TRACES.teamAFirstDropLip.id,
      geometryIdentityConfidence: 'HIGH',
      lowerSideCanonicalFloorId: 'team-a-first-drop-landing',
      upperSideCanonicalFloorId: 'team-a-spawn-floor',
      lowerSideProjectY: 1.5,
      upperSideProjectY: 6,
      sideBindingStatus: 'RESOLVED_BY_TEMPLE01_LOCAL_REGISTRATION',
      evidenceIds: ['extracted-temple01-geometry', 'user-turf-vector-blueprint', 'user-first-drop-video'],
      notes:
        'Registered red lip: upper-side model Y=10.5m and lower-side model Y=6.0m. With model center reference 4.5m normalized to canonical center Y=0, these become project Y=6.0m and 1.5m.'
    },
    {
      lineId: 'TEAM_A_RIGHT_SMALL_DROP_BLUE',
      vectorTraceId: UNDERTOW_VECTOR_TRACES.teamARightSmallDropLip.id,
      geometryIdentityConfidence: 'HIGH',
      lowerSideCanonicalFloorId: 'right-low-floor',
      upperSideCanonicalFloorId: 'right-small-drop-upper',
      lowerSideProjectY: 3,
      upperSideProjectY: 6,
      sideBindingStatus: 'RESOLVED_BY_TEMPLE01_LOCAL_REGISTRATION',
      evidenceIds: ['extracted-temple01-geometry', 'user-turf-vector-blueprint', 'user-right-low-capture-2026-09-25'],
      notes:
        'Registered blue lip: upper-side model Y=10.5m and lower-side model Y=7.5m, normalized to project Y=6.0m and 3.0m. The lower side is independently bound to the captured right-low destination.'
    }
  ];

export const UNDERTOW_GUIDE_LINE_SIDE_OBSERVATIONS:
  readonly UndertowGuideLineSideObservation[] = [
    {
      lowerGuideSideLineId: 'TEAM_A_FIRST_DROP_RED',
      higherGuideSideLineId: 'TEAM_A_RIGHT_SMALL_DROP_BLUE',
      confidence: 'CONFIRMED',
      evidenceIds: ['user-first-drop-height-stills-2026-09-26'],
      semanticFloorBinding: 'UNRESOLVED',
      safeToCreateVerticalRelation: false,
      notes:
        'User direct observation: the floor referred to as below the red guide line is lower than the floor referred to as below the blue guide line. This is a guide-line-side ordering only. The canonical floor identities and metric delta are unresolved.'
    }
  ];

export function undertowLineSemanticAuditErrors(): readonly string[] {
  const errors: string[] = [];
  const vectorTraceIds = new Set(
    Object.values(UNDERTOW_VECTOR_TRACES).map((trace) => trace.id)
  );

  for (const binding of UNDERTOW_LINE_SEMANTIC_BINDING_AUDIT) {
    if (!vectorTraceIds.has(binding.vectorTraceId)) {
      errors.push(`${binding.lineId}: missing vector trace ${binding.vectorTraceId}`);
    }
    if (binding.sideBindingStatus !== 'RESOLVED_BY_TEMPLE01_LOCAL_REGISTRATION') {
      errors.push(`${binding.lineId}: canonical floor side binding must be resolved by local Temple01 registration`);
    }
    if (!(binding.upperSideProjectY > binding.lowerSideProjectY)) {
      errors.push(`${binding.lineId}: resolved upper side must be above lower side`);
    }
  }

  for (const observation of UNDERTOW_GUIDE_LINE_SIDE_OBSERVATIONS) {
    if (observation.safeToCreateVerticalRelation) {
      errors.push('guide-line-side observation must not create a vertical relation');
    }
  }

  for (const finding of UNDERTOW_SIDE_REGISTRATION_FINDINGS) {
    if (finding.canBindCanonicalFloorSides) {
      errors.push(`${finding.id}: existing media must not bind canonical floor sides`);
    }
  }

  return errors;
}
