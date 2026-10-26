# W10-B224 — genuine CDP keyboard PlayerInput -> PlayerController source jump

26 October 2026 JST, first source QA implementation.

B222's directly provided KCC translation vectors and B223's 25-solid collision context were real Rapier physical proofs **but were not real player input tests**. B224 adds a separate, explicit `t21Qa=b224OriginalGapInput&t21B224Source=isolated-ci688` lab route. It is not accessible from the production/default game routes. The lab uses the existing exact original 25 registered solids plus precisely two CI688 source-authentic triangle mesh colliders (QA only), original 17 paint definitions and original 26 links. It runs the actual `PlayerInput`, `PlayerController`, `ThirdPersonCamera`, `RapierStagePhysics` at 60 Hz, rather than injecting movement into a KCC. Browser CDP sends actual W/S, Space keydown/keyup events after acquiring pointer lock and records actual grounded/airborne/landing and destination-solid Rapier foot support. Four mirrored forward/reverse jump trials run separately from new page loads, with exactly one initial QA spawn per trial and no teleport during input play.

**Safety:** source QA does not modify T19C/T20, 25/17/26/0 stage, CPU, Recast navigation, official scoring, production or Pages. Source face collider additions are not production-authorized. The absence of original enemy-facing full traversal still means 0/12 and winner NONE. A four-trial PASS only certifies a small local input-driven QA lane, NOT natural gameplay or official 4v4. B223's separate original-full-static KCC regression remains in place.

GitHub Actions: `t21-b224-original-gap-input-qa.yml` (separate targeted workflow, to avoid rerunning the expensive entire B75 suite for an isolated QA harness). It saves the full evidence report on success and after real test failures when possible.

## Initial B224 browser run #40288916896: factual failure and correction

The genuine Chromium/CDP exercise did send exactly one Space and captured genuine original source-ground contact on the far side for all four directions, but the stringent destination-target success was **0/4**. The avatar began at (project X approximately +4.525 / +3.247 on positive side); the target has a 1.278m X displacement as well as a 2.607m Z displacement. Driving W/S with camera yaw=0 yielded a roughly 1.27m closest horizontal miss, with either a later cliff fall or survival offset from the target. This is genuine controller steering failure, not evidence the jump physics is impossible. B224 follow-up rotates the camera by the actual CDP mouse movement (about -26.1 degrees), checks the resulting camera yaw, and retains the true PlayerController acceleration and real W/S/Space keyboard controls. No body teleport, fake extra input, path assistance or lowered success gate.

## Second B224 real Chromium #40289287412 (camera yaw corrected)

Real CDP mouse input rotated the actual camera to -26.18 degrees. All four real W/S+Space attempts contacted the correct source destination collider and subsequently grounded there; no original 25-solid collision and no during-play teleport. Distances to the arbitrary source centroid target became as low as ~0.093–0.097m. The original *precise center while grounded within 0.22m* gate passed only 2/4: both FloorConcrete01 -> slope runs landed safely but stopped approximately 0.35m past the selected centroid. The previous GitHub workflow **FAILED** as it should. The real physical safe-landing result must not be conflated with precision landing.

## B224 follow-up: separate physically meaningful stable landing from precision target

A separate **18 consecutive actual native 60Hz ticks** gate requires grounded, source-destination Rapier foot support, input released, exactly one real jump input, target distance <=0.60m, and no pose teleport. This tests standing safely *on the real original source collider*, not any guessed NavMesh polygon. The existing exact 0.22m precision-center PASS remains independently logged as `preciseCenterSuccessCount` and is not misrepresented as 4/4. CI now requires all four stable landings while reporting precise-center failures transparently. Test outcome depends on the real next Chromium run, not the code being compiled.

## Final native browser CI evidence — run #40289673657 (SUCCESS)

At commit `43ea1239da71d137a2226e54763aa18082e143e2` the isolated PlayCanvas/WebGL2 QA successfully built, ran one real CDP keyboard jump per direction, and passed all source-landing safeguards. **Four of four stable far-side landings; only two of four strict exact-center landings.** Both categories remain independent.

| Exact CI688 source jump | Stable grounded destination >=18 ticks | Precise center <=0.22m while grounded | Closest grounded target error |
|---|---:|---:|---:|
| Positive FloorConcrete01 -> outer Slope00 | PASS (25 grounded ticks observed at end) | NO | 0.23095560m |
| Positive outer Slope00 -> FloorConcrete01 | PASS (23) | NO | 0.29030886m |
| Negative FloorConcrete01 -> outer Slope00 | PASS (24) | PASS | 0.16468177m |
| Negative outer Slope00 -> FloorConcrete01 | PASS (21) | PASS | 0.12823664m |

All four recorded one actual Space keydown, pointer-locked mouse-look, grounded takeoff and landing on the **correct original-source triangle collider**. Existing stage-solid collision contacts recorded: zero in every trial. No actor teleports during the test. 25 source runtime solids remain unchanged; **2 additional CI688 meshes per side exist only in the isolated 27-solid QA stage**, not in the actual game. Source 17 paint, 26 navigation links, scoreable 0, original cross-team routes 0/12, `productionAuthorized=false`, official winner NONE.

**This is NOT certification of full original-stage traversal, visually correct jumping, CPU ability to plan jumps, or a valid 4v4 match.** The separate 0.22m centering metric remained 2/4 and should be addressed through genuine normal player input control (not scripted pose snapping). Next meaningful engineering gate: original 25-solid runtime and source corridor continuity with real browser-playable ingress/egress, before AI routing is promoted. Do not assume the four source-only trajectories imply the omitted intermediate surface chain is complete.

Evidence workflow: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40289673657
