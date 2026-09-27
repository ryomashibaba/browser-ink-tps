import { SurfaceFlags } from '../../ink/types';
import type {
  StagePaintSurfaceDefinition,
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
  paintAuthority: 'PAINTABLE';
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
    paintAuthority: 'PAINTABLE',
    confidence: 'HIGH',
    notes:
      'CI #672 material-agnostic geometry audit binds the exact FloorConcrete03 quad. Resolution Pass 10A / CI #746 additionally registers this exact quad to the author Turf PDF white slope-marker field, authorizing PAINTABLE semantics without relying on the material name.'
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
    paintAuthority: 'PAINTABLE',
    confidence: 'HIGH',
    notes:
      'Exact Temple01 model-space 180-degree counterpart; CI #672 mirror XOR is zero and Resolution Pass 10A / CI #746 independently finds the same white slope-marker author class on this side.'
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
  paintResolutionPass: '10A' as const,
  turfVectorSource: Object.freeze({
    bytes: 100311,
    sha256: '2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f',
    pageWidthPoints: 841.920044,
    pageHeightPoints: 595.320007,
    canonicalDashWidthPoints: 0.24,
    canonicalDashLengthPoints: 0.96,
    routeRampCanonicalDashCountPerSide: 168,
    positiveZDashMidpointInside: 133,
    positiveZDashFullyInside: 126,
    positiveZDashMidpointInsideFraction: 0.791667,
    positiveZDashFullyInsideFraction: 0.75,
    negativeZDashMidpointInside: 126,
    negativeZDashFullyInside: 126,
    negativeZDashMidpointInsideFraction: 0.75,
    negativeZDashFullyInsideFraction: 0.75,
    knownPaintableSlopeMedianBrightness: 255,
    knownUninkableGlassSlopeMedianBrightness: 191,
    positiveZMedianBrightness: 255,
    negativeZMedianBrightness: 255,
    positiveZNearWhiteFraction: 0.883422,
    negativeZNearWhiteFraction: 0.87854,
    brightnessDistanceToPaintableMedian: 0,
    brightnessDistanceToUninkableMedian: 64,
    exactRampAuthorPaintClassResolved: true
  }),
  confidence: 'HIGH' as const,
  notes:
    'CI #672 binds one exact broad mirrored FloorConcrete03 source quad per side while excluding coplanar FloorLine marking overlays. Resolution Pass 10A projects those exact quads into the pinned Sunfish Turf vector PDF. Each 3pt-padded query contains 168 instances of the same 0.24pt black / 0.96pt slope-dash family seen on known central paintable slopes; exact-polygon containment remains substantial (positive: 133 midpoint / 126 full, negative: 126 / 126). Both ramp interiors have median raster brightness 255 and ~88% near-white samples, matching the known white paintable slope class and separating from the gray uninkable glass-slope class at median 191. Paint authority is therefore promoted from author vector semantics, not from FloorConcrete naming.'
});

const RIGHT_LOW_ROUTE_RAMP_PAINT_FLAGS =
  SurfaceFlags.Paintable |
  SurfaceFlags.Swimmable |
  SurfaceFlags.Ramp;

export function undertowRightLowRouteRampPaintSurfaces():
  readonly StagePaintSurfaceDefinition[] {
  return UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.map((record) => {
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
    return {
      id: `UndertowT21D:${record.id}:paint`,
      backingSolidId: `UndertowT21D:${record.id}`,
      center: [
        centerBase[0] + normal[0] * 0.002,
        centerBase[1] + normal[1] * 0.002,
        centerBase[2] + normal[2] * 0.002
      ],
      uAxis,
      vAxis,
      widthMeters: width,
      heightMeters: height,
      flags: RIGHT_LOW_ROUTE_RAMP_PAINT_FLAGS
    };
  });
}

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
    if (record.paintAuthority !== 'PAINTABLE') {
      errors.push(`${record.id}: Resolution Pass 10A paint authority drifted`);
    }
    if (record.mesh.vertices.length !== 4 || record.mesh.indices.length !== 6) {
      errors.push(`${record.id}: route ramp must remain one exact source quad`);
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
      dot3(u, v) / (length3(u) * length3(v))
    );
    if (oppositeResidual > 0.000005 || orthogonality > 0.000005) {
      errors.push(
        `${record.id}: exact route-ramp quad no longer supports rectangular PaintSurface basis`
      );
    }

    const ys = record.mesh.vertices.map((vertex) => vertex[1]);
    if (Math.min(...ys) !== 3 || Math.max(...ys) !== 4.5) {
      errors.push(`${record.id}: route ramp Y endpoints drifted`);
    }

    for (let i = 0; i < record.mesh.indices.length; i += 3) {
      const a = record.mesh.vertices[record.mesh.indices[i]!]!;
      const b = record.mesh.vertices[record.mesh.indices[i + 1]!]!;
      const cc = record.mesh.vertices[record.mesh.indices[i + 2]!]!;
      const ux = b[0] - a[0];
      const uz = b[2] - a[2];
      const vx = cc[0] - a[0];
      const vz = cc[2] - a[2];
      const normalY = uz * vx - ux * vz;
      if (!(normalY > 0)) {
        errors.push(`${record.id}: source triangle winding is not upward`);
      }
    }
  }

  const vector = UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource;
  if (
    !vector.exactRampAuthorPaintClassResolved ||
    vector.routeRampCanonicalDashCountPerSide !== 168 ||
    vector.knownPaintableSlopeMedianBrightness !== 255 ||
    vector.knownUninkableGlassSlopeMedianBrightness !== 191 ||
    vector.positiveZMedianBrightness !== 255 ||
    vector.negativeZMedianBrightness !== 255 ||
    vector.brightnessDistanceToPaintableMedian !== 0 ||
    vector.brightnessDistanceToUninkableMedian !== 64
  ) {
    errors.push('Resolution Pass 10A Turf-vector paint registration drifted');
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

function subtract3(a: StageVector3, b: StageVector3): StageVector3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function length3(v: StageVector3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

function dot3(a: StageVector3, b: StageVector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize3(v: StageVector3): StageVector3 {
  const length = length3(v);
  if (length <= 1e-12) {
    throw new Error('Undertow route-ramp paint basis cannot be zero-length.');
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
