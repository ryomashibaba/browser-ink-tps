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
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Exact 42-vertex exterior hard silhouette from the vector topology; ~98.80m X by ~156.53m Z under the HIGH project-meter transform.'
  },
  {
    id: 'team-a-spawn-terrain-outline',
    geometryKind: 'POLYGON',
    region: 'Team A Spawn',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Satisfied by the exact connected spawn-side terrain face containing the spawn ring. This is an XZ terrain envelope, not a single flat-Y floor.'
  },
  {
    id: 'team-b-spawn-terrain-outline',
    geometryKind: 'POLYGON',
    region: 'Team B Spawn',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Exact 180-degree counterpart connected spawn-side terrain face. Multiple elevations are preserved through separate transition/Y constraints.'
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
    notes: 'The former origin-face=center-low binding is superseded by Temple01 local registration. Y=0 remains CONFIRMED, but the true center-low XZ polygon must be re-extracted; the origin face is the +1.5m step-top face.'
  },
  {
    id: 'center-small-step-outline',
    geometryKind: 'POLYGON',
    region: 'Center',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Both symmetric 0.75m-deep transition strips are measured; Temple01 confirms the adjacent origin face is the +1.5m step-top side and the lower side is canonical Y=0.'
  },
  {
    id: 'right-small-drop-edge',
    geometryKind: 'POLYLINE',
    region: 'Spawn-side Right Route',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Both symmetric right-side L-shaped hard edges are measured; Temple01 local registration resolves the vertical drop to -3.0m HIGH.'
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
    notes: '2026-09-25 capture is plan-registered beneath the positive-Z glass overhang and confirms traversal plus solid support/wall exclusions; the lower-layer walkable polygon remains non-unique because the PDF has no independent support/clearance outline.'
  },
  {
    id: 'center-left-slope-footprint',
    geometryKind: 'POLYGON',
    region: 'Center / Left',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Exact 3.30m x 11.975m dashed-hatch semantic slope region; it remains a continuous floor transition rather than a hard-wall outline.'
  },
  {
    id: 'center-right-slope-footprint',
    geometryKind: 'POLYGON',
    region: 'Center / Right',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Near-180-degree counterpart dashed-hatch semantic slope region; Temple01 locally resolves the slope span to project Y=-1.5m..0m at HIGH confidence.'
  },
  {
    id: 'right-low-floor-outline',
    geometryKind: 'POLYGON',
    region: 'Center / Right',
    status: 'UNTRACED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: '2026-09-25 capture is plan-registered to the Team A right-small-drop lip and confirms the low/open floor, ramp exit and same-level underpass connection; perspective footage still does not assign every perimeter corner to a unique PDF vertex. Temple01 local registration independently resolves right-low project Y=4.5m after corrected center normalization.'
  },
  {
    id: 'center-grate-outline',
    geometryKind: 'POLYGON',
    region: 'Center',
    status: 'MEASURED',
    minimumConfidenceForBlockout: 'HIGH',
    notes: 'Both symmetric white mesh-pattern grate polygons are measured; Temple01 FloorFence00 locally resolves the visible top to project Y=7.4m HIGH for blockout/render use.'
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
    notes: 'Mapped cyan water is exact. Only still-ambiguous internal/off-stage gaps remain; any further user capture request must be provided with a marked-map guide.'
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
