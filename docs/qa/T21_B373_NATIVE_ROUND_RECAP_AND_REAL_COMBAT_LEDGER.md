# B373 — actual source local circuit + real CPU combat in existing 180s recap

Date: 2026-10-31 JST. Branch `dev/t21-f4e103w-qa-infra`. Source-only F3 gameplay presentation. Do not promote to original Turf.

## Predecessor acceptance
B372 actual original-source 1+7 Chromium integrated CI [#41180736237](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41180736237): **SUCCESS**; 11 accepted player shots, 90 real original impact ink cell changes, 12.8334m genuine grounded movement, original raised source foot `UndertowT21D:right-low-team-a`, genuine native B186 local circuit CLEAR, original opponent route certified **0**, no official winner.

## Why this slice
True 180s source session end screen already existed (B58/B59) but it recorded basic shots/paint and splats without the physical B186 original first-drop→ramp→fresh-human-ink goal or B367 real human-to-CPU projectile damage. Player could complete a physically true local objective and not see what had actually been verified in the existing session summary. This adds information to the **existing** recap and final card, not another overlay, actor, game mode, score, or objective.

## Implementation
- `src/app/UndertowF3SourceSessionBoard.ts`: in **explicit selected B343 source shooter only**, consume existing B186 current-life goal state and actual `humanCpuDirectHits` / `humanCpuDirectSplats`. Validate source 25/17/26/0, goal genuine recorded ramp, ink, non-scoring, false natural route, human hit counts and no score authorization, fail closed. Display current-life (not whole-round persistent) source circuit in existing session HUD and completion card. Real player splats/returns already shown.
- `src/app/UndertowF3SourceSessionBoard.test.ts`: test valid physical source circuit, authenticated time-up summary, actual respawn/life reset, false cross-team route and forged score/hit rejection.
- `scripts/t21-b343-real-source-volley-round.mjs`: existing genuine Chromium source shooter + seven native CPUs checks the B58 live recap after true source first-drop, registered ramp and physically painted source ink. Actual source shot/ink counters must match the same world and its B186 status. No fake CPU hit target.
- Existing B343 GitHub Actions integration adds the SourceSessionBoard unit tests; local work does not alter `main` or production.

## Verification / authority
Initial B373 run [#41181528331](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41181528331) **FAILED** at the lightweight B352 trigger-matrix contract because the edited workflow mistakenly included its own YAML file in push paths. Corrected without relaxing B352 or disabling tests. Latest acceptance gate: [B343 real Chromium run #41181647068](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41181647068), triggered via the actual existing native script. **Until the run ends SUCCESS, B373 is unverified end-to-end.** Live source recap is covered by the browser; the **TIME_UP 180s source-shooter finale** is unit-tested by selected-mode source summary but not automatically exercised at actual time-up by the B343 shortened Chromium path. Do not claim that scenario was natively certified.

Hard bounds: 25 registered original Rapier solids / 17 original PaintSurface / 26 original NavLinks / 0 Scoreable; opponent natural path 0/12; original 4v4 and Turf winner HOLD, `productionAuthorized=false`, `unrestricted4v4Certified=false`. Main, frozen T19C/T20, public Pages, Draft PR #5, private original assets unchanged.

## Next gameplay priority
Following passing CI, prioritize one larger user-visible real interactive improvement per batch, especially fluid shooter/human death and true native respawn play with source physics/ink and seven CPUs, without repetitive tiny QA or invented enemy routes. Report source-authority blocker rather than introducing fake scoring.
