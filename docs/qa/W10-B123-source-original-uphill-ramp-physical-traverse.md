# W10-B123 — Original Temple01 lower first-drop → right-low raised ramp: genuine physical ascent

2026-10-23 JST. QA only `dev/t21-f4e103w-qa-infra`.

## Actual B122 physical basis
[B122 real native Chromium #39903255933](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39903255933) PASS: source original first-drop lower landing, 266 commanded true native keyboard ticks (first observed tick 6, final 282), W200/D12/W18/A16/W20; 19 Vitest PASS and true native KCC last grounded 0.686m inside first-drop slab. No second original floor reached; 1 normal first-drop descent suspicion preserved.

## Newly confirmed *existing* original source geometry
The original `UndertowSpillwayRouteRampGeometry.ts` **already registers** a specific original mesh from Temple01 `Fld_Temple01_pCube21569_1__FloorConcrete03`, mirrored negative-Z source, authored PAINTABLE with recorded source provenance. Positive-Z source ramp `UndertowT21D:right-low-route-ramp-positive-z` has actual original vertices: lower-Y3 `[.855934,3,47.552619]` and `[4.142941,3,54.257493]`; upper-Y4.5 `[5.046481,4.5,45.49824]` and `[8.333487,4.5,52.203114]`. Both original lower edge endpoints lie **inside** original source-registered `first-drop-landing-positive-z` by ~0.0643m; upper endpoints fall **inside** the distinct original `right-low-team-a` source floor at Y4.5. This is registered source geometry; it is not a new connecting ramp, inferred freehand floor, or proven Rapier traversal.

## B123 physical acceptance scope
Add a pure original-source cross-geometry audit (four tests) to make original lower/upper ramp overlaps inspectable without mutating source terrain, source 26 NavLinks, CPU physics or native collision. Add explicitly opted-in `T21_B123_REAL_RAMP_ASCENT=source` original Chromium CDP keyboard run:
- W200 down from source high original spawn to real first-drop landing.
- D12 then W18: copy measured original B122 approach to native location `x≈.861,z≈49.676` on named lower landing.
- Real KeyD for up to 90 additional genuine original 60Hz ticks across the slope aligned with +X/-Z direction, observing actual KCC and 5-ray original source ID. Return early only if physically KCC grounded on original `right-low-team-a`.
- To ACCEPT a distinct second floor, require actual source hit `right-low-route-ramp-positive-z` **AND** original first-drop source hit **AND** final genuinely grounded on named *different* original raised `right-low-team-a`, Rapier physical foot Y within .22m of 4.5, no fake actor teleports, no native safety stop and no more than natural first-drop suspicion. Preserve all native source samples, actual keyboard phase poses, JSON & screenshot even if genuinely HOLD.
- Expected source geometry authority **25 solids / 17 paint / 26 NavLinks / 0 score**, 7 CPU fixed original agents, no PR #5/main/Pages edits, CPU/HUMAN safety HOLD, 0/12 opposing-team crossing approval, retail Turf scoring & 4v4 HOLD. A successful lower→raised same-team traversal would NOT establish complete 4v4 or opposite-side path.

CI: [B123 exact source real Chrome run](https://github.com/ryomashibaba/browser-ink-tps/actions/workflows/t21-w10b123-real-original-route-ramp.yml).

## Classification
Do not claim any real physical ascent before this GitHub Actions native experiment concludes. If failure occurs, retain exact source ray IDs and every native keyboard phase, interpret real KCC contact versus missing original source, and pick the smallest next steering correction. Never solve failed traversal by generating an unverified ramp.
