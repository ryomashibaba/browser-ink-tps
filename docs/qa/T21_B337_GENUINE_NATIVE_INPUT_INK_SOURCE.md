# T21 B337 — genuine same-session WASD / mouse aim / native original ink
Date: 2026-10-30 JST. Branch `dev/t21-f4e103w-qa-infra`.

## Scope and nonclaims
B336 certified a genuine 180-second clock while B335 supplied no human WASD.
B337 adds a **bounded native gameplay QA**, reusing the proven B335 original
REAL FULL ROUND UI and the B312 read-only physical human-foot/source-owner
ledger. This changes no gameplay code, stage, actor placement, ink or score.

Within one genuine PlayCanvas/WebGL2/Rapier/Recast full-round world, real CDP
mouse movement must alter the camera's *actual native yaw*; genuine mouse
fire must produce accepted human shots, human impact event and new original
paint cells. Real KeyW/KeyA/KeyS/KeyD browser inputs then run bounded native
ticks; actual W movement must be >=0.15 m with a supported original Rapier
source foot. Seven physically rejoined native CPU identities are preserved.

The eight outputs are START/END real native 1600x900 PNG plus seven JSON
checkpoints (START, AIM, FIRE, W, A, S, D), with independent artifact guard.
Not a synthetic browser fixture, guessed camera pose, QA-tick injection,
phantom floor, or stage promotion. B337's independent pure Node fixtures
are only verifier tests and cannot certify actual gameplay.

## Key limits
- Native pointer-locked CDP input is automation, **not a human playtest**.
- Sparse original-foot checkpoints are NOT proof of every intervening KCC
  contact, seamless full-level traversal, enemy route or natural combat.
- CPU 7/7 physical rejoin is not 12 opposing paths; official routes remain 0/12.
- This short window is not a second verified native 180-second TIME_UP.
- Stage must remain 25 Rapier solids/17 original paints/26 authored links/
  0 scoreable, activationReady=false, 4v4 HOLD, ART HOLD, winner NONE.
- main, T19C/T20, protected Draft PR #5 and public Pages not modified.

## Acceptance
A B337 genuine success requires **both** real Chromium runner + independent
validator SUCCESS and inspectable JSON/PNG artifact on the exact HEAD.
If native aim, original support, movement or new human ink are absent,
mark HOLD and preserve failed trace; do not weaken thresholds blindly.

The existing B336 workflow now incorporates ONE short B337 real-browser job.
No new workflow file and no rerun of the heavy B335 180-second workflow.

## 2026-11-03 B337 actual original-floor aim study (research-only)

- Historic genuine Chromium #41558592950 reached 7/7 CPU, actual camera yaw 4.4°, but combined accepted-human-shot + painted-cell wait expired after 120s. That trace cannot distinguish a physical gun input failure from an aim that never hits source floor.
- B337 driver now reuses proven B313 native **B271 original active paint cell** targeting: actual original Rapier foot, the same original-source paint row, actual real camera/pitch, **real CDP mouse movement**, and native camera angle confirmation before mousePress. No camera/HP/ink/actor/route edits.
- Split native accepted HUMAN shot and actual source impact/owner-change waits. On HOLD, write a factual diagnostic with original impact source, real shot count, real ownership, pointer lock, and native tick.
- Independent guard now requires original active cell provenance, physical source identity, native yaw/pitch agreement and true painted source. Existing 7 CPU, no-score/no-win, real WASD and immutable 25/17/26/0 assertions unchanged.
- This study is an isolated **research branch**; the queued B316/B322/B162 F2 verification of the main QA branch must complete independently. No PASS until exact branch build, Node tests and genuine Chromium input + actual source paint succeed. Main, Draft PR #5, public Pages untouched; 0/12 opponent routes and production/ART/official 4v4 HOLD.

## 2026-11-03 — Actual authoring schema: paint SOURCE surface vs nav anchor

**Correction of the preceding short-lived research-only SHA
`671df2b785c21ea7f5ba6841eef074e84bb1afa9`:**

Read the actual authoring function `buildFlatComponent` in
`src/stage/undertow/UndertowSpillwayBlockoutGeometry.ts` rather than the
navigation QA derived-anchor constant:
- Genuine `StagePaintSurfaceDefinition.id` is
  `\${solidId}:paint` (e.g.
  `UndertowT21D:spawn-high-positive-z:paint`).
- `undertowPass18bTraversableQaAnchors` in
  `UndertowSpillwayConnectivityQa.ts` separately names its
  **navigation audit node** `paint:\${backingSolidId}`.
  That navigation anchor is NOT the paint surface ID, nor does it appear
  in the 17 native B312 `originalRows` owner surface IDs.
- `TestStage.defineTestSurfaces` passes actual `surface.id` through.

Therefore the old `<backingSolidId>:paint` mapping in B337 driver/auditor
was correct and is **restored** on this SHA. Unit fixture and explicit
negative test now reject the false `paint:<backingSolidId>` nav-only
alias. No geometry, collider, CPU, actor or ink source modified.

Other useful B337 improvements are **retained**: real camera/body
positions are recorded; the independent observer derives expected yaw
and pitch geometrically from the actual B271 active painted cell and
genuine camera snapshot. These remain unverified in real Chromium until
GitHub Actions runs. The erroneous preceding study commit MUST NOT be
used as a source ID specification.
