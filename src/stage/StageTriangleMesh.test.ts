import { describe, expect, it } from 'vitest';
import type { StageSolidDefinition } from './StageDefinition';
import {
  selectStageTriangleFaces,
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
  it('compacts selected faces without changing winding or shared edges', () => {
    const source = {
      vertices: [...mesh.vertices, [2, 1, 2], [10, 10, 10]] as const,
      indices: [0, 1, 2, 2, 1, 3, 1, 4, 3]
    };
    expect(selectStageTriangleFaces(source, [1, 0])).toEqual({
      vertices: [source.vertices[2], source.vertices[1], source.vertices[3], source.vertices[0]],
      indices: [0, 1, 2, 3, 1, 0]
    });
    expect(() => selectStageTriangleFaces(source, [0, 0])).toThrow('selected twice');
    expect(() => selectStageTriangleFaces(source, [3])).toThrow('out of range');
    expect(() => selectStageTriangleFaces({
      vertices: [[1, 0, 0], [1 + 1e-12, 0, 0], [1, 0, 1]], indices: [0, 1, 2]
    }, [0])).toThrow('zero area');
  });

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
