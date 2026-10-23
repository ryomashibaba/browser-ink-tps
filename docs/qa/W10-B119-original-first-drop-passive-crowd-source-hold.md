# W10-B119 — Original source first-drop landing passive human Crowd mitigation

Date: 2026-10-23 JST; QA branch `dev/t21-f4e103w-qa-infra`. No production, main, Pages or frozen Draft PR #5 changes.

## B118 source evidence
[Native real Chromium run #39858039978](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39858039978): 23 Vitest PASS, build PASS; longer forward traversal **FAIL/HOLD** at real physics tick 175 after 13.761806m. HUMAN KCC was supported on original `UndertowT21D:first-drop-landing-positive-z`; original foot `[-.1737196,3.0249976,54.1308937]`, correct source NavMesh projection .075m away. Passive eighth HUMAN Crowd agent jumped **108.178m horizontally** during ONE native Recast update (post-step position `[3.1154752,6.0585303,-53.9971542]`). Existing strict 2m guard correctly stopped the run. Recast internal cause (which polygon, offmesh corridor or slot state) remains unproven.

Source audit of the actual 175-tick foot: inside the original source-registered FIRST DROP LANDING polygon at canonical project Y=3. Nearest explicit first-drop NavLink endpoint is over 2m away, so an invented "distance to endpoint" threshold would miss this true reproduction.

## Scope-limited safety intervention
- Pure `UndertowPhase14QFirstDropPassiveProxyGate.ts` checks the exact, existing immutable original 25-solid stage registration; tests only the named `first-drop-landing-positive-z` and its true 180-degree counterpart negative-Z slab **local source footprint and source top Y**. Vertical allowance .22m is the pre-existing F3 human NavMesh source snap threshold; no guessed coordinate/missing floor or new NavLink.
- While the physical Rapier HUMAN foot is within the exact named source polygons and source Y, `UndertowF3NativeHumanCrowd.syncActualPlayerFoot` withholds/removes **only the extra nonphysical eighth HUMAN Recast Crowd steering proxy**. It counts withheld native frames in existing `humanCrowd.snapshot`.
- The real HUMAN Rapier body, real seven CPU actors, original shared Rapier KCC collision veto, CPU FIXED default and original source NavMesh remain unchanged by this gate. **Human-vs-CPU Crowd avoidance at these landings is NOT certified**; the risk is exposed in the snapshot and original source QA remains HOLD.
- All other original areas retain the ordinary eighth passive human Crowd lifecycle, both true 0.065m projection residual / .26m original source projection bounds and the >2m native Recast displacement fail-closed guard.
- Genuine 480 native tick KeyW run and 120-tick regression remain separate; browser reports the actual original named source and number of withheld frames, stores the full source witness. A subsequent genuine stop must remain FAIL/HOLD with evidence, not suppressed.

### Tests and acceptance
Four new unit tests check the **actual** tick-175 original player foot, both mirrored lower landing polygons, upper/airborne or distant coordinates and foreign/nonfinite stage rejection. The existing dedicated B116–B119 real Chromium Actions must pass its Vitest/TypeScript and report the true route state. Even a longer pass does not certify a user-reported central-road missing floor, safe eight-person collision or official Turf 4v4. Frozen original counts **25 solids / 17 paint / 26 NavLinks / 0 Scoreable**.
