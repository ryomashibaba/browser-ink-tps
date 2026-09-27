import { describe, expect, it } from 'vitest';
import { SurfaceFlags } from '../../ink/types';
import {
  UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT,
  UNDERTOW_RIGHT_LOW_ROUTE_RAMPS,
  undertowRightLowRouteRampErrors,
  undertowRightLowRouteRampPaintSurfaces,
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
      paintResolutionPass: '10A',
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

  it('pins the author-vector paint registration from CI #746', () => {
    expect(UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource).toMatchObject({
      bytes: 100311,
      sha256: '2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f',
      canonicalDashWidthPoints: 0.24,
      canonicalDashLengthPoints: 0.96,
      routeRampCanonicalDashCountPerSide: 168,
      knownPaintableSlopeMedianBrightness: 255,
      knownUninkableGlassSlopeMedianBrightness: 191,
      positiveZMedianBrightness: 255,
      negativeZMedianBrightness: 255,
      brightnessDistanceToPaintableMedian: 0,
      brightnessDistanceToUninkableMedian: 64,
      exactRampAuthorPaintClassResolved: true
    });
    expect(UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.every(
      (record) => record.paintAuthority === 'PAINTABLE'
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

  it('creates two Ramp paint surfaces without Scoreable', () => {
    const surfaces = undertowRightLowRouteRampPaintSurfaces();
    expect(surfaces).toHaveLength(2);
    for (const surface of surfaces) {
      expect((surface.flags & SurfaceFlags.Paintable) !== 0).toBe(true);
      expect((surface.flags & SurfaceFlags.Swimmable) !== 0).toBe(true);
      expect((surface.flags & SurfaceFlags.Ramp) !== 0).toBe(true);
      expect((surface.flags & SurfaceFlags.Floor) === 0).toBe(true);
      expect((surface.flags & SurfaceFlags.Scoreable) === 0).toBe(true);
    }
  });
});
