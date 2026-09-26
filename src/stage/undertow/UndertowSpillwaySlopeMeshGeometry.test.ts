import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_CENTER_SLOPE_SOURCE_MESHES,
  UNDERTOW_CENTER_SLOPE_SOURCE_MESH_AUDIT,
  undertowCenterSlopeSourceMeshErrors,
  undertowCenterSlopeStageSolids
} from './UndertowSpillwaySlopeMeshGeometry';

describe('T21-D central slope source meshes', () => {
  it('keeps only the four fully-contained source quads', () => {
    expect(undertowCenterSlopeSourceMeshErrors()).toEqual([]);
    expect(UNDERTOW_CENTER_SLOPE_SOURCE_MESH_AUDIT).toMatchObject({
      sourceCandidateFaceCount: 52,
      sourceConnectedComponentCount: 6,
      selectedFullyContainedComponentCount: 4,
      selectedPerSide: 2,
      excludedPartialOverlapComponentIds: [0, 1],
      selectedComponentIds: [2, 3, 4, 5],
      sourceYMinProjectMeters: -1.5,
      sourceYMaxProjectMeters: 0,
      maxPlaneResidualMeters: 0,
      confidence: 'HIGH'
    });
    expect(UNDERTOW_CENTER_SLOPE_SOURCE_MESHES).toHaveLength(4);
  });

  it('creates four source-triangle solids without footprint approximation', () => {
    const solids = undertowCenterSlopeStageSolids();
    expect(solids).toHaveLength(4);
    for (const solid of solids) {
      expect(solid.triangleMesh?.vertices).toHaveLength(4);
      expect(solid.triangleMesh?.indices).toEqual([0, 1, 2, 1, 3, 2]);
      expect(solid.footprint).toBeUndefined();
      expect(solid.rotationEulerDegrees).toBeUndefined();
      expect(solid.projectileBlocker).toBe(true);
      expect(solid.cameraBlocker).toBe(true);
    }
  });
});
