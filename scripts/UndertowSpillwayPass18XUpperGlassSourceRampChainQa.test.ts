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
  type StageSolidDefinition,
  type StageTriangleMeshGeometry,
  type StageVector3
} from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {
  undertowPass18bTraversableQaAnchors,
  vec3
} from '../src/stage/undertow/UndertowSpillwayConnectivityQa';

type Side = 'POSITIVE_Z' | 'NEGATIVE_Z';

interface ChainComponent {
  id: string;
  sourceObject: string;
  sourceMaterial: string;
  componentIndex: number;
  triangleCount: number;
  areaSquareMeters: number;
  yRange: [number, number];
  bbox: [number, number, number, number, number, number];
  mesh: StageTriangleMeshGeometry;
}

interface GlassChainSide {
  startComponentId: string;
  relaxedReachableComponentIds: string[];
  components: ChainComponent[];
}

interface Fixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  pass18g: {
    routes: {
      glass: Record<Side, GlassChainSide>;
    };
  };
}

interface MatrixRow {
  from: string;
  reached: string[];
}

interface MatrixSummary {
  reached: number;
  weak: number;
  strong: number;
  isolated: string[];
  rows: MatrixRow[];
}

interface TrustedRepresentative {
  point: StageVector3;
  snapMeters: number;
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';
const TRUSTED_SNAP_METERS = 0.30;

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
    collisionBehavior: 'SOLID',
    triangleMesh: mesh
  };
}

function qaStage(
  id: string,
  solids: readonly StageSolidDefinition[]
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
    navigationLinks: base.navigationLinks
  };
}

function distance(a: StageVector3, b: StageVector3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
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

function meshSamples(mesh: StageTriangleMeshGeometry): StageVector3[] {
  const samples: StageVector3[] = [];
  const seen = new Set<string>();
  const add = (point: StageVector3) => {
    const key = point.map((value) => value.toFixed(7)).join(',');
    if (seen.has(key)) return;
    seen.add(key);
    samples.push(point);
  };
  for (const vertex of mesh.vertices) add(vertex);
  for (let i = 0; i < mesh.indices.length; i += 3) {
    add(
      triangleCentroid(
        mesh.vertices[mesh.indices[i]!]!,
        mesh.vertices[mesh.indices[i + 1]!]!,
        mesh.vertices[mesh.indices[i + 2]!]!
      )
    );
  }
  return samples;
}

function trustedRepresentative(
  navigation: RecastStageNavigation,
  mesh: StageTriangleMeshGeometry
): TrustedRepresentative | null {
  let best: TrustedRepresentative | null = null;
  for (const sample of meshSamples(mesh)) {
    const projectedRaw = navigation.closestPoint(vec3(sample));
    const point: StageVector3 = [
      projectedRaw.x,
      projectedRaw.y,
      projectedRaw.z
    ];
    const snapMeters = distance(sample, point);
    if (snapMeters > TRUSTED_SNAP_METERS + 1e-9) continue;
    if (!best || snapMeters < best.snapMeters) {
      best = { point, snapMeters };
    }
  }
  return best;
}

function matrixSummary(
  stage: StageDefinition
): MatrixSummary {
  const navigation = new RecastStageNavigation(stage, new PerformanceStats());
  const anchors = undertowPass18bTraversableQaAnchors();
  const rows = anchors.map((from) => ({
    from: from.id,
    reached: anchors
      .filter((to) =>
        navigation.auditPath(vec3(from.point), vec3(to.point)).reachedTarget
      )
      .map((to) => to.id)
  }));

  const ids = rows.map((row) => row.from);
  const reach = new Map(
    rows.map((row) => [row.from, new Set(row.reached)] as const)
  );

  const weakSeen = new Set<string>();
  let weak = 0;
  for (const seed of ids) {
    if (weakSeen.has(seed)) continue;
    weak += 1;
    weakSeen.add(seed);
    const stack = [seed];
    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const candidate of ids) {
        if (weakSeen.has(candidate)) continue;
        if (
          reach.get(current)!.has(candidate) ||
          reach.get(candidate)!.has(current)
        ) {
          weakSeen.add(candidate);
          stack.push(candidate);
        }
      }
    }
  }

  const strongSeen = new Set<string>();
  let strong = 0;
  for (const seed of ids) {
    if (strongSeen.has(seed)) continue;
    strong += 1;
    for (const candidate of ids) {
      if (
        reach.get(seed)!.has(candidate) &&
        reach.get(candidate)!.has(seed)
      ) {
        strongSeen.add(candidate);
      }
    }
  }

  return {
    reached: rows.reduce((sum, row) => sum + row.reached.length, 0),
    weak,
    strong,
    isolated: rows
      .filter(
        (row) => row.reached.length === 1 && row.reached[0] === row.from
      )
      .map((row) => row.from),
    rows
  };
}

