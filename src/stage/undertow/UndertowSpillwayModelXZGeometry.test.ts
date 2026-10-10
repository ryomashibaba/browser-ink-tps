import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_MODEL_XZ_GEOMETRY,
  UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT,
  UNDERTOW_UNDERPASS_NAV_AUDIT,
  undertowModelXZGeometryAuditErrors
} from './UndertowSpillwayModelXZGeometry';

describe('T21-B Temple01 model XZ geometry', () => {
  it('keeps the extracted model contours audit-clean', () => {
    expect(undertowModelXZGeometryAuditErrors()).toEqual([]);
  });

  it('promotes two symmetric center-low components at Y=0', () => {
    const center = UNDERTOW_MODEL_XZ_GEOMETRY.filter((item) =>
      item.id.startsWith('center-low-')
    );
    expect(center).toHaveLength(2);
    expect(center.every((item) => item.sourceYModelMeters === 3)).toBe(true);
    expect(center.every((item) => item.sourceYProjectMeters === 0)).toBe(true);
    expect(center.every((item) => item.modelHoles.length === 1)).toBe(true);
  });

  it('promotes the symmetric navigable glass-underpass polygons at project Y=0', () => {
    const underpasses = UNDERTOW_MODEL_XZ_GEOMETRY.filter((item) =>
      item.id.startsWith('glass-underpass-')
    );
    expect(underpasses).toHaveLength(2);
    expect(underpasses.every((item) => item.sourceYModelMeters === 3)).toBe(true);
    expect(underpasses.every((item) => item.sourceYProjectMeters === 0)).toBe(true);
    expect(underpasses.every((item) => item.modelHoles.length === 1)).toBe(true);
    expect(underpasses.every((item) => item.simplifyToleranceMeters === 0.15)).toBe(true);
    expect(UNDERTOW_UNDERPASS_NAV_AUDIT).toMatchObject({
      roofedFloorCellsPerSide: 3951,
      floorObstacleCellsPerSide: 88,
      walkableCellsPerSide: 3863,
      walkableAreaSymmetryResidualSquareMeters: 0,
      mirrorXorCells: 0,
      confidence: 'HIGH'
    });
    expect(UNDERTOW_UNDERPASS_NAV_AUDIT.walkableAreaSquareMetersPerSide)
      .toBeCloseTo(60.359375, 6);
  });

  it('promotes the symmetric spawn-high and first-drop landing components', () => {
    const spawnHigh = UNDERTOW_MODEL_XZ_GEOMETRY.filter((item) =>
      item.id.startsWith('spawn-high-')
    );
    expect(spawnHigh).toHaveLength(2);
    expect(spawnHigh.every((item) => item.sourceYModelMeters === 10.5)).toBe(true);
    expect(spawnHigh.every((item) => item.sourceYProjectMeters === 7.5)).toBe(true);
    expect(spawnHigh.every((item) => item.modelHoles.length === 2)).toBe(true);

    const firstDrop = UNDERTOW_MODEL_XZ_GEOMETRY.filter((item) =>
      item.id.startsWith('first-drop-landing-')
    );
    expect(firstDrop).toHaveLength(2);
    expect(firstDrop.every((item) => item.sourceYModelMeters === 6)).toBe(true);
    expect(firstDrop.every((item) => item.sourceYProjectMeters === 3)).toBe(true);
    expect(firstDrop.every((item) => item.modelHoles.length === 0)).toBe(true);

    expect(UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT).toMatchObject({
      spawnHighCellsPerSide: 33594,
      spawnHighHoleCountPerSide: 2,
      spawnHighMirrorXorCells: 0,
      firstDropLandingCellsPerSide: 3746,
      firstDropLandingHoleCountPerSide: 0,
      firstDropLandingMirrorXorCells: 0,
      confidence: 'HIGH'
    });
    expect(UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.spawnHighAreaSquareMetersPerSide)
      .toBeCloseTo(524.90625, 6);
    expect(UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.firstDropLandingAreaSquareMetersPerSide)
      .toBeCloseTo(58.53125, 6);
  });

  it('promotes two symmetric right-low components at project Y=4.5', () => {
    const low = UNDERTOW_MODEL_XZ_GEOMETRY.filter((item) =>
      item.id.startsWith('right-low-')
    );
    expect(low).toHaveLength(2);
    expect(low.every((item) => item.sourceYModelMeters === 7.5)).toBe(true);
    expect(low.every((item) => item.sourceYProjectMeters === 4.5)).toBe(true);
    expect(low.every((item) => item.modelHoles.length === 3)).toBe(true);
  });

  it('keeps extraction accuracy HIGH-only rather than Stable-Freeze exactness', () => {
    for (const item of UNDERTOW_MODEL_XZ_GEOMETRY) {
      expect(item.confidence).toBe('HIGH');
      expect(item.rasterStepMeters).toBe(0.125);
      if (item.id.startsWith('glass-underpass-')) {
        expect(item.simplifyToleranceMeters).toBe(0.15);
      } else {
        expect(item.simplifyToleranceMeters).toBe(0.2);
      }
    }
  });
});
