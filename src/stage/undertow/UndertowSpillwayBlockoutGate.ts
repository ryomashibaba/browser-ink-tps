import { resolveVerticalConstraints } from '../measurement/VerticalConstraintGraph';
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
  'team-a-spawn-terrain-outline',
  'team-b-spawn-terrain-outline',
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
  'center-small-step-top',
  'team-a-spawn-floor',
  'team-b-spawn-floor',
  'team-a-first-drop-landing',
  'team-b-first-drop-landing',
  'right-low-floor',
  'right-small-drop-upper',
  'glass-lower-major-floor',
  'glass-overhang-high-reference',
  'center-left-slope-low',
  'center-left-slope-high',
  'center-right-slope-low',
  'center-right-slope-high',
  'negative-z-grate-floor',
  'positive-z-grate-floor'
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

  const verticalResolution = resolveVerticalConstraints(
    UNDERTOW_VERTICAL_NODES,
    UNDERTOW_VERTICAL_RELATIONS,
    'BLOCKOUT'
  );
  const unresolvedVerticalIds = REQUIRED_ABSOLUTE_VERTICAL_IDS.filter(
    (id) => verticalResolution.values[id] === undefined
  );

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
