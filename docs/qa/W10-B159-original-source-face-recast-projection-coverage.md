# W10-B159 — Exact source triangle → actual frozen Recast projection coverage

**Date:** 2026-10-24 JST. **QA branch:** `dev/t21-f4e103w-qa-infra`. Existing project, no new stage activation, production deployment, original Windows mutation or Draft PR #5 merge.

## Actual completed B158 source evidence (not a fabricated fixture)

At previous SHA `63f2d49e3381aa3a9605098fce8e5d2d9b76845e`, [B139 PlayCanvas/Rapier/Recast native run #40080457543](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40080457543) TEAM_COVERAGE actual Chromium job was SUCCESS. Source artifact `b139-original-TEAM_COVERAGE`, ID `12554244134`, `w10b139-team_coverage.json`, key `b158OriginalSourceFaceRecastMatch`. Distance to *nearest already-exported CI688 exact original face*, not to the nearest active runtime collider:

| Native terminal | Nearest exact source component | Nearest 3D distance | Horizontal distance | Signed original face elevation difference |
| --- | --- | ---: | ---: | ---: |
| +Z forward Recast (5.605,4.600,35.833) | FloorConcrete01, source face index 7 | **4.669m** | 0.797m | **−4.600m** |
| −Z forward Recast (−3.035,4.600,−36.707) | FloorConcrete01, source face index 7 | **4.657m** | 0.727m | **−4.600m** |
| +Z reverse Recast (−8.975,0.100,11.353) | FloorSlope00 inner, source face index 0 | 0.154m | 0.118m | −0.100m |
| −Z reverse Recast (11.725,0.100,−12.407) | FloorSlope00 inner, source face index 0 | 2.451m | 2.449m | −0.100m |

B157 already verified each forward and reverse native original Recast path terminates short; +Z / -Z original opposite-side actual KCC travel remains **HOLD**. The ~4.6m forward vertical offset is important: a top-down display can visually overlap original Face and registered runtime upper floor while the 3D path cannot safely move between them. **It does NOT prove a missing link, missing original floor or a viable drop**.

Historical original CI #688 exported **42 exact private-Temple01-source-derived triangles across 10 component records** already stored in the repo. CI #691 actually attempted including all five original components per side in an isolated Recast experiment and still failed with the same ~31.716m path residual. The exact source geometry is not a new discovery, nor authorization to add it to runtime.

## B159 integration (actual code, no simulated source states)
1. Extend existing `RecastStageNavigation` with a **strict read-only native closest-polygon result**: `auditNavMeshProjection`, unlike `closestPoint` which has a safe-for-agent fallback, returns `success:false,nearestPoint:null` on failure instead of silently returning the query coordinate. Native `NavMeshQuery.findClosestPoint` is queried; neither Crowd nor NavMesh changes.
2. On existing non-production F3 preview initialization, for each of the **42 original source triangles** (using its exact original three vertices), calculate centroid and measure **actual current native Recast nearest-polygon 3D distance and elevation difference**. B159 also casts once vertically against only current **registered Rapier original stage solids**. Total 42 NavMesh projection queries + 42 registered Rapier stage rays per preview launch; no continuous per-frame polling.
3. Per Face JSON evidence records source component, actual original projected XYZ, real native nearest point, exact 3D distance, height offset, current registered collider ID if any, and whether that collider is the *same exact original component* by ID. Per component aggregates count samples within ≤0.35m and any registered stage hit. These are **proximity observations only**: Recast nearest polys may come from adjacent or overlapping completely different stage solids. Even 42/42 near does **not** prove original Face registration, connectivity or real character walkability.
4. Existing F3 HTML diagnostics include component-by-component source projection counts, and existing B139 native 7CPU real Chrome evidence JSON includes full 42 original source projected witnesses. Reuse existing B75 build/Vitest/preflight and the existing B139 browser workflow; **no new heavy workflow or duplicate repo source scanning**.
5. Vitest tests cover 42 exact query cardinality, exact geometry source threshold nonpromotion, 3D vertical offsets, failed nearest polygon, false production/Scoreable injection, and preserving CI #691 failure.

## Next game-engineering decision from real B159 evidence

Use B159 exact SHA results to distinguish **(a) original Face centroids absent from CURRENT Recast neighborhood, (b) close to another currently registered polygon at similar Y but not source Face membership, (c) current static Rapier support in the region**. Then inspect true NavMesh *polygon refs/islands* and valid authored offmesh directionality for the closest original FloorSlope01/FloorConcrete01/FloorSlope00 route chain, **not** repeat the rejected raw five-component CI691 import. If a bounded original-derived adjacent region becomes independently geometrically and collision-supported, only then consider a separately gated KCC trial and source navigation authority. If no input is sufficient, move to improving gameplay in the already verified F3 region rather than create B-numbered telemetry with no gameplay value.

## Hard hold
- Unchanged original source stage **25 solids / 17 Paintable / 26 NavLinks / 0 Scoreable**, natural original opposite-side crossings **0/12**.
- `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`; **full original 4v4 HOLD**. No fake player/CPU relocation, virtual bridges, inferred original source Face, script-generated score or main/Pages changes.
- All real new B159 coverage numbers must come from B159 exact-SHA native Chromium artifact; synthetic unit-test examples are not evidence.
