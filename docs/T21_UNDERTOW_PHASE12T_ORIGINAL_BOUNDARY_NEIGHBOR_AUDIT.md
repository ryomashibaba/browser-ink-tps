# T21 Undertow Phase12T — original open-loop boundary to unused-source neighbor audit

## Scope, authority, and baseline
Source pin: KiTrix Vss_Temple01.obj (43,263,289 bytes), SHA256 a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046.
Original 22 opt-in source-only components (I6+K4+L4+M8) contain 488 source faces and **524 original OBJ-ID boundary edges in 22 open boundary loops**. No isolated component is a closed/watertight OBJ-ID shell, proven only for this limited selection.
Phase12J holds 44 complete original candidate components/972 triangles. Existing K/L/M use 16 of these; **28 unused candidates/616 original triangles remain HOLD**, not displayed or enabled. Phase12I's 6 existing original pillars are independently pinned; they are not members of the Phase12J candidate list.

## What Phase12T actually proves
For each of 524 original boundary edges:
1. Reconstruct source-ID edges and separately reconstruct exact Float64 original-XYZ geometric edges. Require one coordinate per OBJ ID, unique Face IDs and unchanged byte-exact K/L/M faces compared with Phase12J source JSON.
2. Compare with all edges of all 28 unused Phase12J source-only candidate components. Classify exact original ID edge, exact XYZ edge **with separate original OBJ IDs**, or **no exact edge in those 28 candidates**. Keep original Face ID, both original OBJ IDs, original XYZ endpoints and each held original candidate/Face ID witness in the CI artifact.
3. Separately mark exact geometric matches against other existing opt-in source parts. The two match sets **overlap**; never add these as independent counts.
4. Cross-check the original 524 boundary edges for all 22 components against Phase12S's previously generated JSON, including Phase12R 110-pair validation; verify 22 mirror relationships and held candidate mirror relationships.
5. Dedicated CI artifact `t21-undertow-phase12t-original-boundary-held-neighbors` records every edge and supports a fresh independent Python cross-check.

### Independently computed original-source-only baseline (not CI proof)
- 524 boundary edge observations
- 0 original OBJ-ID edge shared with withheld candidates
- 176 exact XYZ edge matches under distinct original vertex IDs in withheld 28 candidates
- 348 with **no exact edge match within withheld 28**
- 304 matches against a different opt-in component (a different, non-disjoint comparison set)
- 22/22 mirror component count checks

These figures do not imply that the remaining 348 edges lack a neighbor in the **entire** original 70,396-face Temple01 mesh; only the 28 held Phase12J candidates were searched. Unrelated faces can intersect edges without exact endpoint XYZ equality. Matching an edge or loop visually does NOT establish OBJ weld, closure, a collider, walkable floor, paint/nav/scoring/CPU or physical connectivity.

## CI and immutable freeze
QA: `scripts/UndertowSpillwayPhase12TBoundaryNeighborQa.test.ts`.
Source ledger: `/tmp/t21-phase12j-pillar-neighborhood.json`.
Prior S source artifact: `/tmp/t21-phase12s-original-objid-boundary-topology.json`.
Output: `/tmp/t21-phase12t-original-boundary-held-neighbors.json`.
The dedicated QA requires both source inputs and refuses missing evidence. Running the same test in the general npm test suite is allowed without those files; synthetic and runtime-freeze tests still execute.

Retain PR #5 Draft/open/unmerged, T20 inkworks-junction production, T21 activationReady=false, Visual Freeze unapproved, 124 default source displays, 64 walk inventory, 42 hard outer-XZ points, 22 opt-in parts/488 faces, 28 held original parts/616 faces.
No newly inferred meshes, synthetic caps, walkable floor, vertex weld, physics, nav, paint, scoring, CPU or gameplay activation. No user-facing stage change.

## Next gate
Check the FINAL Phase12T HEAD, full GitHub CI and all its independent evidence. Only then consider Phase12U narrowly scoped original source candidates beyond Phase12J, using actual original Temple01 Face IDs and a separate source gate. Do not extrapolate absence or authorize render/collision from a partial original source candidate set.
