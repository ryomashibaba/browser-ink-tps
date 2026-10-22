# W10-B110 — Independent genuine KeyA start and KeyW release calibration

**Date:** 2026-10-22 JST  
**Branch:** `dev/t21-f4e103w-qa-infra`  
**Verdict:** Script + independent Chrome workflows **implemented**; B106 classifier regressions and original frozen-source build **PASS in tested jobs**. **No genuine human foot satisfied the full original B105 near-right-lane candidate window; expensive A3 collision + physical 7/7 test was not entered on any W10-B110 candidate. All specific direct-recovery CI cases FAIL-CLOSED as intended. No change to normal play / activation.**

## User goal and initial evidence

The actual B105 `ACTUAL_CONTACT_DIRECT_RECOVERY` occurred at **human X≈−0.045632, Z≈64.039604**, **2 actual human-proximate A3 original Rapier KCC rejects**, no alternate link, safe **7/7 physical rejoin**. B109 held six native ticks of authentic KeyA correction starting at original source Z≈66 and varied only genuine CDP KeyW-up. B109 release-Z 64.60 parked at **X≈−0.151273, Z≈64.066788**: good longitudinal position but ~10.6cm too far left.

B110 tests **independent actual side-key start timing**, holding `KeyD` and `KeyA` at six *observed genuine native ticks* and (initially) `KeyW` nominal release at 64.60. The untouched original player controller/rapier KCC naturally moves the actor. All candidate checks are based on **actual settled human foot**: X=[−0.12,−0.01], Z=[63.89,64.135], correct Y, within the historically grounded A3 blocked-lip distance, and >=0.13m distinct from the B104 detour reference. Only then may the long original A3 collision / audited original NavLink / real physical 7/7 classification run. No position or stage geometry is rewritten.

## Actual authored changes

- [`02c34fa`](https://github.com/ryomashibaba/browser-ink-tps/commit/02c34faec513d5520201bfcd0fad053fd2f6192a) — `scripts/t21-w10b110-independent-lateral-timing.mjs`, isolated real-Chrome original source KeyA trigger-Z parameter (bounded 65.55–66.65), original KeyW release parameter, strict original 25/17/26/0 and actor physical-rejoin requirements.
- [`2cf9a74`](https://github.com/ryomashibaba/browser-ink-tps/commit/2cf9a744d48cd7732f3eb26827b3a0b6645427ad) — independent Chrome three-way genuine KeyA trigger CI (65.80,66.25,66.50), no main/Pages changes.
- [`5907daf`](https://github.com/ryomashibaba/browser-ink-tps/commit/5907daf02727e9f8a0294c39190d33812789bc89) — two refined real KeyA-trigger trials (65.55,65.68).
- [`f4b1730`](https://github.com/ryomashibaba/browser-ink-tps/commit/f4b173001a5560004ed508c9faae2ff301bc3a20) — extend **QA-only** KeyW-release bounded range to 64.90 to test separate longitudinal correction; no actual control-code changes.
- [`dfc5849`](https://github.com/ryomashibaba/browser-ink-tps/commit/dfc584947e626420722949aa9ce1d305bf02e859) — final two-case CI, hold observed KeyA trigger Z=65.68 and vary genuine KeyW release threshold at 64.72/64.80.

## Human-foot calibration results (m)

All trial positions are **real WebGL2/Chromium keyboard + original physics**, not authored actor feet:

| A-key trigger Z | KeyW release nominal Z | Measured parked human X | Measured parked human Z | Near-B105 candidate? |
| ---: | ---: | ---: | ---: | --- |
| **66.50** | 64.60 | −0.163494 | 63.751358 | **No** |
| **66.25** | 64.60 | −0.187886 | 64.091812 | **No**, lateral X |
| **65.80** | 64.60 | −0.126120 | 64.018227 | **No**, only ~0.006m left of minimum candidate X |
| **65.55** | 64.60 | −0.147186 | 64.230850 | **No**, lateral + longitudinal |
| **65.68** | 64.60 | −0.060726 | 63.833035 | **No**, Z too far forward |
| **65.68** | **64.72** | **−0.052704** | **64.154327** | **No**, X near actual B105, Z ~0.019m beyond original narrow bound |
| **65.68** | **64.80** | −0.137138 | 64.403702 | **No**, both |

The closest **longitudinal** example is KeyA trigger 65.80, KeyW gate 64.60 (Z differs ≈2.1cm from B105 but X ≈8.05cm too left). The closest **lateral** example is KeyA trigger 65.68, KeyW gate 64.72 (X differs ≈0.7cm from B105, while Z ≈11.5cm behind). This shows the two original-keyboard controls are **coupled and quantized**: small nominal trigger changes are not linearly or independently reflected in settled original human-foot position; a false exact-control claim would be unjustified.

## CI provenance and fail-closed result

- [Initial matrix, Actions #39775220654](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39775220654): 3/3 real-keyboard calibration trials reject actual human-foot qualification. Code syntax, B106 9/9 classifier tests and original build passed before Chrome attempts.
- [Refined KeyA matrix, Actions #39775853427](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39775853427): 2/2 calibration misses; the ~6mm candidate-X miss and opposite X/Z tradeoff are both genuine measurements.
- [Final held-KeyA, varied-KeyW matrix, Actions #39776234920](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39776234920): 2/2 calibration misses; neither went into full A3 original contact/rejoin proof. Original-source builds + B106 classifier regressions passed.
- All workflows retain their real Chrome/screenshots + source-foot JSON artifacts even on fail-closed qualification outcomes. Workflow overall FAIL does **not** imply a gameplay regression when the original actors were not run beyond the initial calibration.

Do **not** loosen the narrow gate or claim B105 actual direct recovery just because X or Z is near the target individually. Likewise, do not count the original B104 alternate-link 7/7 case as direct 7/7.

## Immutable constraints / next gate

Exact source audit remains **25 Rapier physical solids / 17 paint surfaces / 26 genuine Recast NavLinks / 0 source scoreable promotions**. `activationReady=false`, `unrestricted4v4Certified=false`; experimental detour only opt-in under source QA; normal FIXED, SWEEP, scoring, main, frozen Draft PR #5 (head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`), and public Pages unchanged. No actor teleport, native synthetic tick, modified collider decision or fabricated match scoring.

**W10-B111 suggested gate:** stop sweeping arbitrary single-Z triggers. Analyse true native input batches and post-KeyA lateral inertia from the saved B108–B110 screenshots/JSON. Prefer a **two-stage genuine keyboard feedback controller**: separate lateral stop/settling from W-key release using actual observed player foot, with a strict finite attempt bound and no opposite-direction positional oscillations, then run the 7-CPU physics test only when **both** actual X and Z are close to historic B105 direct recovery. Maintain a separate direct-vs-original-link outcome classification and honest rates of unqualified input positions. No production promotion.
