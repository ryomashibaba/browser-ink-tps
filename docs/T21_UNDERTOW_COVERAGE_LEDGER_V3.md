# T21 Phase 11 — central underface true 3D near-surface source audit (2026-10-09)

## Frozen baseline and source authority
- Canonical Phase10 CI #1379 **SUCCESS**, branch `codex/t21-undertow-evidence-ledger`, PR #5 Draft/open/unmerged, T20 production `inkworks-junction` and T21 `activationReady=false` unchanged. The 42-point outer boundary, **64 confirmed original walk-oriented source mesh components and 124 total original-source review components** have **not** been changed.
- Prior Phase10 exact original OBJ graph found **16 unmatched source boundary edges around 2 original center `FloorMetal00` downward-looking source components**, among all 48 Phase9 underface edges. No shared actual original OBJ vertex-ID pairs. An edge appearing unmatched means no exact matching full OBJ edge; it **does not mean the 3D surface is physically far from any other source face**.
- Phase11 independently scans original pinned 43,263,289-byte KiTrix `Vss_Temple01.obj`, SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`. Excludes PntSet actor candidates, outside `StageSide` material and the original selected 2 center underface components themselves; searches other original static triangles in a **bounded original model 8m XYZ AABB neighborhood**, filtering the source triangle midpoint against the frozen 42-vertex hard XZ boundary (this is a sample check, not a full polygon clip). Projects source triangles into the frozen 3D project coordinate frame without XYZ rounding.
- For each central underface source edge, computes 3D finite segment-to-source-triangle Euclidean separation (segment-triangle intersection, edge-edge closest segments, endpoint-to-triangle closest points), grouping each near original face by original object/material/normal class. Report `t21-undertow-phase11-central-nearest-original-source` stores nearest 8 distinct source groups for each original edge, original material/object/face ID, original source face XYZ, normal Y and orientation, measured source gap, exact original edge endpoints, plus explicit authority limits.
- **Result: 16/16 edges have close original source triangles**. **Eight nearest source triangles are at 0m distance**, the other **eight are separated by exactly 0.0255m (2.55cm)**. Measured with **7,826 triangles** in the local source AABB window, **7,765 triangle centers inside** the hard outline sample, **40,773 3D candidate triangle separation calculations**. Both center underface mirrored components match this 4+4 distribution. Nearest original face orientations: 8 near-vertical and 8 downward facing; observed primary source materials `FloorLine02`, `WallMetal00` and `PillarBase02` with secondary original `Glass01`, `GlassEdge00`.
- **Critical distinction:** a 0m triangle-to-edge separation is a point of original static model contact/intersection; it does NOT prove that the full original OBJ edge is welded, that a closed model volume exists, or that actual gameplay colliders/paint/nav/spawn paths attach. A 2.55cm gap is an original static source geometric separation, not a user-approved gap fill. Phase10's 0 shared original vertex-ID joins **remains true**. Do not invent bridge slabs or auto-weld.

## Review and tests
- `src/stage/undertow/UndertowSpillwayPhase11NearestSourceDiagnostic.ts` stores the 16 closest original source triangles and distances in a losslessly compressed 1,280-byte sequence of exact original IEEE754 float64 XYZ/distance values, with source materials and exact original triangle face IDs. Source data is never modified.
- `scripts/UndertowSpillwayPhase11CentralNearestSurfaceQa.test.ts` independently compares **all 16 face candidates' exact binary64 triangle coordinates and measured source distances byte-for-byte** against the pinned original OBJ artifact, checks per-edge original IDs/material/normal class, candidate ordering and T20/T21 safety. The CI Phase11 dedicated fixture is mandatory when supplied; the full standalone Vitest suite does not require the 43MB source on each test process.
- `src/app/UndertowVisualReviewApp.ts` provides a default-OFF **Nearest original source** layer with **16 yellow original source triangle samples**; this is *source proximity evidence*, not an additional original connected source component or new geometry for walking. Existing orange/red Phase10 edge diagnostic remains default-OFF. A **Center source close-up** camera focuses on both original center FloorMetal panels at Y+4.5255 while leaving all meshes in their original source positions. Other five previously confirmed camera views remain unchanged.
- `scripts/t21-review-five-view-capture.mjs` retains the mandatory independent five-view actual Chrome WebGL2 screenshots, captures the Phase10 boundary overlay as another optional diagnostic, and adds a **third optional Phase11 focused shot** `T21_PHASE11_CENTRAL_NEAREST_SOURCE_DIAGNOSTIC.png` with yellow source candidate samples and Phase10 source seam edges visible. No screenshot authorizes Visual Freeze, production promotion or gameplay geometry.
- Next original-source focus: determine whether nearby `FloorLine02` decorative face + original center FloorMetal face heights/materials are intentionally separated, or if the game has different actor/material/collider topology. Verify original dynamic placement only with authoritative stage data, not original OBJ proximity alone. **Visual Freeze blocked**, PR #5 unmerged, T20 production unchanged.

---

# T21 Phase 10 — original OBJ edge topology, source-only seam diagnostic (2026-10-09)

## Provenance and exact original mesh evidence
- Previous Phase9 canonical CI #1374 **SUCCESS**. T20 production `inkworks-junction`, T21 `activationReady=false`, immutable 42-vertex XZ hard silhouette and exact 124 original source-review meshes unchanged. Draft PR #5 remains open/unmerged.
- New Phase10 original KiTrix pinned OBJ edge-adjacency audit in `scripts/undertow-temple01-upper-terrain-audit.py`. For the **ten original downward-oriented source components** of Phase9, independently reconstruct original OBJ **boundary triangle edges**, preserving actual OBJ vertex IDs and binary64 XYZ. For each edge, traverse **all other static source OBJ triangles** exactly once and classify adjacent original source triangles by **actual face normal Y**, not misleading material names.
- Three strictly distinct tiers (not equivalent to runtime connectivity): `EXACT_ORIGINAL_OBJ_VERTEX_ID_EDGE` = original shared OBJ vertex-ID pair (strongest source graph adjacency); `COINCIDENT_XYZ_ONLY_NOT_WELDED` = both exact original endpoint XYZ coincide but original vertex IDs **do not** share an edge; `NO_EXACT_ORIGINAL_EDGE_NEIGHBOR` = no other exact matching original source edge. Exact XYZ equality does not establish physically closed surfaces or playable routes. Original OBJ may intentionally split faces and need not use shared vertex IDs even when a rendered object looks connected.
- **Result from independently pinned 43,263,289-byte Temple01 OBJ, all 48 boundary edges**: **0 edges share original OBJ vertex IDs**, **30 edges have exact coordinate-only coincident endpoints**, **18 edges have no exact matching edge**. No topology edge is declared a playable/physical game seam.
- By original source family: 2 `FloorMetal00` center downfaces = **16 unmatched** boundary edges (8 each); 4 `FloorFence00` flank pieces = **16 XYZ-only coincident** edges; 2 outer `Megalith00` source faces = **6 XYZ-only / 2 unmatched**; 2 inner `Megalith00` faces = **8 XYZ-only**. Coordinate-only neighbors in the Megalith family include original near-vertical support/glass-edge face evidence; this is a source spatial contact, **not** a verified runtime adjacency/penetration rule.
- Full source-native evidence artifact `t21-undertow-phase10-exact-edge-topology`: per component the original face count, every boundary edge's true OBJ vertex IDs, original and projected XYZ endpoints, all real static-original matching neighbor source face IDs/materials/original normals, source graph vs coordinate-only distinction, aggregate counts, and explicit no-gameplay-authority flags. There is no fabricated triangle/bridge/slab generated by this audit.

## 3D visual QA — 48 source-edge diagnostics, no source mesh changes
- `src/stage/undertow/UndertowSpillwayPhase10EdgeDiagnosticGeometry.ts` preserves **48 source edge endpoints exactly as Float64** (deterministic compressed data); the CI source proof re-checks every endpoint against the original pinned OBJ Phase10 evidence and the Phase9 face source vertices.
- In `src/app/UndertowVisualReviewApp.ts`, two **opt-in, default-OFF, visual-only** line groups identify **orange 30 XYZ-coincident-but-not-welded seams** and **red 18 edges without any exact source-edge neighbor**. They are displayed as thin scene-space boxes only as debug visuals; no StageDefinition, gameplay collider, playable floor, paint, nav, kill-plane, spawn/rule, roof or artificial bridge is added. Original source mesh count stays **124**. Toggle labels and on-screen explanation clarify evidence limits.
- The independent five-camera source screenshots remain OVERVIEW/TOP/POS→NEG/SPAWN A/SPAWN B. An **optional sixth diagnostic image** `T21_PHASE10_EDGE_TOPOLOGY_DIAGNOSTIC.png` is now captured with `reviewTopologyEdges=1`; it is separate from the required 5-view PASS criterion. The screenshot manifest makes explicit `gameCollisionConnectivityProof=false` and `authorizesVisualFreeze=false`.
- QA: dedicated source `UndertowSpillwayPhase10OriginalEdgeTopologyQa.test.ts` checks precise source identities/neighbor orientation classes, per-edge source 3D endpoints, complete 48 edge classification, and source-only/runtime authority. The dedicated CI uses `T21_PHASE10_TOPOLOGY_JSON` and **fails closed if its pinned original evidence is missing**; full Vitest normally omits the massive source fixture while preserving all source and scene invariants. TypeScript and other 124-mesh regressions remain unchanged.
- Source contact alone does not authorize a physical or traversable stage connection. **Visual Freeze remains blocked**, and no gameplay stage activation/PR merge is authorized.

## Next evidence gate
1. **Central metal underside 16 unmatched edges**: investigate nearby original meshes by 3D elevation and original source placement, prioritizing confirmed static faces over PntSet. Record actual original nearest edge distance and original normal/height; do not fabricate a bridging panel because a 2D line looks empty.
2. Determine whether XYZ-only seams require intentional separate graphics meshes rather than runtime collision topology; only validate game collision via separate game-reference evidence.
3. Repeat 5-view and topology diagnostic captures after any confirmed source addition. Keep T20 production, all previously approved exact original vertex data, and 64 walk-source coverage preserved.

---

# T21 Phase 9 — down-facing original source evidence and exact underside review (2026-10-09)

## Source-defined downward surfaces
- Previous baseline: 114 exact original review-source components = 64 walk-facing + 12 Phase5B vertical + 2 Phase6 high + 20 Phase7 supports/glass + 16 Phase8 central/flank/edge. This baseline and the 42-point outer hard silhouette are unchanged. T20 production remains `inkworks-junction`; T21 `activationReady=false`, PR #5 Draft/open and unmerged.
- Phase9 introduces a new independently audited original source class: **triangles with original OBJ normal Y ≤ −0.65**, grouped by original OBJ-vertex connected components within each original object/material. Conservative source selection: `Fld_Temple01_` static objects only, exclude StageSide and PntSet, original Y within [−4,30]m, source original 3D area ≥ 2m²; screen each triangle against the frozen hard XZ envelope using 7 samples, not full polygon proof. Source faces remain unchanged.
- The inventory yields **166 total orientation components**, of which `outsideHardBoundarySamples===0` candidates are considered for source-only review, not runtime solids. Artifact `t21-undertow-phase9-original-downward-source` stores the full inventory, each XYZ bounds, materials, source face index, orientation class and 7-sample disposition.
- Selected **5 original 180° mirrored pairs / 10 original static source-face components / 84 binary64 XYZ vertices**, with **218.175240766424m² summed original 3D triangle area**: (a) **2 central FloorMetal00 down-facing components** at exact Y 4.5255m (67.741m² each); (b) **4 flank FloorFence00 down-facing components** at source Y 5.8m (12.8213m² each); (c) **2 flank Megalith00 source faces** at Y 2.5m (8.17465m² each) plus **2 inner Megalith00 faces** at Y 1.0m (7.52929m² each).
- All 10 selected source face components preserve original triangle winding and binary64 source XYZ exactly; original 180° reflected coordinates match to ~1e−14m without fabricated symmetry. Subsystem `UndertowSpillwayPhase9DownfaceSourceGeometry.ts` embeds lossless deterministic gzip of original 2,036 bytes (10 per-mesh little-endian vertex counts and original vertex XYZ triples) and labels everything as **SOURCE-ORIENTATION-ONLY**.
- Independent CI fixture `t21-undertow-phase9-exact-source-underfaces` records all 84 original XYZ triples and material/area/Y. `scripts/UndertowSpillwayPhase9DownfaceQa.test.ts` requires byte-exact equality with independently audited pinned KiTrix OBJ, 124 unique original-source review identities, 64 unchanged floor-source meshes, immutable production T20 and disabled runtime T21.
- Three **isolated review-only toggle layers**: `Center downfaces` (subtle cyan), `Flank fence downfaces` (pale lime), `Megalith downfaces` (sand gold). Included in `Floors + 3D structure` and `All evidence`; omitted from `Walk-source only`. All are optical inspection overlays with **no gameplay collision, ceiling, paint, route, ladder, scoring, navigation, kill-plane, actor placement or floor authority**.

## Authority and what remains
- Displayed original face cohorts become **124 total** = 64 + 12 + 2 + 20 + 16 + 10. The only original walk-source floor-XZ ledger is still the original 64 face-source cohort; original missing/undisplayed XZ surface metrics DO NOT change when downward faces are shown and DO NOT prove missing walkable platforms.
- Original OBJ face normal downward is evidence of a geometric facing direction, **not** proof that that surface exists or collides as a playable in-game underside, nor proof of the vertical connection between upper and lower floors. No provisional closed solid, unsupported vertical ramps or filled XZ holes are generated.
- Next review gates: test source exactness and all TypeScript/Vitest/Pass18 suites, capture original camera five views on actual WebGL2 renderer, compare against prior Phase8 five views, pay special attention to central metal panels potentially visually occluding original floors. Visual Freeze requires judged reference-aligned source geometry and original actor placement proof. Separate 4v4 gameplay QA will be required later if runtime activation is explicitly authorized.

---

# T21 Phase 8 — source-native central towers, upper flanks and side edge faces (2026-10-09)

## Original frozen baseline
- Phase7 prior whole-workflow CI #1357 SUCCESS. T20 production `inkworks-junction`, T21 `activationReady=false`, Draft/open/unmerged PR #5 and exact frozen outer 42-vertex XZ outline unchanged.
- Phase7 review cohort = 64 original walk-facing + 12 Phase5B vertical + 2 Phase6 high + 20 Phase7 supporting source meshes = **98**. The **64 walk-only source XZ floor coverage ledger** stays unchanged in Phase8.

## Phase8 pinned Temple01 source selections
- Sixteen original static near-vertical source mesh components, exactly eight original near-symmetric pairs, **636 source binary64 XYZ vertices** without rounding and **1,190.818341838822m² summed ORIGINAL 3D triangle area**. No new playable XZ floor area or gameplay navigation evidence.
- **8 central tower faces** from `Fld_Temple01_Pillar00`, four mirrored pairs: two pairs original Y=9.4…21.4m, two pairs Y=3.4…15.4m. These are original broad side/support surface triangles, NOT confirmation of a sealed in-game tower/ceiling or gameplay collider.
- **4 upper flank high-support faces** from `Fld_Temple01_PillarBase04`, two mirrored pairs, Y=3.5…11.5m, added beside Phase5B's existing original pillar strips, without inventing missing top/bottom caps.
- **4 edge-liner vertical source faces** from `Fld_Temple01_FloorLine02`, two mirrored pairs, one Y=5…7m by outer side construction and the other Y=0.5…2.5m near the central-stage edge. Despite a source name containing “Floor”, these are near-vertical source original *face triangles*, NOT walkable floors, paint, collider or routes.
- All 16 paired components passed original vertical inventory **7-per-triangle sampled hard XZ silhouette**; pair axis `xA+xB=0.229368288528164`, `zA+zB=0.194564295456822`, equal original height ranges and XYZ mirrored to floating tolerance. The sampled XZ envelope is NOT an exact polygon clip. The original pinned OBJ is the sole XYZ geometry authority; active game instance transforms, wall optical/collision semantics and topology connections remain unknown.

## Source pipeline and QA
- Pinned KiTrix `Vss_Temple01.obj` extraction lives at end of `scripts/undertow-temple01-upper-terrain-audit.py`. New `t21-undertow-phase8-original-support-source` Actions artifact contains 16 component identities, original Y/area, mirror distance, 636 exact triangle vertex Float64 XYZ words, and packed lossless source dictionary/index data. Runtime promotion deliberately disabled.
- Review stores deterministic gzip `UndertowSpillwayPhase8OriginalPacked.ts` of 229 source float64 dictionary entries and 16 original u16 index streams, decoded by standard browser `DecompressionStream` in `UndertowSpillwayPhase8StaticSourceGeometry.ts`. No geometry inference, rounding or altered triangle winding; actual renderer naturally converts source to float32 at GPU display, while source authority remains binary64.
- New `scripts/UndertowSpillwayPhase8StaticSourceQa.test.ts` byte-compares each of **636 source XYZ triples** against the independent original OBJ extraction, cross-checks area, Y, source materials, 114 unique total IDs, T20 production unchanged and T21 activation disabled.
- The new inert visual review layers are **Central source towers** (violet), **Flank high supports** (mint) and **Source edge faces** (gold). All have independent switches and are included in `Floors + 3D structure` and `All evidence` presets; omitted from `Walk-source only`.
- Updated original-source visual count **114** = 64 walk + 12 Phase5B + 2 Phase6 + 20 Phase7 + 16 Phase8. This total describes **displayed source triangle components, not playable area, fully reconstructed game objects, collider count, completed roofs or corridors**.

## Outstanding
1. Browser five-view render capture and **human visual comparison** of central tower occlusions and side supports; add missing actual source transitions only where source XYZ/topology evidence permits. Screenshots are not automatically Visual Freeze.
2. Confirm upper-and-lower side route/central platform physical continuity, real roof/underside placement, respawn paths and actor PntSet instances with valid active game placement evidence.
3. Source-only appearance remains no authority for gameplay glass, shooting, paint surfaces, nav, kill planes or collision. No runtime 4v4 promotion without separate approval and testing.
4. PR #5 remains Draft/open and unmerged; T20 remains production.

---

# T21 Phase 7 — original multi-tier flank supports and center glass frames (2026-10-09)

## Source selection and exactness
- Starting baseline: Phase6 **64 walk-facing + 12 Phase5B near-vertical + 2 Phase6 high = 78 original source review meshes**, source-native Y/XYZ unchanged, 42-vertex playable silhouette preserved, T20 prod `inkworks-junction`, T21 `activationReady=false`, Draft PR #5 unmerged.
- New Phase7 original KiTrix `Vss_Temple01.obj` static model source: **10 near-mirrored pairs / 20 additional original strongly vertical triangle components**, **1,272 byte-exact Float64 XYZ vertices** and **515.1159629074m² sum 3D source triangle area**. This is NOT playable surface XZ area and NOT a closed game/collision solid.
- **Six mirrored pairs (12 meshes) of `Fld_Temple01_PillarBase02`** on the two flank lanes: each selected original shell has three original Y bands `[-1,1.4]`, `[1.4,3.4]`, `[3.4,5.8]` with two pillar-source component locations per side. Display material is green-mint. Original source boundaries, vertical voids and all triangle winding remain unmodified.
- **Four mirrored pairs (8 meshes) of `Fld_Temple01_Glass00`** around the middle structure: original Y bands `[3.5,6.2]`, `[6.6,9.2]`, `[9.6,12.2]`, `[12.6,15.3]`. The 0.4m gaps between some layers are **native source gaps**, not silently filled with invented glass/frames. Source glass receives only translucent blue review tint; original texture, game optical transparency and projectile/collision behavior are unverified.
- Original source almost, but **not perfectly**, mirrored: pairs 1–3 have native **0.0001037117m (≈0.104mm) max reflected XYZ difference** and ~0.0000871m² native triangle area difference. We preserve those original differences, never force fabricated perfect symmetry. Other selected pairs are reflected to float precision.
- All 20 components are original static `Fld_Temple01` source, pass frozen 7-samples-per-triangle hard-boundary screening; this screening **does not prove exact polygon containment or active game placement**. Exclude external StageSide abyss/actor PntSet and do not authorize physical/gameplay mesh promotion.

## Visual review and independent verification
- Packed module: `UndertowSpillwayPhase7OriginalPacked.ts` + `UndertowSpillwayPhase7FramedSourceGeometry.ts`. The lossless Float64 coordinates are stored in a 144-value dictionary with 8-bit triangle component indices, compressed as deterministic gzip and decompressed by native DecompressionStream. No source Y rounding or source vertex construction.
- CI independent fixture: `t21-undertow-phase7-framed-source` from the pinned OBJ `/tmp/t21-structural-frame-phase7-source.json`; dedicated `UndertowSpillwayPhase7FramedSourceQa.test.ts` verifies **all 1,272 original vertex XYZ binary64 words byte-for-byte**, original per-component identities, materials, heights, surface areas, bounded measured mirror asymmetry, source-scope limits, uniqueness among older 78 and unchanged T20/T21 runtime gate.
- Existing **64 source-floor meshes + 12 near-vertical + 2 high + 20 Phase7 = 98 distinct original source review mesh IDs**. Floor XZ coverage ledger still includes ONLY the same 64 walk-source meshes; the previously calculated **4,386.5m² undisplayed XZ** is unchanged and does NOT identify missing playable floors.
- The visual review adds independently toggleable **Source side supports** and **Source glass frames** layers, included in the `Floors + 3D structure` display preset and omitted from `Walk-source only`. A separate `All evidence` preset still exposes provisional XZ and unresolved markers. All materials are inert review-only, no gameplay StageDefinition changes.
- CI #1355 produced **five real 1600×900 Chrome WebGL2 review images** at OVERVIEW, TOP, POS_TO_NEG, SPAWN_A, SPAWN_B in `t21-undertow-real-five-view-capture`. Images were inspected: visible original pillars, updated source frame structures, nonblank floor/reference body and readable revised sidebar. Do not confuse successful screenshot capture with full source/reference fidelity validation.

## Remaining blockers (Visual Freeze intentionally NOT set)
1. Original reference-aligned 3D connectivity across central, flank and side ramps, underside construction, support footprint and multi-level walkability — currently only partial source face strips.
2. Original central objects/sponge, dynamic actors, PntSet source instancing, actual projectile glass/mark sensor interaction and body/edge collision/motion/CPU authority, none verified by static OBJ extraction.
3. Confirm paint, collision, nav, kill boundaries and both spawn-side playable routes in a separate authorized runtime 4v4 QA gate after geometry confidence and five-view human review.
4. Retain Draft/open PR #5, no merge, no production switch and no change to prior phase Freeze.

---

# T21 Phase 6 visual inspection QA — 2026-10-09

Actual CI #1346 five-view Chrome WebGL2 screenshots were obtained (OVERVIEW, TOP, POS_TO_NEG, SPAWN_A, SPAWN_B) as original-rendered 1600×900 PNGs in the `t21-undertow-real-five-view-capture` artifact. Source/render URL, 5 hashes and backend were verified by the manifest; these screenshots were visually inspected.

- **PASS (capture mechanics)**: nonblank original PlayCanvas source-face geometry appears across the five views; distinct camera screenshots; review-only graphics and original source evidence remain separate from runtime state.
- **FAIL (review UI usability)**: expanded statistics used CSS grid `minmax(0,1fr) auto`, where very wide value text crushed left labels to a few characters per line and pushed presets/camera buttons off-screen. Fix: collapse lengthy metrics and color explanation by default, constrain value columns to 56%, allow wrapping and emphasize selected camera/preset.
- **NEEDS DETAIL (5-view orientation)**: POS and NEG spawn screenshots showed near-identical opposing symmetric source compositions, distinguishable largely by spawn marker tint. Review-only spawn camera yaw changed from 0°/180° to 24°/156° (source gameplay spawn coordinates and runtime camera remain unmodified) to improve visibility of asymmetric occlusions/sidewalls. Validate in a fresh five-view artifact.
- **NOT FREEZE**: cyan/orange sources still show unmodeled vertical construction and incomplete multi-level context, and two tall pale-gold source panels are not a confirmed continuous roof. Original PntSet actor placements, high structure existence vs physical game authority and source exterior containment remain unresolved.
- Stage T20 production `inkworks-junction`, T21 `activationReady=false`, 42-vertex hard boundary, 64 walk+12 near-vertical+2 high original source meshes, and existing 0.5m XZ ledger remain unchanged. No collision/paint/nav/CPU/score/kill/fall promotion; PR remains Draft/unmerged.

---

# T21 Phase 6 — exact upper-source review and automatic five-view evidence

- Baseline: Phase 5B 64 walk-facing source meshes + 12 near-vertical source faces, all review-only. T20 production remains `inkworks-junction` and T21 `activationReady=false`; no merge, source-geometry rewrite, or runtime promotion.
- Source audit `t21-undertow-high-structure-phase6-source` records **seven original symmetric high-structure pairs / 14 source components** from pinned Temple01 original OBJ. Original 3D triangle area **2,291.6400892 m²**, not added walkable area or a confirmed ceiling surface.
- Phase 6 review displays **only one original mirrored pair / two SealObject00 near-vertical source panels**, Y=25.0→45.4m. Original float64 XYZ is copied without rounding; independent pinned-OBJ source fixture CI compares exact 12 vertex triples. Other 12 audited high-source candidates are retained as evidence, not drawn as fake complete roofs.
- All source review inventory: **64 original walk-facing + 12 vertical glass/metal/pillar + 2 high panels = 78 distinct original-source face meshes**. The 0.5m floor XZ coverage report is unchanged (previous ~4,386.50m² unshown at 64 walk meshes), since high/vertical faces are not playable floor.
- A separate `High source panels` visual toggle uses translucent pale gold. No new collision/paint/nav/CPU/fall-out/route/score/weapon authority is granted; active game roof/underside semantics and complete solid continuity are unresolved.
- Phase 6 source unit QA `UndertowSpillwayHighSourcePhase6Qa.test.ts` checks all 78 IDs unique, the 64/12 prior cohort counts, all 7 source audit pairs, exact 12 selected XYZ vertices and inactive T21.
- New `scripts/t21-review-five-view-capture.mjs` attempts to capture real WebGPU/browser PNGs for OVERVIEW, TOP, POS_TO_NEG, SPAWN_A and SPAWN_B after the CI Pages build, producing `t21-undertow-real-five-view-capture` artifact with `manifest.json`. On incompatible headless browser/WebGPU it explicitly sets `BLOCKED` with reason. On success it sets `CAPTURED_PENDING_HUMAN_VISUAL_QA`; **neither status is an automatic Visual Freeze PASS**.
- Next gates: inspect actual screenshot pixels/images; check topology relative to original reference, internal vs exterior wall distinction, glass and source-high occlusion, underside supports, gaps, spawn viewpoints. Only then consider visual freeze; full runtime 4v4 QA is separate.

---

# T21 Phase 5A/5B — source-grounded VERTICAL 3D structure review (2026-10-09)

## Current objective and boundaries
Continue from Phase4 64 original walk-oriented surface meshes, successful GitHub Actions #1316 and T21 Draft PR #5. **No stage activation, no production T20 change, no merge.** Preserve the exact frozen 42-vertex exterior and all earlier reviewed geometry.

A 2D XZ missing-coverage cell does NOT mean a missing floor; vertical source components are evaluated **separately** from the 0.5m floor/XZ ledger. In particular, a near-vertical face may project to zero XZ area and must not be counted as walkable coverage.

## Phase 5A original Temple01 whole-stage vertical audit
- Original pinned `Vss_Temple01.obj` (sha256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`) is the only XYZ/Y input.
- Source filters: original Temple01 active object-name prefixes, triangle `abs(normal.y) <= 0.32`, a shared-OBJ-vertex connected component within the same original object/material, 3D source area >=4m² and vertical span >=0.8m. These are *search criteria*, not a proof the component is a collision wall.
- Output artifact: `t21-undertow-vertical-source-inventory` (`/tmp/t21-vertical-source-inventory.json`) with exact source object/material/connected component ID `vN`, 3D bbox/Y, source area and 7 sampled points per triangle against the existing hard silhouette.
- **886 candidates**, of which **414** have every tested XZ point within the hard silhouette and **472** have at least one sample outside. Zone breakdown (candidate/inside): CENTER 293/104, POS 99/81, NEG 100/85, LEFT_SIDE 197/81, RIGHT_SIDE 197/63.
- Huge `StageSide01` / `StageSide02` candidates with Y down to **-45m**, remote/high ceilings and all external geometry remain **evidence, not blanket geometry promotion**. Even a passing 7-sample criterion cannot prove 100% polygon containment. `FldObj/PntSet` actor placement is unresolved.

