# B261 real WebGL2 render-pass verdict / B262 constrained follow-up

Date: 2026-10-28 JST. QA only. Never promote to ART PASS or production.

## Evidence
- Exact reviewed HEAD `f5adaf9df9aaa513f98bf23358fb54c66140c7dc`.
- Genuine pinned F3G [run 40618939967](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40618939967): SUCCESS, artifact `12787366247`, ~62.6MB.
- B75 [run 40618939920](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40618939920): preflight B131/B173 + real FIXED/SWEEP SUCCESS. B210 180s [40618939946](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40618939946): SUCCESS. These remain QA, not original 4v4 certification.
- B261 genuine FROZEN (tick 110) and REAL_INK (tick 327) both `B261_REAL_WEBGL2_RENDER_PASS_AUDIT_PASS`. Original `Fld_Temple01_Glass01` = normal blended / depthTest true / depthWrite false / World layer 0 / bucket 127. Seventeen real PaintSurfaces = opaque / depthTest true / depthWrite true / same World 0 / bucket 127. World opaqueSortMode=2, transparentSortMode=3 (back-to-front).
- **BUCKET_ONLY_HYPOTHESIS_REJECTED**: moving the optical glass drawBucket within the existing transparent subpass cannot move it ahead of opaque paint. No draw state was changed. Source invariants 57,578 original UV, 19 textures, 25 solids / 17 actual paint / 26 NavLinks / 0 scoring.
- Genuine screenshot inspection: left-side QA panel, upper HUD, radar and session panel occupy appreciable screen area, separate from foreground optical GLASS/DETAIL geometry. Central gray/occluded foreground persists; no ink-visibility or aesthetic certification.

**B261 TECH PASS (read-only actual render pass classification) / ART HOLD.** This is a negative finding and rules out one ineffective adjustment; not an art improvement.

## Narrow B262 hypothesis (diagnostic only)
H: A reversible, compact *existing diagnostic interface* restores useful left-viewport visibility independently of optical source geometry. Verify A->B->A under frozen source tick and after genuine 115+ paint cells, same camera/player and unchanged source. Keep a small accessible 'QA PANEL' reopen tab. Confirm optical foreground still unchanged: recovered DOM pixels are **not** certified ink/paintable visibility. Measure lower/left ROI and full-screen raster independently. The source visual architecture remains unchanged.

Use only strict B261 paused STAGING gate, no pointer-lock, full round, production or score, new geometry, mesh sorting, stage collision, paint, nav or actor changes. Never hide physical HUD or source paint and never accept default UI changes from a diagnostic. On any failure or non-restored frame: ART HOLD.
