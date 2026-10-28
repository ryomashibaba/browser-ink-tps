# Browser Ink TPS / Undertow T21 F3 — B268 actual 3D art rejection, B269 rear-view redesign

**2026-10-28 JST. QA branch only. Main, production and original 4v4 unchanged.**

## B268 genuine WebGL2 evidence and independent review

- Genuine F3G Chrome/WebGL2 run [40647593003](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40647593003) at source commit `21d318d98c197939428e84557d15ce7d3eaf28ba`: **SUCCESS**, 81,124,561-byte run artifact `12798809398`. This run's B268 opt-in physics/gameplay source authority is `25/17/26/0`.
- Tests/build PASS, frozen genuine A→B→A: **35,215/1,440,000 screen pixels changed (2.4455%)**, original restored **0 changed pixels**.
- Real human-painted source A→B→A: **45,611/1,440,000 pixels changed (3.1674%)**, **41,454 pixels changed by ≥8 RGB**, **22,001 pixels by ≥24 RGB**, exact original framebuffer restoration **0 pixels changed**. Original 115 owned cells remain on a real original PaintSurface; 58 native owned-cell center samples remain on screen. Only **13/58** sampled 5×5 median RGB patches changed by ≥8 RGB; this is NOT a claim that 13 painted pixels became visible.
- Genuine B268 screenshot comparisons in artifact: `B268_REAL_INK_A_EXISTING_ACTORS.png`, `B268_REAL_INK_B_COMPACT_RESEARCH.png`, `B268_REAL_INK_A2_ACTOR_RESTORED.png`. Existing B248, alternative B268, and restoration are all genuine same-clock fixed-camera PlayCanvas renders, NOT generated image concept art.
- No source geometry/UV, paint ownership, actor world positions, Rapier, original navigation or scoring changes. Human+7 CPU and real shooting retained. Source original textured UV: 57,578 triangles / 19 textures.

**Independent art review: B268 ART REJECT (technical QA PASS).** The new dark monotone uniforms still read as large spherical dark helmets on almost cylindrical bodies, with very little distinct rear-view identity or perceived motion. The team label is a tiny rectangle that is illegible at typical 1600×900 gameplay overview; color brightness reduction makes the already crowded scene grayer. Source optical foreground and ink visibility remain unresolved. Three nearby actors dominate a small area while distant scene depth and local route legibility do not improve.

Decision: preserve B248 as the default; B268 as rejected protected research evidence only, never auto-adopt, no permanent override or game deployment.

## B269 meaningful redesign hypothesis — readable **from behind**

Instead of incrementally recoloring the same sphere-cylinder model, B269 creates a **separate 33-piece PlayCanvas 3D geometry silhouette**:
- **Angular helmet** (box core + crown + side pods and visor) instead of a smooth sphere; real shoulders, waist break, shins and distinct boots rather than a uniform vertical column.
- **Large twin diagonal team-color rear chevrons**, two lateral tank-light strips, and clear off-center carbine. Both Team A and B use actual `GAME_CONFIG.visual.teamA/teamB` pigment, avoiding a generic cyan-only visor as the sole identifier. Back-facing visual is the priority because the real camera sees the actors from behind.
- Preserve B248 original and B268 COMPACT research options as benchmarks. B269 is named `B269_REAR_IDENTITY` and requires additional `t21B269=rearIdentity` as well as existing B268 pinned-source paused gate.
- All 8 existing native entities retained; lazily create only child render geometry after explicit stopped-source research request. The actual actor's latest facing from B249 is applied to the new mesh root, avoiding a static fake pose; never change original actor yaw, physics, shot or camera.
- Explicit real WebGL2 full-scene **A→B→A twice**: frozen start and after real human-owned paint, real 1600×900 screenshots; original return must be pixel identical, real source tick and native owned-cell samples unchanged. 8 actor IDs, **25 solids / 17 native PaintSurfaces / 26 original navigation links / 0 scoring**, exact 57,578 triangles.

## B269 acceptance bar
Technical PASS only if source-gated Vitest, build, genuine Chrome WebGL2 A/B/A and physical/world/ink restoration all pass. Art PASS is **separate and NOT assumed**. Judge: human/nonhuman readable silhouettes from actual in-game distance, rear A/B team readability, visor/weapon/pack distinguishability, whether the character masses are still too bulky, whether source railing obscures actual ink neighborhood, and screenshot entire-frame composition. Favor a genuine increase in legibility and distinct silhouette over a global RGB delta. If unchanged/trivially altered, **ART REJECT again**.

Avoid touching `main`, original StageRoot authority, real navigable paths, production game, scoring, actual UV source mesh, source asset claims, or official unrestricted 4v4. F3G source workflow push fanout protection stays intact. Do not trigger multiple redundant heavy full-stage runs.
