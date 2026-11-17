import { describe, expect, it } from 'vitest';
import { Team } from '../ink/types';
import {
  packInkBrushGpuGroups,
  type PackedInkGroup,
  type InkBrushGpuBuffers
} from './InkBrushGpuPacking';

/** The original GpuInkAtlas packing loop from 5edbc2d0 (test oracle). */
function originalPack(groups: readonly PackedInkGroup[]): InkBrushGpuBuffers | null {
  const geometry: Array<{quad: PackedInkGroup['quads'][number]; event: PackedInkGroup['event']}> = [];
  for (const {event, quads} of groups) {
    for (const quad of quads) geometry.push({quad, event});
  }
  if (geometry.length === 0) return null;
  const count = geometry.length;
  const positions = new Float32Array(count * 4 * 3);
  const uvs = new Float32Array(count * 4 * 2);
  const rectMins = new Float32Array(count * 4 * 2);
  const rectMaxs = new Float32Array(count * 4 * 2);
  const colors = new Uint8Array(count * 4 * 4);
  const indices = new Uint16Array(count * 6);
  let p = 0, uv = 0, rectCursor = 0, colorCursor = 0, indexCursor = 0, vertexBase = 0;
  for (const {quad, event} of geometry) {
    const ownerByte = event.team === Team.A ? 255 : 0;
    const wetnessByte = Math.round(Math.min(1, Math.max(0, event.strength)) * 255);
    for (const vertex of quad.vertices) {
      positions[p++] = vertex.x;
      positions[p++] = vertex.y;
      positions[p++] = 0;
      uvs[uv++] = vertex.uvX;
      uvs[uv++] = vertex.uvY;
      rectMins[rectCursor] = quad.clipMinX;
      rectMaxs[rectCursor++] = quad.clipMaxX;
      rectMins[rectCursor] = quad.clipMinY;
      rectMaxs[rectCursor++] = quad.clipMaxY;
      colors[colorCursor++] = ownerByte;
      colors[colorCursor++] = 255;
      colors[colorCursor++] = wetnessByte;
      colors[colorCursor++] = 255;
    }
    indices[indexCursor++] = vertexBase;
    indices[indexCursor++] = vertexBase + 1;
    indices[indexCursor++] = vertexBase + 2;
    indices[indexCursor++] = vertexBase;
    indices[indexCursor++] = vertexBase + 2;
    indices[indexCursor++] = vertexBase + 3;
    vertexBase += 4;
  }
  return {quadCount: count, positions, uvs, rectMins, rectMaxs, colors, indices};
}

function makeGroup(seed: number, count: number): PackedInkGroup {
  const quads = Array.from({length: count}, (_, j) => {
    const base = seed * 0.007 + j * 0.00013;
    const vertices = Array.from({length: 4}, (_, k) => ({
      x: base + k * 0.013,
      y: base - k * 0.017,
      uvX: (k + seed % 3) / 4,
      uvY: (k + 1 + seed % 5) / 5
    }));
    return {vertices, clipMinX: base - 0.05, clipMinY: base - 0.03,
      clipMaxX: base + 0.07, clipMaxY: base + 0.02};
  });
  return {event: {team: seed % 2 ? Team.A : Team.B, strength: (seed % 11) / 10}, quads};
}

function assertExactBuffers(groups: readonly PackedInkGroup[]): void {
  const baseline = originalPack(groups);
  const optimized = packInkBrushGpuGroups(groups);
  expect(optimized).toEqual(baseline);
  if (!baseline || !optimized) return;
  expect(optimized.positions).toEqual(baseline.positions);
  expect(optimized.uvs).toEqual(baseline.uvs);
  expect(optimized.rectMins).toEqual(baseline.rectMins);
  expect(optimized.rectMaxs).toEqual(baseline.rectMaxs);
  expect(optimized.colors).toEqual(baseline.colors);
  expect(optimized.indices).toEqual(baseline.indices);
}

describe('T21 V28 performance: byte-identical authorized row-run GPU packing (#21)', () => {
  it('keeps no-quad batches as no-render, never invents paint pixels', () => {
    expect(packInkBrushGpuGroups([])).toBeNull();
    expect(packInkBrushGpuGroups([makeGroup(1, 0)])).toBeNull();
  });

  it('preserves A/B owner bytes and visual wetness including edge values', () => {
    for (const strength of [-1, 0, 0.01, 0.5, 1, 3, Number.NaN]) {
      for (const team of [Team.A, Team.B]) {
        const single = makeGroup(1, 1);
        assertExactBuffers([{...single, event: {team, strength}}]);
      }
    }
  });

  it('preserves exact index winding, per-quad clip, UV and FIFO geometry order', () => {
    assertExactBuffers([makeGroup(0, 3), makeGroup(1, 4), makeGroup(2, 2)]);
  });

  it('matches original buffers for deterministic mixed 7CPU-style bursts', () => {
    let state = 0x83e9c5;
    const rand = () => {state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296;};
    for (let trial = 0; trial < 80; trial++) {
      const groupCount = 1 + Math.floor(rand() * 30);
      const groups = Array.from({length: groupCount}, (_, i) =>
        makeGroup(trial * 37 + i, Math.floor(rand() * 17)));
      assertExactBuffers(groups);
    }
  });

  it('matches old buffers at the full 16,383-quad Uint16 limit', () => {
    assertExactBuffers([makeGroup(0, 4096), makeGroup(1, 4096),
      makeGroup(2, 4096), makeGroup(3, 4095)]);
  });

  it('never edits input quads or source event data', () => {
    const g = makeGroup(7, 2);
    const frozen: PackedInkGroup = Object.freeze({
      event: Object.freeze({...g.event}),
      quads: Object.freeze(g.quads.map(q => Object.freeze({
        ...q, vertices: Object.freeze(q.vertices.map(v => Object.freeze({...v})))
      })))
    });
    const before = JSON.stringify(frozen);
    assertExactBuffers([frozen]);
    expect(JSON.stringify(frozen)).toBe(before);
  });
});
