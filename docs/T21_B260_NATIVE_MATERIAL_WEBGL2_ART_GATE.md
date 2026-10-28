# B260 — Native WebGL2 per-material optical attribution / ART gate

**Date:** 2026-10-28 JST  
**QA branch:** `dev/t21-f4e103w-qa-infra`  
**Captured at:** `2f7f5254cb889925b121f4febc2686d250595ab9`  
**F3G:** [run 40613630897](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40613630897) **SUCCESS**  
**Evidence artifact:** `t21-f3g-full-original-source-proof`, artifact `12784797554` (60,722,288 bytes)  
**Final decision:** **B260 TECH PASS / ART HOLD**. Do not promote visual study, source navigation, score or release.

## A/B/A data from genuine 1600×900 Chromium WebGL2

All six material comparisons captured baseline, hidden-material frame and restoration in a paused STAGING frame. Each target had **zero changed pixels after restoration**; world tick and human position were unchanged within each A/B/A comparison.

| Context | One hidden original material | Changed pixels / 1,440,000 | Change ratio | Restored delta |
|---|---|---:|---:|---:|
| FROZEN | `Fld_Temple01_FloorLine02` (DETAIL) | 546,491 | 37.950764% | 0 |
| FROZEN | `Fld_Temple01_Glass01` (GLASS) | 430,437 | 29.891458% | 0 |
| REAL_INK | `Fld_Temple01_FloorLine02` | 242,158 | 16.816528% | 0 |
| REAL_INK | `Fld_Temple01_Glass01` | 940,658 | 65.323472% | 0 |

The fractional pixel footprint indicates a framebuffer sensitivity to toggling a particular optical draw group, **not** that it physically covers that proportion of the floor, nor that the image is aesthetically improved. Do not sum the groups: transparency and occlusion overlap.

**Region-of-interest corroboration** (RGB pixel diffs against the same frozen/REAL_INK baseline, `x=350..1279, y=525..849`; 930×325 area, selected to reduce UI overlap):

| Context | Material hidden | Any RGB change | Max RGB channel delta ≥8 | Mean maximum RGB-channel change |
|---|---|---:|---:|---:|
| FROZEN | FloorLine02 | 76.5% | 75.8% | 36.77 |
| FROZEN | Glass01 | 0.0% | 0.0% | 0.00 |
| REAL_INK | FloorLine02 | 1.5% | 1.5% | 0.50 |
| REAL_INK | Glass01 | 100.0% | 97.2% | 11.52 |

These are descriptive post-analysis image values, not CI assertions, and the two contexts use **different cameras**. Never attribute FROZEN-to-REAL_INK differences to time alone.

## Direct visual review of source screenshots

- FROZEN baseline: a large textured opaque-looking horizontal architectural band crosses the lower foreground; hiding `FloorLine02` removes a pronounced local architectural appearance but reveals a broad featureless dark gray foreground instead. It does **not** reveal a certified usable path or improve genuine player ink readability.
- REAL_INK baseline: large gray foreground panels and simple aqua character silhouettes dominate the central/lower view. Toggling `Glass01` affects virtually the whole central-lower ROI numerically, but visually it mainly changes a comparatively subtle translucent tint. A **65.3% changed-pixel ratio is not a 65.3% visibility improvement**.
- The left telemetry/controls, top central HUD, upper-right tactical map and lower-right practice panel occupy major screen areas independently of these original UV optical changes. These UI and 3D causes must not be conflated.
- `FloorLine02` and `Glass01` are not proven to be the complete cause of the poor painted-floor legibility. A draw-order / transparency hypothesis needs a separate reversible, strict-gated original-source study. **Do not hide either material as a default fix**.
- B260 does not establish that the 115 real human-painted cells should be visible at the pictured camera/angle, only that the underlying play input/paint evidence exists.

## Source and safety invariants — observed in B260 proof

- Original F3L UV: **57,578 triangles**, verified source textures: **19**.
- Rapier solids **25**; actual PaintSurfaces **17**; original navigation links **26**; promoted scoring surfaces **0**.
- Material bytes, triangles, actors, physical solids, paintable surfaces and navigation were not edited by the opt-in toggles. No new physical support or route was added.
- REAL_INK: genuine keyboard movement **2.119751m**, **10** shots and **115** changed original paint cells (same short underlying game proof as B259). This does not certify normal 4v4.
- Full opponent crossing: **0/12 certified**; disputed underpass gap remains ~31.716m. No original optical mesh is promoted to a collider.

## Independent CI fanout regression (B75)

The separate B75 run [40613591340](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40613591340) failed **2/6** trigger matrix checks, because F3G push paths included the workflow file itself, shared browser smoke driver and integration app. Existing B131/B173 assertions correctly caught the regression. Corrective commit [081a5a7](https://github.com/ryomashibaba/browser-ink-tps/commit/081a5a7413f5b6e1d32be7318b5595ba41f0306a) removes only those three F3G push paths, leaving B260-specific file triggers and manual `workflow_dispatch`. No tests were weakened. Post-fix B75 Actions pass is **not yet observed**.

## B261 candidate selection — evidence gate, not authorization

Choose at most **one** opt-in experimental question: does the original `Glass01` translucent mesh group composite in an order that reduces contrast of true existing PaintSurface ink during REAL_INK? Audit actual PlayCanvas transparent sorting state first (material blend/depth, mesh layer, sort mode, draw bucket) rather than assuming that `drawOrder` works in back-to-front layers. Any experiment must change only *temporary render scheduling* of the exact SHA-pinned optical group, in a paused STAGING study, and restore A→B→A pixel-identically; no opacity sweep, blanket UV hiding, paint hiding or fake floor. Compare the **same camera** within FROZEN and REAL_INK separately, measure perceptually meaningful contrast and show images. If effect is insignificant or unstable, reject it. No B261 production changes or ART PASS until actual images pass human review.

**HOLD:** original 4v4, official winner/scoring, full CPU crossing, production release, new certified art.
