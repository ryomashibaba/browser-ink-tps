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

