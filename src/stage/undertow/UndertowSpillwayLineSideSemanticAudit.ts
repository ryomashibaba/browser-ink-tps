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

export interface UndertowLineSemanticBindingAudit {
  lineId: UndertowGuideLineId;
  vectorTraceId: string;
  geometryIdentityConfidence: 'HIGH';
  lowerSideCanonicalFloorId: null;
  upperSideCanonicalFloorId: null;
  sideBindingStatus: 'UNRESOLVED_AFTER_2026_09_26_CORRECTION';
  notes: string;
}

/**
 * The 2026-09-26 still pair exposed a semantic mistake in the marked guide:
 * measured vector lips were treated as if their map-side faces directly named
 * canonical gameplay floor nodes.
 *
 * Keep the measured line geometry, but do not bind either visible side of a
 * line to first-drop landing / right-small-drop upper / right-low until that
 * side identity is independently registered in 3D.
 */
export const UNDERTOW_LINE_SEMANTIC_BINDING_AUDIT:
  readonly UndertowLineSemanticBindingAudit[] = [
    {
      lineId: 'TEAM_A_FIRST_DROP_RED',
      vectorTraceId: UNDERTOW_VECTOR_TRACES.teamAFirstDropLip.id,
      geometryIdentityConfidence: 'HIGH',
      lowerSideCanonicalFloorId: null,
      upperSideCanonicalFloorId: null,
      sideBindingStatus: 'UNRESOLVED_AFTER_2026_09_26_CORRECTION',
      notes:
        'The red guide line remains the measured Team A first-drop hard edge, but the guide did not prove which visible/map side is the canonical first-drop landing floor.'
    },
    {
      lineId: 'TEAM_A_RIGHT_SMALL_DROP_BLUE',
      vectorTraceId: UNDERTOW_VECTOR_TRACES.teamARightSmallDropLip.id,
      geometryIdentityConfidence: 'HIGH',
      lowerSideCanonicalFloorId: null,
      upperSideCanonicalFloorId: null,
      sideBindingStatus: 'UNRESOLVED_AFTER_2026_09_26_CORRECTION',
      notes:
        'The blue guide line remains the measured Team A right-small-drop hard edge, but the screenshot comparison must not be converted into a right-low floor binding without 3D side registration.'
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
    if (
      binding.lowerSideCanonicalFloorId !== null ||
      binding.upperSideCanonicalFloorId !== null
    ) {
      errors.push(`${binding.lineId}: canonical floor side binding must remain unresolved`);
    }
  }

  for (const observation of UNDERTOW_GUIDE_LINE_SIDE_OBSERVATIONS) {
    if (observation.safeToCreateVerticalRelation) {
      errors.push('guide-line-side observation must not create a vertical relation');
    }
  }

  return errors;
}
