# T21 Phase14C — 60Hz Original Source Descent + Recast Crowd Following
## Scope and evidence
Phase14B proved 8 individual grounding cases and four authoritative ink writes. Phase14C now performs *time-stepped* dynamic engine validation on exact source-backed original components and the existing mirrored first-drop path links.

1. RapierStagePhysics and production-shared createConfiguredPlayerCharacterController: 60 Hz gravity from the original upper first-drop level down through 4.5m onto the original source-masked landing area, for HUMAN and SQUID, both mirrored sides. An original radius-support scan selects positions inside the lower *existing* footprint; no fake floor slab added. Require grounded, collision-source ID, bounded landing Y and nonzero 4m descent. Telemetry prints actual travel/frames. This is a **vertical drop above the landing**, not a proven over-the-lip transition by the full PlayerController. It is deliberately not described as an entire player playthrough.
2. RecastStageNavigation existing full partial QA navmesh: requestMoveTarget on TWO actual CrowdAgents at opposite spawn-high endpoints, fixedUpdate at 60 Hz for at most 12 simulated seconds. Track positions/actual movement/goal error and reject stationary agents or non-arrival. This probes **Crowd navigation follower**, not the complete CpuAgentSystem combat/paint/decision logic.
3. All existing six Recast MUST_REACH and two DIAGNOSTIC_GAP routes remain; no new shortcut is authorized. The T20 game, T21 activation, source meshes, score, camera and GPU paint do not change.
4. Negative source authority: assert T20 production unchanged and T21 activationReady=false. Do not claim playable corridor until FULL PlayerController, true lip crossing, camera and CPU decision QA passes in a distinct review checkpoint.

## CI
Added as two integration tests in ordinary Vitest. Per-commit FAST still executes ALL tests, TypeScript and screenshot negative checks. Exact-head FULL regression with Pass18/source SHA/WebGL2 evidence is still mandatory at integration checkpoints/release; expensive source enumeration is not duplicated in this new test.

## Follow-up
If Crowd/engine trajectory fails, preserve failure evidence and determine physical root cause. Never patch missing connectivity with invented geometry. An isolated gameplay harness with input/camera and a real PlayerController across the original lip becomes the next acceptance stage.

## Freeze
PR #5 Draft, T20 production inkworks-junction, T21 activationReady=false, Visual Freeze not approved. Existing 124 display source / 64 walk / 42 XZ / source-only 22 components 488 original triangles, 28 held components 616 faces, no gameplay promotion.

## Phase14C additional CPU motion-fidelity gate
The real CI #15 measurement showed the -Z Crowd agent arrived in **0.0833 s** across a 4.5 m height change. This is potentially an instantaneous off-mesh-link transition and must NOT be described as a physically simulated player/CPU fall. Added `UndertowPhase14CrowdMotionAudit.ts` with a per-60Hz-frame guard: a step longer than `dt * hypot(actual CPU max ground speed, actual player terminal fall speed) + 0.12m` is flagged as a suspected instant transition. Integration logs store largest step and per-side count, while source-only route arrival remains a separate PASS. Even zero flagged frames would not be a full CpuAgentSystem movement/animation QA. No physical fall certification is issued or gameplay settings changed. Phase14D must examine how CPU animates/executes the off-mesh descent before permitting stage activation.
