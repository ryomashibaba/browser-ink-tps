# T21 Phase14F — CPU render interpolation and full-scene gate plan

## Source inspection / baseline
Phase14E is already merged into the Draft PR branch (NOT production). The actual CpuAgentSystem explicitly supports FIRST_DROP_FALL and updates bot.previousPosition before every 60Hz fall step. The render(alpha) method lerps between previousPosition and position. It detaches CrowdAgent on the discontinuous first-drop frame and re-adds a CrowdAgent only after grounded and <=0.65m closest-navmesh snap. It suppresses tactical think/paint/weapon updates while in FIRST_DROP_FALL.

## Critical Phase14F gate
1. Construct an isolated, nonproduction PlayCanvas CPU scene using the existing QA StageDefinition, with explicit UndertowPhase14ECpuHandoff injection and no modification of InkLabApp production stage.
2. Drive real CpuAgentSystem.fixedUpdate at 60Hz, record render(alpha=0,0.5,1) per CPU and assert midpoint lies between the same tick's previous/current physical positions, without frame discontinuity or double update.
3. Assert FIRST_DROP_FALL lasts >20 frames; during the fall, no paint, shooting, tactical retarget, or CPU weapon activation; after grounding, Recast Crowd reacquired and normal think resumes.
4. Exercise reset, splat, and match-pause cleanup and ensure Rapier body/agent counts do not leak; run a simultaneous two-CPU descent, not only a single isolated agent.
5. Run human-over-lip movement and camera QA separately; isolated CPU physics does not certify player input/camera/animation. Include five-view WebGL2/PlayCanvas review and an explicit human visual freeze gate.

## Quality and performance
Use the fast TypeScript+full Vitest lane for each bounded commit; run the original-source FULL CI at milestone HEAD, not after every micro-fix. Keep one CI evidence ledger and one atomic commit per coherent implementation. Do not reopen the expensive original OBJ scan for unchanged geometry.

## Invariant
T20 inkworks-junction production unchanged. T21 activationReady=false; PR #5 Draft/unmerged. No new floor, source mesh, collision, painting authority, scoring, or unsupported underpass connectivity. The existing Phase14E opt-in is QA-only; not enabled by InkLabApp. Release remains BLOCKED until full scene and human visual evidence.
