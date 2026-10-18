# Browser Ink TPS — W10-B21 original-stage frozen Chrome render A/B/A checkpoint

**Date:** 2026-10-18 (JST)  
**Parent QA checkpoint:** `0ecc642ef268c7e46133d88cdfcbe91b6417ae0b` (W10-B20)  
**Verified code HEAD:** `4c0374c0f973fa0e7702d2c7ebde8fade30c9a84`  
**Branch:** `dev/t21-f4e103w-qa-infra` only; **not** PR #5, main, or a production deployment.

## Meaningful source-only deliverable

- F3 nonproduction source-only review/practice now offers **Render quality: NATIVE / 75% (performance)** inside the existing developer controls. Native is the default. Clicking the option while pointer locked is rejected, with no synthetic actor, collision or path modification.
- `NATIVE` uses original AUTO-resolution behavior. `PERFORMANCE` uses `RESOLUTION_FIXED` at exactly 75% of the current source canvas backing width and height, reducing *raster pixel count to 56.25%*. The original native canvas is restored through `RESOLUTION_AUTO` + normal `resizeCanvas()` when selecting NATIVE. This changes display precision, **not** stage geometry/physics/painting source.
- The optional `?t21Play=preview&t21W10B21=renderAB` QA gate exposes a **frozen, pointer-unlocked, tick=0** benchmark. It records PlayCanvas CPU wall durations from real browser `prerender` to `postrender`; these are neither full input-to-photon latency nor GPU completion time.
- New workflow runs a one-browser NATIVE → 75% → NATIVE A/B/A comparison with the *identical* original partial stage, stopped actor feet/ticks, yaw and pitch. Full native screenshot after restoration is byte-for-byte identical to the baseline on CI. All three modes actually render 1600×900 viewport screenshots; stage authority is not promoted.

## Final verified GitHub Actions
- [W10-B21 real Chrome frozen stage A/B/A](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39135273055): **SUCCESS at `4c0374c0f973`** — genuine WebGL2 / Chromium / SwiftShader.
- [B15-B20 integrated real pointer/7CPU source QA regression](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39135250203): **SUCCESS at `3f9368494beb`**.
- [B14 real Chrome lifecycle](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39135250248): **SUCCESS at `3f9368494beb`**.
- [Ubuntu + Windows source QA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39135119505): **SUCCESS at `3d88f4cd1614`**, same runtime implementation SHA but before browser-script and workflow-only commits. Not owner Windows GPU.

### Actual measured frozen A/B/A (single Chrome run; 5 samples per condition)

| Phase | Real canvas backing px | Median prerender→postrender JS wall interval | p95 | PNG SHA256 |
|---|---|---:|---:|---|
| NATIVE A | 1600×900 | 6.1ms | 15.5ms | `ea855799fd13acc4be51b459d0b0d010eb6a4f648815e18578477c43f5560c94` |
| 75% B | 1200×675 | 4.9ms | 6.1ms | `ab4d28ecd23e20a24ffff86f00b8deaf451092ef40530a14df3ae43a431f4e5a` |
| NATIVE A2 | 1600×900 | 3.6ms | 6.2ms | `ea855799fd13acc4be51b459d0b0d010eb6a4f648815e18578477c43f5560c94` |

**Interpretation:** the lower-resolution mode demonstrably reduces raster pixel workload, but the repeated native control was quicker than 75% on the second pass. The tiny CI sample is highly variable. **No FPS uplift, guaranteed speedup or causal GPU bottleneck claim.** No claim of 4v4 readiness. Results should be validated separately with the owner's GPU at a useful combined manual-play checkpoint.

### Preserved source authority and HOLD

- **25 certified collision solids, 17 paintable but unscored surfaces, 26 original NavLinks, 0 official scoreable faces, `activationReady=false`.**
- All A/B/A steps used **0 physical simulation ticks**, frozen original human/CPU feet, no added mesh, guessed original Actor instances, roof/walkway, corridor, warp, nav or score. Production authority `false`.
- T19C/T20 Freeze, nonpublic source assets, `main=fbd922cea900df8e1a139f21b3c61ed927b3fdd9`, separate Draft PR #5 `8cfc95756ef0b56e2c33dc9f89a9041126daa272`, and published pages are untouched.
- Original `Vss_Temple01` Banc/SetActor placement, central/underpass original path and natural opposing-team routes remain **UNKNOWN/HOLD**; latest B20 true-foot cross-team paths **0/12**, original Turf scoring missing. Never turn A/B art comparison into stage authority.

## Next: W10-B22 decision

Prioritize authenticated original Banc/SetActor instance matrices if reliable local source evidence becomes available. Otherwise improve real player experience without modifying geometry by collecting a **small, controlled owner-Windows-GPU input/render/visibility trial**, ideally one action instead of repeated ZIP tests, to establish whether 75% mode helps compared with NATIVE. If meaningful gains are absent, retain NATIVE and avoid further quality loss; optimize actual proven bottlenecks instead. Keep all changes confined to the QA branch and source-only route.
