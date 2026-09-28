import type {
  StageDefinition,
  StageSolidDefinition,
  StageTriangleMeshGeometry,
  StageVector3
} from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_UPPER_GLASS_COMPONENT_PROBES,
  UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES
} from './UndertowSpillwayUpperGlassControlledCapturePlan';
import {
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES,
  type UndertowUpperGlassMeshRecord
} from './UndertowSpillwayUpperGlassMeshGeometry';

/**
 * Pass 15A is deliberately QA-only.
 *
 * It builds a role-separated reconstruction candidate from evidence already
 * accepted in Passes 13A-13F:
 * - full exact Glass01 shell -> player/projectile/camera collision QUERY candidate
 * - only the three directly tested broad upward components -> navigation candidate
 *
 * This is not a claim that the original game literally uses Glass01 as its
 * hidden collision primitive. The narrow upward THIN_EDGE_STRIP remains
 * excluded from navigation and the production blocker remains active.
 */
export const UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS = Object.freeze([
  0, 1, 2, 3, 4, 5, 6, 7,
  16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35, 36, 37,
  38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
  48, 49, 50, 51, 52, 53
] as const);

export const UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS = Object.freeze([
  98, 99
] as const);

function submeshByTriangleIds(
  mesh: StageTriangleMeshGeometry,
  triangleIds: readonly number[]
): StageTriangleMeshGeometry {
  const indices: number[] = [];
  for (const triangleId of triangleIds) {
    const base = triangleId * 3;
    const a = mesh.indices[base];
    const b = mesh.indices[base + 1];
    const c = mesh.indices[base + 2];
    if (a === undefined || b === undefined || c === undefined) {
      throw new Error(`upper-glass triangle ${triangleId} is outside the source mesh`);
    }
    indices.push(a, b, c);
  }
  return {
    vertices: mesh.vertices,
    indices
  };
}

function meshBounds(vertices: readonly StageVector3[]): {
  size: StageVector3;
} {
  const xs = vertices.map((v) => v[0]);
  const ys = vertices.map((v) => v[1]);
  const zs = vertices.map((v) => v[2]);
  return {
    size: [
      Math.max(...xs) - Math.min(...xs),
      Math.max(...ys) - Math.min(...ys),
      Math.max(...zs) - Math.min(...zs)
    ]
  };
}

function crossY(a: StageVector3, b: StageVector3, c: StageVector3): number {
  const ux = b[0] - a[0];
  const uz = b[2] - a[2];
  const vx = c[0] - a[0];
  const vz = c[2] - a[2];
  return uz * vx - ux * vz;
}

function interpolateUpwardSurfaceY(
  record: UndertowUpperGlassMeshRecord,
  pointXZ: readonly [number, number]
): number {
  const { vertices, indices } = record.mesh;
  const [x, z] = pointXZ;
  for (let i = 0; i < indices.length; i += 3) {
    const ai = indices[i]!;
    const bi = indices[i + 1]!;
    const ci = indices[i + 2]!;
    const a = vertices[ai]!;
    const b = vertices[bi]!;
    const c = vertices[ci]!;
    if (crossY(a, b, c) <= 1e-8) continue;

    const denominator =
      (b[2] - c[2]) * (a[0] - c[0]) +
      (c[0] - b[0]) * (a[2] - c[2]);
    if (Math.abs(denominator) <= 1e-10) continue;

    const l1 =
      ((b[2] - c[2]) * (x - c[0]) +
        (c[0] - b[0]) * (z - c[2])) /
      denominator;
    const l2 =
      ((c[2] - a[2]) * (x - c[0]) +
        (a[0] - c[0]) * (z - c[2])) /
      denominator;
    const l3 = 1 - l1 - l2;
    const epsilon = 1e-5;
    if (l1 >= -epsilon && l2 >= -epsilon && l3 >= -epsilon) {
      return l1 * a[1] + l2 * b[1] + l3 * c[1];
    }
  }
  throw new Error(
    `upper-glass route point ${pointXZ.join(',')} is not on an upward Glass01 face`
  );
}

