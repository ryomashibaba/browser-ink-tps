# T21 B284 — exact game-data source identity correction and collision authority hold

Date: 2026-10-28 JST. QA branch only. Authoritative stage *identity* corrected, original physical *collision rights* unchanged.

## Actual direct-source confirmation

The existing 2026-09-28 `UndertowSpillwayStageSourceIdentityAudit.ts` already correctly studied the source row binding. B283 overlooked it and incorrectly treated the contradictory KiTrix convenience stage-name mapping as unresolved stage identity.

On B284, three **distinct actual raw SceneInfo.json game-data snapshots** were independently fetched from pinned `Leanny/splat3` commit `7280ff9cde8bb1c5dcef46c700c326471584d2e6`:
- `data/mush/720/SceneInfo.json`
- `data/mush/920/SceneInfo.json`
- `data/mush/1130/SceneInfo.json`

All independently contained:
- `__RowId: Vss_Temple01`, `Label: マテガイ放水路（改修後）`, `Model/Fld_Temple01.bfres`, `SequenceName: Versus`.
- `__RowId: Vss_Temple00`, `Label: マテガイ放水路`, `Model/Fld_Temple00.bfres`.
- `__RowId: Vss_Nagasaki03`, `Label: チョウザメ造船`, `Model/Fld_Nagasaki03.bfres`.

Therefore the remodeled Undertow source-model identity `Temple01` is correctly established by game-data rows. **Do not roll back previously verified Temple01 Rapier tests on stage-name grounds.** KiTrix pinned `StageLoader.swift` wrongly pairs English convenience names with these two internal IDs; no official game-data SceneInfo uses that conflicting pair. The 41-character invalid KiTrix commit ref previously stored in the 2026-09-28 audit was corrected to exact existing 40-hex SHA `0611f51b35c9736ee986fb2218461e2585b7875e`.

## B284 automated regression + minimal implementation

`scripts/qa-offline/t21-b284-stage-identity-provenance.mjs` now refuses missing/duplicate/wrong-version rows, wrong stage labels, model resource or sequence. The check downloads only **four pinned small text sources** (three Leanny SceneInfo and KiTrix StageLoader) and outputs **one small JSON result**; no 43MB OBJ/download, art run, full browser replay or runtime geometry change. Local Node unit tests cover intentional swaps and version omissions. Existing compact frontier-preflight CI runs both regression and pinned upstream verification once.

The independent stage model name is authenticated; **FloorLine00 collision inclusion in the original game is not**. KiTrix OBJ/MTL and Leanny SceneInfo encode rendering/scene identity, not specific authentic collision inclusion for FloorLine00. B241's 7/8 center-ray-null frames likewise require collision-contact investigation only if actual original collision authority evidence is obtained.

## Net decision

- SOURCE_IDENTITY: **RESOLVED / Vss_Temple01 is remodeled Undertow**, with three pinned source snapshots.
- AUTHENTIC_FLOORLINE_COLLISION_ROLE: **HOLD**. No new source triangle collider registration.
- B283 geometric lateral candidates: only project registered 25-solid footprint hypotheses, not real KCC route.
- Registered right-low physical KCC B123/B125/B126 historical successes: preserved.
- Native Recast right-low to original underpass ~31.7m end gap: **HOLD**.
- CPU 7 physical full route, 12 opposing source paths, formal 4v4/score, ART adoption, production: **HOLD**.
- Original 25 solids / 17 paint / 26 links / 0 scoreable, `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`, main/Pages/PR unchanged.

Next high-value work must seek authoritative original-game collision role for the relevant candidate surface or a genuine *already registered* alternate supporting source geometry; do not restart B239–B241 on the false assumption that stage names remain unresolved, nor launch a costly native path trial before a meaningful novel crossing hypothesis exists.

**Evidence sources:** [720](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/mush/720/SceneInfo.json), [920](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/mush/920/SceneInfo.json), [1130](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/mush/1130/SceneInfo.json), [KiTrix helper](https://github.com/kirakira-dev/KiTrix/blob/0611f51b35c9736ee986fb2218461e2585b7875e/KiTrix/SceneKit/StageLoader.swift).
