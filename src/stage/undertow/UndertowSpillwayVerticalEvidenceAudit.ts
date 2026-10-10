import {
  UNDERTOW_VERTICAL_NODES,
  UNDERTOW_VERTICAL_RELATIONS
} from './UndertowSpillwayVerticalModel';

export type UndertowVerticalComponentId =
  | 'CENTER_MODEL_SEEDED'
  | 'SPAWN_RIGHT_LOW_MODEL_SEEDED'
  | 'SLOPE_MODEL_SEEDED'
  | 'GRATE_MODEL_SEEDED';

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
const slopeNodes = connectedComponent('center-left-slope-low');
const grateNodes = connectedComponent('negative-z-grate-floor');

export const UNDERTOW_VERTICAL_COMPONENT_AUDIT:
  readonly UndertowVerticalComponentAudit[] = [
    {
      id: 'CENTER_MODEL_SEEDED',
      nodeIds: centerNodes,
      seededAbsoluteY: componentHasBlockoutSeed(centerNodes),
      confidence: 'CONFIRMED',
      blocker: null
    },
    {
      id: 'SPAWN_RIGHT_LOW_MODEL_SEEDED',
      nodeIds: spawnRightLowNodes,
      seededAbsoluteY: componentHasBlockoutSeed(spawnRightLowNodes),
      confidence: 'HIGH',
      blocker: null
    },
    {
      id: 'SLOPE_MODEL_SEEDED',
      nodeIds: slopeNodes,
      seededAbsoluteY: componentHasBlockoutSeed(slopeNodes),
      confidence: 'HIGH',
      blocker: null
    },
    {
      id: 'GRATE_MODEL_SEEDED',
      nodeIds: grateNodes,
      seededAbsoluteY: componentHasBlockoutSeed(grateNodes),
      confidence: 'HIGH',
      blocker: null
    }
  ];

export const UNDERTOW_MINIMUM_VERTICAL_EVIDENCE_NEEDS = Object.freeze([] as const);

export function undertowVerticalEvidenceAuditErrors(): readonly string[] {
  const errors: string[] = [];
  const knownNodeIds = new Set(UNDERTOW_VERTICAL_NODES.map((node) => node.id));

  for (const component of UNDERTOW_VERTICAL_COMPONENT_AUDIT) {
    if (!component.seededAbsoluteY) {
      errors.push(`${component.id}: component must be seeded at BLOCKOUT confidence`);
    }
    if (component.blocker !== null) {
      errors.push(`${component.id}: resolved component must not expose a blocker`);
    }
    for (const id of component.nodeIds) {
      if (!knownNodeIds.has(id)) {
        errors.push(`${component.id}: unknown vertical node ${id}`);
      }
    }
  }

  if (UNDERTOW_MINIMUM_VERTICAL_EVIDENCE_NEEDS.length !== 0) {
    errors.push('no vertical evidence need should remain after the Temple01 local audit');
  }

  return errors;
}
