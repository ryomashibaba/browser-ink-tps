# CHANGELOG

## v0.2.0 — 2026-09-22

### Added

- Added T4 human movement with camera-relative WASD input, acceleration/deceleration, custom gravity, jump, slope handling, autostep, ground snap, and Rapier kinematic character collision.
- Added pinned `@dimforge/rapier3d-compat 0.20.0`.
- Added T5 Human/Squid state machine and authoritative CPU gameplay-ink sampling through each `PaintSurface` local basis.
- Added own/enemy/neutral/non-swimmable movement hooks. Current tuning values are project-owned temporary tuning, not claimed Splatoon internals.
- Added T6 pooled standard-shooter projectiles. Projectiles are not dynamic rigid bodies and use previous-position → next-position segment sweep each fixed tick.
- Added T7 projectile impact resolution to `PaintSurface` identity + surface-local U/V, followed by the existing `PaintRequest → immutable PaintEvent → CPU/GPU` pipeline.
- Added third-person camera, aiming crosshair, player/projectile debug metrics, and updated controls.

### Preserved

- T0–T3 CPU gameplay ink remains the only gameplay-authoritative ink representation.
- GPU ink remains persistent visual data.
- `PaintCoordinator` still creates exactly one immutable `PaintEvent` for each queued `PaintRequest`; CPU and GPU consume that same event.
- Surface-local 0.125 m gameplay grids, dirty-tile architecture, turf delta accounting, atlas layout, WebGPU-first renderer, and fixed 60 Hz simulation remain intact.

### Validation

- GitHub Actions dependency install: PASS.
- `npm run typecheck`: PASS.
- Vite production build: PASS.
- GitHub Pages configure/upload/deploy: PASS.
- Workflow run: `35745535871`.
- First deployed code commit: `b065157f3a86bb8aceb6c922d9791ce25403c0fa`.
- Hosted hands-on gameplay QA is still required before calling T4–T7 fully browser-validated.

### Known technical limitations of this slice

- Projectile sweep currently resolves paintable `PaintSurface` planes. Decorative/non-paintable stage boxes do not yet form a complete projectile-blocking collision layer.
- Squid state changes movement behavior and visual profile, while the Rapier character collider remains the current shared capsule for this technical slice.
- Camera obstruction handling, damage/HP, ink tank, respawn, match loop, CPUs, super jump, final HUD/map, and production animation remain deferred.

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
