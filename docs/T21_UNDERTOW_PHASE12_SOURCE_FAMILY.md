# Phase12A — center original source-family diagnostic (2026-10-09)
Pinned KiTrix Temple01 OBJ SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`, 43,263,289 bytes. Independent Phase11 original-OBJ extraction supplies the 3D source-family candidates; no source-derived vertex position, triangle order, or measurement was invented.

**New in Phase12A:** 16 source-native diagnostic triangle *samples* (8 per side) not already in the Phase11 closest-16 display, from five material families:
- FloorLine02: NEG faces 60006/60160/60474, POS 61516/61422/61948 (6).
- WallMetal00: NEG 34848, POS 34876 (2).
- PillarBase02: NEG 28318, POS 26116 (2).
- Glass01: NEG 35641, POS 35643 (2).
- GlassEdge00: NEG 69626/69776, POS 69634/69810 (4).

Original OBJ face index and three source vertex IDs are preserved on every sampled face. A precise binary64 data record stores the measured finite 3D edge-to-triangle gap and three project XYZ vertices derived from the pinned original. Distances across samples range from 0 to 0.28409343375559637m (not necessarily walkable gaps). A material-family color tint is for investigation, **not original texture reconstruction**.

Source-face selection is not proof of full object/component connectivity. Even where source object names match an already reviewed source, the full original vertex-ID adjacency remains **UNKNOWN**. Phase10 showed ZERO source-welded matching edges for its 48 underside edge inventory. Do NOT infer true gameplay surface joins from 0m contact or small gaps. **Full displayed original-source mesh components remain 124 and floor-related components 64**: diagnostic samples have +0 counted originals, +0 counted walkable floor, no T21 collider/paint/nav/actor placement, and T21 `activationReady=false`; T20 remains production.

Review URL: `?stageReview=undertow&reviewPreset=THREE_DIMENSIONAL&reviewView=CENTER_SOURCE&reviewRenderer=webgl2&reviewTopologyEdges=1&reviewSourceFamilies=1`. Phase12 is OFF by default (also in All Evidence), independent of the Phase11 yellow nearest-16 toggle `reviewNearestCentral=1`. Mint FloorLine, coral WallMetal, purple PillarBase, light blue Glass, pink GlassEdge.

CI: `scripts/UndertowSpillwayPhase12SourceFamilyQa.test.ts` compares all 16 source names, original face/vertex IDs, orientations, source-projected XYZ, and gaps byte-for-byte to independently regenerated pinned OBJ Phase11 fixture, with a dedicated fail-closed CI environment variable. Usual Vitest without original OBJ verifies safety invariants only. Chrome WebGL2 review diagnostic screenshot is additional/optional and **is not Visual Freeze**.

Next Phase12B: expand pinned-source component graph across original shared vertex IDs for these face IDs to tell already drawn versus undrawn full components, then handle surrounding flank/spawn structure with separately pinned evidence.
