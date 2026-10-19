# Browser Ink TPS — W10-B40 source-local human bomb condition measurements

**Date:** 2026-10-19 JST
**Scope:** QA branch `dev/t21-f4e103w-qa-infra` ONLY.
**Implementation SHA:** `f4be722c9cf51361115fb61f9e7a2b95f68d2368`.
**Verification status:** **PENDING — NOT CERTIFIED**. Never infer a CI PASS from a commit or an empty combined-status API response.

## Why

B39 demonstrated **one genuine KeyF throw**, **one explosion**, and **830 post-GameplayInk ownership-changed cells** on an existing verified source paintable. It did not test other trajectories or a second bomb over previously painted ink.

## New B40 measurement path (no new gameplay geometry)

The existing trusted-input WebGL2 Chrome smoke script continues to gate its first B39 throw. The same native source QA scene then:

1. Waits for the real `PlayerResources` fixed-tick ink recovery, with no manual fill.
2. Delivers another browser `KeyF` press and release while genuinely pointer-locked, **without changing camera yaw/pitch**, and measures independently how many Bomb stamps/events/changed cells follow from `GameplayInkSystem.apply()`. The player foot and camera state are recorded so a repeat-position claim is not assumed.
3. Waits for genuine ink recovery, delivers CDP mouse movement while pointer-locked, checks that actual camera pitch changed by at least 5 degrees, then makes a third real `KeyF` throw through native physics and records its authoritative changed-cell delta.
4. Preserves a zero-change bomb as **observed failure to gain ink ownership**, not as positive paint or Turf score. Produces `w10b40-real-bomb-conditions.json` and `T21_W10B40_NATIVE_BOMB_CONDITIONS_OBSERVED` in job logs when complete.

The measurement covers **B39 baseline + repeated direction + changed pitch**. It does **not** yet certify close/far floor cases, wall contact, paint-edge contact, or broad statistical balance. Those need authentic source geometry and actual observed contact witnesses; labels alone cannot certify a hit.

## Required CI evidence and gates

The branch `push` path filter includes `scripts/t21-f3-browser-smoke.mjs`, so the trusted-input workflow is configured to run on the implementation commit:

https://github.com/ryomashibaba/browser-ink-tps/actions/workflows/t21-w10b15-trusted-input.yml

Before any PASS claim, inspect the **actual** job conclusion and `T21_W10B40_NATIVE_BOMB_CONDITIONS_OBSERVED` JSON at the implementation SHA above. Also inspect `node --check`, build, and regression steps. If the job fails, keep B40 **FAIL/HOLD** and fix the real failure without faking actor placement or ink.

## Source authority (unchanged by this QA script)

- Certified original physics: **25**; original paintable: **17**; original NavLinks: **26**; official scoreable: **0**.
- Observed native opposing-team routes: **0/12**; `activationReady=false`.
- `GameplayInkSystem` CPU ownership remains the only gameplay truth. `PaintCoordinator` is the normal event path.
- Default patrol **FIXED**. Optional B31–B35 research remains isolated.
- Authentic Banc/SetActor transforms, underpass and official score masks remain **HOLD / UNKNOWN**.
- No player/CPU fake teleport, imaginary floor, unverified collision/nav or private actor placement.
- No production activation, Pages deployment, main, Draft PR #5 or Windows owner-original edits.
- No owner's real RTX FPS or unrestricted 4v4 claim.

## Next decision after checking the actual CI

- If the two additional bomb trajectories completed, report measured **per-throw** changed cells, event counts, camera delta, physical tick span, foot stability, and explicit zero-change outcomes; then prioritize the most meaningful real paint-quality issue.
- If the script failed, distinguish a browser input/QA fixture failure from an actual game physics or ink failure. Do not mark the test passed.
- For wall/edge/near/far, only add specific cases when their original certified physical contact can be independently witnessed. Preserve honest HOLD elsewhere.
