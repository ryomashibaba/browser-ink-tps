# W10-B161 — Make original A1 ally ink a genuine optional practice objective

**2026-10-24 JST** · GitHub `ryomashibaba/browser-ink-tps` · QA branch **`dev/t21-f4e103w-qa-infra`**, no deployment.

## Entry check: B160 build failure (not yet source game QA)
Exact SHA `cca872394f9dfbb85426cdff57af82c2d5faf6da`, B75 [Actions #40083071547](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40083071547) and B139 [Actions #40083071569](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40083071569) **failed at TypeScript** before native Chromium. The B160 actor-value unit test read `fake.byActor.B1.changedCells`; with the API's runtime-validated `Record<string,...>`, TypeScript rightly requires a presence guard. **B161 fixes only the synthetic fixture reference to `fake.byActor.B1!.changedCells`**; the actual strict runtime seven-ID, exact Team A/B cell totals, uns cored provenance checks remain. No B160 real-browser PASS is claimed before running exact-SHA B161.

## B161 playable improvement, grounded in genuine A1 paint

The prior B152/B153 source QA proved that A1 can fire real projectile paint onto registered original surfaces under **explicit** A1 rally + `allyInk` opt-in (6 real original impact events and 175 changed ink cells in the corresponding prior native run). This gives a practical opt-in multiplayer-like *cooperative training* mechanic without pretending there is a full original 4v4.

- Extend existing **60Hz native Rapier/KCC + real PaintCoordinator** `UndertowF3SourcePaintRun` with `ALLY_SYNC` practice variant. It does not invent any KCC displacement, ally movement, synthetic shooting or floor geometry.
- Availability: only current nonproduction original-source preview with both `?t21W10B137=allyRally&t21W10B150=allyInk` present (plus existing `t21QaDrive=source`). In default FIXED or ordinary preview, original `CLASSIC → SWITCHBACK → PAINT_RELAY → CLASSIC` cycle is unchanged; `ALLY_SYNC` can only be selected with explicit opt-in.
- Three independent real user-achievable conditions after **physically arming** the challenge: (1) ≥180 real *human changed impact* ink cells, (2) ≥12 meters of incremental **native grounded original** KCC travel in ≤60 native seconds, (3) ≥30 **fresh A1 B152-exact tagged impact-changed ink cells** from real A1 source-aim → physical projectile → registered original surface collision → accepted source raster change, with at least 1 genuine A1 impact event. The A1 quota takes a baseline at actual RUNNING start; A1 past ink from earlier in the session is never credited. A1 contribution is NOT included in the human 180-cell quota.
- Invalid provenance, disabled opt-in, counter rollback, source authority drift, game stop, pause and pointer unlock abort or fail the attempt, never grant an artificial record. It is intentionally possible to **not clear** if A1 doesn't produce enough real paint; no manufactured aim or forced bot motion.
- Existing source training card adds the fourth mode only under A1 experimental opt-in and shows independent real A1 changed cell count and events. The existing practice objective hint explains when human movement/paint is complete but A1 still needs genuine impacts. Distinct in-page best/clear tracking already built into `UndertowF3SourcePaintRun` is preserved for the new mode.
- Existing B139 real browser runner checks that the practice option is disabled in FIXED mode and enabled only in explicit ALLY_RALLY/TEAM_COVERAGE. It does **not** arm the challenge and therefore cannot certify an in-game human/A1 cooperative CLEAR; unit tests exercise that state machine, but genuine full CLEAR remains unverified until independently driven.
- Existing B75 preflight includes new `B161OriginalAllySyncPractice.test.ts`, original B25/B55/B56/B57 practice suite, B160 actual-CPU view test and unchanged upstream source guards. Do not create a new CI lane. Keep original app default behavior untouched.

## Source limitations and current priorities

The actual frozen original stage continues at **25 solids, 17 Paintable, 26 NavLinks, 0 Scoreable; 0/12 naturally connected opposite-team routes**, `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`; full 4v4 HOLD. B159 real native investigation established 2/42 original source Face centroid Recast projections, 0/42 registered Ray support in bounded casts, and CI #691 showed merely adding the already known 42 exact source faces cannot connect the original missing underpass routes. Do not repeat the speculative connection experiment.

Next prioritize using existing physically certified F3 source zone to achieve an actual B161 source-local cooperative CLEAR, testing usability and real teammate assistance. Keep original cross-team 4v4 blocked until independent source geometry/NavMesh/KCC proof exists. Reduce QA-only B-number studies, invest in native gameplay.

**All B161 exact-SHA build and real browser results are initially UNVERIFIED.** Update with actual GitHub Actions evidence instead of inferring from synthetic Vitest fixtures.
