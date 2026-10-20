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

## QA
Pending verified SHA and GitHub hosted native browser evidence. Finalize only after checking exact SHA, Chrome genuine 60Hz-input evidence and all relevant regression jobs.
