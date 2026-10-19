# Browser Ink TPS — W10-B35 Original-Source Native Crowd Goal Refresh Research

**Date:** 2026-10-19 JST.
**Parent:** W10-B34 `40a30a6065bf640b6de3d23310ac609d1d0e0d00`.
**Tested implementation code:** `f1d37dd6af8cf5cb7d0b4b4376f84bb64fa34416`.
**Branch:** `dev/t21-f4e103w-qa-infra`, not main, Draft PR #5, frozen T20 or production.

## Motivation / provenance

B34's genuinely aligned source-original physical simulation [39221714126](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39221714126) measured 1800→2880 native ticks: fixed source CPU 1,407 changed ink cells, 21 shots, 498.42m real foot patrol, 78 stationary samples; B34 physical-stall escape 836 changed cells, 16 shots, 473.91m patrol and 400 stationary samples. B34 experiment was **NOT** promoted; fixed patrol stays the only default.

The source-grounded real CPU branch in `CpuAgentSystem` nevertheless issues `requestMoveTarget` every tactical think (~0.28s) even if `UndertowF3SourceTraffic` returned the exact same already audited original goal. W10-B35 experimentally suppresses duplicate Crowd target submissions (up to three repeats) with a bounded forced retry every fourth think. If the goal changes or native Recast agent is recreated, submit immediately. **This changes no goal rank/order, NavMesh, actor foot, collision, physics KCC, ink, scoring, or CPU weapon logic.**

- New pure `src/ai/OriginalSourceNativeTargetRefresh.ts` with strict nonfinite-coordinate guard and bounded refresh policy.
- New Vitest unit gate: first/new/rejoined target immediate, duplicate goals suppressed in a bounded interval, malformed original-source goal rejected.
- Existing `CpuAgentSystem` opt-in `enableB35SourceNativeRetargetSuppression` only after actual nonproduction original physics source authority is attached. Normal T20/main and default T21 preview retain the old repeated requests.
- Opt-in `?t21Play=preview&t21W10B35=nativeTargetRefresh` diagnostic `b35NativeSourceRetarget` counts real Recast submissions and suppressed duplicates. Existing physical movement remains Rapier-authorized.
- Existing trusted mouse + seven real Chrome CPU integration pipeline runs actual fixed (no B35) and sparse native target refresh (B35 only), with identical original 25/17/26/0 stage, both starting actual native fixed tick 1800 and comparing **per-window 1080-tick counter increments**, not misleading cumulative pre-onboarding ink output. Previous source A/B comparator is extended, not replaced with new unrelated harness.

## Immutable restrictions

Authentic stage physical provenance remains **25 certified source solids, 17 original paintable unscored source surfaces, 26 native Nav links, 0 original scoreable surfaces, 0/12 original cross-team foot paths, `activationReady=false`**. Actual `Vss_Temple01` Banc/SetActor instance placements remain unknown. No fabricated underpass, teleport, bridge, scored Turf winner, 4v4 certification, unlicensed public source upload or production rollout.

## Final evidence and decision

See the real WebGL2/native seven CPU integration run [39227886617](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39227886617). Runtime TypeScript build and B35 isolated unit/source scripts passed. **Final end-to-end result and decision must be populated from the completed, source-verified 1800→2880 A/B report; do not infer a win merely from fewer native requests.**

## Next

If B35 falls below B32 provisional thresholds (>=95% ink cells, >=90% genuine paint shots, >=90% genuine foot travel vs fixed), leave it as explicit research opt-in only. If all pass, still require an owner human playability review before considering a default and **never** change frozen source topology. The highest impact overall blocker is **authentic original Banc/SetActor actor instance transforms and central natural KCC connectivity**, not incremental AI instrumentation. Stop tuning CPU goal priorities without stronger gameplay evidence.
