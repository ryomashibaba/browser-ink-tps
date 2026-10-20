# W10-B58 — Genuine source-local 180s session presentation and honest results

2026-10-20 JST, base QA `8d10616ec53f7cb66120a193ec0ee17c6d9600ed`.
**Scope prioritization:** previous B55–B57 increasingly elaborate PAINT RUN modes are complete. B58 MUST stop making more micro-challenges; advance **F3 macro goal**: unify existing real human movement, weapon, 7 original CPU actors and the real 3-minute source lab session into readable live play activity and a native TIME_UP result/restart, without inventing a Turf winner or enemy connection.

## Actual code changes
- New F3-only `UndertowF3SourceSessionBoard.ts`: derived from unchanged genuine 60Hz match clock, canonical human `GameplayInk` bullet impact ownership, genuine PlayerInput accepted-shot counters, real CPU original-source projectile ink changes, actual 7 CPU Recast/Rapier physical rejoin snapshot, authentic CPU/human splats and human respawns. Never computes a score from non-Scoreable surfaces; explicit `NO OFFICIAL TURF RESULT`.
- A compact, passive lower-left live SOURCE SESSION HUD in actual opt-in F3 preview, not additional gameplay rules or movement changes. It gives player meaningful actual human-versus-CPU activity during a continuous session and conveys physical 7-CPU stage progress; non-scoring/not-four-versus-four text always remains visible.
- At actual native 180-second `TIME_UP`, the same UI transitions to SOURCE SESSION FINISHED and reveals the existing full-page `restart()` button; safe-stop is a distinct non-win result. This does not change the 180-second timer. In-game R restart remains existing.
- Native Chrome QA reuses existing B54 actual pointer-locked practice flow: compare visible HUD cells/shots/CPU ink and real physical rejoin count to the same source-app snapshot, required nonzero genuine original human cells/shots, no fake score or winner. Run dedicated new model Vitest tests for zero score, source drift, safe-stop and actual TIME_UP presentation without accelerating or forcing clock. Existing B54, B56, B57 browser flows unaffected.
- No source asset edits, no new source actor placements, no CPU behavior heuristics, no fake same-side enemy bots, no Scoreable masks. All 25 original physics / 17 Paintable / 26 nav links / 0 Scoreable and `activationReady=false`; main, Draft PR #5, T20 Pages untouched.

## Honest completion boundaries
An authentic **three-minute TIME_UP real Chrome live-clock wall-time playthrough** is separately desirable, but unless verified, it remains **HOLD** and must not be claimed from pure model state tests or a shortened Chrome smoke. Original Banc/SetActor placements and natural opposing team routes are still 0/12, so no original 4v4, Turf winner or production release. Source-local activity is not an official Turf score, and an owner manual RTX playtest is not automatically proved by CI.

## Verified bounded native-source evidence — 2026-10-20 JST

- **Initial integration `daa59b5f09a8e21cace96455592105313bfdb5b2` built unsuccessfully** because TypeScript had to account for potentially undefined `originalSourceNavigationLinks`. This is a typed source-authority omission, not a license to invent 26 links; initial failed Actions attempts remain visible.
- **Corrected code `2c35b8366799428cfdb4d90f96feb61de3ae17d3`**: [actual GitHub B54 source Chrome run](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39405569632) completed **SUCCESS**, with TypeScript/Vite build, **15/15 Vitest** assertions, live Chrome 60Hz real pointer-locked key/mouse input and actual source GameplayInk.
- On actual Chrome B54 trial: genuine CLASSIC practice CLEAR **217 native ticks**, **558 newly changed human ink cells since the explicit practice arm** and **12.01m genuine original-ground movement**, plus real Esc/Retry preservation. Independently, the B58 **page-start-to-current-session** HUD matched the same actual browser game snapshot: **32 genuine shots / 662 total new human projectile impact cells since page load / 0 observed CPU impact ink cells / 2 of 7 actual CPU original-source physical rejoins at that instant**. The live DOM contained **exact same 32 / 662 / 0 / 2** values. CPU count **2 is not 7/7** and no natural opposing combat is certified. The 662 vs 558 difference is due to distinct observation start times; it is **not** inconsistent score accounting. Native HTML explicitly carries Scoreable 0 and official winner NONE. No owner manual Windows playtest.
- The same tested SHA also correctly handled the pure 180-second `TIME_UP` result state (source session FINISHED, official winner NONE, restart enabled only on terminal result) and fail-closed invalid-data conditions via Vitest; **actual 180-second wall-clock continuous Chrome run is not verified**.
- The subsequent presentation adjustment `d68c192952ca87b5d80e5786cdf76b71f0847c8c` clarifies that the B58 activity display is **SINCE PAGE LOAD** and avoids overlapping the existing survey control. It also adds B58 source+test to the B56 and B57 real Chrome workflow path filters and their unit test invocation. **Exact final SHA regression checks are required before calling this presentation adjustment fully verified**:
  - [B54 Chrome CLASSIC on final presentation SHA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39406062794)
  - [B56 Chrome SWITCHBACK on final presentation SHA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39406062606)
  - [B57 Chrome PAINT RELAY on final presentation SHA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39406062487)

**Verdict currently:** B58 core honest session HUD **BROWSER-VERIFIED** at corrected SHA `2c35...`; latest `d68c...` exact-SHA regression and native full-duration end-screen proof are separately **PENDING/HOLD**. Never promote B58 to full Turf victory or original 4v4 authentication. Next high-priority work remains resolving original Banc/SetActor and authentic central source connectivity, not introducing a fourth minigame.

## Retrospective resolution of pending B58 integration (verified 2026-10-20 JST)

All three final-presentation SHA `d68c192952ca87b5d80e5786cdf76b71f0847c8c` native browser regressions later **completed SUCCESS**; they were no longer pending at B59 start:

- B54 [run 39406062794](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39406062794): CLASSIC genuine browser input CLEAR / result board regression green.
- B56 [run 39406062606](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39406062606): SWITCHBACK genuine browser source-foot outbound and return green.
- B57 [run 39406062487](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39406062487): PAINT RELAY genuine browser 3-stage independent ink green.

**B58 scoped native short-play integration verdict PASS** (build, model tests, B54/B56/B57 genuine Chrome integration on the exact presentation SHA). The **separate actual native 180-second complete session and actionable end UI remained HOLD**, and are specifically the W10-B59 scope. No claim that original 4v4 or Nintendo-authentic scoring has been achieved.
