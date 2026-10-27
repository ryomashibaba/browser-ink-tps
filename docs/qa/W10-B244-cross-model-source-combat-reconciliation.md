# W10-B244 — Cross-model SOURCE combat adoption and same-scenario evidence

Date: 2026-10-27 JST. Non-production; no change to frozen source authority.
This document records results without claiming a natural enemy encounter, original Turf result, or a 180-second comparable full-game win.

## Baseline and isolated submissions

- Common parent: `39ba2accd59f2f4e99b19a5fc1732f40739612da` (B243).
- GPT-6.1 Sol low independent branch: `experiment/gpt-compare-20261027-sol-low`, HEAD `5efdff9010b93925d60b2cde89ad2146751fafed`.
- GPT-6.1 Terra high independent branch: `experiment/gpt-compare-20261027-terra-high`, HEAD `2196f0cabd7e2f83bc470312e414fddc891f351b`.
- Shared validation branch: `experiment/gpt-compare-20261027-verification`.
- All three pinned SHAs were checked out independently with Node 24 / Ubuntu; TypeScript/Vite, identical core source/combat Vitest, optional candidate-specific unit tests and the **same B75 FIXED real WebGL2 Chromium script** passed in [Actions #40427596472](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40427596472). All three jobs finished SUCCESS.
- Preserved GitHub Actions artifacts: `source-model-baseline` (12700054670), `source-model-sol-low` (12700642598), `source-model-terra-high` (12700787704). The archive contains read-only native JSON, true framebuffer screenshots and B242 lifecycle evidence. Do not commit original stage extraction/private assets.

## Independently inspected B75 FIXED artifact metrics

Each run is a roughly 13-second native-source segment, NOT a full 180-second time-up acceptance. Native input/rendering was observed; the test does not force opponents to meet.

| Metric | Baseline | Sol low | Terra high |
| --- | ---: | ---: | ---: |
| native interval (s) | 13.067 | 13.033 | 13.050 |
| native CPU actors rejoined | 7 | 7 | 7 |
| CPU source shots | 73 | 73 | 73 |
| CPU changed impact cells | 3142 | 3142 | 3142 |
| accepted human shots | 9 | 9 | 10 |
| human changed source cells | 365 | 365 | 392 |
| B182 sight feature ENABLED in this FIXED experiment | false | false | false |
| B182 original stage rays / visible enemies | 0 / 0 | 0 / 0 | 0 / 0 |
| actual CPU relocation | 0 | 0 | 0 |
| original source status | 25 / 17 / 26 / 0 | 25 / 17 / 26 / 0 | 25 / 17 / 26 / 0 |
| real framebuffer | preserved | preserved | preserved |

**Important**: B182's FIXED-mode 0/0 is an *inactive diagnostic*, not proof that sight was exercised and failed. Separate B181 real-combat full-round reports and disconnected original source paths still leave natural cross-team encounter unverified. CPU shots/paint in this scenario do not prove CPU-vs-human HP damage.

The true B242 full-round lifecycle artifact additionally confirms READY tick 0 / 180s, real staging pause and focus-loss pause, same-world explicit resume, no virtual ticks, no actor relocations, originalWinner NONE and B243 visible sight-line with `projectileHitCertified=false`.

The B242 source actor coordinates at focus pause place nearest opposing CPU teams approximately 99.8–99.95m apart (horizontal), well beyond B181's 32m visibility search. This is a positional **snapshot**, not an all-frame minimum.

Small human ink/input differences and different B217 six-second windows are *not* a controlled game improvement. No after/before 180s measured combat hit rate is available. No model quality or token-efficiency rank is established.

## Framebuffer review

All 1600x900 READY screenshots have the same SHA256 across three variants; no changed READY visuals.
B75 in-game frames also have essentially the same 3D camera, cyan placeholder capsule, sparse source geometry and dense HUD. Minor paint/HUD differences should not be scored as a visual upgrade.
The READY screen has multiple overlapping QA panels; crowded presentation and placeholder-looking geometry are substantial F5 player-experience work, not completed art.
The recorded headless SwiftShader `nativeFrameCallbackP95Ms` was baseline 989, Sol 908.4, Terra 1207.6 at final B75 observations; these are not apples-to-apples production GPU FPS and are not reliable model throughput rankings.

## Independent code audit and adoption

Sol read-only `ThirdPersonCamera` center-ray CPU combat hit-volume target is grounded in `CpuAgentSystem.findNearestCombatHit`. Original world occlusion still takes precedence, and ProjectileSystem alone resolves actual collision and HP. No cone autolock, HP edits, Actor movement or new volumes. Existing original source exercise is too far from enemies to demonstrate a natural hit.

Sol's **minimal candidate** was extracted into commit [`3b9a9780`](https://github.com/ryomashibaba/browser-ink-tps/commit/3b9a978039654e609c79a03ffb224396283035d0) (exactly 3 files) and advanced via guarded fast-forward to `dev/t21-f4e103w-qa-infra`. New dev-branch B75, B15, B162, B120, source-floor and rendering CI re-runs remain separately authoritative; their outcome must be inspected before any future merge or deployment.

Terra's `fixedStepLaunch` matches semi-implicit 60Hz ballistic travel under its covered unit conditions, but is enabled on a shared ProjectileSystem, affecting HUMAN as well as CPU fire, despite 'CPU aim' labeling. Its natural real-source hit improvement was not observed. Keep Terra isolated until player weapon and CPU projectile regressions and actual same-target hit measurements exist.

## Mandatory ongoing HOLD

- Rapier original solids **25**, Paintable **17**, source NavLinks **26**, Scoreable **0**.
- Original natural opponent crossings **0/12 certified**. FloorLine00 physical source authority **HOLD**.
- Official 4v4, win/loss, scoring, production activation **HOLD**.
- main, frozen T19C/T20, published Pages, Draft PR #5 unchanged.
- A previous B162 run for the shared baseline (`40404097487`) failed `B140_WAIT_TIMEOUT`. Such an already recorded base failure is not a new Sol regression. The post-adoption B162 run must be evaluated independently.

## Next gameplay work

1. Retain Sol's guarded source camera aim in dev only if fresh native regressions pass; distinguish a real enemy on camera ray from a projectile HP hit.
2. Stop scoring zero enemy-sight counters as a model defect where B182 is disabled. Advance F2/F4 source-grounded crossing only with evidence; never invent connectors or relocate enemies.
3. Refactor overlaid practice debug panels into a usable presentation without erasing QA data, then conduct human hands-on source gameplay and native frame-timing measurement on real GPU.
4. Consider Terra's fixed-step ballistic correction only as a separately gated change with explicit HUMAN/CPU contract tests and shooter spread/life/occlusion coverage.
