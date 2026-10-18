# Browser Ink TPS — W10-B25 real source-only playable paint run

**Date:** 2026-10-19 JST
**Parent checkpoint:** W10-B24 `b3587d8654c9abce02676eb2a6dafabe455d8221`
**Final implementation runtime code SHA:** `6349c4660d58228763cf83d34d3b16770dd1a63d`
**Branch only:** `dev/t21-f4e103w-qa-infra`; NOT main, PR #5 or public deployment.

## Actual game change, not a new speculative topology audit

Adds one optional **SOURCE PAINT RUN** interactive practice mode to genuine non-scoring T21 F3 Undertow source-only preview:

- Existing F3 original physical stage, human Rapier controller, GameplayInk authoritative ownership and real 7-CPU world remain unchanged.
- One visible, compact **START PAINT RUN** control; click to arm before pointer lock. Click the scene and play normally for up to **60 *genuine* 60 Hz simulation seconds**.
- Practice clear requires **180 human projectile-impact-changed ink cells** and **12 m of continuous real original-ground-supported human ground travel**; BOTH. Counts are derived from the existing `UndertowF3SourceInkFeedback` strict `PaintSource.Human` + positive authoritative `GameplayInkSystem.apply` result, and from real player/Rapier foot positions respectively. CPU paint, fired-but-missed shots, on-ground render guesses, jump/fall movement, >0.38 m instantaneous position jumps, and teleport/respawn cannot add ground distance. No automatic aim or actor relocation.
- Source practice HUD shows real progress and 60-sim-second countdown. Clear text is **PRACTICE CLEAR · NOT A MATCH WIN**; expiry reads **PRACTICE TIME UP · NO WINNER**.
- Pointer-lock exit, pause, source authority drift, repeated/stale physics tick, invalid samples or native stop abort; frozen gameplay cannot advance progress. Reattempt requires a user click.
- B25 and B22 owner GPU performance trial cannot be running or armed together. All B25 data is local F3 read-only projection. No official Turf score, score mask, win/loss/KO, persistent leaderboard, original actor location assumption, new path, new bot, or new material.
- The existing untouched F3 source stage remains exactly **25 physics / 17 paintable / 26 original NavLinks / zero official scoreable / `activationReady=false`**.

## Evidence and limits

1. [B25 final real Chromium WebGL2 HUD, frozen A-B-A and pointer-lock start/abort + unit suite](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39168840721): **SUCCESS at code `6349c466`**. Vitest **11/11 PASS** across B22, B23 and B25. Real Chromium successfully clicked the on-screen B25 button, acquired authentic pointer lock, advanced native physical ticks and then safely aborted on real pointer unlock. No fake winning, geometry or scores.
2. [B14 native real Chrome CPU render/splat/respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39168840734): **SUCCESS at code `6349c466`**.
3. [B15/B16/B18/B19/B20 real Chrome/7 CPU integrated source gameplay](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39168665358): **SUCCESS at preceding B25 code `2d03a2fa`**, preceding two B25 UI refresh/mutual exclusion adjustments. 87 real CPU source paint shots, 92 original impact events, 11,064 actual source-owned cells changed, 703.88m native-foot CPU source-local patrol and 0/12 authentic cross-team opponent path evidence. The latest `6349c466` B15 run is https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39168840746 and was still in progress when drafting this checkpoint; use the actual workflow conclusion when reporting.
4. [Ubuntu+Windows source QA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39168500423): **SUCCESS at initial B25 preview app code `feb63ca29cee`**, before later separate B25 browser-test additions and mutual-exclusion UI change. Final code Windows check is https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39168840657 (check its actual conclusion).
5. **Not certified:** 60-second owner Windows RTX actual challenge clear (unit tested, not played by the owner), native 60 fps on the owner PC, full original stage reconstruction, verified original Banc placement or freely accessible spontaneous 4v4 combat. Chrome CI is a headless software renderer and does not substitute for real owner play.

## Preserved original authority / priority

- Source-original authenticated count remains **25 solids / 17 paintable unscored / 26 links / 0 scored / activationReady=false**.
- Authenticated `Vss_Temple01` Banc/SetActor instance placement remains missing. Original central/underpass continuous route is not certified. 0/12 current source-nav opposing-team paths remains **HOLD**. Never fake it.
- Public main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`, Draft PR #5 separate `8cfc95756ef0b56e2c33dc9f89a9041126daa272`, T19C/T20 Freeze, published website and all private source archives untouched.
- B24 one-step private Banc discovery remains available if source exists locally and the owner chooses to run it; it has not been run on the owner's filesystem.

## Next B26 decision

Prioritize trusted original stage layout/Actor evidence if furnished. Otherwise avoid endless test helpers or low-impact HUD counters: move toward genuinely convincing stage-scale optical readability and more engaging real source-local motion/shooting interaction, only while respecting frozen physics. A real owner QA snapshot after source-play is useful but should not become a blocker to continuing chat-driven implementation. **Never market B25 practice clearing as official Turf victory or a replacement for natural 4v4**.

## Planning audit

User-facing playable action supported by genuine source physics and authentic changed ink. Minimal pure test core; existing B21 Chrome QA lane reused to prove real DOM/lock lifecycle. No Work, no local user-machine control, no asset redistribution or automatic upload. Stable coding changes committed on QA branch only.
