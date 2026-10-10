import type { MetricXZ } from '../measurement/StageMapCalibration';
import { undertowPdfPointToProjectXZ } from './UndertowSpillwayVectorBlueprint';

export interface UndertowSlopeMarkerEnvelope {
  id: string;
  pdfRect: readonly [number, number, number, number];
  metricPolygon: readonly MetricXZ[];
  confidence: 'HIGH';
  role: 'SLOPE_SEMANTIC_FOOTPRINT' | 'MARKER_ENVELOPE_ONLY';
  notes: string;
}

function rectToMetric(
  rect: readonly [number, number, number, number]
): readonly MetricXZ[] {
  const [x0, y0, x1, y1] = rect;
  return [
    undertowPdfPointToProjectXZ([x0, y0]),
    undertowPdfPointToProjectXZ([x1, y0]),
    undertowPdfPointToProjectXZ([x1, y1]),
    undertowPdfPointToProjectXZ([x0, y1])
  ];
}

function marker(
  id: string,
  rect: readonly [number, number, number, number],
  notes: string,
  role: UndertowSlopeMarkerEnvelope['role'] = 'MARKER_ENVELOPE_ONLY'
): UndertowSlopeMarkerEnvelope {
  return {
    id,
    pdfRect: rect,
    metricPolygon: rectToMetric(rect),
    confidence: 'HIGH',
    role,
    notes
  };
}

/**
 * These are source dash-field envelopes, not collision footprints.
 *
 * The author legend defines the repeated dashed field as slope / ramp.
 * T21-B may use these to identify which source faces contain ramps, but T21-D
 * must still derive the hard footprint from surrounding edges and 3D evidence.
 */
export const UNDERTOW_CENTRAL_SLOPE_MARKERS = Object.freeze({
  left: marker(
    'center-left-slope-marker',
    [393.6, 312.36, 409.44, 369.84],
    'Exact vector dashed-hatch slope region centered near project X=-9.91m, Z=+0.35m. It defines the continuous slope footprint, not a hard wall.',
    'SLOPE_SEMANTIC_FOOTPRINT'
  ),
  right: marker(
    'center-right-slope-marker',
    [432.48, 225.36, 448.32, 282.84],
    'Near-180-degree counterpart continuous slope footprint centered near project X=+9.93m, Z=-0.36m.',
    'SLOPE_SEMANTIC_FOOTPRINT'
  ),
  negativeZGlass: marker(
    'negative-z-glass-slope-marker',
    [382.44, 244.92, 420.96, 261.24],
    'Slope dash field inside the negative-Z gray glass overhang face.'
  ),
  positiveZGlass: marker(
    'positive-z-glass-slope-marker',
    [420.96, 333.96, 459.48, 350.28],
    'Slope dash field inside the positive-Z gray glass overhang face.'
  )
});

export function slopeMarkerCenter(
  marker: UndertowSlopeMarkerEnvelope
): MetricXZ {
  const pts = marker.metricPolygon;
  const count = pts.length;
  return [
    pts.reduce((sum, point) => sum + point[0], 0) / count,
    pts.reduce((sum, point) => sum + point[1], 0) / count
  ];
}
