# W10-B107 — Original Rapier A3 native contact-timing QA

**Evidence date:** 2026-10-22 JST  
**Branch:** `dev/t21-f4e103w-qa-infra`  
**Verdict:** New real native KCC first/last contact instrumentation **implemented & observed**; intended B105-style direct recovery **NOT REPRODUCED** in this three-trial matrix. Research only; main/PR #5 and normal gameplay frozen.

## Engineering changes

1. [`0315e93`](https://github.com/ryomashibaba/browser-ink-tps/commit/0315e939e0d5872353d0f75759e3db62eb3e63e7): Extend **opt-in, read-only** B102 original `UndertowPhase14QSharedActorCollision.auditGroundStep` witness with `firstHumanProximateBlockTick`, `lastHumanProximateBlockTick`, `distinctHumanProximateBlockTicks`, and `longestHumanProximateBlockStreak`. Each value originates from **actual** `this.clock.tick` when the unchanged original shared-world Rapier KCC returns a rejected A3 movement and `REAL_PLAYER_OR_UNREGISTERED_DYNAMIC_ACTOR` is close to the real human foot. Multiple actual rejections in one native tick cannot artificially inflate the distinct-tick/streak count. **The wrapper still returns the original KCC result untouched**; no actor relocation, simulation stepping, collision veto bypass or new NavLinks.
2. [`118f53e`](https://github.com/ryomashibaba/browser-ink-tps/commit/118f53e5d23c823bb63c4b271065461aa369e0b0): New real Chrome `scripts/t21-w10b107-real-direct-contact-timing.mjs`; truthful actual human-foot admission gate near the historic B105 X/Z, independent original 60Hz CPU physical rejoin, actual original NavLink and KCC timing; fails closed if direct-with-contact outcome is not reproduced, even if a *different safe* physical detour succeeds.
3. [`87add68`](https://github.com/ryomashibaba/browser-ink-tps/commit/87add68bb5c34eeecf8264b4bf272ec2de35fc4c): Dedicated CI release gates 64.52, 64.62 and 64.68. Syntax check, prior 9/9 B106 native classifier regressions, original-source TypeScript/Vite build and actual Chrome WebGL2/PlayCanvas/Rapier/Recast. Evidence always uploaded, including expected FAIL-CLOSED.

## Real Chrome outcomes

[Actions #39765941538](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39765941538) — **3/3 jobs FAIL-CLOSED for the specific B105-style direct-recovery research goal**; no false PASS.

| Genuine KeyW observation gate (Z) | Real human settled X / Z | Original contact | Original A3 NavLink | Actual CPU recovery | Strict B107 test |
| --- | --- | --- | --- | --- | --- |
| 64.52 | **+0.317851 / 64.008980** | Not eligible for measurement: actual X outside right-side corridor | Not evaluated | No expensive 7-CPU trial | **CALIBRATION MISS** (expected fail-closed) |
| 64.62 | **+0.278105 / 64.288231** | Not eligible for measurement: actual X outside right-side corridor | Not evaluated | No expensive 7-CPU trial | **CALIBRATION MISS** (expected fail-closed) |
| 64.68 | **−0.042259 / 64.122116** | **8 genuine** A3 dynamic-collider KCC rejects near actual human foot | **`first-drop-positive-z-2`** | **7/7 at native tick 1309** | **ACTUAL_CONTACT_ORIGINAL_LINK_DETOUR_RECOVERY** — valid different gameplay outcome, but **not** desired direct-recovery class; B107 scenario FAIL-CLOSED |

Native Chrome proof is preserved as three independent non-expired Actions artifacts, notably `w10b107-actual-original-A3-contact-64.68` (actual Chrome screenshot and rejected classification JSON). The `64.68` artifact was separately inspected in its archived raw original JSON.

## New evidence: exact original KCC rejection ticks

| | B105 historical actual safe direct recovery | B107 new genuine alternate-link detour |
| --- | --- | --- |
| True human foot X/Z | **−0.045632 / 64.039604** | **−0.042259 / 64.122116** |
| Original near-human KCC rejected steps | **2** | **8** |
| Real native rejected ticks | **378, 382** | **377, 379, 397, 415, 433, 451, 469, 487** |
| Span from first to last rejected native tick | **4 ticks** | **110 ticks** |
| Event gaps | **4 ticks** | **2, 18, 18, 18, 18, 18, 18** |
| Longest truly contiguous rejected-tick streak | **1** (inferred from original two tick IDs) | **1** (new native counter) |
| Observed route | No alternate original link; 7/7 | Original `first-drop-positive-z-2`; 7/7 |
| Grounded source | [B105 original evidence #39760967523](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39760967523), `EARLY` archived JSON | [B107 original evidence #39765941538](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39765941538), `64.68` archived JSON |

**Critical interpretation:** Eight rejected steps in B107 **were not eight consecutive 60Hz ticks**. The pattern has a six-event series spaced at 18 ticks (300ms at 60Hz), consistent with the existing source-traffic program's `prepare(...)` real Recast destination refresh condition `frame % 18 === 1` in `src/app/UndertowF3SourceTraffic.ts`. Exact causality still needs a dedicated experiment; the robust factual distinction is **repeated periodic native physical movement rejection over an extended time span**, not continuous contact of 110 ticks. Never change the avoidance threshold just to force the historically safe direct recovery to detour.

Original KCC collider-owner literal class `REAL_PLAYER_OR_UNREGISTERED_DYNAMIC_ACTOR` is **not uniquely the human**; the recorded actual human foot within about 0.64m and the unchanged native collision veto support the accurate *human-proximate* description only.

## Build/regression and safety

- B107-specific CI steps completed syntax checks, existing **9/9 classifier regressions** and TypeScript/Vite build successfully before the real Chrome research gate failures.
- The app instrumentation commit also triggered broad existing QA workflows; at last follow-up most finished jobs succeeded, including frozen visual checks, B75 standard FIXED/SWEEP, B96 baseline and B99 left Chrome; B100 independently remains an expected unstable right-lane **input qualification** failure in its old workflow. Never assert all workflows PASS when that is untrue.
- Frozen authority remains **25 original solids, 17 paint surfaces, 26 original Recast NavLinks, 0 source scoreable promotions**; `activationReady=false`, unrestricted original 4v4 uncertified, default CPU FIXED unchanged, opt-in QA detour only. No main change, PR #5 (head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`) unchanged, no Pages deployment.

## W10-B108 next experiment

Avoid another expensive blind three-way KeyW Z grid when the six-tick Chrome input quantum dominates. Use the B107 captured **actual human X/Z** in early rejection to calibrate a **bounded real-keyboard lateral correction/side-key start-time gate** before parking; restrict all adjustments to actual key events and natural KCC motion. Repeat only qualified near-B105 X≈−0.046/Z≈64.040 cases, capturing exact first/last original KCC ticks and genuine direct-versus-detour recovery. Distinguish intentional direct 7/7 from blocked-but-unresolved, do not change original physical geometry or promote normal gameplay.
