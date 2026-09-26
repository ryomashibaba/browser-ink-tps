import type {
  ConfidenceTag,
  EvidenceConfidence,
  YMeasurement
} from './StageMeasurementLedger';
import {
  confidenceAllowedForGeometry,
  exactYForGeometry,
  type GeometryUse
} from './MeasurementGeometryGate';

export interface VerticalNode {
  id: string;
  absolute: YMeasurement;
}

export interface VerticalRelation extends ConfidenceTag {
  fromId: string;
  toId: string;
  deltaMeters?: number;
  candidatesMeters?: readonly number[];
}

export interface VerticalResolution {
  values: Readonly<Record<string, number>>;
  unresolved: readonly string[];
  conflicts: readonly string[];
}

export function resolveVerticalConstraints(
  nodes: readonly VerticalNode[],
  relations: readonly VerticalRelation[],
  use: GeometryUse,
  toleranceMeters: number = 1e-6
): VerticalResolution {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const values: Record<string, number> = {};
  const conflicts: string[] = [];

  for (const node of nodes) {
    const y = exactYForGeometry(node.absolute, use);
    if (y !== null) values[node.id] = y;
  }

  const exactRelations = relations.filter((relation) =>
    relation.deltaMeters !== undefined &&
    Number.isFinite(relation.deltaMeters) &&
    confidenceAllowedForGeometry(relation.confidence, use)
  );

  for (const relation of relations) {
    if (!nodeIds.has(relation.fromId)) {
      conflicts.push("relation references unknown fromId '" + relation.fromId + "'");
    }
    if (!nodeIds.has(relation.toId)) {
      conflicts.push("relation references unknown toId '" + relation.toId + "'");
    }
  }

  let changed = true;
  let guard = 0;
  while (changed && guard < nodes.length + exactRelations.length + 4) {
    changed = false;
    guard += 1;

    for (const relation of exactRelations) {
      if (!nodeIds.has(relation.fromId) || !nodeIds.has(relation.toId)) continue;
      const delta = relation.deltaMeters!;
      const from = values[relation.fromId];
      const to = values[relation.toId];

      if (from !== undefined && to === undefined) {
        values[relation.toId] = from + delta;
        changed = true;
        continue;
      }
      if (to !== undefined && from === undefined) {
        values[relation.fromId] = to - delta;
        changed = true;
        continue;
      }
      if (
        from !== undefined &&
        to !== undefined &&
        Math.abs((from + delta) - to) > toleranceMeters
      ) {
        conflicts.push(
          'vertical conflict ' + relation.fromId + '->' + relation.toId + ': ' +
          from + ' + ' + delta + ' != ' + to
        );
      }
    }
  }

  const unresolved = nodes
    .map((node) => node.id)
    .filter((id) => values[id] === undefined);

  return {
    values: Object.freeze({ ...values }),
    unresolved: Object.freeze(unresolved),
    conflicts: Object.freeze(conflicts)
  };
}

export function exactRelation(
  fromId: string,
  toId: string,
  deltaMeters: number,
  confidence: EvidenceConfidence,
  evidenceIds: readonly string[],
  notes?: string
): VerticalRelation {
  return {
    fromId,
    toId,
    deltaMeters,
    confidence,
    evidenceIds,
    notes
  };
}
