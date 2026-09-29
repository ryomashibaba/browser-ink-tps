import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { PerformanceStats } from '../src/core/PerformanceStats';
import {
  RecastStageNavigation,
  initializeRecastNavigation
} from '../src/navigation/RecastStageNavigation';
import {
  PRODUCTION_STAGE_DEFINITION,
  type StageDefinition,
  type StageNavigationLinkDefinition,
  type StageSolidDefinition,
  type StageTriangleMeshGeometry,
  type StageVector3
} from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {
  undertowPass18bTraversableQaAnchors,
  vec3
} from '../src/stage/undertow/UndertowSpillwayConnectivityQa';

interface FixtureMesh {
  vertices: StageVector3[];
  indices: number[];
}

interface GrateFixture {
  anchor: StageVector3;
  mesh: FixtureMesh;
  nearestWalkMesh: FixtureMesh | null;
}

interface GlassFixture {
  broadMesh: FixtureMesh;
  bridgeMesh: FixtureMesh;
  nearestNonBridgeMesh: FixtureMesh | null;
}

interface Pass18fFixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  grates: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GrateFixture>;
  glass: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GlassFixture>;
}

interface ClosestSurfacePair {
  a: StageVector3;
  b: StageVector3;
  distanceMeters: number;
}

interface ClosestMeshPair extends ClosestSurfacePair {
  aTriangleCentroid: StageVector3;
  bTriangleCentroid: StageVector3;
}

interface TransitionEndpointPair {
  sourceStart: StageVector3;
  sourceEnd: StageVector3;
  start: StageVector3;
  end: StageVector3;
  sourceBoundaryDistanceMeters: number;
  endpointInsetMeters: number;
  startInsetActualMeters: number;
  endInsetActualMeters: number;
  endpointDistanceMeters: number;
}

interface MatrixRow {
  from: string;
  reached: string[];
}

interface MatrixSummary {
  reachedDirectedPairsIncludingSelf: number;
  weakComponentCount: number;
  stronglyConnectedComponentCount: number;
  isolatedAnchorIds: string[];
  rows: MatrixRow[];
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';
const LINK_RADII = [0.10, 0.18, 0.30] as const;
const NAV_ENDPOINT_INSET_METERS = 0.42;
const EPS = 1e-12;

function meshBounds(mesh: StageTriangleMeshGeometry): StageVector3 {
  const xs = mesh.vertices.map((vertex) => vertex[0]);
  const ys = mesh.vertices.map((vertex) => vertex[1]);
  const zs = mesh.vertices.map((vertex) => vertex[2]);
  return [
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    Math.max(...zs) - Math.min(...zs)
  ];
}

function navOnlySolid(
  id: string,
  mesh: StageTriangleMeshGeometry
): StageSolidDefinition {
  return {
    id,
    center: [0, 0, 0],
    size: meshBounds(mesh),
    material: 'light',
    render: false,
    projectileBlocker: false,
    cameraBlocker: false,
    collisionEnabled: false,
    navigationEnabled: true,
    triangleMesh: mesh
  };
}

function add(a: StageVector3, b: StageVector3): StageVector3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub(a: StageVector3, b: StageVector3): StageVector3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function mul(a: StageVector3, scalar: number): StageVector3 {
  return [a[0] * scalar, a[1] * scalar, a[2] * scalar];
}

function dot(a: StageVector3, b: StageVector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function distance(a: StageVector3, b: StageVector3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function closestPointOnTriangle(
  p: StageVector3,
  a: StageVector3,
  b: StageVector3,
  c: StageVector3
): StageVector3 {
  const ab = sub(b, a);
  const ac = sub(c, a);
  const ap = sub(p, a);
  const d1 = dot(ab, ap);
  const d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return a;

  const bp = sub(p, b);
  const d3 = dot(ab, bp);
  const d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return b;

  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    return add(a, mul(ab, v));
  }

  const cp = sub(p, c);
  const d5 = dot(ab, cp);
  const d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return c;

  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    return add(a, mul(ac, w));
  }

  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const bc = sub(c, b);
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
    return add(b, mul(bc, w));
  }

  const denom = 1 / (va + vb + vc);
  const v = vb * denom;
  const w = vc * denom;
  return add(a, add(mul(ab, v), mul(ac, w)));
}

