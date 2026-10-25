# Browser Ink TPS W10-B192 — Original-source real combat gameplay mode

2026-10-25 JST. This is **code implementation, not yet native-Chrome PASS**.

## Actual results reviewed
- B187 original-source real-Chrome run [40166552340](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40166552340) ended FAIL with 480000ms native-start timeout and no saved artifact. B188 [40167192991](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40167192991) likewise timed out after the real retry button was visible. Both completed unit/build preflights.
- B189 repaired missing source traffic fields in the native CPU start gate. B190/B191 Chrome runs are still queued. Their success cannot be inferred and no new duplicate B120 workflow is added here.

## Completed software changes
- Existing source-only human session has selectable **REAL SOURCE COMBAT** mode via a user action that restarts the actual physics session. Default FIXED source paint patrol and T19C/T20 gameplay unchanged. Existing descent retry preserves the selected mode.
- In that mode reuse B181/B182 real original Rapier stage-ray opponent cover and living native target refresh before the standard projectile/HP pipeline. No fake targets, fake CPU feet, synthetic hits or original map changes.
- Native B-team CPU can seek the real Team A HUMAN foot only if the human actually already stands on the same original B-side physical floor, 7 source CPUs rejoined, true same-tick source Rapier input valid, same elevation/distance in bounds, both original Rapier floor supports and the complete real Recast/native source-supported intermediate route pass. Otherwise the existing verified patrol continues. CPU real motion is still subject to the original KCC/actor collision authority.
- Small focused pure eligibility tests; preexisting global CI is reused, no new workflow.

## Acceptance boundary
Real original cross-team paths remain 0/12. Authored original 25 Rapier solids / 17 PaintSurfaces / 26 links / 0 Scoreable unchanged, activationReady=false, productionAuthorized=false, unrestricted4v4Certified=false. A mode button, goal or source-ray is not actual enemy hit / naturally playable 4v4 / official score. This batch requires exact-SHA TypeScript/test/Chrome and native 60Hz interaction evidence before actual playable combat can be called PASS. Do not edit main/T19C/T20/Pages/PR5/private source.
