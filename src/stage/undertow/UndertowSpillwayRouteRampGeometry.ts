import type {
  StageSolidDefinition,
  StageTriangleMeshGeometry,
  StageVector3
} from '../StageDefinition';
import { undertowProjectXZToTemple01ModelXZ } from './UndertowSpillwayModelXZGeometry';

export type UndertowRightLowRouteRampId =
  | 'right-low-route-ramp-positive-z'
  | 'right-low-route-ramp-negative-z';

export interface UndertowRightLowRouteRampRecord {
  id: UndertowRightLowRouteRampId;
  side: 'POSITIVE_Z' | 'NEGATIVE_Z';
  sourceObject: 'Fld_Temple01_pCube21569_1__FloorConcrete03';
  sourceMaterial: 'Fld_Temple01_FloorConcrete03';
  mesh: StageTriangleMeshGeometry;
  confidence: 'HIGH';
  notes: string;
}

const INDICES = [0, 1, 2, 1, 3, 2] as const;

export const UNDERTOW_RIGHT_LOW_ROUTE_RAMPS:
  readonly UndertowRightLowRouteRampRecord[] = [
  {
    id: 'right-low-route-ramp-positive-z',
    side: 'POSITIVE_Z',
    sourceObject: 'Fld_Temple01_pCube21569_1__FloorConcrete03',
    sourceMaterial: 'Fld_Temple01_FloorConcrete03',
    mesh: {
      vertices: [
        [8.333487, 4.5, 52.203114],
        [5.046481, 4.5, 45.49824],
        [4.142941, 3.0, 54.257493],
        [0.855934, 3.0, 47.552619]
      ],
      indices: INDICES
    },
    confidence: 'HIGH',
    notes:
      'CI #672 material-agnostic audit: exact mirrored FloorConcrete03 quad physically touches the independently measured first-drop landing (project Y=3.0) and right-low floor (project Y=4.5).'
  },
  {
    id: 'right-low-route-ramp-negative-z',
    side: 'NEGATIVE_Z',
    sourceObject: 'Fld_Temple01_pCube21569_1__FloorConcrete03',
    sourceMaterial: 'Fld_Temple01_FloorConcrete03',
    mesh: {
      vertices: [
        [-8.104119, 4.5, -52.00855],
        [-4.817113, 4.5, -45.303676],
        [-3.913572, 3.0, -54.062929],
        [-0.626566, 3.0, -47.358055]
      ],
      indices: INDICES
    },
    confidence: 'HIGH',
    notes:
      'Exact Temple01 model-space 180-degree counterpart of the positive-Z route ramp; CI #672 mirror XOR is zero.'
  }
] as const;

export const UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT = Object.freeze({
  materialAgnosticCandidatesPerSide: 6,
  exactMirrorPairs: 6,
  selectedPhysicalRampPairs: 1,
  selectedSourceObject: 'Fld_Temple01_pCube21569_1__FloorConcrete03',
  selectedSourceMaterial: 'Fld_Temple01_FloorConcrete03',
  sourceModelYMinMeters: 6.0,
  sourceModelYMaxMeters: 7.5,
  projectYMinMeters: 3.0,
  projectYMaxMeters: 4.5,
  normalY: 0.948683,
  floorLine03MaxPlaneResidualMeters: 0.0000003,
  floorLine04MaxPlaneResidualMeters: 0.0000003,
  floorLine00UniformOffsetMeters: 0.05,
  mirrorXorVertices: 0,
  confidence: 'HIGH' as const,
  notes:
    'CI #672 found six mirrored inclined candidates per side. FloorLine03/04 are coplanar marking surfaces on the broad FloorConcrete03 ramp, while FloorLine00 is a uniform +0.05m marking overlay. Only the broad FloorConcrete03 source quad is promoted to collision/navigation geometry to avoid duplicate coplanar ramp surfaces.'
});

export function undertowRightLowRouteRampStageSolids():
  readonly StageSolidDefinition[] {
  return UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.map((record) => {
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

export function undertowRightLowRouteRampErrors(): readonly string[] {
  const errors: string[] = [];
  if (UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.length !== 2) {
    errors.push('right-low route ramp pair must remain symmetric and complete');
  }

  for (const record of UNDERTOW_RIGHT_LOW_ROUTE_RAMPS) {
    if (record.mesh.vertices.length !== 4 || record.mesh.indices.length !== 6) {
      errors.push(`${record.id}: route ramp must remain one exact source quad`);
    }
    const ys = record.mesh.vertices.map((vertex) => vertex[1]);
    if (Math.min(...ys) !== 3 || Math.max(...ys) !== 4.5) {
      errors.push(`${record.id}: route ramp Y endpoints drifted`);
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

  const positiveModel = UNDERTOW_RIGHT_LOW_ROUTE_RAMPS[0]!.mesh.vertices.map(
    ([x, y, z]) => {
      const [mx, mz] = undertowProjectXZToTemple01ModelXZ([x, z]);
      return [mx, y, mz] as const;
    }
  );
  const negativeModel = UNDERTOW_RIGHT_LOW_ROUTE_RAMPS[1]!.mesh.vertices.map(
    ([x, y, z]) => {
      const [mx, mz] = undertowProjectXZToTemple01ModelXZ([x, z]);
      return [mx, y, mz] as const;
    }
  );
  const mirrorToleranceMeters = 0.000005;
  for (const [px, py, pz] of positiveModel) {
    const found = negativeModel.some(
      ([nx, ny, nz]) =>
        Math.abs(nx + px) <= mirrorToleranceMeters &&
        Math.abs(ny - py) <= mirrorToleranceMeters &&
        Math.abs(nz + pz) <= mirrorToleranceMeters
    );
    if (!found) {
      errors.push('right-low route ramp vertices lost model-space 180-degree symmetry');
      break;
    }
  }

  return errors;
}
