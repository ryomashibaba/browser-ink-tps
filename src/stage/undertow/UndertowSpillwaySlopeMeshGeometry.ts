import { SurfaceFlags } from '../../ink/types';
import type {
  StagePaintSurfaceDefinition,
  StageSolidDefinition,
  StageTriangleMeshGeometry,
  StageVector3
} from '../StageDefinition';

export type UndertowCenterSlopeMeshId =
  | 'center-slope-left-a'
  | 'center-slope-left-b'
  | 'center-slope-right-a'
  | 'center-slope-right-b';

export interface UndertowCenterSlopeMeshRecord {
  id: UndertowCenterSlopeMeshId;
  side: 'LEFT' | 'RIGHT';
  sourceComponentId: 2 | 3 | 4 | 5;
  plane: Readonly<{ a: number; b: number; c: number }>;
  mesh: StageTriangleMeshGeometry;
  paintAuthority: 'PAINTABLE';
  confidence: 'HIGH';
  notes: string;
}

const INDICES = [0, 1, 2, 1, 3, 2] as const;

export const UNDERTOW_CENTER_SLOPE_SOURCE_MESHES:
  readonly UndertowCenterSlopeMeshRecord[] = [
  {
    id: 'center-slope-left-a',
    side: 'LEFT',
    sourceComponentId: 2,
    plane: { a: 0.141478657309, b: 0.288589858576, c: 0.4557 },
    mesh: {
      vertices: [
        [-11.704005, -1.5, -1.038959],
        [-14.730511, -1.5, 0.444759],
        [-9.649626, 0, 3.151587],
        [-12.676132, 0, 4.635306]
      ],
      indices: INDICES
    },
    paintAuthority: 'PAINTABLE',
    confidence: 'HIGH',
    notes:
      'CI #658 source component 2: exact two-triangle FloorSlope00 quad fully contained by the LEFT central slope semantic marker.'
  },
  {
    id: 'center-slope-left-b',
    side: 'LEFT',
    sourceComponentId: 3,
    plane: { a: 0.141478657309, b: 0.288589858576, c: 0.4557 },
    mesh: {
      vertices: [
        [-5.883802, -1.5, -3.892263],
        [-8.910307, -1.5, -2.408545],
        [-3.829423, 0, 0.298284],
        [-6.855929, 0, 1.782002]
      ],
      indices: INDICES
    },
    paintAuthority: 'PAINTABLE',
    confidence: 'HIGH',
    notes:
      'CI #658 source component 3: exact two-triangle FloorSlope00 quad fully contained by the LEFT central slope semantic marker.'
  },
  {
    id: 'center-slope-right-a',
    side: 'RIGHT',
    sourceComponentId: 4,
    plane: { a: -0.141478657309, b: -0.288589858576, c: 0.5443 },
    mesh: {
      vertices: [
        [11.933373, -1.5, 1.233523],
        [14.959879, -1.5, -0.250195],
        [9.878995, 0, -2.957023],
        [12.9055, 0, -4.440741]
      ],
      indices: INDICES
    },
    paintAuthority: 'PAINTABLE',
    confidence: 'HIGH',
    notes:
      'CI #658 source component 4: exact two-triangle FloorSlope00 quad fully contained by the RIGHT central slope semantic marker.'
  },
  {
    id: 'center-slope-right-b',
    side: 'RIGHT',
    sourceComponentId: 5,
    plane: { a: -0.141478657309, b: -0.288589858576, c: 0.5443 },
    mesh: {
      vertices: [
        [6.11317, -1.5, 4.086827],
        [9.139676, -1.5, 2.603109],
        [4.058791, 0, -0.103719],
        [7.085297, 0, -1.587437]
      ],
      indices: INDICES
    },
    paintAuthority: 'PAINTABLE',
    confidence: 'HIGH',
    notes:
      'CI #658 source component 5: exact two-triangle FloorSlope00 quad fully contained by the RIGHT central slope semantic marker.'
  }
] as const;

export const UNDERTOW_CENTER_SLOPE_SOURCE_MESH_AUDIT = Object.freeze({
  sourceObject: 'Fld_Temple01_pCube21000_1__FloorSlope00',
  sourceCandidateFaceCount: 52,
  sourceConnectedComponentCount: 6,
  selectedFullyContainedComponentCount: 4,
  selectedPerSide: 2,
  excludedPartialOverlapComponentIds: [0, 1] as const,
  selectedComponentIds: [2, 3, 4, 5] as const,
  sourceYMinProjectMeters: -1.5,
  sourceYMaxProjectMeters: 0,
  maxPlaneResidualMeters: 0,
  confidence: 'HIGH' as const,
  notes:
    'CI #658 proves two large 22-face FloorSlope00 components only partially overlap the semantic marker and are excluded. The four selected components are fully-contained exact planar quads.'
});

const CENTER_SLOPE_PAINT_FLAGS =
  SurfaceFlags.Paintable |
  SurfaceFlags.Swimmable |
  SurfaceFlags.Ramp;

