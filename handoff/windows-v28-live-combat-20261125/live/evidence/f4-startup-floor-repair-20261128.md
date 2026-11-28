# F4 startup and floor repair evidence — 2026-11-28

## REAL_GAME_DELTA

- Applied the chief startup throughput change in the shared live snapshot: material geometry fetch/hash runs concurrently while verified buffers are installed in original manifest order. Integrity checks remain enabled.
- Added stage timing capture for seed fetch/parse, Rapier and Recast initialization, graphics device setup, primary/test terrain setup, source audit, source asset fetch/decode, world-vertex extraction, full-mesh Recast/Rapier setup, floor extraction/registration, wall registration, and score preparation.
- Added verified original static floor geometry classes `FloorGrass00`, `GrassFloor00`, and `FloorMetal00` to floor candidates. These are source meshes; projected paint cells still require the source triangle mask and live Rapier backing. No floor was fabricated.
- Reduced duplicate Rapier queries for provisional F4 floor cells: the extractor's existing five source-geometry probes remain mandatory, then a center ray must hit the live Rapier mesh. Other floor classes and walls retain their existing physical support gate.
- Corrected wall-seed height comparison to compare the actual Rapier hit height with the source world's computed base height.
- Preserved active-play score work budget (3 ms / 1,024 cells). Only staging preparation uses the chief's 12 ms / 8,192-cell budget.

## EVIDENCE

- Browser: isolated Chrome 158.0.8127.38 via read-only CDP; WebGL2; ANGLE D3D11 on AMD Radeon 890M. The machine also reports RTX 5080. No Windows-wide desktop control and no physical input emulation were used.
- Final run reached score status `LIVE`, progress 100%, real Rapier whole-mesh status `READY`, with 57,840 source triangles.
- Final score preparation: 4,357.8 ms. Previous same-day probe before the duplicate-query optimization: 7,714 ms (43.5% faster).
- Additional source-backed floor: 896 registered tiles / 4,279.2426 m² final, versus 4,240.7158 m² before query optimization (+38.5268 m²). Earlier candidate-class probe measured 3,244.8877 m²; final is +1,034.3549 m² from that probe. These values are projected mask-backed area, not scored ownership.
- Final timings (ms): seed 7; Rapier WASM 15.4; Recast WASM 82.9; graphics device 42.9; primary Recast mesh 146.8; primary Rapier stage 91.1; source audit 191; test stage 114.7; app synchronous construction 802.4; source manifest audit 506.1; texture fetch/decode/upload 259.1; parallel geometry fetch/hash 52.4; terrain mesh construction 13.5; F3L source load 831.6; full-mesh Recast build 109.4; Rapier trimesh install 53.7; added floor extraction/registration 1,284.4; wall registration 14.1; exact score preparation 4,357.8.
- Wall probe: 40/40 source wall triangles are Rapier-backed; 17 axis wall candidates, 8 physically backed candidates, 8 selected/registered surfaces. The source has zero axis-aligned vertical triangles in this probe, so wall availability remains limited by actual source geometry and access constraints.
- Build passed (`npm run build`, TypeScript build + Vite, 1,585 modules). Targeted tests passed: 13 files / 117 tests. `git diff --check` passed.
- Raw final capture: `work/f4-cdp-startup-throughput-20261128-optimized-raw.json` in the canonical repository. Earlier comparison captures: `work/f4-cdp-startup-throughput-20261128-raw.json` and `work/f4-cdp-score-ready-raw.json`.

## HOLD

- This was a staging/score-readiness startup probe, not a live manual play session. No pointer lock, movement, firing, projectile impact, ownership change, scored coverage, special/subweapon use, or FPS sample was produced by CDP. The user's prior live observation that a location still would not wet is preserved; this run does not claim that residual location is fixed.
- No repeated-round reset was measured. The route performs a fresh world construction on replay; no persistent cache or in-place reset was introduced because it could change asset integrity or physics state.
- No active GPU paint queue measurements were produced. GPU initialization and WebGL2 availability were verified; gameplay rendering load and frame rate remain unverified.

## NEXT

- Recheck the reported dry spot during genuine gameplay and trace source surface → Rapier contact → mask cell → actual paint event → ownership → GPU atlas/display.
- Measure active-play paint queue and FPS, plus a replay startup, in the isolated Chrome session. Keep score, physics, and ownership tied to real events.