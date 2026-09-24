import type { EvidenceConfidence } from '../measurement/StageMeasurementLedger';
import type { MetricXZ } from '../measurement/StageMapCalibration';

export type PdfPoint = readonly [number, number];

export type UndertowBlueprintSourceClass =
  | 'HARD_EDGE'
  | 'WHITE_SOURCE_FACE'
  | 'UNINKABLE_GRAY'
  | 'UNINKABLE_GLASS_OVERHANG'
  | 'SLOPE_MARKER_FIELD'
  | 'WATER_CYAN';

export interface UndertowVectorTrace {
  id: string;
  geometryKind: 'POINT' | 'POLYLINE' | 'POLYGON';
  pdfPoints: readonly PdfPoint[];
  metricPoints: readonly MetricXZ[];
  sourceClass: UndertowBlueprintSourceClass;
  confidence: EvidenceConfidence;
  evidenceIds: readonly string[];
  notes?: string;
}

/**
 * Sunfish Undertow Spillway Turf blueprint, A4 landscape.
 *
 * The user-provided JPEG is 3508x2482 and exactly matches the image size used
 * by the previous T21 measurement pass. The companion PDF is vector CAD
 * output, so T21-B uses the PDF linework as the primary XZ source and the JPEG
 * only for visual cross-checking.
 *
 * 20 px/m at the JPEG's 300-dpi horizontal export equals 4.8 PDF pt/m.
 * This remains a HIGH-confidence project calibration, not an official
 * Nintendo real-world meter specification.
 */
export const UNDERTOW_VECTOR_BLUEPRINT_SOURCE = Object.freeze({
  label: 'Sunfish Undertow Spillway Turf blueprint / user-provided vector PDF',
  sourceUpdated: '2024-05-06',
  pageWidthPoints: 841.92,
  pageHeightPoints: 595.32,
  jpegWidthPixels: 3508,
  jpegHeightPixels: 2482,
  pointsPerProjectMeter: 4.8,
  confidence: 'HIGH' as const
});

export const UNDERTOW_PDF_ORIGIN_PT: PdfPoint = [420.96, 297.66];
export const UNDERTOW_NEGATIVE_Z_SPAWN_CENTER_PT: PdfPoint = [131.82, 155.58];
export const UNDERTOW_POSITIVE_Z_SPAWN_CENTER_PT: PdfPoint = [709.98, 439.5];

function normalizedDirection(a: PdfPoint, b: PdfPoint): PdfPoint {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = Math.hypot(dx, dy);
  if (length <= 1e-9) throw new Error('Undertow vector calibration anchors must be distinct.');
  return [dx / length, dy / length];
}

const positiveZPdfDirection = normalizedDirection(
  UNDERTOW_NEGATIVE_Z_SPAWN_CENTER_PT,
  UNDERTOW_POSITIVE_Z_SPAWN_CENTER_PT
);
const positiveXPdfDirection: PdfPoint = [
  positiveZPdfDirection[1],
  -positiveZPdfDirection[0]
];

export function undertowPdfPointToProjectXZ(point: PdfPoint): MetricXZ {
  const dx = point[0] - UNDERTOW_PDF_ORIGIN_PT[0];
  const dy = point[1] - UNDERTOW_PDF_ORIGIN_PT[1];
  const scale = UNDERTOW_VECTOR_BLUEPRINT_SOURCE.pointsPerProjectMeter;
  return [
    (dx * positiveXPdfDirection[0] + dy * positiveXPdfDirection[1]) / scale,
    (dx * positiveZPdfDirection[0] + dy * positiveZPdfDirection[1]) / scale
  ];
}

function vectorTrace(
  id: string,
  geometryKind: UndertowVectorTrace['geometryKind'],
  pdfPoints: readonly PdfPoint[],
  sourceClass: UndertowBlueprintSourceClass,
  confidence: EvidenceConfidence,
  notes?: string
): UndertowVectorTrace {
  return {
    id,
    geometryKind,
    pdfPoints,
    metricPoints: pdfPoints.map(undertowPdfPointToProjectXZ),
    sourceClass,
    confidence,
    evidenceIds: ['user-turf-vector-blueprint'],
    notes
  };
}

