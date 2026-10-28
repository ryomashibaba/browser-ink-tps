# B269 genuine-source final review → B270 whole-view scope attribution

Date **2026-10-28 JST**. GitHub QA branch `dev/t21-f4e103w-qa-infra` only. **B269 TECH PASS / ART HOLD**. No production or original unrestricted 4v4 authorizations.

## Genuine browser sources and provenance
- [B268 genuine F3G run 40647593003](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40647593003), artifact id `12798809398`, ZIP SHA256 `00b3290b9dd587c7697424f6903c067f049c9229d4a4a17471218249f5332b37`. Tech SUCCESS, B268 ART REJECT.
- [B269 genuine F3G run 40651444141](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40651444141), commit `2a8d04d4b4d5738cdab26780de30cf309a05a18f`, artifact `12799749435`, ZIP SHA256 `fc6149bfe4ef0de5975bf1d383b8c64fca9829de329da9184c7bddf5ee57369f`, **SUCCESS**.
- Source: certified `25 original Rapier solids / 17 original paint surfaces / 26 native NavLinks / 0 scoreable`, plus 57,578 exact original UV triangles and 19 original textures.
- B269 genuine FROZEN A→B→A: **35,692** changed / 1,440,000 pixels; restoration **0 pixels different**.
- B269 REAL_INK: **115 actual owned Team A cells**, 58 native on-screen ownerGrid sample centers, 10 genuine human shots, 45,448 changed pixels (3.1561%); 38,151 changed by RGB max channel >=8; 19,845 >=24. **Restoration 0 pixels different**, stage/ink/actor world unchanged. 13/58 sample-point *median 5×5 RGB patches* change by >=8, but this is NOT ink-color/pixel visibility certification.

## Actual aesthetic judgment — B269 limited improvement, still HOLD
B269's angular helmets, large twin turquoise rear chevrons and separated legs create more immediate rear-view team markings than the B268 compact candidate; these are real PlayCanvas parts in actual native screenshots, not generated render concepts. However, actors are still simple box primitives resembling a squad of rectangular robots, with little distinct movement or in-game personality. Original source scenery remains unclear, major optical planes overlap the playable view, and UI diagnostic panels dominate paused QA images. **No genuine visual art candidate has met holistic production quality.** Keep B248 original default, B269 research only; no Art PASS, no source asset replacement. Only near-field Team A actors are apparent; visibility of opposing Team B for real team discrimination is not certified by this camera sample.

## B270 independent source-art scope attribution — 1600×900 real screenshot
From each run's independently SHA256-verified A/B/A full-frame screenshot, compare original B248 against only that run's candidate. The B268 and B269 baseline original PNG hashes differ; **DO NOT** compare B268 and B269 with pixel-by-pixel subtraction across runs, or claim same tick/camera from a common stage identifier.

Native screenshot ROIs:
- entire full original 1600×900 frame `(0,0)-(1600,900)`
- native near-field character region `(560,395)-(1050,780)`
- reticle/paint screen neighborhood `(700,385)-(900,520)`
- upper source optical stage excluding diagnostic panel region `(360,145)-(1300,390)`

| Genuine matched within-run A/B | B268 (rejected) | B269 (hold) |
| --- | ---: | ---: |
| Whole-screen changed pixels | 45,611 | 45,448 |
| Near-field actor region changed pixels | **45,610** | **45,446** |
| Outside near-field changed pixels | **1** | **2** |
| Upper source stage changed pixels | **1** | **2** |
| Reticle and ink-neighborhood changed pixels | 9,354 | 9,653 |
| Exact whole-screen A2-restored pixels different | **0** | **0** |

The near-field region explains **>99.99% of all changed pixels** in both studies. This proves the style toggles themselves did not materially change the *upper stage view*, precisely because they are actor-render-only. It does **NOT** prove unchanged painted ink visibility, original optical-to-physics registration, or game-user perception. The center reticle region includes the foreground actors and may differ without any actual ink shader changes.

B270 adds a fail-closed TypeScript evidence-classifier and lightweight CI: refuse bogus source hash, cross-run baseline equivalence, widespread stage pixel changes masquerading as actor-only, or attempted art promotion. The decision is to **STOP minting more primitive-only character variants** unless stage visibility and movement/readability are first addressed.

## Next B271 priority: recover source spatial registration, not remove UVs
Use original SHA-pinned UV source optical triangles and the 17 actual PaintSurfaces / 25 certified solids as separate authority layers. Read-only inspect *multiple* original paint surfaces and practical navigation viewpoints, not only the 115 ownerGrid cells on one spawn-high surface. Determine which actual optical layers stand in front of certified playable regions and why; do not assume the original cosmetic OBJ surfaces are physically walkable, collision registered, scoring surfaces, or recover missing scene-instance matrices. Correlate with genuine Chrome screenshots and source-native camera, refuse synthetic gameplay proof, then design a reversible whole-view visual candidate addressing actual scene geometry/legibility. Keep original 4v4 and release HOLD.

**No main writes, no production deploy, no reconstructed original placement claim.**
