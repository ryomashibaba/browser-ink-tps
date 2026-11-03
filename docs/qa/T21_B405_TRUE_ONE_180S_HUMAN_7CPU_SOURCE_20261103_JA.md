# B405 一つの本物の180秒試合で「人間入力・射撃塗装・7CPU・原作タイマー」を同時監査

Date: 2026-11-03 JST. HEAD basis: F2+F3+B337 true integrated source `ab62cd69a954efc82a4488723f6a75df0a77f1dc`. Isolated research, not game release.

Source policy: main / QA `8c104658a1842218bdfeff07792b3ab35576a0c4` / T20 / PR #5 / Pages untouched. Frozen 25 Rapier solids, 17 paint surfaces, 26 NavLinks, 0 scoreable. No opponent crossing 0/12, ART / official 4v4 / production HOLD.

## Different from last proven two-session integration
Previous genuine [F2+F3+B337 #41596283655](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41596283655) PASS was two separate real Chromium sessions. F2 human original ramp achieved true KCC, and another B337 session achieved 9 actual shots, 92 original ownerGrid human paint cells, 7 CPU and genuine W/A/S/D. F3 50 tests passed; no real human enemy-CPU HP hit certified.

B405 reuses the exact B337 genuinely pointer-locked Chrome start / real 7 CPU rejoin / mouse aim / original native paint / genuine W/A/S/D then **continues the same round until true game TIME_UP**, sampling original 180-second game at post-input, 150,120,90,60,30,0 seconds remaining. It DOES NOT reset/start a second game, change player position, fake input, force a CPU hit, change physics, add a route or fake score. Preserves original B337 independent audit, additionally tests a fail-closed B405 read-only timeline contract. Real CPU shot and paint contributions, real CPU life-state, human shot/ink totals, direct human CPU hits and 150tick lifecycle counters are observed *even if all combat hits remain 0*. Counters by themselves do not certify same-B actor hit/splat/respawn, and native TIME_UP does not grant winner.

CI checks F3 lifecycle regression and B337 source helper, strict TS build, genuine 180s Chromium and independent raw evidence + screenshots. If any real step fails, preserve HOLD artifact, never report PASS based only on tests.

## F4 blocker acknowledged, not bypassed
B403 true 180s CPU enemy distance and B404 cross-session 32x28 original source KCC position tests are PASS but show opponents far outside 32m B181 optical selection. B404 is NOT one concurrent encounter; do not present 97.55m as real same-tick minimum. B370 has already exhausted FloorLine00 same-tick collision diagnostics: 3+3 silent ground frames, original collision inclusion unknown. No radius-zero Recast or invented geometry. Source identity Temple01 verified via B284 game-data.

Expected certification (if genuine CI green): **one entire 180s original-source practice session with human actual firing/owner paint/WASD + seven original CPUs**. Still NOT native enemy hit, natural team passage, actual scoreable Turf or full 4v4. All release/ART HOLD.


## 2026-11-03 original time-up pointer-lock correction
The previous true B340 original 180s Chromium artifact #12949234359 shows `realWebGL.locked` **true** for 180/150/120/90/60/30 markers but **false** on the real TIME_UP native frame. Releasing pointer lock at the end is normal playable UI operation. B405's fresh initial auditor incorrectly required pointer lock at TIME_UP. Correct it to explicitly demand **true while PLAYING and false at native TIME_UP**; add negative regression for false during PLAYING and true after time-up. This does not soften native time/ink/CPU/raycast or authorize release. Prior live B405 CI #41601325592 was already running and may fail using its original SHA; only the new SHA is eligible for a strict final PASS.
