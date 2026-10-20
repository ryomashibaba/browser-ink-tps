# W10-B53 — Actual source paint run dual-objective gameplay feedback

The existing 60-native-second B25 optional source paint run was a small bottom-right paragraph: it did not visually separate the two *required* actions. B53 adds **two readable independent progress bars** in the actual in-game challenge card: genuine human projectile impact-changed cells / 180 and genuine Rapier original-floor grounded travel / 12m. It displays the current lagging objective and authoritative run status, preserving native 60Hz countdown, real source paint and original ground physics. Genuine pointer unlock/abort remains visible and retryable. No official Turf score, no source geometry, no AI or actor modifications, no false win. Source 25/17/26/0, opposing routes 0/12, activationReady=false.

The existing B21 real Chromium pointer-locked owner-trial + B25 practice flow checks actual click ARM (both zero), real KeyW grounded movement produces positive ground bar with paint still zero, and real Esc abort displays retry. Pure Vitest checks thresholds, completion, time-up, abort, nonfinite values and authority drift. **This does not claim human clear or owner Windows RTX gameplay.**

CI verification pending.

## Verified final implementation — 2026-10-20 JST

**Actual tested code SHA: `d8a6a822db7eb461f3d27f4e07af8d8b9a16d09d`**, all **8/8 GitHub check runs SUCCESS**:
- [Original B21 source render A-B-A + real pointer-locked B25/B53 practice](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39386064487): SUCCESS. **34/34 Vitest assertions PASS** in 7 files including new pure objective tests. Actual Chrome original source A-B-A reversibility PASS. Actual genuine click ARM -> real pointer lock -> KeyW real Rapier original ground **2.12m observed**, DOM **13% most recently rendered grounded bar** (display updates periodically, so DOM may lag the live snapshot), **0% painted**, suggested NEXT PAINT, no official scoring. Genuine pointer unlock abort -> retry visible. No false claim of a human 180-cell+12m clear.
- [Real trusted Chrome input and 7 CPU fixed patrol + B35 research regression](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39386064608): SUCCESS.
- [Original pinned full-source visual](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39386064721): SUCCESS.
- [Actual original source CPU render/respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39386064703): SUCCESS.
- [Exact native 38 vs 42 KeyS original physical experiment](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39386064719): both jobs SUCCESS as **experiment execution**; the 38-tick physical clearance outcome remains FAIL, as previously proven, and is not rewritten.
- [Ubuntu/Windows launcher](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39386064469): SUCCESS.

**Initial B53 code `1b969373` failed the new real Chrome armed-UI assertion** because the existing click handler did not refresh the progress UI until a later WebGL frame. The final `d8a6a822db7eb461f3d27f4e07af8d8b9a16d09d` synchronously calls `refreshB25PaintRun()` when the genuine button is clicked. Final B21 test PASS confirms correction.

**Decision: W10-B53 PASS** for player-visible, non-scoring, dual-objective source practice feedback and actual original-floor movement evidence. **HOLD** for full original stage actor placement, central connectivity, true original 4v4, official scoreable mask and actual owner Windows RTX gameplay. Source 25/17/26/0, 0/12 original opponent paths, activationReady=false; fixed CPU and protected main/PR5/Pages unchanged.

Next B54: prioritize meaningful player-facing source-local engagement or authenticated original Banc/SetActor instance evidence if available; avoid repeated diagnostic microfeatures or false source promotion.
