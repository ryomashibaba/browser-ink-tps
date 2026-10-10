import { describe, expect, it } from 'vitest';
import {
  polygonAreaMeters2,
  rotationSymmetryHausdorffMeters,
  traceBoundsMeters,
  traceToMetric,
  validateMapTraceFeature
} from './StageMapTrace';
import { createSpawnAxisCalibration } from './StageMapCalibration';

const calibration = createSpawnAxisCalibration({
  widthPixels: 1000,
  heightPixels: 1000,
  originPixel: [500, 500],
  negativeZAnchorPixel: [500, 300],
  positiveZAnchorPixel: [500, 700],
  pixelsPerMeter: 20
});

describe('T21-B map trace primitives', () => {
  it('rejects under-specified polygons instead of inventing vertices', () => {
    expect(validateMapTraceFeature({
      id: 'bad-poly',
      geometryKind: 'POLYGON',
      pixelVertices: [[1, 1], [2, 2]],
      confidence: 'HIGH',
      evidenceIds: ['map']
    })).toContain('bad-poly: POLYGON requires at least 3 vertex/vertices');
  });

  it('converts pixel vertices through the canonical calibration', () => {
    const metric = traceToMetric(calibration, {
      id: 'rect',
      geometryKind: 'POLYGON',
      pixelVertices: [[480, 480], [520, 480], [520, 520], [480, 520]],
      confidence: 'HIGH',
      evidenceIds: ['map']
    });
    expect(polygonAreaMeters2(metric.verticesMeters)).toBeCloseTo(4, 9);
    expect(traceBoundsMeters(metric.verticesMeters)).toEqual({
      minX: -1,
      maxX: 1,
      minZ: -1,
      maxZ: 1
    });
  });

  it('measures 180-degree symmetry without requiring identical vertex order/count', () => {
    const a = [[1, 2], [3, 2], [3, 4], [1, 4]] as const;
    const b = [[-1, -4], [-3, -4], [-3, -2], [-1, -2]] as const;
    expect(rotationSymmetryHausdorffMeters(a, b)).toBeCloseTo(0, 9);
  });
});
