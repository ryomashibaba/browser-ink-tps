# T21 B286 — player-facing genuine source team life status and collision provenance status

2026-10-28 JST. QA/dev branch only. Real player UI change without CPU/Stage/Recast/game authority changes.

## Source provenance research: NO new authenticated original FloorLine00 collider

B242's direct SHA-pinned KiTrix OBJ/MTL/BFRES conversion and SceneKit StageCollider review remains sound. B284 established that `Vss_Temple01` is remodeled Undertow (Leanny 720/920/1130); the erroneous KiTrix convenience name mapping must no longer hold source identity. Nintendo's Splatoon 3 v7.2.0 release note independently confirms Undertow terrain changes and Turf War invasion ramps but does **not** identify `FloorLine00` as a physics collider. No credible new original-game collision flag/actor authority found in this research step. Exact source design geometry and original-game collision inclusion remain independent. Frozen 25/17/26/0; 0/12 true crossing; physical source collision and central Recast HOLD.

## Gameplay/product obstacle

B245 deliberately hides the extremely verbose right-side B211 native roster under PLAYER mode, and B205 round diagnostics as well. The central B17 practice clock and HP/ink are still visible, but there is no compact, genuine indication of **which of seven CPU combat actors have actually rejoined / are active vs splatted**. A player should not need F8 QA or a fake source-local encounter.

B286 adds a **small right-top SOURCE TEAM · UNSCORED** panel. It consumes **only** the existing `b211RealNativeRoster` validated native KCC/actor state: real allied 0–3 ACTIVE and opponent 0–4 ACTIVE, 0–7 genuinely rejoining, genuine SPLAT state and CPU respawn counter. READY state must show zero deployed when all seven have not rejoined. It cannot infer a kill from shot count, impact paint, nearby opponents, color or projected NavMesh. Its own native DOM attributes explicitly encode `scoreable=0`, `officialWinner=NONE`, `enemyContactCertified=false`. No new counterpart beyond the seven already real CPU actors.

The condensed panel displays only in the original **user selected** 180s human combat SOURCE round and only in the default **PLAYER** view. F8 QA hides it and restores the original full B211 roster, without changing source snapshots or the running world; F8 back restores the compact panel. Source-deterministic QA does not create the panel. Survey/gallery hide it, as do any failed validation of source original 25/17/26/0 or roster. Mobile/narrow CSS bounds the panel.

## Measurable acceptance

- B286 pure native-roster regression: rejoin READY 0/3,0/4; six active plus one actual SPLAT; fake IDs and original source authority drift fail closed.
- Existing B75 unchanged FIXED/SWEEP genuine WebGL2/PlayCanvas/Rapier real browser pipeline: READY player mode shows verified native 0/3,0/4,7 rejoining + UNSCORED; F8 QA hides B286; F8 restored shows it; snapshots, native tick 0, no teleports and real START remain intact. Previous B246 conditions remain.
- Browser artifact includes existing B246 true 1600x900 player/QA screenshots for visual review. Art quality must still be judged separately: this HUD change does **not** achieve stage/actor ART PASS.
- No changes to `main`, published Pages, Draft PR, physics, paint/score, CPU routes, graphics models or historical true KCC evidence.

Status: Source-collision authorization HOLD / native Recast corridor HOLD / formal 4v4 HOLD / ART HOLD / production HOLD.

Sources: Nintendo v7.2.0 change log (https://en-americas-support.nintendo.com/app/answers/detail/a_id/61257/), B242 pin https://github.com/kirakira-dev/KiTrix/blob/0611f51b35c9736ee986fb2218461e2585b7875e/KiTrix/SceneKit/StageCollider.swift , B284 exact game SceneInfo pins.
