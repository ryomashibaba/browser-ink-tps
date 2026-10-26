# B229 — CPU local source gap prerequisite, actual speed/acceleration and true Rapier KCC

2026-10-26 JST, baseline `587c8b4267e9f8c0303b3f8c17d3860762752767`.

## Why existing CPU control is not yet sufficient

B224-B228 established a fully physically verified **human PlayerController** original-source underpass passage in an isolated 30-solid QA stage, including first 2.074235m jump and final native 25-solid underpass. B227 explicitly proved the first 4 source anchors were entirely absent from the real production 25 registered solids and that Recast remains disconnected on the first 3 paths **even after** exact source faces are temporarily added. No CPU route has been certified; existing stage 25/17/26/0 and 0/12 must remain frozen.

Existing `CpuAgentSystem` obtains steering from Recast Crowd. With `f3dSourceGoals`, ordinary `tryStartTacticalJump` is **disabled**. Its separate long-range `startCpuJumpPrep/beginCpuJumpTravel` superjump currently uses `lerp` and `sin` to set the bot position, then snaps to a nearest NavMesh point; it is not a physical local gap jump and cannot be used to claim a 2m seam has been solved. Real physical CPU first-drop audit exists, but is a downward drop, not a reusable ascending local jump.

## B229 measured engineering gate

Before writing CPU production navigation, construct an **isolated, genuine native Rapier KCC CPU-speed feasibility pilot** with unchanged `GAME_CONFIG.cpu.maxSpeedMetersPerSecond=4.4` and `maxAccelerationMetersPerSecond2=18`, the actual shared production character capsule/KCC setup, physical gravity and player natural jump velocity 8.2 (ONLY a QA proposed *local* jump parameter). On both mirrored original CI688 sides use exact FloorConcrete01 and outer Slope00 meshes in a 27-solid QA world (25 untouched production registered solids + 2 exact source triangle meshes). Physically approach the measured original lip from **real source-backed runway**, attempt takeoff only with current exact source foot support and real KCC grounding, then demand actual original target contact and 18 stable grounded ticks. Compare a walk-only counterfactual. Record all launch, airborne, physical landing and existing collision provenance; any jump success does not mean actual 7 real `CpuAgentSystem` actors or native Recast Crowd were tested.

The initial workflow is diagnostic. If no physical candidate succeeds, do not authorize artificial offmesh links or copied superjump positions. If evidence supports a genuine candidate, next step is a fail-closed reusable *QA-only CPU physical drive module*, then connect native Crowd **only after** source-to-real-runtime path and controller identity are shown.

No code modifies production CPU routes, input, AI target choices, geometry, score, main, Pages or PR #5. Authorizations remain productionAuthorized false, unrestricted4v4Certified false, 0/12 opponent routes and official winner NONE.

## B229 first native Rapier pilot — exact CI #40301261366 SUCCESS

The direct true Rapier / Vitest proof was executed after repairing an initial standalone test-only TS parse error (first CI #40301094921 failed prior to test execution; no gameplay/build failure). The corrected CI **#40301261366 succeeded** with the following strictly native physical outcomes, now fixed as regression assertions:

| Exact original mirrored source | Walk-only native arrival | CPU-speed/acceleration + physical local jump | Original grounded launch tick | Actual max speed at launch | Original source landing | Native stable target grounded ticks |
|---|---|---|---:|---:|---|---:|
| POSITIVE_Z FloorConcrete01 → outer Slope00 | FAIL (falls) | **PASS** | 28 | 4.4m/s | YES | 18 |
| POSITIVE_Z outer Slope00 → FloorConcrete01 | FAIL (falls) | **PASS** | 38 | 4.4m/s | YES | 18 |
| NEGATIVE_Z FloorConcrete01 → outer Slope00 | FAIL (falls) | **PASS** | 29 | 4.4m/s | YES | 18 |
| NEGATIVE_Z outer Slope00 → FloorConcrete01 | FAIL (falls) | **PASS** | 38 | 4.4m/s | YES | 18 |

All tests use actual CPU maximum horizontal speed 4.4m/s, acceleration 18m/s², exact shared Rapier capsule/KCC contact geometry, player gravity 28m/s², and **only a QA-proposed local 8.2m/s vertical jump** borrowed from the player config. Importantly the CPU is physically advanced through `computeColliderMovement`, `computedMovement`, and `setNextKinematicTranslation` plus native Rapier `world.step()` every tick: position is not interpolated, snapped, or teleported after initial spawn. No contact with unrelated 25 original solids was recorded. Actual source-ground support at takeoff and landing was checked by collider ID, and the walk-only controls could not cross.

### What this DOES and DOES NOT establish

This is concrete **physics feasibility under CPU locomotive constraints**. It **does not** instantiate `CpuAgentSystem`, a native Crowd agent, real 7-CPU F3 match, onboard automatic launch planner, player input, or an authenticated Recast bridging edge. The first 2.074235m gap must **never** be marked as grounded navigation; it requires a true physical jump. The later two source seams can be grounded via actual native KCC according to B225/B226, but Recast was disconnected there in B227. No original CPU cross-team route can be credited.

### Planned next implementation: small physical jump state before real Crowd

1. Add opt-in **isolated QA** CPU local jump **actuator** with exact source-foot-and-target collider proof, a safe geometric takeoff corridor on CI688 original floor, CPU max acceleration and speed, physical gravity. It must record genuine actor path and abort on unsupported source takeoff or target landing rather than position blending.
2. Connect the *actual* CPU steering system to this only after a legitimate source-face runtime registration decision, a natural Recast-to-physical transition marker and safe native Crowd rejoin. The frozen original 25/17/26/0 game and official 0/12 route authorization stay unchanged until independent field evidence.
3. Do not reuse the ordinary scripted long-distance superjump, no artificial offmesh teleports, no fabricated nav links, no global grid/raster/erosion re-sweep. Do not claim the isolated local physical pilot certifies CPU encounters or Turf scoring.

CI: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40301261366.
