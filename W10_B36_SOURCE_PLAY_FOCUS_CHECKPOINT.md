# Browser Ink TPS — W10-B36 Source Practice Sightline / Play Focus Checkpoint

**Date:** 2026-10-19 JST  
**Parent QA HEAD:** `7d245741cea78b614c3a14f8770582e3df962730` (B35)  
**Gameplay implementation commit:** `c7b44cdac7cb0a42fbfb50ddff187b588ad43b0d`  
**Real Chrome witness commit:** `40f9acdf82f26ebe56c05cdfded425a2baaf532d`  
**Chrome workflow commit:** `6cfbdd77cef1b9f65b60baf4ab120caee0910326`  
**Scope:** QA branch `dev/t21-f4e103w-qa-infra` only; no production, main, or Draft PR #5 change.

## Motivation and concrete shipped behavior

B31–B35 source-only CPU goal experiments did not beat proven fixed patrol in actual aligned Chrome simulation. B35 technically suppressed 511 duplicate native Recast requests but reduced genuine changed ink to 1124/1407 (79.89%) and accepted source-paint shots to 16/21 (76.19%). **Normal T21 retains fixed patrol.** Further ungrounded CPU retargeting is not the objective.

W10-B36 addresses a concrete, existing, player-visible issue in the authorized playable slice instead. The developer/source review panel (330px wide, top-left) and original stage survey button (bottom-left) cover the live TPS scene, even though neither can be clicked while pointer-locked. The non-scoring paint-run START button also occupies screen space during regular FPS play if no challenge was armed. The original camera-block warning at vertical center +34px competes with the true ink-impact marker at center +29px.

- For **normal nonproduction** `?t21Play=preview`, genuine canvas Pointer Lock hides the large developer panel, survey button, and unarmed paint-run card, retaining crosshair, vitals, source radar, and actual active paint-run progression. The real pointer-lock release automatically restores controls.
- Owner B22 native/75%/native GPU trial still displays its progress/control panel while armed or running: no silent hiding of required measurement UI.
- Deterministic source QA (`t21QaDrive=source`) keeps the prior DOM visibility baseline by default. Only `&t21W10B36=playFocus` opts that QA route into the feature so actual Chrome can validate it without contaminating old A/B baselines.
- The original-collision camera obstruction warning is moved from center +34px to center +72px, away from the original ink impact confirmation around center +29px. There is no camera ray, occlusion logic, input, movement, combat or ink change.
- The existing trusted real Chrome `T21_W10B15_TRUSTED_INPUT` run now sets `T21_W10B36_FOCUS=1`, uses **real** Chrome `pointerlockchange`, and fails if the focus panel/survey/idle card do not hide, if the HUD/aim crosshair are lost, if original scoring authority drifts, or if unlocked controls fail to return. It continues native real quick-tap, CPU hit/splat/respawn and same 1800–2880-tick source benchmark.

## Evidence level

- Implementation diff is UI and read-only presentation only; protected source physics and CPU modules were not edited.
- [W10-B36 actual trusted Chrome run](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39237624388): the build, B17 HUD unit, source AI ranking unit, script syntax, real trusted Chrome pointer-locked input/CPU splat/respawn, and source CPU visible pixel-diff steps succeeded during checkpoint authoring. Its entire workflow, including expensive B35 baseline research comparison, had **not yet been confirmed complete** at initial checkpoint authoring; check the run for final outcome.
- Prior [B14 source CPU render lifecycle](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39237450754) completed SUCCESS on implementation commit `c7b44cda`. This is real Chrome automation, not owner's RTX live test.
- **Not certified:** subjective improvement in gameplay by a person, actual full 4v4, original stage instance placement, owner Windows performance, official Turf winner, or a new authentic physical connection. The source stage remains a limited practice environment.

## Immutable original-source authority

- **25 certified original physical solids / 17 certified original paintable but UNSCORED surfaces / 26 native Nav links / 0 official scoreable surfaces**.
- **0/12** physically proved opposing-team native routes in current frozen partial source setup; `activationReady=false`.
- Verified original static optical mesh may be visible but must not gain gameplay collider/nav/score authority.
- Private `Vss_Temple01` Banc/SetActor identity, transforms, active layers and underpass topology remain missing/HOLD. No private originals uploaded; no fake bridge, actor placement, warp, spawn, score surface or match winner.
- `main`, production hosted T20, Draft PR #5, and Windows source originals unchanged.

## Next high-leverage dependency

Seek lawful, locally inspected original Banc/SetActor provenance and correct actor-mesh transform/layer evidence. Without that, retain the source physical HOLD and prioritize an actual human evaluation of this bounded physical practice slice rather than adding further low-yield CPU goal heuristics or diagnostic dashboards. Do not promote B36 UI polish into a claim that 4v4 normal Turf now works.

## Efficiency note

Development stayed in Chat with direct QA-branch GitHub edits; no Work handoff, local user PC manipulation, ZIP distribution or production deployment. Existing Chrome workflow was reused; multiple intermediate push-triggered CI runs occurred during the three-step commit series, which should be consolidated for efficiency in future batches.
