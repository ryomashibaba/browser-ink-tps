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
    status: 'RESOLVED_FROM_TEMPLE01_MODEL',
    reason:
      'The PDF/capture pair alone could not solve the lower-layer polygon, but the remodeled Temple01 OBJ now supplies the model-Y=3.0 roofed walkable masks. CI #631 subtracts floor-level Pillar/Wall exclusions and verifies the two 3863-cell masks are exact 180-degree counterparts (mirror XOR 0 cells); stored <=0.15m contours retain one support hole per side. The result is HIGH and blockout-safe.',
    safeToUseForBlockout: true
  },
  {
    id: 'internal-void-kill-boundaries',
    status: 'RESOLVED_FROM_TEMPLE01_MODEL',
    reason:
      'The exact 42-vertex exterior hard silhouette and exact mapped cyan water pair are already known. The full common+Turf Temple01 XZ audit finds six enclosed empty candidates: two map to the known water pair, the large symmetric pair is exterior/StageSide space with zero FloorLine05 interior holes, and the small symmetric pair is an overhead-projection false positive beside simple FloorMetal components with zero interior holes. Both candidate pairs are exact 180-degree counterparts and no unexplained internal abyss candidate remains. The exterior hard silhouette is therefore the BLOCKOUT XZ fall-out envelope; kill-height Y remains separate.',
    safeToUseForBlockout: true
  }
];

export function unresolvedUndertowSourceTopologyLimits(): readonly string[] {
  return UNDERTOW_SOURCE_TOPOLOGY_LIMITS
    .filter((item) => !item.safeToUseForBlockout)
    .map((item) => item.id);
}
