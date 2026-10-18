# Browser Ink TPS — W10-B26 actual original-source smart camera visibility

**Date:** 2026-10-19 JST
**Parent checkpoint:** `0aa320134e459bfc28de69161b46eb8de53aa2b3` (W10-B25)
**Implemented and browser verified camera code:** `fa9fce555f450b9b3fc6af3fea64463aa2917742` 
**Scope:** QA branch `dev/t21-f4e103w-qa-infra` ONLY. No production, main or Draft PR #5 promotion.

## Meaningful gameplay rendering improvement

Previously, the real F3 camera used a single original-Rapier `camera` line check, retracted immediately when obstructed, and exposed **Q** manual shoulder switching. This W10-B26 step adds **automatic side-of-shoulder visibility recovery** on the actual source-only practice camera.

- In ordinary `?t21Play=preview`, adaptive visibility is enabled by default. The original T20/main camera and every other game route remain unchanged. Existing source deterministic B18 camera QA retains the original exact raycount and user input, unless `t21W10B26=smartVisibility` is explicitly supplied.
- When a real original Rapier physical camera line is blocked by more than 1m, **during actual pointer-locked human play and real rendered frames only**, test whether an actual collision-filtered camera ray to the alternate shoulder clears at least **1.35m further** and can reach at least 3.3m.
- Require a sustained favorable line for **0.22s**. Change shoulders through the existing camera's smoothed lateral offset; retain immediate original-collider camera retraction. After auto change use **2.5s** cooldown to prevent ping-pong.
- Manual **Q** shoulder switch remains instant and takes priority with **8s** override and the same 2.5s cooldown. No UI action, untrusted optical mesh, guessed central connecting walkable path or camera collision bypass.
- Source camera diagnostic snapshot exposes `b26AdaptiveVisibility` with enabled state, real-ray comparison count, auto-change count, manual override remaining, stage authority metadata and `productionAuthorized=false`.
- `UndertowF3SmartOcclusion` is a small pure state/decision module independent from rendering or physics mutation. Every collider ray uses **the existing 25 frozen Rapier stage solids** and the same physical camera query; no extra geometry is created.

## Real build and verification

- [B21/B22/B26 source-only real Chromium WebGL2 A/B/A, genuine pointer Q and camera tests](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39176896934): **SUCCESS** at `fa9fce555f450b9b3fc6af3fea64463aa2917742`. **16/16 Vitest passing** across existing B22/B23/B25 and 5 new B26 cases. Actual user-input Chrome Q key suppresses auto camera for 8s, source authority remains frozen, existing B21 framebuffer NATIVE round-trip, B22 pointer unlocked safe abort and B25 true source-practice start/abort remain passing.
- Prior [identical logic before final locked-pointer-only guard](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39176769651): **SUCCESS**, genuine B26 Q priority test `T21_W10B26_ADAPTIVE_VISIBILITY_GENUINE_CHROME_Q_PRIORITY_PASS`. First source CI before TS test fixture tuple fix failed on a **test-only TypeScript noUncheckedIndexedAccess** error, subsequently fixed (the final CI is green).
- [B15/B16 integrated real Chrome 7CPU & source paint](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39176896940): latest source gameplay code `fa9fce...` run started; inspect its final conclusion. Prior 7CPU source gameplay unaffected in frozen deterministic source QA since B26 is not active without specific opt-in.
- **No claim of real owner GPU FPS improvement or observed successful live autocamera switch under a particular original obstruction.** Pure controller dwell/threshold/cooldown logic is unit-proven; browser-proven activation + real trusted Q priority; owner real-device visibility benefit remains a separate UX acceptance item.

## Preserved hard HOLD

**25 verified original physics solids / 17 paintable unscored surfaces / 26 original NavLinks / 0 scoreable / `activationReady=false`**. 0 of 12 authenticated cross-team natural actual-foot paths in current partial source. Original `Vss_Temple01` Banc/SetActor transform/layer evidence unresolved (B24 private preflight available only if local source exists). No guessed central/underpass path, Actor placement, new collision, scoring, synthetic enemy encounter, scoreable mask or fake Turf win. No private source pack or original OBJ transmitted or added to GitHub.

QA default live visual improvement achieved with a small camera-only code change, five model-only tests and reused Chrome CI, not another large topology analysis or debug HUD. B27 priority: after new source evidence, restore real central source layout; otherwise work on source-original stage-scale rendering or real movement/weapon play quality based on actual observed problems, while limiting repeated CI.
