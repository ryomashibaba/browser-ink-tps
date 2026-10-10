# T21 Phase14G — Real Crowd-to-CPU-to-KCC integration / vertical rejoin blocker

## Scope and nonpromotion authority
- T20 production: inkworks-junction, unchanged. T21 activationReady=false. PR #5 remains Draft/unmerged.
- The Phase14G headless test combines the real T21-D QA Recast navmesh/Crowd, real CpuAgentSystem.fixedUpdate, original-landing Rapier KCC and actual PlayCanvas Entity transforms (GPU rendering is mocked for Vitest only).
- Existing Phase14F six-image Chrome/WebGL2 QA deliberately uses a controlled offmesh-start fixture. It is not real-Recast-trigger GPU evidence. Keep the two proofs separate.
- No fabricated source meshes, floor, collision, paint/scoring mask, nav links, camera/player gameplay, main merge or runtime activation.

## Newly detected gap
The first Phase14G CI captured a real original negative-Z offmesh transition for B1 at frame 3 (raw Crowd step about 1.18047m). The original-backed Rapier KCC descent continued for about 33 frames. After KCC grounding, the next navigation rejoin changed the CPU foot from approximately [2.7770, 3.11966, -53.91375] to [2.96124, 4.89074, -53.91978] in one 60Hz tick. This is a **1.78065m unapproved Crowd/vertical-navmesh snap**, not an approved physical fall.

Phase14E's initial closestPoint rejoin check therefore does not prove a stable following Crowd.update. The exact vertical island selected, and whether a valid same-height lower-island navigation point can be recovered, remain unresolved.

A second defect was exposed in the deliberately incomplete QA stage: its zero tacticalNodes caused CpuTacticalDirector.painterGoal to copy undefined. The director now returns current actor position if and only if no tactical nodes exist, leaving all nodeful T20 behavior intact.

## Safety disposition
When and only when the T21 QA-only Phase14E adapter is injected, CpuAgentSystem accepts the audited source-backed first-drop transition. Any other abrupt Crowd displacement, including an upward rejoin to an unsupported navigation height, now throws T21_PHASE14G_UNSUPPORTED_CROWD_REJOIN_DISCONTINUITY and removes the suspect Crowd agent instead of copying its position to the rendered CPU.

**A PASS in the negative-path safety test is NOT proof that full-game/real-Crowd CPU rejoining works.** Valid outcomes for this bounded diagnostic:
- Both real mirrored Crowd transitions -> continuous KCC -> verified same-layer Crowd rejoin -> AI resumes, OR
- A source-backed real transition and KCC movement are observed, but an unsupported vertical rejoin is explicitly rejected; runtime integration remains BLOCKED.

The separate pause/reset case exercises real triggered active-fall cleanup, not gameplay readiness.

## Next source-safe work
1. Measure KCC physical foot position, Recast closestPoint and freshly attached Crowd agent world position immediately before and after first Crowd.update. Audit each mirrored side separately.
2. Audit lower-island source-backed NavMesh cell membership using the frozen 0.30m CPU radius. Reject an XZ-near but vertically distinct nav island. Do not invent any bridge.
3. Resolve only with verified original-source lower navigation geometry/entry position; then rerun real two-CPU and 60Hz animation interpolation. Keep the release BLOCKED until both mirrored sides pass.
4. Subsequently extend the opt-in Chrome GPU test from controlled Phase14F interception to real Crowd triggers, and perform separate human lip/camera/mandatory five-view human visual gates.

## CI
Use fast TypeScript and all unit tests for bounded commits, plus the lightweight Chrome WebGL2 gate. Rerun 43MB Temple01 original-source historical FULL CI only at a material source/geometry milestone. Always match the exact PR HEAD.
