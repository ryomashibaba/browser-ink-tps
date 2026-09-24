import type { EvidenceConfidence } from '../measurement/StageMeasurementLedger';

export type UndertowTraceStatus = 'MEASURED' | 'UNTRACED';

export interface UndertowTraceRequirement {
  id: string;
  geometryKind: 'POINT' | 'POLYLINE' | 'POLYGON';
  region: string;
  status: UndertowTraceStatus;
  minimumConfidenceForBlockout: EvidenceConfidence;
  notes: string;
}

export const UNDERTOW_COMMON_TRACE_PLAN: readonly UndertowTraceRequirement[] = [
  {
    id: 'team-a-spawn-center',
    geometryKind: 'POINT',
    region: 'Team A Spawn',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Center point measured; spawn-floor polygon remains separate.'
  },
  {
    id: 'team-b-spawn-center',
    geometryKind: 'POINT',
    region: 'Team B Spawn',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Center point measured; spawn-floor polygon remains separate.'
  },
  {
    id: 'common-playable-boundary',
    geometryKind: 'POLYGON',
    region: 'Whole Stage',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Must replace the provisional ~87m x ~146m envelope.'
  },
  {
    id: 'team-a-spawn-floor-outline',
    geometryKind: 'POLYGON',
    region: 'Team A Spawn',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Do not infer from the spawn-center point.'
  },
  {
    id: 'team-b-spawn-floor-outline',
    geometryKind: 'POLYGON',
    region: 'Team B Spawn',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: '180-degree counterpart must be numerically audited.'
  },
  {
    id: 'team-a-first-drop-lip',
    geometryKind: 'POLYLINE',
    region: 'Team A Spawn',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Topology is CONFIRMED one-way; lip XZ is not yet measured.'
  },
  {
    id: 'team-b-first-drop-lip',
    geometryKind: 'POLYLINE',
    region: 'Team B Spawn',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'No invisible ramp may replace this trace.'
  },
  {
    id: 'center-low-floor-outline',
    geometryKind: 'POLYGON',
    region: 'Center',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Y=0 is confirmed; XZ polygon is not.'
  },
  {
    id: 'center-small-step-outline',
    geometryKind: 'POLYGON',
    region: 'Center',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: '+1.5m relation is HIGH; footprint remains unmeasured.'
  },
  {
    id: 'right-small-drop-edge',
    geometryKind: 'POLYLINE',
    region: 'Center / Right',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: '~1.5m relation is HIGH; edge remains unmeasured.'
  },
  {
    id: 'upper-glass-platform-outline',
    geometryKind: 'POLYGON',
    region: 'Upper Glass',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Gameplay glass; must preserve underpass and sightlines.'
  },
  {
    id: 'glass-underpass-outline',
    geometryKind: 'POLYGON',
    region: 'Lower Tunnels',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Must be traced independently from the glass top.'
  },
  {
    id: 'center-left-slope-footprint',
    geometryKind: 'POLYGON',
    region: 'Center / Left',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'No slope width/length may be guessed from navigation needs.'
  },
  {
    id: 'center-right-slope-footprint',
    geometryKind: 'POLYGON',
    region: 'Center / Right',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Counterpart residual must be audited.'
  },
  {
    id: 'right-low-floor-outline',
    geometryKind: 'POLYGON',
    region: 'Center / Right',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Absolute Y remains unresolved separately.'
  },
  {
    id: 'center-grate-outline',
    geometryKind: 'POLYGON',
    region: 'Center',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'GRATE + UNINKABLE semantics already confirmed.'
  },
  {
    id: 'water-kill-boundaries',
    geometryKind: 'POLYGON',
    region: 'Outer Environment',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Do not substitute provisional outer bounds for kill polygons.'
  }
];

export function undertowTraceCoverage(): {
  measured: number;
  total: number;
  missingIds: readonly string[];
} {
  const missingIds = UNDERTOW_COMMON_TRACE_PLAN
    .filter((item) => item.status === 'UNTRACED')
    .map((item) => item.id);
  return {
    measured: UNDERTOW_COMMON_TRACE_PLAN.length - missingIds.length,
    total: UNDERTOW_COMMON_TRACE_PLAN.length,
    missingIds
  };
}
