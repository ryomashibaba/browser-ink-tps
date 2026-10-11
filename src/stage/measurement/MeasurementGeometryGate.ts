import type { EvidenceConfidence, YMeasurement } from './StageMeasurementLedger';

export type GeometryUse = 'BLOCKOUT' | 'STABLE_FREEZE';

export function confidenceAllowedForGeometry(
  confidence: EvidenceConfidence,
  use: GeometryUse
): boolean {
  if (use === 'STABLE_FREEZE') return confidence === 'CONFIRMED';
  return confidence === 'CONFIRMED' || confidence === 'HIGH';
}

export function exactYForGeometry(
  measurement: YMeasurement,
  use: GeometryUse
): number | null {
  if (!confidenceAllowedForGeometry(measurement.confidence, use)) return null;
  return measurement.yMeters ?? null;
}

export function exactDeltaYForGeometry(
  measurement: YMeasurement,
  use: GeometryUse
): number | null {
  if (!confidenceAllowedForGeometry(measurement.confidence, use)) return null;
  return measurement.deltaMeters ?? null;
}
