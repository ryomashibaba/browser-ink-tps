# T21 B348 — FINAL verified fixed-aim physical shooter research result

**2026-10-30 JST. Real Chromium verified CI PASS:**
https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41014778484
Original candidate's first native run #41014581457 was a
Vite/Chromium preview startup failure, **not** gameplay evidence.
Restoring the proven native preview address fixed the startup;
the true independent chain B337/B344/B345/B346/B348 then succeeded.

## Actual 60-tick native held-fire results

- Original-source world: **25 Rapier solids, 17 Paintable surfaces,
  26 original NavLinks, 0 Scoreable**. Full 180s practice session
  with one genuinely input-controlled human plus seven real CPUs.
- Real **human accepted shots: 10**, corresponding to **10 actual
  PlayCanvas projectile launches**, **10 physical exits**, and
  **10 actual original Paintable collision events**.
- Grounded shots: 10. Airborne shots: 0 (requires B349 genuine
  Space jump testing; do not infer airborne correctness from B348).
- Maximum actual angular difference between 3D initial physical
  projectile velocities: **2.389052°**.
- Maximum actual 3D original physical impact point separation:
  **0.238686 m**. Not a made-up gameplay visual or hit marker.
- Original ownerGrid changed-cell events: **135**, versus **91**
  for the separately verified fixed-aim/no-accuracy B346 baseline,
  an observed difference of **+44 changed cells**.
- Native 12-tick accepted shot intervals: **[2, 2, 2, 2, 2]**,
  preserving B345's genuine first-press timing correction.
- True native human ammo: **100 → 90.5**.
- No invented physics frames, hits, ink, actor reposition, link
  or stage geometry promotion, winner or scoring.

## Scope and strict scientific interpretation

This is **technical LIMITED PASS** that the B348 candidate makes
the actual *physical* human Shooter bullets deviate in a bounded
way under *fixed* camera aim, unlike B346's identical coordinates.
The additional changed-cell events are genuinely recorded by
original ownerGrid, but an individual projectile -> specific changed
cell proof still requires its own audit.

**B348 is not Nintendo-original accuracy**: 4.86° standing and
11.66° jumping reference envelopes were used as a candidate from
third-party reference data, while the deterministic hash distribution
and progressive first-shot precision are a *project hypothesis*.
The native measured max 2.389° is not proof these envelopes are
Nintendo's exact algorithm or that B348 is balanced.

B349 tests actual Rapier KCC grounded-to-airborne launches under
a true Space key, and only after independent native proof may
original fidelity, ground/air spread and artwork/sound be evaluated.

**ART REJECT/HOLD; natural opposite-team CPU source routes 0/12,
0 Scoreable, winner NONE, full4v4 HOLD, productionAuthorized=false.**
