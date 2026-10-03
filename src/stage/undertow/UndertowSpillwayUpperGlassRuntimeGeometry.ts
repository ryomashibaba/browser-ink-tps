import type {
  StageSolidDefinition,
  StageTriangleMeshGeometry,
  StageVector3
} from '../StageDefinition';
import {
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES,
  type UndertowUpperGlassMeshRecord
} from './UndertowSpillwayUpperGlassMeshGeometry';

/**
 * Pass 15D promotes only the reconstruction-authorized broad subset into the
 * inert T21 runtime package.
 *
 * It deliberately does NOT claim that the original game uses these exact
 * Glass01 triangles as its hidden collision primitive.
 */
export const UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_TRIANGLE_IDS =
  Object.freeze(Array.from({ length: 94 }, (_, triangleId) => triangleId));

export const UNDERTOW_UPPER_GLASS_PASS15D_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS =
  Object.freeze([94, 95, 96, 97, 98, 99, 100, 101] as const);

/**
 * Pass 13A directly verified only these three broad upward components.
 * The 1.248m² thin edge strip (source triangles 98/99) stays excluded.
 */
export const UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAV_TRIANGLE_IDS =
  Object.freeze([
    0, 1, 2, 3, 4, 5, 6, 7,
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    30, 31, 32, 33, 34, 35, 36, 37,
    38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
    48, 49, 50, 51, 52, 53
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
      throw new Error(
        `upper-glass Pass 15D triangle ${triangleId} is outside the source mesh`
      );
    }
    indices.push(a, b, c);
  }
  return {
    vertices: mesh.vertices,
    indices
  };
}

function meshSize(vertices: readonly StageVector3[]): StageVector3 {
  const xs = vertices.map((vertex) => vertex[0]);
  const ys = vertices.map((vertex) => vertex[1]);
  const zs = vertices.map((vertex) => vertex[2]);
  return [
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    Math.max(...zs) - Math.min(...zs)
  ];
}

export function undertowUpperGlassPass15dCollisionSolidId(
  side: UndertowUpperGlassMeshRecord['side']
): string {
  const source = UNDERTOW_UPPER_GLASS_SOURCE_MESHES.find(
    (record) => record.side === side
  );
  if (!source) throw new Error(`missing upper-glass source for ${side}`);
  return `UndertowT21D:${source.id}:pass15d-broad-collision-query-runtime`;
}

export function undertowUpperGlassPass15dNavigationSolidId(
  side: UndertowUpperGlassMeshRecord['side']
): string {
  const source = UNDERTOW_UPPER_GLASS_SOURCE_MESHES.find(
    (record) => record.side === side
  );
  if (!source) throw new Error(`missing upper-glass source for ${side}`);
  return `UndertowT21D:${source.id}:pass15d-broad-navigation-runtime`;
}

function broadCollisionSolid(
  record: UndertowUpperGlassMeshRecord
): StageSolidDefinition {
  const triangleMesh = submeshByTriangleIds(
    record.mesh,
    UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_TRIANGLE_IDS
  );
  return {
    id: undertowUpperGlassPass15dCollisionSolidId(record.side),
    center: [0, 0, 0],
    size: meshSize(triangleMesh.vertices),
    material: 'light',
    render: false,
    projectileBlocker: true,
    cameraBlocker: true,
    collisionEnabled: true,
    navigationEnabled: false,
    collisionBehavior: 'SOLID',
    triangleMesh
  };
}

function broadNavigationSolid(
  record: UndertowUpperGlassMeshRecord
): StageSolidDefinition {
  const triangleMesh = submeshByTriangleIds(
    record.mesh,
    UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAV_TRIANGLE_IDS
  );
  return {
    id: undertowUpperGlassPass15dNavigationSolidId(record.side),
    center: [0, 0, 0],
    size: meshSize(triangleMesh.vertices),
    material: 'light',
    render: false,
    projectileBlocker: false,
    cameraBlocker: false,
    collisionEnabled: false,
    navigationEnabled: true,
    triangleMesh
  };
}

export const UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_SOLIDS:
  readonly StageSolidDefinition[] = Object.freeze(
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES.map(broadCollisionSolid)
);

export const UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAVIGATION_SOLIDS:
  readonly StageSolidDefinition[] = Object.freeze(
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES.map(broadNavigationSolid)
);

