# F4 performance — exact GPU brush packing

Base research HEAD: 7e10c7bc989f00715ba1e943c2ef717612af8e99
Base source blob: d26cdd204bc33845d4d1f81cf6bf8fbea20edf98
Windows shared HEAD inspected: 175e1a63f4825d28761e57eef9ca2b44aeccb6db
Integrated provisional patch inspected: 4cdc430a48a7d00017b28e7fe210e9b82ee024d4 (does not touch this core module).

## Apply
From repository root, verify src/core/InkBrushRasterStream.ts matches the base blob or review its local changes, then:
`git apply --check handoff/f4-parallel-20261125/performance/ink-brush-pack.patch`
`git apply handoff/f4-parallel-20261125/performance/ink-brush-pack.patch`
Run `npx vitest run src/core/InkBrushRasterStream.test.ts src/core/InkBrushHotPath.test.ts` and `npm run typecheck`.
Do not apply if the Windows preimage differs without reviewing the local changes.

## Delta
Reuse deterministic quad indices in the existing per-atlas scratch (fill only on growth); halve repeated UV component multiplications within each quad; preserve division and arithmetic order, exact clipping, event order, index cap, all six buffer lengths and bytes. Non-scratch API still computes its own indices. No gameplay, QA, shader, atlas resolution, paint ownership, or fixed tick changes. The existing scratch contract remains synchronous mesh.update consumption; treat returned index views as read-only. No new retained arrays.

## Evidence
Connector V8 isolated execution: actual GitHub TS source and patched source were loaded after removing type-only syntax. 317 comparisons, 52,945 total output quads across comparisons, 6 buffers compared byte-for-byte, scratch/non-scratch, varying sizes, clipped/invalid rows, 16,383 cap, release/reallocation; overflow rejected in both. Patch reconstruction exact. Not full Vitest/TypeScript/PlayCanvas.
Synthetic 17-group, 273 accepted-quad batch, 5,000 repeated calls, warm-up 500: baseline/new milliseconds 4351/4342, 4706/4555, 4546/4311. Small improvement only; noisy wall clock, not game FPS. No Windows or GPU timing measured.
Existing source already has idle atlas suspension, surface index, FIFO drain, bounded raster scratch, projection culling; do not duplicate those.
Next: profile actual 7CPU frame phases and provisional mask startup; no change to 60Hz, no CPU decision thinning without evidence.
