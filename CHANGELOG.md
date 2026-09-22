# CHANGELOG

## v0.1.2 — 2026-09-22

### Added

- Added GitHub Actions CI/CD for automatic dependency install, TypeScript checking, Vite production build, GitHub Pages artifact upload, and deployment.
- Added fixed hosted QA URL: https://ryomashibaba.github.io/browser-ink-tps/

### Changed

- Pinned direct dependency versions for the stabilized T0–T3 checkpoint.
- Updated canonical/validation documentation to reflect actual CI and hosted-browser verification.

### Fixed

- Fixed three TypeScript literal-type narrowing errors discovered by the first real dependency-resolved CI typecheck.
- Confirmed the previous high-DPI left-click painting fix works in the hosted browser build.

### Validation

- GitHub Actions: dependency install PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- GitHub Pages configure/upload/deploy: PASS.
- Hosted build opened successfully by the user.

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
