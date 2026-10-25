# W10-B202 — 180-second real source gameplay HUD, native pause controls, usable sightline

2026-10-25 JST. **B201 native test is already PASS:** exact SHA `18434eb6aa86d6d1c9f8f4e63a9fe1784d4ece71`, [Actions #40180553982](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40180553982). Real CDP Escape suspended genuine PlayCanvas simulation at tick 1089, held same tick for 650ms; actual pointer relock resumed at tick 1095 with RUNNING retained. First actual co-op CLEAR human 808 impact-changed ink cells, 36.28m original grounded KCC movement, A1 32 original impact-changed cells. Fresh source-world replay then second independent real CLEAR with 808/36.28m/32. Both replays and 46 Vitest passed. This does not certify full original 4v4.

**B202 player-facing gameplay feature (not merely QA):**
- The core clock/HP/ink HUD stays top-center and the actual co-op mission progress goes bottom-center, removing their former overlapping top-center placement.
- A source mission paused by P or Escape now shows a clearly readable game overlay with the TRUE remaining match clock and an actual clickable RESUME THIS ROUND control. That click obtains real browser pointer lock, continuing the SAME Rapier/Recast/GameplayInk native world and existing mission, rather than restarting, skipping ticks or forging progress.
- The independently enabled native human-vs-CPU source-combat opt-in uses existing B36 gameplay focus: source-heavy controls disappear during active pointer lock, return when unlocked. Deterministic/experimental source QA without explicit play mode preserves previous layout.
- The existing 180-second time-up/game result still displays UNSCORED / NO OFFICIAL WINNER. No score, Actor, material, source physics or navigation authority changes.

**Same-SHA acceptance HOLD until Chrome:** the existing B162 real original CDP player/co-op workflow now additionally exercises actual P key pause, real visible resume-button click, stable fixed tick + actual remaining match time across a 650ms pause, nonoverlapping main/mission HUD positions, and onward authentic native cooperative CLEAR/replay. No new workflow. Artifacts stored by existing 14-day retention.

Source constraints unchanged: 25 true Rapier solids, 17 paintable, 26 authored navigation links, 0 Scoreable, opponent access 0/12, activationReady=false, productionAuthorized=false, unrestricted4v4Certified=false, official winner NONE. Protect T19C/T20, main, Pages, PR#5 and private original evidence.
