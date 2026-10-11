import { describe, expect, it } from 'vitest';
import {
  metricXZToPixel,
  pixelToMetricXZ,
  rotationSymmetryResidualMeters
} from '../measurement/StageMapCalibration';
import {
  UNDERTOW_NEGATIVE_Z_SPAWN_PIXEL,
  UNDERTOW_NEGATIVE_Z_SPAWN_XZ,
  UNDERTOW_POSITIVE_Z_SPAWN_PIXEL,
  UNDERTOW_POSITIVE_Z_SPAWN_XZ,
  UNDERTOW_PROVISIONAL_OUTER_BOUNDS,
  UNDERTOW_TURF_MAP_AUDIT,
  UNDERTOW_TURF_MAP_CALIBRATION,
  UNDERTOW_TURF_MAP_ORIGIN_PIXEL
} from './UndertowSpillwayMapCalibration';

describe('T21-B Undertow Turf map calibration', () => {
  it('maps the measured image center to project XZ origin', () => {
    expect(pixelToMetricXZ(
      UNDERTOW_TURF_MAP_CALIBRATION,
      UNDERTOW_TURF_MAP_ORIGIN_PIXEL
    )).toEqual([0, 0]);
  });

  it('reconstructs the measured spawn separation at about 134.4m', () => {
    expect(UNDERTOW_TURF_MAP_AUDIT.spawnSeparationMeters).toBeCloseTo(134.4127, 3);
  });

  it('places both spawn anchors on the same longitudinal axis', () => {
    expect(UNDERTOW_NEGATIVE_Z_SPAWN_XZ[0]).toBeCloseTo(0, 3);
    expect(UNDERTOW_POSITIVE_Z_SPAWN_XZ[0]).toBeCloseTo(0, 3);
    expect(UNDERTOW_NEGATIVE_Z_SPAWN_XZ[1]).toBeCloseTo(-67.2623, 3);
    expect(UNDERTOW_POSITIVE_Z_SPAWN_XZ[1]).toBeCloseTo(67.1505, 3);
  });

  it('shows sub-decimeter origin error against the measured spawn midpoint', () => {
    expect(UNDERTOW_TURF_MAP_AUDIT.originVsSpawnMidpointPixels).toBeCloseTo(Math.sqrt(1.25), 6);
    expect(UNDERTOW_TURF_MAP_AUDIT.originVsSpawnMidpointMeters).toBeLessThan(0.06);
  });

  it('keeps 180-degree spawn symmetry residual close to one tenth meter', () => {
    expect(rotationSymmetryResidualMeters(
      UNDERTOW_NEGATIVE_Z_SPAWN_XZ,
      UNDERTOW_POSITIVE_Z_SPAWN_XZ
    )).toBeLessThan(0.12);
  });

  it('round-trips measured map pixels through metric XZ', () => {
    for (const pixel of [
      UNDERTOW_TURF_MAP_ORIGIN_PIXEL,
      UNDERTOW_NEGATIVE_Z_SPAWN_PIXEL,
      UNDERTOW_POSITIVE_Z_SPAWN_PIXEL,
      [1200, 900] as const,
      [2300, 1600] as const
    ]) {
      const roundTrip = metricXZToPixel(
        UNDERTOW_TURF_MAP_CALIBRATION,
        pixelToMetricXZ(UNDERTOW_TURF_MAP_CALIBRATION, pixel)
      );
      expect(roundTrip[0]).toBeCloseTo(pixel[0], 9);
      expect(roundTrip[1]).toBeCloseTo(pixel[1], 9);
    }
  });

  it('does not promote previous whole-stage extents beyond PROVISIONAL', () => {
    expect(UNDERTOW_PROVISIONAL_OUTER_BOUNDS.confidence).toBe('PROVISIONAL');
    expect(UNDERTOW_PROVISIONAL_OUTER_BOUNDS.maxZ - UNDERTOW_PROVISIONAL_OUTER_BOUNDS.minZ)
      .toBe(146);
    expect(UNDERTOW_PROVISIONAL_OUTER_BOUNDS.maxX - UNDERTOW_PROVISIONAL_OUTER_BOUNDS.minX)
      .toBe(87);
  });
});
