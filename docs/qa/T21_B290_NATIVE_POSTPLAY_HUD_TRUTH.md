# B290 — non-fictitious source ready/paused UI, exact native tick

2026-10-28 JST. Existing project QA branch only. This is a real player-facing HUD bug fix, not a new prototype/replacement game.

B289 genuine Chromium after real KeyW+mouse reached **85 native ticks, 8 real shots, 315 actual painted original-source cells**, and player travel ~3.22m, yet stayed **STAGING** (zero native CPU fully rejoined). Its paused player HUD misleadingly displayed **READY · SOURCE ROUND** because B246 tested paused+STAGING but ignored native tick. Actual source round intentionally retains 180s clock until genuine free combat; the 180s clock is not a proxy for no movement.

The B290 pure display policy uses existing authoritative tick: a paused, non-stopped STAGING **tick=0** player source HUD shows `READY · SOURCE ROUND`, while paused STAGING integer tick>0 shows `PAUSED · SOURCE REJOIN`. Unknown/invalid ticks cannot make a READY claim. QA view, TIME_UP, SAFE STOP and actual PLAYING remain unchanged. No tick, physics, ink, camera, score or CPU actor writes.

Added Vitest on tick0/1/85, missing/negative/fractional ticks, QA, STAGING run, PLAYING, TIME_UP and STOP. The existing B75 native Chromium B287/B289 fast job checks genuine tick0 READY and F8; after real pointer-locked move/fire/paint and real Escape, it requires the new native post-input paused label, genuine tick, `NATIVE_PAUSED`, and frozen source 25/17/26/0. Screenshot evidence plus output `b290-native-postplay-hud-phase.json`.

**Efficiency / Work evaluation**: The repeated Chat→GitHub blob/commit→large CI→artifact loop is useful for focused patches but not efficient for cross-file debugging and complex 3D art. Work's integrated environment would help with local iterative build/tests, real browser automation and visual iteration, and should be used on substantive batches with advance notice and approval under user's Chat-first preference. Avoid emitting 8+ expensive workflows for every minor code change if paths permit narrow CI without relaxing full regression coverage.

Full original authority 25 Rapier solids /17 paintables/26 original NavLinks/0 scoreable; 0/12 original opponent crossings. ART HOLD, formal 4v4 HOLD, production/Pages/main unchanged.
