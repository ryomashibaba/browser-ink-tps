# B264 final genuine WebGL2 verdict / B265 pinned WallMetal00 isolation

**2026-10-28 JST — ART HOLD / unrestricted original 4v4 HOLD / production forbidden.**

## B264 proved by native browser (not guessed)
- [F3G run 40632221822](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40632221822) **SUCCESS** at HEAD `9e49348455aa17b3e57cb95ebc342ccdd17eeaed`, evidence artifact `12792622828` (70,100,364 bytes).
- Original source F3L texture atlas: 57,578 UV triangles / 19 source textures. Real Rapier 25 solids / PaintSurface 17 / original NavLinks 26 / scoreable 0.
- Real human practice: 115 non-neutral owned paint cells; native B263 58 sampled cell centers project inside the 1600×900 viewport, on `UndertowT21D:spawn-high-positive-z:paint` (this is not 58 visible colored pixels).
- Exact B264 read-only ray result from `b264-real_ink-genuine-owned-ink-optical-and-rapier-ray.json`: **20/20** sampled owner-cell rays meet source GLASS before paint and **0/20** certified Rapier solid before paint. The stored **six nearest material hits** for each of these twenty rays additionally show a consistent triple:
  - `Fld_Temple01_Glass01` at **1.3066–1.3154m**, kind `GLASS`
  - `Fld_Temple01_WallMetal00` at **1.4087–1.4182m**, kind `METAL`
  - `Fld_Temple01_FloorLine02` at **10.1917–10.3451m**, kind `DETAIL`
  - real owned paint cell center at approximately 13–14m.
- **Critical interpretation:** METAL is NOT necessarily opaque. The current verified F3L `INK_SAFE_REVIEW` uses translucent `GLASS opacity=0.09`, `METAL=0.43`, `DETAIL=0.72`; all have `depthWrite=false`, `BLEND_NORMAL`. Their exact depth ordering and additional triangle layers must be evaluated from real framebuffer. An estimated simple 3-layer transmission `(1-.09)*(1-.43)*(1-.72)=.145236` is merely an *illustrative opacity multiplication*, **not a measured source pixel transmission**, nor evidence a particular sampled texel was completely hidden.
- The repeated original optical overlaps occur even with no certified physics obstacle in front of the ink. Do NOT convert original optical meshes into colliders, assume missing source world transforms are recovered, or claim original underpass/4v4 validated.

## B265 narrow actual-screen experiment
**Hypothesis**: Original `WallMetal00` contributes materially to the narrow region around actual owned paint cell projections, beyond Glass01 and FloorLine02. This is a research-only **render-group visibility attribution**, not an accepted material deletion or a new game-art direction.

**Implementation**:
- Reuse existing exact-SHA original F3L manifest, existing B260 paused-STAGING source gate and `setB260SourceMaterialHidden`, adding only the pinned source `Fld_Temple01_WallMetal00` (kind `METAL`) to the existing safe target allowlist. Never edit original texture/vertex buffers or change opacity/depth, source ink, actor positions, camera, source architecture, Rapier or navigation.
- Run **A→B→A** at both native FROZEN and native REAL_INK states. A is unchanged, B temporarily hides that exact METAL draw group, A2 restores it.
- Recheck original source **25/17/26/0**, 57,578 UV, source-triangle identity, actual ownerGrid sample identities and tick/player position before/after. Reject nonrestored frame or unauthorized material mutation.
- Store original native 1600×900 framebuffer screenshots and a machine-readable JSON with same actual owned sample locations. Analyze B against A **at genuine B263 on-screen owned-cell sample coordinates** offline; do not equate 24/58/115 samples with colored ink pixel count, or promote global pixel-change ratios to legibility certification.
- Reuse F3G native PlayCanvas scene and all existing render tests; do not add a duplicate browser runner or enable an unrestricted match.
- Existing fanout safeguards: **DO NOT re-add** `scripts/t21-f3-browser-smoke.mjs`, `src/app/UndertowF3PlayablePreviewApp.ts` or the F3G workflow YAML itself to the F3G workflow push path list.

**Acceptance**: B265 unit/build + genuine Chrome WebGL2 + exact A2 restoration = **technical QA pass only**. ART remains HOLD even with a positive raster delta; source optical overlap might be a separate presentation-position problem rather than a material shading defect.

**Next judgement after the real B265 framebuffer**: If WallMetal00 hiding changes real paint-projection neighborhood pixels and improves edge/color separation under controlled, unchanged native camera, evaluate an *opt-in composite art candidate* with source-only A/B image comparisons and source provenance. Otherwise reject METAL tweaking and investigate original optical-to-playable source registration/scene alignment rather than multiplying similar shader studies.
