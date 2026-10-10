# T21 Phase12M — exact original PillarObject01 rim and band (review-only)

Status: Source-only optional visualization. T20 production `inkworks-junction`, PR #5 Draft/open/unmerged, T21 `activationReady=false`, Visual Freeze not approved.

## Source and selection

- Exact original KiTrix `Vss_Temple01.obj`: 43,263,289 bytes, SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`, 70,396 original active faces.
- Starting evidence: Phase12J vertex-ID connected components (44 source-only eligible, 22 original mirror pairs, 972 original faces), independent 142-source / frozen 42-point-XZ gate. Phase12K has 4 further opt-in originals, Phase12L has 4 more.
- Four `Fld_Temple01_PillarObject01` *flat rim* original sources: faces #44184, #44360, #44382, #44492. All vertices at original Y=25.6m. Each 22 original triangles. **NOT a walkable, roof-like, capped or collision-authorized surface.**
- Four matching *vertical band* original sources: faces #44228, #44294, #44426, #44448. Original Y=25.1–25.6m. Each 22 original triangles. No assumption that the bands or the rim are physically welded to other source pieces.
- 8 FULL original source-connected components, 4 exact original mirror pairs / **176 exact original faces**.
- Original Face IDs, OBJ vertex IDs and full Float64 projected original XYZ are stored losslessly as 15,488 bytes `<IIII9d` (176 × 88), uncompressed SHA256 `0c8214798124ae8f3c80c2b81a7d9effe1cb20f0f371e64b3024a3e7ca8e0ea3`. No generated faces or geometrical inference.
- Across Phase12I six, K four, L four and M eight the opt-in pillar group now totals **22 exact complete source components / 488 original triangles**. Original standard visible sources remain **124**. Additional opt-in non-default source meshes tally 34 (12C eight + 12D four + 12I six + 12K four + 12L four + 12M eight).
- From Phase12J's 44 accepted source-only candidates, 16 are now optional in K/L/M, **28 remain unused**. None is automatically a playable platform/roof/wall.

## Review UI and evidence

URL: `?stageReview=undertow&reviewRenderer=webgl2&reviewPillarDetail=CONTEXT` (22 originals), `ALL` (M eight only), `RIM` (original four flat source rim pieces, bright gold), `BAND` (four original vertical band pieces, blue). UI also has four buttons.

The four modes are **off by default** and use independently controlled renderer-only roots. The stored vertices have their original Float64 values; the existing `createSourceNativeReviewMesh` uses only a longstanding optical rendering offset (Y minus 0.035) without mutating the provenance. No new physics, colliders, gameplay map, paint, CPU, navigation, scoring, spawn, mesh-welding, inferred caps or runtime activation.

The standard mandatory five review directions remain untouched. A separate 3-image WebGL2 PlayCanvas screenshot diagnostic (CONTEXT/RIM/BAND) is retained, with independent screenshot manifest byte/size/hash/PNG and non-duplicate checks. **Captures do not grant visual topology approval or a Visual Freeze**. CI requires each of the three real diagnostic screenshots to exist and pass verification.

## Independent safety gates

`scripts/UndertowSpillwayPhase12MOriginalRimBandRenderQa.test.ts` tests:
- T20 production and T21 activation freeze; 64 walk source, 124 standard, 150 previous full original source components and 42-point ring inventory.
- 8 approved exact original full components, 4 mutual exact source mirror pairs, each 22 original triangles; group-specific original Y=25.6 / Y25.1–25.6.
- No near or exact triangle duplicates versus previous 150 source meshes or between the 8 selected sources; original 42-point hard XZ vertices, midpoints, centroid, edge crossings and enclosed ring vertices.
- Original Face ID / original OBJ vertex IDs / projected XYZ **bytewise exact comparison** against Phase12J original-source JSON and independent eligibility gate, with packed binary digest validation.
- Isolated OFF visual roots and independently captured real-source screenshots, without modifying the canonical mandatory five-view evidence.

## Next Phase12N

Perform *visual evaluation of original 22-part source context*, inspect orientation/draw-order and silhouette fidelity against the source, then assess the remaining 28 candidates. Avoid blanket addition of thin fragments. Major game connectivity cannot be inferred from these materials; establish source-grounded traversability evidence separately before any collision/nav/paint promotion.
