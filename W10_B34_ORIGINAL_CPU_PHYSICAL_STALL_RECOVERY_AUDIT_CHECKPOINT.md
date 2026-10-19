# Browser Ink TPS — W10-B34 Original Source CPU Stall Recovery Diagnosis and Real Chrome A/B

**Date:** 2026-10-19 JST
**Parent QA HEAD:** `5bdda64144ea5f3abdd08048b97df6451c941010` (B33)
**Verified aligned B34 implementation/CI SHA:** `a2f5c4eb556377ef3361f3025ed32c8864d187f2`
**Subsequent QA-only Chromium pointer unlock event-race correction:** `6cd3542765e46eb7db4b0104053b0d8ae23adcaf`
**Branch:** `dev/t21-f4e103w-qa-infra` only. **No main, Draft PR #5, T19C/T20 Freeze or public website edits**.

## Important B34 ground truth

B33 real-source ink-aware stable-goal CPU patrol regained source ink and firing but only achieved **86.4% of fixed CPU foot travel**. B34 identifies the actual 7-CPU grounded near-stationary time and differentiates actual source Recast route length from repeated every-0.28s goal requests. In the prior near-matched native Chrome session (3-tick initial drift) [39219582331](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39219582331), the original fixed mode had **321/11,060** near-stationary grounded foot samples (2.9%); B33 had **1,737/11,081** (~15.7%). This supports a physical-foot stopping bottleneck, rather than proof of a fully determined physical obstruction. No new source actor evidence was recovered.

### New opt-in actual original-foot stall recovery

`src/app/UndertowF3PaintAwarePatrol.ts` `mayReconsiderStalledOriginalGoal` is a conservative pure predicate: a real originally approved in-flight goal may be reconsidered only after **36 consecutive physically grounded nearly stationary source KCC ticks** and genuine distance **>=1.5m** from the existing goal. Source traffic retains the previous goal otherwise and ranks only the already present certified source-local original candidate list when stalled. A replacement must still pass the existing physical support, Recast native endpoint and actual KCC movement gates; the CPU position is **never** written or teleported. No inferred center/underpass path, optical collision, original actor placement or score. Metrics separate actual grounded frames, near-stationary frames, repeated goal requests, truly NEW verified source goals, Recast route polyline lengths, distances and 36-tick stall recovery approvals.

`src/app/UndertowF3PlayablePreviewApp.ts`: original **FIXED patrol remains the default**. B31 remains `&t21W10B31=inkGoals`, B33 `&t21W10B33=stableGoals`; B34 is **research-only** `&t21W10B34=stallRecovery` under existing nonproduction F3 source practice. This experiment NEVER automatically promotes to main/PR5 or default gameplay.

### Two completed actual Chrome A/B results — why exact window matters

**Independent near-matched cumulative source gameplay**, genuine Chromium build [39220739994](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39220739994) **SUCCESS**, start difference **-4 native ticks**. FIXED **11,064 cells / 87 source shots / 704.37m foot travel**, B34 **11,134 cells / 85 shots / 684.92m travel**. Real B34: 2 prolonged foot-stalls and 2 physically audited alternate original goals, 562 near-stationary samples versus fixed 321. This is observational cumulative entire session: it includes unequal lengths of CPU onboarding/initial painting. **Do not present this as proof of source-stage performance improvement.**

**Aligned 1,080-tick physical-window A/B**, final instrumented source code [39221714126](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39221714126) **SUCCESS** at `a2f5c4eb5563`: both separate genuine Chrome + native 7 CPU sessions first advance with **real Rapier simulation (up to 72 ticks per invocation) to exactly native tick 1800**. They take read-only pre-window native source snapshots and then each execute **exactly 1,080 additional real fixed physics ticks**. The comparator subtracts each original source counter's tick-1800 starting value, avoiding unequal previous painting, shooting and walking. Both have exactly `[2160,2520,2880]` checkpoints and **0 absolute tick offset**.