## Phase 5B exact original 3D structural source faces — REVIEW ONLY
Six independently source-extracted static `Fld_Temple01` mirrored pairs, **12 new source-face meshes**:
1. `Fld_Temple01_Glass01 v41/v21` — POS/NEG near side route, original project Y **3.1–5.5m**, ~47.29m² source triangles per side.
2. `Fld_Temple01_WallMetal00 v263/v264` — POS/NEG wall-metal parallel source, Y **3.1–5.5m**, ~47.29m² per side.
3. `Fld_Temple01_Glass02 v1/v0` — lower side faces, Y **0.5–2.5m**, ~39.41m² per side.
4. `Fld_Temple01_Glass01 v58/v59` — near-center vertical glass source, Y **3.0–5.5m**, ~21.40m² per side.
5. `Fld_Temple01_WallMetal00 v276/v277` — near-center vertical wall metal source, Y **3.0–5.5m**, ~21.27m² per side.
6. `Fld_Temple01_PillarBase04 v177/v176` — lateral support facing source, Y **3.5–10.2m**, ~19.13m² per side.

**108 exact original project XYZ float64 vertices**, 391.5966251m² summed original 3D source triangle area. Each `vN` refers to a connected component of **strongly vertical original source TRIANGLES**, *not* an entire game wall object, a completed volume, a collision mesh, a complete pillar, or evidence of activeness in a game instance.

