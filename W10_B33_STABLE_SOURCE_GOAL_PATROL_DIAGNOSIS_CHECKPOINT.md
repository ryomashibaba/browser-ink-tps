# Browser Ink TPS — W10-B33 Source-Original Goal Retention Diagnosis

**Date:** 2026-10-19 JST  
**Parent B32:** `ffdebdc5a262d718be167eae45a2789ff446f14e`  
**Successfully tested B33 gameplay and A/B CI code:** `1c6ce6602f5df7313010790666c779dffa0ef2ac`  
**QA branch only:** `dev/t21-f4e103w-qa-infra`; production/main/T19C/T20/Draft PR #5 untouched.

## Real hypothesis confirmed as plausible, not treated as controlled causation

The B31 source-ink aware patrol sorted all preverified same-side goals by live ownerGrid on every tactical tick (~0.28 seconds), while the original fixed strategy returned the *currently pursued original goal* until the bot approached within 1.5m. This can cause a mid-route destination switch whenever another known old-source paint spot changes rank. B32 original-source same-commit native Chrome A/B confirmed a major B31 throughput regression and reverted the user-facing default to FIXED.

B33 introduces a **separate opt-in original goal hysteresis**:

- `src/app/UndertowF3PaintAwarePatrol.ts` adds `prioritizeExistingInFlightSourceGoal`: if there is an existing *previously physically/Recast-approved source candidate* and the real Rapier CPU foot has not approached within the original 1.5m arrival distance, move that preexisting index ahead of the ranked original candidate list; upon arrival, rerank by actual GameplayInkSystem original source ownerGrid. No fabricated point, teleport or authority promotion.
- `src/app/UndertowF3SourceTraffic.ts` uses that pure reordering only with `enableStableSourceGoal=true`, still subject to **all** original same-side bounds, physical support, native Recast path/end-snap and actual per-tick Rapier KCC. Adds read-only `continuedPreviouslyApprovedGoalRequests` and `switchedGoalBeforePreviousArrival` counters, with strict UNKNOWN owner ink bookkeeping.
- `src/app/UndertowF3PlayablePreviewApp.ts` retains **FIXED as default**. Old `?t21W10B31=inkGoals` remains a B31 research opt-in; new `?t21W10B33=stableGoals` enables source-only B33 goal retention and original ink prioritization. No shared production AI modifications.
- 3 additional pure Vitest scenarios prove a previously approved in-flight original goal remains first without granting path authority, original owners are reranked after arrival, invalid real foot cannot confer a route.
- W10-B15 native seven CPU source Chrome test and the existing two-real-browser B32 source comparison workflow were reused; explicit B33 diagnostics are required and comparison records genuine browser-start tick drift. No new independent CI job or private asset import.

## Real Chrome B33 A/B — genuine original 7 CPU physics

[**Final B33 full real Chromium seven-CPU 1,080-tick A/B and original human→CPU lifecycle — SUCCESS**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39216456371), tested at `1c6ce6602f5d`. Build PASS; new B31+B33 unit tests **6/6 PASS** plus original B17 HUD **4/4 PASS**. Actual seven-CPU native stage paint and 0/12 original opponent paths preserved.

| Actual source-original 7-CPU metrics | FIXED default | B33 STABLE original-ink experiment | B33/FIXED |
| --- | ---: | ---: | ---: |
| Changed real ink-owner cells | 11,064 | 10,983 | **99.27%** |
| Real accepted source paint shots | 87 | 82 | **94.25%** |
| Actual source ink impacts | 92 | 91 | **98.91%** |
| Native physically grounded patrol (m) | 703.39 | 607.97 | **86.43%** |
| Accepted real source goal selections | 660 | 680 | 103.03% |
| Genuine source ownerGrid lookups/samples | 0 | 4,080/4,080 | n/a |
| Already-authorized in-flight goal continued | 539 | 574 | diagnostic |
| **Changed goal before reaching previous** | **0** | **0** | diagnostic |
| Original opposite-team natural paths | **0/12** | **0/12** | HOLD |

Actual source-owner goal selection breakdown B33: 313 not-owned (neutral or other), 367 already own, 0 unsampled. All 7 native CPUs physically walking and shooting original paint, no synthetic navigation shortcut, no Actor teleport, no new collision, official Turf score **0**. Comparison checkpoints: FIXED `[1917,2277,2637]` vs B33 `[1919,2279,2639]`; independent browser start **2 native ticks apart**, all compared 360-tick checkpoint intervals agree. Not a deterministic seeded replay, identical absolute world time, statistical significance, owner RTX FPS benchmark, or genuine PvP victory.

To ground the specific cause hypothesis, the independently executed **nonsticky B31 mode with new B33 counters** [real Chrome QA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39216347251) recorded **53 mid-route goal switches**, 488 continued requests, 3,948 real sampled original-ink points and 658 accepted goals. The sticky B33 explicitly observed **0** mid-route switches and 574 continued goals, with paint output recovery. The old B31 Chrome had 10,091 changed cells, 72 shots and ~648.87m patrol. These are distinct Chrome executions; this is **strong evidence for a route-churn mechanism**, not proof of isolated causality from a randomized controlled experiment.

## B33 quality gates and actual action

B32 provisional initial thresholds: >=95% changed original cells, >=90% accepted paint shots and >=90% source native patrol distance versus paired FIXED run.

- Ink changed: **99.27% PASS**.
- Accepted shots: **94.25% PASS**.
- Native ground travel: **86.43% FAIL**.
- **Final decision: `RETAIN_FIXED_AS_DEFAULT_WHILE_ADAPTIVE_IS_RESEARCH_OPT_IN`.** The B33 prototype is tested and retained for experiments only; real users still get previously verified fixed patrol. Do not assert the new B33 is faster or more fun. Do not silently relax distance criterion after observing it.

## Other regressions and source truth

Additional actual Chrome regressions on earlier equivalent B33 gameplay code (subsequent changes only comparison workflow/script): [original source B21–B28 camera/render A/B/A](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39216347179) SUCCESS, [B14 native visible splat/respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39216347159) SUCCESS, [pinned exact full original optical source F3G/F3L](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39216347232) SUCCESS. A partial intermediate comparison run that preceded final updated scripts is not final evidence; use the final PASS above.

**Immutable authority:** 25 certified Rapier original solids, 17 paintable unscored original surfaces, 26 source native NavLinks, 0 scoreable, `activationReady=false`. Genuine cross-team native paths **0/12**, authentic original `Vss_Temple01` Banc/SetActor instance matrices and active layers unavailable. No fabricated bridge, connection, scoring, opponent interaction, or public original assets.

## B34 suggested direction

Now the objective bottleneck is **mobility shortfall under sticky-goal ownerGrid ranking**, NOT shooting or paint generation: B33 has 99% ink output but 86% foot travel versus FIXED. Before further ranking complexity, attribute the lower source-foot distance to longer native Recast path lengths, repeated already-owned goal selection, goal arrival/hold time or too-frequent path replanning using minimal targeted diagnostics. Promote source-local B33 only if predeclared paint/shooting/mobility gates pass over independently reproduced original 7 CPU sessions. If authentic Banc/SetActor provenance is supplied, prioritize verified original central connectivity over continued local-route microtuning.

Process: meaningful source-only gameplay decision correction with real native CPU witnesses, independent Chrome A/B, no extra user Windows tasks, no Work, main/PR5/T20 all unchanged.