function closestPointsOnSegments(
  p1: StageVector3,
  q1: StageVector3,
  p2: StageVector3,
  q2: StageVector3
): ClosestSurfacePair {
  const d1 = sub(q1, p1);
  const d2 = sub(q2, p2);
  const r = sub(p1, p2);
  const a = dot(d1, d1);
  const e = dot(d2, d2);
  const f = dot(d2, r);
  let sParam = 0;
  let tParam = 0;

  if (a <= EPS && e <= EPS) {
    return { a: p1, b: p2, distanceMeters: distance(p1, p2) };
  }
  if (a <= EPS) {
    tParam = Math.max(0, Math.min(1, f / e));
  } else {
    const c = dot(d1, r);
    if (e <= EPS) {
      sParam = Math.max(0, Math.min(1, -c / a));
    } else {
      const b = dot(d1, d2);
      const denom = a * e - b * b;
      if (Math.abs(denom) > EPS) {
        sParam = Math.max(0, Math.min(1, (b * f - c * e) / denom));
      }
      const tNominal = b * sParam + f;
      if (tNominal < 0) {
        tParam = 0;
        sParam = Math.max(0, Math.min(1, -c / a));
      } else if (tNominal > e) {
        tParam = 1;
        sParam = Math.max(0, Math.min(1, (b - c) / a));
      } else {
        tParam = tNominal / e;
      }
    }
  }

  const aPoint = add(p1, mul(d1, sParam));
  const bPoint = add(p2, mul(d2, tParam));
  return {
    a: aPoint,
    b: bPoint,
    distanceMeters: distance(aPoint, bPoint)
  };
}

function triangleClosestPair(
  a0: StageVector3,
  a1: StageVector3,
  a2: StageVector3,
  b0: StageVector3,
  b1: StageVector3,
  b2: StageVector3
): ClosestSurfacePair {
  let best: ClosestSurfacePair | null = null;
  const consider = (candidate: ClosestSurfacePair) => {
    if (!best || candidate.distanceMeters < best.distanceMeters) best = candidate;
  };

  for (const p of [a0, a1, a2]) {
    const q = closestPointOnTriangle(p, b0, b1, b2);
    consider({ a: p, b: q, distanceMeters: distance(p, q) });
  }
  for (const p of [b0, b1, b2]) {
    const q = closestPointOnTriangle(p, a0, a1, a2);
    consider({ a: q, b: p, distanceMeters: distance(q, p) });
  }

  const aEdges = [[a0, a1], [a1, a2], [a2, a0]] as const;
  const bEdges = [[b0, b1], [b1, b2], [b2, b0]] as const;
  for (const [ap, aq] of aEdges) {
    for (const [bp, bq] of bEdges) {
      consider(closestPointsOnSegments(ap, aq, bp, bq));
    }
  }

  if (!best) throw new Error('Pass 18F triangle closest pair failed');
  return best;
}

function triangleCentroid(
  a: StageVector3,
  b: StageVector3,
  c: StageVector3
): StageVector3 {
  return [
    (a[0] + b[0] + c[0]) / 3,
    (a[1] + b[1] + c[1]) / 3,
    (a[2] + b[2] + c[2]) / 3
  ];
}

function meshClosestPair(
  aMesh: StageTriangleMeshGeometry,
  bMesh: StageTriangleMeshGeometry
): ClosestMeshPair {
  let best: ClosestMeshPair | null = null;
  for (let ai = 0; ai < aMesh.indices.length; ai += 3) {
    const a0 = aMesh.vertices[aMesh.indices[ai]!]!;
    const a1 = aMesh.vertices[aMesh.indices[ai + 1]!]!;
    const a2 = aMesh.vertices[aMesh.indices[ai + 2]!]!;
    const aTriangleCentroid = triangleCentroid(a0, a1, a2);
    for (let bi = 0; bi < bMesh.indices.length; bi += 3) {
      const b0 = bMesh.vertices[bMesh.indices[bi]!]!;
      const b1 = bMesh.vertices[bMesh.indices[bi + 1]!]!;
      const b2 = bMesh.vertices[bMesh.indices[bi + 2]!]!;
      const candidate = triangleClosestPair(a0, a1, a2, b0, b1, b2);
      if (!best || candidate.distanceMeters < best.distanceMeters) {
        best = {
          ...candidate,
          aTriangleCentroid,
          bTriangleCentroid: triangleCentroid(b0, b1, b2)
        };
      }
    }
  }
  if (!best) throw new Error('Pass 18F mesh closest pair requires non-empty meshes');
  return best;
}

function insetTowardTriangleCentroid(
  boundary: StageVector3,
  centroid: StageVector3,
  insetMeters: number
): StageVector3 {
  const delta = sub(centroid, boundary);
  const length = Math.hypot(delta[0], delta[1], delta[2]);
  if (length <= EPS) return boundary;
  const move = Math.min(insetMeters, length * 0.80);
  return add(boundary, mul(delta, move / length));
}

