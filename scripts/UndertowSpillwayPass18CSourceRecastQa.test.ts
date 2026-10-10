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

interface FixtureMesh {
  vertices: StageVector3[];
  indices: number[];
}

interface GrateFixture {
  sourceObject: string;
  sourceMaterial: string;
  qualifiedComponentCount: number;
  triangleCount: number;
  areaSquareMeters: number;
  anchor: StageVector3;
  mesh: FixtureMesh;
  nearestWalkDistanceMeters: number | null;
  nearestWalkObject: string | null;
  nearestWalkMaterial: string | null;
  nearestWalkMesh: FixtureMesh | null;
}

interface GlassFixture {
  sourceObject: string;
  routeComponentIds: number[];
  broadSourceTriangleCount: number;
  broadSourceAreaSquareMeters: number;
  bridgeReachableComponentCount: number;
  bridgeReachableTriangleCount: number;
  bridgeMesh: FixtureMesh;
  nearestBridgeDistanceMeters: number | null;
  nearestNonBridgeDistanceMeters: number | null;
  nearestNonBridgeObject: string | null;
  nearestNonBridgeMaterial: string | null;
  nearestNonBridgeMesh: FixtureMesh | null;
}

interface Pass18cFixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  grates: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GrateFixture>;
  glass: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GlassFixture>;
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';

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

