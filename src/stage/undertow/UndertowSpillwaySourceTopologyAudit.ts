export interface UndertowSourceTopologyLimit {
  id: string;
  status:
    | 'RESOLVED_FROM_VECTOR'
    | 'CAPTURED_REQUIRES_PLAN_REGISTRATION'
    | 'PLAN_REGISTERED_POLYGON_UNRESOLVED'
    | 'REQUIRES_3D_BINDING';
  reason: string;
  safeToUseForBlockout: boolean;
}

export const UNDERTOW_SOURCE_TOPOLOGY_LIMITS: readonly UndertowSourceTopologyLimit[] = [
  {
    id: 'spawn-side-connected-terrain',
    status: 'RESOLVED_FROM_VECTOR',
    reason:
      'Each spawn ring lies inside an exact closed white source face. The face spans multiple elevations/transitions, so it is an XZ terrain envelope rather than one flat floor.',
    safeToUseForBlockout: true
  },
  {
    id: 'right-low-floor-partition',
    status: 'PLAN_REGISTERED_POLYGON_UNRESOLVED',
    reason:
      'The 2026-09-25 right-low capture is now registered to the measured Team A right-small-drop lip. It classifies the low/open floor, same-height underpass connection and a ramp exit, but perspective footage plus the overlapping 2D source faces still do not assign every perimeter corner to a unique PDF vertex.',
    safeToUseForBlockout: false
  },
  {
    id: 'glass-underpass-walkable-outline',
    status: 'PLAN_REGISTERED_POLYGON_UNRESOLVED',
    reason:
      'The 2026-09-25 underpass capture is now registered beneath the measured positive-Z glass-overhang footprint. Traversal, solid support/wall exclusions and the same-height connection to right-low are confirmed, but the PDF has no independent lower-layer support/clearance outline and the perspective clip cannot supply unique metric corner offsets.',
    safeToUseForBlockout: false
  },
  {
    id: 'internal-void-kill-boundaries',
    status: 'REQUIRES_3D_BINDING',
    reason:
      'The exact exterior silhouette and mapped cyan water hazards are known, but top-down overlap prevents every internal blank region from being classified safely as abyss versus lower-layer passage.',
    safeToUseForBlockout: false
  }
];

export function unresolvedUndertowSourceTopologyLimits(): readonly string[] {
  return UNDERTOW_SOURCE_TOPOLOGY_LIMITS
    .filter((item) => !item.safeToUseForBlockout)
    .map((item) => item.id);
}
