import { describe, expect, it } from 'vitest';
import {
  confidenceAllowedForGeometry,
  exactDeltaYForGeometry,
  exactYForGeometry
} from './MeasurementGeometryGate';

describe('T21 measurement-to-geometry confidence gate', () => {
  it('allows HIGH for blockout but only CONFIRMED for stable freeze', () => {
    expect(confidenceAllowedForGeometry('CONFIRMED', 'BLOCKOUT')).toBe(true);
    expect(confidenceAllowedForGeometry('HIGH', 'BLOCKOUT')).toBe(true);
    expect(confidenceAllowedForGeometry('PROVISIONAL', 'BLOCKOUT')).toBe(false);
    expect(confidenceAllowedForGeometry('UNKNOWN', 'BLOCKOUT')).toBe(false);

    expect(confidenceAllowedForGeometry('CONFIRMED', 'STABLE_FREEZE')).toBe(true);
    expect(confidenceAllowedForGeometry('HIGH', 'STABLE_FREEZE')).toBe(false);
  });

  it('never manufactures an exact Y for unresolved measurements', () => {
    expect(exactYForGeometry({
      confidence: 'UNKNOWN',
      evidenceIds: []
    }, 'BLOCKOUT')).toBeNull();

    expect(exactYForGeometry({
      yMeters: 7.5,
      confidence: 'PROVISIONAL',
      evidenceIds: ['historical-hypothesis']
    }, 'BLOCKOUT')).toBeNull();
  });

  it('allows the confirmed center Y and high-confidence step only at blockout level', () => {
    expect(exactYForGeometry({
      yMeters: 0,
      confidence: 'CONFIRMED',
      evidenceIds: ['center-reference']
    }, 'STABLE_FREEZE')).toBe(0);

    const step = {
      deltaMeters: 1.5,
      confidence: 'HIGH' as const,
      evidenceIds: ['measurement-pass']
    };
    expect(exactDeltaYForGeometry(step, 'BLOCKOUT')).toBe(1.5);
    expect(exactDeltaYForGeometry(step, 'STABLE_FREEZE')).toBeNull();
  });
});
