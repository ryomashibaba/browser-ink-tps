import { describe, expect, it } from 'vitest';
import type { StageSolidDefinition } from './StageDefinition';
import {
  stageSolidTriangleMeshErrors,
  stageSolidTriangleWorldVertices,
  validateStageTriangleMesh
} from './StageTriangleMesh';

const mesh = {
  vertices: [
    [0, 0, 0],
    [2, 0, 0],
    [0, 1, 2]
  ] as const,
  indices: [0, 1, 2] as const
};

describe('StageTriangleMesh', () => {
  it('validates a compact triangle list', () => {
    expect(validateStageTriangleMesh(mesh)).toEqual([]);
    expect(validateStageTriangleMesh({
      vertices: mesh.vertices,
      indices: [0, 1, 9]
    })).toContain('triangle mesh index 9 is out of range');
  });

  it('forbids ambiguous footprint plus triangle-mesh geometry', () => {
    const solid: StageSolidDefinition = {
      id: 'mixed',
      center: [0, 0, 0],
      size: [2, 1, 2],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true,
      triangleMesh: mesh,
      footprint: {
        outer: [[0, 0], [2, 0], [0, 2]],
        cellSizeMeters: 0.125
      }
    };
    expect(stageSolidTriangleMeshErrors(solid)).toContain(
      'mixed: footprint and triangleMesh are mutually exclusive'
    );
  });

  it('applies the same center/rotation transform used by runtime consumers', () => {
    const solid: StageSolidDefinition = {
      id: 'mesh',
      center: [10, 2, -4],
      size: [2, 1, 2],
      rotationEulerDegrees: [0, 180, 0],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true,
      triangleMesh: mesh
    };
    const vertices = stageSolidTriangleWorldVertices(solid);
    expect(vertices[0]).toEqual([10, 2, -4]);
    expect(vertices[1]![0]).toBeCloseTo(8, 8);
    expect(vertices[1]![2]).toBeCloseTo(-4, 8);
  });
});
