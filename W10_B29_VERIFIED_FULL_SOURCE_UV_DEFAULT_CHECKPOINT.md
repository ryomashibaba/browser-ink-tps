# Browser Ink TPS — W10-B29 Verified Full Original Source UV by Default

**Date:** 2026-10-19 JST
**Parent checkpoint:** W10-B28 `5166d96d935e7ec74680b11431634b73a22ab785`
**Fully verified gameplay/source code HEAD:** `cf63fc3dcc4bd259738e18d5e35713bea247ad27`
**Branch:** `dev/t21-f4e103w-qa-infra` only.

## Real visual improvement, no fabricated geometry

B28 gave depth to **672** source reference triangles. The existing optional F3G/F3L whole-original source pipeline already decoded the **57,578** pinned original static OBJ triangles with original `vt` UV coordinates and separate pinned `MTL` and **19** original albedo PNGs, but **F3L was always loaded invisible** until the user pressed T. This B29 release makes the high-fidelity verified stage-scale original source **the automatic default only within an explicit `?t21Play=preview&t21FullSource=review` nonproduction route**, when both pinned F3G and F3L asset sets finish their hash/authority checks.

- **F3L verified**: enable exact original static UV/albedo view; disable F3G flat mesh to avoid z-fighting/double rendering. All 54 verified original material groups/57,578 triangles are included in the opt-in source view, 19 original albedo textures have verified SHA-256. F3I background scenery remains separately non-authoritative; source actor instances remain unplaced.
- **F3L missing/verification fails**: F3G flat original source remains visible if verified, otherwise F3E source-only architecture remains. Fail-closed, not an empty world, no new web asset download without explicit source review.
- **Explicit `&t21F3lPref=flat`**: even if verified F3L is available, select F3G flat. Existing T key / button reversibly swaps verified UV and flat rendering without rebuilding geometry.
- The selection is only a **view of original *static* geometry**, never a certified walkable collision floor, original actor location, original material shader equivalence, official Turf scoring, natural 4v4 battle, or finished environment. Original source files are fetched temporarily by CI from pinned public upstream records; not committed to this repository. User local files untouched.

## Real verification (actual GH Actions at tested code SHA)

- [**Full pinned F3G/F3L source original real Chrome**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39192275080): **SUCCESS**. Fetches exact 43MB original OBJ+MTL, 19 verified original albedo PNGs; checks SHA, generates temporary source visual pack locally inside CI, **F3L: 57,578 triangles, 54 source materials, 19 textures**; **F3G: 57,578 triangles, 7 groups**. Build PASS; 3 suites, **8/8 tests PASS** (B29 selection and original F3G/F3L immutable-source manifest audits); WebGL2 Chrome verifies default UV, manual T flat, T restoration with actual frame SHA A/B/A.
  - Original UV A and returned A2 screenshot SHA-256 both: `12398553be2ebbb11c386e6caf8a3c76925ebfc7b41a2ff3891c3220408d9e5e`.
  - Flat F3G B screenshot SHA-256: `d45fec70750fad306d84ff99c1c9f4c114d7f4bb1ab62b606de008e1801f48b8`. Camera/game state frozen for A/B/A; real pixels differ and are exactly reproducible after restoration.
  - Snapshot no stage authority promotion: **25 original solids, 17 paintable source surfaces, 26 native NavLinks, zero scored surfaces**. Native Actor instance placement remains unverified.
  - The full-source smoke then **resumed normal source gameplay** after screenshot comparison and verified the existing source gallery and actor controls. An earlier in-progress run [39192057566](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39192057566) passed visual UV A/B/A but failed later gallery QA because frozen screenshot session had not resumed. Fixed before final green run.
- [**Regular actual Chrome native render A/B/A and W10-B22..B28 regressions**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39192274751): **SUCCESS**, source gameplay code HEAD `cf63fc3dcc`. Missing opt-in full-source pack does NOT change regular F3 camera, owner B22 trial or source stage.
- [**Actual Chrome human input and 7 CPU patrol and real original ink**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39192274724): **SUCCESS** at final runtime code. Seven native original-foot CPUs, 87 actual source paint shots, 92 actual impact events, **11,064 changed cells** and 703.39m source-native patrol. **0/12 original cross-team foot routes; HOLD**.
- [**B14 actual Chrome CPU splat/respawn**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39192274783): **SUCCESS** at final runtime code.
- Prior native Ubuntu/Windows QA at initial B29 app code `7890e3dd` [39191790562](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39191790562): **SUCCESS**. Final B29 later changes were in source smoke, selection-policy unit test and original pack CI path only, not gameplay. Not the owner's physical RTX benchmark.

## Immutable original stage and source-provenance HOLD

The sole authority remains **25 original Rapier collision solids / 17 original non-scoring paintable surfaces / 26 certified original navigation links / 0 original scoreable surfaces / `activationReady=false`**. The source original `Vss_Temple01` Banc/SetActor instance matrices and active-layer placement are missing and unverified. Current opposing-team true-foot encounters remain **0/12**; do not invent physical central underpass, optional teleport, stage masks, spawn or winner. No new original actor instance transforms, geometry solids, NavLinks, turf score, production authorization or external asset files were committed. T19C/T20, public main, independent Draft PR #5 and public site untouched.

## Next step W10-B30

Prioritize **macro-scale source-only presentation/actual playable geometry gap closure** with evidence, not another local HUD/camera tweak. If owner-local private evidence of original `Vss_Temple01` Banc actor placements becomes available, apply B24 private evidence checks, actor mesh identity and transform/layer certification first; only then consider genuine connectivity. If not, continue improving player-facing visual readability using the now first-class 57,578 original-static UV renderer in local opt-in F3 review, with actual screenshot/human-observation quality gates, while admitting full live battle not certified. No new user Windows tasks unless real benefit.

**Efficiency audit**: reused existing pinned-original full-source CI rather than adding an entire parallel test system; only 3 new policy tests and a real Chrome screenshot A/B/A; no repeated synthetic 0/12 source path tasks, no Work, no original game files in public repository and no change to T20/main/PR #5.
