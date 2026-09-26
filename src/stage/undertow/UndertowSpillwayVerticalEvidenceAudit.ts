import {
  UNDERTOW_VERTICAL_NODES,
  UNDERTOW_VERTICAL_RELATIONS
} from './UndertowSpillwayVerticalModel';

export type UndertowVerticalComponentId =
  | 'CENTER_SEEDED'
  | 'SPAWN_RIGHT_LOW_SEEDED'
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

function componentHasBlockoutSeed(nodeIds: readonly string[]): boolean {
  const byId = new Map(UNDERTOW_VERTICAL_NODES.map((node) => [node.id, node]));
  return nodeIds.some((id) => {
    const absolute = byId.get(id)?.absolute;
    return absolute?.yMeters !== undefined &&
      (absolute.confidence === 'CONFIRMED' || absolute.confidence === 'HIGH');
  });
}

const centerNodes = connectedComponent('center-low-floor');
const spawnRightLowNodes = connectedComponent('team-a-spawn-floor');
const slopeHighNodes = connectedComponent('center-left-slope-high');
const grateNodes = connectedComponent('negative-z-grate-floor');

export const UNDERTOW_VERTICAL_COMPONENT_AUDIT:
  readonly UndertowVerticalComponentAudit[] = [
    {
      id: 'CENTER_SEEDED',
      nodeIds: centerNodes,
      seededAbsoluteY: componentHasBlockoutSeed(centerNodes),
      confidence: 'CONFIRMED',
      blocker: null
    },
    {
      id: 'SPAWN_RIGHT_LOW_SEEDED',
      nodeIds: spawnRightLowNodes,
      seededAbsoluteY: componentHasBlockoutSeed(spawnRightLowNodes),
      confidence: 'HIGH',
      blocker: null
    },
    {
      id: 'SLOPE_HIGH_UNSEEDED',
      nodeIds: slopeHighNodes,
      seededAbsoluteY: componentHasBlockoutSeed(slopeHighNodes),
      confidence: 'HIGH',
      blocker:
        'High endpoints are symmetry-linked only; one exact relation to a seeded floor is still missing.'
    },
    {
      id: 'GRATE_UNSEEDED',
      nodeIds: grateNodes,
      seededAbsoluteY: componentHasBlockoutSeed(grateNodes),
      confidence: 'HIGH',
      blocker:
        'Grate pair is symmetry-linked only; one exact relation to a seeded floor is still missing.'
    }
  ];

export const UNDERTOW_MINIMUM_VERTICAL_EVIDENCE_NEEDS = Object.freeze([
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
  if (!center?.seededAbsoluteY) {
    errors.push('center component must remain seeded');
  }
  for (const id of [
    'center-low-floor',
    'center-small-step-top',
    'center-left-slope-low',
    'center-right-slope-low'
  ]) {
    if (!center?.nodeIds.includes(id)) {
      errors.push(`center component missing ${id}`);
    }
  }

  const resolved = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
    (component) => component.id === 'SPAWN_RIGHT_LOW_SEEDED'
  );
  if (!resolved?.seededAbsoluteY) {
    errors.push('remodeled spawn/right-low component must be seeded at BLOCKOUT confidence');
  }
  for (const id of [
    'team-a-spawn-floor',
    'team-b-spawn-floor',
    'team-a-first-drop-landing',
    'team-b-first-drop-landing',
    'right-low-floor',
    'right-small-drop-upper',
    'glass-lower-major-floor',
    'glass-overhang-high-reference'
  ]) {
    if (!resolved?.nodeIds.includes(id)) {
      errors.push(`resolved spawn/right-low component missing ${id}`);
    }
  }

  return errors;
}
