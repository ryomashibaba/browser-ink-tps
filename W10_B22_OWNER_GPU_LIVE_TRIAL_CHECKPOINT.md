# Browser Ink TPS — W10-B22 Owner Live GPU Trial Checkpoint

**Date:** 2026-10-18 JST  
**B21 parent QA HEAD:** `4aa35d1e501420789cfb2ec207e955c3df7092b5`  
**Actually tested code HEAD:** `65f30491a295c3dc52980f27a55512271fd83ce8`  
**Branch:** `dev/t21-f4e103w-qa-infra`; this is NOT production or T21 original-match release.

## Outcome: actual code and workflow implemented

1. Added pure source-preview-only `UndertowF3OwnerGpuTrial` for real human play: **NATIVE A (12s) → PERFORMANCE 75% B (12s) → NATIVE A2 (12s)**. The first 2s of each phase are excluded as warmup; each phase requires at least 20 actual render update callback intervals. Includes p50/p95/p99, >50ms/250ms callback counts, CPU source paint impacts, real shots, genuine fixed ticks, real CPU patrol, canvas backing dimensions and unobstructed/blocked camera observations. The comparison is **exploratory** because user inputs/CPU positions vary; no causal FPS/GPU-speed claim.
2. Added visible **START LIVE GPU TRIAL** and **SAVE LOCAL QA JSON** controls to opt-in F3 practice ONLY. The user starts before pointer lock; the trial automatically samples while actual mouse-locked gameplay runs. User loss of lock, pause, interrupted 12s phase, stage-authority drift or canvas resize causes fail-closed **ABORT** and restoration to native. Native restored on successful completion, too.
3. JSON is generated/downloaded ONLY after explicit user SAVE click. No network upload, telemetry service, source asset transfer, automatic screenshot upload, or production stage changes. Embedded report explicitly marks scoreability `0`, `productionAuthorized=false`, 4v4 not certified and browser frame intervals **not** real GPU execution or end-to-end input latency.
4. Added `RUN_T21_W10B22_OWNER_GPU_ONCE.cmd` in QA branch root. From an up-to-date local branch working folder on Windows, double click to run local Vite browser preview; dependencies are installed only if needed. It serves `127.0.0.1:5173/?t21Play=preview` and requires user to opt in to 36s trial. No user-system GPU stats are claimed until an actual owner's RTX run has been performed.

## Verification

**Current B22 tested code SHA `65f30491a295`**

- [W10-B21/B22 real Chrome WebGL2 stage frozen A/B/A and actual pointer-lock B22 safe-abort](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39136640168) **SUCCESS**. Log: `T21_W10B22_REAL_CHROME_POINTER_TRIAL_SAFE_ABORT_PASS`: genuine DOM click arm, actual pointer lock, real update loop, unlock → native, no unauthorized original source. No 36s owner GPU measurement is inferred. Also confirms NATIVE image SHA256 identical before/after B21 staged comparison, source 25/17/26/0.
- [B15/B16/B18/B19/B20 integrated Chrome](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39136640173) **SUCCESS**: 7 original CPU, 87 native paint shots, 92 impacts, 11,057 source-ink changed cells, ~702.41 m CPU original-source patrol. **0/12 native opposing-team paths**; original 4v4 still HOLD.
- [B14 real Chrome CPU splat and respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39136640204) **SUCCESS**.
- B22 trial state machine Vitest in both integrated and A/B/A lanes: **4/4 PASS**. Test covers actual time-sequenced A/B/A + resolution, pointer unlock cleanup, scoreable authority fail-closed, and slow >250ms frames.
- [Ubuntu + Windows source QA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39136199089) **SUCCESS** at the immediately earlier B22 UI code HEAD `695e0e1f01ec`. Later code changes are confined to independent B22 trial state logic, Chrome script, launcher, workflow, test and checkpoint. **Not** owner Windows GPU evidence.
- Owner RTX 5080 Laptop with actual hardware acceleration: **not run / not certified**.

## Owner Windows test steps (optional; no action taken remotely)
- Use the up-to-date `dev/t21-f4e103w-qa-infra` source checkout.
- Double-click `RUN_T21_W10B22_OWNER_GPU_ONCE.cmd`; local browser F3 source-only preview opens.
- Click **START LIVE GPU TRIAL**, click game scene to capture mouse pointer, and play naturally through the **36-second** cycle. Releasing Esc or pausing intentionally invalidates the trial. At completion click **SAVE LOCAL QA JSON** and optionally share `T21_W10B22_OWNER_REAL_GPU_TRIAL.json` in chat. No screenshot/manual result copying is necessary.
- The local file may include user agent (browser/OS) and effective DPR as part of the explicit JSON export. No automatic upload.

## Original source / hard HOLD status

- **Immutable:** 25 audited original physics solids, 17 paintable non-scoreable original surfaces, 26 original navigation links, ZERO official scoring faces, `activationReady=false`.
- Full original `Vss_Temple01` Banc/SetActor actor placement is unproven, central/underpass genuine foot connectivity missing. Opposing-team authentic-foot paths are **0/12**; `natural4v4Certified=false`.
- Never replace missing source proof with invented geometry, synthetic routes, teleport, field masks, actor transform guesses or original-texture placement on collision.
- Preserve T19C/T20 frozen game, main, Draft PR #5, official deployment and nonpublic original sources. All B22 changes are isolated in QA branch.

## W10-B23 next direction

If actual owner local GPU JSON is supplied, assess NATIVE vs 75% empirically with inter-A variations and controlled caveats; prefer NATIVE if results do not justify lower visual quality. Otherwise do not request repeated costly Windows/ZIP QA without a meaningful change. Prioritize source-authentic macro geometry and Banc/SetActor placements if primary evidence becomes accessible; maintain 0/12 HOLD until then. Continue improving a compelling original-source non-scoring practice experience only with behavior/visual-quality changes supported by genuine render/input evidence.

**Process audit:** Chat/GitHub first, no Work; actual QA branch commits and browser evidence; no production/site changes, no owner local machine changes.