function candidateCollisionQuerySolid(
  record: UndertowUpperGlassMeshRecord
): StageSolidDefinition {
  const { size } = meshBounds(record.mesh.vertices);
  return {
    id: `UndertowT21D:${record.id}:collision-query-candidate`,
    center: [0, 0, 0],
    size,
    material: 'light',
    render: false,
    projectileBlocker: true,
    cameraBlocker: true,
    collisionEnabled: true,
    navigationEnabled: false,
    collisionBehavior: 'SOLID',
    triangleMesh: record.mesh
  };
}

function candidateNavigationSolid(
  record: UndertowUpperGlassMeshRecord
): StageSolidDefinition {
  const navMesh = submeshByTriangleIds(
    record.mesh,
    UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS
  );
  const { size } = meshBounds(navMesh.vertices);
  return {
    id: `UndertowT21D:${record.id}:broad-navigation-candidate`,
    center: [0, 0, 0],
    size,
    material: 'light',
    render: false,
    projectileBlocker: false,
    cameraBlocker: false,
    collisionEnabled: false,
    navigationEnabled: true,
    triangleMesh: navMesh
  };
}

export const UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_SOLIDS:
  readonly StageSolidDefinition[] = Object.freeze(
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES.flatMap((record) => [
    candidateCollisionQuerySolid(record),
    candidateNavigationSolid(record)
  ])
);

function route3d(
  side: UndertowUpperGlassMeshRecord['side'],
  route: readonly (readonly [number, number])[]
): readonly StageVector3[] {
  const source = UNDERTOW_UPPER_GLASS_SOURCE_MESHES.find(
    (record) => record.side === side
  );
  if (!source) throw new Error(`missing upper-glass source mesh for ${side}`);
  return route.map(
    (xz) => [xz[0], interpolateUpwardSurfaceY(source, xz), xz[1]] as const
  );
}

export const UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D =
  Object.freeze({
    positiveZ: route3d(
      'POSITIVE_Z',
      UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES.positiveZ
    ),
    negativeZ: route3d(
      'NEGATIVE_Z',
      UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES.negativeZ
    )
  });

const directProbeAreas = UNDERTOW_UPPER_GLASS_COMPONENT_PROBES
  .filter((probe) => probe.directSupportProbe && probe.side === 'POSITIVE_Z')
  .map((probe) => probe.areaSquareMeters);

export const UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_AUDIT =
  Object.freeze({
    resolutionPass: '15A' as const,
    auditedAt: '2026-09-28' as const,
    status: 'QA_CANDIDATE_ONLY' as const,
    sourceShellTrianglesPerSide: 102,
    collisionQueryCandidateTrianglesPerSide: 102,
    broadNavigationCandidateTrianglesPerSide:
      UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS.length,
    thinEdgeNavigationTrianglesExcludedPerSide:
      UNDERTOW_UPPER_GLASS_THIN_EDGE_TRIANGLE_IDS.length,
    directlySupportedBroadComponentAreasSquareMeters: directProbeAreas,
    usesExactGlass01ShellForCollisionQueryCandidate: true,
    usesOnlyDirectlySupportedBroadUpwardFacesForNavigationCandidate: true,
    thinEdgeStripNavigationExcluded: true,
    originalGameCollisionPrimitiveIdentityResolved: false,
    originalGameCameraPrimitiveIdentityResolved: false,
    collisionQueryRuntimePromotionAuthorized: false,
    navigationRuntimePromotionAuthorized: false,
    activationBlockersCleared: [] as const,
    userActionRequiredNow: false,
    confidence: 'HIGH' as const,
    notes:
      'Pass 15A creates an inert role-separated candidate so implementation behavior can be QA-tested without pretending the original hidden primitive is known. The exact Glass01 shell is only a collision/query candidate. Navigation is narrower: it uses the three broad upward components independently traversed in Pass 13A and excludes the untested 1.248m² thin edge strip.'
  });

