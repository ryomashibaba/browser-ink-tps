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

## B123 native trial #1 actual results — source ramp contact PASS, ascent HOLD

[Actual Chrome #39909590822](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39909590822) at SHA `2bc0e28f8d9d29585ddcbb6b51edb533f742703b` completed **FAIL/HOLD**. 4 Vitest files **19/19 PASS**, Vite/TypeScript build PASS. Actual native input W200, D12, W18, D16 reached **tick 256**, body **[1.7537744,3.9377658,49.2078743]**; original Rapier KCC **grounded** on `UndertowT21D:right-low-route-ramp-positive-z`, foot Y **3.0677658**. Genuine first-drop→registered uphill ramp transition was proven. Higher distinct `right-low-team-a` Y4.5 was **not** reached, so full ascent HOLD.

True independent B118 Crowd witness at same actual native tick 256: original NavMesh foot projection residual 0.1207615m (inside 0.26m); passive HUMAN Crowd agent was synchronized before Recast, then native Recast sent the eighth nonphysical passive HUMAN proxy **7.1525098m horizontally**, 7.9424615m in 3D, including vertical +3.453m. Original strict 2m stop `T21_PHASE14Q_UNBOUNDED_CROWD_DRIFT` correctly held, **NOT** a physical player fall or missing interior ramp.

[Actual B123 raw run artifact ID 12481983879](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39909590822) retains source ray IDs, real Chromium screenshot, real keyboard phases, genuine Crowd witness, stop reason.

## B123 bounded passive-eighth-Crowd source ramp safeguard and recheck

The only new dynamic safeguard `UndertowPhase14QRegisteredUphillPassiveGate.ts` identifies the **exact already-registered** original source mesh triangles of `right-low-route-ramp-positive-z` and its true negative-Z mirror, with actual physical foot within **0.22m of interpolated original ramp surface height**, and then withholds/removes **only the passive 8th Recast human-avoidance proxy**, just as B119 did exclusively for the lower original landing. Actual tick-256 foot matches original source mesh plane within ~0.043m. Recorded withheld native ticks and last source ramp gate in QA snapshot/real JSON. Preserve the same original strict >2m Recast guard, original .065m source residual, .26m source projection, all seven CPU positions, real player Rapier body, original 25/17/26/0 stage arrays. CPU↔HUMAN steering avoidance along the ramp is explicitly **NOT** certified.

5 focused tests verify actual tick256 source coincidence, proper exclusion outside ramp, physically impossible vertical positions, mirror source provenance and nonfinite fail-closed. Original real CDP W200-D12-W18-D90 trial and evidence capture rerun at exact patched SHA. **Do NOT mark B123 raised-floor crossing as PASS unless the real native KCC lands on separately registered `UndertowT21D:right-low-team-a`**. Even then complete 4v4/central source and natural cross-side routes still HOLD.
