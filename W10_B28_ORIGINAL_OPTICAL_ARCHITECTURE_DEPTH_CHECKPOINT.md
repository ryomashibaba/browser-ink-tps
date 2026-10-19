# Browser Ink TPS — W10-B28 Original Source Architectural Depth

**Date:** 2026-10-19 JST
**Parent QA:** `ff95951d7cd470f6f6eb91acac260505722d659b` (W10-B27).
**Successfully Chrome-tested B28 source-code commit:** `d3d6040af687416255ac73049b93cbdb2160b360`.
**QA branch only:** `dev/t21-f4e103w-qa-infra`. Main, T19C/T20 freeze, T21 PR #5 and production untouched.

## Implementation delivered — architectural mass WITHOUT any invented geometry

Previously the default F3E original-source coverage renderer drew all seven exact original OBJ-derived source geometry batches as translucent overlays with `depthWrite=false`; tall architecture had weak depth, washed overlaps and hologram-only massing. B28 changes the standard nonproduction T21 F3 practice renderer's appearance:

- New `ARCHITECTURE` preset (default): original-source WALL, SUPPORT and HIGH batches are completely opaque, true depth-writing materials with differentiated concrete/steel tones and low emission. The three categories are architecture/reference visuals **not** new physical obstacles. CONCRETE, SLOPE, GLASS and DETAIL remain translucent and `depthWrite=false`; a painted-looking *optical* floor cannot silently gain gameplay/traversal authority. No fabricated bridges or gaps are filled.
- The prior `HOLOGRAM` visual mode is retained exactly as a reversible comparison. **Shift+H**, while pointer unlocked, toggles original architecture massing and hologram without adding a panel, GPU draw call, physics collider, navigation link or scene mesh. Source F3G/F3L independently reviewed whole-OBJ texture mode does not get silently changed.
- Existing F3E source source audit is still performed, guaranteeing the immutable original `25 solids / 17 paintable unscored / 26 NavLinks`. In this built-in source-only F3E renderer the same **672 exact pinned original triangles** are batched across **7 existing source materials**. No actor/world transforms or new OBJ files loaded, copied or uploaded.
- Exposed `b28OriginalSourceMassing` read-only observation with mode, visibility, audited source triangle count, and explicitly **zero** collision, navigation, score, unplaced actor instances and production authority. Existing B27 kinetic lens, B26 source-only smart shoulder, B25 non-scoring practice, B22 optional owner performance trial all remain separate and intact.

## Verified objective evidence

- [Final W10-B28 actual Chromium WebGL2 and TypeScript/25 tests](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39186189859) — **SUCCESS** at `d3d6040af687`. **6 suites, 25/25 unit tests PASS**. In an actual Chromium source-only scene at **physical tick 0**, the user-equivalent Shift+H keyboard event switched *ARCHITECTURE→HOLOGRAM→ARCHITECTURE*. Original architecture SHA-256 `fe4f4ac4e796ccda35eda352e45c8740a513705819e89b067beffe2701b9abe2`, hologram SHA-256 `1281c064098a26196addb18046245bc98a218c8dbad6652db327bc044a0d52c0`; restored architecture SHA **exactly matched** first. All are genuine Chrome framebuffer screenshots saved as a short-lived GitHub Actions artifact, not generated illustrations, not the owner's RTX measurements.
- Confirmed original scene player position and camera remain frozen through all three renders. 25 source physical solids, 17 paint surfaces, 26 native links, 0 scoreable promotions/added original actor transforms, no 4v4 certification.
- [Actual Chrome B14 CPU real render/splat/respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39186190043) — **SUCCESS** at the B28 source-code commit.
- [B15/B16 actual seven-CPU native source patrol and ink](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39186189818) — started for this code SHA; record actual final result before calling it PASS.
- Earlier [Ubuntu/Windows source QA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39185886662) — SUCCESS at B28 app implementation SHA `882da14bd9cc`, before B28 coverage regression tests and real-Chrome screenshot script-only changes. Not owner Windows RTX.
  
## Original-source HOLD, nonnegotiable

Current authoritative original stage: 25 certified Rapier physics solids; 17 source paintable non-scoring surfaces; 26 certified native NavLinks; 0 official scoring faces; `activationReady=false`. The authentic central/underpass foot crossing still has 0/12 certified native team-opponent paths. No original `Vss_Temple01` Banc/SetActor actor placement matrices or active-layer binding are authenticated. None of the 672 F3E **optical** triangles are converted into new collision. Original source F3G 57,578 triangles and F3L UV/albedo source review require already SHA-pinned local packs, cannot be silently promoted or imported to public GitHub.

## W10-B29 priority

The limitation is now **source asset completeness**, not the F3E shader. If user-private original `Vss_Temple01` Banc instance data is available, follow B24 private proof and one-to-one original actor source-identity first. Otherwise focus on actually bringing existing registered F3G/F3L stage-scale static optical geometry to a compelling *but explicitly non-colliding* player presentation **only when verified local pack is available**. Avoid more repetitive tiny HUD/photo-mode features, invented geometry, fabricated 4v4 victory, or endless identical 0/12 QA runs.

**Efficiency/process:** reused source-only actual Chrome A/B/A lane, added three tiny material/authority unit cases; no new CI workflow, third-party install, Work, owner desktop control or unlicensed private game asset uploads.
