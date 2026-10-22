# W10-B103 — Short real Chrome right-side human input calibration

**Evidence date:** 2026-10-22 JST  
**Branch:** `dev/t21-f4e103w-qa-infra`  
**Gate:** **3/3 short Chrome calibration CI PASS; 2/3 geometrically eligible right-corridor candidates; actual obstructed A3/7-CPU rejoin NOT TESTED at this gate. Production HOLD.**

## What was built

- `scripts/t21-w10b103-real-lane-calibration.mjs` — separate genuine Chrome DevTools Protocol / PlayCanvas / Rapier / Recast source-only QA. Preserves initial real mouse pointer lock, KeyW + KeyD, physically released keys, natural human inertia, and original live native physics. Ends when the real human stops around native tick 180, *before* the long 7-CPU rejoin proof. **No pose writes, artificial native ticks, KeyS reverse, false score, extra collision geometry, or original NavLinks.**
- `.github/workflows/t21-w10b103-real-lane-calibration.yml` — independent matrix of requested `2/4/6` genuine native-tick KeyD pulses. Uses Node 24, syntax/build check, actual Chrome WebGL2, three native screenshot+JSON artifacts. Changing this workflow does **not** trigger unrelated B75/B96/B99/B100 or frozen-source Chrome suites.

[Real 3/3 SUCCESS GitHub Actions run 39733209150](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39733209150)

## Native observations

| Requested KeyD duration | ACTUAL KeyD duration | Actual KeyW release X/Z | Human settled X / Z | Right corridor candidate (position only) |
| --- | --- | --- | --- | --- |
| 2 ticks | **6 ticks** | +0.313 / 64.159 | **+0.306 / 63.873** | NO — outside proven right-side narrow lane |
| 4 ticks | **6 ticks** | −0.073 / 63.892 | **−0.073 / 63.583** | YES — geometrically eligible |
| 6 ticks | **6 ticks** | −0.065 / 64.061 | **−0.065 / 63.707** | YES — geometrically eligible |

The earlier [B100 actual right-offset 7/7 physical recovery run 39723814249](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39723814249) had genuine human foot `X=-0.058, Z=63.962` and authentic opposite-side original NavLink `first-drop-positive-z-2`. The two present candidates are near that right-offset X but differ in Z and **must not** be treated as replicated B100 original-source physical obstruction without observing a genuine collision.

### Cause found, and important limit

Under the software WebGL2 test execution the human's real native simulation progressed **6 ticks per observed CDP snapshot**, so requests for 2 or 4 native ticks had *no finer input duration* than a 6-tick request. Distinct eventual human parked X/Z positions therefore arise from frame/KeyW release chronology or other real simulation timing differences, not actual 2-versus-4 native-tick KeyD pulses. **Do not tune right-lane collision recovery by assuming the nominal pulse duration is exact.** The calibration evidence isolates input timing uncertainty, not a change to the underlying original-stage physics.

The B103 QA intentionally performed only early native-tick positioning. It reports `0` A3 contact rejections **at the calibration cutoff**, before the later genuine A3 crowd approach. This **does not** prove the lane was unobstructed during later play, and **does not** count as a full contact/7-CPU test.

All three jobs completed successfully and saved genuine Chrome screenshots and human-foot JSON witnesses as Actions artifacts:
`w10b103-genuine-KeyD-pulse-2`, `-4`, `-6` (all non-expired at verification).

## Next efficient gate: W10-B104

1. Reuse the real browser within a **candidate-gated** 7-CPU right-side trial: record the authentic human settled foot at tick ~180; only if it lies in the previously established original right blocker corridor continue the expensive test. A non-candidate is an **input calibration miss**, not a physical failure and not a 7/7 PASS.
2. For the selected actual player position, require **both** real A3 original shared-world Rapier KCC rejection near the measured human foot and native original NavLink alternate selection (e.g. `first-drop-positive-z-2`) followed by **real physical 7/7 rejoin**. If A3 simply passes directly with 7/7, preserve **non-obstructing / contact proof HOLD**.
3. Avoid repeated full-length trials for merely differing requested 2/4 tick pulses when the real Chrome physics advances six ticks per observation. Keep truthful evidence of requested-vs-actual input duration.

## Frozen authority

Exactly **25 genuine source solids**, **17 original paint surfaces**, **26 original NavLinks**, **0 source scoreable promotions**. `activationReady=false`, `unrestricted4v4Certified=false`, no normal CPU FIXED / opt-in SWEEP alteration, no `main` or original Draft PR #5 update, no Pages publication. The research detour remains QA-only, and neither the corridor classifier nor a 7/7 count alone is proof of collision-aware autonomous recovery.