function transitionEndpoints(
  aMesh: StageTriangleMeshGeometry,
  bMesh: StageTriangleMeshGeometry
): TransitionEndpointPair {
  const pair = meshClosestPair(aMesh, bMesh);
  const start = insetTowardTriangleCentroid(
    pair.a,
    pair.aTriangleCentroid,
    NAV_ENDPOINT_INSET_METERS
  );
  const end = insetTowardTriangleCentroid(
    pair.b,
    pair.bTriangleCentroid,
    NAV_ENDPOINT_INSET_METERS
  );
  return {
    sourceStart: pair.a,
    sourceEnd: pair.b,
    start,
    end,
    sourceBoundaryDistanceMeters: pair.distanceMeters,
    endpointInsetMeters: NAV_ENDPOINT_INSET_METERS,
    startInsetActualMeters: distance(pair.a, start),
    endInsetActualMeters: distance(pair.b, end),
    endpointDistanceMeters: distance(start, end)
  };
}

function sourceAnchors(fixture: Pass18fFixture) {
  const base = undertowPass18bTraversableQaAnchors().filter(
    (anchor) => anchor.kind !== 'GRATE'
  );
  return [
    ...base,
    {
      id: 'grate:UndertowT21D:negative-z-grate-mesh:0',
      kind: 'GRATE' as const,
      point: fixture.grates.NEGATIVE_Z.anchor
    },
    {
      id: 'grate:UndertowT21D:positive-z-grate-mesh:0',
      kind: 'GRATE' as const,
      point: fixture.grates.POSITIVE_Z.anchor
    }
  ];
}

function qaStage(
  id: string,
  solids: readonly StageSolidDefinition[],
  navigationLinks: readonly StageNavigationLinkDefinition[]
): StageDefinition {
  const base = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  return {
    metadata: {
      id,
      displayName: id,
      worldBounds: base.worldBounds,
      teamASpawn: base.teamASpawnFloorPoint,
      teamBSpawn: base.teamBSpawnFloorPoint,
      teamASpawnSlots: [base.teamASpawnFloorPoint],
      teamBSpawnSlots: [base.teamBSpawnFloorPoint],
      tacticalNodes: [],
      splatZones: []
    },
    solids,
    paintSurfaces: base.paintSurfaces,
    navigationLinks
  };
}

function matrixSummary(
  stage: StageDefinition,
  anchors: ReturnType<typeof sourceAnchors>
): MatrixSummary {
  const navigation = new RecastStageNavigation(stage, new PerformanceStats());
  const rows = anchors.map((from) => ({
    from: from.id,
    reached: anchors
      .filter((to) =>
        navigation.auditPath(vec3(from.point), vec3(to.point)).reachedTarget
      )
      .map((to) => to.id)
  }));
  const ids = rows.map((row) => row.from);
  const reach = new Map(rows.map((row) => [row.from, new Set(row.reached)] as const));

  const seenWeak = new Set<string>();
  let weakComponentCount = 0;
  for (const seed of ids) {
    if (seenWeak.has(seed)) continue;
    weakComponentCount += 1;
    const stack = [seed];
    seenWeak.add(seed);
    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const candidate of ids) {
        if (seenWeak.has(candidate)) continue;
        if (
          reach.get(current)!.has(candidate) ||
          reach.get(candidate)!.has(current)
        ) {
          seenWeak.add(candidate);
          stack.push(candidate);
        }
      }
    }
  }

  const remaining = new Set(ids);
  let stronglyConnectedComponentCount = 0;
  while (remaining.size > 0) {
    const seed = remaining.values().next().value as string;
    stronglyConnectedComponentCount += 1;
    for (const candidate of [...remaining]) {
      if (
        reach.get(seed)!.has(candidate) &&
        reach.get(candidate)!.has(seed)
      ) {
        remaining.delete(candidate);
      }
    }
  }

  return {
    reachedDirectedPairsIncludingSelf: rows.reduce(
      (sum, row) => sum + row.reached.length,
      0
    ),
    weakComponentCount,
    stronglyConnectedComponentCount,
    isolatedAnchorIds: rows
      .filter((row) => row.reached.length === 1 && row.reached[0] === row.from)
      .map((row) => row.from),
    rows
  };
}

function connector(
  id: string,
  endpoints: TransitionEndpointPair,
  radiusMeters: number,
  bidirectional = true,
  userId?: number
): StageNavigationLinkDefinition {
  return {
    id,
    start: endpoints.start,
    end: endpoints.end,
    radiusMeters,
    bidirectional,
    ...(userId === undefined ? {} : { userId })
  };
}

