# Browser Ink TPS — B253 original UV / genuine ink co-render evaluation

Date: 2026-10-27 JST. Target: `dev/t21-f4e103w-qa-infra`. Decision: **TECHNICAL PASS / ART HOLD**.

## Why this is a real step forward

The established nonproduction F3L renderer loads 57,578 SHA-pinned original static Temple01 OBJ triangles, 54 material groups and 19 albedo textures. B253 adds an explicitly requested `INK_SAFE_REVIEW` material mode which reduces static *optical* floor/slope opacity so the existing 17 live paintable original SOURCE surfaces need not sit hidden behind the dense static UV meshes. This is a reversible source-preview visual-only change. Without `?t21Play=preview&t21FullSource=review&t21B253=liveInk` and verified local assets, B253 does not activate; ordinary/default previews are unchanged.

- [Real full-source WebGL2 job — PASS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40500577838).
- Artifact: `t21-f3g-full-original-source-proof`, ID `12732189796`; screenshots: `B253_UV_ORIGINAL_READY.png`, `B253_UV_INK_SAFE_READY.png`, `B253_UV_ORIGINAL_RESTORED.png`, `B253_REAL_HUMAN_SOURCE_UV_PAINT_GAMEPLAY.png`; machine-readable witness: `b253-real-source-uv-ink-safe-ab.json`, `b253-real-source-uv-native-gameplay.json`.
- Same-camera real WebGL2 original versus ink-safe A/B: 1,024,903 / 1,440,000 pixels differ (71.173819%), at least 8-channel difference in 702,327 pixels. Restored source UV frame differs by **zero pixels**; same actual native actor coordinates and source game tick before unpause.
- Actual real-Chromium source preview player movement: **2.11975 m**, **10 real shots**, **115 actual changed SOURCE ink cells**, existing 25/17/26/0 authority, zero artificial scoreable. This is **STAGING** native preview, not seven physically rejoined CPUs or a certified 180s natural battle (observed CPU physically rejoined 0/7).

## Quality assessment — source images inspected

**ART HOLD**. The original UV material remains valuable. However, the ink-safe view exhibits (a) **three oversized turquoise capsule-like visual forms immediately in front of the player camera**, which obscure the source floor; their source entity must be traced before design decisions; (b) multiple translucent, layered stage shapes that make depth and actual walkable surfaces harder to discriminate; (c) large untextured-looking rectangular massing in the distant central structures. Increased A/B pixel difference is **not** proof of visual quality, 115 changed paint cells do not prove the ink is visually legible or pleasantly framed, and no human playtest acceptance has occurred.

Consequently the mode remains behind an explicit, locally asset-backed nonproduction study flag and must **not become the default**. Do not paper over the artifacts with arbitrary color tints or an invented bridge. B254 should identify the precise existing render entities responsible for the three cyan shapes and depth-layer overlaps by read-only near-camera screen-space inspection, then constrain visibility with documented source provenance and per-view authentic WebGL2 evidence. Verify a real player's floor and ink feedback with normal human/camera controls before any art promotion.

## Frozen source authority and missing primary source

25 Rapier solids, 17 unscored paintable surfaces, 26 genuine NavLinks, **0 scoreable**. Opposite-team natural routes remain **0/12 certified**, the ~31.716m underpass is physically unconnected, official 4v4/winner HOLD. The existing B24–B74 private Banc/BYML readers support owner-local metadata-only candidate checks, but **no authenticated active actor instance placement matrix** has been retrieved. Do not reconstruct FldObj placements from local OBJ bounds or inferred camera views. No raw Nintendo OBJ, MTL, PNG or original private data is published, committed, or emitted to the artifact.

The CI renderer uses Linux Chromium/SwiftShader, not an owner RTX 5080 performance benchmark.
