import type { StageVector3 } from '../StageDefinition';
import {
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES,
  type UndertowUpperGlassMeshRecord
} from './UndertowSpillwayUpperGlassMeshGeometry';
import {
  UNDERTOW_UPPER_GLASS_PASS15D_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS
} from './UndertowSpillwayUpperGlassRuntimeGeometry';

export interface UndertowUpperGlassBoundaryTriangleMetric {
  side: UndertowUpperGlassMeshRecord['side'];
  triangleId: number;
  centroid: StageVector3;
  normal: StageVector3;
  areaSquareMeters: number;
  minEdgeMeters: number;
  maxEdgeMeters: number;
}

function metric(
  record: UndertowUpperGlassMeshRecord,
  triangleId: number
): UndertowUpperGlassBoundaryTriangleMetric {
  const base = triangleId * 3;
  const ids = [
    record.mesh.indices[base],
    record.mesh.indices[base + 1],
    record.mesh.indices[base + 2]
  ];
  if (ids.some((id) => id === undefined)) {
    throw new Error(`Pass 15E triangle ${triangleId} outside ${record.id}`);
  }
  const a = record.mesh.vertices[ids[0]!]!;
  const b = record.mesh.vertices[ids[1]!]!;
  const c = record.mesh.vertices[ids[2]!]!;
  const u: StageVector3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v: StageVector3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n: StageVector3 = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0]
  ];
  const normalLength = Math.hypot(n[0], n[1], n[2]);
  if (normalLength <= 1e-10) {
    throw new Error(`Pass 15E degenerate triangle ${triangleId} in ${record.id}`);
  }
  const edges = [
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]),
    Math.hypot(b[0] - c[0], b[1] - c[1], b[2] - c[2]),
    Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2])
  ];
  return {
    side: record.side,
    triangleId,
    centroid: [
      (a[0] + b[0] + c[0]) / 3,
      (a[1] + b[1] + c[1]) / 3,
      (a[2] + b[2] + c[2]) / 3
    ],
    normal: [
      n[0] / normalLength,
      n[1] / normalLength,
      n[2] / normalLength
    ],
    areaSquareMeters: normalLength * 0.5,
    minEdgeMeters: Math.min(...edges),
    maxEdgeMeters: Math.max(...edges)
  };
}

export const UNDERTOW_UPPER_GLASS_PASS15E_BOUNDARY_METRICS:
  readonly UndertowUpperGlassBoundaryTriangleMetric[] = Object.freeze(
    UNDERTOW_UPPER_GLASS_SOURCE_MESHES.flatMap((record) =>
      UNDERTOW_UPPER_GLASS_PASS15D_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS.map(
        (triangleId) => metric(record, triangleId)
      )
    )
  );

const positiveMetrics = UNDERTOW_UPPER_GLASS_PASS15E_BOUNDARY_METRICS.filter(
  (entry) => entry.side === 'POSITIVE_Z'
);
const largeStripIds = new Set([94, 95, 98, 99]);
const positiveLargeStrips = positiveMetrics.filter((entry) =>
  largeStripIds.has(entry.triangleId)
);
const positiveCaps = positiveMetrics.filter(
  (entry) => !largeStripIds.has(entry.triangleId)
);

