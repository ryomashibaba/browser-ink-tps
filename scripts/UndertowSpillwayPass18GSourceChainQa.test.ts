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

interface ChainComponent {
  id: string;
  sourceObject: string;
  sourceMaterial: string;
  componentIndex: number;
  triangleCount: number;
  areaSquareMeters: number;
  yRange: [number, number];
  bbox: [number, number, number, number, number, number];
  mesh: FixtureMesh;
}

interface ChainEdge {
  a: string;
  b: string;
  distanceMeters: number;
}

interface ChainSideFixture {
  startComponentId: string;
  excludedBacktrackComponentIds: string[];
  components: ChainComponent[];
  edges: ChainEdge[];
}

interface Pass18gFixture {
  thresholdsMeters: number[];
  relaxedDiscoveryMeters: number;
  localMarginMeters: number;
  routes: Record<
    'grate' | 'glass',
    Record<'POSITIVE_Z' | 'NEGATIVE_Z', ChainSideFixture>
  >;
}

interface Pass18Fixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  pass18g: Pass18gFixture;
}

interface RuntimeScc {
  id: number;
  anchorIds: string[];
  representativeId: string;
}

interface ComponentBinding {
  componentId: string;
  trustedSampleCount: number;
  minimumSnapMeters: number | null;
  runtimeSccIds: number[];
  anchorIds: string[];
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';
const TRUSTED_SNAP_METERS = 0.30;
const EPS = 1e-9;

function qaStage(): StageDefinition {
  const base = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  return {
    metadata: {
      id: 'undertow-pass18g-runtime-binding-audit',
      displayName: 'undertow-pass18g-runtime-binding-audit',
      worldBounds: base.worldBounds,
      teamASpawn: base.teamASpawnFloorPoint,
      teamBSpawn: base.teamBSpawnFloorPoint,
      teamASpawnSlots: [base.teamASpawnFloorPoint],
      teamBSpawnSlots: [base.teamBSpawnFloorPoint],
      tacticalNodes: [],
      splatZones: []
    },
    solids: base.solids,
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
    if (!seen.has(key)) {
      seen.add(key);
      samples.push(point);
    }
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

function runtimeSccs(
  navigation: RecastStageNavigation,
  anchors: ReturnType<typeof undertowPass18bTraversableQaAnchors>
): RuntimeScc[] {
  const remaining = new Set(anchors.map((anchor) => anchor.id));
  const byId = new Map(anchors.map((anchor) => [anchor.id, anchor]));
  const result: RuntimeScc[] = [];
  while (remaining.size > 0) {
    const representativeId = [...remaining][0]!;
    const representative = byId.get(representativeId)!;
    const anchorIds = [...remaining].filter((id) => {
      const anchor = byId.get(id)!;
      return (
        navigation.auditPath(vec3(representative.point), vec3(anchor.point)).reachedTarget &&
        navigation.auditPath(vec3(anchor.point), vec3(representative.point)).reachedTarget
      );
    });
    for (const id of anchorIds) remaining.delete(id);
    result.push({
      id: result.length,
      anchorIds: anchorIds.sort(),
      representativeId
    });
  }
  return result;
}

function componentBinding(
  navigation: RecastStageNavigation,
  component: ChainComponent,
  sccs: readonly RuntimeScc[],
  anchorsById: ReadonlyMap<string, ReturnType<typeof undertowPass18bTraversableQaAnchors>[number]>
): ComponentBinding {
  const projectedSamples: Array<{ point: StageVector3; snap: number }> = [];
  const seenProjected = new Set<string>();
  let trustedSampleCount = 0;
  let minimumSnapMeters = Number.POSITIVE_INFINITY;

  for (const sample of meshSamples(component.mesh)) {
    const projected = navigation.closestPoint(vec3(sample));
    const point: StageVector3 = [projected.x, projected.y, projected.z];
    const snap = distance(sample, point);
    if (snap > TRUSTED_SNAP_METERS + EPS) continue;
    trustedSampleCount += 1;
    minimumSnapMeters = Math.min(minimumSnapMeters, snap);
    const key = point.map((value) => value.toFixed(5)).join(',');
    if (!seenProjected.has(key)) {
      seenProjected.add(key);
      projectedSamples.push({ point, snap });
    }
  }

  projectedSamples.sort((a, b) => a.snap - b.snap);
  const matchedSccs = new Set<number>();
  for (const sample of projectedSamples) {
    for (const scc of sccs) {
      if (matchedSccs.has(scc.id)) continue;
      const representative = anchorsById.get(scc.representativeId)!;
      const forward = navigation.auditPath(vec3(sample.point), vec3(representative.point));
      if (!forward.reachedTarget) continue;
      const reverse = navigation.auditPath(vec3(representative.point), vec3(sample.point));
      if (reverse.reachedTarget) matchedSccs.add(scc.id);
    }
  }

  const runtimeSccIds = [...matchedSccs].sort((a, b) => a - b);
  const anchorIds = runtimeSccIds.flatMap(
    (id) => sccs.find((scc) => scc.id === id)!.anchorIds
  );
  return {
    componentId: component.id,
    trustedSampleCount,
    minimumSnapMeters: Number.isFinite(minimumSnapMeters) ? minimumSnapMeters : null,
    runtimeSccIds,
    anchorIds
  };
}

function reachableComponentIds(
  side: ChainSideFixture,
  maxEdgeMeters: number
): string[] {
  const adjacency = new Map<string, string[]>();
  for (const component of side.components) adjacency.set(component.id, []);
  for (const edge of side.edges) {
    if (edge.distanceMeters > maxEdgeMeters + EPS) continue;
    adjacency.get(edge.a)?.push(edge.b);
    adjacency.get(edge.b)?.push(edge.a);
  }
  const seen = new Set<string>([side.startComponentId]);
  const queue = [side.startComponentId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of adjacency.get(current) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return [...seen].sort();
}

function shortestPathToBound(
  side: ChainSideFixture,
  boundIds: ReadonlySet<string>,
  maxEdgeMeters: number
): { componentIds: string[]; gapsMeters: number[]; totalGapMeters: number } | null {
  const adjacency = new Map<string, Array<{ to: string; d: number }>>();
  for (const component of side.components) adjacency.set(component.id, []);
  for (const edge of side.edges) {
    if (edge.distanceMeters > maxEdgeMeters + EPS) continue;
    adjacency.get(edge.a)?.push({ to: edge.b, d: edge.distanceMeters });
    adjacency.get(edge.b)?.push({ to: edge.a, d: edge.distanceMeters });
  }

  const dist = new Map<string, number>([[side.startComponentId, 0]]);
  const previous = new Map<string, { id: string; gap: number }>();
  const unvisited = new Set(side.components.map((component) => component.id));

  while (unvisited.size > 0) {
    let current: string | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const id of unvisited) {
      const candidate = dist.get(id) ?? Number.POSITIVE_INFINITY;
      if (candidate < best) {
        current = id;
        best = candidate;
      }
    }
    if (current === null || !Number.isFinite(best)) break;
    unvisited.delete(current);

    if (boundIds.has(current)) {
      const componentIds = [current];
      const gapsMeters: number[] = [];
      while (current !== side.startComponentId) {
        const step = previous.get(current);
        if (!step) throw new Error(`Pass 18G missing predecessor for ${current}`);
        gapsMeters.push(step.gap);
        current = step.id;
        componentIds.push(current);
      }
      componentIds.reverse();
      gapsMeters.reverse();
      return { componentIds, gapsMeters, totalGapMeters: best };
    }

    for (const edge of adjacency.get(current) ?? []) {
      if (!unvisited.has(edge.to)) continue;
      const candidate = best + edge.d;
      if (candidate + EPS < (dist.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
        dist.set(edge.to, candidate);
        previous.set(edge.to, { id: current, gap: edge.d });
      }
    }
  }
  return null;
}

beforeAll(async () => {
  await initializeRecastNavigation();
});

describe('T21 Pass 18G source-native destination chain recovery', () => {
  it('finds source continuation toward current runtime SCCs without authorizing any promotion', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if (!fixturePath) return;

    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as Pass18Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);
    expect(fixture.pass18g.thresholdsMeters).toEqual([0.03, 0.08, 0.18, 0.30]);
    expect(fixture.pass18g.relaxedDiscoveryMeters).toBe(2.0);

    const navigation = new RecastStageNavigation(qaStage(), new PerformanceStats());
    const anchors = undertowPass18bTraversableQaAnchors();
    const anchorsById = new Map(anchors.map((anchor) => [anchor.id, anchor]));
    const sccs = runtimeSccs(navigation, anchors);
    const result: Record<string, unknown> = {};

    for (const routeName of ['grate', 'glass'] as const) {
      for (const sideName of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
        const side = fixture.pass18g.routes[routeName][sideName];
        const bindings = side.components.map((component) =>
          componentBinding(navigation, component, sccs, anchorsById)
        );
        const bindingById = new Map(bindings.map((binding) => [binding.componentId, binding]));
        const predecessorAnchorId =
          routeName === 'grate'
            ? `grate:UndertowT21D:${sideName === 'POSITIVE_Z' ? 'positive-z' : 'negative-z'}-grate-mesh:0`
            : `glass:${sideName === 'POSITIVE_Z' ? 'positive-z' : 'negative-z'}:0`;
        const predecessorScc = sccs.find((scc) =>
          scc.anchorIds.includes(predecessorAnchorId)
        );
        if (!predecessorScc) {
          throw new Error(`Pass 18G predecessor SCC missing for ${routeName}:${sideName}`);
        }
        const boundIds = new Set(
          bindings
            .filter((binding) =>
              binding.runtimeSccIds.some((id) => id !== predecessorScc.id)
            )
            .map((binding) => binding.componentId)
        );
        const paths = Object.fromEntries(
          [...fixture.pass18g.thresholdsMeters, fixture.pass18g.relaxedDiscoveryMeters].map(
            (threshold) => [
              threshold.toFixed(2),
              shortestPathToBound(side, boundIds, threshold)
            ]
          )
        );
        const relaxed = paths['2.00'];
        const chain = relaxed
          ? relaxed.componentIds.map((id) => {
              const component = side.components.find((entry) => entry.id === id)!;
              const binding = bindingById.get(id)!;
              return {
                id,
                object: component.sourceObject,
                material: component.sourceMaterial,
                componentIndex: component.componentIndex,
                triangles: component.triangleCount,
                area: component.areaSquareMeters,
                yRange: component.yRange,
                bbox: component.bbox,
                trustedSamples: binding.trustedSampleCount,
                minSnap: binding.minimumSnapMeters,
                runtimeSccIds: binding.runtimeSccIds,
                anchorIds: binding.anchorIds
              };
            })
          : [];

        const relaxedReachableIds = reachableComponentIds(
          side,
          fixture.pass18g.relaxedDiscoveryMeters
        );
        const relaxedReachable = relaxedReachableIds.map((id) => {
          const component = side.components.find((entry) => entry.id === id)!;
          const binding = bindingById.get(id)!;
          return {
            id,
            object: component.sourceObject,
            material: component.sourceMaterial,
            componentIndex: component.componentIndex,
            triangles: component.triangleCount,
            area: component.areaSquareMeters,
            yRange: component.yRange,
            bbox: component.bbox,
            runtimeSccIds: binding.runtimeSccIds,
            anchorIds: binding.anchorIds
          };
        });
        const downstreamBoundCandidates = [...boundIds].map((id) => {
          const component = side.components.find((entry) => entry.id === id)!;
          const binding = bindingById.get(id)!;
          return {
            id,
            object: component.sourceObject,
            material: component.sourceMaterial,
            componentIndex: component.componentIndex,
            bbox: component.bbox,
            runtimeSccIds: binding.runtimeSccIds,
            anchorIds: binding.anchorIds
          };
        });

        result[`${routeName}:${sideName}`] = {
          startComponentId: side.startComponentId,
          predecessorAnchorId,
          predecessorRuntimeSccId: predecessorScc.id,
          excludedBacktrackComponentIds: side.excludedBacktrackComponentIds,
          candidateComponentCount: side.components.length,
          edgeCount: side.edges.length,
          downstreamRuntimeBoundComponentCount: boundIds.size,
          paths,
          chain,
          relaxedReachableComponentCount: relaxedReachableIds.length,
          relaxedReachable,
          downstreamBoundCandidates
        };
      }
    }

    console.log(
      'T21PASS18G_SOURCE_CHAIN',
      JSON.stringify({
        diagnosticOnly: true,
        runtimePromotionAuthorized: false,
        trustedRuntimeSnapMeters: TRUSTED_SNAP_METERS,
        runtimeSccCount: sccs.length,
        runtimeSccs: sccs,
        thresholdsMeters: fixture.pass18g.thresholdsMeters,
        relaxedDiscoveryMeters: fixture.pass18g.relaxedDiscoveryMeters,
        localMarginMeters: fixture.pass18g.localMarginMeters,
        result
      })
    );

    expect(sccs).toHaveLength(11);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  }, 30000);
});
