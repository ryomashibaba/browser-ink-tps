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

interface ChainComponent {
  id: string;
  mesh: FixtureMesh;
}

interface Fixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  grates: Record<
    'POSITIVE_Z' | 'NEGATIVE_Z',
    { anchor: StageVector3; mesh: FixtureMesh }
  >;
  pass18g: {
    routes: {
      grate: Record<
        'POSITIVE_Z' | 'NEGATIVE_Z',
        {
          startComponentId: string;
          components: ChainComponent[];
          relaxedReachableComponentIds: string[];
        }
      >;
    };
  };
  pass18i: {
    grate: Record<
      'POSITIVE_Z' | 'NEGATIVE_Z',
      {
        aComponentId: string;
        bComponentId: string;
        aPointProject: StageVector3;
        bPointProject: StageVector3;
        modelDistanceMeters: number;
      }
    >;
  };
}

interface Pair {
  a: StageVector3;
  b: StageVector3;
  distanceMeters: number;
}

interface MatrixSummary {
  reached: number;
  weak: number;
  strong: number;
  isolated: string[];
  rows: Array<{ from: string; reached: string[] }>;
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';
const EPS = 1e-12;
const LINK_RADIUS_METERS = 0.30;

function meshBounds(mesh: StageTriangleMeshGeometry): StageVector3 {
  const xs = mesh.vertices.map((v) => v[0]);
  const ys = mesh.vertices.map((v) => v[1]);
  const zs = mesh.vertices.map((v) => v[2]);
  return [
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    Math.max(...zs) - Math.min(...zs)
  ];
}

function navOnlySolid(id: string, mesh: StageTriangleMeshGeometry): StageSolidDefinition {
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
function mul(a: StageVector3, s: number): StageVector3 {
  return [a[0] * s, a[1] * s, a[2] * s];
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
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
    return add(b, mul(sub(c, b), w));
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
): Pair {
  const d1 = sub(q1, p1);
  const d2 = sub(q2, p2);
  const r = sub(p1, p2);
  const a = dot(d1, d1);
  const e = dot(d2, d2);
  const f = dot(d2, r);
  let s = 0;
  let t = 0;
  if (a <= EPS && e <= EPS) return { a: p1, b: p2, distanceMeters: distance(p1, p2) };
  if (a <= EPS) {
    t = Math.max(0, Math.min(1, f / e));
  } else {
    const c = dot(d1, r);
    if (e <= EPS) {
      s = Math.max(0, Math.min(1, -c / a));
    } else {
      const b = dot(d1, d2);
      const denom = a * e - b * b;
      if (Math.abs(denom) > EPS) s = Math.max(0, Math.min(1, (b * f - c * e) / denom));
      const nominal = b * s + f;
      if (nominal < 0) {
        t = 0;
        s = Math.max(0, Math.min(1, -c / a));
      } else if (nominal > e) {
        t = 1;
        s = Math.max(0, Math.min(1, (b - c) / a));
      } else {
        t = nominal / e;
      }
    }
  }
  const pa = add(p1, mul(d1, s));
  const pb = add(p2, mul(d2, t));
  return { a: pa, b: pb, distanceMeters: distance(pa, pb) };
}

function triangleClosestPair(
  a0: StageVector3, a1: StageVector3, a2: StageVector3,
  b0: StageVector3, b1: StageVector3, b2: StageVector3
): Pair {
  let best: Pair | null = null;
  const consider = (candidate: Pair) => {
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
  const ae = [[a0, a1], [a1, a2], [a2, a0]] as const;
  const be = [[b0, b1], [b1, b2], [b2, b0]] as const;
  for (const [ap, aq] of ae) for (const [bp, bq] of be) consider(closestPointsOnSegments(ap, aq, bp, bq));
  if (!best) throw new Error('Pass18K triangle pair missing');
  return best;
}

function meshClosestPair(a: StageTriangleMeshGeometry, b: StageTriangleMeshGeometry): Pair {
  let best: Pair | null = null;
  for (let ai = 0; ai < a.indices.length; ai += 3) {
    const a0 = a.vertices[a.indices[ai]!]!;
    const a1 = a.vertices[a.indices[ai + 1]!]!;
    const a2 = a.vertices[a.indices[ai + 2]!]!;
    for (let bi = 0; bi < b.indices.length; bi += 3) {
      const b0 = b.vertices[b.indices[bi]!]!;
      const b1 = b.vertices[b.indices[bi + 1]!]!;
      const b2 = b.vertices[b.indices[bi + 2]!]!;
      const candidate = triangleClosestPair(a0, a1, a2, b0, b1, b2);
      if (!best || candidate.distanceMeters < best.distanceMeters) best = candidate;
    }
  }
  if (!best) throw new Error('Pass18K mesh pair missing');
  return best;
}

function qaStage(
  id: string,
  solids: readonly StageSolidDefinition[],
  links: readonly StageNavigationLinkDefinition[]
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
    navigationLinks: links
  };
}

function matrixSummary(
  stage: StageDefinition,
  anchors: ReturnType<typeof undertowPass18bTraversableQaAnchors>
): MatrixSummary {
  const navigation = new RecastStageNavigation(stage, new PerformanceStats());
  const rows = anchors.map((from) => ({
    from: from.id,
    reached: anchors
      .filter((to) => navigation.auditPath(vec3(from.point), vec3(to.point)).reachedTarget)
      .map((to) => to.id)
  }));
  const ids = rows.map((r) => r.from);
  const reach = new Map(rows.map((r) => [r.from, new Set(r.reached)] as const));
  const weakSeen = new Set<string>();
  let weak = 0;
  for (const seed of ids) {
    if (weakSeen.has(seed)) continue;
    weak += 1;
    const stack = [seed];
    weakSeen.add(seed);
    while (stack.length) {
      const cur = stack.pop()!;
      for (const candidate of ids) {
        if (weakSeen.has(candidate)) continue;
        if (reach.get(cur)!.has(candidate) || reach.get(candidate)!.has(cur)) {
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
      if (reach.get(seed)!.has(candidate) && reach.get(candidate)!.has(seed)) {
        strongSeen.add(candidate);
      }
    }
  }
  return {
    reached: rows.reduce((sum, row) => sum + row.reached.length, 0),
    weak,
    strong,
    isolated: rows.filter((r) => r.reached.length === 1 && r.reached[0] === r.from).map((r) => r.from),
    rows
  };
}

function sourceAnchors(fixture: Fixture) {
  const base = undertowPass18bTraversableQaAnchors().filter((a) => a.kind !== 'GRATE');
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

function componentById(components: ChainComponent[], id: string): ChainComponent {
  const found = components.find((component) => component.id === id);
  if (!found) throw new Error(`Pass18K missing component ${id}`);
  return found;
}

beforeAll(async () => {
  await initializeRecastNavigation();
});

describe('T21 Pass 18K QA-only complete grate source-chain connector candidate', () => {
  it('tests two KCC-backed local connector sites per side only after binding the exact source-native continuation', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if (!fixturePath) return;

    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const base = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const withoutVectorGrates = base.solids.filter((solid) => !solid.id.includes('grate-mesh:'));
    const sourceGrateSolids: StageSolidDefinition[] = [];
    const chainSolids: StageSolidDefinition[] = [];
    const ingressLinks: StageNavigationLinkDefinition[] = [];
    const finalGapLinks: StageNavigationLinkDefinition[] = [];
    const diagnostics: Record<string, unknown> = {};

    for (const [sideIndex, side] of (['POSITIVE_Z', 'NEGATIVE_Z'] as const).entries()) {
      const route = fixture.pass18g.routes.grate[side];
      expect(route.relaxedReachableComponentIds).toHaveLength(8);
      const reachable = route.relaxedReachableComponentIds.map((id) =>
        componentById(route.components, id)
      );
      sourceGrateSolids.push(
        navOnlySolid(`pass18k-source-grate:${side}`, fixture.grates[side].mesh)
      );
      for (const component of reachable) {
        chainSolids.push(
          navOnlySolid(`pass18k-chain:${side}:${component.id}`, component.mesh)
        );
      }

      const start = componentById(route.components, route.startComponentId);
      const ingress = meshClosestPair(fixture.grates[side].mesh, start.mesh);
      ingressLinks.push({
        id: `pass18k-ingress-${side.toLowerCase()}`,
        start: ingress.a,
        end: ingress.b,
        radiusMeters: LINK_RADIUS_METERS,
        bidirectional: true,
        userId: 18810 + sideIndex
      });

      const gap = fixture.pass18i.grate[side];
      expect(gap.modelDistanceMeters).toBeCloseTo(0.5, 12);
      expect(route.relaxedReachableComponentIds).toContain(gap.aComponentId);
      expect(route.relaxedReachableComponentIds).toContain(gap.bComponentId);
      finalGapLinks.push({
        id: `pass18k-final-half-meter-${side.toLowerCase()}`,
        start: gap.aPointProject,
        end: gap.bPointProject,
        radiusMeters: LINK_RADIUS_METERS,
        bidirectional: true,
        userId: 18820 + sideIndex
      });
      diagnostics[side] = {
        routeStartComponentId: route.startComponentId,
        reachableComponentCount: route.relaxedReachableComponentIds.length,
        ingressBoundaryDistanceMeters: ingress.distanceMeters,
        finalGapModelMeters: gap.modelDistanceMeters,
        ingressLink: ingressLinks.at(-1),
        finalGapLink: finalGapLinks.at(-1)
      };
    }

    const solids = [
      ...withoutVectorGrates,
      ...sourceGrateSolids,
      ...chainSolids
    ];
    const anchors = sourceAnchors(fixture);
    const inherited = [...base.navigationLinks];
    const baseline = matrixSummary(
      qaStage('pass18k-chain-no-new-links', solids, inherited),
      anchors
    );
    const ingressOnly = matrixSummary(
      qaStage('pass18k-chain-ingress-only', solids, [...inherited, ...ingressLinks]),
      anchors
    );
    const finalOnly = matrixSummary(
      qaStage('pass18k-chain-final-only', solids, [...inherited, ...finalGapLinks]),
      anchors
    );
    const both = matrixSummary(
      qaStage(
        'pass18k-chain-both-kcc-backed-sites',
        solids,
        [...inherited, ...ingressLinks, ...finalGapLinks]
      ),
      anchors
    );

    console.log(
      'T21PASS18K_GRATE_CHAIN_CONNECTOR',
      JSON.stringify({
        diagnosticOnly: true,
        runtimePromotionAuthorized: false,
        linkRadiusMeters: LINK_RADIUS_METERS,
        candidateLinkCount: ingressLinks.length + finalGapLinks.length,
        candidateDirectionality: 'BIDIRECTIONAL_QA_ONLY_FROM_PASS18D_AND_PASS18J_KCC',
        diagnostics,
        baseline: {
          reached: baseline.reached,
          weak: baseline.weak,
          strong: baseline.strong,
          isolated: baseline.isolated
        },
        ingressOnly: {
          reached: ingressOnly.reached,
          weak: ingressOnly.weak,
          strong: ingressOnly.strong,
          isolated: ingressOnly.isolated
        },
        finalOnly: {
          reached: finalOnly.reached,
          weak: finalOnly.weak,
          strong: finalOnly.strong,
          isolated: finalOnly.isolated
        },
        both: {
          reached: both.reached,
          weak: both.weak,
          strong: both.strong,
          isolated: both.isolated
        },
        grateRows: both.rows.filter((row) => row.from.startsWith('grate:'))
      })
    );

    expect(anchors).toHaveLength(25);
    expect(sourceGrateSolids).toHaveLength(2);
    expect(chainSolids).toHaveLength(16);
    expect(ingressLinks).toHaveLength(2);
    expect(finalGapLinks).toHaveLength(2);
    expect(LINK_RADIUS_METERS).toBe(0.30);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  }, 20000);
});
