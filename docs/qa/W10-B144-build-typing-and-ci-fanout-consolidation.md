# W10-B144 — Build type repair and native Actions fanout deduplication

Date: 2026-10-24 JST. QA branch only.

## Real, observed CI failure
GitHub [B75 #40024983427](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40024983427), started from old B141 commit `c0f561176a76b90b1a4392ce9d00158067f2e891`, completed with two **TypeScript compile failures**:
- `UndertowF3OriginalAllyProximity.test.ts`: changing the length of readonly `physicalRejoins`. **Already fixed** in `f34e8c32` (assignment of a new array); B144 retains the prior fix.
- `UndertowF3PlayablePreviewApp.ts`: B141 view accepted `originalSourceNavigationLinks:number` but actual stage snapshot supplies `number | undefined`. B144 corrects the view's type; strict `!==26` source authority test is intact, and a new test confirms missing data maps to `SOURCE_HOLD`. No route or scoring authority relaxation.

B143 native runner and B142 game standoff do not have a completed source-level CI result yet. Do not confuse this old compile failure with a real original Rapier gameplay failure.

## Remove redundant old source-traffic CI triggers
B131 successfully narrowed older `UndertowF3PlayablePreviewApp.ts` fanout but did not narrow `UndertowF3SourceTraffic.ts` triggers. Updating opt-in A1 code therefore queued at least B15/B96/B99/B100/F4E103W + B75 + Continuity each time, preventing the most useful browser tests from finishing promptly. B144 removes **only** the source-traffic path from `push.paths` of those five historical suites, preserving every special script path, their native Chromium scenarios, and all `workflow_dispatch` manual execution. The current B75 remains triggered by `src/app/UndertowF3SourceTraffic.ts`, runs the production TypeScript bundle, `UndertowF3SourceTraffic.test.ts`, B137/B141/B142/B143 unit tests and native WebGL2 FIXED/SWEEP. The B131 static regression test enforces the new trigger matrix. Old jobs queued prior to the commit are not necessarily canceled by the updated trigger.

## Frozen authority
Unchanged: 25 original Rapier solids, 17 original paint surfaces, 26 source NavLinks, 0 scoreable, opponent paths 0/12, `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`, default FIXED, real human KCC and genuine CPU movement. No main, hosted Pages, frozen T19C/T20, Draft PR #5 or private original asset modification.

## Next
Verify same-sha B75 build and regression results. Then inspect B139 genuine original human W200/D12/W18 test and real ally physical samples before adding new gameplay logic. A queued CI or new unit test is not a certified A1 meeting.
