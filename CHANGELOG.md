# CHANGELOG

## v0.3.0 T8 Implementation Candidate — 2026-09-23

### Added

- Added a shared stage-solid definition layer for render/physics/world-query relationships.
- Added Rapier scene-query based projectile blockers for non-paintable stage geometry.
- Added nearest-hit arbitration between frozen PaintSurfaces and backing solids without changing CPU-authoritative U/V.
- Added non-paintable projectile consumption without creating fake PaintRequests/PaintEvents.
- Added blocker-aware center-ray aim targeting.
- Added third-person camera obstruction against stage solids.
- Added immediate camera retraction plus damped recovery after obstruction clears.

### Preserved

- T0–T7 stable gameplay checkpoint remains `d93f5bf0cfb261515e5ad5081b1b7599e1efbdbf`.
- Fixed 60 Hz gameplay simulation remains unchanged.
- Player physics remains custom movement + Rapier kinematic character controller.
- Projectiles remain pooled swept projectiles.
- CPU gameplay ink remains authoritative.
- PaintSurface-local U/V remains canonical.
- `PaintCoordinator.processTick()` remains the only PaintEvent creation point.
- GPU visual ink still consumes the same immutable PaintEvent.

### Automated validation

Implementation commit:
`234180436b27e0c9498c8d253348b2c366f839ce`

Workflow:
`35803236486`

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

### Status

T8 is an implementation candidate, **not yet frozen**. Hosted QA for projectile blockers, camera obstruction, ramps/elevated geometry, close-range shots, and existing T0–T7 behavior is required before T8 Freeze.

## v0.2.0 Stable Freeze — 2026-09-23

### Stabilized

- Replaced hold-to-drag camera control with standard browser TPS Pointer Lock mouse look.
- Added safe Pointer Lock acquisition/release behavior and cleared stuck movement/fire state on unlock, blur, and visibility loss.
- Reserved the first click for Pointer Lock acquisition so entering gameplay does not accidentally fire.
- Corrected TPS camera vertical mouse direction.
- Changed aiming to use the actual center-screen camera ray.
- Added muzzle-to-crosshair targeting instead of assuming camera-forward and muzzle-forward are identical.
- Added a low-arc ballistic launch solution so configured projectile gravity still converges toward the center-crosshair target.
- Synchronized camera state before fixed simulation and during catch-up ticks to remove render-FPS-dependent aim lag.
- Added render interpolation for player and projectile presentation while retaining fixed 60 Hz gameplay simulation.
- Preserved fractional fire-cooldown remainder to avoid permanent fixed-tick cadence drift.
- Prevented nearby wall ink from contaminating feet-level movement ink sampling.
- Corrected GPU visual ink vertical orientation while preserving CPU-authoritative PaintEvent U/V.
- Added PaintSurface geometry/basis invariants.
- Added invalid frame-delta protection.
- Added GPU brush Uint16 batch-capacity protection.
- Added QA shortcut key-repeat suppression.

### Final validation

Stable gameplay checkpoint:
`d93f5bf0cfb261515e5ad5081b1b7599e1efbdbf`

Workflow:
`35800320770`

Results:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted iterative QA: completed for this phase and accepted by the user

### Freeze

T0–T7 is now treated as the stable foundation for the next development phase.

The next planned phase is **T8 — World Interaction Foundation**, focused on projectile blockers, render/physics/PaintSurface relationship, and third-person camera obstruction before combat, AI, and the complete match loop are added.

## v0.2.0 — 2026-09-22

### Added

- Added T4 human movement with camera-relative WASD input, acceleration/deceleration, custom gravity, jump, slope handling, autostep, ground snap, and Rapier kinematic character collision.
- Added pinned `@dimforge/rapier3d-compat 0.20.0`.
- Added T5 Human/Squid state machine and authoritative CPU gameplay-ink sampling through each PaintSurface local basis.
- Added own/enemy/neutral/non-swimmable movement hooks. Current tuning values are project-owned temporary tuning, not claimed Splatoon internals.
- Added T6 pooled standard-shooter projectiles. Projectiles are not dynamic rigid bodies and use previous-position → next-position segment sweep each fixed tick.
- Added T7 projectile impact resolution to PaintSurface identity + surface-local U/V, followed by the existing PaintRequest → immutable PaintEvent → CPU/GPU pipeline.
- Added third-person camera, aiming crosshair, player/projectile debug metrics, and updated controls.

### Preserved

- T0–T3 CPU gameplay ink remains the only gameplay-authoritative ink representation.
- GPU ink remains persistent visual data.
- `PaintCoordinator` still creates exactly one immutable PaintEvent for each queued PaintRequest; CPU and GPU consume that same event.
- Surface-local 0.125 m gameplay grids, dirty-tile architecture, turf delta accounting, atlas layout, WebGPU-first renderer, and fixed 60 Hz simulation remain intact.

### Initial validation

- GitHub Actions dependency install: PASS.
- `npm run typecheck`: PASS.
- Vite production build: PASS.
- GitHub Pages configure/upload/deploy: PASS.
- Workflow run: `35745535871`.
- First deployed code commit: `b065157f3a86bb8aceb6c922d9791ce25403c0fa`.

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
