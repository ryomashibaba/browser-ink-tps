# W10-B108 — Genuine KeyA feedback for right-lane original A3 contact

**Date:** 2026-10-22 JST
**Branch:** `dev/t21-f4e103w-qa-infra`
**Verdict:** **True-browser lateral feedback implemented and verified. One physical right-lane candidate attained with genuine 6-tick KeyA correction, 8 original Rapier A3 human-proximate rejections, and genuine 7/7 alternate-original-link recovery. Desired B105-style safe *direct* recovery NOT reproduced; all B108 workflows correctly FAIL-CLOSED for that narrower class. Production HOLD.**

## Engineering

1. [`1c428c9`](https://github.com/ryomashibaba/browser-ink-tps/commit/1c428c94f5f5f805c296e68060d6bfabbb0a514e) — new isolated `scripts/t21-w10b108-genuine-keya-corrected-brief-contact.mjs`. Original genuine Chrome `KeyD`+`KeyW` input, then **read-only actual native human foot** sampled at original upper-lip Z, with a bounded **real `KeyA` keyDown/keyUp** if the real foot remains right of X=-0.035. Two true CDP input epochs `EARLY` (nominal Z<=66.0) and `LATE` (nominal Z<=65.15); natural browser frames run unmodified player controller/real Rapier KCC. No `setPosition`, injected CPU poses, synthetic simulation step, reverse `KeyS`, collision bypass, score, new NavLink, match authorization or normal CPU mode change.
2. [`5ac633d`](https://github.com/ryomashibaba/browser-ink-tps/commit/5ac633deba4ed0d93f55fce304b7c2af70e20329) — new independent workflow `t21-w10b108-keya-feedback-brief-contact.yml`, real software-WebGL2 Chrome matrix `EARLY/LATE`, original-source build and B106 classifier regression preflight. Always saves screenshots + JSON even for input-position misses.
3. [`1a3961c`](https://github.com/ryomashibaba/browser-ink-tps/commit/1a3961c0cb481a539e4b8c982c3453e3b2388c2f) — **reduced the real KeyA feedback maximum** from 12 actual native ticks to 6 after both original 12-tick trials overshot laterally. No game-controller changes.

## Evidence

| Run / genuine correction | Real KeyA ticks | Actual settled human foot X / Z | Prequalification | Authentic CPU/physical result | B108 direct-recovery research goal |
| --- | ---: | --- | --- | --- | --- |
| [First EARLY](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39769289915) | 12 | **−0.576 / 64.246** | FAILED; drifted too far left | Not run | HOLD |
| First LATE | 12 | **−0.311 / 63.729** | FAILED; drifted too far left | Not run | HOLD |
| [Revised EARLY](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39769793118) | **6** | **−0.054199 / 64.178040** | **PASS**, measured truly distinct human foot | **8** genuine original A3 Rapier KCC human-proximate rejected steps, actual original `first-drop-positive-z-2` NavLink, and genuine **7/7** physical CPU rejoins | **FAIL-CLOSED**: actual classification was `ACTUAL_CONTACT_ORIGINAL_LINK_DETOUR_RECOVERY`, not expected brief-contact direct recovery |
| Revised LATE | **6** | **−0.201489 / 64.330727** | FAILED, left of actual narrow right-lane source corridor | Not run | HOLD |

The revised EARLY Chrome job **really did** execute original Rapier collision and all seven original-source physical rejoin paths; it was an **actual safe alternate-link recovery**, not the intended B105 direct recovery. It remains excluded from an experimental brief-contact-direct PASS. B108 did **not** independently reproduce the previous B105 real native `2` rejects / direct `7/7` at X≈−0.0456, Z≈64.0396.

Actual Chrome KeyD duration itself sometimes quantized to 11 instead of 6 ticks; nominal durations are not precise because the real WebGL2/CDP snapshot only exposes whole native-render batches. Real lateral correction also has post-keyup momentum: in revised LATE trial KeyA-up foot X≈−0.1224, followed by real coast to X≈−0.2015. **Do not assume a position observed at KeyA release equals final parked position.** These observations justify calibrating the momentum/KeyW release chronology jointly rather than increasing movement speed or forcing an alternate link.

## CI accounting

- Run [#39769289915](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39769289915): original **12-tick** KeyA correction, both scenarios fail closed at position prequalification.
- Run [#39769793118](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39769793118): revised **6-tick** KeyA correction, both matrix jobs **FAIL** for expected brief-direct criterion (EARLY authentic 7/7 alternate link; LATE position miss). Both jobs' **code syntax, B106 classifier 9/9 regression and original-source build preflight succeeded**. Both GitHub Actions evidence artifacts saved (`w10b108-real-KeyA-feedback-EARLY`, `...-LATE`).
- Latest prior normal B75 real Chrome FIXED+SWEEP and existing B96/B99 source Chrome regression remained successful at prior instrumented head. **No claim of new B108 gameplay-wide release testing**, since only a new QA script/workflow was changed after the already-validated engine instrumentation.

## Fixed source and next engineering gate

Frozen original counts **25 Rapier solids / 17 original paintable surfaces / 26 original Recast NavLinks / 0 scoreable promotions**, `activationReady=false`, normal CPU FIXED unchanged, SWEEP opt-in, `unrestricted4v4Certified=false`. `main`, Draft PR #5 (frozen HEAD `8cfc95756ef0b56e2c33dc9f89a9041126daa272`), and public Pages are untouched. Source QA detour stays opt-in only.

**W10-B109:** Use the *now measured* EARLY real-KeyA 6-tick lane placement near X≈−0.054, Z≈64.178 as a position baseline. Attempt **bounded genuine real KeyW release adjustments** to reach the original B105 direct-recovery Z≈64.04, without changing X through fake coordinates and without forcing A3 alternate-path behavior. Preserve fail-closed classification of (a) input miss, (b) no contact/direct 7/7, (c) transient human-proximate original KCC contact/direct 7/7, (d) contact/original alternate-link 7/7, (e) unresolved. Do not infer contact persistence merely from cumulative rejected counts. Use original first/last tick and real KeyA coast log to ground each decision.
