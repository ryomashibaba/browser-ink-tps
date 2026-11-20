import { Quat, Vec3 } from 'playcanvas';
import type {
  StageSolidDefinition,
  StageTriangleMeshGeometry,
  StageVector3
} from './StageDefinition';

/** Face numbers are zero-based offsets into the source triangle list. */
export function selectStageTriangleFaces(
  source: StageTriangleMeshGeometry,
  faces: readonly number[]
): StageTriangleMeshGeometry {
  if (source.indices.length % 3 !== 0 || faces.length === 0) {
    throw new Error('Terrain selection requires a triangle list and at least one face');
  }

  const vertices: StageVector3[] = [];
  const indices: number[] = [];
  const vertexMap = new Map<number, number>();
  const seenFaces = new Set<number>();
  const ab = new Vec3();
  const ac = new Vec3();

  for (const face of faces) {
    const offset = face * 3;
    if (!Number.isSafeInteger(face) || offset < 0 || offset >= source.indices.length) {
      throw new Error(`Terrain face ${face} is out of range`);
    }
    if (seenFaces.has(face)) throw new Error(`Terrain face ${face} is selected twice`);
    seenFaces.add(face);

    for (let corner = 0; corner < 3; corner++) {
      const index = source.indices[offset + corner]!;
      const vertex = source.vertices[index];
      if (!Number.isInteger(index) || !vertex) {
        throw new Error(`Terrain face ${face} has an invalid vertex index`);
      }
      let compactIndex = vertexMap.get(index);
      if (compactIndex === undefined) {
        // PlayCanvas, Rapier and Recast all upload positions as float32.
        const position: StageVector3 = [
          Math.fround(vertex[0]), Math.fround(vertex[1]), Math.fround(vertex[2])
        ];
        if (position.some((coordinate) => !Number.isFinite(coordinate))) {
          throw new Error(`Terrain face ${face} has a non-finite vertex`);
        }
        compactIndex = vertices.length;
        vertices.push(position);
        vertexMap.set(index, compactIndex);
      }
      indices.push(compactIndex);
    }

    const a = vertices[indices[indices.length - 3]!]!;
    const b = vertices[indices[indices.length - 2]!]!;
    const c = vertices[indices[indices.length - 1]!]!;
    ab.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    ac.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    if (ab.cross(ab, ac).lengthSq() === 0) {
      throw new Error(`Terrain face ${face} has zero area at float32 precision`);
    }
  }

  return { vertices, indices };
}

export function validateStageTriangleMesh(
  mesh: StageTriangleMeshGeometry
): readonly string[] {
  const errors: string[] = [];
  if (mesh.vertices.length < 3) {
    errors.push('triangle mesh requires at least three vertices');
  }
  if (mesh.indices.length < 3 || mesh.indices.length % 3 !== 0) {
    errors.push('triangle mesh indices must contain complete triangles');
  }
  for (const [index, vertex] of mesh.vertices.entries()) {
    if (vertex.some((value) => !Number.isFinite(value))) {
      errors.push(`triangle mesh vertex ${index} contains non-finite coordinates`);
    }
  }
  for (const index of mesh.indices) {
    if (!Number.isInteger(index) || index < 0 || index >= mesh.vertices.length) {
      errors.push(`triangle mesh index ${index} is out of range`);
    }
  }
  return errors;
}

export function stageSolidTriangleMeshErrors(
  solid: StageSolidDefinition
): readonly string[] {
  const errors: string[] = [];
  if (solid.footprint && solid.triangleMesh) {
    errors.push(`${solid.id}: footprint and triangleMesh are mutually exclusive`);
  }
  if (solid.triangleMesh) {
    errors.push(
      ...validateStageTriangleMesh(solid.triangleMesh).map(
        (error) => `${solid.id}: ${error}`
      )
    );
  }
  return errors;
}

export function stageSolidTriangleWorldVertices(
  solid: Pick<StageSolidDefinition, 'center' | 'triangleMesh' | 'rotationEulerDegrees'>
): readonly StageVector3[] {
  const mesh = solid.triangleMesh;
  if (!mesh) return [];
  const rotation = solid.rotationEulerDegrees ?? [0, 0, 0];
  const q = new Quat().setFromEulerAngles(rotation[0], rotation[1], rotation[2]);
  const center = new Vec3(solid.center[0], solid.center[1], solid.center[2]);

  return mesh.vertices.map(([x, y, z]) => {
    const world = rotateVector(new Vec3(x, y, z), q).add(center);
    return [world.x, world.y, world.z] as const;
  });
}

function rotateVector(v: Vec3, q: Quat): Vec3 {
  const ix = q.w * v.x + q.y * v.z - q.z * v.y;
  const iy = q.w * v.y + q.z * v.x - q.x * v.z;
  const iz = q.w * v.z + q.x * v.y - q.y * v.x;
  const iw = -q.x * v.x - q.y * v.y - q.z * v.z;
  return new Vec3(
    ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x
  );
}