Module `UndertowSpillwayVerticalSourcePhase5BGeometry.ts` stores original coordinates losslessly; CI `UndertowSpillwayVerticalPhase5BSourceQa.test.ts` compares **each XYZ word bytewise** with a second pinned-OBJ extraction, checks exact source component ID/material/Y, 180-degree original symmetry, no source-ID reuse with the 64 walk-surface cohort, and no production/runtime use. Phase5B original OBJ fixture is artifact `t21-undertow-exact-vertical-phase5b`.

The review UI adds a separate `Vertical source faces` layer: cyan translucent glass, blue-grey metal, violet pillar. These are two-sided **display materials only** to allow orbiting/reading; actual optical opacity, collision/paintability, routing and source actor bindings remain unknown. The source mesh original data is never modified by this display tint or the existing render-only offset.

### Counts, source evidence and honest completion status
- Walk-oriented source triangles: **64 source meshes** (unchanged).
- New near-vertical source triangles: **12 source meshes** (6 original mirror pairs).
- Total source-triangle visual groups: **76** distinct original source IDs, but **NOT 76 physically verified game objects**.
- XZ floor display coverage: unchanged by vertical-source additions; previous 64-mesh `UNDISPLAYED` figure **4,386.50m² sampled XZ** remains a reference, not a ground truth floor deficit.
- The 18-region macro ledger status and T21-D reviewed solids have not been changed or invented.
- Whole-stage original **3D** composition is still incomplete: remaining true walls, roofs/undersides, support holes, source actor placement and all five screenshot/viewpoint checks are unresolved. Visual Freeze and full 4v4 runtime QA are **not** authorized.

