# B233 — genuine Crowd source approach → native Rapier jump → native Crowd rejoin

Parent `a065e620af07d4b8c127768d3a94c2ec5ee5601a`, 2026-10-26 JST. Priority is quality and integrated gameplay mechanics rather than endless isolated pass counts. This phase is a **single actor identity / locomotion-ownership vertical slice** with both real Recast Crowd and native Rapier KCC on exact original CI688 extracted geometry.

## Design

Use **one** `B230CpuLocalGapQaActuator` native Rapier body for a complete original-source run. Before the gap, a real native Crowd proxy (30-original-plus-five-face QA NavMesh, still the original 26 links) requests a *local reachable point on the same authentic source floor*. Its 60Hz movement proposal is not copied to actor pose; instead the **same Rapier KCC body** advances by real grounded, CPU-speed/acceleration-constrained collision physics, demanding exact original CI688 source-foot provenance. The Crowd proxy is explicitly removed, without physical relocation, before reaching the original source lip.

The same body then takes the actual physical original ~2.074235m gap with the independently proven B230 on-source launch, gravity, real airborne and 18+ stable target grounded ticks. Only after the body landed does B231 validate a genuine native Crowd local NavMesh snap/hold. Finally, a newly resumed actual Crowd agent requests a nearby *same source-surface* target and the same body physically follows under B232's drift/speed/ground/source-foot checks.

A wrong stage ID, any changed original 25/17/26/0, non-original CI688 mesh, disabled physical jump, unfounded takeoff or invalid native path MUST fail closed, never synthesize a nav bridge or teleport. Both Z mirrors and both crossing directions are tested. Actual `CpuAgentSystem` and frozen release runtime remain untouched for now because the 25 original solids still lack these source faces and Recast remains disconnected across the real jump and later two source seams. The result does **not** authorize any of 12 cross-team routes, 4v4 winner, scoreable paint, or production geometry.

A QA success establishes a complete isolated human-scale CPU-speed physical control ownership handoff, NOT an AI bot in a scored match. Following evidence, next phase should put this transition contract behind a strictly opt-in actual `CpuAgentSystem` QA adapter with its own source-stage collision provenance and real native Crowd in one application render tick loop. No direct edit or promotion to live stage unless the 25-source geometry and native route failures are independently resolved.

## Actual first integrated native CI — #40311198089 SUCCESS

The B233 end-to-end **one-body** QA explicitly used one `B230CpuLocalGapQaActuator` instance on each original mirrored side/direction. A real native Recast Crowd agent drove the physical source-foot approach; then the proxy was removed and the **same Rapier KCC capsule** physically approached the lip, launched over the 2.074235m source gap, remained truly airborne and landed 18+ original-source-grounded ticks; only then did a fresh native Crowd proxy rejoin locally and move the original physical body again.

| Original mirrored route | Native Crowd pre-jump KCC frames | Actual pre-jump supported travel | Real physical jump | Native Crowd post-jump KCC frames | Actual post-jump supported travel | Integrated QA status |
|---|---:|---:|---|---:|---:|---|
| POSITIVE_Z floor01→outer slope | 55 | 0.913108m | original source grounded + airborne + landed | 19 | 0.473458m | PASS |
| POSITIVE_Z outer slope→floor01 | 21 | 0.907136m | original source grounded + airborne + landed | 12 | 0.469879m | PASS |
| NEGATIVE_Z floor01→outer slope | 54 | 0.874420m | original source grounded + airborne + landed | 19 | 0.473238m | PASS |
| NEGATIVE_Z outer slope→floor01 | 21 | 0.906415m | original source grounded + airborne + landed | 12 | 0.459879m | PASS |

Original 25 solids + 17 original paint surfaces + 26 original navigation links were unchanged in both separate QA physics/navigation worlds. No artificial bridge, physically teleported actor, artificially scoreable surface, ungrounded landing, or detached/duplicated physics body was accepted. A native direct Recast path check across the jump has now been added to *verify*, not hardcode, that the first gap remains nav-disconnected. Integration reaches a local Crowd guidance→physics jump→Crowd guidance **control-plane seam**, not deployed `CpuAgentSystem` 7-bot gameplay; 12 opposing cross-team routes are still unverified.

Initial successful integrated run: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40311198089. The initial preceding attempt #40310879121 contained a TypeScript parse error in the new test file and did not evaluate B233 physics; it was repaired in `8739909cb2415557d45a37095427ab0c42388b1b`.

This boundary is now a strict 4-of-4 CI regression with genuinely queried gap nav disconnection; failed/lost KCC support or unsupported stage provenance blocks completion. No new production changes.
