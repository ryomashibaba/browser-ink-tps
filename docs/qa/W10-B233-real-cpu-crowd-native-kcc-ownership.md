# B233 — genuine Crowd source approach → native Rapier jump → native Crowd rejoin

Parent `a065e620af07d4b8c127768d3a94c2ec5ee5601a`, 2026-10-26 JST. Priority is quality and integrated gameplay mechanics rather than endless isolated pass counts. This phase is a **single actor identity / locomotion-ownership vertical slice** with both real Recast Crowd and native Rapier KCC on exact original CI688 extracted geometry.

## Design

Use **one** `B230CpuLocalGapQaActuator` native Rapier body for a complete original-source run. Before the gap, a real native Crowd proxy (30-original-plus-five-face QA NavMesh, still the original 26 links) requests a *local reachable point on the same authentic source floor*. Its 60Hz movement proposal is not copied to actor pose; instead the **same Rapier KCC body** advances by real grounded, CPU-speed/acceleration-constrained collision physics, demanding exact original CI688 source-foot provenance. The Crowd proxy is explicitly removed, without physical relocation, before reaching the original source lip.

The same body then takes the actual physical original ~2.074235m gap with the independently proven B230 on-source launch, gravity, real airborne and 18+ stable target grounded ticks. Only after the body landed does B231 validate a genuine native Crowd local NavMesh snap/hold. Finally, a newly resumed actual Crowd agent requests a nearby *same source-surface* target and the same body physically follows under B232's drift/speed/ground/source-foot checks.

A wrong stage ID, any changed original 25/17/26/0, non-original CI688 mesh, disabled physical jump, unfounded takeoff or invalid native path MUST fail closed, never synthesize a nav bridge or teleport. Both Z mirrors and both crossing directions are tested. Actual `CpuAgentSystem` and frozen release runtime remain untouched for now because the 25 original solids still lack these source faces and Recast remains disconnected across the real jump and later two source seams. The result does **not** authorize any of 12 cross-team routes, 4v4 winner, scoreable paint, or production geometry.

A QA success establishes a complete isolated human-scale CPU-speed physical control ownership handoff, NOT an AI bot in a scored match. Following evidence, next phase should put this transition contract behind a strictly opt-in actual `CpuAgentSystem` QA adapter with its own source-stage collision provenance and real native Crowd in one application render tick loop. No direct edit or promotion to live stage unless the 25-source geometry and native route failures are independently resolved.
