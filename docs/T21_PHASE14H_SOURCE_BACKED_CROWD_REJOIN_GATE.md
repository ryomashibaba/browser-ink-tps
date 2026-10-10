# T21 Phase14H — Source-backed mirrored Crowd rejoin and deterministic recovery

## Scope / non-activation

T20 canonical production stage stays inkworks-junction. All tests and runtime changes here require explicit opt-in UndertowPhase14ECpuHandoff injected only into the **inactive** T21-D partial connectivity QA stage. No production stage selection, merge/deploy, scoring, paint surface or collision change; T21 activationReady=false. Visual Freeze not approved.

## Why Phase14G failed: validated separation of height-layer evidence

The Phase14H source geometry audit tested 13 source-masked lower landing positions on each side with a **fresh** Crowd Agent. Both 13/13 stayed at Y~3.100 on the existing Recast lower navigation layer for the first two Crowd updates. This independently establishes that **the lower navmesh exists**, without assuming any gameplay authority beyond frozen T21-D solids.

A second test used REAL two-sided Recast Crowd offmesh jumps, detached the agents, descended using the original source-backed Rapier KCC and recreated the Crowd agents:
- positive-Z: original Crowd raw offmesh step ~0.75145m; KCC 34 frames; foot ~[3.46999,3.02504,55.27103]. Recreated Crowd initially snapped near Y3.1, but the first Crowd.update replayed a stale offmesh position ~Y6.6417, 3.8686m from the physical foot. It returned to lower Y3.1 on update 4 and achieved three stable frames on update 6. Its eventual horizontal/3D foot offset was ~0.55m.
- negative-Z: original raw step ~1.18047m; KCC 33 frames; foot ~[2.77701,3.02510,-53.91375]. First rejoin Crowd.update jumped to ~Y4.8907, ~1.8747m from foot; returned to lower Y3.1 on update 3 and accumulated three stable frames on update 5. Later foot offset ~0.116m.

This is a **post-offmesh Crowd-slot rejoin replay**, not missing lower geometry and not a KCC fall discontinuity. Root cause at the Recast internal implementation level is not independently proven, but the relevant harmful behavior is reproducible and measured.

## Phase14H opt-in stabilization rule

CpuAgentSystem now keeps the Rapier-backed landed CPU render foot authoritative while the newly created Crowd slot settles, through a T21-specific FIRST_DROP_REJOIN state:
1. During the replay, do NOT copy Crowd poses into the CPU entity, do NOT paint, fire, choose tactical goals, throw kits or activate specials.
2. Require three consecutive 60Hz updates where the Crowd pose is within 0.20m vertical and 0.65m total of the physical foot.
3. Close any residual gap along the **already-approved Recast lower NavMesh** with per-frame movement limited to the configured standard CPU walking speed (4.4m/s, 0.0733m/60Hz). Check each step is within 0.25m of the actual generated NavMesh and within 0.20m vertical. No hidden bridge or navigation link may be fabricated.
4. Fail closed if the rejoin agent disappears, route support fails, or stable connection is not achieved in at most 45 frames.
5. Preserve quarantine on match pause; clean on reset/splat; T20 without opt-in adapter never enters this state.

The REAL combined Recast→CpuAgentSystem→Rapier→Crowd test on the previous milestone HEAD showed:
- BOTH original one-way source links intercepted in the actual CpuAgentSystem loop (B1 frame 3, A1 frame 178).
- 33–34 continuous physical descent frames, max motion step <=0.257m.
- Both reached verified lower-layer Crowd rejoin and normal CPU tactical think resumed.
- Real PlayCanvas GraphNode interpolation was sampled with alpha 0.5; max reported midpoint error <0.018m (includes existing cosmetic bob).

The real Chrome/WebGL2 six-PNG capture remains a separate **controlled-offmesh Phase14F** scenario. It verifies actual GPU rendering of physical fall, **not** Chrome rendering of the Phase14H real Crowd initiation or full game.

## Remaining gates (not silently satisfied by unit tests)

- Independent KCC/collision validation of the short ground-stage rejoin movement; current rejoin correction is NavMesh-projected but does not drive a Rapier KCC horizontally.
- All seven CPU agents in a live 4v4 match; player-over-lip and camera tracking, weapons, continuous paint and frame-time profiling.
- Full original Temple01 source audits at the appropriate major milestone; the 2 right-low→underpass ±Z DIAGNOSTIC_GAPs remain unapproved.
- New real Crowd initiation to WebGL2 capture, human 5-view visual freeze, and user authorization before runtime stage activation or merging.

Use fast TypeScript+Vitest for each bounded commit and targeted Chrome WebGL2 review. Do not rerun expensive 43MB OBJ source audits on every non-geometry commit.

The evidence is diagnostic, immutable source geometry is unchanged, and runtime release remains **BLOCKED**.
