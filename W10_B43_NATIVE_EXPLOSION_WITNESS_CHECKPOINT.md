# Browser Ink TPS — W10-B43 native bomb contact and explosion witness

Code checkpoint before CI. Base QA HEAD: 0cbc99e7829c12a4d085c688d4b473ed4dd7cdad

## Exact observational scope
A passive optional SubWeaponSystem callback, enabled only on nonproduction F3 `t21QaDrive=source&t21W10B38=humanSub`, records actual engine launch ID and world origin, exact explosion point, triggering cause (CONTACT_IMPACT, LANDED_FUSE or FLIGHT_TTL), and **the chosen actual contact branch**. PAINT_SURFACE_SEGMENT is a native paint-surface segment intersection, explicitly NOT a verified Rapier contact; RAPIER_STAGE_SOLID is the native `thrown-sub` Rapier collider query with its stage solid ID. If no contact was resolved, kind NONE.

The witness additionally includes the true existing source-PaintSurface IDs for the bomb projection Stamp requests before authoritative ink raster; B41 remains the only post-GameplayInk changed-ownership truth. No new paint surface/collision exists. Witnesses are JSON-compatible immutable, one per explosion, tracked only in source QA. The existing actual Chrome KeyF seven human throws must match distinct native witnesses and post-raster Stamp count, not invented physical contact or owner/CPU authority.

Protected: 25 existing source solids / 17 paintables / 26 links / 0 scoreables, natural cross-team path 0/12, activationReady=false. No normal CPU or T20 changes, Draft PR #5, main, Pages, original actor/Banc locations or Windows files. Wall/edge/distance ORIGINAL-GAME correctness, final stage activation and local RTX remain HOLD.

## CI
PENDING; record only verified code SHA and real numeric positions from GitHub Chrome workflow logs.

## Verified B43 Chrome evidence — 2026-10-19 JST

**VERIFIED code SHA: `f1a3e3aa9cb4b5431eb9b781e3621f1a90edf4a0`.** Chrome/WebGL2 genuine player KeyF, native projectile+Rapier+PaintSurface, native 60Hz GameplayInk processing. Seven human bombs had exactly seven independent observer witnesses. Note: **all seven selected existing PaintSurface segment crossings**, and **none selected Rapier stage solid as the winner** in these seven specific examples. All seven then exploded via their landed fuse: `PAINT_SURFACE_SEGMENT=7 / RAPIER_STAGE_SOLID=0 / NONE=0`; `LANDED_FUSE=7 / CONTACT_IMPACT=0 / FLIGHT_TTL=0`. This does NOT certify that every bomb everywhere follows this behavior.

| Genuine human throw | Native explosion XYZ (project meters) | Chosen contact PaintSurface source | Bomb stamp count |
|---|---|---|---:|
| Initial B39 | (-1.391, 3.002, -53.477) | first-drop-landing-negative-z | 9 |
| Same-aim repeat | (-1.391, 3.002, -53.477) | first-drop-landing-negative-z | 9 |
| Real mouse pitch variant | (-3.454, 3.060, -52.718) | right-low-route-ramp-negative-z | 9 |
| Downward mouse sweep | (0.693, 3.002, -53.917) | first-drop-landing-negative-z | 9 |
| Rightward mouse sweep | (-1.075, 3.002, -55.544) | first-drop-landing-negative-z | 7 |
| Leftward mouse sweep | (-0.386, 3.002, -51.177) | first-drop-landing-negative-z | 9 |
| Upward mouse sweep | (-6.184, 3.992, -51.700) | right-low-route-ramp-negative-z | 7 |

**Important distinct authority:** the pitch-variant bomb **physically selected the existing ramp PaintSurface segment**, while the *last* generated stamp used the first-drop landing PaintSurface. The native burst actually generated stamps for **both** surfaces. Thus a B41 "last stamped surface" cannot be used to identify the bomb's real contact surface or physical collision. This is precisely the ambiguity B43 resolves. On all seven bombs the contact XYZ and explosion XYZ agreed within measured numerical precision, because the bomb stayed at that native contact point until the fuse ended. This does not prove the same primitives in the original game.

The original three B40 owner-cell results remain 830 / 0 / 546. The source-local four-angle B42 results stay 556 / 221 / 539 / 544 changed cells, no new Turf scoreable surfaces, unchanged 25/17/26/0. All source witnesses carry `originalGameCollisionCertified=false`.

**GitHub Actions on verified code SHA:** 4/4 SUCCESS:
- [Real Chrome seven KeyF throws + B43 contact witness + CPU standard comparison](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39268893694)
- [F3G original full-source visual integration](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39268893747)
- [Original A-B-A visual integrity](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39268893697)
- [Seven CPU real Chrome render lifecycle](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39268893574)

**B43 decision: PASS** for bounded native codepath instrumentation and 7 real source-local traces. **HOLD** on broader wall, external abyss/edge, long distance and normal original 4v4 without new actual evidence. Standard fixed patrol, main and Draft PR #5 untouched. No source geometry, navigation, paintability or official score promotions. Next B44 should independently select genuine existing physical Rapier-solid encounters or real no-contact timeout trajectories, not fabricate them.
