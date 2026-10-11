# T21 Phase14B: Isolated Source-backed Physics and Ink

The first integration tests reuse the exact four original source-backed surface solids: two spawn-high and two first-drop-landing original masked footprints. The stage remains NON-PRODUCTION.

- Actual RapierStagePhysics creates colliders from the EXISTING source footprint on a four-solid isolated QA stage.
- Test real Rapier camera blocking and the SAME HUMAN/SQUID kinematic character controller constructor as the PlayerController; each of four floor samples requests a 1.8m downward motion and must be clipped and grounded.
- Instantiate actual GameplayInkSystem/PaintSurface, register the four original footprint-backed paints, emit 4 authoritative CPU ink-grid mutations and verify the stored team ownership and zero Turf score attribution.
- Keep existing full-unit Recast test for all eight links: six MUST_REACH, two deliberately unresolved right-low-to-underpass diagnostic gaps. No duplicate huge navmesh startup. A Recast path does not prove a CPU agent moves.
- STRICT LIMIT: no actual PlayerController 60Hz trajectory, 4.5m lip traversal, true 4v4 CPU movement, GPU paint draw, or in-game cinematic camera is claimed by these isolated component tests. Those remain Phase14C.
- If this test fails, first inspect source-informed floor footprints and engine-controller behavior, do not add convenience colliders or invented triangles.
- T20 production inkworks-junction unchanged, T21 activationReady=false, PR #5 Draft and unmerged, Visual Freeze unapproved, all Phase12 source holds intact.
- Preserve fast CI on every commit and full original source/Pass18/browser CI on integration checkpoints and before any promotion.