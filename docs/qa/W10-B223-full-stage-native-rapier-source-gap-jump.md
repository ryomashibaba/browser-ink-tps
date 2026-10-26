# W10-B223 — Real 25-solid stage-context original gap jump QA

2026-10-26 JST. Parent HEAD `20810375139f2734c165dce0e15f77db59f3659c`. Previous B222 established four true isolated jump landings (both directions on mirrored sides), but with only two original source faces as Rapier colliders. This does NOT prove gameplay across the actual 25-solid stage.

## Action

Run **the actual Rapier engine** with the entire unchanged set of 25 original existing stage solids, plus the two exact CI #688 FloorConcrete01 and outer FloorSlope00 triangle meshes on the tested side; 27 registered solids exist **only inside this QA fixture**. The 17 original paint surfaces and all 26 original navigation links remain in the isolated fixture. Apply the same production Human capsule / KCC / 60 Hz gravity / speed / jump. Collect eight no-jump and jump witnesses, both directions × both mirrored sides, including starting-source support, target-source landing support and exact real collisions against the existing 25 stage solids.

B75 preflight executes this fixture. It records failure as data, and DOES NOT certify gameplay or promote the two source meshes. No runtime changes, CPU jump AI, link, teleport, opponent routes, scoreable region, production or Pages modifications.

## Success criteria for any future promotion

A legitimate source-stage transition must demonstrate actual collision-safe takeoff and landing inside the complete existing geometry; input-driven Human behavior and safe return, original traversal semantics, and CPU navigation/jump behavior then require distinct live browser tests. A Vitest PASS on diagnostic collection is NOT a full-stage jump PASS. Exact source gap remains 2.074235m, and original route authorization stays **0/12**.

## B223 measured results from run #40287332365

Real Rapier/Vitest preflight passed with 25 original static solids + 2 source-authentic QA colliders per mirrored side. **All four** physically jumped from a source-supported takeoff to the actual original source destination and regained support; **all four** walking-only controls failed. The actual KCC recorded **zero collisions against the original 25** in the tested local crossing. Jump max horizontal endpoint error 0.043947m, max foot-height error 0.059021m. This constrains only the selected takeoff/landing lane, not arbitrary terrain or 1+7 actual player navigation. These observed outcomes are now strict regressions.

## B222 FIXED Chromium timeout triage

Latest preceding B222 run #40285688396: preflight SUCCESS, SWEEP SUCCESS; FIXED reached genuine 13.08s native HUD gameplay PASS (73 shots / 3142 modified cells) and successfully clicked B207 180s game. Its subsequent 7-CPU native rejoin exceeded the prior 210-second wall-clock budget. B221's previously successful B207 rejoin took roughly 205 seconds, so B223 raises **only this bounded reload/rejoin wait** to 270 seconds with truthful physical heartbeat counters. The required seven physical rejoins and positive real CPU ink remain **unchanged**, no fake ticks, teleport or scoring authorization. This does not guarantee that the new CI will pass and is not a reason to ignore genuine stalls.
