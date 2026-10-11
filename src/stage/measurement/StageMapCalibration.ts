export type MapPixel = readonly [number, number];
export type MetricXZ = readonly [number, number];

export interface StageMapCalibration {
  widthPixels: number;
  heightPixels: number;
  originPixel: MapPixel;
  pixelsPerMeter: number;
  positiveXPixelDirection: MapPixel;
  positiveZPixelDirection: MapPixel;
}

export interface SpawnAxisCalibrationInput {
  widthPixels: number;
  heightPixels: number;
  originPixel: MapPixel;
  negativeZAnchorPixel: MapPixel;
  positiveZAnchorPixel: MapPixel;
  pixelsPerMeter: number;
}

function assertFinitePair(value: MapPixel, label: string): void {
  if (!Number.isFinite(value[0]) || !Number.isFinite(value[1])) {
    throw new Error(`${label} must contain finite pixel coordinates.`);
  }
}

export function createSpawnAxisCalibration(
  input: SpawnAxisCalibrationInput
): StageMapCalibration {
  assertFinitePair(input.originPixel, 'originPixel');
  assertFinitePair(input.negativeZAnchorPixel, 'negativeZAnchorPixel');
  assertFinitePair(input.positiveZAnchorPixel, 'positiveZAnchorPixel');

  if (!Number.isFinite(input.widthPixels) || input.widthPixels <= 0) {
    throw new Error('widthPixels must be a positive finite number.');
  }
  if (!Number.isFinite(input.heightPixels) || input.heightPixels <= 0) {
    throw new Error('heightPixels must be a positive finite number.');
  }
  if (!Number.isFinite(input.pixelsPerMeter) || input.pixelsPerMeter <= 0) {
    throw new Error('pixelsPerMeter must be a positive finite number.');
  }

  const dx = input.positiveZAnchorPixel[0] - input.negativeZAnchorPixel[0];
  const dy = input.positiveZAnchorPixel[1] - input.negativeZAnchorPixel[1];
  const length = Math.hypot(dx, dy);
  if (length <= 1e-9) throw new Error('spawn-axis anchors must be distinct.');

  const positiveZPixelDirection: MapPixel = [dx / length, dy / length];
  // Pixel Y grows downward. This clockwise perpendicular keeps the project X/Z
  // frame orthonormal without pretending it is a geographic east/north frame.
  const positiveXPixelDirection: MapPixel = [
    positiveZPixelDirection[1],
    -positiveZPixelDirection[0]
  ];

  return {
    widthPixels: input.widthPixels,
    heightPixels: input.heightPixels,
    originPixel: input.originPixel,
    pixelsPerMeter: input.pixelsPerMeter,
    positiveXPixelDirection,
    positiveZPixelDirection
  };
}

export function pixelToMetricXZ(
  calibration: StageMapCalibration,
  pixel: MapPixel
): MetricXZ {
  assertFinitePair(pixel, 'pixel');
  const dx = pixel[0] - calibration.originPixel[0];
  const dy = pixel[1] - calibration.originPixel[1];
  return [
    (dx * calibration.positiveXPixelDirection[0] +
      dy * calibration.positiveXPixelDirection[1]) / calibration.pixelsPerMeter,
    (dx * calibration.positiveZPixelDirection[0] +
      dy * calibration.positiveZPixelDirection[1]) / calibration.pixelsPerMeter
  ];
}

export function metricXZToPixel(
  calibration: StageMapCalibration,
  xz: MetricXZ
): MapPixel {
  if (!Number.isFinite(xz[0]) || !Number.isFinite(xz[1])) {
    throw new Error('xz must contain finite metric coordinates.');
  }
  return [
    calibration.originPixel[0] +
      calibration.pixelsPerMeter * (
        xz[0] * calibration.positiveXPixelDirection[0] +
        xz[1] * calibration.positiveZPixelDirection[0]
      ),
    calibration.originPixel[1] +
      calibration.pixelsPerMeter * (
        xz[0] * calibration.positiveXPixelDirection[1] +
        xz[1] * calibration.positiveZPixelDirection[1]
      )
  ];
}

export function pixelDistanceMeters(
  calibration: Pick<StageMapCalibration, 'pixelsPerMeter'>,
  a: MapPixel,
  b: MapPixel
): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]) / calibration.pixelsPerMeter;
}

export function midpointPixel(a: MapPixel, b: MapPixel): MapPixel {
  return [(a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5];
}

export function pixelDistance(a: MapPixel, b: MapPixel): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

export function rotationSymmetryResidualMeters(a: MetricXZ, b: MetricXZ): number {
  // Exact 180-degree counterparts satisfy b = -a.
  return Math.hypot(a[0] + b[0], a[1] + b[1]);
}

export function mapAxisAngleDegrees(calibration: StageMapCalibration): number {
  const [x, y] = calibration.positiveZPixelDirection;
  return Math.atan2(y, x) * 180 / Math.PI;
}
