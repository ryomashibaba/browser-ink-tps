# CHANGELOG

## v0.1.1 — 2026-09-22

### Fixed

- Fixed left-click painting on high-DPI / device-pixel-ratio displays. Mouse coordinates are now passed to PlayCanvas `CameraComponent.screenToWorld()` in canvas CSS pixel coordinates instead of incorrectly scaling them to the render-buffer resolution.
- Kept orbit dragging, wheel zoom, PaintEvent generation, CPU gameplay ink, GPU atlas rendering, and all T0–T3 canonical behavior unchanged.

## v0.1.0 — 2026-09-22

### Added

- Vite + TypeScript + PlayCanvas Engine 2 standalone project foundation.
- WebGPU-preferred graphics-device bootstrap with WebGL2 fallback path.
- Fixed 60 Hz simulation clock independent of rendering.
- T0 debug/performance overlay.
- Surface-local `PaintSurface` system with 0.125 m gameplay cells.
- Paint flags, per-cell turf weighting, 16×16 dirty tiles, tile revisions.
- Shared immutable `PaintEvent` pipeline.
- CPU oriented-ellipse rasterization.
- Incremental Team A / Team B turf accounting.
- Persistent RGBA8 GPU visual ink atlas.
- Atlas allocator with per-surface rectangles and constant pixels-per-meter packing.
- Batched atlas brush rendering rather than per-impact decal entities.
- Dual GLSL/WGSL shaders for GPU brushing and painted surface visualization.
- Scoreable floor/ramp and non-scoreable paintable wall test surfaces.
- Original bright near-future QA arena.
- Orbit/click paint QA camera.
- 250-event and 2000-event stress tools.
- Central separation between inherited reference constants and original game implementation tuning.
- `README.md` and `CURRENT_CANONICAL.md` handoff documentation.

### Changed

- None; this is the initial implementation baseline.

### Fixed

- N/A for initial release.

### Known issues / validation gaps

- Dependency installation was unavailable in the artifact-generation environment because npm registry access timed out; full `npm run build` and browser runtime QA therefore remain to be executed locally.
- T4+ gameplay systems are intentionally not part of this milestone.
