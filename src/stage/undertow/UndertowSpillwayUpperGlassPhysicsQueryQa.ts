import type {
  StageDefinition,
  StageTriangleMeshGeometry,
  StageVector3
} from '../StageDefinition';
import {
  UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_AUDIT,
  UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_SOLIDS,
  UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D
} from './UndertowSpillwayUpperGlassReconstructionCandidate';
import {
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES,
  type UndertowUpperGlassMeshRecord
} from './UndertowSpillwayUpperGlassMeshGeometry';
import { UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT } from './UndertowSpillwayGlassCollisionAuthorityAudit';

export type UndertowUpperGlassPhysicsProbeKind =
  | 'TOP_TO_UNDERSIDE'
  | 'UNDERSIDE_TO_TOP'
  | 'SIDE_CROSSING';

export interface UndertowUpperGlassPhysicsProbe {
  id: string;
  side: UndertowUpperGlassMeshRecord['side'];
  kind: UndertowUpperGlassPhysicsProbeKind;
  from: StageVector3;
  to: StageVector3;
  expectedSolidId: string;
  notes: string;
}

function triangle(
  mesh: StageTriangleMeshGeometry,
  triangleId: number
): readonly [StageVector3, StageVector3, StageVector3] {
  const base = triangleId * 3;
  const ai = mesh.indices[base];
  const bi = mesh.indices[base + 1];
  const ci = mesh.indices[base + 2];
  if (ai === undefined || bi === undefined || ci === undefined) {
    throw new Error(`upper-glass triangle ${triangleId} is outside the source mesh`);
  }
  return [mesh.vertices[ai]!, mesh.vertices[bi]!, mesh.vertices[ci]!];
}