| REAL IN-WINDOW original source metric | FIXED normal | B34 stalled-goal research | B34 / fixed |
|---|---:|---:|---:|
| Genuine changed original ink cells | **1,407** | **836** | **59.42%** |
| Accepted original-source paint shots | **21** | **16** | **76.19%** |
| Real source ink impacts | 20 | 18 | 90% |
| Native physical CPU-ground travel | **498.42m** | **473.91m** | **95.08%** |
| Original-ground near-stationary samples | 78 / 7,560 (1.03%) | 400 / 7,560 (5.29%) | Elevated |
| Truly new authenticated source goal selections | 76 | 87 | More changes |
| Mean native Recast route distance per new goal | 7.740m | 6.069m | 78.4% |
| Genuine new goals shorter than 4m | 53.95% | 67.82% | More short hops |
| Verified true cross-team physical paths | **0/12** | **0/12** | HOLD |

The research B34 path actually approved **2** alternate original goals after **2** verified stationary re-evaluations, with zero new source geometry/teleport. Yet it **fails fixed-relative initial quality gates** (ink >=95% FAIL, shots >=90% FAIL, travel >=90% PASS). Final computed verdict `RETAIN_FIXED_AS_DEFAULT_WHILE_ADAPTIVE_IS_RESEARCH_OPT_IN`. This was a real completed experiment rather than a quality improvement suitable for users.

**Interpretation:** The 36-tick safety valve reduces the worst long stalls versus B33 in some runs but does not fix underlying source goal-choice dynamics. The aligned window specifically reveals **too many short Recast source-goal hops, more foot stops, and reduced actual paint output**. Both sessions begin the measurement at the same absolute tick, but their genuine source paint/actor history BEFORE tick 1800 is not an identical seeded replay; results remain bounded original-source QA, not a randomized controlled gameplay study or owner's RTX hardware benchmark. Do not claim causality beyond what evidence supports.

### Code/tests and residual Chromium QA issue

- Pure unit tests: existing B31 3 + B33 3 + B34 2 = **8/8 PASS**, plus existing B17 4/4 passing in original Chrome source workflow [39221714126](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39221714126); build and actual native human-to-CPU mouse hit/splat/respawn PASS.
- B34 comparator `scripts/t21-w10b32-compare-real-source.mjs` fails closed if native tick 1800 start absent, if source 25/17/26/0 drifts, if original foot/real paint increments aren't finite, if in-window physical tick checkpoints disagree or a supposed stall recovery was not authentically witnessed. Before B34 aligned protocol, preliminary comparator [39220685655](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39220685655) correctly rejected **69-tick independent browser startup drift**; do not treat as product regression.
- B28 full original 57,578 source static optical triangles and 19 original albedo pack regression [39221534263](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39221534263) SUCCESS on B34 gameplay code.
- Native CPU B14 splat/respawn [39221534015](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39221534015) SUCCESS on B34 gameplay code.
- Prior source B21 camera/render A/B/A [39221534155](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39221534155): renderer A/B/A, real Q and player movement PASS; subsequent B27 unlock test intermittently failed because it polled the unchanged old FOV *before the async genuine Chrome `pointerlockchange` event*. `scripts/t21-f3-browser-smoke.mjs` now waits for the authentic event and source FOV reset within 10 seconds, without modifying actual production camera. **Final B21/CI run at `6cd3542765e4` should be checked before marking that QA-only correction verified.**

## Source authority and next step

Frozen source **25 original physical Rapier solids, 17 original paintable but UNSCORED surfaces, 26 native original NavLinks, 0 source scoreable**, `activationReady=false`. Authentic natural cross-team foot connections **0/12**. Original `Vss_Temple01` Banc/SetActor instance transforms and active original layers still UNVERIFIED. No invented collision, bridge, target, Turf result, actor locations or false fully functional 4v4.

**W10-B35 priority:** Do NOT promote B34. Under original source authority, evaluate whether excessive short-hop goal selection/route choice (67.8% short) can be bounded by a physically vetted 6–10m target span, while protecting actual ink throughput by aligned tick-window A/B. Alternatively, use evidence-authenticated original Banc/SetActor provenance if available, which remains a higher-value unlock for natural 4v4. Avoid further cosmetic HUD/camera microfeatures or another long general-purpose benchmark. Original fixed patrol remains the preferred player default. Work/owner Windows actions remain unnecessary.
