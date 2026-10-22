# W10-B105 — Genuinely distinct right-hand human position: negative original-source collision tests

**Date:** 2026-10-22 JST  
**Branch:** `dev/t21-f4e103w-qa-infra`  
**Outcome:** **Two genuine Chrome test jobs completed, BOTH FAIL-CLOSED**. No false "7/7 detour" claim. Prior B104 2/2 native real physical-detour PASS is preserved as historical evidence, not changed.

## Implementation

- [`e357767`](https://github.com/ryomashibaba/browser-ink-tps/commit/e35776734124f4df5339dae5f14da915cef8646f): separate read-only candidate + full 7-CPU test `scripts/t21-w10b105-distinct-right-pose.mjs`, using real Chrome KeyD+KeyW, original PlayCanvas/Rapier/Recast unchanged. The short step admits a long original-source CPU test **only if actual settled human foot** is in the intended right-side geometric corridor **and** at least 0.13m away from the actual B104 reference foot. An admitted candidate still requires real native Rapier A3 human-proximate collision rejection, original NavLink detour, physical 7/7 rejoin, unchanged original authority.
- [`48463e0`](https://github.com/ryomashibaba/browser-ink-tps/commit/48463e053e231c85963cc404f8df30572e42e71c): independent GitHub Actions matrix of two **real KeyW release thresholds** `EARLY` and `MID` with six actual KeyD ticks. Not two nominal D-tick variants; the latter were shown in B103/B104 to collapse to the same native tick quantum. This workflow touches **only QA script and its own workflow**; default FIXED, optional SWEEP, source colliders, A3 production behavior and original PR remain unchanged.

[Full B105 Actions run 39760967523](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39760967523) — workflow **FAILURE** as intended from research gate misses; both job logs captured actual native Chrome behavior. Both job artifacts are available: `w10b105-real-distinct-right-EARLY`, `w10b105-real-distinct-right-MID`, including original-stage screenshots and JSON.

## Actual evidence and classification

| Real-input case | Observed human settled X / Y / Z (m) | Actual distance from B104 parked human | Real native Rapier A3 human-proximate rejects | Original A3 alternate NavLink | Genuine 7 CPUs rejoined | Outcome |
| --- | --- | ---: | ---: | --- | --- | --- |
| **MID**, nominal KeyW keyup Z threshold 64.48 | **(+0.244977, 8.395100, 63.947342)** | **0.3923m** | Not evaluated at A3 arrival (short gate) | Not evaluated | Not evaluated | **FAIL-CLOSED**: human lateral X outside original blocked-right candidate; no expensive route proof run |
| **EARLY**, nominal KeyW keyup Z threshold 64.68 | **(−0.045632, 8.394794, 64.039604)** | **0.3336m** | **2** | **NONE** | **7/7** eventually | **FAIL-CLOSED**: collision was observed but A3 recovered by ordinary route without selecting alternate original NavLink |

KeyD was **6 actual native ticks** in both cases. In EARLY, native trace recorded 2 genuine A3 Rapier human-proximate dynamic-collider KCC rejections by around tick 435, but the following observations showed no alternate original link. At 7/7 the verifier rejected a false success with `B105_FALSE_POSITIVE_SEVEN_REJOIN_WITHOUT_RAPIER_A3_DETOUR` rather than promoting the count to a blocked-route proof. This is a **meaningful negative**: briefly blocked A3 can recover without requiring the B95/B104 lateral detour. It is *not* evidence of penetration, a fabricated source path, or a 4v4 activation.

## Interpretation

- B104 `X≈-0.0647,Z≈63.7065`: human-proximate original Rapier rejected A3 **8** times, alternate genuine original NavLink `first-drop-positive-z-2`, **real 7/7**. [B104 PASS run](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39736631818).
- B105 `X≈-0.0456,Z≈64.0396`: actual original Rapier rejected A3 **2** times, but it resumed direct original route and completed **7/7 without detour**. Do **not** lower the original stalled-tick threshold merely to manufacture an alternate route; a safe direct rejoin should remain possible.
- B105 MID X≈+0.245 was far beyond the established narrow right-lane candidate, so expensive physics test was correctly skipped. Do **not** represent it as a failed original collision algorithm.
- Position qualification is a prefilter, **not** proof of collision; a true alternative-path success requires actual original KCC blocked steps and audited native NavLink. Relative KeyW release thresholds produce different actual positions, but no claim of independently controlled sub-frame precision is warranted.

## Frozen authority

No changes to the normal game engine, actual collision world, KCC approvals, source solids, NavLinks, scoring, CPU teleports or launch authorization. Exactly **25 original physical solids, 17 paint surfaces, 26 original NavLinks, 0 scoreable source promotions**; `activationReady=false`, unrestricted 4v4 **uncertified**. `main`, Draft PR #5 (head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`) and GitHub Pages untouched.

## Next focused engineering gate — W10-B106

Improve **classification**, not difficulty or collision rules: distinguish (1) no physical obstruction, (2) brief real Rapier rejection followed by safe direct recovery, (3) sustained real blockage needing original alternate-link detour, (4) unresolved blockage. Use real timestamped A3 KCC audit evidence and unchanged physical NavLink outcomes. Explore one genuinely distinct **persistent** right-lane stop (e.g. measured X near −0.05 and Z near 63.85–63.96), with genuine KeyW release and no hand-written pose. Keep FAIL-CLOSED boundaries: do not force CPUs to detour when direct recovery is safe; do not label an unobstructed 7/7 as success for the *detour* requirement.
