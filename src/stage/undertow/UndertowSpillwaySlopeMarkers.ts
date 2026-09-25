import type { MetricXZ } from '../measurement/StageMapCalibration';
import { undertowPdfPointToProjectXZ } from './UndertowSpillwayVectorBlueprint';

export interface UndertowSlopeMarkerEnvelope {
  id: string;
  pdfRect: readonly [number, number, number, number];
  metricPolygon: readonly MetricXZ[];
  confidence: 'HIGH';
  role: 'MARKER_ENVELOPE_ONLY';
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
  notes: string
): UndertowSlopeMarkerEnvelope {
  return {
    id,
    pdfRect: rect,
    metricPolygon: rectToMetric(rect),
    confidence: 'HIGH',
    role: 'MARKER_ENVELOPE_ONLY',
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
    [396.8333333333, 314.3999938965, 403.0833333333, 365.1599884033],
    'Marker field centered at project X≈-9.8m, Z≈0; this is the central-left ramp marker family.'
  ),
  right: marker(
    'center-right-slope-marker',
    [438.8333333333, 230.1599884033, 445.0833333333, 280.9200134277],
    '180-degree counterpart centered at project X≈+9.8m, Z≈0.'
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
