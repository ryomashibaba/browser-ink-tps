# Browser Ink TPS — W10-B43 native bomb contact and explosion witness

Code checkpoint before CI. Base QA HEAD: 0cbc99e7829c12a4d085c688d4b473ed4dd7cdad

## Exact observational scope
A passive optional SubWeaponSystem callback, enabled only on nonproduction F3 `t21QaDrive=source&t21W10B38=humanSub`, records actual engine launch ID and world origin, exact explosion point, triggering cause (CONTACT_IMPACT, LANDED_FUSE or FLIGHT_TTL), and **the chosen actual contact branch**. PAINT_SURFACE_SEGMENT is a native paint-surface segment intersection, explicitly NOT a verified Rapier contact; RAPIER_STAGE_SOLID is the native `thrown-sub` Rapier collider query with its stage solid ID. If no contact was resolved, kind NONE.

The witness additionally includes the true existing source-PaintSurface IDs for the bomb projection Stamp requests before authoritative ink raster; B41 remains the only post-GameplayInk changed-ownership truth. No new paint surface/collision exists. Witnesses are JSON-compatible immutable, one per explosion, tracked only in source QA. The existing actual Chrome KeyF seven human throws must match distinct native witnesses and post-raster Stamp count, not invented physical contact or owner/CPU authority.

Protected: 25 existing source solids / 17 paintables / 26 links / 0 scoreables, natural cross-team path 0/12, activationReady=false. No normal CPU or T20 changes, Draft PR #5, main, Pages, original actor/Banc locations or Windows files. Wall/edge/distance ORIGINAL-GAME correctness, final stage activation and local RTX remain HOLD.

## CI
PENDING; record only verified code SHA and real numeric positions from GitHub Chrome workflow logs.
