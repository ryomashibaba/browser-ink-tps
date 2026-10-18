# Browser Ink TPS — W10-B23 Authentic Human Ink Contact Feedback

**Date:** 2026-10-19 JST  
**Parent QA:** `bcb2096dcba9a96a603a8b71b18be6aec75eff5b` (W10-B22).  
**Exactly verified tested code HEAD:** `0840ac61f2354dc301136f670dd587a05c021df4`.  
**Branch:** `dev/t21-f4e103w-qa-infra` ONLY. No production or T21 promotion.

## Real user-facing improvement

Opt-in, explicitly nonproduction F3 Undertow source-practice provides a small, 0.45-second in-aim `INK CONTACT · +N cells` confirmation **ONLY** after an authoritative PaintCoordinator event:

- `event.source===PaintSource.Human`;
- `event.type===PaintEventType.Impact` or `WallImpact`;
- `GameplayInkSystem.apply(event).changedCells > 0`.

The feedback does **not** infer a hit from pressing mouse, from projectile existence, from an unpainted/non-scoreable physics surface, CPU ink, human footprints, enemy damage, or render pixels. Same-60Hz-tick multiple impacts aggregate only the genuine changed cell counts. The display, real physical source, and renderer aren't modified; the indicator is HUD only. Code uses an optional **read-only post-authoritative observation callback** on PaintCoordinator, default absent for all existing T20/gameplay routes. The new F3 observer does not affect the immutable PaintEvent, GPU atlas submission, ink rasterization, projectile collision, simulation step, or score.

Developer telemetry also shows cumulative human changed original impact count and changed cells, explicitly labeled **UNSCORED**. A genuine source confirmation is visually distinct from an enemy hit marker or official Turf points.

## Verified actual browser evidence — SOURCE ONLY

1. [Integrated B15/B16/B18/B19/B20+B23 real Chrome](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39167138894): **SUCCESS**, code SHA `0840ac61f235`.
   - `T21_W10B23_NATIVE_HUMAN_INK_PROVENANCE`: **10 accepted real human shots**, **6 real human-authoritative changed impact events**, **115 changed ink cells**. Independent from CPU paint and never scored.
   - CPU 7 original-foot actors: 87 real source turf shots, 92 native ink impacts, 11,054 changed source cells, 700.95m of genuine source-local patrol. Physical cross-team enemy routes **0/12**: `HOLD_NO_CROSS_TEAM_NATIVE_FOOT_PATH` (98.75m reported gap).
   - B20 persistent GPU atlas source-only: 18 brush frames, 66 idle frames, camera suspended correctly; no unrelated functionality was replaced.
2. [B14 real Chrome native CPU render/splat/respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39167139005): **SUCCESS**, code SHA `0840ac61f235`.
3. [B21/B22 real Chrome source frozen A/B/A, owner pointer abort and B23 unit suites](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39167138876): **SUCCESS**, code SHA `0840ac61f235`.
   - Vitest: 7/7 (4 B22 trial, **3 B23 real-human ink provenance**) passing.
   - B21 native screenshot comparison identical on return; B22 real browser start, genuine pointer lock, safe aborted trial and restored native.
4. [Ubuntu and Windows QA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39167003889): **SUCCESS at intermediate code `63e1725c`**, includes new HUD and optional PaintCoordinator observation but before browser-script and B23 workflow-only changes. Not owner's RTX live device.

## Frozen authority / HOLDs

**25 source-original physics solids, 17 paintable but NON-scoreable surfaces, 26 certified native navigation links, 0 scoreable, `activationReady=false`.** No fabricated stage geometry, bridge, scored turf, guessed Banc/SetActor actor placement, native opposing-team path, warp, CPU replacement, special gauge fakes in normal play or early original Turf winner.

Original source assets remain local/nonpublic. T19C/T20/main, Draft PR #5 and production site unchanged. B22 owner device 36s GPU A/B/A JSON remains **not supplied**, so no owner-device FPS, subjective visual-quality or speedup certification.

## W10-B24 next direction

The central blocker is **source-authentic macro stage and certified original Actor/Banc placement**, not additional synthetic CI navigation ablations. If new rights-cleared, original placement evidence is available in the owner's local Windows source set, prioritize source provenance intake and correct transformative world placement; otherwise do not guess, fake or broaden coverage. When touching playable source-only UX, prioritize major human playability and stage visual readability with verifiable behavior, not technical-demo proliferation; do not repeat 0/12 route probes without new evidence.

**Quality/plan/efficiency audit:** actual user-facing playable feedback delivered and validated in one reused integrated actual-Chrome pass plus small fast unit suite; no Work, owner desktop modification, private source upload or main/PR merge.
