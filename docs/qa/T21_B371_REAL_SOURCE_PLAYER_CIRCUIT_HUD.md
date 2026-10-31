# B371 — SOURCE original drop → ramp → real ink player-facing mission

Date: 2026-10-31 JST. QA branch `dev/t21-f4e103w-qa-infra`.
Feature implementation through [`3fd4040`](https://github.com/ryomashibaba/browser-ink-tps/commit/3fd40404389e9d64767513f77cfb83f8faef873a).

## Player-visible coherent F3 slice

Use **the existing B183/B186 native original-source circuit** and user-selected `pulse-sprayer` SOURCE practice session (B343/B345/B346/B348). Replace the lengthy PLAYER mission text on the *existing* mission card with three trusted local steps: (1) actual source first drop, (2) true KCC grounded original ramp/raised floor, (3) genuine human projectile impact changed cells from 17 registered PaintSurface. Successful local task is displayed only when existing B186 reports `REAL_LOCAL_CIRCUIT_CLEAR`. No new objective/score logic, collision, navigation, CPU/weapon or camera behavior is introduced.

The PLAYER card also reads actual accepted player shots and actual `PerformanceStats.playerInkPercent`, with a permanent `NO TURF WINNER · NO CROSS-TEAM PATH` indication. QA presentation remains the original detailed HUD. There is **no new overlay occupying screen space**. The presenter is read-only, and fails closed on source stage 25/17/26/0 mismatch, false physical-source ink state, contradictory circuit CLEAR, or invalid resource counters.

## Code and evidence

- `src/app/B371RealSourceMissionCue.ts`: pure fail-closed 3-stage read-only formatter.
- `src/app/UndertowF3PlayablePreviewApp.ts`: existing mission card integration in opt-in SOURCE shooter PLAYER mode only; original B183/B186 physical gameplay remains unchanged.
- `src/app/UndertowF3PlayableHud.test.ts`: stage transitions and negative guards.
- `scripts/t21-b343-real-source-volley-round.mjs`: real Chromium start and end checks of same original circuit, actual player shots, and the non-scoring DOM provenance.
- Existing integrated [B343 native CI #41179953155](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41179953155) is the actual acceptance gate. **Check the live result: an in-progress/queued run does NOT constitute native PASS.**

## Explicit HOLD

Original stage authority remains 25 registered Rapier solids / 17 PaintSurface / 26 original NavLinks / 0 Scoreable and opposing natural routes 0/12. No fabricated physical CPU encounter, no official 4v4, official winner or Turf score, and no production activation. `main`, T19C/T20 stable, Draft PR #5, published Pages and private original source assets are unchanged. This presentation improvement is not an ART freeze approval and does not solve source connectivity.
