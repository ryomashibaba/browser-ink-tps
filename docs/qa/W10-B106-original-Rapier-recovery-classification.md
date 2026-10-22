# W10-B106 — Real A3 source collision outcome classification

**Date:** 2026-10-22 JST  
**Branch:** `dev/t21-f4e103w-qa-infra`  
**Status:** Classification implementation **DONE**. Unit regression **9/9 PASS**; real Chrome **B104_BLOCKED PASS**; independent `B105_BRIEF` physical replay **NOT QUALIFIED (input position miss)**. **Normal gameplay, original unrestricted 4v4, PR #5, and production remain HOLD.**

## Evidence-driven categories

The pure read-only classifier in `scripts/t21-w10b106-original-contact-classifier.mjs` maps actual source KCC audit and native physical rejoin evidence to:
- `NO_CONTACT_DIRECT_RECOVERY`: no witnessed human-proximate real Rapier KCC rejection and 7 genuine CPUs rejoin directly;
- `ACTUAL_CONTACT_DIRECT_RECOVERY`: at least one real near-human KCC rejection, no alternate original link, 7 genuine CPUs rejoin safely;
- `ACTUAL_CONTACT_ORIGINAL_LINK_DETOUR_RECOVERY`: witnessed real near-human KCC rejection, valid original `first-drop-positive-z-*` NavLink + authentic source-floor lateral goal, 7 genuine CPUs physically rejoin;
- `ACTUAL_CONTACT_UNRESOLVED`: actual near-human KCC rejection and true observation ending without all seven physical rejoins.

Two additional safety categories `CALIBRATION_MISS` and `OBSERVATION_INCOMPLETE` do not imply game defects. `INVALID_ORIGIN_OR_UNSUPPORTED_PROOF` rejects fake actor IDs, duplicates, teleports, invalid source links, lost original 25/17/26/0 authority or certification drift. **Actual dynamic-owner token `REAL_PLAYER_OR_UNREGISTERED_DYNAMIC_ACTOR` is not uniquely human:** source shared-world Rapier rejection plus measured true human-foot proximity is the defensible claim. The classification describes observed *recovery behavior*; no inference of duration merely from the cumulative KCC reject count.

## Code changes

- [`dd08eb4`](https://github.com/ryomashibaba/browser-ink-tps/commit/dd08eb4301e354c6e9365a56ae37720f570af75a): pure original-source classification without changes to gameplay/physics/navigation.
- [`24c0cb1`](https://github.com/ryomashibaba/browser-ink-tps/commit/24c0cb15aa2f6c23ea06f78d0ae18a47b6455ad5): 9 real-evidence-shaped Node native regression cases, including earlier B104 8-block original-link 7/7 and B105 2-block direct 7/7; reject unsafe, fake, duplicate or incomplete evidence.
- [`7934ab9`](https://github.com/ryomashibaba/browser-ink-tps/commit/7934ab90376679b861e8ffc2b8acb6a0182b404d): isolated real WebGL2 / PlayCanvas / Rapier / Recast input and genuine 7-CPU classification replay for `B104_BLOCKED` and `B105_BRIEF`, with candidate-position fail-closed.
- [`1c208c7`](https://github.com/ryomashibaba/browser-ink-tps/commit/1c208c76f10d7e5e32184cbf61735c16b58f6fe7): dedicated CI, syntax / source build, 9 Node regression tests and two independent actual-Chrome experiments.

## Latest Actions results

[Run #39762892057](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39762892057).

| Job | Result | Actual evidence / limitation |
| --- | --- | --- |
| Frozen-source build + 9 classifier tests | **PASS** | 9 passed, 0 failed. No game logic changed |
| Real `B104_BLOCKED` Chrome | **PASS** | Actual human at **X≈−0.0647, Z≈63.7932**, **8** human-proximate A3 original Rapier KCC rejected steps, original NavLink **`first-drop-positive-z-2`**, **7/7 actual CPU physical rejoins at tick 1326**, classified `ACTUAL_CONTACT_ORIGINAL_LINK_DETOUR_RECOVERY` |
| Real `B105_BRIEF` Chrome | **FAIL-CLOSED, NOT QUALIFIED** | Native CDP input parked human at **X≈+0.3256, Z≈64.3519**, outside the required right-lane corridor. A3 collision and direct recovery were **not** tested at this position. This is NOT evidence that the B105 safe-direct recovery classification is wrong |

The **prior** true B105 trial [#39760967523](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39760967523) remains valid as independent actual-Chrome evidence of **2 near-human Rapier rejects → 7/7 direct recovery without original alternate NavLink** at human X≈−0.0456/Z≈64.0396. Its result was intentionally marked FAIL for that day's **detour-only** proof requirement; B106's classification correctly distinguishes the observed safe direct recovery in its 9/9 regression suite. **The current B106 real-Chrome B105 replay did not reproduce that position.**

Artifacts in successful/failed jobs:
- `w10b106-real-source-B104_BLOCKED`: native Chrome source screenshots + classification JSON (actual PASS)
- `w10b106-real-source-B105_BRIEF`: native input-position calibration evidence (no CPU classification)

## Safety and governance

Only new scripts/tests/CI/report files in QA branch. Source solids **25**, original paint surfaces **17**, authentic source NavLinks **26**, scoreable source promotions **0**; `activationReady=false`, unrestricted original 4v4 uncertified. No editor or engine modification, no CPU/real-human teleport, no synthetic simulation ticks, no collision bypass, no ordinary FIXED/SWEEP changes, no `main` merge, Draft PR #5 remains open at head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`, no GitHub Pages deployment.

## W10-B107 recommendation

Collect genuinely valid right-lane B105-like *brief-contact* input positions without rerunning full 7-CPU Chrome sessions for obvious position misses. Run a small bounded genuine-keyboard calibration first, then advance to classification only for valid actual human feet near X≈−0.046/Z≈64.04. Measure **actual first/last native contact tick and A3 physical route choice** for both brief-contact/direct and alternative-link recovery. Preserve safe direct recovery (do NOT lower stall threshold to induce an alternate route). Use QA-only evidence; no production promotion.