export function undertowCenterSlopePaintSurfaces():
  readonly StagePaintSurfaceDefinition[] {
  return UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.map((record) => {
    const [p0, p1, p2, p3] = record.mesh.vertices;
    const u = subtract3(p1!, p0!);
    const v = subtract3(p2!, p0!);
    const width = length3(u);
    const height = length3(v);
    const uAxis = normalize3(u);
    const vAxis = normalize3(v);
    const normal = normalize3(cross3(uAxis, vAxis));
    const centerBase: StageVector3 = [
      (p0![0] + p1![0] + p2![0] + p3![0]) * 0.25,
      (p0![1] + p1![1] + p2![1] + p3![1]) * 0.25,
      (p0![2] + p1![2] + p2![2] + p3![2]) * 0.25
    ];
    const center: StageVector3 = [
      centerBase[0] + normal[0] * 0.002,
      centerBase[1] + normal[1] * 0.002,
      centerBase[2] + normal[2] * 0.002
    ];
    return {
      id: `UndertowT21D:${record.id}:paint`,
      backingSolidId: `UndertowT21D:${record.id}`,
      center,
      uAxis,
      vAxis,
      widthMeters: width,
      heightMeters: height,
      flags: CENTER_SLOPE_PAINT_FLAGS
    };
  });
}

export function undertowCenterSlopeStageSolids():
  readonly StageSolidDefinition[] {
  return UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.map((record) => {
    const bounds = meshBounds(record.mesh.vertices);
    return {
      id: `UndertowT21D:${record.id}`,
      center: [0, 0, 0],
      size: [
        bounds.maxX - bounds.minX,
        bounds.maxY - bounds.minY,
        bounds.maxZ - bounds.minZ
      ],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true,
      triangleMesh: record.mesh
    };
  });
}

function meshBounds(vertices: readonly StageVector3[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
} {
  return {
    minX: Math.min(...vertices.map((v) => v[0])),
    maxX: Math.max(...vertices.map((v) => v[0])),
    minY: Math.min(...vertices.map((v) => v[1])),
    maxY: Math.max(...vertices.map((v) => v[1])),
    minZ: Math.min(...vertices.map((v) => v[2])),
    maxZ: Math.max(...vertices.map((v) => v[2]))
  };
}

export function undertowCenterSlopeSourceMeshErrors(): readonly string[] {
  const errors: string[] = [];
  const seen = new Set<number>();
  for (const record of UNDERTOW_CENTER_SLOPE_SOURCE_MESHES) {
    if (seen.has(record.sourceComponentId)) {
      errors.push(`${record.id}: duplicate source component`);
    }
    seen.add(record.sourceComponentId);

    if (record.mesh.vertices.length !== 4 || record.mesh.indices.length !== 6) {
      errors.push(`${record.id}: selected source slope must remain one exact quad`);
    }
    if (record.paintAuthority !== 'PAINTABLE') {
      errors.push(`${record.id}: central slope paint authority must remain PAINTABLE`);
    }
    const [p0, p1, p2, p3] = record.mesh.vertices;
    const u = subtract3(p1!, p0!);
    const v = subtract3(p2!, p0!);
    const oppositeResidual = length3([
      p0![0] + p3![0] - p1![0] - p2![0],
      p0![1] + p3![1] - p1![1] - p2![1],
      p0![2] + p3![2] - p1![2] - p2![2]
    ]);
    const orthogonality = Math.abs(
      (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) /
        (length3(u) * length3(v))
    );
    if (oppositeResidual > 0.000005 || orthogonality > 0.000005) {
      errors.push(`${record.id}: exact slope quad no longer supports rectangular PaintSurface basis`);
    }
    const ys = record.mesh.vertices.map((vertex) => vertex[1]);
    if (Math.min(...ys) !== -1.5 || Math.max(...ys) !== 0) {
      errors.push(`${record.id}: source slope Y endpoints drifted`);
    }
    for (const [x, y, z] of record.mesh.vertices) {
      const expected = record.plane.a * x + record.plane.b * z + record.plane.c;
      if (Math.abs(y - expected) > 0.000001) {
        errors.push(`${record.id}: vertex no longer lies on audited plane`);
      }
    }
    for (let i = 0; i < record.mesh.indices.length; i += 3) {
      const a = record.mesh.vertices[record.mesh.indices[i]!]!;
      const b = record.mesh.vertices[record.mesh.indices[i + 1]!]!;
      const c = record.mesh.vertices[record.mesh.indices[i + 2]!]!;
      const ux = b[0] - a[0];
      const uz = b[2] - a[2];
      const vx = c[0] - a[0];
      const vz = c[2] - a[2];
      const normalY = uz * vx - ux * vz;
      if (!(normalY > 0)) {
        errors.push(`${record.id}: source triangle winding is not upward`);
      }
    }
  }
  return errors;
}


function subtract3(a: StageVector3, b: StageVector3): StageVector3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function length3(v: StageVector3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

function normalize3(v: StageVector3): StageVector3 {
  const length = length3(v);
  if (length <= 1e-12) {
    throw new Error('Undertow center slope paint basis cannot be zero-length.');
  }
  return [v[0] / length, v[1] / length, v[2] / length];
}

function cross3(a: StageVector3, b: StageVector3): StageVector3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}