export function undertowUpperGlassReconstructionCandidateErrors():
  readonly string[] {
  const a = UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_AUDIT;
  const errors: string[] = [];

  if (
    a.status !== 'QA_CANDIDATE_ONLY' ||
    a.sourceShellTrianglesPerSide !== 102 ||
    a.collisionQueryCandidateTrianglesPerSide !== 102 ||
    a.broadNavigationCandidateTrianglesPerSide !== 46 ||
    a.thinEdgeNavigationTrianglesExcludedPerSide !== 2
  ) {
    errors.push('Pass 15A candidate triangle accounting drifted');
  }

  if (
    a.directlySupportedBroadComponentAreasSquareMeters.length !== 3 ||
    Math.abs(a.directlySupportedBroadComponentAreasSquareMeters[0]! - 33.509603) >
      1e-6 ||
    Math.abs(a.directlySupportedBroadComponentAreasSquareMeters[1]! - 27.06649) >
      1e-6 ||
    Math.abs(a.directlySupportedBroadComponentAreasSquareMeters[2]! - 12.602506) >
      1e-6
  ) {
    errors.push('Pass 15A broad support-component binding drifted');
  }

  if (
    !a.usesExactGlass01ShellForCollisionQueryCandidate ||
    !a.usesOnlyDirectlySupportedBroadUpwardFacesForNavigationCandidate ||
    !a.thinEdgeStripNavigationExcluded
  ) {
    errors.push('Pass 15A role separation drifted');
  }

  if (
    a.originalGameCollisionPrimitiveIdentityResolved ||
    a.originalGameCameraPrimitiveIdentityResolved ||
    a.collisionQueryRuntimePromotionAuthorized ||
    a.navigationRuntimePromotionAuthorized ||
    a.activationBlockersCleared.length !== 0 ||
    a.userActionRequiredNow
  ) {
    errors.push('Pass 15A QA candidate must not clear production authority');
  }

  const collisionCandidates =
    UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_SOLIDS.filter(
      (solid) => solid.id.includes('collision-query-candidate')
    );
  const navigationCandidates =
    UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_SOLIDS.filter(
      (solid) => solid.id.includes('broad-navigation-candidate')
    );
  if (
    collisionCandidates.length !== 2 ||
    navigationCandidates.length !== 2 ||
    collisionCandidates.some(
      (solid) =>
        !solid.collisionEnabled ||
        solid.navigationEnabled !== false ||
        !solid.projectileBlocker ||
        !solid.cameraBlocker ||
        solid.render
    ) ||
    navigationCandidates.some(
      (solid) =>
        solid.collisionEnabled !== false ||
        !solid.navigationEnabled ||
        solid.projectileBlocker ||
        solid.cameraBlocker ||
        solid.render ||
        solid.triangleMesh?.indices.length !== 138
    )
  ) {
    errors.push('Pass 15A role-separated candidate solid flags drifted');
  }

  return errors;
}

export function undertowUpperGlassReconstructionQaStage(): StageDefinition {
  const package_ = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  const navigationCandidates =
    UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_SOLIDS.filter(
      (solid) => solid.id.includes('broad-navigation-candidate')
    );
  return {
    metadata: {
      id: 'undertow-t21d-upper-glass-reconstruction-qa',
      displayName: 'Undertow T21-D Upper Glass Reconstruction QA',
      worldBounds: package_.worldBounds,
      teamASpawn: package_.teamASpawnFloorPoint,
      teamBSpawn: package_.teamBSpawnFloorPoint,
      teamASpawnSlots: [package_.teamASpawnFloorPoint],
      teamBSpawnSlots: [package_.teamBSpawnFloorPoint],
      tacticalNodes: [],
      splatZones: []
    },
    solids: navigationCandidates,
    paintSurfaces: [],
    navigationLinks: []
  };
}
