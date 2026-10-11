import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION,
  UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS,
  UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT,
  undertowZonesVectorGeometryAuditErrors
} from './UndertowSpillwayZonesVectorGeometry';

describe('T21 Undertow exact Splat Zones vector geometry', () => {
  it('pins the recovered PDF geometry and verified cross-mode registration', () => {
    expect(undertowZonesVectorGeometryAuditErrors()).toEqual([]);
    expect(UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT).toMatchObject({
      sourceBytes: 112898,
      sharedOuterAnchorCount: 40,
      comparedOuterAnchorCount: 42,
      modeSpecificChangedOuterAnchorCount: 2,
      exactPdfVertexCountPerZone: 6
    });
    expect(
      UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT.maxSharedOuterAnchorResidualMeters
    ).toBeLessThan(0.00002);
  });

  it('recovers two exact six-vertex L-shaped objective rings', () => {
    expect(UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS.negativeZ.pdfPoints).toHaveLength(6);
    expect(UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS.positiveZ.pdfPoints).toHaveLength(6);
    expect(UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS.negativeZ.areaSquareMeters)
      .toBeCloseTo(117.29875, 6);
    expect(UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS.positiveZ.areaSquareMeters)
      .toBeCloseTo(117.29875, 6);
    expect(
      UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT.projectRotationSymmetryResidualMeters
    ).toBeCloseTo(0.025, 9);
  });

  it('keeps only the registered project-Y=0 underpass intersections as paint authority', () => {
    const neg = UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION.negativeZ;
    const pos = UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION.positiveZ;

    expect(neg.backingSolidId).toBe('UndertowT21D:glass-underpass-negative-z');
    expect(pos.backingSolidId).toBe('UndertowT21D:glass-underpass-positive-z');
    expect(neg.projectOuter).toHaveLength(8);
    expect(pos.projectOuter).toHaveLength(8);
    expect(neg.projectHoles).toHaveLength(1);
    expect(pos.projectHoles).toHaveLength(1);
    expect(neg.areaSquareMeters).toBeGreaterThan(58);
    expect(neg.areaSquareMeters).toBeLessThan(59);
    expect(pos.areaSquareMeters).toBeGreaterThan(58);
    expect(pos.areaSquareMeters).toBeLessThan(59);
    expect(neg.areaSquareMeters).toBeLessThan(
      UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS.negativeZ.areaSquareMeters
    );
    expect(pos.areaSquareMeters).toBeLessThan(
      UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS.positiveZ.areaSquareMeters
    );
  });
});
