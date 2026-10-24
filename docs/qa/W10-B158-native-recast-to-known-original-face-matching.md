# W10-B158 — Native Recast termination vs already extracted exact original source faces

**Date** 2026-10-24 JST. **Repository** `ryomashibaba/browser-ink-tps`; branch `dev/t21-f4e103w-qa-infra`. QA-only, no changes to main, Pages, T20, legacy PR #5 or Windows originals.

## Important new source discovery: DO NOT repeat the known failed geometry experiment

Prior authoritative `src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry.ts` already contains **five original Temple01 components per side, 21 exact original faces per side** (42 triangles total), CI #688 original export:

- `FloorSlope01`: 2 triangles/side, low-to-ramp approach
- `FloorConcrete01`: 11 triangles/side, model Y=3m
- `FloorSlope00 outer`: 2 triangles/side
- `FloorConcrete02`: 4 triangles/side, model Y=4.5m
- `FloorSlope00 inner`: 2 triangles/side

Original source `FldObj_Temple01_PntSet_mesh01_low139_1__FloorSlope01`, `Fld_Temple01_pCube21595_1__FloorConcrete01`, `Fld_Temple01_pCube21000_1__FloorSlope00`, `Fld_Temple01_pCube20989_1__FloorConcrete02`, and opposite source mirror geometry. These are already *repository exact original face records*, **not currently promoted to the frozen 25-solids runtime source stage**. Their model Y mapping is preserved: project Y=source Y−3.

Prior CI **#691 experimentally added all five exact source components per side** to an inert source-only Recast QA configuration and found the same ~31.716m two-point failure. Therefore, blindly adding this very same face batch to gameplay is **known NOT to solve the connection**. Both `offMeshLinkAuthorized` and `runtimePromotionAuthorized` remain `false`. An original Face is not equivalent to walkable character KCC or a valid Recast crossing.

## Exact B157 input measurements

At SHA `775fff63a5b59834a39ed7e1b24e173cf4e05e99`, true source PlayCanvas 60Hz + 7CPU Chromium, [B139 CI #40079370894](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40079370894) `b139-original-TEAM_COVERAGE` (artifact 12554327570):

| | +Z original side | -Z original side |
|---|---|---|
| Forward original Recast last waypoint | (5.604740,4.600000,35.832825) | (-3.035261,4.600000,-36.707176) |
| Forward remaining to original destination | 31.731m | 31.800m |
| Reverse original Recast last waypoint | (-8.975260,0.100000,11.352829) | (11.724739,0.100000,-12.407173) |
| Reverse remaining to original start | 40.876m | 40.793m |
| Real source stage collider under forward Recast terminal | `UndertowT21D:right-low-team-a` (0.1m vertical ray difference) | `UndertowT21D:right-low-team-b` (0.1m) |
| Real source stage collider under reverse Recast terminal | `UndertowT21D:center-low-team-b` (0.1m) | `UndertowT21D:center-low-team-a` (0.1m) |
| Recast target reached, either direction | **NO** | **NO** |

The reverse path terminal belongs to **opposite-team named** registered center-low source collider: this is the collider ID reported by Rapier, not proof of opponent physical contact or an authorized cross-team path. Three alternative source QA original Chromium variants are independent runs. No fabricated opponent route. Official full original 4v4 still 0/12 source crossings.

## B158 integration

1. **Exact Face → actual Native Recast 3D nearest match:** `src/app/W10B158OriginalSourceFaceRecastMatch.ts` uses the existing immutable original 42 triangles and actual B157 forward+reverse path terminal XYZ. For each of four actual Recast terminal points it finds closest point on an **existing source triangle**, records exact source object/material/component and triangle index, full **3D distance**, horizontal difference, signed vertical offset and source closest point. It does NOT infer a bridging polygon from endpoints or turn CI #691 negative result into a PASS. The clipped closest-point algorithm handles triangle interior, edges and vertices; synthetic tests verify exact-vertex and distant witness cases and refuse unsafe stage authority.
2. **Visible existing source geometry instead of imagined bridge:** `W10B157OriginalUnderpassPointMap.ts` now draws **42 exact original Face polygons in teal** over the registered stage start/goal and genuine B157 Recast forward/reverse terminal points. Each SVG polygon comes directly from `UNDERTOW_UNDERPASS_ROUTE_COMPONENTS` recorded original source triangle vertices; NO path is drawn between points, and the legend prominently says these source triangles are not game-runtime solids or authorized floor. No 3D PlayCanvas stage, Rapier physics or NavMesh collision is created.
3. **Original runtime QA snapshot and CI reuse:** B158 comparison is computed once in the F3 preview after real B157 Recast/Rapier evidence. F3 diagnostic text shows which exact original source component was closest to each native terminal and how far in meters, including the CI #691 negative caveat. Existing `scripts/t21-w10b139-original-native-descent-rally.mjs` writes the full B158 report into real independent native proof JSON. B75 preflight includes the new face-matching Vitest and the already existing frozen original source triangle geometry regression; B139 retains the exact three-source 7CPU Chromium variants.
4. **No user work required** to inspect public repository source faces and existing B157 native CI, and no new expensive workflow.

## Next engineering branch of work — prioritize an actual path to playability

If B158 real source Face distance is close but NavMesh remains stopped ~32m short, the obstruction is **not solved merely by adding these exact five components**, as CI #691 already proved. The next meaningful work is to audit **complete Recast walkable triangle/island adjacency**, authored offmesh directionality and original 3D elevations along the candidate Face chain, then test genuine Rapier KCC on any independently supported local subset. Source evidence must be treated separately from the original Turf scoreable mask. If genuinely needed original OBJ Face evidence is absent, ask for only the minimal source resource rather than repeatedly implementing purely theoretical mini-sensors.

Frozen runtime continues to require 25 solids / 17 paintable / 26 NavLinks / 0 Scoreable; T21 `activationReady=false`, `productionAuthorized=false`, formal 4v4 HOLD. Exact same-SHA Chromium results must be inspected before any B158 outcome is declared.

**Delivery proof:** commit and CI on QA branch. No private OBJ content uploaded.
