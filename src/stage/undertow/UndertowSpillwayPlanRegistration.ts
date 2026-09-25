import { UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';

export type UndertowPlanRegistrationId =
  | 'right-low-floor-outline'
  | 'glass-underpass-outline';

export type UndertowPlanRegistrationStatus =
  | 'PLAN_REGISTERED_POLYGON_UNRESOLVED';

export interface UndertowPlanRegistration {
  id: UndertowPlanRegistrationId;
  captureEvidenceIds: readonly string[];
  planAnchorTraceIds: readonly string[];
  status: UndertowPlanRegistrationStatus;
  confidence: 'HIGH';
  safeToPromoteTrace: false;
  registeredFacts: readonly string[];
  unresolvedBecause: readonly string[];
}

/**
 * The 2026-09-25 captures are now tied to known vector-plan landmarks.
 *
 * This is deliberately not an XZ polygon source. The marked capture guide and
 * perspective gameplay establish which measured plan feature each clip belongs
 * to, but neither clip supplies a calibrated top-down transform for every
 * lower-layer wall/support corner.
 */
export const UNDERTOW_PLAN_REGISTRATIONS:
  readonly UndertowPlanRegistration[] = [
    {
      id: 'right-low-floor-outline',
      captureEvidenceIds: [
        'user-right-low-capture-2026-09-25',
        'user-capture-location-guide-2026-09-25'
      ],
      planAnchorTraceIds: ['team-a-right-small-drop-lip'],
      status: 'PLAN_REGISTERED_POLYGON_UNRESOLVED',
      confidence: 'HIGH',
      safeToPromoteTrace: false,
      registeredFacts: [
        'The capture starts at the measured Team A right-small-drop lip shown by the marked capture guide.',
        'The clip classifies the destination as the right-low open/grass floor, including a traversable ramp exit and a same-height connection into the glass underpass.'
      ],
      unresolvedBecause: [
        'The clip is perspective-only and does not expose a second independent measured plan anchor with enough geometric precision to solve every perimeter corner.',
        'Several visible walls and ramp edges belong to overlapping 2D source faces, so assigning them to exact PDF vertices would still be non-unique.'
      ]
    },
    {
      id: 'glass-underpass-outline',
      captureEvidenceIds: [
        'user-underpass-capture-2026-09-25',
        'user-capture-location-guide-2026-09-25'
      ],
      planAnchorTraceIds: ['positive-z-glass-overhang'],
      status: 'PLAN_REGISTERED_POLYGON_UNRESOLVED',
      confidence: 'HIGH',
      safeToPromoteTrace: false,
      registeredFacts: [
        'The marked route crosses beneath the measured positive-Z glass-overhang footprint.',
        'The clip confirms traversal through the covered lower layer, solid support/wall exclusions, and a step-free exit onto the right-low floor.'
      ],
      unresolvedBecause: [
        'The vector PDF contains the upper glass projection but no independent lower-layer support/clearance outline.',
        'Perspective footage can classify the supports and openings topologically, but it does not provide unique metric corner offsets for the lower walkable polygon.'
      ]
    }
  ];

const VECTOR_TRACE_IDS = new Set(
  Object.values(UNDERTOW_VECTOR_TRACES).map((trace) => trace.id)
);

export function invalidUndertowPlanRegistrationAnchorIds(): readonly string[] {
  return UNDERTOW_PLAN_REGISTRATIONS.flatMap((registration) =>
    registration.planAnchorTraceIds.filter((id) => !VECTOR_TRACE_IDS.has(id))
  );
}

export function promotableUndertowPlanRegistrationIds(): readonly UndertowPlanRegistrationId[] {
  return UNDERTOW_PLAN_REGISTRATIONS
    .filter((registration) => registration.safeToPromoteTrace)
    .map((registration) => registration.id);
}
