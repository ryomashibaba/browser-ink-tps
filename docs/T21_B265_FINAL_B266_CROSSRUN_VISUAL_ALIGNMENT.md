# B265 final / B266 cross-run native source optical registration

2026-10-28 JST — **B265 TECH PASS / ART HOLD**, B266 source-geometry and native-ink evidence audit.

## GitHub evidence
- Genuine B264 run [40632221822](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40632221822), SHA-pinned original F3L, **SUCCESS**; artifact `12792622828`, archived zip SHA256 `18980ef880d39a8bff5d4fe9a0bcf973654449772cde23998076f4f37e286510`.
- Genuine B265 run [40635064731](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40635064731), exact original WallMetal00 A→B→A, **SUCCESS**; artifact `12793603852`, archived zip SHA256 `e1ca219e436a2f1e1fda146b7be3a56bca43ced9d628d39d7921d338febe9f12`.
- Evidence processor `scripts/qa-offline/t21-b265-metal-raster-compare.py` or equivalent independently SHA-validating processor. Raster comparison output JSON SHA256 `d7744ee211fc6c50d9368287999d629fe131634c1b89c3e3faa2e7f882a051f6`.
- Original cert: **25 Rapier solids / 17 real PaintSurfaces / 26 original NavLinks / 0 scoreable**, **57,578 exact source UV triangles**, 19 source textures. No original collision, navigation, paint, camera, original material data, source actor placements, or production changed.

## Actual B265 native RGB evidence

| Actual screenshot metric | FROZEN | REAL_INK |
| --- | ---: | ---: |
| Original ownerGrid paint cells | 0 | 115, all Team A |
| Real native ownerGrid sample positions projected on-screen | 0 | 58 |
| Original metal optical visibility A→B changed pixels | 294,999 (20.49%) | 759,538 (52.75%) |
| Real paint-grid projections with RGB max-channel delta >=8 in a 5x5 median patch | N/A | **50/58** |
| Same with delta >=24 | N/A | **11/58** |
| Median max-channel RGB delta | N/A | **18** |
| A→B→A full native 1600×900 original framebuffer restored | **0 pixels changed** | **0 pixels changed** |

**Image inspection:** WallMetal00 hide causes a large color shift in the two foreground cyan actor silhouettes and other mesh areas too. 52.75% whole-screen changed pixels is NOT the ink occupation, a measure of art quality, or permission to remove that original material. The actor silhouettes also remain visually intrusive. Original METAL group has 634 exact source UV triangles, rendered in opt-in `INK_SAFE_REVIEW` at opacity .43 with depthWrite false.

## B266 directly correlated source-ray and native sampled RGB evidence
- Source: B264 `b264-real_ink-genuine-owned-ink-optical-and-rapier-ray.json`, B265 `b265-real_ink-original-source-metal-aba.json`, B265 SHA-validated pixel offline report.
- **20/20** real B264 rays are exact matches of the B265 source native `ownerGrid` sample coordinates and screen pixel projections; this is a **cross-run matched projection**, NOT a single clock tick. B264 native tick **346**, B265 native tick **345**. Matching explicitly requires equal world-cell coordinates and screen projections.
- All 20 have original GLASS before METAL before DETAIL before the native painted cell, and **0/20 certified Rapier solids before the painted cell**.
- Source ray median distances: Glass **1.31065m**, WallMetal **1.41309m**, FloorLine **10.22352m**, actual native owned paint sample **13.18532m**.
- On the same 20 locations, removing original WallMetal00 in paused research changes sampled 5×5 median RGB by >=8 in **16/20** locations; median max RGB channel change **18**. Saturation ratio increased by >.01 in **19/20**. Median sRGB saturation before **0.432**, after **0.56944** (simple max-min over max, **not** validated perceptual readability).
- Other 38 B265 points were not B264 ray-sampled. Avoid extrapolating optical ray findings to **all 115 cells or the entire arena**.

## Decision and next work: stop repeatedly hiding original materials

**B265 TECH PASS, ART HOLD, no permanent WallMetal removal.** This confirms that foreground *optical* material contributions affect native owned-cell screen neighborhoods, not that any particular pixel can be proven to contain rendered gameplay ink, or that source geometry should be deleted. The original optical Glass/Metal triangle intersections have no collision/navigation authority. Game quality is still restricted by prominent cyan actor silhouettes and difficult original optical-to-playable-stage visual registration.

B266 introduces a reproducible offline code-level **same-owner-grid / same-projection / genuine optical-depth / SHA-validated pixel** cross-run audit and small isolated unit CI. It rejects wrong original source, changed camera/position, changed rendering restoration, missing original ray layers or unauthorized source geometry changes.

**Do not** launch a separate 15-20min F3G run just to gather more near-identical WallMetal opacity toggles. The next art candidate should be an explicit native browser *whole-view, actor-and-stage presentation* study, with original source visibility and actual owned-cell contrast evaluated **together**. Review whether the source optics require relocation/alignment; never silently translate the source or falsely certify upstream actor placement.

Overall: **ART HOLD / official 4v4 HOLD / production forbidden / original stage source authority unchanged**.
