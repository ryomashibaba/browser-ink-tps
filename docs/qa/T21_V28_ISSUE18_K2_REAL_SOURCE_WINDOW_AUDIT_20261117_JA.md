# Browser Ink TPS T21 V28 — QA Issue #18: genuine K2 HOLD triage

**Source HEAD:** `a256d6724e661578b1cca93d2ab7e1961dd693ab`
**Source gate:** original SOURCE 25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 scoreable. Formal 4v4, full original map traversal and 150-tick respawn are NOT certified.
**Scope:** read-only QA, existing B440 runner reporting, no scene/clock/Actor/HP/ink/score writes. The K2 >=600 native-tick rule stays unchanged.

## Evidence (genuine Chromium, not an offline game fixture)

- Issue #18 source: https://github.com/ryomashibaba/browser-ink-tps/issues/18
- Genuine Visual/Chromium run: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44023186490
- Immutable RAW ZIP: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44023186490/artifacts/14302356747
- Artifact SHA256: `3816d7f107c392fd7af4ceafbfc5df8aa10d77d2512ffc06095eaef8bdb5f257`
- Original script: `scripts/t21-b440-short-native-original-foot.mjs`, around the original K2 check below the `k2Read(after)` / `k2Read(actual)` calls.

### Confirmed facts

1. The B25 START hit stack in real 1600×900 Chromium has `centerHit.id = t21-f3-b25-start`, `receives = true`, `withinViewport = true`, STAGING 25/17/26/0. The F8 overlap from Issue #11 no longer blocks this run.
2. The genuine game entered PLAYING with real native clock movement. Seven original CPU physically rejoined, original actor/clock/geometry/score writes by this observer were all zero.
3. The actual human Ink Saber mouse input produced **6 shots**, and the registered impact HUD recorded **90 changed cells** from an actual impact, not official scoring or a CPU hit. Actual CPU hits were **0 certified**.
4. A1 received **two real C-key support commands**; native Crowd goal requests were recorded. Actual physically certified long A1 route and cross-team combat are still missing.
5. RAW `b441NativeEvidence.firstRead.tick=1068`, `intendedRealNativeTicks=240`, sampled native CPU foot frames at **1224, 1248, 1272, 1296**. These prove 228 ticks between the first K2 frame and last *sampled* frame, **not** the terminal K2 read.
6. The runner's unchanged K2 predicate requires `k2Last.tick-k2First.tick >= 600` **AND** unchanged `performance.timeOrigin`. The historical error `K2_NOT_SAME_LIVE_NATIVE_OBSERVATION_WINDOW` collapses both causes into one.
7. **High-confidence cause:** the real one-shot was *configured* to observe just 240 ticks where K2 requires 600. The old RAW omitted the terminal `k2Last.tick` and terminal browser time origin. Consequently an exact single-condition failure claim (or an actual K2 PASS) is **not justified**. `240` is a request, not proof that the final delta was exactly 240.

### Further real-CPU movement observation (limited)

The four periodic frames are real native 7CPU physical feet. From tick 1224 to 1296 the planar coordinate difference was approximately: A1 **3.932m**, A2 **5.280m**, A3 **4.954m**, B1 **5.035m**, B2 **1.193m**, B3 **0.142m**, B4 **0.000m**. Thus B4 had no measured planar displacement across this 72-tick sample. That is a bounded mobility observation, not proof of a permanently stuck bot; there is no continuous 60Hz KCC trajectory certified for every actor.

## QA code improvement

- New `scripts/t21-v28-qa-k2-source-window.mjs`: independently reclassifies historical B440 JSON without inventing missing terminal tick/origin. The live helper checks exact integer tick provenance, elapsed **>=600**, finite same-browser time origin, and records distinct HOLD reasons. A `PASS_LIMITED_SAME_BROWSER_K2_TIME_WINDOW_ONLY` is **not** a gameplay or 4v4 PASS.
- Existing B440 runner: immediately before the unchanged K2 outcome comparison, save `proof.k2WindowProvenance` with actual `firstTick`, `lastTick`, `nativeTickDelta`, configured requested ticks, expected/observed browser origin, and independent failures. If K2 fails, record explicit reasons and fail; do **not** bypass thresholds, simulate any clock, or certify any shots/hits.
- New `scripts/t21-v28-qa-k2-source-window.test.mjs`: seven dependency-free node:test regressions: 240 vs 600, 599/600 bounds, 600 observed despite 240 request, browser origin change, invalid metadata, historic RAW omissions, and fail-closed mismatched source authority.
- Lightweight offline CI syntax/test workflow only, no Chromium and no npm install.

## Reproduce without heavy Chromium

Download the genuine artifact, extract `b440-short-real-original-human-foot.json`, then run:

```bash
node scripts/t21-v28-qa-k2-source-window.mjs /path/to/b440-short-real-original-human-foot.json
node --test scripts/t21-v28-qa-k2-source-window.test.mjs
node --check scripts/t21-b440-short-native-original-foot.mjs
```

Expected historical verdict: `HOLD_K2_REQUESTED_WINDOW_TOO_SHORT_FINAL_GATE_CAUSE_NOT_FULLY_SAVED`; `exactK2FinalTick=null` and `canIndependentlyDetermineSingleTriggeredClause=false`. Not an official game fail at the physical floor, shot or HP level.

## Next actual play test (only if separately justified)

Do **not** blindly retry the exact 240-tick experiment. If/when the integrator wants a new single bounded same-world K2 observation, use the **existing** original native Chromium workflow with explicit `T21_B441_NATIVE_OBSERVE_TICKS=720`, preserve RAW/PNGs even on HOLD, and enforce full 600 real tick + same-origin gate before evaluating individual CPU projectile/impact/OWN counts. No synthetic enemy/paint/score, no path-safety relaxation, no full 180s/replay or 150tick lifecycle PASS without new genuine evidence. This change itself **does not** run or certify that test.

## Branch integrity

The historical QA branch `research/t21-v28-qa-20261117` diverged from `a256d672` (it retains previous independent run reports). To avoid force-pushing away those records, this issue is developed on a clean dedicated branch `research/t21-v28-qa-k2-issue18-20261117` based **exactly** on `a256d672`, for review as Draft PR. Integration to the study trunk is reserved for the integrator.
