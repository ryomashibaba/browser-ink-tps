# Browser Ink TPS — W10-B30 Exact Original Source Cutaway / Real Walkability Readability

**Date:** 2026-10-19 JST
**Parent QA HEAD:** `76c2152bee86cc4b0d263f58f070783e18f811eb` (W10-B29)
**Code HEAD actually tested:** `78518d4494021716e46673cf4f7f77aa26e951be`
**Branch:** `dev/t21-f4e103w-qa-infra` only; no main, Draft PR #5, T20, or public site changes.

## User-facing gameplay/stage-readability improvement

F3L verified 57,578-triangle full original-static stage with 54 original material groups and 19 SHA-pinned albedo PNGs has always been a **display-only** overlay. Because its original-looking floor/architecture was opaque, large visually apparent walkable surfaces could be mistaken for authenticated in-game Rapier landings, even though only 25 original source solids are physical. This step adds a separate `SOURCE_CUTAWAY` material preset, toggled with **Y** only in `?t21Play=preview&t21FullSource=review` after F3L is SHA-verified and actually enabled.

- Existing `ORIGINAL_UV` is unchanged as default: all material categories (except translucent glass) remain opaque and depth-writing. UV, albedo PNGs, geometry and render mesh groups remain identical.
- `SOURCE_CUTAWAY` changes **only current 54 PlayCanvas StandardMaterial objects**. All display-only source static categories (including visual FLOOR and SLOPE) become appropriately translucent/non-depth-writing so the existing actual source-backed 25-solid gameplay stage underneath can be inspected. This does **not** authenticate optical floors or make them safe landing, paint, path or scored surfaces.
- Y again restores original UV materials. A live read-only snapshot `b30SourcePhysicalReadability` declares the visual preset, 57,578 original triangles, 25 actual solids / 17 unscored paintable / 26 real NavLinks, and **zero additional collision/Nav/turf score/Actor matrices/certified source footpaths or production authority**.
- The preset isn't even installed for the ordinary F3 source stage without an explicit opt-in/pinned F3G/F3L pack. Missing pack continues to fall back to flat original F3G or B28 reference. Owner Windows machine, private SetActor original-source files and published site are untouched.
- No additional camera, physical mesh or draw batch was created. Game physics, CPU 7 real native agents, ink simulation and match scoring are unchanged.

## Real verification (final implementation code SHA)

1. [W10-B30 pinned-original full source + real WebGL2 Chrome](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39205645408): **SUCCESS** at `78518d449402`. Pinned exact OBJ+MTL+original texture SHA gate, **57,578 source triangles / 54 material groups / 19 verified albedo textures**, TypeScript build, 10/10 F3G/F3L/B29/B30 tests PASS. Real Chrome captures:
   - ORIGINAL_UV screenshot SHA-256: `f115bbaad27ef47c9a0137e0a68732b5e51680f9ca116f0344fd72cd03e19f16`.
   - SOURCE_CUTAWAY screenshot SHA-256: `2a36877e22afb705d9fb818ec5136171f1980f5a9dead3c315fec43dcebe3754`.
   - Restored ORIGINAL_UV same exact SHA-256 as original. Native player position/physics tick frozen across comparison. Previous W10-B29 full UV→flat→UV comparison and the existing F3K gallery and native user input pass after the cutaway test.
2. [B21/B22/B23/B25/B26/B27/B28 standard real Chrome regression](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39205645387): **SUCCESS**, final code SHA. Standard source stage/camera not changed.
3. [B14 real Chrome native CPU splat/respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39205645394): **SUCCESS**, final code SHA.
4. [B15/B16 actual Chrome seven native CPU source walk/ink](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39205645411): **SUCCESS**, final code SHA. Seven original-foot actors, 87 real original source paint shots, 92 real paint impacts, 11,054 changed source ink cells, ~701.44m native source patrol. **0/12 cross-team natural foot routes — HOLD**, no invented 4v4 combat.

## Source authority/fidelity caveats

- Sole physical stage remains **25 original collision solids; 17 paintable original unscored surfaces; 26 original native navigation links; zero official scoreable surfaces, `activationReady=false`**.
- Original `Vss_Temple01` Banc/SetActor instance matrices, active layers and central/underpass placement provenance have NOT been recovered or applied. Native team-vs-team accessible paths remain **0/12**. This is not authentic reconstructed stage collision, actor placements, Turf scoring or original complete 4v4 game.
- Cutaway uses categories in a pinned original-static optical OBJ; the translucent category is not evidence of a certified or uncertified specific face individually. It is a visibility aid, not a spatially exact footability mask, measured owner visual improvement, original shader equivalence or original full-match QA.
- CI source packs and screenshots live in temporary CI/artifact storage and were not committed as game assets to the public repository. No owner RTX GPU measurement was made.

## W10-B31 and efficient critical path

Do **not** grow more camera/HUD/source visualization modes without evidence of a real visual or gameplay problem. The critical blocker is trustworthy original actor **Banc/SetActor instance placement and layer matrix**. Use the B24 local-only preflight metadata if the owner has it and chooses to share **metadata only**. With valid provenance and applicable rights, use a private one-to-one identity/transform/layer mapping to plan authentic central collision + Recast KCC proof; never invent bridge, shortcuts, NAV links, scoreable masks or actor transforms. Without source access, focus on actual playability inside existing certified stage rather than repeating the identical 0/12 diagnosis or layering cosmetic debug features.

**Process assessment:** Actual read-only visual/gameplay legibility capability added in small diff, 10 fast tests and existing pinned whole-source CI reused, full Chrome and seven-CPU evidence PASS; no new QA workflows, no Work, no Windows manual requirements, no nonpublic original asset upload, no main/PR5 mutation.
