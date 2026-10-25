# W10-B188 — Real source-local circuit replay without fake pose reset

2026-10-25 JST. Baseline QA branch `dev/t21-f4e103w-qa-infra`, HEAD `ea37eed15cdd4ebc783ffd8097cac6ebc986cd83`.

## Actual B187 evidence status
At B188 intake B187 one-session native Chromium run `40166552340` is **QUEUED**, no completed source-live result, logs or native full-circuit PASS. B184 and B186 prior WebGL2 runs were also queued. Prior genuine original B123 Chrome [39910040914](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39910040914) established only the W200+D12+W18+D90 real original upper→lower→original ramp→raised source. B182 source ink proved true CPU/human paint but not B186 same-run practice CLEAR. Do not infer a PASS from static test code or prior separate successes.

## Concrete user-facing B188 game-lifecycle defect
The original first-drop course is physically one-way and the B183/B186 witnesses correctly fail closed when input/source continuity cannot be proven. However, once B186 enters `INVALID_SOURCE_WITNESS`, `observe()` returns permanently; a subsequent genuine native 150-tick human respawn still cannot retry the B186 stage. A human who completes or aborts the physical one-way source-local circuit also has no direct retry button within the current opt-in practice. This is a **real usability/soft-lock bug**, not a geometry gap or request for a new fake route.

## B188 implementation
- In the same existing source-only practice control panel, replace the old one-time **PLAY ORIGINAL UPPER → LOWER DESCENT** button with a context-aware **PLAY ORIGINAL DESCENT → RAMP → INK** / **RETRY ORIGINAL DESCENT → RAMP → INK (NEW PHYSICAL SESSION)** control.
- Retry is deliberately a *user-initiated page navigation to the existing source opt-in query*, restarting the original PlayCanvas/Rapier/Recast seven CPU and human simulation from the existing registered spawn. The new UI element records explicit source-only/no-score/no-teleport/no-fake-tick DOM attributes. No new stage / human teleport / QA tick injection / regenerated ink / local fake full-map pass. For pointer-locked practice, release lock with **Esc** to click restart.
- Add `B186RealOriginalSourceCircuit.resetForActualNativeHumanRespawn()` and invoke it **only** from the existing real human 150-fix-tick splat/respawn lifecycle, adjacent to B183's already existing actual respawn reset. Reset the true prior-life lower/ramp/raised/grounded-travel/new-ink quota/witness failure, so progress is never inherited and a new actual-life session can arm only after its own new physical source lower landing.
- Extend `B186RealOriginalSourceCircuit.test.ts` with a terminal invalid-frame → actual-native-respawn reset case and a no-prior-life-physical-progress case. This is focused regression, not verification of in-browser success.
- Reuse B187's **existing single real browser runner**, without a new workflow: check B188's actual DOM retry button is visible and declares `sourceOnly=true`, `scoreablePromotions=0`, `retryActorTeleport=false`, `retryNativeTickInjection=false` before starting the normal real navigation sequence. Genuine click/restart still warrants user hands-on QA; a visible button alone is not proof a retry physically succeeded.

## Verification and true limit
Only code changes / GitHub commit are certified here. B187/B188 exact-SHA unit/build/WebGL2/original native KCC checks are **PENDING** until GitHub Actions actually run. If the CI remains queued, do NOT mark native source-local player circuit clear or functional repeat verified. The practical next highest priority after these native results: real original source underpass KCC/Recast connectivity and opponent combat, rather than new overlays, B-numbered telemetry or hypothetical colliders.

## Permanent protected original authority
25 registered source Rapier solids / 17 source paint surfaces / 26 source links / **0 scoreable**; original opposite-team access **0/12**. `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`; complete original Turf War remains HOLD. Do not touch protected `main`, published Pages, T19C/T20 foundation, private Nintendo assets or Draft PR #5; no release or winner.