## Remaining next gates
1. Final CI source fixture + TypeScript, Vitest, all previous Pass18 and Pages build; do **not** claim full SUCCESS until final HEAD run completes.
2. Actual 5-view browser renderer: OVERVIEW, TOP, POS_TO_NEG, SPAWN_A, SPAWN_B. Verify glass layering/opacity, sidedness, wall-face overdraw, existing gameplay solids, and distinguish genuine source faces from provisional XZ overlays. This is an explicit human-visible QA gate.
3. Source-driven wall/roof/underside/StageSide **family selection** from 886 candidate inventory, with full source triangulation and mirrored pairing before each visual-only promotion, not from guessed flat/pit fill. Keep out-of-outline and `PntSet` candidates deferred.

---

# T21 — Phase 4 whole-stage side-flank & elevated ramp evidence (2026-10-09)

## Validated model source, changes and authority
- Baseline: T21 Visual Review **54 unique source-only meshes**, CI #1305 SUCCESS; PR #5 remains Draft/open/unmerged. Frozen 16/10/8/14/6 prior cohorts are preserved unchanged.
- Whole-stage pinned Temple01 source inventory now directly informs the **flank/elevation review**, rather than locally cropped Pass18G discovery. From **777 walk-token upward source components** (not all 3D geometry materials), selected five static `Fld_Temple01` mirrored pairs with exact Y and all 7 XZ samples per triangle within the unchanged 42-vertex hard boundary.
- **Phase4: 10 new unique source meshes**, 294 original expanded triangle vertices, summed **754.3285510702793m² ORIGINAL 3D source triangles** (NOT incremental floor/plan area):
  - `Fld_Temple01_FloorConcrete03 c0/c8` — bilateral flank base Y=+4.5m; source area ~302.03m² *each*.
  - `Fld_Temple01_FloorConcrete03 c1/c11` — side high shelf Y=+6m; ~35.99m² each.
  - `Fld_Temple01_FloorConcrete03 c2/c10` — transition Y=+6 to +7.5m; ~13.73m² each.
  - `Fld_Temple01_FloorSlope00 c0/c29` — elevated ramp Y=+7.5 to +9m; ~12.71m² each.
  - `Fld_Temple01_FloorSlope00 c1/c28` — other elevated ramp Y=+7.5 to +9m; ~12.71m² each.
