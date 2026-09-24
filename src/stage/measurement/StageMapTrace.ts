import type { EvidenceConfidence } from './StageMeasurementLedger';
import {
  pixelToMetricXZ,
  type MapPixel,
  type MetricXZ,
  type StageMapCalibration
} from './StageMapCalibration';

export type MapTraceGeometryKind = 'POINT' | 'POLYLINE' | 'POLYGON';

export interface MapTraceFeature {
  id: string;
  geometryKind: MapTraceGeometryKind;
  pixelVertices: readonly MapPixel[];
  confidence: EvidenceConfidence;
  evidenceIds: readonly string[];
  notes?: string;
}

export interface MetricTraceFeature {
  id: string;
  geometryKind: MapTraceGeometryKind;
  verticesMeters: readonly MetricXZ[];
  confidence: EvidenceConfidence;
  evidenceIds: readonly string[];
  notes?: string;
}

function isFinitePixel(pixel: MapPixel): boolean {
  return Number.isFinite(pixel[0]) && Number.isFinite(pixel[1]);
}

export function validateMapTraceFeature(feature: MapTraceFeature): string[] {
  const errors: string[] = [];
  if (feature.id.trim().length === 0) errors.push('trace id must not be empty');
  if (feature.confidence !== 'UNKNOWN' && feature.evidenceIds.length === 0) {
    errors.push(`${feature.id}: known trace must cite evidence`);
  }
  if (feature.pixelVertices.some((vertex) => !isFinitePixel(vertex))) {
    errors.push(`${feature.id}: trace contains non-finite pixel coordinates`);
  }

  const expectedMinimum =
    feature.geometryKind === 'POINT' ? 1 :
    feature.geometryKind === 'POLYLINE' ? 2 : 3;
  if (feature.pixelVertices.length < expectedMinimum) {
    errors.push(
      `${feature.id}: ${feature.geometryKind} requires at least ${expectedMinimum} vertex/vertices`
    );
  }
  if (feature.geometryKind === 'POINT' && feature.pixelVertices.length !== 1) {
    errors.push(`${feature.id}: POINT must contain exactly one vertex`);
  }
  return errors;
}

export function traceToMetric(
  calibration: StageMapCalibration,
  feature: MapTraceFeature
): MetricTraceFeature {
  const errors = validateMapTraceFeature(feature);
  if (errors.length > 0) throw new Error(errors.join('; '));
  return {
    id: feature.id,
    geometryKind: feature.geometryKind,
    verticesMeters: feature.pixelVertices.map((pixel) =>
      pixelToMetricXZ(calibration, pixel)
    ),
    confidence: feature.confidence,
    evidenceIds: feature.evidenceIds,
    notes: feature.notes
  };
}

export function polygonAreaMeters2(vertices: readonly MetricXZ[]): number {
  if (vertices.length < 3) return 0;
  let twiceArea = 0;
  for (let i = 0; i < vertices.length; i += 1) {
    const a = vertices[i]!;
    const b = vertices[(i + 1) % vertices.length]!;
    twiceArea += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(twiceArea) * 0.5;
}

export function traceBoundsMeters(vertices: readonly MetricXZ[]): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
} | null {
  if (vertices.length === 0) return null;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (const [x, z] of vertices) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  return { minX, maxX, minZ, maxZ };
}

function distance(a: MetricXZ, b: MetricXZ): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function nearestDistance(point: MetricXZ, candidates: readonly MetricXZ[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) best = Math.min(best, distance(point, candidate));
  return best;
}

/**
 * Symmetric Hausdorff residual after rotating feature A by 180 degrees.
 * It works even when counterpart traces use different vertex counts.
 */
export function rotationSymmetryHausdorffMeters(
  a: readonly MetricXZ[],
  b: readonly MetricXZ[]
): number {
  if (a.length === 0 || b.length === 0) return Number.POSITIVE_INFINITY;
  const rotatedA = a.map(([x, z]) => [-x, -z] as const);
  let residual = 0;
  for (const point of rotatedA) residual = Math.max(residual, nearestDistance(point, b));
  for (const point of b) residual = Math.max(residual, nearestDistance(point, rotatedA));
  return residual;
}
