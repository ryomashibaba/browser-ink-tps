# B232 — live native Recast Crowd target → SAME Rapier KCC locomotion (isolated QA)

2026-10-26 JST, baseline `fb7b09b876f1cdd2df9bd7ba7642d00d40c79e49`. B231's actual native Crowd source mesh local HOLD after physical original KCC landing succeeded 4/4 for 24 native frames. But Crowd was not instructed to move, the Rapier body did not follow, and CPU did not instantiate. 25 frozen game colliders lack the source meshes; 30-solid native Recast QA with five CI688 original source faces preserves true 26 original links but cannot navigate the 2.074m source jump.

B232 adds an opt-in method **ONLY to the B230 QA physical actuator**, continuing its exact landed Rapier body and source-foot ID after genuine jump without actor cloning or teleport. A genuine native Recast Crowd agent is placed at the real physical foot on the exact 30-solid QA NavMesh, given a small local **same original-source-floor** target request and advanced 60Hz. At every real tick the Crowd candidate is capped to CPU max speed, then `computeColliderMovement` and native Rapier collision handle the actual previously-landed body. The actual native ground support must be the same exact original source face; drift beyond 0.30m, wrong collider, ungrounded step, collision with frozen 25 or non-finite/nav-untrusted agent proposal fails closed. Logs include every real Crowd move request, physically approved ticks, displacement, final collider, Recast native local query and exact errors. Four mirrored/directional cases are run, with B231 and B230 regression tests in the same CI.

This is a physically grounded **Crowd steering proposal** test, not real seven-CPU gameplay. `CpuAgentSystem`, main, frozen original 25/17/26/0, Recast config, offMesh connections, Pages and PR #5 are untouched. No formal cross-team route, score or winner may be certified; 0/12, officialWinner NONE and productionAuthorized false remain.

## Actual first native Crowd + Rapier run #40307853903: SUCCESS

B232's first true native Recast 30-solid source QA requested `CrowdAgent.requestMoveTarget` to a local, grounded original CI688 destination after reusing the exact B230 Rapier actor already landed from the 2.074235m gap. The same native physical KCC body (not a respawn), 4.4m/s CPU speed bound, configured capsule/ground snap, and original CI688 collider-foot provenance authorized every resulting 60Hz movement step. A genuinely generated local Recast path connected each start/end, unlike the first 2.074235m gap which remains disconnected.

| Mirrored source landing | Genuine Crowd 60Hz command frames | Physical KCC-approved frames | Actual KCC XZ displacement | Max observed 3D Crowd↔Rapier foot drift | True original source footing throughout |
|---|---:|---:|---:|---:|---|
| POSITIVE_Z FloorConcrete01→outer Slope00 | 20 | 20 | 0.504296m | 0.196572m | YES |
| POSITIVE_Z outer Slope00→FloorConcrete01 | 18 | 18 | 0.735689m | 0.077192m | YES |
| NEGATIVE_Z FloorConcrete01→outer Slope00 | 20 | 20 | 0.504697m | 0.191451m | YES |
| NEGATIVE_Z outer Slope00→FloorConcrete01 | 18 | 18 | 0.730882m | 0.075581m | YES |

Native Recast source/target nearest distances ≤0.119m; genuine source-local native `auditPath` reached 4/4 targets. Original 25-solid stage collision/paint/navigation authority unchanged, 0 fabricated nav links and 0 KCC teleports after initial QA spawn. A separate strict regression assertion now requires 4/4 physically approved frame streams, >=0.45m real physical movement, <=0.25m drift, valid direct native source and target projection, and no CPU gameplay promotion.

Strict negative tests additionally issue nonfinite and remote (>10m) Crowd candidates after exact landing, on BOTH mirror sides. They must be rejected **before** any physical step, leave actor pose untouched, and move the QA actuator to fail-closed state. None of this instantiates `CpuAgentSystem`, a real original team member, or an actual 7-CPU full match; it only proves one isolated Crowd steering proxy can propose *locally valid* motion and the original-source native KCC can accept it.

CI proof: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40307853903

## Next productive B233 decision

A fully authenticated *local* Crowd-moving Rapier body now exists in isolated QA after the real initial jump. The next hardest true blocker is not increasing scripted locomotion coverage: it is identifying a source-authorized **Crowd navigation intent to physically take over the 2.074m jump** and resume the real physical actor afterward, without allowing Detour's disconnected graph to invent a path and without silently handing it a manufactured offmesh teleport. Need an opt-in QA-only suspend → exactly-original-source-lip gate → KCC jump → Crowd rejoin sequence, with explicit actor identity/provenance proof, followed by a real `CpuAgentSystem` integration test if feasible. Distinguish that from autonomous seven-CPU 4v4 and keep frozen 25/17/26/0 and 0/12.
