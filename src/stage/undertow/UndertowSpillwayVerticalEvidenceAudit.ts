import {
  UNDERTOW_VERTICAL_NODES,
  UNDERTOW_VERTICAL_RELATIONS
} from './UndertowSpillwayVerticalModel';

export type UndertowVerticalComponentId =
  | 'CENTER_SEEDED'
  | 'RIGHT_LOW_UNSEEDED'
  | 'FIRST_DROP_LANDING_UNSEEDED'
  | 'SPAWN_UNSEEDED'
  | 'SLOPE_HIGH_UNSEEDED'
  | 'GRATE_UNSEEDED';

export interface UndertowVerticalComponentAudit {
  id: UndertowVerticalComponentId;
  nodeIds: readonly string[];
  seededAbsoluteY: boolean;
  confidence: 'CONFIRMED' | 'HIGH' | 'UNKNOWN';
  blocker: string | null;
}

const exactBlockoutRelations = UNDERTOW_VERTICAL_RELATIONS.filter(
  (relation) =>
    relation.deltaMeters !== undefined &&
    (relation.confidence === 'CONFIRMED' || relation.confidence === 'HIGH')
);

function exactNeighbors(id: string): readonly string[] {
  const out = new Set<string>();
  for (const relation of exactBlockoutRelations) {
    if (relation.fromId === id) out.add(relation.toId);
    if (relation.toId === id) out.add(relation.fromId);
  }
  return [...out];
}

function connectedComponent(startId: string): readonly string[] {
  const seen = new Set<string>();
  const pending = [startId];
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const next of exactNeighbors(current)) {
      if (!seen.has(next)) pending.push(next);
    }
  }
  return [...seen].sort();
}

const componentFor = (startId: string) => connectedComponent(startId);

export const UNDERTOW_VERTICAL_COMPONENT_AUDIT:
  readonly UndertowVerticalComponentAudit[] = [
    {
      id: 'CENTER_SEEDED',
      nodeIds: componentFor('center-low-floor'),
      seededAbsoluteY: true,
      confidence: 'CONFIRMED',
      blocker: null
    },
    {
      id: 'RIGHT_LOW_UNSEEDED',
      nodeIds: componentFor('right-low-floor'),
      seededAbsoluteY: false,
      confidence: 'HIGH',
      blocker:
        'Needs one evidence-backed exact vertical tie from the right-low / underpass / glass component to the seeded center component.'
    },
    {
      id: 'FIRST_DROP_LANDING_UNSEEDED',
      nodeIds: componentFor('team-a-first-drop-landing'),
      seededAbsoluteY: false,
      confidence: 'HIGH',
      blocker:
        'The former landing = right-small-drop-upper edge is removed. The 2026-09-26 red/blue guide comparison cannot seed this component because the observed line sides are not yet registered to canonical floor identities.'
    },
    {
      id: 'SPAWN_UNSEEDED',
      nodeIds: componentFor('team-a-spawn-floor'),
      seededAbsoluteY: false,
      confidence: 'HIGH',
      blocker:
        'Spawn pair is symmetry-linked, but the spawn -> first-drop relation is still the PROVISIONAL 1.5m / 3.0m candidate pair.'
    },
    {
      id: 'SLOPE_HIGH_UNSEEDED',
      nodeIds: componentFor('center-left-slope-high'),
      seededAbsoluteY: false,
      confidence: 'HIGH',
      blocker:
        'High endpoints are symmetry-linked only; one exact relation to a seeded floor is still missing.'
    },
    {
      id: 'GRATE_UNSEEDED',
      nodeIds: componentFor('negative-z-grate-floor'),
      seededAbsoluteY: false,
      confidence: 'HIGH',
      blocker:
        'Grate pair is symmetry-linked only; one exact relation to a seeded floor is still missing.'
    }
  ];

