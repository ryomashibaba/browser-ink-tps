# W10-B185 — Original first-drop player navigation legibility (source only)

2026-10-25 JST, baseline B184 commit `e29c38295d3cd302d8e9bec67ba1193cd2a97f70`. No original-authority mutation.

## Real evidence ingested
- B182 exact-head `160841a6185d3299aee1734010e4787a6fc9d188`: B75 actual WebGL2 FIXED + SWEEP SUCCESS, QA launcher SUCCESS. In genuine 13.15s SWEEP, 7/7 original CPU physical rejoins, 123 real source shots, 5,540 changed original cells, **zero** registered stage line-of-sight rays and **zero** visible enemy selections. This confirms source ink operation, **not** genuine opponent combat.
- B183 `9e424385db63c306040bf34cc5da7a7f36edaa4d` and B184 `e29c38295d3cd302d8e9bec67ba1193cd2a97f70` native CI were still queued at B185 implementation start; no native B183/B184 UI PASS has been certified. Do not report queued as PASS.

## B185 actually implemented
The playable B183 original-first-drop mode had genuine native phase transitions but its visible UI supplied no source-grounded information about landing geometry. B185 presents **real registered original source geometry** as low-cost HUD guidance, while preserving the live 60Hz original KCC and scoring.

- On the already-explicit `?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay` route only, once every six true simulation ticks or on B183 native-state change, call the **existing B120 registered first-drop polygon inspector** with the actual human Rapier body. Read its actual on-registered-landing-polygon XZ result; identify positive/negative side by native body Z. Never create a target or NavLink.
- When actual human Rapier grounded foot is on a source `spawn-high-*` solid, use the **existing B130 source-flat footprint inspector** to show observed distance to source upper polygon boundary. This is not a global pathfinding or predicted safe drop.
- Show registered LOWER landing footprint XZ `INSIDE/OUTSIDE/UNKNOWN` and original UPPER edge distance (only if actual original grounded support is valid). `INSIDE` expressly does **not** prove the vertical trajectory, collision envelope, safety, real KCC landing, a route, or score.
- Add bound snapshot `b185RealOriginalLandingFootprintCue` plus DOM source-only data attributes `originalLandingXZ`, `safeRouteInferred=false`, `nativeOriginalCueTick`. No actor pose, movement, stamp, weapon, physics, Recast, source mesh, or collision changes.
- 4 pure display/unit regressions added to existing B75 preflight without a new browser runner. Source B120/B130 already have their own physics/polygon unit tests and browser evidence.
- Deliberately did not modify common `scripts/t21-w10b112-genuine-human-floor-walk.mjs` here: B184 had triggered ten CI workflows because that shared runner was edited. B185 is app + bounded view helper only to reduce unneeded new CI fan-out.
- B184 real live-Chrome B120 can prove first-drop native player CLEAR when its workflow executes. Its existence/pending status does not prove B185 screen presentation; B185 itself needs exact SHA runtime proof before calling it visually certified.

## Source authority and unresolved gameplay
25 registered original Rapier solids / 17 source paint surfaces / 26 approved source navigation links / **0 scoreable original Turf regions**. `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`. Opponent cross-team natural original KCC routes **0/12**. NO fabricated enemy or temporary teleports to make sight tests trigger. Same existing QA branch, preserve main/T19C/T20/PR #5/public Pages.

## B186 highest priority
Consume B183/B184/B185 exact-head real browser results first; fix a genuine failure based on actual source KCC/DOM evidence. Then return to B155-B159 midspan *original face, Rapier and native Recast/KCC* unresolved source connectivity to unlock true cross-team gameplay; do not confuse a NavMesh endpoint snap, paint counts, or the lower polygon XZ overlap with a certified player route.