function stageWithSolids(
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

function sourceGrateAnchors(fixture: Pass18cFixture) {
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

function matrixSummary(
  stage: StageDefinition,
  anchors: ReturnType<typeof undertowPass18bTraversableQaAnchors>
) {
  const navigation = new RecastStageNavigation(stage, new PerformanceStats());
  const rows = anchors.map((from) => ({
    from: from.id,
    reached: anchors
      .filter((to) => navigation.auditPath(vec3(from.point), vec3(to.point)).reachedTarget)
      .map((to) => to.id)
  }));
  return {
    reachedDirectedPairsIncludingSelf: rows.reduce(
      (sum, row) => sum + row.reached.length,
      0
    ),
    rows
  };
}

function glassExternalReachCount(
  rows: ReturnType<typeof matrixSummary>['rows']
): number {
  return rows
    .filter((row) => row.from.startsWith('glass:'))
    .reduce(
      (sum, row) =>
        sum + row.reached.filter((id) => !id.startsWith('glass:')).length,
      0
    );
}

beforeAll(async () => {
  await initializeRecastNavigation();
});

describe('T21 Pass 18C source-native upper-terrain Recast QA', () => {
  it('keeps source-native candidate experiments inert and compares exact Recast outcomes', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');

    if (!fixturePath) {
      // The ordinary repository suite is source-independent. CI runs this same
      // test a second time with the verified Temple01-derived fixture.
      expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
      return;
    }

    const fixture = JSON.parse(
      readFileSync(fixturePath, 'utf8')
    ) as Pass18cFixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const grate = fixture.grates[side];
      expect(grate.qualifiedComponentCount).toBe(8);
      expect(grate.triangleCount).toBe(16);
      expect(grate.mesh.indices).toHaveLength(48);
      expect(grate.nearestWalkDistanceMeters).toBeCloseTo(0.335410, 6);
      expect(grate.nearestWalkObject).toBe(
        'Fld_Temple01_pCube21525_1__FloorConcrete00'
      );
      expect(grate.nearestWalkMesh).not.toBeNull();

      const glass = fixture.glass[side];
      expect(glass.routeComponentIds).toHaveLength(3);
      expect(glass.broadSourceTriangleCount).toBe(6);
      expect(glass.bridgeReachableComponentCount).toBe(24);
      expect(glass.bridgeReachableTriangleCount).toBe(48);
      expect(glass.nearestBridgeDistanceMeters).toBeCloseTo(0.055902, 6);
      expect(glass.nearestNonBridgeDistanceMeters).toBeCloseTo(0.7, 6);
      expect(glass.nearestNonBridgeObject).toBe(
        'Fld_Temple01_pCube20989_1__FloorConcrete02'
      );
      expect(glass.nearestNonBridgeMesh).not.toBeNull();
    }

    const baseSolids = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids;
    const withoutVectorGrates = baseSolids.filter(
      (solid) => !solid.id.includes('grate-mesh:')
    );
    const sourceGrates = (['POSITIVE_Z', 'NEGATIVE_Z'] as const).map((side) =>
      navOnlySolid(
        `UndertowT21D:pass18c-source-grate:${side.toLowerCase()}`,
        fixture.grates[side].mesh
      )
    );
    const sourceGrateFloors = (['POSITIVE_Z', 'NEGATIVE_Z'] as const).map(
      (side) =>
        navOnlySolid(
          `UndertowT21D:pass18c-source-grate-nearest-floor:${side.toLowerCase()}`,
          fixture.grates[side].nearestWalkMesh!
        )
    );
    const bridgeSolids = (['POSITIVE_Z', 'NEGATIVE_Z'] as const).map((side) =>
      navOnlySolid(
        `UndertowT21D:pass18c-glass-bridge-metal:${side.toLowerCase()}`,
        fixture.glass[side].bridgeMesh
      )
    );
    const glassNearestFloors = (['POSITIVE_Z', 'NEGATIVE_Z'] as const).map(
      (side) =>
        navOnlySolid(
          `UndertowT21D:pass18c-glass-nearest-floor:${side.toLowerCase()}`,
          fixture.glass[side].nearestNonBridgeMesh!
        )
    );

    const baseline = matrixSummary(
      stageWithSolids('undertow-pass18c-baseline', baseSolids),
      undertowPass18bTraversableQaAnchors()
    );

    const grateOnly = matrixSummary(
      stageWithSolids(
        'undertow-pass18c-source-grate-only',
        [...withoutVectorGrates, ...sourceGrates]
      ),
      sourceGrateAnchors(fixture)
    );

    const gratePlusFloor = matrixSummary(
      stageWithSolids(
        'undertow-pass18c-source-grate-plus-floor',
        [...withoutVectorGrates, ...sourceGrates, ...sourceGrateFloors]
      ),
      sourceGrateAnchors(fixture)
    );

    const glassBridge = matrixSummary(
      stageWithSolids(
        'undertow-pass18c-glass-bridge',
        [...baseSolids, ...bridgeSolids]
      ),
      undertowPass18bTraversableQaAnchors()
    );

    const glassBridgePlusFloor = matrixSummary(
      stageWithSolids(
        'undertow-pass18c-glass-bridge-plus-floor',
        [...baseSolids, ...bridgeSolids, ...glassNearestFloors]
      ),
      undertowPass18bTraversableQaAnchors()
    );

    const result = {
      baselineReach: baseline.reachedDirectedPairsIncludingSelf,
      sourceGrateReach: grateOnly.reachedDirectedPairsIncludingSelf,
      sourceGratePlusFloorReach:
        gratePlusFloor.reachedDirectedPairsIncludingSelf,
      glassBridgeReach: glassBridge.reachedDirectedPairsIncludingSelf,
      glassBridgePlusFloorReach:
        glassBridgePlusFloor.reachedDirectedPairsIncludingSelf,
      glassBridgeExternalReach: glassExternalReachCount(glassBridge.rows),
      glassBridgePlusFloorExternalReach:
        glassExternalReachCount(glassBridgePlusFloor.rows),
      sourceGrateRows: grateOnly.rows.filter((row) => row.from.startsWith('grate:')),
      sourceGratePlusFloorRows: gratePlusFloor.rows.filter(
        (row) => row.from.startsWith('grate:')
      ),
      glassBridgeRows: glassBridge.rows.filter((row) => row.from.startsWith('glass:')),
      glassBridgePlusFloorRows: glassBridgePlusFloor.rows.filter(
        (row) => row.from.startsWith('glass:')
      )
    };
    console.log('T21PASS18C_RECAST', JSON.stringify(result));

    expect(baseline.reachedDirectedPairsIncludingSelf).toBe(79);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  });
});
