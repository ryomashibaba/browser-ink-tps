# W10-B136 — Restore native CPU HIT / SPLAT in real pointer-locked staging combat

Date: 2026-10-23 JST. QA-only; source frozen 25/17/26/0.

## Regression from B135

B135 head `81c6f943569e64393626651ba3075fbef265a019`
passed [integrated B75 preflight #39962329457](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39962329457)
and [B86 source combat preflight #39962329542](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39962329542).
[Ubuntu and Windows QA launcher #39962329466](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39962329466)
were SUCCESS. But [B15 genuine pointer-locked browser #39962329703](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39962329703)
FAILED specifically `T21_F3_BROWSER_B88_REAL_CHROME_HUMAN_SPLAT_MARKER_MISSING`
after actual native mouse shot and source-only isolated CPU lifecycle.
B135 had unnecessarily changed old HIT/SPLAT display's condition
from `matchState!=='TIME_UP'` to `matchState==='PLAYING'`.
The *real* B15 isolated combat intentionally remains `STAGING`;
this does not mean input, native damage or source geometry were fake.
Suppressing the real hit is a **visual regression**, not license to alter
CPU damage or invent an encounter.

## B136 change and acceptance

Restore original visibility scope of a genuine direct-hit marker through
a source-gated, pure, unit-tested `genuineF3DirectHitVisible`.
It requires 25/17/26/0-authorized native pulse, real nonnegative direct
hit counter, monotonic native-tick event window, no pause/stop/TIME_UP.
`STAGING` only permits display of **already authenticated** isolated
combat events; it cannot create shots, damage, enemy locations or scored
results. `PLAYING` remains fully supported with B135 genuine 60Hz updates.
Add positive and negative Vitest cases for staging/playing, stale hit
window, stop, missing counters and rejected authority.

The relevant B15 browser workflow is triggered by the HUD edit and must
be checked to verify the genuine pointer-input CPU hit/splat display.
B75 remains a useful independent source-local FIXED/SWEEP regression.
Until the B15 real Chrome job completes successfully, call that
visual QA **pending**. No CPU physics, hit calculation, navigation,
source geometry, scoreability, production or match start gate modified.

## Larger blockers
No original supported cross-side path 0/12, no freely traversable original
human-vs-CPU enemy encounter proof, no certified unrestricted original 4v4
Turf result. Keep HOLD, and make F2/F3 natural encounter and combat the
next high-level objective instead of more minor UI-only tweaks.
