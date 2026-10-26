# B229 — CPU local source gap prerequisite, actual speed/acceleration and true Rapier KCC

2026-10-26 JST, baseline `587c8b4267e9f8c0303b3f8c17d3860762752767`.

## Why existing CPU control is not yet sufficient

B224-B228 established a fully physically verified **human PlayerController** original-source underpass passage in an isolated 30-solid QA stage, including first 2.074235m jump and final native 25-solid underpass. B227 explicitly proved the first 4 source anchors were entirely absent from the real production 25 registered solids and that Recast remains disconnected on the first 3 paths **even after** exact source faces are temporarily added. No CPU route has been certified; existing stage 25/17/26/0 and 0/12 must remain frozen.

Existing `CpuAgentSystem` obtains steering from Recast Crowd. With `f3dSourceGoals`, ordinary `tryStartTacticalJump` is **disabled**. Its separate long-range `startCpuJumpPrep/beginCpuJumpTravel` superjump currently uses `lerp` and `sin` to set the bot position, then snaps to a nearest NavMesh point; it is not a physical local gap jump and cannot be used to claim a 2m seam has been solved. Real physical CPU first-drop audit exists, but is a downward drop, not a reusable ascending local jump.

## B229 measured engineering gate

Before writing CPU production navigation, construct an **isolated, genuine native Rapier KCC CPU-speed feasibility pilot** with unchanged `GAME_CONFIG.cpu.maxSpeedMetersPerSecond=4.4` and `maxAccelerationMetersPerSecond2=18`, the actual shared production character capsule/KCC setup, physical gravity and player natural jump velocity 8.2 (ONLY a QA proposed *local* jump parameter). On both mirrored original CI688 sides use exact FloorConcrete01 and outer Slope00 meshes in a 27-solid QA world (25 untouched production registered solids + 2 exact source triangle meshes). Physically approach the measured original lip from **real source-backed runway**, attempt takeoff only with current exact source foot support and real KCC grounding, then demand actual original target contact and 18 stable grounded ticks. Compare a walk-only counterfactual. Record all launch, airborne, physical landing and existing collision provenance; any jump success does not mean actual 7 real `CpuAgentSystem` actors or native Recast Crowd were tested.

The initial workflow is diagnostic. If no physical candidate succeeds, do not authorize artificial offmesh links or copied superjump positions. If evidence supports a genuine candidate, next step is a fail-closed reusable *QA-only CPU physical drive module*, then connect native Crowd **only after** source-to-real-runtime path and controller identity are shown.

No code modifies production CPU routes, input, AI target choices, geometry, score, main, Pages or PR #5. Authorizations remain productionAuthorized false, unrestricted4v4Certified false, 0/12 opponent routes and official winner NONE.