export const UNDERTOW_VECTOR_TRACES = Object.freeze({
  negativeZSpawnCenter: vectorTrace(
    'negative-z-spawn-center',
    'POINT',
    [UNDERTOW_NEGATIVE_Z_SPAWN_CENTER_PT],
    'WHITE_SOURCE_FACE',
    'HIGH',
    'Center of the spawn/object ring in the vector source.'
  ),
  positiveZSpawnCenter: vectorTrace(
    'positive-z-spawn-center',
    'POINT',
    [UNDERTOW_POSITIVE_Z_SPAWN_CENTER_PT],
    'WHITE_SOURCE_FACE',
    'HIGH',
    'Center of the spawn/object ring in the vector source.'
  ),
  teamAFirstDropLip: vectorTrace(
    'team-a-first-drop-lip',
    'POLYLINE',
    [
      [620.4, 423.12],
      [664.68, 423.12],
      [664.68, 394.2]
    ],
    'HARD_EDGE',
    'HIGH',
    'Positive-Z spawn-side L-shaped hard edge. User video independently confirms this descent is one-way rather than a slope.'
  ),
  teamBFirstDropLip: vectorTrace(
    'team-b-first-drop-lip',
    'POLYLINE',
    [
      [221.52, 172.08],
      [177.24, 172.08],
      [177.24, 201.0]
    ],
    'HARD_EDGE',
    'HIGH',
    '180-degree counterpart of the positive-Z first-drop lip.'
  ),
  teamAWaterRegion: vectorTrace(
    'team-a-water-region',
    'POLYGON',
    [
      [556.8, 444.72],
      [598.8, 444.72],
      [598.8, 426.12],
      [561.36, 426.12],
      [561.36, 430.68],
      [556.8, 430.68]
    ],
    'WATER_CYAN',
    'CONFIRMED',
    'Cyan source fill means a water/submerge hazard in the blueprint legend.'
  ),
  teamBWaterRegion: vectorTrace(
    'team-b-water-region',
    'POLYGON',
    [
      [243.12, 150.48],
      [243.12, 169.08],
      [280.56, 169.08],
      [280.56, 164.52],
      [285.12, 164.52],
      [285.12, 150.48]
    ],
    'WATER_CYAN',
    'CONFIRMED',
    '180-degree counterpart of the positive-Z water region.'
  ),
  negativeZGlassOverhang: vectorTrace(
    'negative-z-glass-overhang',
    'POLYGON',
    [
      [382.44, 230.28],
      [420.96, 230.28],
      [420.96, 267.84],
      [382.44, 267.84]
    ],
    'UNINKABLE_GLASS_OVERHANG',
    'HIGH',
    'Exact symmetric gray source face matched to the current glass overhang in user gameplay captures. Gray confirms uninkable source semantics; gameplay evidence confirms glass and traversable space below.'
  ),
  positiveZGlassOverhang: vectorTrace(
    'positive-z-glass-overhang',
    'POLYGON',
    [
      [420.96, 327.36],
      [459.48, 327.36],
      [459.48, 364.92],
      [420.96, 364.92]
    ],
    'UNINKABLE_GLASS_OVERHANG',
    'HIGH',
    '180-degree counterpart of the negative-Z glass overhang.'
  ),
  negativeZGlassSlopeMarkers: vectorTrace(
    'negative-z-glass-slope-marker-envelope',
    'POLYGON',
    [
      [384.36, 244.9166666667],
      [418.92, 244.9166666667],
      [418.92, 261.25],
      [384.36, 261.25]
    ],
    'SLOPE_MARKER_FIELD',
    'HIGH',
    'Envelope of the horizontal dash field inside the gray glass source face. This proves a slope-marked subregion but is not itself a collision boundary.'
  ),
  positiveZGlassSlopeMarkers: vectorTrace(
    'positive-z-glass-slope-marker-envelope',
    'POLYGON',
    [
      [422.88, 334.0],
      [457.44, 334.0],
      [457.44, 350.25],
      [422.88, 350.25]
    ],
    'SLOPE_MARKER_FIELD',
    'HIGH',
    '180-degree counterpart slope-marker envelope inside the positive-Z glass source face.'
  ),
  centerOriginFace: vectorTrace(
    'center-origin-source-face',
    'POLYGON',
    [
      [406.08, 308.76],
      [435.84, 308.76],
      [435.84, 286.44],
      [406.08, 286.44]
    ],
    'WHITE_SOURCE_FACE',
    'HIGH',
    'Exact closed source face containing the geometric origin. Stored without promoting its vertical/floor semantic beyond existing evidence.'
  ),
  negativeZSpawnSideWhiteFace: vectorTrace(
    'negative-z-spawn-side-white-face',
    'POLYGON',
    [
      [221.52, 150.48],
      [285.12, 150.48],
      [285.12, 142.92],
      [321.84, 142.92],
      [321.84, 150.48],
      [340.56, 150.48],
      [340.56, 119.88],
      [285.12, 119.88],
      [285.12, 89.28],
      [258.36, 89.28],
      [243.12, 104.64],
      [243.12, 119.88],
      [109.44, 119.88],
      [70.68, 158.64],
      [70.68, 362.28],
      [109.8, 408.96],
      [181.2, 408.96],
      [181.2, 386.88],
      [173.52, 386.88],
      [173.52, 379.2],
      [131.88, 379.2],
      [131.88, 349.44],
      [116.52, 349.44],
      [116.52, 259.68],
      [131.88, 259.68],
      [131.88, 244.44],
      [139.56, 244.44],
      [139.56, 201.0],
      [177.24, 201.0],
      [177.24, 172.08],
      [221.52, 172.08]
    ],
    'WHITE_SOURCE_FACE',
    'HIGH',
    'Exact polygonized bold-line source face around the negative-Z spawn side. It is not equivalent to one flat floor level.'
  ),
  positiveZSpawnSideWhiteFace: vectorTrace(
    'positive-z-spawn-side-white-face',
    'POLYGON',
    [
      [520.08, 444.72],
      [501.36, 444.72],
      [501.36, 475.32],
      [556.8, 475.32],
      [556.8, 505.92],
      [583.56, 505.92],
      [598.8, 490.56],
      [598.8, 475.32],
      [732.48, 475.32],
      [771.24, 436.56],
      [771.24, 232.92],
      [732.12, 186.24],
      [660.72, 186.24],
      [660.72, 208.32],
      [668.4, 208.32],
      [668.4, 216.0],
      [710.04, 216.0],
      [710.04, 245.76],
      [725.4, 245.76],
      [725.4, 335.52],
      [710.04, 335.52],
      [710.04, 350.76],
      [702.36, 350.76],
      [702.36, 394.2],
      [664.68, 394.2],
      [664.68, 423.12],
      [620.4, 423.12],
      [620.4, 444.72],
      [556.8, 444.72],
      [556.8, 452.28],
      [520.08, 452.28]
    ],
    'WHITE_SOURCE_FACE',
    'HIGH',
    'Exact polygonized bold-line source face around the positive-Z spawn side. It includes multiple elevations/transitions and must not be flattened.'
  )
});

export const UNDERTOW_VECTOR_BLUEPRINT_AUDIT = Object.freeze({
  spawnSeparationMeters: Math.hypot(
    UNDERTOW_VECTOR_TRACES.positiveZSpawnCenter.metricPoints[0]![0] -
      UNDERTOW_VECTOR_TRACES.negativeZSpawnCenter.metricPoints[0]![0],
    UNDERTOW_VECTOR_TRACES.positiveZSpawnCenter.metricPoints[0]![1] -
      UNDERTOW_VECTOR_TRACES.negativeZSpawnCenter.metricPoints[0]![1]
  ),
  sourceOriginToSpawnMidpointMeters: Math.hypot(
    (
      UNDERTOW_VECTOR_TRACES.positiveZSpawnCenter.metricPoints[0]![0] +
      UNDERTOW_VECTOR_TRACES.negativeZSpawnCenter.metricPoints[0]![0]
    ) * 0.5,
    (
      UNDERTOW_VECTOR_TRACES.positiveZSpawnCenter.metricPoints[0]![1] +
      UNDERTOW_VECTOR_TRACES.negativeZSpawnCenter.metricPoints[0]![1]
    ) * 0.5
  )
});
