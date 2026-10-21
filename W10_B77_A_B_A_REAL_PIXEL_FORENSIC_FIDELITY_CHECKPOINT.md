# W10-B77 — actual pixel forensics and strict A→B→A source visual restoration

Date 2026-10-21 JST. QA branch only. Parent `0d5ef533b306d611b2f5202f1ba31313502195c8`. Frozen main, published Pages, Draft PR #5 and all original source geometry untouched.

## Forensic cause of reported B76 SHA regression

B76 expanded the genuine native human source HUD. Its broad existing B21 graphics CI reported `source-render-ab` FAILURE on [run 39549700836](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39549700836) at an old `architectureA.sha256!==architectureA2.sha256` condition. We retrieved the actual GitHub Actions PNG artifact `12323360940`, decoded all three 1600×900 RGB images and compared pixels rather than compressed PNG byte SHA:

| Real test | Differing pixels / 1,440,000 | Max per-RGB-channel delta | Pixels differing by at least 8 |
| --- | ---: | ---: | ---: |
| Original A ↔ restored A2 | **258** (0.0179167%) | **1** | **0** |
| Original A ↔ intentional hologram B | **40,759** (2.83049%) | **86** | **18,460** |

A/A2 differences were confined to x=1301..1563 and y=396..410, likely tiny raster text anti-alias or RGB quantization; it is a measured 1-quantum drift, **not** evidence of new source geometry. PNG lengths (401,887 vs 401,911 bytes) and SHA naturally differed even though differences were <0.02% pixels with max 1/255 intensity.

## Precise correction

- Add a pure Node Zlib PNG decoder for trusted local Chrome 8-bit RGB/RGBA capture with supported standard PNG per-row filters 0..4, conservative 1600×900 and decompression bounds and explicit failure for malformed/truncated PNG.
- The exact paused native source A/B/A gameplay test still checks unchanged 60Hz physics tick, player position, original 25 solids, 17 paintable, 26 NavLinks, **zero Scoreable** and no private Actor instance authority. Now it also checks **actual RGB pixels**:
  * A↔A2 must differ by **at most one 8-bit RGB channel level per pixel** and at most 0.04% (576 of 1,440,000) pixels. Any 2+-intensity difference fails, as does visibly changed geometry/UI.
  * Intentional B↔A must differ in >=0.5% total pixels, >=0.2% by at least 8 levels per channel, and have maximum channel delta >=16; rejecting trivial or fake hologram toggles.
- Do **not** substitute a rubber-stamped `true` or casually relax from exact SHA to unlimited perceptual similarity. Carry explicit quantitative tolerance, changed-pixel count and boundaries in the CI evidence.
- Small synthetic positive/negative PNG tests run in the B21 preflight, before actual Chrome; real captured frames still required for certification. B21 actual Chrome A/B/A QA has not yet been rerun at this authoring point.

## B76 user-facing functionality remains

B76 added actual Human Impact source-paint changes/accepted shots/dry-fire, and real squid-own-ink refill guidance to the playable source HUD. This B77 commit adjusts **only QA fidelity verification**, not human inputs, actor positions, native geometry, WebGL2 renderer, gameplay paint, score, cameras, AI, original source or app HUD.

## Hard authenticity HOLD

Stage 25 original physics solids / 17 original Paintable / 26 original NavLinks / 0 Scoreable. Original opponent paths 0/12, 8 PntSet Actor instances and source mesh transform bindings unproven, `activationReady=false`. Default CPU FIXED, opt-in SWEEP only; no unrestricted Nintendo-style 4v4 or official winner.