function pairSet(rows: readonly MatrixRow[]): Set<string> {
  return new Set(
    rows.flatMap((row) => row.reached.map((to) => `${row.from}->${to}`))
  );
}

function materialLeaf(material: string): string {
  return material.replace(/^Fld_Temple01_/, '').replace(
    /^FldObj_Temple01_PntSet_/,
    ''
  );
}

beforeAll(async () => {
  await initializeRecastNavigation();
});

describe('T21 Pass 18X full upper-glass source-ramp-chain Recast audit', () => {
  it('adds all 58 exact downstream source components per side without links and measures resulting topology', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if (!fixturePath) return;

    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const sideComponents = {} as Record<Side, ChainComponent[]>;
    const sourceSolids: StageSolidDefinition[] = [];
    const sourceIds = new Set<string>();

    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const route = fixture.pass18g.routes.glass[side];
      expect(route.relaxedReachableComponentIds).toHaveLength(58);
      const byId = new Map(route.components.map((component) => [
        component.id,
        component
      ] as const));
      const components = route.relaxedReachableComponentIds.map((id) => {
        const component = byId.get(id);
        if (!component) {
          throw new Error(`Pass 18X missing source component ${side} ${id}`);
        }
        return component;
      });
      sideComponents[side] = components;
      for (const component of components) {
        if (sourceIds.has(component.id)) {
          throw new Error(`Pass 18X duplicate mirrored component ${component.id}`);
        }
        sourceIds.add(component.id);
        sourceSolids.push(
          navOnlySolid(
            `pass18x-upper-glass-source:${side}:${component.id}`,
            component.mesh
          )
        );
      }
    }

    const base = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const baselineStage = qaStage('pass18x-baseline', base.solids);
    const candidateStage = qaStage(
      'pass18x-full-source-ramp-chain',
      [...base.solids, ...sourceSolids]
    );

    const baseline = matrixSummary(baselineStage);
    const candidate = matrixSummary(candidateStage);
    const baselinePairs = pairSet(baseline.rows);
    const candidatePairs = pairSet(candidate.rows);
    const addedPairs = [...candidatePairs]
      .filter((pair) => !baselinePairs.has(pair))
      .sort();
    const removedPairs = [...baselinePairs]
      .filter((pair) => !candidatePairs.has(pair))
      .sort();

    const candidateNavigation = new RecastStageNavigation(
      candidateStage,
      new PerformanceStats()
    );
    const anchors = undertowPass18bTraversableQaAnchors();

    const sourceBindings = Object.fromEntries(
      (['POSITIVE_Z', 'NEGATIVE_Z'] as const).map((side) => {
        const ownGlassPrefix =
          side === 'POSITIVE_Z' ? 'glass:positive-z:' : 'glass:negative-z:';
        const oppositeGlassPrefix =
          side === 'POSITIVE_Z' ? 'glass:negative-z:' : 'glass:positive-z:';
        const ownGlassAnchors = anchors.filter((anchor) =>
          anchor.id.startsWith(ownGlassPrefix)
        );
        const oppositeGlassAnchors = anchors.filter((anchor) =>
          anchor.id.startsWith(oppositeGlassPrefix)
        );
        const nonGlassAnchors = anchors.filter(
          (anchor) => !anchor.id.startsWith('glass:')
        );

        let trustedRepresentativeCount = 0;
        const connectedToOwnGlass: string[] = [];
        const connectedToOppositeGlass: string[] = [];
        const connectedToNonGlass: Array<{
          componentId: string;
          anchorIds: string[];
        }> = [];

        for (const component of sideComponents[side]) {
          const representative = trustedRepresentative(
            candidateNavigation,
            component.mesh
          );
          if (!representative) continue;
          trustedRepresentativeCount += 1;

          const bidirectionalAnchorIds = anchors
            .filter((anchor) => {
              const forward = candidateNavigation.auditPath(
                vec3(representative.point),
                vec3(anchor.point)
              );
              if (!forward.reachedTarget) return false;
              return candidateNavigation.auditPath(
                vec3(anchor.point),
                vec3(representative.point)
              ).reachedTarget;
            })
            .map((anchor) => anchor.id);

          if (
            ownGlassAnchors.some((anchor) =>
              bidirectionalAnchorIds.includes(anchor.id)
            )
          ) {
            connectedToOwnGlass.push(component.id);
          }
          if (
            oppositeGlassAnchors.some((anchor) =>
              bidirectionalAnchorIds.includes(anchor.id)
            )
          ) {
            connectedToOppositeGlass.push(component.id);
          }
          const external = nonGlassAnchors
            .filter((anchor) => bidirectionalAnchorIds.includes(anchor.id))
            .map((anchor) => anchor.id);
          if (external.length > 0) {
            connectedToNonGlass.push({
              componentId: component.id,
              anchorIds: external
            });
          }
        }

        const materialGroups = Object.fromEntries(
          [...new Set(sideComponents[side].map((component) =>
            materialLeaf(component.sourceMaterial)
          ))]
            .sort()
            .map((material) => {
              const components = sideComponents[side].filter(
                (component) =>
                  materialLeaf(component.sourceMaterial) === material
              );
              return [
                material,
                {
                  count: components.length,
                  areaSquareMeters: components.reduce(
                    (sum, component) => sum + component.areaSquareMeters,
                    0
                  ),
                  yMin: Math.min(...components.map((component) => component.yRange[0])),
                  yMax: Math.max(...components.map((component) => component.yRange[1]))
                }
              ];
            })
        );

        return [
          side,
          {
            sourceComponentCount: sideComponents[side].length,
            trustedRepresentativeCount,
            connectedToOwnGlassCount: connectedToOwnGlass.length,
            connectedToOwnGlass,
            connectedToOppositeGlassCount: connectedToOppositeGlass.length,
            connectedToOppositeGlass,
            connectedToNonGlassCount: connectedToNonGlass.length,
            connectedToNonGlass,
            materialGroups
          }
        ];
      })
    );

    const candidateGlassRows = candidate.rows.filter((row) =>
      row.from.startsWith('glass:')
    );
    const changedNonGlassRows = candidate.rows
      .filter((row) => !row.from.startsWith('glass:'))
      .filter((row) => {
        const baselineRow = baseline.rows.find(
          (candidateRow) => candidateRow.from === row.from
        )!;
        return baselineRow.reached.join(',') !== row.reached.join(',');
      })
      .map((row) => row.from);

    console.log(
      'T21PASS18X_UPPER_GLASS_FULL_SOURCE_CLUSTER',
      JSON.stringify({
        diagnosticOnly: true,
        runtimePromotionAuthorized: false,
        trustedSnapMeters: TRUSTED_SNAP_METERS,
        sourceComponentCountPerSide: 58,
        uniqueSourceComponentCount: sourceIds.size,
        sourceSolidCount: sourceSolids.length,
        baseline: {
          reached: baseline.reached,
          weak: baseline.weak,
          strong: baseline.strong,
          isolated: baseline.isolated
        },
        candidate: {
          reached: candidate.reached,
          weak: candidate.weak,
          strong: candidate.strong,
          isolated: candidate.isolated
        },
        addedDirectedPairCount: addedPairs.length,
        removedDirectedPairCount: removedPairs.length,
        addedPairs,
        removedPairs,
        changedNonGlassRows,
        candidateGlassRows,
        sourceBindings
      })
    );

    expect(sourceIds.size).toBe(116);
    expect(sourceSolids).toHaveLength(116);
    expect(baseline.reached).toBe(79);
    expect(baseline.weak).toBe(9);
    expect(baseline.strong).toBe(11);
    expect(candidate.rows).toHaveLength(25);
    expect(candidate.reached).toBe(79);
    expect(candidate.weak).toBe(9);
    expect(candidate.strong).toBe(11);
    expect(candidate.isolated).toEqual(baseline.isolated);
    expect(addedPairs).toEqual([]);
    expect(removedPairs).toEqual([]);
    expect(changedNonGlassRows).toEqual([]);

    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const binding = sourceBindings[side] as {
        sourceComponentCount: number;
        trustedRepresentativeCount: number;
        connectedToOwnGlassCount: number;
        connectedToOppositeGlassCount: number;
        connectedToNonGlassCount: number;
        materialGroups: Record<string, { count: number; yMin: number; yMax: number }>;
      };
      expect(binding.sourceComponentCount).toBe(58);
      expect(binding.trustedRepresentativeCount).toBe(15);
      expect(binding.connectedToOwnGlassCount).toBe(0);
      expect(binding.connectedToOppositeGlassCount).toBe(0);
      expect(binding.connectedToNonGlassCount).toBe(0);
      expect(binding.materialGroups.BridgeMetal00?.count).toBe(46);
      expect(binding.materialGroups.FloorSlope00?.count).toBe(3);
      expect(binding.materialGroups.FloorSlope00?.yMin).toBeCloseTo(0, 12);
      expect(binding.materialGroups.FloorSlope00?.yMax).toBeCloseTo(6, 12);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  }, 60000);
});
