import type {
  StageSolidDefinition,
  StageTriangleMeshGeometry,
  StageVector3
} from '../StageDefinition';
import { undertowTemple01ModelXZToProjectXZ } from './UndertowSpillwayModelXZGeometry';

type ModelVertex = readonly [number, number, number];
type ModelTriangle = readonly [ModelVertex, ModelVertex, ModelVertex];

type UndertowUnderpassRouteBaseId =
  | 'underpass-route-slope01'
  | 'underpass-route-floor-concrete01'
  | 'underpass-route-slope00-outer'
  | 'underpass-route-floor-concrete02'
  | 'underpass-route-slope00-inner';

export type UndertowUnderpassRouteId =
  `${UndertowUnderpassRouteBaseId}-${'positive-z' | 'negative-z'}`;

interface SourceRouteComponent {
  id: UndertowUnderpassRouteBaseId;
  sourceObject: string;
  sourceMaterial: string;
  positiveRouteGraphComponentId: number;
  negativeRouteGraphComponentId: number;
  positiveModelTriangles: readonly ModelTriangle[];
  notes: string;
}

export interface UndertowUnderpassRouteRecord {
  id: UndertowUnderpassRouteId;
  side: 'POSITIVE_Z' | 'NEGATIVE_Z';
  sourceObject: string;
  sourceMaterial: string;
  routeGraphComponentId: number;
  mesh: StageTriangleMeshGeometry;
  confidence: 'HIGH';
  notes: string;
}

const SOURCE_ROUTE_COMPONENTS: readonly SourceRouteComponent[] = [
  {
    id: 'underpass-route-slope01',
    sourceObject: 'FldObj_Temple01_PntSet_mesh01_low139_1__FloorSlope01',
    sourceMaterial: 'FldObj_Temple01_PntSet_FloorSlope01',
    positiveRouteGraphComponentId: 0,
    negativeRouteGraphComponentId: 0,
    positiveModelTriangles: [
      [[-19.5, 3.17, 33.3], [-20, 3.17, 33.3], [-19.5, 5.93, 40.2]],
      [[-20, 3.17, 33.3], [-20, 5.93, 40.2], [-19.5, 5.93, 40.2]]
    ],
    notes:
      'CI #688 exact source export. This steep/long source slope follows the existing FloorConcrete03 right-low route ramp in the first 2.00m-relaxed source-surface path.'
  },
  {
    id: 'underpass-route-floor-concrete01',
    sourceObject: 'Fld_Temple01_pCube21595_1__FloorConcrete01',
    sourceMaterial: 'Fld_Temple01_FloorConcrete01',
    positiveRouteGraphComponentId: 0,
    negativeRouteGraphComponentId: 0,
    positiveModelTriangles: [
      [[-4.25, 3, 21.5], [-22, 3, 21.5], [-4.25, 3, 23]],
      [[-22, 3, 21.5], [-22, 3, 23], [-4.25, 3, 23]],
      [[-4.25, 3, 23], [-22, 3, 23], [-4.25, 3, 26.5]],
      [[-22, 3, 23], [-25, 3, 26.5], [-4.25, 3, 26.5]],
      [[-22, 3, 23], [-29.5, 3, 23], [-25, 3, 26.5]],
      [[-29.5, 3, 23], [-29.5, 3, 26.5], [-25, 3, 26.5]],
      [[-4.25, 3, 26.5], [-25, 3, 26.5], [-15.5, 3, 32.5]],
      [[-4.25, 3, 32.5], [-4.25, 3, 26.5], [-15.5, 3, 32.5]],
      [[-25, 3, 26.5], [-25, 3, 32.5], [-15.5, 3, 32.5]],
      [[-15.5, 3, 32.5], [-25, 3, 32.5], [-15.5, 3, 38.5]],
      [[-25, 3, 32.5], [-25, 3, 38.5], [-15.5, 3, 38.5]]
    ],
    notes:
      'CI #688 exact model-Y=3.0m floor source in the localized route chain. It is kept separate from paint authority and production activation.'
  },
  {
    id: 'underpass-route-slope00-outer',
    sourceObject: 'Fld_Temple01_pCube21000_1__FloorSlope00',
    sourceMaterial: 'Fld_Temple01_FloorSlope00',
    positiveRouteGraphComponentId: 9,
    negativeRouteGraphComponentId: 5,
    positiveModelTriangles: [
      [[-8.625, 3, 19.5], [-4.25, 3, 19.5], [-8.625, 4.5, 15]],
      [[-4.25, 3, 19.5], [-4.25, 4.5, 15], [-8.625, 4.5, 15]]
    ],
    notes:
      'CI #688 exact mirrored FloorSlope00 pair between the model-Y=3.0 and 4.5 route surfaces.'
  },
  {
    id: 'underpass-route-floor-concrete02',
    sourceObject: 'Fld_Temple01_pCube20989_1__FloorConcrete02',
    sourceMaterial: 'Fld_Temple01_FloorConcrete02',
    positiveRouteGraphComponentId: 3,
    negativeRouteGraphComponentId: 3,
    positiveModelTriangles: [
      [[-16, 4.5, 12.5], [-16, 4.5, 14.5], [-13, 4.5, 12.5]],
      [[-16, 4.5, 14.5], [-2.75, 4.5, 14.5], [-13, 4.5, 12.5]],
      [[-13, 4.5, 12.5], [-2.75, 4.5, 14.5], [-2.75, 4.5, 11]],
      [[-13, 4.5, 11], [-13, 4.5, 12.5], [-2.75, 4.5, 11]]
    ],
    notes:
      'CI #688 exact model-Y=4.5m intermediate floor source in the underpass route chain.'
  },
  {
    id: 'underpass-route-slope00-inner',
    sourceObject: 'Fld_Temple01_pCube21000_1__FloorSlope00',
    sourceMaterial: 'Fld_Temple01_FloorSlope00',
    positiveRouteGraphComponentId: 4,
    negativeRouteGraphComponentId: 7,
    positiveModelTriangles: [
      [[-11.25, 3, 6], [-13, 3, 6], [-11.25, 4.5, 10.5]],
      [[-13, 3, 6], [-13, 4.5, 10.5], [-11.25, 4.5, 10.5]]
    ],
    notes:
      'CI #688 exact inner FloorSlope00 pair contacting the independently audited underpass region.'
  }
] as const;