- The data module `UndertowSpillwayFlankElevationPhase4Geometry.ts` holds original float64 triple XYZ values via a lossless float64 dictionary. The CI `UndertowSpillwayFlankElevationPhase4Qa.test.ts` compares **every original 64-bit XYZ word** against independently exported pinned source JSON, and checks Y, side, material, source ID, hard-silhouette samples, pairing, no runtime authority and source identity uniqueness.
- A separate `Flanks / high ramps` toggle was added to `?stageReview=undertow`. Rendering is review-only and uses the inherited source-mesh depth offset, not new authoring/movement geometry.

## Measured 0.5m XZ display coverage after Phase4
- Original 54 source meshes, stage sample area 8,969.75m², unshown **4,530.50m²**:
  - CENTER 1,248.50; POS 368.25; NEG 372.25; LEFT_SIDE 1,286.75; RIGHT_SIDE 1,254.75m².
- New 64 source meshes, same stage sample area, unshown **4,386.50m²**, a **144.00m² reduction**:
  - CENTER 1,248.50; POS 368.25; NEG 372.25; LEFT_SIDE 1,214.00; RIGHT_SIDE 1,183.50m².
  - LEFT_SIDE improvement **72.75m²**, RIGHT_SIDE **71.25m²**. The 3D source-triangle area sum 754.33m² is NOT a claim of equivalent new walkable XZ area.
