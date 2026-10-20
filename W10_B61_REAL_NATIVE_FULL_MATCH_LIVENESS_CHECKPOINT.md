# W10-B61 — Real 180s native source-match liveness, with B59 timeout fix

Date: 2026-10-20 JST. Parent QA `1fef18289206abdcb2b65b91223f1b019515b7ff`. Protected main/production unchanged.

## Critical observation, not a fake success
B59's [actual GitHub Actions full 180-second run](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39407663919), code `ccdf2ce1c5ba34165109297f9b85a6381c6cf3d7`, **FAIL**. The actual Chromium + PlayCanvas + seven CPU native 60Hz source simulation progressed while a premature **22-wall-minute script deadline** expired: 20-second source-match progress witnesses:
- +0.08 native match seconds at tick 1,060, all 7 CPU source-ground rejoined
- +20.08 at tick 2,260, 86 actual source CPU shots, 3,472 changed CPU impact cells
- +40.08 at tick 3,460, 95 shots, 3,552 cells
- +60.08 at tick 4,660, 99 shots, 3,597 cells
- +80.08 at tick 5,860, 101 shots, 3,597 cells

No `TIME_UP`, genuine 180s result-card verification or real restart was reached. This is evidence of slow hosted SwiftShader vs native sim speed, **not** proof of a gameplay freeze or quality pass. B59's 22-minute budget / 28-minute job timeout were undersized relative to observed host time. No original geometry, physics parameters, CPU navigation, source ink rules or release gates may be altered to hide this.

## B61 exact implementation
- Native browser test runner retains original **actual** PlayCanvas rendered frames / Rapier fixed steps / Recast seven-CPU FIXED patrol / original GameplayInk; does **not** call qaDriveTicks, overwrite browser timers or alter the source match duration, difficulty, collision, current PAINT RUN gameplay or original T21 production.
- Expand only the B59 full-session Chrome test maximum host wall duration from 22 to **62 minutes**, paired with 75-minute GitHub job upper bound. This is an execution budget, not a simulated time change. Stop early if any real source physics tick has made no progress for four wall minutes. Progress logs every 20 native match seconds plus a 90-wall-second liveness heartbeat reporting true native tick, stage CPU shot counts and certified original 25/17/26 source authority.
- Native success gate remains **actual 180-second `PLAYING` countdown reaches precisely 0**, `TIME_UP`, authentic end screen with no official winner and 0 Scoreable, actual pointer unlock, matched HUD activity and real CDP button click to reload fresh STAGING. Output real snapshot and native screenshot, or preserve failure evidence; do not mark PASS until observed.
- Retain B59's actual end result application code and existing B54/56/57 input/painting regressions. No added mini-game.
- Current seven CPU work still has natural opposite-team routes 0/12, source Banc/SetActor instance identity unbound, no original Turf scoring, `activationReady=false`; production and real 4v4 **HOLD**.

## B60 prerequisite closed precisely
B60 [private evidence tool CI](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39409314136) completed **SUCCESS, 8/8 synthetic privacy tests**; original B24 [regression run](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39409313129) **SUCCESS, 4/4 tests** on `1fef1828`. No original Banc source input was supplied, and zero Actor→eight PntSet meshes, original central geometry, natural opponent paths or scoreable masks were authenticated. Existing one-click private Windows preflight is preserved.

## Final evidence
Pending long source-native Chrome run on the B61 code SHA. Do not claim a 180s result until `T21_W10B59_TRUE_NATIVE_180S_SESSION` appears with actual native metrics and a true restart.
