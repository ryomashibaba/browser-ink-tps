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


## 2026-11-03 B337 original LOCAL active-cell aim / genuine Chrome previous FAIL
- True Chromium research run [#41575464137](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41575464137) **FAIL**. Its real evidence artifact #13208219850 has `START`: native tick1056, one human on `UndertowT21D:spawn-high-positive-z`, 7 rejoined true CPU, actual player body [0.0169,8.3951,67.8927], yaw0, pitch-12, shots0, changed cells0, actions [MOUSE_MOVED]. Failure: `B337_TRUE_CHROMIUM_NO_SAFE_REAL_ORIGINAL_ACTIVE_SOURCE_AIM`. No shot or true paint PASS.
- Root cause in source design: `B271MultiSurfaceRegistration.b271NativeFootprintProbes` samples **global nearest-to-center, first, last** of the entire source footprint, only three probes for optical registration. `b313ChooseOriginalActiveAim` requires the human body within 10m, camera-safe yaw/pitch and local screen coordinates. On the B337 actual high spawn these global sample positions provided no safe candidate. This is a candidate-enumeration limitation, **not permission to relax camera safety, move the human or inject ink**.
- Corrected in isolated B337 SOURCE research: new `b337NativeNearbyActiveSourceCells` selects up to 3 cells only from the same real `PaintSurface.isCellActive` mask, near the exact native `B312` original body and supported source foot, using original `localToWorld`, real active grid/owner and original camera angles. Only responds to explicit `t21B337=localOriginalAim`. B271 global optical probes remain unchanged. Original 17 source rows, geometries, 25/17/26/0 scoring gate and physical source target ID remain unchanged.
- Research runner asks for local cells in the read-only B312 ledger, drives the same genuine CDP mouse, compares sampled actual yaw/pitch to actual camera-cell geometry, then requires real shots and real changed native ownerGrid; no artificial pose, projectile, tick, score or ink. Independent B337 audit additionally checks selected real local-cell provenance and 2.5–8m actual body distance. Vitest dedicated local-cell guards plus application typecheck are in existing one B337 research CI; **new SHA must pass genuine Chromium before source shot/ink can be certified**.


### 2026-11-03 native B337 CI #41590175855 FAIL — repair test fixture provenance
- New research native CI [#41590175855](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41590175855) **FAIL at pure-gates**, 9/10 Node tests PASS; real Chrome skipped. The _old_ positive fixture's `originalActiveCells` lacked new exact `B337_NATIVE_LOCAL_ACTIVE_GRID` owner/provenance and sampled a target only 1m from the real body, while the new SOURCE guard correctly requires genuine 2.5–8m local native cells.
- Fix exactly the positive fake fixture **without weakening production authority**: recorded target world [0,5.9,44], actual body [0,6,40] (4m); observed camera original [-0.7693,10.35,34] retains target yaw4.4°/pitch−23.92°. Add exact real source cell provenance `B337_NATIVE_LOCAL_ACTIVE_GRID` and originalOwner0. Added negative cases rejecting absent provenance, B271 optical-only, invalid owner, mismatch selected cells, near/too far.
- This remains a controlled fixture used solely to test the independent audit; **not** proof of actual native paint. Only next proper real Chromium can certify a source shot and native ownerGrid change. Original full game, source boundaries 25/17/26/0, Scoreable 0, ART and production HOLD preserved.


### 2026-11-03 B337 #41594227748 typed source tuple correction
- [#41594227748](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41594227748) native CI ended FAILURE before Chromium: Pure 11/11 PASS, local B337 Vitest 3/3 PASS, TypeScript TS2532 `B337ActualLocalActiveCell.ts` at 48/50/54 due strict noUncheckedIndexedAccess on `body[]` and `camera[]`.
- Fixes only checked array indexing by tuple destructuring **after** `finite3()` validates exact length and finite coordinates. No change to geometry, ownerGrid, original source foot/aim guard, bullets, camera, input, HP or ticks; next CI must pass full TypeScript and genuine Chromium separately.