export const UNDERTOW_UPPER_GLASS_PASS15D_RUNTIME_GEOMETRY_AUDIT =
  Object.freeze({
    resolutionPass: '15D' as const,
    auditedAt: '2026-09-28' as const,
    scope: 'INERT_RUNTIME_PROMOTION_OF_FROZEN_BROAD_RECONSTRUCTION' as const,
    sourceShellTrianglesPerSide: 102,
    broadCollisionTrianglesPerSide:
      UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_TRIANGLE_IDS.length,
    broadNavigationTrianglesPerSide:
      UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAV_TRIANGLE_IDS.length,
    excludedThinEdgeFrameTrianglesPerSide:
      UNDERTOW_UPPER_GLASS_PASS15D_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS.length,
    visualLayerRemainsFullSourceShell: true,
    broadCollisionLayerPromotedToInertPackage: true,
    broadNavigationLayerPromotedToInertPackage: true,
    paintAuthorityPromoted: false,
    scoreAuthorityPromoted: false,
    thinEdgeFrameCollisionPromoted: false,
    thinEdgeFrameNavigationPromoted: false,
    wholeGlass01CollisionPromoted: false,
    originalGamePrimitiveIdentityResolved: false,
    originalGamePrimitiveIdentityClaimed: false,
    productionStageActivationAuthorized: false,
    activationBlockersCleared: [] as const,
    userActionRequiredNow: false,
    confidence: 'HIGH' as const,
    notes:
      'Pass 15D turns the already-Frozen broad reconstruction behavior into inert runtime geometry only. Collision/query uses exact source triangles 0-93; navigation uses only the 46 directly supported broad upward triangles. Source triangles 94-101 remain outside collision/navigation authority. The full 102-triangle visual shell remains render-only, and no paint/score authority is created.'
  });

export function undertowUpperGlassPass15dRuntimeGeometryErrors():
  readonly string[] {
  const a = UNDERTOW_UPPER_GLASS_PASS15D_RUNTIME_GEOMETRY_AUDIT;
  const errors: string[] = [];

  if (
    a.resolutionPass !== '15D' ||
    a.sourceShellTrianglesPerSide !== 102 ||
    a.broadCollisionTrianglesPerSide !== 94 ||
    a.broadNavigationTrianglesPerSide !== 46 ||
    a.excludedThinEdgeFrameTrianglesPerSide !== 8
  ) {
    errors.push('Pass 15D upper-glass triangle accounting drifted');
  }

  if (
    UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_TRIANGLE_IDS.join(',') !==
      Array.from({ length: 94 }, (_, triangleId) => triangleId).join(',') ||
    UNDERTOW_UPPER_GLASS_PASS15D_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS.join(',') !==
      '94,95,96,97,98,99,100,101'
  ) {
    errors.push('Pass 15D broad/excluded source boundary drifted');
  }

  const collisionIds = new Set(
    UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_TRIANGLE_IDS
  );
  const navIds =
    UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAV_TRIANGLE_IDS;
  if (navIds.some((triangleId) => !collisionIds.has(triangleId))) {
    errors.push('Pass 15D navigation must stay inside broad collision authority');
  }
  if (
    navIds.some((triangleId) =>
      UNDERTOW_UPPER_GLASS_PASS15D_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS
        .includes(triangleId as 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101)
    )
  ) {
    errors.push('Pass 15D navigation included an excluded thin-edge/frame triangle');
  }

  if (
    UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_SOLIDS.length !== 2 ||
    UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_SOLIDS.some(
      (solid) =>
        !solid.collisionEnabled ||
        solid.navigationEnabled !== false ||
        !solid.projectileBlocker ||
        !solid.cameraBlocker ||
        solid.render ||
        solid.triangleMesh?.indices.length !== 94 * 3
    )
  ) {
    errors.push('Pass 15D collision/query role separation drifted');
  }

  if (
    UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAVIGATION_SOLIDS.length !== 2 ||
    UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAVIGATION_SOLIDS.some(
      (solid) =>
        solid.collisionEnabled !== false ||
        !solid.navigationEnabled ||
        solid.projectileBlocker ||
        solid.cameraBlocker ||
        solid.render ||
        solid.triangleMesh?.indices.length !== 46 * 3
    )
  ) {
    errors.push('Pass 15D navigation role separation drifted');
  }

  if (
    !a.visualLayerRemainsFullSourceShell ||
    !a.broadCollisionLayerPromotedToInertPackage ||
    !a.broadNavigationLayerPromotedToInertPackage ||
    a.paintAuthorityPromoted ||
    a.scoreAuthorityPromoted ||
    a.thinEdgeFrameCollisionPromoted ||
    a.thinEdgeFrameNavigationPromoted ||
    a.wholeGlass01CollisionPromoted ||
    a.originalGamePrimitiveIdentityResolved ||
    a.originalGamePrimitiveIdentityClaimed ||
    a.productionStageActivationAuthorized ||
    a.activationBlockersCleared.length !== 0 ||
    a.userActionRequiredNow
  ) {
    errors.push('Pass 15D authority boundary overclaimed');
  }

  return errors;
}
