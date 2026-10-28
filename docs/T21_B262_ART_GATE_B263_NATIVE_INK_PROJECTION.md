# B262 genuine source UI focus ART gate and B263 native ink placement witness

**2026-10-28 JST / QA-only research**. Source authority **25 Rapier / 17 real PaintSurfaces / 26 original NavLinks / 0 scoreable**. Native original F3L **57,578 UV triangles**, 19 textures.

## B262 result and art decision
- Captured at `0317ace8bff993ce2b898a98518a3ef0a3791cc9`.
- Real F3G run [40623664512](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40623664512) **SUCCESS**, artifact `12789246699` (68,270,342 bytes).
- B75 [40623664442](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40623664442) FIXED/SWEEP **SUCCESS**, B210 180-second [40623664465](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40623664465) **SUCCESS**, B112/B120/B162/B234/F4E103W success. These do **not** certify unrestricted original 4v4.
- Genuine native WebGL2 source A→B→A, only diagnostic panel becomes a tiny **QA PANEL** restore tab; original CPU, paint, source triangles, camera and renderer are untouched.
- Frozen screen: **349,753 / 1,440,000** pixels (24.2884%) changed; exact A restoration **0** pixels.
- Real ink screen: **348,874 / 1,440,000** pixels (24.2274%) changed; exact A restoration **0** pixels.
- **B262 TECH PASS / ART HOLD**. The left viewport is exposed, but central source-UV optical structures and the lower gray foreground still prevent a compelling/readable game scene. The other independently overlaid practice panels also remain; shrinking one QA panel is not an ink or art fix. Do not make this a default UI change.
- Related B261 actual render pass evidence: original `Glass01` is a World-layer transparent draw whereas native PaintSurface material is World-layer opaque. **Reject bucket-only Glass01 reorder**, which cannot reorder these two passes.

## B263 motivation — separate physical paintable display from truly colored ink

A separate read-only offline pixel comparison of **the same B262 F3G run** used B259 optical ablations:
- `B259_REAL_INK_A_NATIVE` versus `B259_REAL_INK_B_HIDE_PAINT_SURFACES`: **599,620 changed pixels (41.64%)** of whole frame.
- Center-lower image ROI `x=400..1279, y=470..849`: **86.78%** of RGB pixels changed, with **84.75%** changing by at least one RGB channel of 8 or more.
- Frozen context center-lower: **92.46%** RGB pixels changed by at least one level.
- **Interpretation**: certified native PaintSurfaces are a large contributor to the lower-center **rendered geometry**, not evidence that colored ink occupies 41.64%, 86.78% or 92.46% of those pixels. Rendering the unpainted neutral surface can also make broad gray areas.

The B253 provenance shows **115 real human-changed cells** in the short practice experiment, but from that count alone we cannot conclude that those particular cells are visible from the current real-ink camera.

## B263 strictly read-only research question
Where do the **actual non-neutral ownerGrid cells** of the 17 existing authoritative PaintSurfaces project in the same fixed native camera? Does the camera have *any* on-screen painted cell centers, and on which original surfaces? If none, visual complaints about missing ink on the foreground must not be blamed on blending without a better camera/witness. If some, they can be targeted in subsequent source/optical visibility testing.

B263 must:
1. Read existing source `ownerGrid` arrays (team A/B only), validate active-footprint cells, never enqueue paint or mutate owners/atlas.
2. Use existing source `PaintSurface.localToWorld` and actual `CameraComponent.worldToScreen`, explicitly separate viewport projection from true framebuffer visibility or occlusion.
3. Retain B262/B261/B260 paused STAGING gate and exact original 25/17/26/0, 57,578 source identity.
4. Record bounded samples across all 17 paint surfaces, count *all* owners, keep the distinction that ownership alone does not identify which actor last painted a cell.
5. Capture source-matched FROZEN and REAL_INK original camera screenshots/JSON. No false painted pixel count, no art PASS, no production or official Turf activation.

**All ART / unrestricted 4v4 / production remain HOLD**.
