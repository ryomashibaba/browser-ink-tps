# W10-B101 — Real Chrome original-source KeyW input calibration

**Verification date:** 2026-10-22 JST  
**Branch:** `dev/t21-f4e103w-qa-infra`  
**Verdict:** Baseline + left real-physical 7/7 PASS; right new offset is **non-obstructing / detour proof HOLD**. All production, scoring, and unrestricted 4v4 remain **HOLD**.

## Purpose and code

- Commit [`d707728`](https://github.com/ryomashibaba/browser-ink-tps/commit/d7077285e56479c370e7b775ecc727dec9c19758): for **opt-in** parked human Chrome QA only, release the genuine Chrome CDP KeyW when a read-only real PlayerController/Rapier foot reaches the source lip, **before** awaiting independent human ink HUD confirmation. Observe the moving foot at 90-ms CDP poll intervals instead of default 700 ms. Subsequent mouse paint still requires real accepted shots and real source cells.
- Commit [`03a7d8a`](https://github.com/ryomashibaba/browser-ink-tps/commit/03a7d8ac5680b87f448396f84cb1ae614a8607d5): qualify authentic horizontal KeyA/KeyD movement as at least 0.06 m away from the baseline, symmetrically. On an overly right-shifted genuine KeyD result, try one bounded **actual KeyA** correction before parked-human observation. No KeyS retreat, actor pose writes, forced match start, fabricated navigation or changes to original collision.

## Real native Chrome results

| Scenario | Parked real human X / Z (m) | A3 source detour | Real physical 7 CPU rejoins | CI |
| --- | --- | --- | --- | --- |
| B101 baseline | −0.172 / 63.648 | Original `first-drop-positive-z-6` | **7/7 at tick 1111; PASS** | [39727653607](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39727653607) |
| B101 left KeyA + W | −0.248 / 63.866 | Original `first-drop-positive-z-6` | **7/7 at tick 1159; PASS** | [39727653537](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39727653537) |
| B101 right KeyD + W, then **genuine KeyA correction** | +0.067 / 63.808 | **None**; A3 found an unobstructed original route | **7/7 at tick 1060, intentionally FAIL for the requested detour witness** | [39727653441](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39727653441) |

The right case **must not** be represented as a proven detour or an actual collision fault. The test correctly rejected the otherwise healthy 7/7 native recovery because A3 never selected a lateral NavLink. The preceding B100 right-side real Chrome trial **did** use `first-drop-positive-z-2` and passed [39723814249](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39723814249). Different real human positions are not interchangeable.

The B101 recorded KeyW-up before confirming the human paint HUD and preserved genuine already-rendered 60Hz physical ticks. This reduces, but does not eliminate, frame-dependent CDP input-position variation on software WebGL2. Native physical proof and no-contact/nonblocking variants are intentionally classified separately.

## Immutable source/production constraints

- Exactly **25** source physical solids, **17** original paintable surfaces, **26** actual navigation links, **0** original scoreable promotions.
- `activationReady=false`; unrestricted real 4v4 **not certified**. Default FIXED CPU remains unchanged; SWEEP is opt-in; B93/B95 detour stays **opt-in QA only**.
- No `main`, original Draft PR #5, production, or GitHub Pages changes.
- At B101 code HEAD `03a7d8a`, native build and **24/24 regression tests**, and both ordinary real-Chrome **FIXED** and **SWEEP** jobs passed in [B75 run 39727653495](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39727653495). This still **does not promote** the experimental detour to normal gameplay.

## Next QA gate: W10-B102

Investigate **why the right-side original-source player capsule was not actually obstructing A3** despite being adjacent. Design an authentic input-based, bounded right-offset test that reproduces an actual Rapier collision stop and then original NavLink selection. Test real baseline/left/right positioning at the instant the A3 capsule is approaching (not merely final X/Z). Do not weaken the 7/7+original-detour criterion for a *blocked-right detour* test to claim a pass. Keep normal gameplay and all certification frozen.
