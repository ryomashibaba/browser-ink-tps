export interface UndertowSourceTopologyLimit {
  id: string;
  status:
    | 'RESOLVED_FROM_VECTOR'
    | 'CAPTURED_REQUIRES_PLAN_REGISTRATION'
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
    status: 'CAPTURED_REQUIRES_PLAN_REGISTRATION',
    reason:
      'The 2026-09-25 right-low capture classifies the low/open floor, measured small-drop entry, same-height underpass connection and a ramp exit. The 2D PDF still does not close the constant-height partition, so the captured boundaries must be registered to known plan landmarks before an exact polygon is promoted.',
    safeToUseForBlockout: false
  },
  {
    id: 'glass-underpass-walkable-outline',
    status: 'CAPTURED_REQUIRES_PLAN_REGISTRATION',
    reason:
      'The 2026-09-25 underpass capture confirms traversal, solid support/wall exclusions and the same-height connection to right-low. The top-down PDF still lacks a separate lower-layer polygon, so support-clearance boundaries must be plan-registered before navigation geometry is promoted.',
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
