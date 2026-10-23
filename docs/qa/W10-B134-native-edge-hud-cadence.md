# W10-B134 — live warning synchronized to native 60Hz physical steps

2026-10-23 JST, QA only. Fixes real gameplay UI latency, not stage geometry.

## Real evidence

Previous B133 [Actions #39958818587](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39958818587) drove actual physical KCC through original source after native seven-CPU release (STAGING→PLAYING at tick 1059). Saved anonymous [Actions artifact](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39958818587) `b132-native-original-edge-hud.json` contains 13 *authentic* browser samples. In PLAYING, the actual source geometry and Rapier foot contact warned at tick 1186 with **0.13964m** to source edge, but the DOM still said stale CLEAR at tick 1132 (54 native ticks before). Tick 1379 was genuine source-edge risk 0.40788m with DOM UNAVAILABLE at tick 1343. This is a **render-cadence presentation bug**, not evidence for missing collision/nav or a reason to relax the KCC source gate. The B133 visual evidence CI was therefore FAILURE / warning HOLD.

## Change

Previously `this.b129EdgeCoach.render` only lived inside `refresh()`, called approximately every **12 GPU frames**. On software WebGL2, those frames can advance tens of actual native physics ticks, leaving the player blind exactly while walking off a source floor.

Extract the exact same authenticated original edge inspector into `private originalEdgeGuidance(nativeTick:number)`. `snapshot()` still reads it at the actual clock tick. **Immediately after each genuine Rapier/Crowd/ink fixed step and native source-foot ledger**, render *only this lightweight read-only warning* with real frame tick, real grounded status and real foot source ID. Keep the expensive rest of practice HUD on original GPU-throttled schedule, and keep survey/gallery masking. Use no fake clock, setPose, auto steer, collision, death threshold or new floor.

B134 scoped static regression test enforces true physical post-KCC order, same inspector in snapshot and display, frozen original source count semantics and absence of geometry movement. Existing B129/B130 Vitest remain; add the B134 node test to existing B75 preflight and B132 genuine WebGL2 browser test. The latter must now validate real screenshot/DOM synchronized with native warning rather than only pure unit proof.

## HOLD

B134 visual browser status must be checked on exact SHA. Official unrestricted 4v4, source-opponent paths 0/12, source Scoreable=0, production activation=false, human-CPU crowd collision at previously excluded sources remain HOLD. Main/Pages/Draft PR #5 untouched.
