# B263 source ink visibility: verified 9-ray optical/physical baseline

**Date:** 2026-10-28 JST. **Status:** read-only evidence review / ART HOLD / unrestricted 4v4 HOLD / production FORBIDDEN.

## Exact provenance

- Last confirmed branch HEAD before B263 F3G outcome: `90e4881b0b1d2862a2cf5a8a9cb69d24ee3b9f0f`.
- Original source geometry and alpha audit: F3G on `0317ace8bff993ce2b898a98518a3ef0a3791cc9`, [genuine WebGL2 run 40623664512](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40623664512), original artifact `12789246699`, file `b257-native-source-optical-rapier-depth.json`, reference screenshot `B257_NATIVE_FROZEN_SOURCE_DEPTH_REFERENCE.png`.
- B262 read-only QA panel A→B→A (the same run): frozen 349,753 changed pixels (24.288403%) and real ink 348,874 changed (24.227361%); both exact 0-pixel restored, **TECH PASS / ART HOLD**. These are *UI* pixels, not extra painted game pixels.
- B263 new code and unit/build PASS at `90e4881b`; [F3G genuine WebGL2 run 40629908569](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40629908569) **still running as of this evidence review**. Do not infer its real ink projection outcome or art status.

## Reproducible read-only B257 ray depth table

Original frozen camera: `[0.73693, 10.27571, 74.15285]` meters. Screen 1600 × 900. Each row records first exact pinned original UV optical triangle and first certified Rapier camera hit on the same ray; no added colliders, actor placement, or paint surfaces.

| Screen probe | Optical kind | Optical distance (m) | Rapier distance (m) | Optical before Rapier |
| --- | --- | ---: | ---: | --- |
| CENTER | GLASS | 3.76 | 13.28 | yes |
| UPPER_AIM | GLASS | 3.68 | no hit | yes |
| LOWER_AIM | DETAIL | 3.91 | 6.81 | yes |
| LEFT_GROUND | DETAIL | 4.99 | 6.51 | yes |
| CENTER_GROUND | DETAIL | 4.54 | 4.96 | yes |
| RIGHT_GROUND | DETAIL | 4.75 | 6.51 | yes |
| LEFT_MIDDLE | GLASS | 4.46 | 13.69 | yes |
| RIGHT_MIDDLE | GLASS | 4.26 | 13.69 | yes |
| LOWER_CENTER | DETAIL | 5.02 | 4.16 | **no** |

**8 / 9 original-optical first hits precede the certified Rapier camera hit**. On 1/9, Rapier appears first. Because ink-safe source optical meshes may be translucent, these values demonstrate **geometric overlap potential**, not opaque coverage, a genuine shader defect, or an actual gameplay obstacle. The original UV triangles remain optical-only. Center optical Glass01 is only ~3.76m away, while the original certified physical surface is ~13.28m away; this explains why screen-space material fixes cannot be trusted without paired native ownership-and-camera evidence.

## B263 decision gates (do not alter the live scene)

B263 samples **actual already-owned native `ownerGrid` cells** (up to 96 per surface, with total ownership counts across all 17 surfaces), projects selected centers through **the real player camera**, and stores FROZEN and REAL_INK JSON alongside genuine screenshots.

1. **Zero projected samples**: cannot claim no ink is visible or that no painted cells exist; sample budget may miss rare on-screen cells. Review owner counts, sampled coverage, world-to-screen distribution and camera selection before any shader change.
2. **Some projected samples**: still no claim of actual colored pixels. Inspect native screenshot against sample points, source ray geometry, possible UI covering, and original transparent draw passes. Optical ray hits are not proof of fully opaque occlusion.
3. **Native test failure, nonfinite projection, owner footprint drift or missing original identity**: stop and repair the evidence method; do not promote art or release.
4. **Source boundary remains:** 25 Rapier solids / 17 real PaintSurfaces / 26 original NavLinks / zero scoreable, plus exact pinned 57,578 original UV triangles, 19 textures. Original underpass route, official 4v4, and production remain HOLD.

**Efficiency:** do not trigger another F3G ~15-minute source pack merely to try a cosmetic blend/drawBucket change. Analyze the already-generated B263 evidence offline first. A later dedicated B264 source optical ray test is justified only if enough real ink samples project inside the actual camera.

**Verdict:** B257 depth evidence provides a focused hypothesis; B263 real ink projection evidence is necessary before selecting its next corrective experiment. Official ART still HOLD.
