# Browser Ink TPS — W10-B32 Actual Seven-CPU Fixed vs Ink-Aware Matched Chrome A/B

**Date:** 2026-10-19 JST
**Parent:** W10-B31 `2f3b9898d912e3813edf687088ee7915fc384523`.
**Final tested B32 code:** `24b92098d30e8674baddad7ec7e392a0abe49a7a`.
**Scope:** `dev/t21-f4e103w-qa-infra` QA branch ONLY; no main, Draft PR #5, T20, production public site or original private assets touched.

## Outcome: preserve actual gameplay throughput, no spurious success claim

B31 installed a genuinely ink-ownerGrid-aware goal order for the existing 7 real source-foot CPU agents. It added real tactical preference but its one-run ink/shot volume was lower. B32 performs a **bounded apples-closer-to-apples A/B** using TWO INDEPENDENT actual headless Chrome + WebGL2 sessions built from the SAME GitHub revision. Both run the existing real Rapier 60Hz physical human and 7 Recast/Rapier CPU actors through existing onboarding plus the same **3 × 360 = 1,080 additional fixed simulation ticks**. Source-original stage frozen. No synthetic bots, scene teleport, score mask, cross-team link, cheat ability, or non-native input substitution. The baseline launches with `T21_W10B31_INK_AWARE=0`; experimental launches with `=1`. Both run the pre-existing W10-B16 real Chrome native source smoke and save their JSON snapshots before comparison.

**FINAL code `24b92098` independent real Chrome matched-section A/B** [workflow SUCCESS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39213335061):

| Original stage measured, 7 CPU | Legacy FIXED default | B31 PAINT-AWARE experiment | Adaptive / fixed |
| --- | ---: | ---: | ---: |
| Genuine original ink owner cells changed | 11,054 | 10,096 | **91.33%** |
| Genuine accepted source ink paint shots | 87 | 72 | **82.76%** |
| Actual original impacts | 92 | 73 | **79.35%** |
| Actual source-foot patrol distance (m) | 700.95 | 649.76 | **92.70%** |
| Existing Rapier/Recast source goal requests | 659 | 658 | 99.85% |
| Real original ink owner lookups | 0 | 3,948 | n/a |
| 7 authentic physical CPU, scoring and origin route | 7 / 0 score / 0 crossing | 7 / 0 score / 0 crossing | HOLD |

Real original owner samples: 3,948 / 3,948 valid. Experiment accepted 321 non-owned and 337 already-owned real goals, unknown 0. **Zero source shortcuts; 0/12 verified opponent cross-team natural-foot paths in BOTH branches.**

Three checkpoint native ticks: FIXED [1912,2272,2632], AWARE [1917,2277,2637]. **First absolute tick offsets differ by +5 real ticks** (0.083s). The three successive checkpoint intervals are identical 360 ticks; starting conditions/code/stage/QA scripts match, but this is **NOT** a randomized controlled study, exact same absolute history, deterministic replay, GPU FPS comparison, or user-subjective playtest. The comparator hard-fails if interval mismatch or startup offset >12 ticks and explicitly records the offset.

A second independent real Chromium pair [39213299049](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39213299049) from the immediately preceding code without the default fallback also succeeded: FIXED 11,064 cells/87 shots/702.90m vs AWARE 10,091 cells/72 shots/648.87m; 1-tick start offset. The **same direction** in two independent pairs increases confidence that B31's new simple priority reduces painting throughput under this audited source-lab scenario; still not proof for full original stage or future actual PvP.

### Safety/quality gates

Explicit initial relative pass thresholds (not user-facing official Turf) require adaptive mode to preserve >=95% source changed cells, >=90% real accepted shots and >=90% genuine foot distance. Final code:
- cells ratio **91.33% FAIL**
- real shots **82.76% FAIL**
- physical patrol **92.70% PASS**
- conclusion **`RETAIN_FIXED_AS_DEFAULT_WHILE_ADAPTIVE_IS_RESEARCH_OPT_IN`**.

**Implemented action:** In `src/app/UndertowF3PlayablePreviewApp.ts`, restore fixed previously proven CPU target order for ordinary source-only `?t21Play=preview`. B31 new ink ranking remains physically and source audited, only available with **`&t21W10B31=inkGoals`**, including explicit B32 real Chrome comparison. The fixed T21 practice user experiences unchanged physical actor behavior and does not suffer an unproven B31 performance regression. No source traffic stage or training build promotion.

### Tested code and reviewable source

- `scripts/t21-w10b32-compare-real-source.mjs` separately validates authentic original source metadata (25 physical, 17 unscored paint, 26 original nav, 0 scoreable, 0/12 opponent paths, real seven source feet, no physical teleport, safe statuses), uses native tick intervals, counts native unscored original ink and actual foot patrol and writes the JSON A/B decision in the existing Actions artifact.
- Existing B15/B16 real source Chrome CI runs fixed baseline and experimental mode under the **same build and code commit**, serially, with snapshot evidence and explicit "research-only" output.
- **Final code W10-B15/B16 paired seven CPU native Chrome, browser shot and respawn + B31 unit suites**: [39213335061](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39213335061) SUCCESS.
- **Final code B21/B22/B23/B25/B26/B27/B28 real Chrome render A/B/A**: [39213335094](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39213335094) SUCCESS.
- **Final code B14 native Chrome splat and respawn**: [39213335087](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39213335087) SUCCESS.
- **Final code native Ubuntu+Windows source checks**: [39213335097](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39213335097) SUCCESS. Not the owner's Windows RTX hardware benchmark.
- **Original 57,578-triangle source texture F3G/F3L full optical Chrome QA** [39213335075](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39213335075): **SUCCESS** at final tested B32 runtime, without source optical pack promotion to gameplay collision.
- Intermediate fail **39212604406**: workflow ran before new comparator file was committed, module-not-found; corrected. Intermediate fail **39212722338**: hard-coded equality of absolute physical tick stamps failed due 5-tick browser startup difference even though 360-tick measurement intervals were identical. Fixed comparator now transparently reports offsets rather than pretending fully identical start moments.

## What is still unproven / HOLD

Frozen partial original `Vss_Temple01`: **25 certified original physics solids, 17 paintable non-scoring surfaces, 26 original NavLinks, 0 scoreable source surfaces, activationReady=false**. Original central/underpass connectivity unresolved; the 12 possible cross-team native paths have **0 certified**. Original `Banc/SetActor` actor transform matrices/active original layer unknown; no fake bridge, scored Turf, CPU actor teleport, guessed navigation or winner. User-private original packs remain outside GitHub.

**W10-B33 recommendation**: Don't further optimize the B31 ownerGrid rank without evidence why it reduces output. If continuing source-local gameplay, focus on real shot/impact rate and goal-dwell bottlenecks with a targeted single opt-in investigation; otherwise prefer solving the true original-actor Banc provenance blocker so natural 4v4 can eventually exist. B31 opt-in feature needn't block actual gameplay. No Work automatically, no extra Windows user burden.
