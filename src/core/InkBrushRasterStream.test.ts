import { describe, expect, it } from 'vitest';
import { Team, type PaintEvent } from '../ink/types';
import type { PaintSurface } from '../ink/PaintSurface';
import { buildInkBrushRasterQuads } from '../ink/InkBrushRasterGeometry';
import { packInkBrushGpuGroups } from './InkBrushGpuPacking';
import {
  packInkBrushRasterRuns,
  InkBrushRasterScratch,
  type InkStreamGroup,
  type InkStreamRun
} from './InkBrushRasterStream';

/** The actual original INK geometry generator and previous PERFORMANCE packer. */
function originalBuffers(groups: readonly InkStreamGroup[]) {
  return packInkBrushGpuGroups(groups.map(group => ({
    event: group.event,
    quads: buildInkBrushRasterQuads(
      group.surface as PaintSurface, group.event as PaintEvent, group.paintableRuns
    )
  })));
}

function assertExact(groups: readonly InkStreamGroup[], scratch?: InkBrushRasterScratch): void {
  const baseline = originalBuffers(groups);
  const optimized = packInkBrushRasterRuns(groups, scratch);
  expect(optimized?.quadCount ?? 0).toBe(baseline?.quadCount ?? 0);
  if (!baseline || !optimized) {
    expect(optimized).toBe(baseline);
    return;
  }
  // Compare bytes, not just numerically-close floating-point values.
  for (const key of ['positions', 'uvs', 'rectMins', 'rectMaxs', 'colors', 'indices'] as const) {
    expect(new Uint8Array(optimized[key].buffer, optimized[key].byteOffset,
      optimized[key].byteLength))
      .toEqual(new Uint8Array(baseline[key].buffer, baseline[key].byteOffset,
        baseline[key].byteLength));
  }
}

function scenario(seed: number, n: number, runsPerEvent: number): InkStreamGroup[] {
  return Array.from({ length: n }, (_, k) => {
    const width = 22;
    const height = 18;
    const paintableRuns: InkStreamRun[] = Array.from({ length: runsPerEvent }, (_, j) => {
      const row = (j * 7 + k * 5) % height;
      const startX = (j * 3 + k) % (width - 3);
      return { row, startX, endXExclusive: startX + 1 + ((j + k) % 3) };
    });
    return {
      surface: {
        id: 'source-surface-' + (k % 17),
        atlasRect: { x: 8 + (k % 8) * 32, y: 9 + (k % 7) * 24,
          width: 512, height: 512, atlasSize: 2048, pixelsPerMeter: 16 },
        widthCells: width, heightCells: height,
        widthMeters: width, heightMeters: height, cellSize: 1
      },
      event: {
        team: k % 2 ? Team.A : Team.B,
        strength: ((seed + k) % 13) / 12,
        angle: ((seed * 11 + k * 7) % 29) * Math.PI / 29,
        centerU: 5 + ((seed + k * 7) % 13),
        centerV: 3 + ((seed * 3 + k) % 12),
        radiusU: 0.5 + ((seed + k) % 13) / 3,
        radiusV: 0.5 + ((seed * 7 + k) % 19) / 4
      },
      paintableRuns
    };
  });
}