- This ledger is a DISPLAY sampling comparison. A source-only cell does not establish collision, gameplay participation, travel route, paintability or kill/fall state. No missing cell is inferred to be a floor.

## Next QA / remaining blockers
1. PASS: freeze source identity/XYZ/Y and mirrored counterpart coverage through independent OBJ export; pass full TS/Vitest, historical Pass18 audits and Pages build on final HEAD **before calling CI SUCCESS**. Source fixtures are uploaded as Actions artifacts.
2. Actual 5-view renderer review — OVERVIEW, TOP, POS_TO_NEG, SPAWN_A and SPAWN_B — still needs **human-visible rendering verification**; no Visual Freeze yet. Check layer z-fighting, unintended overdraw, actual thickness/vertical gaps and source source-versus-runtime distinction.
3. Continue whole-stage **multilevel and wall/sidewall geometry** search instead of guessing a plain filler slab. Investigate large remaining LEFT_SIDE/RIGHT_SIDE gap clusters, branch topologies, lower support and all boundary-deferred mirror pairs; PntSet actor position also remains unresolved.

## Strict scope
- Existing frozen source tri vertices, hard outline and T20 production `inkworks-junction` are unchanged.
- T21 `activationReady=false` and review-only; no new collision/paint/nav/score/kill/fall or CPU behavior, no PR merge.
- The source export enforces 7 XZ samples per triangle, which does **not** constitute rigorous containment for every possible concave-polygon edge crossing. Unsupported source/runtime facts remain explicitly unresolved.

