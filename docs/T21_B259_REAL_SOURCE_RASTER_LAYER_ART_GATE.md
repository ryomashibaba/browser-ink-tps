# Browser Ink TPS — B259 authentic SOURCE raster layer attribution ART gate

**2026-10-28 JST. TECHNICAL PASS / ART HOLD.** This is a source-authentic rendering diagnosis, **not** a gameplay rendering selection or production authorization.

## Immutable provenance

- Repository: `ryomashibaba/browser-ink-tps`, QA branch `dev/t21-f4e103w-qa-infra`.
- B259 tested implementation HEAD: [`75532c1f64126ec505f5655e3cdb23bf688b7d5c`](https://github.com/ryomashibaba/browser-ink-tps/commit/75532c1f64126ec505f5655e3cdb23bf688b7d5c).
- Original B258 handoff HEAD: `71969f38766d5270273022233a0a32d667458a40`. Exactly **7 B259 implementation/fix commits** above it, no main/stable/Pages/Draft PR #5 edits.
- [Final genuine pinned-source Chromium WebGL2 F3G SUCCESS — run 40597412482](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40597412482); artifact `t21-f3g-full-original-source-proof` **ID 12777359144** (14-day Actions retention). Earlier [run 40597272456](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40597272456) **FAILURE** on intermediate HEAD, not the final verdict.
- Both `b259-frozen-source-raster-layer-ablation.json` and `b259-real_ink-source-raster-layer-ablation.json`, with native 1600×900 `B259_...png` screens, are the evidence. This analysis also re-read those exact native PNG files; no image generation, surrogate scene or source geometry was used.
- Pre-existing frozen/source boundary **25 Rapier solids / 17 paintable surfaces / 26 actual NavLinks / 0 scoreables**, 57,578 SHA-pinned original optical UV triangles and **19** verified textures; cross-team full route **0/12**; underpass gap approximately 31.716m. Original actor placement matrices not restored. Formal 4v4, score, winner, source crossing and release **HOLD**.

## Native mechanism and authorizations

`src/app/B259SourceRasterLayers.ts` and its tests implement the strict `t21B259=layerAudit` URL opt-in, requiring the prior source/ink/actor/depth/camera research flags plus paused STAGING, 7 real CPU, untouched camera baseline and SOURCE authority. Active pointer lock, unpaused gameplay, full round, B256 aperture, missing UV evidence, competing studies and deterministic QA are rejected.

`UndertowF3PlayablePreviewApp.ts` temporarily changes *draw visibility*, and only after exact identity and count checks: named original UV material entities; named StageRoot's genuine 17 PaintSurface render entities; the existing source solid render entities. Neither a visually hidden Rapier solid nor hidden live ink loses any physical or paint authority. No source triangles, actor transforms, colliders, inks, UV texture bytes, path links, or scoreable flags change. Mask `BASELINE` restores all renderers before resuming.

The exact frozen camera and actual human keyboard+mouse play state are both audited in `scripts/t21-f3-browser-smoke.mjs`, using A→B→A per mask, with original framebuffer restoration **zero differing pixels** for every candidate. Actor and native game tick invariants are asserted. Previous genuine human gameplay witness remains **2.119751m movement, 10 native shots and 115 actual human SOURCE ink cells**, not scored Turf.

## Whole native WebGL2 framebuffer: effect of hiding one original draw family

Changing pixels out of **1,440,000** at 1600×900 (not a perceptual-quality score):

| Temporarily hidden DISPLAY layer | Frozen camera, tick 132 | Post-real-ink camera, tick 346 |
|---|---:|---:|
| Original verified UV `DETAIL` | **45.6067%** | **25.9571%** |
| Original verified UV `GLASS` | **30.1676%** | **65.5817%** |
| All original UV material entities | **72.0304%** | **83.0155%** |
| Render representations of existing certified stage solids | **0.6188%** | **0.6293%** |
| Existing certified PaintSurface render meshes | **43.0612%** | **42.0340%** |

Same-mask returned `A2` images: **0 changed pixels**, for every row, both camera states.

### Focused lower-center viewport inspection (not a physical-material segmentation)

Independently compare PNG RGB at integer pixel positions inside the unscaled fixed region **x = 470..1129, y = 560..814** (inclusive), 660×255 pixels. This region excludes large left/right HUD panels and focuses on the lower forward playfield. The following is the percentage of pixels with **any RGB channel change** from `B259_<CONTEXT>_A_NATIVE.png` to `B259_<CONTEXT>_B_<MASK>.png`:

| Hidden layer | Frozen | Post-real-ink |
|---|---:|---:|
| UV DETAIL | **83.65%** | **0.00%** |
| UV GLASS | **0.00%** | **100.00%** |
| All UV | **83.65%** | **100.00%** |
| Stage solid display | **0.01%** | **0.00%** |
| PaintSurface display | **97.25%** | **88.90%** |

Reproduce by decoding each artifact PNG to RGB, comparing per-pixel channels against the same-scene baseline, and counting pixels with `max(abs(RGB_B-RGB_A)) > 0` in that exact rectangle. These percentages do **not** say that the glass is 100% opaque, that a PaintSurface is 88.9% painted, or that 83.65% of the area is physically blocked. Disabling one semitransparent layer can change the composition of many overlapping blends. The two contexts differ in genuine actor position and native camera, so these are not paired identical-camera comparisons *across* contexts.

## Interpretation, actual visual judgment and exclusions

1. **The gray foreground is not primarily explained by the simple certified-solid display meshes in these native snapshots.** Hiding them changes only ~0.63% of all pixels, and at most ~0.01% in the specified lower-view ROI. This is an observation of what the real renderer displayed, **not** a change in physical collision.
2. **Source original optical UV and the paint-render plane together account for substantial image sensitivity.** Both UV DETAIL and GLASS show large effects, but their relative effect changes greatly between the two genuinely different player/camera states. The next question is material-level visibility/compositing, not random camera distance or uniform alpha.
3. **The large lower gray band and UI still dominate the user-facing image.** In the native screenshots, the true ink changes are still not visually traceable as an easy-to-read continuous traversable paint region; the close actors are recognizable but remain visually coarse. Neither `HIDE_ALL_UV` nor `HIDE_PAINT_SURFACES` is a candidate gameplay fix; these masks are diagnoses that intentionally delete important visual information.
4. **ART HOLD, no formally adopted render mode.** CI PASS proves correct execution of reversible isolation, not quality gain.

### Regression interpretation

- Final B259 F3G (40597412482): SUCCESS for exact pinned OBJ/MTL/texture SHA fetch, unit gate, TypeScript build, actual 1600×900 WebGL2 capture, real actor input, and native image A/B/A.
- B259 intermediate F3G 40597272456: FAILURE, historically superseded by corrected code; do not hide the record or conflate it with final PASS.
- B259-era F4E103W QA `40597387149`, B75 `40597387196`, B112/B115 `40597387265`, B120 `40597387127`, B234 `40597387183`: SUCCESS on `584e319b...`.
- Recent A1 cooperative `40597387181`: SUCCESS (a particular run); previous `40585186533` FAILURE including B140_WAIT_TIMEOUT after genuine A1 painting. **Flakiness not certified fixed.** Investigate authentic native timing/collision independently from optical masks.
- B210 genuine 180-second `40586435418` and `40588081850`: SUCCESS. Not formal 4v4 or winner.

## Highest-value next experiment (B260 gate)

Study **which exact original UV material and face group contributes to the lower gray band** and whether many semitransparent GLASS layers modify the final output because of `depthWrite=false`, transparency sort/draw order, double-sided triangles or actor/paint overdraw. Retain visibility controls *strictly diagnostic and paused*; avoid treating a mask as a preferred render state.

Start with **small, high-impact original material subsets** (B257 identified `Fld_Temple01_FloorLine02` DETAIL and `Fld_Temple01_Glass01` GLASS on selected rays, but ray intersection alone is not pixel attribution). Use native per-material screen evidence with the same 1600×900 camera, then actual-input ink state, exact A/B/A and unchanged source authority. Compare a camera-ground-region mask, readable ink area and actor/occluder edge. No fake floor, projected paint, postprocess-only false readability or new navigability. Separate opt-in HUD composition from native world visibility; hide debugging only in comparative QA, not gameplay failure signals. Reject any candidate that simply removes meaningful source structures.

**Quality first, source authenticity first. B259 TECH PASS / ART HOLD; B260 implementation not yet authorized or tested by this document.**
