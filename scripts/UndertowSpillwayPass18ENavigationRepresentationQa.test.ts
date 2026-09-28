import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { NavMeshQuery, init as initRecast } from 'recast-navigation';
import { generateSoloNavMesh } from 'recast-navigation/generators';
import { GAME_CONFIG } from '../src/config/game/gameConfig';
import { PLAYER_CHARACTER_PHYSICS } from '../src/player/PlayerCharacterPhysics';
import {
  PRODUCTION_STAGE_DEFINITION,
  type StageTriangleMeshGeometry,
  type StageVector3
} from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAVIGATION_SOLIDS,
  undertowUpperGlassPass15dNavigationSolidId
} from '../src/stage/undertow/UndertowSpillwayUpperGlassRuntimeGeometry';

interface FixtureMesh {
  vertices: StageVector3[];
  indices: number[];
}

interface GrateFixture {
  mesh: FixtureMesh;
  nearestWalkMesh: FixtureMesh | null;
}

interface GlassFixture {
  broadMesh: FixtureMesh;
  bridgeMesh: FixtureMesh;
  nearestNonBridgeMesh: FixtureMesh | null;
}

interface Pass18eFixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  grates: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GrateFixture>;
  glass: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GlassFixture>;
}

interface ClosestVertexPair {
  aIndex: number;
  bIndex: number;
  distanceMeters: number;
}

interface RecastVariant {
  id: string;
  cs: number;
  ch: number;
  walkableClimb: number;
  walkableRadius: number;
}

interface PairResult {
  generated: boolean;
  forwardReached: boolean;
  reverseReached: boolean;
  forwardTrustedReached: boolean;
  reverseTrustedReached: boolean;
  forwardEndpointErrorMeters: number;
  reverseEndpointErrorMeters: number;
  forwardStartSnapMeters: number;
  forwardEndSnapMeters: number;
  reverseStartSnapMeters: number;
  reverseEndSnapMeters: number;
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';
const TRUSTED_SNAP_METERS = GAME_CONFIG.cpu.agentRadiusMeters;

const VARIANTS: readonly RecastVariant[] = Object.freeze([
  {
    id: 'production',
    cs: GAME_CONFIG.cpu.navigationCellSizeMeters,
    ch: GAME_CONFIG.cpu.navigationCellHeightMeters,
    walkableClimb: GAME_CONFIG.cpu.navigationWalkableClimbVoxels,
    walkableRadius: GAME_CONFIG.cpu.navigationWalkableRadiusVoxels
  },
  {
    id: 'production-zero-erosion',
    cs: GAME_CONFIG.cpu.navigationCellSizeMeters,
    ch: GAME_CONFIG.cpu.navigationCellHeightMeters,
    walkableClimb: GAME_CONFIG.cpu.navigationWalkableClimbVoxels,
    walkableRadius: 0
  },
  {
    id: 'production-one-voxel-erosion',
    cs: GAME_CONFIG.cpu.navigationCellSizeMeters,
    ch: GAME_CONFIG.cpu.navigationCellHeightMeters,
    walkableClimb: GAME_CONFIG.cpu.navigationWalkableClimbVoxels,
    walkableRadius: 1
  },
  {
    id: 'finer-same-erosion',
    cs: 0.12,
    ch: GAME_CONFIG.cpu.navigationCellHeightMeters,
    walkableClimb: GAME_CONFIG.cpu.navigationWalkableClimbVoxels,
    walkableRadius: 3
  },
  {
    id: 'finer-agent-radius',
    cs: 0.15,
    ch: GAME_CONFIG.cpu.navigationCellHeightMeters,
    walkableClimb: GAME_CONFIG.cpu.navigationWalkableClimbVoxels,
    walkableRadius: 2
  },
  {
    id: 'finer-zero-erosion',
    cs: 0.09,
    ch: GAME_CONFIG.cpu.navigationCellHeightMeters,
    walkableClimb: GAME_CONFIG.cpu.navigationWalkableClimbVoxels,
    walkableRadius: 0
  },
  {
    id: 'production-extra-climb-zero-erosion',
    cs: GAME_CONFIG.cpu.navigationCellSizeMeters,
    ch: GAME_CONFIG.cpu.navigationCellHeightMeters,
    walkableClimb: 8,
    walkableRadius: 0
  }
]);

function closestVertexPair(
  aMesh: StageTriangleMeshGeometry,
  bMesh: StageTriangleMeshGeometry
): ClosestVertexPair {
  let best: ClosestVertexPair | null = null;
  for (let ai = 0; ai < aMesh.vertices.length; ai += 1) {
    const a = aMesh.vertices[ai]!;
    for (let bi = 0; bi < bMesh.vertices.length; bi += 1) {
      const b = bMesh.vertices[bi]!;
      const distanceMeters = Math.hypot(
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
      );
      if (!best || distanceMeters < best.distanceMeters) {
        best = { aIndex: ai, bIndex: bi, distanceMeters };
      }
    }
  }
  if (!best) throw new Error('Pass 18E closest pair requires non-empty meshes');
  return best;
}

function triangleCentroidForVertex(
  mesh: StageTriangleMeshGeometry,
  vertexIndex: number
): StageVector3 {
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const tri = [mesh.indices[i]!, mesh.indices[i + 1]!, mesh.indices[i + 2]!];
    if (!tri.includes(vertexIndex)) continue;
    const a = mesh.vertices[tri[0]]!;
    const b = mesh.vertices[tri[1]]!;
    const c = mesh.vertices[tri[2]]!;
    return [
      (a[0] + b[0] + c[0]) / 3,
      (a[1] + b[1] + c[1]) / 3,
      (a[2] + b[2] + c[2]) / 3
    ];
  }
  throw new Error(`Pass 18E vertex ${vertexIndex} is not referenced`);
}

