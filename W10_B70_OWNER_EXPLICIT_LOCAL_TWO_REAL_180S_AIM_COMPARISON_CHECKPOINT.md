# W10-B70 — Owner-controlled true 180s FIXED vs SWEEP local comparison

2026-10-21 JST. Protected QA branch only `dev/t21-f4e103w-qa-infra`. Main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`, Draft PR #5 head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`, published Pages and frozen T19C/T20 untouched.

## Established evidence, not future promises

- W10-B68 [same-SHA real normal-preview full 180s FIXED/SWEEP runs](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39506926374) both SUCCESS. FIXED 3,615 real CPU impact changed source cells / 112 source shots vs opt-in SWEEP 11,779 cells / 491 shots, both exactly 4,951.404m source-ground CPU patrol, real 7/7 source CPUs, native 180s TIME_UP and actual restart. SWEEP yields 3.258× impact cells, 60–120sec 809 vs 18 cells. No original Turf score, no cross-team 4v4, no owner Windows GPU hardware validation.
- B69 [physical 2-click Chrome SWEEP opt-in/revert run](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39537444758) SUCCESS on code SHA `3c19077bdbb5cf19d60a4b2f6bfe710332bf3c6b`; default `?t21Play=preview` remains FIXED; user clicks SWITCH → new SWEEP trial session, clicks RETURN → new FIXED. No stealth CPU default change.

## B70 concrete usability change

The B69 ordinary nonproduction preview (NOT `t21QaDrive=source` and NOT production) now has an actual non-scoring `YOUR 180s SOURCE AIM COMPARISON` section on the existing B59 180-second end panel. Explicitly click to **SAVE THIS FINISHED ROUND & TRY THE OTHER CPU AIM**. On another REAL full 180-second session in the other mode, click to **SAVE THIS FINISHED ROUND & SHOW COMPARISON**. The result stays in this browser tab, can be cleared with one click, and does not need manual JSON transfers or source-file uploads.

- Only after verified B62 true full match `TIME_UP`, remaining clock exactly 0, >=10,800 real native ticks, 7 distinct real source-ground CPU joins, original frozen 25 solids/17 paintable/26 nav/0 scoreable, original 4v4=false, no stop reason, the explicit browser click builds an anonymous numeric snapshot. No source actor coords, private meshes, layer names, GUIDs, addresses, user-agent, host filenames, combat-enemy locations, raw frame log, game image or original asset bytes are stored.
- `sessionStorage` (same browser tab only) holds **just** two validated fixed-schema numeric counters. Any malformed, overly long or version-incompatible record is ignored rather than trusted; unknown fields are discarded on read. No background upload or remote telemetry. The browser returns to initial F3 source preview by a whitelisted path, not by mid-game CPU mutation. The default remains FIXED even after SWEEP comparison.
- Owner comparison displays per-mode actual source CPU shots, CPU source ink impact changed cells, real original-foot patrol distance, human shots/actual human ink changed, and measured render-callback p95 **which is NOT an actual GPU profiler**. Flags differing human input and never announces causal superiority, an original Turf score, opponent kills, original 4v4 completion or official winner.
- Unit tests cover both real-mode numeric captures, validation of 180s real clock and physics tick, stage authority HOLD, actor identity safety, malformed browser tab storage, per-input difference and final source impact delta. Existing B69 real Chrome mouse-click flow tests that B70 is visible only on ordinary nonproduction preview, cannot store before 180s, and stays unset over mode-switch reloads.
- Separate B70 heavyweight real Chromium trial uses *only one* actual 180s normal FIXED source-preview session, checks genuine end/UI readiness, performs one physical browser click on B70 SAVE, then verifies anonymous sessionStorage values survive the real reload into explicitly opted-in SWEEP with fresh STAGING and original unaltered 25/17/26/0. This verifies the actual storage/first-round user-action path. The second full-match comparison logic is pure-logic unit-covered, **not** claimed as a two-round owner GPU hardware test.

## Original source 4v4 blocker still HOLD

25 actual collision solids, 17 native paintable but non-scoreable surfaces, 26 audited original navigation links, 0 scoreable. Original `Vss_Temple01` Banc SetActor transforms and eight PntSet identities unbound, 0/12 natural opposing-team source paths, `activationReady=false`. Cannot claim native full 4v4, official Turf winner or original stage completion. Seven FIXED CPU source-ground patrol default unchanged.

## Verification status

B70 code prepared for GitHub QA. Exact-SHA GitHub Actions Node24 + Vite build, B69 browser regression, and one genuine 180s Chrome source test **PENDING**; do not mark them as passed before viewing the actual logs.
