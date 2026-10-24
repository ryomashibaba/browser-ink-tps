# W10-B163 — Repair the actual failed B162 cooperative source trial

**Date:** 2026-10-24 JST · QA branch `dev/t21-f4e103w-qa-infra` · source-only nonproduction.

## Real evidence / why B162 failed

B162 commit `b2511c3fc5f2f0d8a51c0243224c8d591962064b`, true native Chromium [Actions #40085554951](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40085554951), actually **FAILED**. The preserved failed-run [artifact ID 12557335449] stores `w10b162-real-ally-sync-practice.json`. The native browser successfully selected `ALLY_SYNC`, armed, entered `RUNNING` at tick 1467 and recorded a fresh zero A1 source aim / original impact baseline. The subsequent driver alternated forward and reverse CDP walking **AFTER** the previous B139 right-low descent route, where a narrow original stage edge was involved.

Actual 3 physical post-arm samples:
- segment 1 native tick 1515, body Y **3.825**, human impact ink **0**, grounded travel **2.64m**, A1 tagged impact ink **0**;
- segment 2 tick 1569, body Y **−7.789**, human ink **0**, grounded distance **2.72m**;
- segment 3 tick 1623, body Y **−29.389**, human ink **0**, grounded distance **2.72m**.

Original frozen source/CI guardian correctly stopped further trial with `B140_SOURCE_AUTHORITY_OR_MODE` once the game entered a nonactive/invalid state after falling. It is **NOT** evidence that genuine A1 source aim is broken: the separate actual B139 ALLY_RALLY run at the exact same commit had **6 native original B152 A1 source projectile impacts and 175 changed impact cells**, and its seven CPU / independent QA CI finished PASS [#40085554884](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40085554884).

## B163 focused implementation

- Change **only** the dedicated B162 explicit native-cooperative CDP execution path in existing `scripts/t21-w10b139-original-native-descent-rally.mjs` to arm `ALLY_SYNC` on the original upper source platform **after seven CPU real native physical rejoins but BEFORE descending**. This prevents using the original right-low narrow edge as a W/S shooting track.
- Drive the already independently proven, genuine upper-ground **B54 real Chrome** aiming + native W/S alternate/physical shot program (up to 18 × 34 simulation ticks) to collect the **actual original human 180 changed impact cells and 12m grounded Rapier/KCC movement**; preserve real per-segment foot XYZ, human and A1 counters and native A1 impact event values. No fake ink or movement. Finish complete W/S pairs before leaving this original supported ground.
- Once human criteria are genuinely observed, physically move through the previously established original B139 source route `W200 / D12 / W18 / A12 / coast60`, using the same CDP original W, D, A keys, so the real human KCC can reach the vicinity of the original source A1 ally. Native A1 source aim can then yield real additional tagged physical projectile / registered original impact / PaintCoordinator changed cells.
- Wait for delayed real A1 event counters **within the existing 60 native second exercise window**, with explicit HOLD if any human criterion, real tagged A1 paint or game state still fails. `ALLY_SYNC` CLEAR is never asserted from separate unrelated A1 runs or historical baseline ink; its own real B25 state and real on-page card must say CLEAR.
- Reuse exactly the same existing B162 one-job Chromium Action and the separate unchanged three-variant B139 real original physics regression. Do not create a duplicate parallel browser workflow; path trigger on existing B162 source file is already in place.

## Safety and evidence gates

Formal original four-versus-four remains **HOLD**. Original stage 25 original Rapier solids / 17 paintable / 26 offmesh links / 0 Scoreable; opposing natural paths 0/12. No new geometry, CPU behavior changes, source links, synthetic time, cursor movement in place of physical KCC, relabelled Turf score or unstated success. A real 7CPU external B139 pass is a baseline, not B163 co-op CLEAR proof.

**Result to establish:** native exact-SHA B162/163 workflow must produce `B162_NATIVE_60HZ_GENUINE_COOPERATIVE_CLEAR` in the actual preserved JSON and PASS CI, with human changed impact cells ≥180, actual human grounded travel ≥12m, and A1 fresh impact changed cells ≥30. If this still fails, use the preserved real evidence to diagnose the next specific obstacle, without lying about a successful playthrough.