function normal(
  [a, b, c]: readonly [StageVector3, StageVector3, StageVector3]
): StageVector3 {
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const uz = b[2] - a[2];
  const vx = c[0] - a[0];
  const vy = c[1] - a[1];
  const vz = c[2] - a[2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const length = Math.hypot(nx, ny, nz);
  if (length <= 1e-8) throw new Error('upper-glass QA side triangle is degenerate');
  return [nx / length, ny / length, nz / length];
}

function centroid(
  [a, b, c]: readonly [StageVector3, StageVector3, StageVector3]
): StageVector3 {
  return [
    (a[0] + b[0] + c[0]) / 3,
    (a[1] + b[1] + c[1]) / 3,
    (a[2] + b[2] + c[2]) / 3
  ];
}

function addScaled(
  point: StageVector3,
  direction: StageVector3,
  scale: number
): StageVector3 {
  return [
    point[0] + direction[0] * scale,
    point[1] + direction[1] * scale,
    point[2] + direction[2] * scale
  ];
}

function collisionCandidateId(
  side: UndertowUpperGlassMeshRecord['side']
): string {
  const source = UNDERTOW_UPPER_GLASS_SOURCE_MESHES.find(
    (record) => record.side === side
  );
  if (!source) throw new Error(`missing upper-glass source for ${side}`);
  return `UndertowT21D:${source.id}:collision-query-candidate`;
}

function sideProbe(
  record: UndertowUpperGlassMeshRecord
): UndertowUpperGlassPhysicsProbe {
  // Triangle 92 is a broad vertical Glass01 side face on both mirrored shells.
  // Its centroid is used only as an internal deterministic QA target.
  const tri = triangle(record.mesh, 92);
  const n = normal(tri);
  const center = centroid(tri);
  return {
    id: `${record.side.toLowerCase()}-side-crossing`,
    side: record.side,
    kind: 'SIDE_CROSSING',
    from: addScaled(center, n, 1.2),
    to: addScaled(center, n, -1.2),
    expectedSolidId: collisionCandidateId(record.side),
    notes:
      'Crosses the centroid of exact Glass01 source triangle 92 along that face normal; this checks the broad lateral wall/edge behavior already resolved in Pass 13F.'
  };
}

function verticalProbes(
  side: UndertowUpperGlassMeshRecord['side'],
  route: readonly StageVector3[]
): readonly UndertowUpperGlassPhysicsProbe[] {
  // Use the central broad connector route point because Pass 13A directly
  // observed support there on both sides and it is far from the thin edge strip.
  const point = route[1]!;
  const span = 1.5;
  const upper: StageVector3 = [point[0], point[1] + span, point[2]];
  const lower: StageVector3 = [point[0], point[1] - span, point[2]];
  const expectedSolidId = collisionCandidateId(side);
  return [
    {
      id: `${side.toLowerCase()}-top-to-underside`,
      side,
      kind: 'TOP_TO_UNDERSIDE',
      from: upper,
      to: lower,
      expectedSolidId,
      notes:
        'Crosses the directly verified broad connector component from above to below.'
    },
    {
      id: `${side.toLowerCase()}-underside-to-top`,
      side,
      kind: 'UNDERSIDE_TO_TOP',
      from: lower,
      to: upper,
      expectedSolidId,
      notes:
        'Crosses the same broad connector component from below to above, matching the Pass 13F underside-blocking semantic.'
    }
  ];
}

const positiveSource = UNDERTOW_UPPER_GLASS_SOURCE_MESHES.find(
  (record) => record.side === 'POSITIVE_Z'
)!;
const negativeSource = UNDERTOW_UPPER_GLASS_SOURCE_MESHES.find(
  (record) => record.side === 'NEGATIVE_Z'
)!;

export const UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES:
  readonly UndertowUpperGlassPhysicsProbe[] = Object.freeze([
  ...verticalProbes(
    'POSITIVE_Z',
    UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.positiveZ
  ),
  sideProbe(positiveSource),
  ...verticalProbes(
    'NEGATIVE_Z',
    UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.negativeZ
  ),
  sideProbe(negativeSource)
]);

export function undertowUpperGlassPass15bPhysicsQaStage(): StageDefinition {
  const collisionCandidates =
    UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_SOLIDS.filter(
      (solid) => solid.id.includes('collision-query-candidate')
    );
  return {
    metadata: {
      id: 'undertow-t21d-upper-glass-pass15b-physics-qa',
      displayName: 'Undertow T21-D Upper Glass Pass 15B Physics QA',
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
    solids: collisionCandidates,
    paintSurfaces: [],
    navigationLinks: []
  };
}

export const UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_QUERY_AUDIT =
  Object.freeze({
    resolutionPass: '15B' as const,
    auditedAt: '2026-09-28' as const,
    scope: 'QA_CANDIDATE_MECHANICAL_VALIDATION' as const,
    geometryProbeCount: UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES.length,
    probesPerSide: 3,
    queryPurposes: ['ink-projectile', 'thrown-sub', 'camera'] as const,
    expectedQueryHitCount:
      UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES.length * 3,
    characterModes: ['HUMAN', 'SQUID'] as const,
    expectedCharacterFilterAllowCount:
      UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES.length * 2,
    validatesTopBlocking: true,
    validatesUndersideBlocking: true,
    validatesBroadSideBlocking: true,
    validatesOrdinaryInkProjectileBlocking: true,
    validatesThrownSubBodyBlocking: true,
    validatesCameraBlocking: true,
    validatesDynamicCharacterControllerResolution: false,
    validatesThinEdgeStripCollisionOneForOne: false,
    validatesFrameBoundaryOneForOne: false,
    exactOriginalCollisionPrimitiveIdentityResolved: false,
    exactOriginalCameraPrimitiveIdentityResolved: false,
    runtimePromotionAuthorized: false,
    activationBlockersCleared: [] as const,
    userActionRequiredNow: false,
    confidence: 'HIGH' as const,
    notes:
      'Pass 15B validates that the Pass 15A Glass01 reconstruction candidate is mechanically compatible with the already-confirmed broad player/projectile/camera semantics in the actual Rapier stage-query path. It does not prove that Glass01 is the original hidden primitive, does not exercise a dynamic player capsule/controller resolution loop, and does not promote the untested thin edge/frame boundary.'
  });

export function undertowUpperGlassPass15bPhysicsQueryAuditErrors():
  readonly string[] {
  const a = UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_QUERY_AUDIT;
  const errors: string[] = [];

  if (
    UNDERTOW_UPPER_GLASS_RECONSTRUCTION_CANDIDATE_AUDIT.status !==
      'QA_CANDIDATE_ONLY' ||
    a.resolutionPass !== '15B' ||
    a.geometryProbeCount !== 6 ||
    a.probesPerSide !== 3 ||
    a.expectedQueryHitCount !== 18 ||
    a.expectedCharacterFilterAllowCount !== 12
  ) {
    errors.push('Pass 15B QA accounting drifted');
  }

  const kinds = new Set(
    UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES.map((probe) => probe.kind)
  );
  if (
    kinds.size !== 3 ||
    !kinds.has('TOP_TO_UNDERSIDE') ||
    !kinds.has('UNDERSIDE_TO_TOP') ||
    !kinds.has('SIDE_CROSSING')
  ) {
    errors.push('Pass 15B must retain top/underside/side probes');
  }

  for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
    if (
      UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES.filter(
        (probe) => probe.side === side
      ).length !== 3
    ) {
      errors.push(`${side}: expected exactly three broad physics probes`);
    }
  }

  const authority = UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT;
  if (
    !authority.playerBroadSolidBehaviorResolved ||
    !authority.projectileSemanticEvidence.currentOrdinaryMainProjectileBehaviorResolved ||
    authority.projectileSemanticEvidence.currentOrdinaryMainProjectilePassesThroughGlass ||
    !authority.projectileSemanticEvidence.thrownSubBodyCollisionResolved ||
    authority.projectileSemanticEvidence.thrownSubBodyPassesThroughGlass ||
    !authority.cameraQueryBehaviorResolved ||
    !authority.cameraTransparentGlassBlocksThirdPersonCamera
  ) {
    errors.push('Pass 15B requires the already-resolved Pass 13 broad gameplay semantics');
  }

  if (
    !a.validatesTopBlocking ||
    !a.validatesUndersideBlocking ||
    !a.validatesBroadSideBlocking ||
    !a.validatesOrdinaryInkProjectileBlocking ||
    !a.validatesThrownSubBodyBlocking ||
    !a.validatesCameraBlocking
  ) {
    errors.push('Pass 15B intended QA roles drifted');
  }

  if (
    a.validatesDynamicCharacterControllerResolution ||
    a.validatesThinEdgeStripCollisionOneForOne ||
    a.validatesFrameBoundaryOneForOne ||
    a.exactOriginalCollisionPrimitiveIdentityResolved ||
    a.exactOriginalCameraPrimitiveIdentityResolved ||
    a.runtimePromotionAuthorized ||
    a.activationBlockersCleared.length !== 0 ||
    a.userActionRequiredNow
  ) {
    errors.push('Pass 15B must not overclaim unresolved primitive/controller authority');
  }

  return errors;
}
