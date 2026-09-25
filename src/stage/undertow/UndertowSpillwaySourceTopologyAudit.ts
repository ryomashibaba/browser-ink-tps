export interface UndertowSourceTopologyLimit {
  id: string;
  status: 'RESOLVED_FROM_VECTOR' | 'REQUIRES_3D_BINDING';
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
    status: 'REQUIRES_3D_BINDING',
    reason:
      'The first-drop and right-small-drop hard edges both border the same spawn-side and central connected source faces. The PDF therefore does not close the right-low elevation region into an independent polygon.',
    safeToUseForBlockout: false
  },
  {
    id: 'glass-underpass-walkable-outline',
    status: 'REQUIRES_3D_BINDING',
    reason:
      'The top-down vector source provides the upper gray glass footprint but not a separate lower-layer walkable polygon or support-column clearance boundary.',
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
