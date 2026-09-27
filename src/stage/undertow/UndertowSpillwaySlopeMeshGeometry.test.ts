import { describe, expect, it } from 'vitest';
import { SurfaceFlags } from '../../ink/types';
import {
  UNDERTOW_CENTER_SLOPE_SOURCE_MESHES,
  UNDERTOW_CENTER_SLOPE_SOURCE_MESH_AUDIT,
  undertowCenterSlopePaintSurfaces,
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
    expect(
      UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.every(
        (record) => record.paintAuthority === 'PAINTABLE'
      )
    ).toBe(true);
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

  it('creates four exact planar PAINTABLE Ramp surfaces without Scoreable authority', () => {
    const surfaces = undertowCenterSlopePaintSurfaces();
    expect(surfaces).toHaveLength(4);
    for (const surface of surfaces) {
      expect(surface.id).toContain('center-slope-');
      expect((surface.flags & SurfaceFlags.Paintable) !== 0).toBe(true);
      expect((surface.flags & SurfaceFlags.Swimmable) !== 0).toBe(true);
      expect((surface.flags & SurfaceFlags.Ramp) !== 0).toBe(true);
      expect((surface.flags & SurfaceFlags.Scoreable) !== 0).toBe(false);
      const dot =
        surface.uAxis[0] * surface.vAxis[0] +
        surface.uAxis[1] * surface.vAxis[1] +
        surface.uAxis[2] * surface.vAxis[2];
      expect(Math.abs(dot)).toBeLessThan(0.000005);
      expect(surface.widthMeters).toBeGreaterThan(3);
      expect(surface.heightMeters).toBeGreaterThan(4);
    }
  });
});
