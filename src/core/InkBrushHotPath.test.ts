import { describe, expect, it } from 'vitest';
import { drainInkBrushBatch, indexInkBrushSurfaces } from './InkBrushHotPath';

type Row = Readonly<{ row: number; startX: number; endXExclusive: number }>;
type Event = Readonly<{ id: number; surfaceId: string }>;
type Pending = { event: Event; paintableRuns: readonly Row[] };

/** Frozen baseline of the pre-optimization b817c7ea queue algorithm. */
function originalDrain(pending: Pending[], eventBudget: number, quadBudget: number) {
  let completedEvents = 0;
  let remainingQuadBudget = quadBudget;
  const batch: Pending[] = [];
  while (pending.length > 0 && completedEvents < eventBudget && remainingQuadBudget > 0) {
    const first = pending[0]!;
    const taken = Math.min(remainingQuadBudget, first.paintableRuns.length);
    batch.push({ event: first.event, paintableRuns: first.paintableRuns.slice(0, taken) });
    remainingQuadBudget -= taken;
    if (taken === first.paintableRuns.length) {
      pending.shift();
      completedEvents++;
    } else {
      pending[0] = { event: first.event, paintableRuns: first.paintableRuns.slice(taken) };
      break;
    }
  }
  return { batch, completedEvents };
}

const rows = (n: number, offset = 0): Row[] =>
  Array.from({ length: n }, (_, i) => ({ row: i + offset, startX: 1, endXExclusive: 3 }));

function payload(runCounts: readonly number[]): Pending[] {
  return runCounts.map((count, id) => ({
    event: { id, surfaceId: 'original-' + (id % 17) }, paintableRuns: rows(count, id * 200)
  }));
}

describe('T21 V28 performance — GPU-only row-run hot path (#21)', () => {
  it('indexes 17 surfaces once and preserves Array.find first-ID wins', () => {
    const surfaces = Array.from({ length: 17 }, (_, i) => ({ id: 'source-' + i, stamp: i }));
    const duplicate = { id: 'source-4', stamp: 999 };
    const index = indexInkBrushSurfaces([...surfaces, duplicate]);
    expect(index.size).toBe(17);
    for (const surface of surfaces) expect(index.get(surface.id)).toBe(surface);
    expect(index.get('source-4')).toBe(surfaces[4]);
    expect(index.get('not-paintable')).toBeUndefined();
  });

  it('does not allocate new arrays or alter events for fully accepted runs', () => {
    const approved = Object.freeze(rows(11));
    const event = Object.freeze({ id: 42, surfaceId: 'original-0' });
    const pending: Pending[] = [{ event, paintableRuns: approved }];
    const result = drainInkBrushBatch(pending, 1);
    expect(result.completedEvents).toBe(1);
    expect(result.batch[0]!.event).toBe(event);
    expect(result.batch[0]!.paintableRuns).toBe(approved);
    expect(pending).toHaveLength(0);
    expect(approved).toHaveLength(11);
  });

  it('preserves 16-bit 16,383-quad split and same-event continuation without loss', () => {
    const pending = payload([16_384, 2]);
    const first = drainInkBrushBatch(pending, 2);
    expect(first.completedEvents).toBe(0);
    expect(first.batch[0]!.paintableRuns).toHaveLength(16_383);
    expect(pending[0]!.paintableRuns).toHaveLength(1);
    expect(pending).toHaveLength(2);
    const second = drainInkBrushBatch(pending, 2);
    expect(second.completedEvents).toBe(2);
    expect(second.batch.map(entry => entry.event.id)).toEqual([0, 1]);
    expect(second.batch.flatMap(entry => entry.paintableRuns)).toHaveLength(3);
    expect(pending).toHaveLength(0);
  });

  it('preserves oldest-first ordering and event budget with many CPU paint events', () => {
    const pending = payload(Array.from({ length: 120 }, (_, i) => i % 7 + 1));
    const baseline = pending.slice();
    const drained: number[] = [];
    while (pending.length > 0) {
      const result = drainInkBrushBatch(pending, 9, 80);
      expect(result.batch.reduce((sum, x) => sum + x.paintableRuns.length, 0))
        .toBeLessThanOrEqual(80);
      expect(result.completedEvents).toBeLessThanOrEqual(9);
      drained.push(...result.batch.map(x => x.event.id));
    }
    expect(drained).toEqual(baseline.map(x => x.event.id));
  });

  it('matches original row-run batches and queue over deterministic stress cases', () => {
    let state = 0x51fc9919;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 2 ** 32;
    };
    for (let scenario = 0; scenario < 90; scenario++) {
      const count = 1 + Math.floor(random() * 55);
      const runCounts = Array.from({ length: count }, () => 1 + Math.floor(random() * 65));
      const source = payload(runCounts);
      const before = [...source];
      const after = [...source];
      const eventsPerFlush = 1 + Math.floor(random() * 25);
      const quadsPerFlush = 1 + Math.floor(random() * 180);
      let loops = 0;
      while (before.length > 0 || after.length > 0) {
        const old = originalDrain(before, eventsPerFlush, quadsPerFlush);
        const next = drainInkBrushBatch(after, eventsPerFlush, quadsPerFlush);
        expect(next.batch).toEqual(old.batch);
        expect(next.completedEvents).toBe(old.completedEvents);
        expect(after).toEqual(before);
        if (++loops > 10000) throw Error('GPU_PENDING_DRAIN_DID_NOT_TERMINATE');
      }
    }
  });
});
