# T21 B283 — registered polygon steering screen (B284 identity correction applies)

> **Superseded identity warning, 2026-10-28:** B283 missed the already-existing 2026-09-28 `UndertowSpillwayStageSourceIdentityAudit.ts`. Independent B284 reinspection of actual Leanny `SceneInfo.json` rows for 720 / 920 / 1130 verifies `Vss_Temple01 = マテガイ放水路（改修後）`, `Vss_Nagasaki03 = チョウザメ造船`. The KiTrix `StageLoader.swift` convenience human-name map is contradicted by authoritative game-data rows. **Stage model identity is resolved; the FloorLine00 *original-game collision role*, physical support continuity, and connected full-game route are NOT resolved.** Keep all authentic earlier KCC results and all collision / production HOLDs. See `T21_B284_PINNED_SCENEINFO_SOURCE_IDENTITY.md`.

Date: 2026-10-28 JST. QA branch only. This is *geometry research plus a read-only regression*, not new native motion, collision registration, route completion, CPU autonomy, visual acceptance or publishing authority.

## Verified historical input and new bounded calculation

- B127 authentic Chrome run #39958818393: last safe grounded source at tick 468 = [6.2972002, 5.3949986, 38.6824722], distance to registered right-low-team-a polygon boundary 1.385909m. Last rejected grounded tick 492 = [6.2972093, 5.3950791, 36.6032677], edge clearance 0.470656m. Failure is the existing >=0.60m sampled and >=0.65m endpoint original-floor fence, not proven missing physical ground.
- B283 adds a deterministic **read-only** source-polygon screening method, directly accessing the *already registered* StageSolid original footprint including all three holes. It samples both hypothetical lateral and forward legs at no more than 0.025m spacing, requires each sampled position to be inside and >=0.65m from every boundary, and never changes an actor or performs input.
- Candidate left -0.60m, then forward -2.10m has expected minimum source geometry margin ~1.000m, calculated from the current frozen footprint. Candidate left -0.45m then forward -2.55m has expected minimum ~0.719m. The exact figures must be checked by the new Vitest CI. Original straight continuation from the B126 safe anchor to B127 last coordinate remains rejected (~0.471m).
- The B283 candidate is NOT a real KeyA/KeyW plan yet: a physical KCC may take a curved/coasting path, with a different footprint margin, a different source contact or a safety stop. Only actual native CDP+Rapier start-from-spawn replay, per-poll true support and stop reasons could authorize a bounded new passage. An extra two meters on the same source floor alone is NOT an underpass crossing.

## Critical source identity and collision authority gate

The existing B238–B241 isolated geometry experiments use the **43MB KiTrix Vss_Temple01 OBJ** (hash pinned) and demonstrate limited true KCC movement in explicitly expanded 30/31-solid QA worlds. Crucially, B242 already stopped FloorLine00 research until original-game collision authority is authenticated, and the separate physical capsule support around 7/8 center-ray-null samples is explained.

The exact pinned third-party [KiTrix StageLoader.swift](https://github.com/kirakira-dev/KiTrix/blob/0611f51b35c9736ee986fb2218461e2585b7875e/KiTrix/SceneKit/StageLoader.swift) maps **Undertow Spillway -> Vss_Nagasaki03** and **Camp Triggerfish -> Vss_Temple01**. It is a third-party mapping, not itself authoritative official source proof. The study's attribution of Vss_Temple01 as Undertow must therefore remain **UNVERIFIED** (potential target/version mismatch). Repeating the same local floorline KCC trials or rebranding Camp geometry as authorized Undertow collision is not productive.

Next highest-value evidence: independently establish the intended game/version/stage identity and official collision inclusion for the exact candidate components. If this cannot be demonstrated, do not promote Temple01 FloorLine00 or its five companion source faces and do not certify a right-low-to-underpass original route. The original registered 25-solid right-low polygon screen still describes the **existing project geometry only**, not established original-game stage authenticity.

## Unchanged non-negotiable HOLD

Original runtime 25 Rapier solids, 17 paintable surfaces, 26 source NavLinks, 0 scoreable. activationReady=false; productionAuthorized=false; unrestricted4v4Certified=false; formal opponent paths 0/12, central underpass Recast terminal gap ~31.7m, ART HOLD, no production/Main/Pages change. The compact source-frontier preflight does only Vitest/build; no expensive Chromium or duplicate historic B127 failed native CI is triggered by the source screen.

**Decision:** Prioritize resolving stage/collision provenance before spending a new native crossing run on hypothetical stage geometry. Preserve genuine earlier human KCC success without falsely claiming that the target game identity has been authenticated.
