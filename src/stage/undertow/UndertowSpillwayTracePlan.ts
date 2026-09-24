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
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Vector-PDF hard edge is measured; user video independently confirms one-way traversal.'
  },
  {
    id: 'team-b-first-drop-lip',
    geometryKind: 'POLYLINE',
    region: 'Team B Spawn',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Measured 180-degree counterpart hard edge; no invisible ramp may replace this trace.'
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
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Both symmetric gray vector faces are measured and matched to gameplay glass. Internal slope-marker envelopes are recorded separately.'
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
    notes: 'The central-left dashed marker envelope is measured, but the hard collision footprint still must be derived from surrounding edges and 3D evidence.'
  },
  {
    id: 'center-right-slope-footprint',
    geometryKind: 'POLYGON',
    region: 'Center / Right',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'The central-right dashed marker envelope is measured with near-exact 180-degree symmetry; hard collision footprint remains unresolved.'
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
    id: 'mapped-water-hazard-polygons',
    geometryKind: 'POLYGON',
    region: 'Spawn Sides / Outer Environment',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'CONFIRMED',
    notes: 'Both cyan water polygons are exact vector-PDF source faces.'
  },
  {
    id: 'fall-out-void-kill-boundary',
    geometryKind: 'POLYGON',
    region: 'Outer Environment',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Mapped cyan water is exact, but the broader fall-out/void kill boundary remains unresolved.'
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