function insetSurfacePoint(
  mesh: StageTriangleMeshGeometry,
  vertexIndex: number,
  insetMeters = 0.08
): StageVector3 {
  const vertex = mesh.vertices[vertexIndex]!;
  const centroid = triangleCentroidForVertex(mesh, vertexIndex);
  const dx = centroid[0] - vertex[0];
  const dz = centroid[2] - vertex[2];
  const horizontal = Math.hypot(dx, dz);
  if (horizontal <= 1e-8) return vertex;
  const t = Math.min(0.45, insetMeters / horizontal);
  return [
    vertex[0] + dx * t,
    vertex[1] + (centroid[1] - vertex[1]) * t,
    vertex[2] + dz * t
  ];
}

function combinedSoup(
  meshes: readonly StageTriangleMeshGeometry[]
): { positions: number[]; indices: number[] } {
  const positions: number[] = [];
  const indices: number[] = [];
  for (const mesh of meshes) {
    const base = positions.length / 3;
    for (const vertex of mesh.vertices) {
      positions.push(vertex[0], vertex[1], vertex[2]);
    }
    for (const index of mesh.indices) indices.push(base + index);
  }
  return { positions, indices };
}

function dist(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function queryDirection(
  query: NavMeshQuery,
  from: StageVector3,
  to: StageVector3
): {
  reached: boolean;
  trustedReached: boolean;
  endpointErrorMeters: number;
  startSnapMeters: number;
  endSnapMeters: number;
} {
  const start = query.findClosestPoint({ x: from[0], y: from[1], z: from[2] });
  const end = query.findClosestPoint({ x: to[0], y: to[1], z: to[2] });
  if (!start.success || !end.success) {
    return {
      reached: false,
      trustedReached: false,
      endpointErrorMeters: Number.POSITIVE_INFINITY,
      startSnapMeters: Number.POSITIVE_INFINITY,
      endSnapMeters: Number.POSITIVE_INFINITY
    };
  }
  const pathResult = query.computePath(start.point, end.point);
  const path = pathResult.success ? pathResult.path : [];
  const last = path.length > 0 ? path[path.length - 1]! : null;
  const endpointErrorMeters = last ? dist(last, end.point) : Number.POSITIVE_INFINITY;
  const startSnapMeters = dist(
    { x: from[0], y: from[1], z: from[2] },
    start.point
  );
  const endSnapMeters = dist(
    { x: to[0], y: to[1], z: to[2] },
    end.point
  );
  const reached =
    pathResult.success &&
    path.length > 0 &&
    endpointErrorMeters <= 0.25;
  return {
    reached,
    trustedReached:
      reached &&
      startSnapMeters <= TRUSTED_SNAP_METERS &&
      endSnapMeters <= TRUSTED_SNAP_METERS,
    endpointErrorMeters,
    startSnapMeters,
    endSnapMeters
  };
}

function testPair(
  aMesh: StageTriangleMeshGeometry,
  bMesh: StageTriangleMeshGeometry,
  variant: RecastVariant
): PairResult {
  const pair = closestVertexPair(aMesh, bMesh);
  const a = insetSurfacePoint(aMesh, pair.aIndex);
  const b = insetSurfacePoint(bMesh, pair.bIndex);
  const { positions, indices } = combinedSoup([aMesh, bMesh]);
  const generated = generateSoloNavMesh(positions, indices, {
    cs: variant.cs,
    ch: variant.ch,
    walkableSlopeAngle: GAME_CONFIG.cpu.navigationMaxSlopeDegrees,
    walkableHeight: GAME_CONFIG.cpu.navigationWalkableHeightVoxels,
    walkableClimb: variant.walkableClimb,
    walkableRadius: variant.walkableRadius,
    maxEdgeLen: 24,
    maxSimplificationError: 1.1,
    minRegionArea: 0,
    mergeRegionArea: 0,
    maxVertsPerPoly: 6,
    detailSampleDist: 6,
    detailSampleMaxError: 1
  });
  if (!generated.success) {
    return {
      generated: false,
      forwardReached: false,
      reverseReached: false,
      forwardTrustedReached: false,
      reverseTrustedReached: false,
      forwardEndpointErrorMeters: Number.POSITIVE_INFINITY,
      reverseEndpointErrorMeters: Number.POSITIVE_INFINITY,
      forwardStartSnapMeters: Number.POSITIVE_INFINITY,
      forwardEndSnapMeters: Number.POSITIVE_INFINITY,
      reverseStartSnapMeters: Number.POSITIVE_INFINITY,
      reverseEndSnapMeters: Number.POSITIVE_INFINITY
    };
  }

  const query = new NavMeshQuery(generated.navMesh);
  const forward = queryDirection(query, a, b);
  const reverse = queryDirection(query, b, a);
  return {
    generated: true,
    forwardReached: forward.reached,
    reverseReached: reverse.reached,
    forwardTrustedReached: forward.trustedReached,
    reverseTrustedReached: reverse.trustedReached,
    forwardEndpointErrorMeters: forward.endpointErrorMeters,
    reverseEndpointErrorMeters: reverse.endpointErrorMeters,
    forwardStartSnapMeters: forward.startSnapMeters,
    forwardEndSnapMeters: forward.endSnapMeters,
    reverseStartSnapMeters: reverse.startSnapMeters,
    reverseEndSnapMeters: reverse.endSnapMeters
  };
}

beforeAll(async () => {
  await initRecast();
});

describe('T21 Pass 18E Recast representation sweep', () => {
  it('separates erosion/resolution/climb effects from the production-KCC continuity result', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(GAME_CONFIG.cpu.navigationCellSizeMeters).toBe(0.18);
    expect(GAME_CONFIG.cpu.navigationWalkableRadiusVoxels).toBe(2);
    expect(PLAYER_CHARACTER_PHYSICS.humanRadiusMeters).toBe(0.32);

    if (!fixturePath) return;

    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as Pass18eFixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const results: Record<string, Record<string, PairResult>> = {};
    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const grate = fixture.grates[side];
      const glass = fixture.glass[side];
      expect(grate.nearestWalkMesh).not.toBeNull();
      expect(glass.nearestNonBridgeMesh).not.toBeNull();

      for (const variant of VARIANTS) {
        const bucket = results[variant.id] ??= {};
        bucket[`grate-floor:${side}`] = testPair(
          grate.mesh,
          grate.nearestWalkMesh!,
          variant
        );
        bucket[`glass-bridge:${side}`] = testPair(
          glass.broadMesh,
          glass.bridgeMesh,
          variant
        );
        bucket[`bridge-floor:${side}`] = testPair(
          glass.bridgeMesh,
          glass.nearestNonBridgeMesh!,
          variant
        );
      }
    }

    const summary = VARIANTS.map((variant) => {
      const pairResults = Object.values(results[variant.id]!);
      return {
        id: variant.id,
        cs: variant.cs,
        ch: variant.ch,
        walkableClimb: variant.walkableClimb,
        walkableRadius: variant.walkableRadius,
        nominalErosionMeters: variant.cs * variant.walkableRadius,
        generatedPairs: pairResults.filter((result) => result.generated).length,
        bidirectionallyReachedPairs: pairResults.filter(
          (result) => result.forwardReached && result.reverseReached
        ).length,
        directionReachCount: pairResults.reduce(
          (sum, result) =>
            sum +
            Number(result.forwardReached) +
            Number(result.reverseReached),
          0
        ),
        trustedBidirectionallyReachedPairs: pairResults.filter(
          (result) =>
            result.forwardTrustedReached && result.reverseTrustedReached
        ).length,
        trustedDirectionReachCount: pairResults.reduce(
          (sum, result) =>
            sum +
            Number(result.forwardTrustedReached) +
            Number(result.reverseTrustedReached),
          0
        )
      };
    });

    const productionVariant = VARIANTS.find(
      (variant) => variant.id === 'production'
    )!;
    const runtimeBroadVsBridge: Record<string, PairResult> = {};
    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const runtimeSolid = UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAVIGATION_SOLIDS.find(
        (solid) => solid.id === undertowUpperGlassPass15dNavigationSolidId(side)
      );
      if (!runtimeSolid?.triangleMesh) {
        throw new Error(`Pass 18E missing runtime broad glass nav mesh for ${side}`);
      }
      runtimeBroadVsBridge[side] = testPair(
        runtimeSolid.triangleMesh,
        fixture.glass[side].bridgeMesh,
        productionVariant
      );
    }

    console.log(
      'T21PASS18E_RECAST_SWEEP',
      JSON.stringify({
        trustedSnapMeters: TRUSTED_SNAP_METERS,
        productionKccDirectedCrossingsPass18D: 12,
        productionKccAirborneTicksPass18D: 0,
        variants: summary,
        runtimeBroadVsBridge,
        results
      })
    );

    expect(Object.keys(results)).toHaveLength(VARIANTS.length);
    expect(
      Object.values(results.production!).length
    ).toBe(6);
    expect(
      Object.values(results.production!).every((result) => result.generated)
    ).toBe(true);
    expect(TRUSTED_SNAP_METERS).toBe(0.30);
    expect(Object.values(runtimeBroadVsBridge)).toHaveLength(2);
  });
});
