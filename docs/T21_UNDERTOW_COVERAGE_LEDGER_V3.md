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

