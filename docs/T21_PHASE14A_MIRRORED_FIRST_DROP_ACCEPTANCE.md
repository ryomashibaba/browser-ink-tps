# T21 Phase14A — Mirrored First-Drop Playable-Corridor Acceptance Gate

## One milestone, not a microaudit
Goal: move from 13D source-only visual triage toward the FIRST actual playable vertical slice without fabricating any connecting platform. Select the two mirrored, existing, evidence-backed routes from spawn-high Y=7.5 m to first-drop landing Y=3.0 m, with one-way links.

## Current actual code evidence
- Frozen inert T21-D package has 25 partial-stage solids, 17 paint surfaces and 26 one-way links. Route readiness is not overall stage readiness.
- Recast QA enumerates eight probes: six expected MUST_REACH (including first-drop positive and negative sides, right-small-drop pair and right-low-ramp pair) plus TWO DIAGNOSTIC_GAP routes from right-low to underpass, still forbidden for runtime promotion.
- Paint source authority exists for both spawn and both landing surfaces. Scoreability of turf is separate and has unresolved blockers. Do not equate Paintable with Scoreable or infer missing floors.
- Prior local RecastStageNavigation tests exercise all eight QA-only paths; this milestone REUSES that tested path and avoids a redundant navigation-simulation suite on every iteration.

## New executable gate
`src/stage/undertow/UndertowPhase14FirstDropGate.ts` takes the EXISTING T21-D geometry and existing connectivity probes as inputs; it does not generate, modify, or promote geometry or navigation. It verifies both one-way links, source-backed collision-footprint readiness, both original paint backing solids, preserved diagnostic underpass gaps, 25/17/26 frozen counts, zero scoreability promotion, no orphan paint surfaces and every existing global blocker. It returns `ISOLATED_RUNTIME_QA_CANDIDATE` when these static contracts pass. Crucially this is NOT runtime-playability approval.

`UndertowPhase14FirstDropGate.test.ts` covers mirrored routes and negative path cases: false activation, swapped bidirectionality, fabricated connectivity, disabled collision, missing paint surfaces. No additional full OBJ scan, no new stage/mesh or duplicate Recast startup.

## Phase14B acceptance checklist — only after explicit authorisation for a sandbox gameplay prototype
1. Use existing T21-D partial QA stage ONLY, never switch the production stage automatically. Track both human-form and squid-form spawn-grounding and vertical first-drop traversal, per-side one-way stop/restart behavior.
2. Run actual Rapier character-body collision against existing solids; verify landing and no invisible bridge. Verify camera rays for both views, first-drop trajectory and below-stage fall-out rather than assuming source mesh shows collision.
3. Emit separate ink/surface-hit and paint persistence evidence on the two existing source-backed spawn and landing surfaces. Turf scoring stays DISABLED until independent scoreability-mask QA.
4. Run separate full navmesh and CPU path following in a LOCAL, opt-in QA harness, both sides, plus negative gap paths into the underpass. A Recast reachability result alone does NOT demonstrate real CPU or player movement.
5. Assess FPS and stepping stability (near source geometry, landing, respawn), record screenshots/video and user/human judgment.
6. If successful, expand from first-drop to adjacent right-low ramp; the two right-low-to-underpass gaps remain HOLD until original source path and physical traversal evidence explicitly close them.

## Do not promote yet
Phase14A static contract passing only means ready to CONDUCT the isolated QA. It does not prove human movement, squid movement, collision grounding, actual runtime paint, CPU traversal or complete game. Any temporary QA geometry must retain exact original source and remain fully disconnected from production; do not add inferred slabs or auto-activate T21.

## Throughput/quality
Continue per-commit fast full-unit + TypeScript + negative QA workflow, and exact-HEAD full Pass18/Phase12/original-OBJ screenshot CI at integrated milestones and before any release. This gate joins existing Vitest tests rather than introducing another costly full historical source pass.

## Freeze
PR #5 Draft open and unmerged; T20 live inkworks-junction, T21 activationReady=false, Visual Freeze unapproved, 124 original visual meshes/64 walk sources/42 hard outer XZ, 22 opt-in original 488 faces and 28 held original 616 faces. No new mesh, gameplay collider, source welding, paint, nav, CPU, score, activation, deployment or merge.