export const UNDERTOW_MINIMUM_VERTICAL_EVIDENCE_NEEDS = Object.freeze([
  {
    id: 'RIGHT_LOW_TO_CENTER_SEED',
    resolvesComponent: 'RIGHT_LOW_UNSEEDED' as const,
    minimumEvidence:
      'One continuous, unambiguous traversal or metric observation that ties right-low / underpass elevation to a floor already in the center-seeded component.',
    currentState:
      'Existing right-low and underpass clips establish internal same-height/drop relations but never establish an exact relation to center-low Y=0 or center-step Y=1.5.'
  },
  {
    id: 'FIRST_DROP_LANDING_EXACT_TIE',
    resolvesComponent: 'FIRST_DROP_LANDING_UNSEEDED' as const,
    minimumEvidence:
      'One exact metric tie from the first-drop landing to a known/seeded floor, after the relevant visible floor is independently registered to the first-drop-landing node.',
    currentState:
      'The earlier same-height binding to right-small-drop upper was invalidated. The corrective still pair is retained only as guide-line-side ordering until canonical floor-side registration is established.'
  },
  {
    id: 'FIRST_DROP_MAGNITUDE',
    resolvesComponent: 'SPAWN_UNSEEDED' as const,
    minimumEvidence:
      'An exact classification of the one-way spawn first drop as 1.5m or 3.0m plus a seeded spawn-or-landing side.',
    currentState:
      'ONE_WAY_DROP is CONFIRMED; exact magnitude remains PROVISIONAL [1.5, 3.0]m. The adjacent blue-lip comparison is not a valid metric shortcut.'
  },
  {
    id: 'CENTER_SLOPE_HIGH_TIE',
    resolvesComponent: 'SLOPE_HIGH_UNSEEDED' as const,
    minimumEvidence:
      'One exact high-end relation to any seeded floor or another component that later receives a seed.',
    currentState:
      'Both center-side low endpoints resolve to Y=1.5m, but the far/high endpoints have only counterpart symmetry.'
  },
  {
    id: 'GRATE_Y_TIE',
    resolvesComponent: 'GRATE_UNSEEDED' as const,
    minimumEvidence:
      'One exact grate elevation relation to a seeded floor.',
    currentState:
      'The two grate footprints are exact in XZ and symmetry-linked in Y, but no absolute or seeded relative Y is evidenced.'
  }
] as const);

export function undertowVerticalEvidenceAuditErrors(): readonly string[] {
  const errors: string[] = [];
  const knownNodeIds = new Set(UNDERTOW_VERTICAL_NODES.map((node) => node.id));

  for (const component of UNDERTOW_VERTICAL_COMPONENT_AUDIT) {
    for (const id of component.nodeIds) {
      if (!knownNodeIds.has(id)) {
        errors.push(`${component.id}: unknown vertical node ${id}`);
      }
    }
  }

  const center = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
    (component) => component.id === 'CENTER_SEEDED'
  );
  if (!center?.nodeIds.includes('center-low-floor')) {
    errors.push('seeded center component must contain center-low-floor');
  }
  if (!center?.nodeIds.includes('center-small-step-top')) {
    errors.push('seeded center component must contain center-small-step-top');
  }

  const rightLow = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
    (component) => component.id === 'RIGHT_LOW_UNSEEDED'
  );
  for (const id of [
    'right-small-drop-upper',
    'right-low-floor',
    'glass-lower-major-floor',
    'glass-overhang-high-reference'
  ]) {
    if (!rightLow?.nodeIds.includes(id)) {
      errors.push(`right-low component missing ${id}`);
    }
  }
  if (rightLow?.nodeIds.includes('team-a-first-drop-landing')) {
    errors.push('right-low component must not contain first-drop landing after 2026-09-26 correction');
  }

  const landing = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
    (component) => component.id === 'FIRST_DROP_LANDING_UNSEEDED'
  );
  for (const id of [
    'team-a-first-drop-landing',
    'team-b-first-drop-landing'
  ]) {
    if (!landing?.nodeIds.includes(id)) {
      errors.push(`first-drop landing component missing ${id}`);
    }
  }

  return errors;
}