describe('T21 V28 performance: stream exact INK-authorized GPU raster (#21)', () => {
  it('never submits absent authorization', () => {
    expect(packInkBrushRasterRuns([])).toBeNull();
    assertExact(scenario(0, 3, 0));
  });

  it('preserves exact byte output for rotated and same-team paint in a 7CPU-size burst', () => {
    for (let seed = 0; seed < 120; seed++) {
      assertExact(scenario(seed, 1 + (seed % 19), 1 + (seed % 43)));
    }
  });

  it('keeps the exact 16,383-quad index limit and all old UV/clip bytes', () => {
    // 17 groups cover a full 16-bit vertex-buffer batch.
    const groups = scenario(4, 17, 963);
    expect(groups.reduce((n, g) => n + g.paintableRuns.length, 0)).toBe(16_371);
    assertExact(groups);
    // Also exercise the actual maximum vertex/index array size, not merely
    // a large queue of runs that can be clipped away.
    const [single] = scenario(4, 1, 1);
    const full = {
      ...single!,
      event: { ...single!.event, angle: 0, centerU: 10.5, centerV: 10.5,
        radiusU: 2, radiusV: 2 },
      paintableRuns: Array.from({ length: 16_383 }, () => ({
        row: 10, startX: 10, endXExclusive: 11
      }))
    };
    assertExact([full]);
    const overflow = scenario(4, 17, 964);
    expect(() => packInkBrushRasterRuns(overflow)).toThrow('INK_GPU_QUAD_BUDGET_EXCEEDED');
  }, 20_000);

  it('does not draw malformed, out-of-range, or clipped/degenerate rows', () => {
    const [g] = scenario(7, 1, 5);
    const malformed: InkStreamRun[] = [
      { row: 999, startX: 0, endXExclusive: 1 },
      { row: -1, startX: 0, endXExclusive: 1 },
      { row: Number.NaN, startX: 0, endXExclusive: 1 },
      { row: 2, startX: 4, endXExclusive: 3 },
      { row: 2, startX: 0, endXExclusive: 0 },
      { row: 2, startX: 0, endXExclusive: 99 },
      { row: 2, startX: 0, endXExclusive: 2 }
    ];
    assertExact([{ ...g!, paintableRuns: malformed }]);
    assertExact([{ ...g!, event: { ...g!.event, radiusU: 0 } }]);
    assertExact([{ ...g!, event: { ...g!.event, angle: Number.NaN } }]);
  });

  it('preserves frozen source events and approved runs without writing to grids', () => {
    const groups = scenario(12, 3, 31).map(g => Object.freeze({
      ...g,
      surface: Object.freeze(g.surface),
      event: Object.freeze(g.event),
      paintableRuns: Object.freeze(g.paintableRuns.map(run => Object.freeze(run)))
    }));
    const snapshot = JSON.stringify(groups);
    assertExact(groups);
    expect(JSON.stringify(groups)).toBe(snapshot);
  });
  it('reuses six GPU transfer buffers across successive brushes without stale pixels', () => {
    const scratch = new InkBrushRasterScratch();
    const [sample] = scenario(4, 1, 1);
    const event = { ...sample!.event, centerU: 10.5, centerV: 10.5, radiusU: 8, radiusV: 8, angle: 0 };
    const row = { row: 10, startX: 10, endXExclusive: 11 };
    const make = (n: number, strength: number): InkStreamGroup[] => [{
      ...sample!, event: { ...event, strength },
      paintableRuns: Array.from({ length: n }, () => row)
    }];
    const first = packInkBrushRasterRuns(make(2, 0.25), scratch)!;
    expect(first.quadCount).toBe(2);
    expect(scratch.reservedQuads).toBe(16);
    const storage = [
      first.positions.buffer, first.uvs.buffer, first.rectMins.buffer,
      first.rectMaxs.buffer, first.colors.buffer, first.indices.buffer
    ];
    // The caller immediately submits to mesh.update() before the next call.
    assertExact(make(7, 0.85), scratch);
    const second = packInkBrushRasterRuns(make(7, 0.85), scratch)!;
    expect(second.quadCount).toBe(7);
    expect([
      second.positions.buffer, second.uvs.buffer, second.rectMins.buffer,
      second.rectMaxs.buffer, second.colors.buffer, second.indices.buffer
    ]).toEqual(storage);
    expect(second.indices.length).toBe(42);
    expect(second.colors.length).toBe(7 * 16);
    assertExact(make(1, 0.1), scratch);
    const shorter = packInkBrushRasterRuns(make(1, 0.1), scratch)!;
    expect(shorter.positions.buffer).toBe(storage[0]);
    expect(shorter.positions.length).toBe(12);
    expect(shorter.indices.length).toBe(6);
    expect(shorter.quadCount).toBe(1);
    scratch.release();
    expect(scratch.reservedQuads).toBe(0);
    const newAllocation = packInkBrushRasterRuns(make(1, 0.1), scratch)!;
    expect(newAllocation.positions.buffer).not.toBe(storage[0]);
    assertExact(make(1, 0.1), scratch);
  });

  it('bounds geometric growth and preserves byte-exact output for variable 7CPU bursts', () => {
    const scratch = new InkBrushRasterScratch();
    const [sample] = scenario(9, 1, 1);
    const prepared = {
      ...sample!,
      event: { ...sample!.event, centerU: 10.5, centerV: 10.5,
        radiusU: 8, radiusV: 8, angle: 0 },
      paintableRuns: [{ row: 10, startX: 10, endXExclusive: 11 }]
    };
    for (const size of [1, 16, 17, 31, 2, 51, 13, 128, 5, 2048, 7, 32]) {
      const input: InkStreamGroup[] = [{
        ...prepared,
        paintableRuns: Array.from({ length: size }, () => prepared.paintableRuns[0]!)
      }];
      assertExact(input, scratch);
      expect(scratch.reservedQuads).toBeGreaterThanOrEqual(size);
      expect(scratch.reservedQuads).toBeLessThanOrEqual(16_383);
    }
    expect(() => scratch.reserve(16_384)).toThrow('INK_GPU_QUAD_BUDGET_EXCEEDED');
    scratch.release();
    expect(scratch.reservedQuads).toBe(0);
  });

});