export const UNDERTOW_UPPER_GLASS_PASS15E_BOUNDARY_DISPOSITION_AUDIT =
  Object.freeze({
    resolutionPass: '15E' as const,
    auditedAt: '2026-09-28' as const,
    scope: 'THIN_EDGE_FRAME_FINAL_EXCLUSION_STRESS_AUDIT' as const,
    excludedTriangleCountPerSide: 8,
    totalBoundaryProbeTriangles: 16,
    queryPurposes: ['ink-projectile', 'thrown-sub', 'camera'] as const,
    queryDirectionsPerTriangle: 2,
    totalQueryComparisons:
      16 * 3 * 2,
    full102ShellQueryHits: 96,
    current94TriangleBroadQueryHits: 0,
    full102ShellQueryHitRate: 1,
    current94TriangleBroadQueryHitRate: 0,
    excludedAreaSquareMetersPerSide:
      positiveMetrics.reduce((sum, entry) => sum + entry.areaSquareMeters, 0),
    longStripAreaSquareMetersPerSide:
      positiveLargeStrips.reduce((sum, entry) => sum + entry.areaSquareMeters, 0),
    endCapAreaSquareMetersPerSide:
      positiveCaps.reduce((sum, entry) => sum + entry.areaSquareMeters, 0),
    longStripTriangleIds: [94, 95, 98, 99] as const,
    endCapTriangleIds: [96, 97, 100, 101] as const,
    longStripMaxEdgeMeters:
      Math.max(...positiveLargeStrips.map((entry) => entry.maxEdgeMeters)),
    longStripMinEdgeMeters:
      Math.min(...positiveLargeStrips.map((entry) => entry.minEdgeMeters)),
    broadFinalExclusionDispositionAuthorized: false,
    broadFinalExclusionCreatesDeterministicQueryHoles: true,
    full102ShellClosesMeasuredBoundaryQueryHoles: true,
    full102ShellOriginalPrimitiveIdentityResolved: false,
    full102ShellRuntimePromotionAuthorizedByPass15EAlone: false,
    visualMeshAloneAcceptedAsCollisionAuthority: false,
    navigationScopeChanged: false,
    paintOrScoreScopeChanged: false,
    activationBlockersCleared: [] as const,
    activationBlockersRetained: [
      'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
      'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING'
    ] as const,
    userCaptureRequiredNow: false,
    confidence: 'HIGH' as const,
    notes:
      'Pass 15E eliminates safe permanent omission as a valid disposition for source triangles 94-101. Centroid-normal stress rays through all 16 mirrored excluded triangles hit the full 102-triangle reference in both directions for ink-projectile, thrown-sub and camera queries (96/96) while the current 94-triangle broad runtime candidate misses every comparison (0/96). The four long strip triangles per side are not negligible visual caps: together they span about 2.497 m² per side with ~9.23 m maximum edges. This proves the broad-only collider leaves deterministic query holes, but it does not prove that the original game literally uses the visible Glass01 shell. Therefore Pass 15E does not promote the full visual shell by itself and does not clear either authority blocker.'
  });

export function undertowUpperGlassPass15eBoundaryDispositionErrors():
  readonly string[] {
  const a = UNDERTOW_UPPER_GLASS_PASS15E_BOUNDARY_DISPOSITION_AUDIT;
  const errors: string[] = [];

  if (
    a.resolutionPass !== '15E' ||
    a.excludedTriangleCountPerSide !== 8 ||
    a.totalBoundaryProbeTriangles !== 16 ||
    a.totalQueryComparisons !== 96 ||
    a.full102ShellQueryHits !== 96 ||
    a.current94TriangleBroadQueryHits !== 0
  ) {
    errors.push('Pass 15E boundary query accounting drifted');
  }

  if (
    Math.abs(a.excludedAreaSquareMetersPerSide - 2.608552536) > 1e-6 ||
    Math.abs(a.longStripAreaSquareMetersPerSide - 2.496928456) > 1e-6 ||
    Math.abs(a.endCapAreaSquareMetersPerSide - 0.111624080) > 1e-6 ||
    a.longStripMaxEdgeMeters < 9.23 ||
    a.longStripMinEdgeMeters < 0.17
  ) {
    errors.push('Pass 15E exact source boundary metrics drifted');
  }

  if (
    a.broadFinalExclusionDispositionAuthorized ||
    !a.broadFinalExclusionCreatesDeterministicQueryHoles ||
    !a.full102ShellClosesMeasuredBoundaryQueryHoles ||
    a.full102ShellOriginalPrimitiveIdentityResolved ||
    a.full102ShellRuntimePromotionAuthorizedByPass15EAlone ||
    a.visualMeshAloneAcceptedAsCollisionAuthority ||
    a.navigationScopeChanged ||
    a.paintOrScoreScopeChanged ||
    a.activationBlockersCleared.length !== 0 ||
    a.activationBlockersRetained.join(',') !==
      'UPPER_GLASS_COLLISION_AUTHORITY_PENDING,UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING' ||
    a.userCaptureRequiredNow
  ) {
    errors.push('Pass 15E authority boundary overclaimed or regressed');
  }

  return errors;
}
