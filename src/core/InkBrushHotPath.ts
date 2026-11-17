/**
 * Read-only indexing and FIFO draining for the GPU-only authoritative brush
 * path. Never creates, expands, modifies, or infers paintable raster runs.
 *
 * The surface list and queued run arrays are stable for the lifetime of an
 * atlas/event, respectively; keep Array.find's first-ID-wins behavior.
 */
export function indexInkBrushSurfaces<Surface extends { readonly id: string }>(
  surfaces: readonly Surface[]
): ReadonlyMap<string, Surface> {
  const index = new Map<string, Surface>();
  for (const surface of surfaces) {
    if (!index.has(surface.id)) index.set(surface.id, surface);
  }
  return index;
}

export interface PendingInkBrush<Event, Run> {
  readonly event: Event;
  readonly paintableRuns: readonly Run[];
}

export interface DrainedInkBrushBatch<Event, Run> {
  readonly batch: PendingInkBrush<Event, Run>[];
  /** Only fully exhausted events count toward this value. */
  readonly completedEvents: number;
}

/**
 * Preserve the original FIFO, max-events, and 16-bit quad-budget semantics.
 * Use one prefix splice instead of an O(n) shift for EACH completed event.
 * Complete events reuse their authorized row-run arrays (no unnecessary
 * clone); only the partially consumed event requires two slices.
 */
export function drainInkBrushBatch<Event, Run>(
  pending: PendingInkBrush<Event, Run>[],
  eventBudget: number,
  maxQuads = 16_383
): DrainedInkBrushBatch<Event, Run> {
  const batch: PendingInkBrush<Event, Run>[] = [];
  let completedEvents = 0;
  let consumed = 0;
  let remainingQuads = maxQuads;

  while (consumed < pending.length && completedEvents < eventBudget &&
         remainingQuads > 0) {
    const first = pending[consumed]!;
    const taken = Math.min(remainingQuads, first.paintableRuns.length);
    if (taken === first.paintableRuns.length) {
      // The original implementation sliced every event. Reuse instead:
      // paintableRuns is authoritative and read-only for GPU geometry.
      batch.push(first);
      consumed += 1;
      completedEvents += 1;
    } else {
      batch.push({ event: first.event, paintableRuns: first.paintableRuns.slice(0, taken) });
      pending[consumed] = {
        event: first.event,
        paintableRuns: first.paintableRuns.slice(taken)
      };
      break;
    }
    remainingQuads -= taken;
  }

  if (consumed > 0) pending.splice(0, consumed);
  return { batch, completedEvents };
}
