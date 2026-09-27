import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_WATER_VISUAL_PLANE_AUDIT,
  undertowWaterVisualPlaneAuditErrors
} from './UndertowSpillwayWaterGeometryAudit';

describe('T21-D water geometry audit', () => {
  it('records the zero-coverage Temple01 result instead of inventing a water Y', () => {
    expect(undertowWaterVisualPlaneAuditErrors()).toEqual([]);
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.teamA).toMatchObject({
      vectorPolygonRasterCells: 1954,
      temple01WaterSurfaceCells: 0,
      coverage: 0
    });
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.teamB).toMatchObject({
      vectorPolygonRasterCells: 1953,
      temple01WaterSurfaceCells: 0,
      coverage: 0
    });
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneResolved).toBe(false);
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.killThresholdResolved).toBe(false);
  });
});
