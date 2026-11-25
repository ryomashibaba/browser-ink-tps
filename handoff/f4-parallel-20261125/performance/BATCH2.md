# F4 performance batch 2 — independent post-integration changes
Research source inspected: 0fbbebcf0a00cd8e4e4268f28533c235257138c8
Windows shared source: 175e1a63f4825d28761e57eef9ca2b44aeccb6db
Integrated provisional patch blob: 4cdc430a48a7d00017b28e7fe210e9b82ee024d4
B216 base blob: d54fad0f66a01c458c3ba425d86162b2c7a2a725
Windows GameplayInkSystem base blob: 4648b556c3345f8a70149ed7772215be72d443f6

Apply after f4-provisional-playable-batch.patch. Run git apply --check separately for each of:
- provisional-mask-memory.patch (src/ink/F4ProvisionalTurf.mjs)
- cpu-grid-search.patch (src/ai/B216OriginalSourceBackfillInk.ts)
- paint-raster-row.patch (src/ink/GameplayInkSystem.ts)
Then apply each if clean. Existing ink-brush-pack.patch remains valid and independent. No App edits; no QA or Windows source writes in research handoff. On conflict inspect the actual source, do not force.

## Behavior
- Provisional score mask: byte states + exact Float64 axis widths/heights, same multiplication order, same scan calls, same physical backing gate, same owner transitions and final latch. Static registered dimensions/normal assumed, as for PaintSurface. Example 256x256: 524288 -> 69632 bytes for score mask arrays (86.7% reduction, not whole game memory). Does not reduce the required initial physical queries. Adds O(width+height) startup operations; only actual rectangular floor grids expected.
- B216 fallback scan: same real cells, range, footprint, order, bucket and separation criteria. Use PaintSurface's existing scratch-output overloads, postpone footprint projection until height/range pass, clone only retained points; no fake routes, paint, hits, or changes to CPU decision cadence.
- Paint raster: reuse row-constant dy products; same exact arithmetic, flags, physical checks and provisional score callbacks. No change to tests/QA gates.

## Executed isolation evidence
Exact original F4 module extracted from latest integrated patch vs new: 80 scenarios, 14400 interleaved scan/ownership operations, identical values and backing call count (75406 per implementation). Two durable regression scenarios passed with minimal assertion shim; after integration run `node --test handoff/f4-parallel-20261125/performance/F4ProvisionalTurf.performance.test.mjs`.
B216 actual function body type syntax removed, faithful mock Vec3 and rotated grid methods: 110 scenarios, 1911 ordered proposals exactly identical; Vec3 allocations 95409 -> 20781; projection calls 95409 -> 58659. Mock uses floor/paint/wall flags and all generated cells have no Scoreable bit (actual bit 4), not native PlayCanvas. Run existing `npx vitest run src/ai/B216OriginalSourceBackfillInk.test.ts`.
Windows actual raster loop body (pre-provisional) vs row hoist: 500 randomized brushes, 224590 tested cells, exact runs/owner grid/dirty tiles/counters; physical backing mock. Patch regenerated against reconstructed post-provisional preimage; score hook unchanged. Run existing INK tests and npm run typecheck.
All three patch reconstructions exact. No native browser/FPS measurement, no complete TS build, no real Rapier or private assets. Treat performance counts as isolation only.

Next integration should profile actual full-round frames using existing b20 instrumentation; avoid changing fixed clock, CPU decisions or authorization in the absence of bottleneck evidence.