function pairConnected(
  matrix: MatrixSummary,
  a: string,
  b: string
): boolean {
  const aRow = matrix.rows.find((row) => row.from === a);
  const bRow = matrix.rows.find((row) => row.from === b);
  return Boolean(aRow?.reached.includes(b) && bRow?.reached.includes(a));
}

beforeAll(async () => {
  await initializeRecastNavigation();
});

describe('T21 Pass 18F QA-only local connector candidate', () => {
  it('tests exact source-boundary Recast-projected local endpoints without promoting original traversal semantics', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);

    if (!fixturePath) return;

    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as Pass18fFixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const baseSolids = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids;
    const withoutVectorGrates = baseSolids.filter(
      (solid) => !solid.id.includes('grate-mesh:')
    );

    const sourceGrates = (['POSITIVE_Z', 'NEGATIVE_Z'] as const).map((side) =>
      navOnlySolid(
        `UndertowT21D:pass18f-source-grate:${side.toLowerCase()}`,
        fixture.grates[side].mesh
      )
    );
    const sourceGrateFloors = (['POSITIVE_Z', 'NEGATIVE_Z'] as const).map(
      (side) =>
        navOnlySolid(
          `UndertowT21D:pass18f-grate-floor:${side.toLowerCase()}`,
          fixture.grates[side].nearestWalkMesh!
        )
    );
    const bridgeSolids = (['POSITIVE_Z', 'NEGATIVE_Z'] as const).map((side) =>
      navOnlySolid(
        `UndertowT21D:pass18f-bridge:${side.toLowerCase()}`,
        fixture.glass[side].bridgeMesh
      )
    );
    const glassNearestFloors = (['POSITIVE_Z', 'NEGATIVE_Z'] as const).map(
      (side) =>
        navOnlySolid(
          `UndertowT21D:pass18f-glass-floor:${side.toLowerCase()}`,
          fixture.glass[side].nearestNonBridgeMesh!
        )
    );

    const solids = [
      ...withoutVectorGrates,
      ...sourceGrates,
      ...sourceGrateFloors,
      ...bridgeSolids,
      ...glassNearestFloors
    ];
    const anchors = sourceAnchors(fixture);

    const endpointPairs = {
      gratePositive: transitionEndpoints(
        fixture.grates.POSITIVE_Z.mesh,
        fixture.grates.POSITIVE_Z.nearestWalkMesh!
      ),
      grateNegative: transitionEndpoints(
        fixture.grates.NEGATIVE_Z.mesh,
        fixture.grates.NEGATIVE_Z.nearestWalkMesh!
      ),
      glassPositive: transitionEndpoints(
        fixture.glass.POSITIVE_Z.bridgeMesh,
        fixture.glass.POSITIVE_Z.nearestNonBridgeMesh!
      ),
      glassNegative: transitionEndpoints(
        fixture.glass.NEGATIVE_Z.bridgeMesh,
        fixture.glass.NEGATIVE_Z.nearestNonBridgeMesh!
      )
    };

    const baseline = matrixSummary(
      qaStage('undertow-pass18f-source-baseline', solids, [
        ...UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.navigationLinks
      ]),
      anchors
    );

    const radiusResults: Record<string, {
      allFour: MatrixSummary;
      grateOnly: MatrixSummary;
      glassOnly: MatrixSummary;
      individual: Record<string, MatrixSummary>;
    }> = {};

    for (const radiusMeters of LINK_RADII) {
      const grateLinks = [
        connector('pass18f-grate-positive', endpointPairs.gratePositive, radiusMeters, true, 18101),
        connector('pass18f-grate-negative', endpointPairs.grateNegative, radiusMeters, true, 18102)
      ];
      const glassLinks = [
        connector('pass18f-glass-positive', endpointPairs.glassPositive, radiusMeters, true, 18103),
        connector('pass18f-glass-negative', endpointPairs.glassNegative, radiusMeters, true, 18104)
      ];
      const inherited = [...UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.navigationLinks];
      radiusResults[radiusMeters.toFixed(2)] = {
        allFour: matrixSummary(
          qaStage(
            `undertow-pass18f-all-${radiusMeters}`,
            solids,
            [...inherited, ...grateLinks, ...glassLinks]
          ),
          anchors
        ),
        grateOnly: matrixSummary(
          qaStage(
            `undertow-pass18f-grate-${radiusMeters}`,
            solids,
            [...inherited, ...grateLinks]
          ),
          anchors
        ),
        glassOnly: matrixSummary(
          qaStage(
            `undertow-pass18f-glass-${radiusMeters}`,
            solids,
            [...inherited, ...glassLinks]
          ),
          anchors
        ),
        individual: {
          gratePositive: matrixSummary(
            qaStage(
              `undertow-pass18f-grate-positive-${radiusMeters}`,
              solids,
              [...inherited, grateLinks[0]!]
            ),
            anchors
          ),
          grateNegative: matrixSummary(
            qaStage(
              `undertow-pass18f-grate-negative-${radiusMeters}`,
              solids,
              [...inherited, grateLinks[1]!]
            ),
            anchors
          ),
          glassPositive: matrixSummary(
            qaStage(
              `undertow-pass18f-glass-positive-${radiusMeters}`,
              solids,
              [...inherited, glassLinks[0]!]
            ),
            anchors
          ),
          glassNegative: matrixSummary(
            qaStage(
              `undertow-pass18f-glass-negative-${radiusMeters}`,
              solids,
              [...inherited, glassLinks[1]!]
            ),
            anchors
          )
        }
      };
    }

    const keyAnchors = {
      negativeGrate: 'grate:UndertowT21D:negative-z-grate-mesh:0',
      positiveGrate: 'grate:UndertowT21D:positive-z-grate-mesh:0',
      centerStep: 'paint:UndertowT21D:center-origin-step-top-face:0'
    };

    const compact = Object.fromEntries(
      Object.entries(radiusResults).map(([radius, result]) => [
        radius,
        {
          allFour: {
            reached: result.allFour.reachedDirectedPairsIncludingSelf,
            weak: result.allFour.weakComponentCount,
            strong: result.allFour.stronglyConnectedComponentCount,
            isolated: result.allFour.isolatedAnchorIds
          },
          grateOnly: {
            reached: result.grateOnly.reachedDirectedPairsIncludingSelf,
            weak: result.grateOnly.weakComponentCount,
            strong: result.grateOnly.stronglyConnectedComponentCount,
            isolated: result.grateOnly.isolatedAnchorIds
          },
          glassOnly: {
            reached: result.glassOnly.reachedDirectedPairsIncludingSelf,
            weak: result.glassOnly.weakComponentCount,
            strong: result.glassOnly.stronglyConnectedComponentCount,
            isolated: result.glassOnly.isolatedAnchorIds
          },
          individual: Object.fromEntries(
            Object.entries(result.individual).map(([id, matrix]) => [
              id,
              {
                reached: matrix.reachedDirectedPairsIncludingSelf,
                weak: matrix.weakComponentCount,
                strong: matrix.stronglyConnectedComponentCount,
                isolated: matrix.isolatedAnchorIds
              }
            ])
          )
        }
      ])
    );

    console.log(
      'T21PASS18F_LOCAL_CONNECTOR',
      JSON.stringify({
        diagnosticOnly: true,
        endpointMethod: 'EXACT_TRIANGLE_CLOSEST_PAIR_INSET_TOWARD_SOURCE_TRIANGLE_INTERIOR',
        connectorPromotionAuthorized: false,
        connectorDirectionalityAuthorityResolved: false,
        endpointPairs,
        baseline: {
          reached: baseline.reachedDirectedPairsIncludingSelf,
          weak: baseline.weakComponentCount,
          strong: baseline.stronglyConnectedComponentCount,
          isolated: baseline.isolatedAnchorIds
        },
        keyAnchors,
        radiusResults: compact,
        pairChecks: Object.fromEntries(
          Object.entries(radiusResults).map(([radius, result]) => [
            radius,
            {
              negativeGrateBidirectional: pairConnected(
                result.allFour,
                keyAnchors.negativeGrate,
                result.allFour.rows.find(
                  (row) =>
                    row.from !== keyAnchors.negativeGrate &&
                    row.reached.includes(keyAnchors.negativeGrate)
                )?.from ?? ''
              ),
              positiveGrateHasExternalReach:
                (result.allFour.rows.find(
                  (row) => row.from === keyAnchors.positiveGrate
                )?.reached.length ?? 0) > 1,
              negativeGrateHasExternalReach:
                (result.allFour.rows.find(
                  (row) => row.from === keyAnchors.negativeGrate
                )?.reached.length ?? 0) > 1,
              centerStepStillIsolated:
                result.allFour.rows.find(
                  (row) => row.from === keyAnchors.centerStep
                )?.reached.length === 1
            }
          ])
        )
      })
    );

    expect(baseline.reachedDirectedPairsIncludingSelf).toBe(79);
    expect(baseline.weakComponentCount).toBe(9);
    expect(baseline.stronglyConnectedComponentCount).toBe(11);
    expect(LINK_RADII).toEqual([0.10, 0.18, 0.30]);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  });
});
