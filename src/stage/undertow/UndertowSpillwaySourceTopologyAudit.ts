export interface UndertowSourceTopologyLimit {
  id: string;
  status:
    | 'RESOLVED_FROM_VECTOR'
    | 'RESOLVED_FROM_TEMPLE01_MODEL'
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
    status: 'RESOLVED_FROM_TEMPLE01_MODEL',
    reason:
      'The capture-based plan registration alone was insufficient, but the remodeled Temple01 OBJ now supplies the connected Y=7.5m walkable component seeded from the locally verified right-small-drop lower side. Independent A/B extraction is symmetric; the stored 0.125m raster contour is HIGH and blockout-safe.',
    safeToUseForBlockout: true
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
      'The exact exterior silhouette and mapped cyan water hazards are known. A dedicated void audit now classifies the central undercut pair and right-low/underpass overlap as traversable, but it does not yet prove an exhaustive absence/location set for all internal abyss regions; no concrete new capture target is currently justified.',
    safeToUseForBlockout: false
  }
];

export function unresolvedUndertowSourceTopologyLimits(): readonly string[] {
  return UNDERTOW_SOURCE_TOPOLOGY_LIMITS
    .filter((item) => !item.safeToUseForBlockout)
    .map((item) => item.id);
}
