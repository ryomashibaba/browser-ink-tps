# W10-B190 — Genuine native start failure evidence BEFORE the first long seven-CPU wait

Date: 2026-10-25 JST. Baseline QA commit `b97260e61cf6a82030ebd8e06e12505c4c81741f`; protected QA branch only.

## Verified GitHub Actions state (not a physics result)
At intake:
- B189 genuine source first-drop and B187→B186 circuit run [40167760808](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40167760808) was still **QUEUED**, with no completed exact-SHA WebGL2 native evidence.
- Earlier B188 B120/B75 and B187 B120 were likewise queued; no new observed browser failure can be inferred or fixed by changing physical constants.
- The previous B189 fix uses the actual `cpu.physicalRejoins`, `cpu.cpu[]`, `cpu.freeCombatEnabled` contract instead of nonexistent top-level fields. But the new real browser runner still built `latestEvidence` **only AFTER waiting** for seven CPU release. A CPU release deadlock, stage stop or legitimate 180s TIME_UP therefore produced a generic 480s timeout and **zero preserved original body/Crowd identity evidence**. Repeated blind retests would not support any meaningful path or combat engineering decisions.

## Actual B190 changes
- Add `b190NativeCpuStartProgress(snapshot)` in standalone `scripts/t21-w10b190-native-start-evidence.mjs`: **read-only** inspection of the genuine source-only `UndertowF3SourceTraffic.snapshot()` data `cpu.physicalRejoins`, `cpu.cpu[]`, native 60Hz tick and true match state. Samples preserve each of seven original A1/A2/A3/B1/B2/B3/B4 physical feet and exact released/rejoined flags, checking all 25 original solids, 17 paintable surfaces, 26 original links, 0 Scoreable, zero physical relocations, no production authorization. No synthetic foot, clock, bot, source link, paint or fake winner.
- Add five focused Node regression tests for partial legitimate native CPU rejoin, actual seven-source READY, TIME_UP, duplicate ID/nonfinite feet and forbidden geometry/production authority.
- Modify the existing `t21-w10b187-real-native-source-circuit.mjs` real Chromium runner **before** its genuine seven-CPU wait: initialize failure-preserving evidence immediately after the real pointer-lock, then sample original CPU progress every 30 actual 60Hz native ticks or on match-state transitions (bounded to 180 snapshots). If the real game reaches `TIME_UP` before player practice, exit with `B187_REAL_MATCH_ENDED_BEFORE_HUMAN_SOURCE_CIRCUIT`, not eight more minutes of waiting for impossible `PLAYING`. If the native source stops, exit with its true original-source stop evidence. Existing `finally` screenshot/HOLD JSON pipeline now receives the early record on CPU release timeout/failure.
- On true seven-CPU native source release, proceed unchanged to B187's genuine WebGL2 original first drop -> original ramp -> raised source floor -> physically changed human ink test. `B190` early snapshots are **only source progress diagnostics**, not route, combat, 4v4 or Turf scoring certificates. Do not mark B187/B186 CLEAR until that exact browser run uploads its original-physics witness.
- Reuse **only** the existing B120 workflow for Node 5-test preflight and the single real Chrome session. No new GitHub Actions workflow, shared app touch, common CDP driver change or browser fanout.

## Why this direction
A queued GitHub Actions job cannot produce genuine WebGL2 measurements until GitHub runner infrastructure starts it. A browser test must save ground truth even if CPU source-first-drop release never happens, rather than falsely attributing every timeout to unproven ramp geometry or endlessly growing QA. The high-level product priority remains **actual original navigation and human-versus-CPU combat**, not badges or more isolated geometric tolerances.

## Strict authority and future work
Original registered 25 Rapier stage solids / 17 source paint surfaces / 26 source navigation links / **0 Scoreable**. Original source opponent natural route **0/12**; `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`, full original Ver.7.2.0 4v4 HOLD. Protected main, T19C/T20, Draft PR #5, Pages, frozen Nintendo/Windows original assets unchanged.

B191: inspect the earliest actual B190 same-SHA browser execution, exact 7-CPU timeline and first-drop→ramp→human-ink witnesses. If no Actions runner has started, acknowledge external CI queue rather than claiming PASS, and prioritize real playable source work only when it can be validated.
