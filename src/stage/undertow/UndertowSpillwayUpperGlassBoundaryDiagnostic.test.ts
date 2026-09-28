import { beforeAll, describe, expect, it } from 'vitest';
import { Vec3 } from 'playcanvas';
import {
  RapierStagePhysics,
  initializeRapier,
  type StageQueryPurpose
} from '../../physics/RapierStagePhysics';
import type {
  StageDefinition,
  StageSolidDefinition,
  StageVector3
} from '../StageDefinition';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES,
  type UndertowUpperGlassMeshRecord
} from './UndertowSpillwayUpperGlassMeshGeometry';
import {
  UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_SOLIDS,
  UNDERTOW_UPPER_GLASS_PASS15D_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS
} from './UndertowSpillwayUpperGlassRuntimeGeometry';
import {
  UNDERTOW_UPPER_GLASS_PASS15E_BOUNDARY_DISPOSITION_AUDIT,
  undertowUpperGlassPass15eBoundaryDispositionErrors
} from './UndertowSpillwayUpperGlassBoundaryDispositionAudit';

beforeAll(async () => {
  await initializeRapier();
});

type BoundaryProbe = {
  side: UndertowUpperGlassMeshRecord['side'];
  triangleId: number;
  centroid: StageVector3;
  normal: StageVector3;
  areaSquareMeters: number;
};

function triangleProbe(
  record: UndertowUpperGlassMeshRecord,
  triangleId: number
): BoundaryProbe {
  const base = triangleId * 3;
  const ai = record.mesh.indices[base];
  const bi = record.mesh.indices[base + 1];
  const ci = record.mesh.indices[base + 2];
  if (ai === undefined || bi === undefined || ci === undefined) {
    throw new Error(`triangle ${triangleId} is outside ${record.id}`);
  }
  const a = record.mesh.vertices[ai]!;
  const b = record.mesh.vertices[bi]!;
  const c = record.mesh.vertices[ci]!;
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
  if (length <= 1e-10) throw new Error(`degenerate triangle ${triangleId}`);
  return {
    side: record.side,
    triangleId,
    centroid: [
      (a[0] + b[0] + c[0]) / 3,
      (a[1] + b[1] + c[1]) / 3,
      (a[2] + b[2] + c[2]) / 3
    ],
    normal: [nx / length, ny / length, nz / length],
    areaSquareMeters: length * 0.5
  };
}

function offset(
  p: StageVector3,
  n: StageVector3,
  amount: number
): Vec3 {
  return new Vec3(
    p[0] + n[0] * amount,
    p[1] + n[1] * amount,
    p[2] + n[2] * amount
  );
}

function fullShellSolid(record: UndertowUpperGlassMeshRecord): StageSolidDefinition {
  const xs = record.mesh.vertices.map((v) => v[0]);
  const ys = record.mesh.vertices.map((v) => v[1]);
  const zs = record.mesh.vertices.map((v) => v[2]);
  return {
    id: `Pass15E:${record.id}:full-shell-reference`,
    center: [0, 0, 0],
    size: [
      Math.max(...xs) - Math.min(...xs),
      Math.max(...ys) - Math.min(...ys),
      Math.max(...zs) - Math.min(...zs)
    ],
    material: 'light',
    render: false,
    projectileBlocker: true,
    cameraBlocker: true,
    collisionEnabled: true,
    navigationEnabled: false,
    collisionBehavior: 'SOLID',
    triangleMesh: record.mesh
  };
}

function stage(id: string, solids: readonly StageSolidDefinition[]): StageDefinition {
  return {
    metadata: {
      id,
      displayName: id,
      worldBounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
      teamASpawn: [0, 0, 0],
      teamBSpawn: [0, 0, 0],
      teamASpawnSlots: [[0, 0, 0]],
      teamBSpawnSlots: [[0, 0, 0]],
      tacticalNodes: [],
      splatZones: []
    },
    solids,
    paintSurfaces: [],
    navigationLinks: []
  };
}

