import { describe, expect, it } from 'vitest';
import {
  polygonAreaMeters2,
  rotationSymmetryHausdorffMeters
} from '../measurement/StageMapTrace';
import {
  UNDERTOW_VECTOR_BLUEPRINT_AUDIT,
  UNDERTOW_VECTOR_BLUEPRINT_SOURCE,
  UNDERTOW_VECTOR_TRACES
} from './UndertowSpillwayVectorBlueprint';

function polylineLength(points: readonly (readonly [number, number])[]): number {
  let total = 0;
  for (let i = 0; i + 1 < points.length; i += 1) {
    total += Math.hypot(
      points[i + 1]![0] - points[i]![0],
      points[i + 1]![1] - points[i]![1]
    );
  }
  return total;
}

describe('T21-B Undertow vector blueprint extraction', () => {
  it('binds the recovered vector PDF to the previous 3508x2482 Turf source', () => {
    expect(UNDERTOW_VECTOR_BLUEPRINT_SOURCE).toMatchObject({
      pageWidthPoints: 841.92,
      pageHeightPoints: 595.32,
      jpegWidthPixels: 3508,
      jpegHeightPixels: 2482,
      pointsPerProjectMeter: 4.8,
      confidence: 'HIGH'
    });
  });

  it('tightens the spawn-axis check using vector spawn-ring centers', () => {
    expect(UNDERTOW_VECTOR_BLUEPRINT_AUDIT.spawnSeparationMeters).toBeCloseTo(134.1899, 3);
    expect(UNDERTOW_VECTOR_BLUEPRINT_AUDIT.sourceOriginToSpawnMidpointMeters).toBeLessThan(0.03);
  });

  it('measures the first-drop hard-edge pair without turning it into a slope', () => {
    const a = UNDERTOW_VECTOR_TRACES.teamAFirstDropLip;
    const b = UNDERTOW_VECTOR_TRACES.teamBFirstDropLip;

    expect(a.geometryKind).toBe('POLYLINE');
    expect(b.geometryKind).toBe('POLYLINE');
    expect(a.sourceClass).toBe('HARD_EDGE');
    expect(b.sourceClass).toBe('HARD_EDGE');
    expect(polylineLength(a.metricPoints)).toBeCloseTo(15.25, 6);
    expect(polylineLength(b.metricPoints)).toBeCloseTo(15.25, 6);
    expect(rotationSymmetryHausdorffMeters(a.metricPoints, b.metricPoints)).toBeLessThan(0.03);
  });

  it('extracts the right-side small-drop hard-edge pair after the first drop', () => {
    const a = UNDERTOW_VECTOR_TRACES.teamARightSmallDropLip;
    const b = UNDERTOW_VECTOR_TRACES.teamBRightSmallDropLip;
    expect(a.geometryKind).toBe('POLYLINE');
    expect(b.geometryKind).toBe('POLYLINE');
    expect(a.sourceClass).toBe('HARD_EDGE');
    expect(a.confidence).toBe('HIGH');
    expect(polylineLength(a.metricPoints)).toBeCloseTo(16.9, 1);
    expect(polylineLength(b.metricPoints)).toBeCloseTo(16.9, 1);
    expect(rotationSymmetryHausdorffMeters(a.metricPoints, b.metricPoints)).toBeLessThan(0.04);
    expect(a.notes).toContain('after the first drop');
  });

  it('extracts the symmetric white grate-mesh footprints without inheriting water semantics', () => {
    const a = UNDERTOW_VECTOR_TRACES.negativeZGrateMesh;
    const b = UNDERTOW_VECTOR_TRACES.positiveZGrateMesh;
    expect(a.sourceClass).toBe('GRATE_MESH');
    expect(b.sourceClass).toBe('GRATE_MESH');
    expect(a.confidence).toBe('HIGH');
    expect(b.confidence).toBe('HIGH');
    expect(polygonAreaMeters2(a.metricPoints)).toBeCloseTo(30.440625, 5);
    expect(polygonAreaMeters2(b.metricPoints)).toBeCloseTo(30.440625, 5);
    expect(rotationSymmetryHausdorffMeters(a.metricPoints, b.metricPoints)).toBeLessThan(0.03);
    expect(a.notes).toContain('no water semantics');
  });

  it('binds the two central glass overhang faces and keeps their internal slope markers distinct', () => {
    const a = UNDERTOW_VECTOR_TRACES.negativeZGlassOverhang;
    const b = UNDERTOW_VECTOR_TRACES.positiveZGlassOverhang;
    const aSlope = UNDERTOW_VECTOR_TRACES.negativeZGlassSlopeMarkers;
    const bSlope = UNDERTOW_VECTOR_TRACES.positiveZGlassSlopeMarkers;

    expect(a.sourceClass).toBe('UNINKABLE_GLASS_OVERHANG');
    expect(b.sourceClass).toBe('UNINKABLE_GLASS_OVERHANG');
    expect(a.confidence).toBe('HIGH');
    expect(b.confidence).toBe('HIGH');
    expect(polygonAreaMeters2(a.metricPoints)).toBeCloseTo(62.795625, 4);
    expect(polygonAreaMeters2(b.metricPoints)).toBeCloseTo(62.795625, 4);
    expect(rotationSymmetryHausdorffMeters(a.metricPoints, b.metricPoints)).toBeLessThan(0.03);

    expect(aSlope.sourceClass).toBe('SLOPE_MARKER_FIELD');
    expect(bSlope.sourceClass).toBe('SLOPE_MARKER_FIELD');
    expect(aSlope.notes).toContain('not itself a collision boundary');
    expect(rotationSymmetryHausdorffMeters(aSlope.metricPoints, bSlope.metricPoints)).toBeLessThan(0.05);
  });

  it('extracts the two cyan water hazards as exact source polygons', () => {
    const a = UNDERTOW_VECTOR_TRACES.teamAWaterRegion;
    const b = UNDERTOW_VECTOR_TRACES.teamBWaterRegion;

    expect(a.sourceClass).toBe('WATER_CYAN');
    expect(b.sourceClass).toBe('WATER_CYAN');
    expect(a.confidence).toBe('CONFIRMED');
    expect(b.confidence).toBe('CONFIRMED');
    expect(polygonAreaMeters2(a.metricPoints)).toBeCloseTo(33.00375, 4);
    expect(polygonAreaMeters2(b.metricPoints)).toBeCloseTo(33.00375, 4);
    expect(rotationSymmetryHausdorffMeters(a.metricPoints, b.metricPoints)).toBeLessThan(0.03);
  });

  it('preserves the large spawn-side white source faces without flattening their elevations', () => {
    const negative = UNDERTOW_VECTOR_TRACES.negativeZSpawnSideWhiteFace;
    const positive = UNDERTOW_VECTOR_TRACES.positiveZSpawnSideWhiteFace;

    expect(polygonAreaMeters2(negative.metricPoints)).toBeCloseTo(1168.20094, 3);
    expect(polygonAreaMeters2(positive.metricPoints)).toBeCloseTo(1168.20094, 3);
    expect(rotationSymmetryHausdorffMeters(negative.metricPoints, positive.metricPoints))
      .toBeLessThan(0.03);
    expect(negative.notes).toContain('not equivalent to one flat floor');
    expect(positive.notes).toContain('multiple elevations');
  });

  it('keeps the exact center-origin face as source geometry only', () => {
    const center = UNDERTOW_VECTOR_TRACES.centerOriginFace;
    expect(center.geometryKind).toBe('POLYGON');
    expect(center.sourceClass).toBe('WHITE_SOURCE_FACE');
    expect(center.confidence).toBe('HIGH');
    expect(polygonAreaMeters2(center.metricPoints)).toBeCloseTo(28.83, 4);
  });
});
