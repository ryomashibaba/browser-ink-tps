# Browser Ink TPS — W10-B20 source-only render-cost and persistent GPU ink checkpoint
**Date:** 2026-10-18 JST  
**Parent checkpoint:** `60e528fbf514c8c42df910ceef600905d8dae01a` (W10-B19)  
**Verified code HEAD:** `c0e884d724790adbfdbf0cc797ec6b7c02f82d97`  
**QA branch only:** `dev/t21-f4e103w-qa-infra`. **Not a T21 production activation.**

## Scope and deliberate safeguards
- The `GpuInkAtlas` constructor gains **optional** `suspendIdleSourceCamera=false`; all preexisting T20/default instantiations remain unchanged.
- **Only** the explicit `UndertowF3PlayablePreviewApp` passes `true`. Its persistent RenderTarget remains allocated and sampled while the atlas camera is disabled between writes.
- First-frame priming, queued **real** brush submissions, and explicit `clear()` re-enable the atlas camera as necessary. Postrender marks the brush inactive and suspends the camera; future genuine stamps cause it to re-enable.
- An opt-in `?t21Play=preview&t21W10B20=profile` reports native CPU duration categories (real human Rapier KCC + physics, seven original CPUs, projectile and aim work, ink ownership, entity and camera preparation, GPU atlas mesh build, and PlayCanvas render submission). Timing is CPU JS wall time, **not a GPU execution profiler**.
- The browser QA checks the **post-render** atlas state, not the stale pre-render snapshot from `advanceQaTicks`. A prior intermediate test failure was solely this stale-state assertion; no original solids, navigation or scoring mask were changed.

## Grounded real Chrome verification (FINAL VERIFIED CODE SHA)
1. [W10-B15/B16/B18/B19/B20 integrated real Chromium WebGL2](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39134126410) — **SUCCESS**.
2. [W10-B14 actual Chrome CPU rendering lifecycle](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39134126321) — **SUCCESS**.
3. [Ubuntu + Windows source QA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39133780605) — **SUCCESS at earlier W10-B20 code HEAD** `49d5dabc49c1`; the final `c0e884` changed the test script, not Windows runtime code. This is **not the owner's Windows GPU QA**.
4. Latest B20 real-browser evidence artifact `w10b20-source-cpu-gpu-atlas-profile.json` is uploaded through the successful integrated Action.

### Atlas/CPU diagnostics from the integrated Chrome profile
- `sourcePreviewOnly=true`, persistent atlas `primed=true`, **idle camera disabled at postrender**, `pendingEvents=0`.
- **17 brush-render submission frames**, **67 idle postrender frames** where the dedicated atlas camera stays suspended; write/idle transitions accepted in the real WebGL2 environment.
- Actual CPU source turf: **87 shots, 92 real paint impacts, 11,064 changed ownership cells**, 703.8817 m source-local total patrol.
- Snapshot phase means (sample units matter; not a controlled before/after performance benchmark):
  - Human KCC + Rapier: `0.181 ms/native tick` over 2638 ticks.
  - Seven original native CPUs: `0.496 ms/native tick` over 2638 ticks.
  - Aim/projectile/kits: `0.115 ms/native tick` over 2638 ticks.
  - CPU ink ownership processing: `0.007 ms/native tick` over 2638 ticks.
  - PlayCanvas prerender→postrender CPU wall interval: **67.052 ms/callback average**, **2410.7 ms peak**, across 84 callbacks; includes CI SwiftShader/driver stalls and is **NOT** GPU execution time.
  - GPU atlas CPU mesh build: `0.050 ms/update callback` over 34 update samples (idle samples included).
- Frame callbacks in the full snapshot: p50 1152.6ms, p95 2358.4ms from this heavy software-renderer/CDP runner, **not owner GPU FPS**. No causal FPS uplift % is asserted.
- B16 path evidence unchanged: **0/12 credible native cross-team foot paths**, original enemy meeting/HOLD, 98.89m nearest reported gap. No natural 4v4 or Turf winner.

## Authority and provenance
- Original certified physics **25**, paintable surfaces **17**, original navigation links **26**, scoreable surfaces **0**, `activationReady=false`.
- No invented floor, optical-to-collision promotion, warp, actor instance matrix, artificial NavLink, score mask, or extra gameplay mesh.
- T19C/T20 Freeze and production `main=fbd922cea900df8e1a139f21b3c61ed927b3fdd9` remain unchanged. Draft PR #5 remains open/unmerged on distinct `8cfc95756ef0b56e2c33dc9f89a9041126daa272`. All nonpublic original source files stay local.

## Next W10-B21
1. If credible `Vss_Temple01` Banc/SetActor original placement data appears, stop and prioritize authenticated central and underpass restoration (no inferred bridge).
2. Otherwise do a **small, controlled same-camera original-stage GPU/CPU frame experiment** (render scale, scene optical source layers, idle ink camera A/B) that differentiates PlayCanvas/SwiftShader stalls from real native simulation costs. No broad unexplained rendering changes; no dramatic FPS claims based only on headless CI.
3. Validate real-user Windows RTX responsiveness at an appropriate checkpoint (one bundled user operation at most) before certifying quality; keep T21 source-only preview.
4. Preserve 25/17/26/0, CPU real original-foot authority, production/PR isolation, UNKNOWN/HOLD and run no redundant 0/12 gap loops without new primary evidence.

**Plan/quality/efficiency audit:** source-only performance improvement implemented and browser-proven with minimal gameplay changes; existing expensive B16 Chrome lane reused to test real ink impact, not a redundant standalone 7CPU run. Source provenance, natural 4v4 blocker, and owner-device GPU validation retain separate certification requirements.