function hitMatrix(
  physics: RapierStagePhysics,
  probe: BoundaryProbe,
  purpose: StageQueryPurpose
): { forward: boolean; reverse: boolean } {
  const distance = 0.40;
  const plus = offset(probe.centroid, probe.normal, distance);
  const minus = offset(probe.centroid, probe.normal, -distance);
  return {
    forward: physics.castStageSegment(plus, minus, purpose) !== null,
    reverse: physics.castStageSegment(minus, plus, purpose) !== null
  };
}

describe('T21 Pass 15E upper-glass excluded-boundary diagnostic', () => {
  it('keeps production frozen and does not clear either upper-glass blocker', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers)
      .toContain('UPPER_GLASS_COLLISION_AUTHORITY_PENDING');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers)
      .toContain('UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING');
  });

  it('measures every excluded source triangle against full-shell and broad runtime query geometry without pre-judging disposition', () => {
    const fullPhysics = new RapierStagePhysics(
      1 / 60,
      stage(
        'undertow-pass15e-full-shell-reference',
        UNDERTOW_UPPER_GLASS_SOURCE_MESHES.map(fullShellSolid)
      )
    );
    const broadPhysics = new RapierStagePhysics(
      1 / 60,
      stage(
        'undertow-pass15e-broad-runtime-candidate',
        UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_SOLIDS
      )
    );
    fullPhysics.step();
    broadPhysics.step();

    const probes = UNDERTOW_UPPER_GLASS_SOURCE_MESHES.flatMap((record) =>
      UNDERTOW_UPPER_GLASS_PASS15D_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS.map(
        (triangleId) => triangleProbe(record, triangleId)
      )
    );
    expect(probes).toHaveLength(16);

    const purposes = ['ink-projectile', 'thrown-sub', 'camera'] as const;
    let fullHitCount = 0;
    let broadHitCount = 0;
    for (const probe of probes) {
      const full = Object.fromEntries(
        purposes.map((purpose) => [
          purpose,
          hitMatrix(fullPhysics, probe, purpose)
        ])
      );
      const broad = Object.fromEntries(
        purposes.map((purpose) => [
          purpose,
          hitMatrix(broadPhysics, probe, purpose)
        ])
      );
      for (const purpose of purposes) {
        for (const direction of ['forward', 'reverse'] as const) {
          if (full[purpose][direction]) fullHitCount += 1;
          if (broad[purpose][direction]) broadHitCount += 1;
        }
      }
      console.log(
        'T21GLASS15E',
        JSON.stringify({
          side: probe.side,
          triangleId: probe.triangleId,
          areaSquareMeters: Number(probe.areaSquareMeters.toFixed(9)),
          centroid: probe.centroid.map((v) => Number(v.toFixed(6))),
          normal: probe.normal.map((v) => Number(v.toFixed(6))),
          full,
          broad
        })
      );
    }

    expect(fullHitCount).toBe(
      UNDERTOW_UPPER_GLASS_PASS15E_BOUNDARY_DISPOSITION_AUDIT
        .full102ShellQueryHits
    );
    expect(broadHitCount).toBe(
      UNDERTOW_UPPER_GLASS_PASS15E_BOUNDARY_DISPOSITION_AUDIT
        .current94TriangleBroadQueryHits
    );
    expect(
      UNDERTOW_UPPER_GLASS_PASS15E_BOUNDARY_DISPOSITION_AUDIT
        .broadFinalExclusionDispositionAuthorized
    ).toBe(false);
    expect(
      UNDERTOW_UPPER_GLASS_PASS15E_BOUNDARY_DISPOSITION_AUDIT
        .full102ShellRuntimePromotionAuthorizedByPass15EAlone
    ).toBe(false);
    expect(undertowUpperGlassPass15eBoundaryDispositionErrors()).toEqual([]);
  });
});
