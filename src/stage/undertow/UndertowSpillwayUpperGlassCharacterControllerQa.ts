import type {
  StageDefinition,
  StageSolidDefinition,
  StageTriangleMeshGeometry
} from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES
} from './UndertowSpillwayUpperGlassPhysicsQueryQa';
import {
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES,
  type UndertowUpperGlassMeshRecord
} from './UndertowSpillwayUpperGlassMeshGeometry';

export const UNDERTOW_UPPER_GLASS_PASS15C_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS =
  Object.freeze([94, 95, 96, 97, 98, 99, 100, 101] as const);

export const UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_TRIANGLE_IDS =
  Object.freeze(Array.from({ length: 94 }, (_, triangleId) => triangleId));

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
        `upper-glass Pass 15C triangle ${triangleId} is outside the source mesh`
      );
    }
    indices.push(a, b, c);
  }
  return {
    vertices: mesh.vertices,
    indices
  };
}

export function undertowUpperGlassPass15cSolidId(
  side: UndertowUpperGlassMeshRecord['side']
): string {
  const source = UNDERTOW_UPPER_GLASS_SOURCE_MESHES.find(
    (record) => record.side === side
  );
  if (!source) throw new Error(`missing upper-glass source for ${side}`);
  return `UndertowT21D:${source.id}:pass15c-broad-collision-query-candidate`;
}

