import { Quat, Vec3 } from 'playcanvas';
import type {
  StageSolidDefinition,
  StageTriangleMeshGeometry,
  StageVector3
} from './StageDefinition';

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
  solid: StageSolidDefinition
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
