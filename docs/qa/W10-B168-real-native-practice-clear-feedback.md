# W10-B168 — Genuine 60Hz practice feedback, immediate cooperative CLEAR

**Date:** 2026-10-25 JST · existing QA branch only.

## Actual blocker identified from exact-SHA B167 evidence
B167 `b6034dc755f90a88facee9160fadc9fffa399d94`:
- B75 preflight/real FIXED+SWEEP: **SUCCESS**, 106/106 Vitest.
- Native original grounded, first drop, Linux+Windows launcher, continuity: **SUCCESS**.
- B162 ALLY SYNC true CDP browser gate [#40143480868](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40143480868): **FAIL**. Real native source state CLEAR, genuine human ink **808** cells, original-ground KCC **35.76m**, A1 *authentic tagged* impact **49** changed cells / **2** impacts. But delayed DOM panel still showed RUNNING/23 real A1 cells/1 impact: `B140_B162_NATIVE_ORIGINAL_ALLY_SYNC_NOT_CLEARED`. This is not evidence of forged ink or a failed native co-op objective. B167 has only 5/6 complete green gates.

## B168 practical player-visible repair
- Existing optional source paint run is sampled after every genuine native **60Hz Rapier + PaintCoordinator tick**.
- The practice UI now updates at bounded **10Hz real-native cadence** during RUNNING, *immediately* on actual ARMED→RUNNING, true terminal CLEAR / TIME_UP / ABORTED, verified new A1 projectile impacts, completed genuine human paint/ground objectives and route phases. No draw-frame delay or fictitious ticks.
- A distinct center-bottom **REAL PRACTICE CLEAR** notification appears upon authoritative completion, with actual human cells, actual lower-ground movement, and, in ALLY_SYNC, independently tagged genuine A1 changed-impact cells. The message clearly says **PRACTICE ONLY / NO TURF WINNER**. It vanishes on restart/new trial or at end-session. CPU steering, shot approval, physical stage and practice goal thresholds unchanged.
- Source selection and current render-frame HUD remain; no new scene, score or autonomous CPU warp. DOM sync work only while a challenge is RUNNING or just changes state.
- The existing **real Chromium B162** test now checks the player-visible native UI status and authenticity of the completion toast in addition to the previously verified true sources; no extra Chrome workflow. B75 includes B168 pure scheduler regression tests for real 60Hz cadence and no invented clear.

## Source boundaries
25 original Rapier solids, 17 paintable, 26 original links, 0 Scoreable, 0/12 opponent natural paths, `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`; formal 4v4 **HOLD**. `main`, published Pages, frozen T19C/T20, Windows originals, Draft PR #5 untouched. Exact B168 HEAD and CI results to be confirmed from Actions, not this document.

## Following milestone
B169+: source-proven real opponent connection and physically natural combat, not more HUD for absent encounters. Without certified original Floor/Face/NavMesh, F4 opponent routes remain blocked.