---

# T21 — Phase 0 Coverage v3.1 / broad static terrain (2026-10-09)

## Whole-stage source audit vs previous local discovery
- Original source: pinned KiTrix `Vss_Temple01.obj`, original Pass18C walk-face extraction, excluding FloorLine and FloorFence mark/overlay classes.
- New `T21_WHOLE_STAGE_WALK_SOURCE_INVENTORY_V1` scans **all active, upward-oriented Temple01 walk-token components** instead of Pass18G's local 12m search boxes. It is **NOT** every possible material, collision asset, actor instance, or gameplay terrain.
- First measured source inventory: **777 unique source components**; **734** have all 7 source triangle samples per face within the frozen 42-vertex silhouette; **43** need boundary reconciliation. The rule is **sample-based, not exact concave-polygon intersection**.
- Plan bins by bbox center: center 305 (34 boundary flagged), POS 125 (0), NEG 125 (0), LEFT_SIDE 111 (3), RIGHT_SIDE 111 (6). These are diagnostic groups, NOT authoritative route borders.
- Artifact `t21-undertow-whole-stage-walk-source-inventory` carries every component ID, original material/object, source triangle area, Y range, plan bbox, boundary sample disposition and pending PntSet placement authority.
- Previously frozen `FloorConcrete02 c2/c17`, `c3/c16` are **still quarantined on both mirrored sides**. The 42-vertex exterior silhouette and source model were not modified.

## Source additions (review ONLY)
### Batch2, seven original mirrored pairs / 14 meshes
- `FloorConcrete00 c7/c6` at project Y+3; `FloorGrass00 c3/c1` at -1.5; `FloorSlope00 c9/c20` at 0→+0.7507.
- `FldObj_Temple01_PntSet` source slopes: four `FloorSlope00` meshes (-3→-1.5) and four `FloorSlope01` meshes (~0.12→2.93).
- **14 source-exact meshes**, total **157.9758m² summed original 3D triangle area**, with 8 `PntSet` components marked **SET_ACTOR_PLACEMENT_UNRESOLVED** and separately toggleable. The geometry exists in the source but final in-game actor placement is not proved.
- The 0.5m XZ review coverage count changes from **5,200.75m² unshown for 34 source meshes to 5,076.50m² for 48**. The **124.25m²** improvement is independent of and must not be confused with source triangle-area sum. Both figures are approximate display-plan measurements, never walkability proofs.
- CI checks every decoded float64 triple against the original Pass18C JSON, source Y, mirror symmetry and no runtime promotion.

### Broad static floor terrain, three NEW mirrored pairs / 6 meshes
- `Fld_Temple01_pCube20989_1__FloorConcrete02 c12/c1`, Y+1.5, source area **214.8656m² per side**.
- `Fld_Temple01_pCube21525_1__FloorConcrete00 c8/c3`, Y+7.5, source area **127.5031m² per side**.
- Same static FloorConcrete00 `c11/c0`, Y+9.0, area **59.6965m² per side**.
- Same static FloorConcrete00 `c9/c2`, Y+3.0, area **59.4276m² per side**, is **NOT newly registered**: both members duplicate source IDs already present in the frozen original 16-mesh review cohort; the fourth exported pair is retained only as a negative-control source audit.
- **6 newly registered original mirrored meshes, 3 pairs**, exact unmodified source triangles. The fourth exported pair is recognized as an existing frozen source (2 meshes), not counted as an addition. Binary float64 dictionary uses bit-exact XYZ, and the dedicated CI QA checks all original vertex triples against an independent verified OBJ export. Areas are summed 3D source, not new XZ coverage.
- Source itself is static `Fld_Temple01`, not PntSet; collision, scoring, paint, route continuity and game-specific participation are still unproven.
- The existing full 16 + local 10 + Phase1 8 + batch2 14 + broad static 6 now comprise **54 review-only original-source meshes**. Separate review-layer toggles preserve explicit provenance.
- The broad-floor group's incremental unshown-XZ improvement must be taken from the next successful Ledger v3 CI rather than guessed.

## Safety gates / next decisions
- T20 production stays `inkworks-junction`; T21 stays `activationReady=false`; PR #5 stays Draft/unmerged.
- No fake slabs, guessed Y, convenience off-mesh links, collision/nav/paint/scoring/fall-out or CPU promotion.
- Source-mesh world-space Y from Pass18C is exact; the visual renderer still applies its existing small render-only overlap offset.
- First run the new whole-stage inventory, source-batch exactness, full TS/Vitest and historical Pass18 audits; five in-browser camera views remain a separate **human-renderer QA gate**.
- Use the full-stage 777-component ledger to prioritize larger missing left/right side-ground patches, lower/high multilevel overhang source families, then non-ground wall/sidewall meshes. Pair-level checks and registered author evidence precede any Freeze.

---

# T21 Undertow — Coverage Ledger v3 + Phase 1 visual-only source terrain