function broadCollisionCandidate(
  record: UndertowUpperGlassMeshRecord
): StageSolidDefinition {
  const triangleMesh = submeshByTriangleIds(
    record.mesh,
    UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_TRIANGLE_IDS
  );
  return {
    id: undertowUpperGlassPass15cSolidId(record.side),
    center: [0, 0, 0],
    size: [
      Math.max(...triangleMesh.vertices.map((v) => v[0])) -
        Math.min(...triangleMesh.vertices.map((v) => v[0])),
      Math.max(...triangleMesh.vertices.map((v) => v[1])) -
        Math.min(...triangleMesh.vertices.map((v) => v[1])),
      Math.max(...triangleMesh.vertices.map((v) => v[2])) -
        Math.min(...triangleMesh.vertices.map((v) => v[2]))
    ],
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

export const UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_SOLIDS:
  readonly StageSolidDefinition[] = Object.freeze(
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES.map(broadCollisionCandidate)
);

export function undertowUpperGlassPass15cQaStage(): StageDefinition {
  return {
    metadata: {
      id: 'undertow-t21d-upper-glass-pass15c-character-controller-qa',
      displayName: 'Undertow T21-D Upper Glass Pass 15C Character Controller QA',
      worldBounds: {
        minX: -20,
        maxX: 20,
        minZ: -20,
        maxZ: 20
      },
      teamASpawn: [0, 0, 0],
      teamBSpawn: [0, 0, 0],
      teamASpawnSlots: [[0, 0, 0]],
      teamBSpawnSlots: [[0, 0, 0]],
      tacticalNodes: [],
      splatZones: []
    },
    solids: UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_SOLIDS,
    paintSurfaces: [],
    navigationLinks: []
  };
}

export const UNDERTOW_UPPER_GLASS_PASS15C_RECONSTRUCTION_AUTHORITY_AUDIT =
  Object.freeze({
    resolutionPass: '15C' as const,
    auditedAt: '2026-09-28' as const,
    scope: 'BROAD_RECONSTRUCTION_RUNTIME_AUTHORITY' as const,
    sourceShellTrianglesPerSide: 102,
    broadCollisionQueryTrianglesPerSide: 94,
    excludedThinEdgeFrameNeighborhoodTrianglesPerSide:
      UNDERTOW_UPPER_GLASS_PASS15C_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS.length,
    excludedThinEdgeUndersideTriangleIds: [94, 95] as const,
    excludedFrameBoundaryCapTriangleIds: [96, 97, 100, 101] as const,
    excludedThinEdgeUpwardTriangleIds: [98, 99] as const,
    retainedBroadLateralProbeTriangleId: 92,
    geometryProbeCount: UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES.length,
    dynamicCharacterModes: ['HUMAN', 'SQUID'] as const,
    expectedDynamicCharacterProbeCount:
      UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES.length * 2,
    usesSharedProductionCharacterControllerConfiguration: true,
    validatesBroadTopSupportWithDynamicController: true,
    validatesBroadUndersideBlockingWithDynamicController: true,
    validatesBroadLateralBlockingWithDynamicController: true,
    broadPlayerCollisionReconstructionAuthorityFrozen: true,
    broadProjectileQueryReconstructionAuthorityFrozen: true,
    broadCameraQueryReconstructionAuthorityFrozen: true,
    exactOriginalCollisionPrimitiveIdentityResolved: false,
    exactOriginalCameraPrimitiveIdentityResolved: false,
    exactOriginalPrimitiveIdentityRequiredForBroadReconstructionFreeze: false,
    thinEdgeStripOneForOneAuthorityResolved: false,
    frameBoundaryOneForOneAuthorityResolved: false,
    wholeGlass01ShellRuntimePromotionAuthorized: false,
    thinEdgeFrameRuntimePromotionAuthorized: false,
    activationBlockersCleared: [] as const,
    activationBlockersNarrowedButRetained: [
      'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
      'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING'
    ] as const,
    productionStageActivationAuthorized: false,
    userActionRequiredNow: false,
    confidence: 'HIGH' as const,
    notes:
      'Pass 15C freezes only the broad reconstruction behavior that is supported by Passes 13A-13F plus the actual browser-ink-tps Rapier controller/query paths. The exact original hidden primitive is deliberately not claimed. The source-local thin-edge/frame neighborhood (triangles 94-101) remains excluded from the freeze candidate, so both activation blockers stay active but are narrowed to that unresolved boundary scope.'
  });

export function undertowUpperGlassPass15cAuthorityAuditErrors():
  readonly string[] {
  const a = UNDERTOW_UPPER_GLASS_PASS15C_RECONSTRUCTION_AUTHORITY_AUDIT;
  const errors: string[] = [];

  if (
    a.resolutionPass !== '15C' ||
    a.sourceShellTrianglesPerSide !== 102 ||
    a.broadCollisionQueryTrianglesPerSide !== 94 ||
    a.excludedThinEdgeFrameNeighborhoodTrianglesPerSide !== 8 ||
    a.geometryProbeCount !== 6 ||
    a.expectedDynamicCharacterProbeCount !== 12
  ) {
    errors.push('Pass 15C reconstruction authority accounting drifted');
  }

  if (
    UNDERTOW_UPPER_GLASS_PASS15C_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS.join(',') !==
      '94,95,96,97,98,99,100,101' ||
    a.excludedThinEdgeUpwardTriangleIds.join(',') !== '98,99' ||
    a.retainedBroadLateralProbeTriangleId !== 92
  ) {
    errors.push('Pass 15C thin-edge/frame source-neighborhood boundary drifted');
  }

  if (
    !a.usesSharedProductionCharacterControllerConfiguration ||
    !a.validatesBroadTopSupportWithDynamicController ||
    !a.validatesBroadUndersideBlockingWithDynamicController ||
    !a.validatesBroadLateralBlockingWithDynamicController ||
    !a.broadPlayerCollisionReconstructionAuthorityFrozen ||
    !a.broadProjectileQueryReconstructionAuthorityFrozen ||
    !a.broadCameraQueryReconstructionAuthorityFrozen
  ) {
    errors.push('Pass 15C broad reconstruction authority must remain frozen');
  }

  if (
    a.exactOriginalCollisionPrimitiveIdentityResolved ||
    a.exactOriginalCameraPrimitiveIdentityResolved ||
    a.exactOriginalPrimitiveIdentityRequiredForBroadReconstructionFreeze ||
    a.thinEdgeStripOneForOneAuthorityResolved ||
    a.frameBoundaryOneForOneAuthorityResolved ||
    a.wholeGlass01ShellRuntimePromotionAuthorized ||
    a.thinEdgeFrameRuntimePromotionAuthorized ||
    a.activationBlockersCleared.length !== 0 ||
    a.productionStageActivationAuthorized ||
    a.userActionRequiredNow
  ) {
    errors.push('Pass 15C must not overclaim original or thin-edge/frame authority');
  }

  if (
    !UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers.includes(
      'UPPER_GLASS_COLLISION_AUTHORITY_PENDING'
    ) ||
    !UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers.includes(
      'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING'
    )
  ) {
    errors.push('Pass 15C must retain both upper-glass activation blockers');
  }

  if (
    UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_SOLIDS.length !== 2 ||
    UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_SOLIDS.some(
      (solid) =>
        !solid.collisionEnabled ||
        solid.navigationEnabled !== false ||
        !solid.projectileBlocker ||
        !solid.cameraBlocker ||
        solid.render ||
        solid.triangleMesh?.indices.length !== 94 * 3
    )
  ) {
    errors.push('Pass 15C broad collision/query candidate flags drifted');
  }

  return errors;
}
