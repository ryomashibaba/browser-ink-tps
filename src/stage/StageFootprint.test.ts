import { describe, expect, it } from 'vitest';
import {
  pointInStageFootprint,
  rasterizeStageFootprint,
  validateStageFootprint,
  type StageFootprint
} from './StageFootprint';

const footprint: StageFootprint = {
  outer: [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4]
  ],
  holes: [[
    [1, 1],
    [3, 1],
    [3, 3],
    [1, 3]
  ]],
  cellSizeMeters: 1
};

describe('StageFootprint', () => {
  it('classifies outer area and holes deterministically', () => {
    expect(pointInStageFootprint(0.5, 0.5, footprint)).toBe(true);
    expect(pointInStageFootprint(2, 2, footprint)).toBe(false);
    expect(pointInStageFootprint(5, 2, footprint)).toBe(false);
  });

  it('rasterizes one canonical mask and merges it without filling the hole', () => {
    const raster = rasterizeStageFootprint(4, 4, footprint);
    expect(raster.widthCells).toBe(4);
    expect(raster.depthCells).toBe(4);
    expect([...raster.active].reduce((sum, value) => sum + value, 0)).toBe(12);
    const mergedArea = raster.rectangles.reduce(
      (sum, rect) => sum + rect.widthMeters * rect.depthMeters,
      0
    );
    expect(mergedArea).toBe(12);
    expect(
      raster.rectangles.some(
        (rect) =>
          rect.minU < 2 &&
          rect.maxU > 2 &&
          rect.minV < 2 &&
          rect.maxV > 2
      )
    ).toBe(false);
  });

  it('rejects vertices outside the declared surface bounds', () => {
    expect(
      validateStageFootprint(
        {
          outer: [[0, 0], [5, 0], [0, 4]],
          cellSizeMeters: 1
        },
        4,
        4
      )
    ).toContain('outer footprint vertex (5, 0) exceeds 0..4 / 0..4');
  });
});
