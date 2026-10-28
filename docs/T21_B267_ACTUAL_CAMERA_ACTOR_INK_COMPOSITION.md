# B267: actual SOURCE actor + camera + owned-ink screen alignment (three views)

**2026-10-28 JST. Real source evidence reused, no new heavy WebGL2 run. TECHNICAL OFFLINE ANALYSIS PASS / ART HOLD.**

## Reproducible provenance
- Original real WebGL2 source: [F3G B265 run 40635064731](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40635064731) SUCCESS at code revision `483eea15a517855cb630f828dc62e7606509c7f7`, artifact `12793603852`, ZIP SHA256 `e1ca219e436a2f1e1fda146b7be3a56bca43ced9d628d39d7921d338febe9f12`.
- Real unmodified screenshots in artifact: `B258_INK_A_ORIGINAL_NATIVE_CAMERA.png`, `B258_INK_B_REAR_WIDE.png`, `B258_INK_B_ELEVATED_RIGHT.png`; the underlying `b258-real-ink-camera-abca.json` and `b265-real_ink-original-source-metal-aba.json` each refer to native tick **345**, equal camera baseline location.
- Original native Rapier solids 25, original real PaintSurfaces 17 (scoreable 0), original NavLinks 26, pinned original textured UV **57,578** triangles and **19** textures; 8 existing physical actors (human+7 CPU), no source actor placement matrices recovered.
- B267 offline projection uses **actual** camera position, actual camera forward vector, and native `PaintSurface.localToWorld` center coordinates. A single focal length is **calibrated** from 58 true B265 captured screen positions. Baseline max reprojection error **0.00001533 pixels** at genuine native 1600×900 (not a guessed FOV). Other views are projected with their actual already-captured camera transforms; no actual ink ownerGrid changes.
- Real evidence analysis output `B267_native_integrated_camera_ink_review.json` SHA256 `94f5860c81dca9242878f712952cd2a8317d4281f38cf94d6193dd20e51b92c8`; native screenshot montage `B267_native_three_camera_owned_ink_comparison.jpg` SHA256 `50cdacb5324577459456a056460834696058a388b8f0b81a5d8aff5333aa104d`.
- Reproducible offline Node implementation `scripts/qa-offline/t21-b267-native-integrated-camera-review.mjs` and independent pure-fixture tests. Test workflow **only offline**; no F3G shared workflow or source app changed.

## Integrated measured results (all samples are *native already-owned cell centers*, NOT verified colored visible pixels)

| Genuine camera | Human head-to-center native projected height | Center original optical first-hit depth | Actual owned cell centers projected in viewport | Median distance of real owner-cell centers from crosshair |
|---|---:|---:|---:|---:|
| BASELINE | 158.2 px | 1.23 m | 58/58 | 15.20 px |
| REAR_WIDE | 114.9 px | 3.63 m | 58/58 | 13.56 px |
| ELEVATED_RIGHT | 121.0 px | 2.59 m | 58/58 | **55.22 px** |

**Actual projection median of the owned-cell cluster**:
- BASELINE: around `(799.55, 452.03)` pixels; painted sample screen band y 443–461.
- REAR_WIDE: around `(800.74, 451.72)` pixels; y 445–460. Smaller on-screen actor, but real screenshot also develops a broad unhelpful horizontal source railing/foreground obstruction across the lower center.
- ELEVATED_RIGHT: around `(795.12, 398.86)` pixels; y 388–410. The actual owned-cell cluster sits approximately 51 px above the native reticle center: significant composition/feedback mismatch in this existing shot. It also shifts another massive original optical railing across the viewport.

**Important limits**: These 58 points are bounded samples of the **same 115 owned cells** on one original `UndertowT21D:spawn-high-positive-z:paint` surface, not all 17 surfaces or the rest of gameplay. Native actor head-to-center pixel distance is an *apparent geometric indicator*, not exact actor area, performance or artistic perception. Original 9-ray optical samples report triangle proximity, not opaque visibility/ink overdraw. Visual review of original screenshots does not support an accepted art upgrade for either B258 camera profile.

## B267 decision — reject trivial camera zoom as an art remedy

No B258 profile is accepted as a B267 scene-art or permanent gameplay camera change. The existing player/CPU models remain chunky bright cyan and the large gray source foreground dominates the composition. REAR_WIDE reduces actor projected size by ~27% but brings more of the obstructive railing into the image. ELEVATED_RIGHT worsens crosshair-to-existing-paint feedback by ~40px vs baseline. This is not permission to edit original optical triangles or eliminate source material in production.

Next **B268 should prioritize a distinct render-only actor silhouette and original optical-to-playable foreground spatial-alignment candidate**, judged from native real WebGL2 whole-screen images including actual painted region and original eight actors. First inspect the source identity and the native gameplay conditions; do not invent original actor placements/colliders, promote scoreable, or activate unrestricted original 4v4. No ZIP/manual user steps necessary, stay on protected QA branch.

**State:** ART HOLD / human acceptance HOLD / original 4v4 HOLD / production not authorized. Technical B267 provenance and offline projection validation do not imply art adoption.
