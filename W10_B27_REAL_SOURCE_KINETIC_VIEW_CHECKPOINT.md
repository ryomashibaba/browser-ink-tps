# Browser Ink TPS — W10-B27 Source-Authentic Kinetic View

**Date:** 2026-10-19 JST
**Parent B26 QA HEAD:** `3be0f8037789d411cdca8693b9737ffaeaaaa218`
**Final tested B27 code HEAD:** `9a7abc6d6b3eb79299e53c5db8f447b079fa324c`
**Branch:** `dev/t21-f4e103w-qa-infra` only. T20, main, Draft PR #5, frozen staging, production website and private original assets remain untouched.

## User-visible change: actual physical speed → small responsive lens

The real Undertow F3 `?t21Play=preview` source-only game now has restrained kinetic depth/dynamism: camera FOV is **63° at rest to max 69° at high continuous original-ground speed**. This is not a new combat mechanic, movement buff, shortcut, artificial ink scoring or debug-only overlay. No extra postprocess/render passes.

- `src/camera/UndertowF3KineticView.ts` accepts only **consecutive genuine 60Hz Rapier player-foot measurements** at original-certified physical stage, requiring `grounded` and alive.
- Horizontal displacement exceeding `0.36m/tick`, vertical displacement exceeding `0.30m/tick`, airborne/jump/fall, dead actor, invalid vectors, reset/tick gaps, or absent immutable 25/17/26 authority never earn camera speed.
- Real ground speed ramps FOV using a continuous smoothstep from **1.25m/s to 7.5m/s**. Lens response is smoothed in real **render-time delta** with faster return to 63°; max/min are hard-clamped. User input, weapon aim assist, projectile collision, CPU NavMesh, paint and official Turf points are not modified.
- **Pointer unlock and app pause** restore 63° and clear the movement sample; the B22 real owner GPU A/B/A trial is always evaluated at the unchanged 63° lens. No visual movement enhancement during deterministic B18/B19/B20 source QA unless `t21W10B27=kinetic` is explicit, preserving the previously certified baseline. T20 shared camera is unchanged.
- The only live-game integration is the F3 nonproduction app. Diagnostic report `b27KineticSourceView` shows genuine observed native ground speed, actual visual lens FOV and source-only/non-authoritative labels.

## Actual Chrome and CI evidence

1. [**W10-B27 final real WebGL2 Chrome A/B/A + true W-key motion + strict unit suite**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39182356690) — **SUCCESS** at `9a7abc6d6b3e`. TypeScript build PASS; **5 suites, 21/21 tests PASS** (B22/B23/B25/B26/B27). Browser used actual Chrome pointer lock, real keyboard `W`, actual native Rapier/Crowd ticks; measured **2.12m human actual movement**, **46 genuine continuous grounded source-ticks**, visual camera **66.876° FOV** (from 63°), no source stage geometry/score changes. Real mouse unlock returns **63°**. Camera B26 manual Q priority, native B21 full-resolution A/B/A, B22 owner preview safe abort and B25 practice arm/abort continue PASS.
2. [**Real Chromium seven CPU integrated source patrol + human shooting**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39182238338) — **SUCCESS** on the same B27 camera/gameplay source (only unit-workflow/test metadata changed later). Source-local native-foot 7CPU patrol **671.38m**, **86** original turf shots, **90** actual impacts, **11,013** changed ink cells. Still **0 of 12** real cross-team paths: HOLD. No fake CPU battle claim.
3. [**B14 real Chromium native CPU splat/respawn**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39182238349) — **SUCCESS** at the B27 camera/gameplay code HEAD.
4. [**Ubuntu and Windows source QA**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39182155209) — **SUCCESS** at implementation HEAD `a453b1685f33`, which includes all B27 runtime integration/visual reset. Later commits modify only source browser smoke, isolated test and reused CI workflow. **Not** a real RTX laptop performance/UX trial.

An earlier B27 workflow failed **a unit test report key typo** (`originalTurfScore` vs the module's explicit `officialTurfScore`). This was corrected; final identical runtime built and real-Chrome tested successfully. No evidence of a runtime crash from that failed interim test.

**Interpretation limits:** Browser evidence proves real physical movement changed the renderer lens, not improved subjective fun or owner RTX FPS. Fixed tick movement remains independent of nominal browser callback rate. No memory of actor locations/source archive bytes is imported from any private file.

## Immutable original source / hard HOLD

- **25 authentic solids, 17 paintable but non-scoreable source surfaces, 26 original NavLinks, 0 certified official scoreable, `activationReady=false`**.
- Actual original `Vss_Temple01` Banc/SetActor placement and central/underpass physical crossing remain unproven; opponent natural-foot routes **0/12**. Do NOT add synthetic bridge/route/Actor placement, score mask, winner, or grant the B25 practice event real Turf winner authority.
- Original T19C/T20 Freeze and main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`, separate Draft PR #5 `8cfc95756ef0b56e2c33dc9f89a9041126daa272` stay unchanged.

## Next: W10-B28

Prioritize genuine **macro source-stage optical fidelity** (correct original geometry, texture/occlusion/depth, grounded visibility), not ever-growing practice HUD/tests. If private evidence from B24 original Banc provenance is made available, switch to one-to-one original SetActor-to-source-mesh verified layout and physical continuity certification first. Otherwise avoid claiming a complete stage from partial optical geometry. Preserve Chat+GitHub default and minimize expensive repeated Windows owner actions.

**Process audit:** one camera-only feature implemented, original physical game untouched; real Chrome W-input motion verified, 21 tests and 7CPU regression green; no Work, no user Windows modification, no production rollout.