function projectModelVertex(
  vertex: ModelVertex,
  side: 'POSITIVE_Z' | 'NEGATIVE_Z'
): StageVector3 {
  const [mx, my, mz] =
    side === 'POSITIVE_Z'
      ? vertex
      : ([-vertex[0], vertex[1], -vertex[2]] as const);
  const [x, z] = undertowTemple01ModelXZToProjectXZ([mx, mz]);
  return [x, my - 3, z];
}

function meshFromSource(
  triangles: readonly ModelTriangle[],
  side: 'POSITIVE_Z' | 'NEGATIVE_Z'
): StageTriangleMeshGeometry {
  const vertices: StageVector3[] = [];
  const indices: number[] = [];
  for (const triangle of triangles) {
    for (const vertex of triangle) {
      indices.push(vertices.length);
      vertices.push(projectModelVertex(vertex, side));
    }
  }
  return { vertices, indices };
}

export const UNDERTOW_UNDERPASS_ROUTE_COMPONENTS:
  readonly UndertowUnderpassRouteRecord[] = SOURCE_ROUTE_COMPONENTS.flatMap(
  (source) =>
    (['POSITIVE_Z', 'NEGATIVE_Z'] as const).map((side) => ({
      id: `${source.id}-${side === 'POSITIVE_Z' ? 'positive-z' : 'negative-z'}`
        as UndertowUnderpassRouteId,
      side,
      sourceObject: source.sourceObject,
      sourceMaterial: source.sourceMaterial,
      routeGraphComponentId:
        side === 'POSITIVE_Z'
          ? source.positiveRouteGraphComponentId
          : source.negativeRouteGraphComponentId,
      mesh: meshFromSource(source.positiveModelTriangles, side),
      confidence: 'HIGH' as const,
      notes: source.notes
    }))
);

export const UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT = Object.freeze({
  source: 'verified Temple01 OBJ + CI #688 exact route export',
  newComponentsPerSide: 5,
  newTrianglesPerSide: 21,
  existingFloorConcrete03RampTrianglesPerSide: 2,
  strictSourceSurfaceThresholdMeters: 0.30,
  strictSourceSurfaceReachable: false,
  diagnosticFirstReachThresholdMeters: 2.0,
  captureEvidenceKind: 'TRAVERSABLE_CONNECTION',
  offMeshLinkAuthorized: false,
  confidence: 'HIGH' as const,
  notes:
    'These are exact source floor/slope faces from the localized right-low-to-underpass chain. Their inclusion is a Recast/runtime binding experiment, not evidence that the source graph itself is continuous. No jump/drop/climb link is authorized by the available capture evidence.'
});

export function undertowUnderpassRouteStageSolids():
  readonly StageSolidDefinition[] {
  return UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.map((record) => {
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

export function undertowUnderpassRouteErrors(): readonly string[] {
  const errors: string[] = [];
  if (UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.length !== 10) {
    errors.push('underpass route must contain five exact source components per side');
  }

  for (const record of UNDERTOW_UNDERPASS_ROUTE_COMPONENTS) {
    if (
      record.mesh.vertices.length === 0 ||
      record.mesh.indices.length !== record.mesh.vertices.length ||
      record.mesh.indices.length % 3 !== 0
    ) {
      errors.push(`${record.id}: invalid exact source triangle mesh`);
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
        break;
      }
    }
  }

  if (UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.offMeshLinkAuthorized) {
    errors.push('underpass route audit must not authorize an unsupported off-mesh link');
  }
  return errors;
}
