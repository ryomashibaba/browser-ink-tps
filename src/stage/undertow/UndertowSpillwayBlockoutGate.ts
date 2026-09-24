import { UNDERTOW_COMMON_TRACE_PLAN } from './UndertowSpillwayTracePlan';
import {
  UNDERTOW_VERTICAL_NODES,
  UNDERTOW_VERTICAL_RELATIONS
} from './UndertowSpillwayVerticalModel';

export interface UndertowBlockoutReadiness {
  ready: boolean;
  missingTraceIds: readonly string[];
  unresolvedVerticalIds: readonly string[];
  unresolvedVerticalRelations: readonly string[];
}

const REQUIRED_TRACE_IDS = Object.freeze([
  'common-playable-boundary',
  'team-a-spawn-floor-outline',
  'team-b-spawn-floor-outline',
  'team-a-first-drop-lip',
  'team-b-first-drop-lip',
  'center-low-floor-outline',
  'center-small-step-outline',
  'right-small-drop-edge',
  'upper-glass-platform-outline',
  'glass-underpass-outline',
  'center-left-slope-footprint',
  'center-right-slope-footprint',
  'right-low-floor-outline',
  'center-grate-outline',
  'mapped-water-hazard-polygons',
  'fall-out-void-kill-boundary'
] as const);

const REQUIRED_ABSOLUTE_VERTICAL_IDS = Object.freeze([
  'center-low-floor',
  'team-a-spawn-floor',
  'team-b-spawn-floor',
  'team-a-first-drop-landing',
  'team-b-first-drop-landing',
  'right-low-floor',
  'glass-lower-major-floor'
] as const);

const REQUIRED_EXACT_RELATION_KEYS = Object.freeze([
  'team-a-spawn-floor->team-a-first-drop-landing',
  'team-b-spawn-floor->team-b-first-drop-landing'
] as const);

export function undertowBlockoutReadiness(): UndertowBlockoutReadiness {
  const traceById = new Map(UNDERTOW_COMMON_TRACE_PLAN.map((item) => [item.id, item]));
  const missingTraceIds = REQUIRED_TRACE_IDS.filter(
    (id) => traceById.get(id)?.status !== 'MEASURED'
  );

  const verticalById = new Map(UNDERTOW_VERTICAL_NODES.map((node) => [node.id, node]));
  const unresolvedVerticalIds = REQUIRED_ABSOLUTE_VERTICAL_IDS.filter((id) => {
    const node = verticalById.get(id);
    return node?.absolute.yMeters === undefined;
  });

  const relationByKey = new Map(
    UNDERTOW_VERTICAL_RELATIONS.map((relation) => [
      relation.fromId + '->' + relation.toId,
      relation
    ])
  );
  const unresolvedVerticalRelations = REQUIRED_EXACT_RELATION_KEYS.filter((key) => {
    const relation = relationByKey.get(key);
    return relation?.deltaMeters === undefined || relation.confidence === 'PROVISIONAL';
  });

  return {
    ready:
      missingTraceIds.length === 0 &&
      unresolvedVerticalIds.length === 0 &&
      unresolvedVerticalRelations.length === 0,
    missingTraceIds,
    unresolvedVerticalIds,
    unresolvedVerticalRelations
  };
}
