import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT,
  UNDERTOW_RIGHT_LOW_ROUTE_RAMPS,
  undertowRightLowRouteRampErrors,
  undertowRightLowRouteRampStageSolids
} from './UndertowSpillwayRouteRampGeometry';

describe('T21-D right-low route ramp source meshes', () => {
  it('promotes only the broad mirrored FloorConcrete03 ramp pair', () => {
    expect(undertowRightLowRouteRampErrors()).toEqual([]);
    expect(UNDERTOW_RIGHT_LOW_ROUTE_RAMPS).toHaveLength(2);
    expect(UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT).toMatchObject({
      materialAgnosticCandidatesPerSide: 6,
      exactMirrorPairs: 6,
      selectedPhysicalRampPairs: 1,
      projectYMinMeters: 3,
      projectYMaxMeters: 4.5,
      floorLine00UniformOffsetMeters: 0.05,
      mirrorXorVertices: 0,
      confidence: 'HIGH'
    });
  });

  it('keeps line-marking surfaces out of collision/navigation geometry', () => {
    expect(UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.floorLine03MaxPlaneResidualMeters)
      .toBeLessThanOrEqual(0.0000003);
    expect(UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.floorLine04MaxPlaneResidualMeters)
      .toBeLessThanOrEqual(0.0000003);
    expect(UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.floorLine00UniformOffsetMeters)
      .toBe(0.05);
    expect(UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.every(
      (record) => record.sourceMaterial === 'Fld_Temple01_FloorConcrete03'
    )).toBe(true);
  });

  it('creates two exact triangle-mesh runtime solids', () => {
    const solids = undertowRightLowRouteRampStageSolids();
    expect(solids).toHaveLength(2);
    for (const solid of solids) {
      expect(solid.triangleMesh?.vertices).toHaveLength(4);
      expect(solid.triangleMesh?.indices).toEqual([0, 1, 2, 1, 3, 2]);
      expect(solid.footprint).toBeUndefined();
      expect(solid.projectileBlocker).toBe(true);
      expect(solid.cameraBlocker).toBe(true);
    }
  });
});
