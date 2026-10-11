import type { EvidenceConfidence } from '../measurement/StageMeasurementLedger';
import {
  createSpawnAxisCalibration,
  mapAxisAngleDegrees,
  midpointPixel,
  pixelDistance,
  pixelDistanceMeters,
  pixelToMetricXZ,
  rotationSymmetryResidualMeters,
  type MapPixel
} from '../measurement/StageMapCalibration';

export interface UndertowMapSource {
  id: string;
  label: string;
  sourceVersion: string;
  widthPixels: number;
  heightPixels: number;
  confidence: EvidenceConfidence;
  notes: string;
}

export const UNDERTOW_TURF_RULE_MAP_SOURCE: UndertowMapSource = {
  id: 'user-turf-rule-map',
  label: 'User-provided Undertow Spillway Turf rule map',
  sourceVersion: 'Ver.7.2.0+ normal PvP target',
  widthPixels: 3508,
  heightPixels: 2482,
  confidence: 'HIGH',
  notes: 'Pixel measurements are reconstruction evidence, not Nintendo-authored meter coordinates.'
};

export const UNDERTOW_TURF_MAP_ORIGIN_PIXEL: MapPixel = [1754, 1241];
export const UNDERTOW_NEGATIVE_Z_SPAWN_PIXEL: MapPixel = [547, 647];
export const UNDERTOW_POSITIVE_Z_SPAWN_PIXEL: MapPixel = [2959, 1834];

export const UNDERTOW_TURF_MAP_CALIBRATION = createSpawnAxisCalibration({
  widthPixels: UNDERTOW_TURF_RULE_MAP_SOURCE.widthPixels,
  heightPixels: UNDERTOW_TURF_RULE_MAP_SOURCE.heightPixels,
  originPixel: UNDERTOW_TURF_MAP_ORIGIN_PIXEL,
  negativeZAnchorPixel: UNDERTOW_NEGATIVE_Z_SPAWN_PIXEL,
  positiveZAnchorPixel: UNDERTOW_POSITIVE_Z_SPAWN_PIXEL,
  pixelsPerMeter: 20
});

export const UNDERTOW_NEGATIVE_Z_SPAWN_XZ = pixelToMetricXZ(
  UNDERTOW_TURF_MAP_CALIBRATION,
  UNDERTOW_NEGATIVE_Z_SPAWN_PIXEL
);

export const UNDERTOW_POSITIVE_Z_SPAWN_XZ = pixelToMetricXZ(
  UNDERTOW_TURF_MAP_CALIBRATION,
  UNDERTOW_POSITIVE_Z_SPAWN_PIXEL
);

const measuredSpawnMidpoint = midpointPixel(
  UNDERTOW_NEGATIVE_Z_SPAWN_PIXEL,
  UNDERTOW_POSITIVE_Z_SPAWN_PIXEL
);

export const UNDERTOW_TURF_MAP_AUDIT = Object.freeze({
  spawnSeparationMeters: pixelDistanceMeters(
    UNDERTOW_TURF_MAP_CALIBRATION,
    UNDERTOW_NEGATIVE_Z_SPAWN_PIXEL,
    UNDERTOW_POSITIVE_Z_SPAWN_PIXEL
  ),
  originVsSpawnMidpointPixels: pixelDistance(
    UNDERTOW_TURF_MAP_ORIGIN_PIXEL,
    measuredSpawnMidpoint
  ),
  originVsSpawnMidpointMeters: pixelDistance(
    UNDERTOW_TURF_MAP_ORIGIN_PIXEL,
    measuredSpawnMidpoint
  ) / UNDERTOW_TURF_MAP_CALIBRATION.pixelsPerMeter,
  spawnRotationSymmetryResidualMeters: rotationSymmetryResidualMeters(
    UNDERTOW_NEGATIVE_Z_SPAWN_XZ,
    UNDERTOW_POSITIVE_Z_SPAWN_XZ
  ),
  positiveZAxisImageAngleDegrees: mapAxisAngleDegrees(UNDERTOW_TURF_MAP_CALIBRATION)
});

/**
 * Working only: outer span came from the previous measurement pass and is not
 * a Freeze-safe collision boundary. T21-B must replace this with traced
 * polygons / verified extrema before T21-D geometry.
 */
export const UNDERTOW_PROVISIONAL_OUTER_BOUNDS = Object.freeze({
  minX: -43.5,
  maxX: 43.5,
  minZ: -73,
  maxZ: 73,
  confidence: 'PROVISIONAL' as const,
  evidence: 'previous T21 measurement pass (~146m x ~87m)'
});

/**
 * Project orientation convention: Team A keeps the existing project-side +Z
 * spawn and Team B the -Z spawn. This assigns labels only; physical geometry
 * remains 180-degree symmetric and match colors are not source evidence.
 */
export const UNDERTOW_PROJECT_SPAWNS = Object.freeze({
  teamA: UNDERTOW_POSITIVE_Z_SPAWN_XZ,
  teamB: UNDERTOW_NEGATIVE_Z_SPAWN_XZ
});
