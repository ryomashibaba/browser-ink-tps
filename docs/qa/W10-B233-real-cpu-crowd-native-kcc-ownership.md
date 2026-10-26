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

## Final strict B233 physical control-plane CI — SUCCESS

On implementation head `21691bf8244a9274cb9c2dab208e0fa0daf29417`, real GitHub Actions [#40311526841](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40311526841) **SUCCESS** (application build + 4 source QA test files, 7 tests PASS); the independent metadata continuity index [#40311526755](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40311526755) was also SUCCESS.

The B233 4-direction strict gate requires:
- Native Recast Crowd genuine *original-source local approach* and same-source Rapier KCC ground contacts, ≥12 real approach frames and ≥0.48m actor movement before Crowd removal.
- The **same Rapier physical body**, without a new spawn/teleport, physically takes off on the registered original CI688 QA source collider (exact actual foot ID), performs one real ballistic jump, remains actually airborne, and lands ≥18 consecutive grounded KCC ticks on the exact opposite original source collider.
- Native Recast Crowd reattaches only after genuine Rapier landing and performs ≥10 grounded KCC-accepted frames, ≥0.45m true actor movement.
- The jump remains **actually queried and disconnected on native Recast**; the source gap cannot be misrepresented as a newly created ordinary walk edge.
- Both mirror sides and directions must pass. Source-only worlds include the unchanged frozen 25 solids/17 paint surfaces/26 links and original CI688 triangles; no arbitrary offmesh connector, scored paint, teleport, official win or production permission.

Recorded real Crowd preapproach/postrejoin supported KCC distances in metres:
`positive floor→slope 0.913108 / 0.473458`,
`positive slope→floor 0.907136 / 0.469879`,
`negative floor→slope 0.874420 / 0.473238`,
`negative slope→floor 0.906415 / 0.459879`. No teleport or second KCC instance occurred after initial spawn. Strict gate `B233_TRUE_CROWD_KCC_JUMP_CROWD_FULL_SOURCE_SEQUENCE_4_PASS` logged 4/4.

### Critical quality-first whole-project correction — B234 next

Repeated isolated KCC/Crowd proofs have now established a strong **movement primitive**, but **NOT gameplay**. More tiny sandbox-only motion tests would not meaningfully improve the user's intended playable Turf War. B234 should prioritize establishing a genuine **opt-in F3 QA application / real CpuAgentSystem ownership-integration point**, while refusing to promote original source geometry to the official 25-solid stage:

1. Map the actual `CpuAgentSystem` native Crowd steering and `phase14qGroundCollision` ownership boundaries. Design a *strictly gated explicit QA adapter* allowing only selected original-source evidence for F3; default stage, T19C/T20, main/Pages, and official score must remain unchanged.
2. Demonstrate an **actual CPU actor**, not a stand-alone mock, with its own Crowd agent suspended and its **physical** actor followed continuously by the approved native Rapier source KCC, with true rendered pose provenance and subsequent safe Crowd rejoin.
3. Require exact original CI688 provenance, real source mesh geometry visibility/authorization in that isolated F3 QA environment, and a verified original 25-solid connection (B228) before any opponent-crossing route can be credited. The 2.074235m airborne transfer is never just an offmesh teleport.
4. If actual CPU/Stage integration is blocked by missing source faces or a fake NavMesh island, **report the blocker without rebranding the sandbox success as live AI**. Freeze official 25/17/26/0, 0/12 true opposing routes, `productionAuthorized=false`, `unrestricted4v4Certified=false`, `officialWinner=NONE`.

This is a major milestone in control handoff *only*. User-visible outcome remains an incomplete frozen-layout gameplay prototype until actual native bot and stage connectivity are established.
