# W10-B75 — true real-time source CPU paint in the actual playable HUD

Date: 2026-10-21 JST. QA branch `dev/t21-f4e103w-qa-infra` only. Prior exact SHA `8bba090e2fa93bc02ccec0c034f7e61aa9dade2c`. Main, frozen T19C/T20, public Pages and Draft PR #5 unaffected.

## Why this is a genuine playable UX improvement

Native 180s gameplay has now been established, including seven original source-ground CPUs and explicit FIXED/SWEEP selection, but the player's tiny top-center HUD only exposed the accumulated number of CPU shots, not whether any real original surface changed due to ink. B68 showed FIXED saturates ~3615 source cells, while optional SWEEP yields ~11779. Players had to finish a 180s match and navigate an end-of-round comparison to notice which aim has meaningful real paint activity.

## Delivered

New `B75SourceInkActivity` is a pure read model over the same existing 60Hz source gameplay snapshot, including `cpuSourceTurfShots` and `cpuImpactInkCellsChanged`. It keeps a 180-native-tick (3 real in-game seconds) sliding window for actual increments only. Duplicate Chrome/PlayCanvas render snapshots cannot duplicate activity. True CPU shots without new source paint are displayed separately, **not** credited as changed paint or Turf score. Stage loading, paused/time-up and no firing are distinguishable. Any counter regression, bad tick, untrusted frozen source geometry or inferred original 4v4/production authority hides the indicator safely. Old HUD fixtures with no native source fields remain unchanged.

The actual source playable top-center HUD now displays a compact, legible, native `REAL SOURCE INK · LAST 3s` row: measured new source-impact cells and actual CPU source shots with conditional positive/idle/saturated feedback. This is noninteractive, source-only, and cannot move enemies or repaint a surface. No fake opponents, badges, Turf winner or Scoreable surface; **not an original 4v4 source match**.

## Evidence and tests

- Isolated Vitest source-activity tests prove native time windows, positive real-ink changes, no paint from shot counter alone, no counting old fully saturated ink as new cells, safe stage HOLD, duplicate-render snapshot handling and graceful legacy HUD absence.
- Standalone B75 real Chromium smoke (without modifying the shared F3 smoke and without touching default CPU) performs genuine PlayCanvas/WebGL2/Rapier/Recast 60Hz source session with physical browser pointer-lock input. Two parallel independent lanes: normal **FIXED** and explicitly opted-in `?t21W10B68=previewSweep` **SWEEP**. It verifies native 25/17/26/0 stage authority, live HUD visible, authentic increased source paint shown in HUD, actual real CPU shots, no original4v4 certification, screenshot and small anonymous JSON artifact. It never calls QA tick advance or generates artificial paint. It proves HUD integration but does **not** certify real owner GPU FPS or original 4v4.
- Dedicated B75 GitHub Actions workflow is fast preflight (npm build, Vitest, Node syntax) then two short real browser native paint runs in parallel rather than another full 180s each.

## Earlier completed B72 native 180s

[W10-B72 browser workflow 39542106594](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39542106594) **2/2 SUCCESS**. Genuine FIXED 180 native seconds, tick 11860, original source impact changed 3615 cells, CPU source shots 112, all 7/7 CPU feet rejoined. Actual click stored anonymous FIXED native evidence in sessionStorage, reloaded opt-in SWEEP as a fresh STAGING session, with original 25/17/26/0 and no 4v4 production or score promotion. The independent actual second SWEEP 180s + completed comparison table has not been verified by this B72 run.

## Remaining source authentication blocker

Eight PntSet original SetActor transforms/identity ↔ source mesh relationships unverified. Active layers and original Banc provenance unresolved, 0/12 source-native opposing-team routes authenticated, source Scoreable 0. Keep `activationReady=false`, CPU standard FIXED, production and Draft PR #5 HOLD. No false original actor geometry or artificial bridge.

## Current workflow verdict

Not yet verified at B75 authoring; check the exact GitHub Actions run before marking PASS.
