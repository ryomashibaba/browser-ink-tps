# Browser Ink TPS — B263 native ownership verdict → B264 original-optical depth

Date: 2026-10-28 JST. Existing long-lived branch only, not production.

## B263 completed and independently reviewed

- **Genuine Chrome WebGL2 F3G SUCCESS:** [run 40629908569](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40629908569), source commit `90e4881b0b1d2862a2cf5a8a9cb69d24ee3b9f0f`, artifact `12791399107` (`t21-f3g-full-original-source-proof`, 70,192,193 bytes).
- B263 unit, TypeScript build, genuine real native FROZEN and REAL_INK camera captures all PASS.
- FROZEN native ownerGrid: **0** owned cells, 0 sampled; correct unpainted control.
- REAL_INK: **115 actual nonneutral native cells, all Team A**, Team B 0, across **one original PaintSurface**: `UndertowT21D:spawn-high-positive-z:paint` (of 17 real surfaces). There are 58 bounded sampled cell centers, **all 58** projected inside the 1600×900 native camera. No inference of how many of the 115 unsampled centers project.
- The 58 selected centers cluster tightly at **x 764..834, y 444..461** — near crosshair and human/native actors — a small portion of the screen. The camera was not looking in the wrong hemisphere. This is genuine existing gameplay ownership, not a fake ink overlay.
- Independent offline B259 same-pause framebuffer ablation correlation at those 58 sample locations: **41/58** neighborhoods respond strongly to removing the existing native PaintSurface draws, **38/58** to removing source GLASS, **44/58** to removing source DETAIL. Overlaps are possible; the sums are NOT additive. These values measure sample-area raster response, **not** colored-ink visibility or opaque occlusion.
- B263 is **TECH PASS / ART HOLD**. A foreground geometry issue remains plausibly important, but original source transparency and camera actor overlap mean an optical hit alone cannot diagnose the shader or prove true occlusion.

Other post-B263 push regression jobs: B75 FIXED and SWEEP completed success; B120/B112/B162/B234/F4E103W all success. B210 180s may be checked independently; no official 4v4 claim.

## B264 actual owner-grid-derived camera sightlines (current isolated hypothesis)

For only up to **24 sampled, inside-viewport** *actual* non-neutral B263 cell centers:
1. Reuse exact already-pinned original F3L 57,578 triangle mesh double-sided B257 ray routine. Never invent an OBJ, actor transform, physical wall or paint surface.
2. Reuse existing physically authoritative Rapier cast along the **same** actual native camera → painted-cell segment.
3. Compare source optical first hit and source physical first hit to the **real painted cell 3D point**, with small endpoint tolerance. Record source material name/kind, distances, native screen coordinates and original cell-grid ID. Distinguish GLASS (translucent) from DETAIL.
4. Read-only, opt-in, frozen paused STAGING only, camera baseline, F3L original UV, B253 live ink, B255 native humanoid, B256 off, B259 B260 returned to baseline, B262 panel restored. Original source values 25/17/26/0, original 57,578 UV faces and 19 textures remain immutable.
5. Capture a bounded original-source native JSON paired with B263 FROZEN and REAL_INK screenshot frame, without rendering new markers or changing shaders/camera/physics/CPU.

**Interpretation:** If original optical geometry lies between native camera and true owned cell, that is a potential optical interference ray, **not** proof of opacity or color loss. If Rapier is in front, physical overlap may also be involved, with tolerance around a target on a physical surface. Even an unobstructed geometric ray cannot certify colored pixels. Further A/B improvement requires visual confirmation and a reversible study before any aesthetic adoption.

**B264 status after commit:** implementation pending dedicated genuine browser CI. ART HOLD, human unrestricted original 4v4 HOLD, production FORBIDDEN. Original source physical/paint/nav authority **25/17/26/0** unchanged; no approval for synthetic routes or scoring.
