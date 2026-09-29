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

interface ClosestVertexPair {
  aIndex: number;
  bIndex: number;
  distanceMeters: number;
}

interface TransitionEndpointPair {
  start: StageVector3;
  end: StageVector3;
  closestVertexDistanceMeters: number;
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
  if (!best) throw new Error('Pass 18F closest pair requires non-empty meshes');
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
  throw new Error(`Pass 18F vertex ${vertexIndex} is not referenced`);
}

function insetSurfacePoint(
  mesh: StageTriangleMeshGeometry,
  vertexIndex: number,
  insetMeters = 0.06
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

function transitionEndpoints(
  aMesh: StageTriangleMeshGeometry,
  bMesh: StageTriangleMeshGeometry
): TransitionEndpointPair {
  const pair = closestVertexPair(aMesh, bMesh);
  const start = insetSurfacePoint(aMesh, pair.aIndex);
  const end = insetSurfacePoint(bMesh, pair.bIndex);
  return {
    start,
    end,
    closestVertexDistanceMeters: pair.distanceMeters,
    endpointDistanceMeters: Math.hypot(
      start[0] - end[0],
      start[1] - end[1],
      start[2] - end[2]
    )
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
  it('tests exact KCC-derived local endpoints without promoting original traversal semantics', () => {
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
