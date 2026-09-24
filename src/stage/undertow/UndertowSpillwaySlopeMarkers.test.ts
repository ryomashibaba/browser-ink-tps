import { describe, expect, it } from 'vitest';
import { rotationSymmetryHausdorffMeters } from '../measurement/StageMapTrace';
import {
  UNDERTOW_CENTRAL_SLOPE_MARKERS,
  slopeMarkerCenter
} from './UndertowSpillwaySlopeMarkers';

describe('T21-B Undertow central slope marker catalog', () => {
  it('identifies the center-left/right dash fields around project X +/-9.8m', () => {
    const leftCenter = slopeMarkerCenter(UNDERTOW_CENTRAL_SLOPE_MARKERS.left);
    const rightCenter = slopeMarkerCenter(UNDERTOW_CENTRAL_SLOPE_MARKERS.right);

    expect(leftCenter[0]).toBeCloseTo(-9.805, 3);
    expect(leftCenter[1]).toBeCloseTo(-0.059, 3);
    expect(rightCenter[0]).toBeCloseTo(9.805, 3);
    expect(rightCenter[1]).toBeCloseTo(0.059, 3);
  });

  it('keeps central slope markers as marker envelopes rather than collision footprints', () => {
    expect(UNDERTOW_CENTRAL_SLOPE_MARKERS.left.role).toBe('MARKER_ENVELOPE_ONLY');
    expect(UNDERTOW_CENTRAL_SLOPE_MARKERS.right.role).toBe('MARKER_ENVELOPE_ONLY');
  });

  it('preserves near-exact 180-degree symmetry for the center slope marker pair', () => {
    expect(rotationSymmetryHausdorffMeters(
      UNDERTOW_CENTRAL_SLOPE_MARKERS.left.metricPolygon,
      UNDERTOW_CENTRAL_SLOPE_MARKERS.right.metricPolygon
    )).toBeLessThan(0.03);
  });

  it('keeps the glass slope marker pair separate from the glass hard outline', () => {
    const negative = UNDERTOW_CENTRAL_SLOPE_MARKERS.negativeZGlass;
    const positive = UNDERTOW_CENTRAL_SLOPE_MARKERS.positiveZGlass;
    expect(negative.role).toBe('MARKER_ENVELOPE_ONLY');
    expect(positive.role).toBe('MARKER_ENVELOPE_ONLY');
    expect(rotationSymmetryHausdorffMeters(
      negative.metricPolygon,
      positive.metricPolygon
    )).toBeLessThan(0.05);
  });
});
