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

## Post-CI verified evidence (same original gameplay SHA)

B134 implementation SHA `0a3ef6b9b76848d473db717d7d387b9f058a1e31`.
[Real native WebGL2 Chrome #39960067660](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39960067660) **COMPLETED SUCCESS**. Its archived JSON `b132-native-original-edge-hud.json` reports `validation.passed=true`, `reason=NATIVE_CHROME_EDGE_WARNING_OBSERVED`, and **9 actual matched original-grounded DOM warnings** covering THREE genuine source solids:

- Spawn-high positive-Z: native tick **1184**, actual original boundary **0.450917m**, DOM native tick **1184**.
- Original first-drop landing positive-Z: tick **1298**, distance **0.465097m**, DOM tick **1298**.
- Original right-low Team A raised source: tick **1376**, distance **0.247087m**, DOM tick **1376**.
- Seven native CPU release was observed at tick **1061**, no synthetic tick, modified actor, teleported human or direct match-state assignment by QA.
- The saved 1600×900 screenshot `b112-real-source-human-walk.png` visibly shows the orange `ORIGINAL FLOOR EDGE · CLOSE` card. Its exact displayed value is frame-time dependent, not a score or structural safety certification.
- Actual genuine B123 physical route across original lower landing and registered ramp into named raised Team A source also PASS, last native tick 1376.

The earlier [B133 failure #39958818587](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39958818587) proves the regression: warning snapshot at tick 1186 0.13964m while DOM still stale at tick 1132, and raised source at tick 1379 0.40788m while DOM was stale at tick 1343. The B134 native-tick HUD fix removes that lag in the observed source corridor without modifying game physics.

[QA launcher #39960067705](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39960067705) **SUCCESS** and [B112 source-ground regression #39960067610](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39960067610) **SUCCESS**. [B75 source HUD #39960067636](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39960067636) preflight and FIXED Chrome native HUD are PASS; SWEEP was still running when this appendix was recorded (check the Actions page before giving an overall B75 verdict).

**Qualified PASS only** for real-time in-game boundary-warning rendering on this observed original-source path. The HUD is *foot-center distance to the source polygon*, not clearance for the entire collision capsule and not a guaranteed safety margin. Do not claim certified floor hole, 0/12 cross-team routes, collision-safe human+CPU navigation at excluded sources, official 4v4 or scored Turf.