## Status and strict authority gates
- Scope: `codex/t21-undertow-evidence-ledger`, PR #5 Draft/open/unmerged.
- **T20 production**: `inkworks-junction`, untouched.
- **T21**: review-only, `activationReady=false`. No newly added collision, camera query, paint, scoreability, navigation, or fall-out kill geometry.
- 42-vertex XZ hard silhouette is authoritative **for stage-envelope review**, NOT proof of a flat floor.
- Legacy cyan PDF annotation regions are not internal water/void gameplay.
- Original Pass18C/18G source fixture is pinned by the existing Temple01 KiTrix LFS SHA-256 and source audit on PR CI.

## Phase 0 — what Ledger v3 actually measures
- `UndertowSpillwayCoverageLedgerV3.ts` raster samples the 42-vertex XZ hard silhouette on a **0.5m cell-center grid**, comparing existing T21-D solid footprints and exact source triangles.
- Separately accounts for reviewed only, source only, overlap, and **XZ without any currently displayed reviewed solid or source mesh**.
- Shows five reproducible diagnostics bins (`CENTER`, `POS`, `NEG`, `LEFT_SIDE`, `RIGHT_SIDE`), plus largest four-connected unshown cell groups.
- `UNDISPLAYED` is a **plan-projection display gap**, not a physical abyss, missing walkable floor, or evidence that stacked platforms must connect. Plan samples cannot resolve overhang/open-air structure.
- The stage-envelope underlay and provisional yellow XZ-only surfaces are excluded from counted displayed geometry; they cannot falsely fill holes.
- Existing broad 18-region macro coverage classifications remain frozen. The five diagnostic bins do **not** redefine official route or terrain-region borders.
- Summed 3D source triangle areas must **not** be added to 2D XZ cell areas, and areas that overlap are not unique coverage.

### GitHub Actions #1278 sample findings (0.5m XZ center grid)
- Audited hard-silhouette XZ sample area: **8,969.75 m²**.
- Undrawn XZ plan sample area: **5,200.75 m²** (about **58.0%**). These are samples, not proven absent ground.
- Undrawn by diagnostic bin: center **1,387.50 m²**, POS **447.50 m²**, NEG **453.50 m²**, left-side **1,471.50 m²**, right-side **1,440.75 m²**.
- With connected-gap segmentation respecting the five bin borders, biggest individual clusters: center **1,343.25 m²**, left side **1,167.00 m²**, right side **1,144.25 m²**, NEG **304.00 m²**, POS **303.50 m²**. These are areas to **investigate**, not permission to fill with slabs.
- Pass18G local candidate discovery yields **237 unique source component IDs** after cross-scope deduplication. The source-search volumes overlap the centerline and some IDs appear in both POS and NEG searches; scope names must not be substituted for actual source-mesh side authority.
- The paired `FloorConcrete02 c2/c17` and `c3/c16` components remain grouped under **Phase 3 boundary-reconciliation hold**, including the sides that are individually inside the silhouette.
- All coverage percentages may change with finer sampling. The v3 report uses cell-center sampling and never claims a complete volumetric terrain audit.

## Source-candidate audit and Phase 1 evidence
The paired, exact-source terrain additions below all pass the known hard-silhouette triangle-sample check and reflect the **original project-space source vertices and Y**. The CI audit independently compares every reconstructed expanded triple with the full original Pass18C JSON fixture, in order to reject accidental rounding or regeneration.

| Pair | Original source family | POS ID | NEG ID | Source Y (project m) | Combined source triangle area m² |
|---|---|---|---|---|---:|
| 1 | `FloorConcrete00` | c4 | c5 | 7.5 | 687.2196 |
| 2 | `FloorConcrete02` | c6 | c10 | 0 | 132.8381 |
| 3 | `FloorConcrete02` | c4 | c14 | 0 | 70.4259 |
| 4 | `FloorSlope00` | c4 | c25 | -1.5 → 0.0 | 55.2257 |
| **Total** | **4 mirrored pairs, 8 meshes** | | | | **945.7094** |

All 8 are intentionally new source components and are not reused from the frozen 16-mesh source-native or 10-mesh local supplement cohorts. They are registered **only** in `UndertowVisualReviewApp`, where they use the source-native review root and its existing orange toggle. No StageDefinition/runtime registration occurs. Connectivity confidence remains **UNRESOLVED** even though the visual XYZ is original source evidence.

Known outstanding source candidates are not silently added:
- `FloorConcrete02 c2/c17` and `c3/c16`: previously rejected due to exterior hard-silhouette protrusions; requires independent boundary reconciliation. Neither the source nor 42-vertex hard boundary is clipped or moved.
- Candidate materials and positions need source-specific footprint/Y/overlap checks; Pass18G local discovery is not exhaustive full-stage topology and does not establish physical connectivity.
- Walls, posts, sidewalls and multilevel structures are deferred to a distinct phase and must be sourced rather than guessed.

## CI review and evidence artifact
PR workflow sequence:
1. Verify pinned KiTrix OBJ by SHA-256.
2. Re-run Pass18C upper-terrain source audit and Pass18G local source candidate inventory.
3. Run `scripts/UndertowSpillwayCoverageLedgerV3Audit.test.ts` with `T21_PASS18C_SOURCE_JSON=/tmp/t21-pass18c-upper-terrain.json` **before general typecheck and full suite**.
4. Verify 34 total original-source review meshes (16 + 10 + 8), IDs, source Y, balanced mirroring, non-promotion, and 8 Phase1 triangle-list exact matches to source JSON.
5. Export `/tmp/t21-coverage-ledger-v3.json` as Actions artifact `t21-undertow-coverage-ledger-v3`. Includes largest XZ gaps and ranked original-source local candidates; candidates outside the hard silhouette are reported as DEFERRED.

Source candidate ranking currently uses conservative filters (original source IDs/material/Y, 42-vertex silhouette, paired inventory, and unshown 0.5m cell-center area), not ungrounded floor completion. Additions beyond Phase1 must be separately audited and kept review-only.

## Freeze criteria (not yet met)
Visual Freeze is pending until all major XZ regions have evidenced 3D geometry, any remaining gaps have explicit classifications, and **all five requested camera viewpoints** pass human/actual renderer QA. Runtime collision/nav/paint/score/fall-out/CPU QA is **later and separate**. Current Phase 0 and Phase 1 source additions do not mark Visual Freeze or runtime-ready.

