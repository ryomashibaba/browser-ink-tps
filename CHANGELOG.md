## v0.4.0 T9 Stable Freeze — 2026-09-23

### Freeze

- full hosted T9 QA accepted by the user
- coordinate / GPU atlas pipeline accepted
- Human/Squid collider switching accepted
- own/no-ink/enemy-ink locomotion behavior accepted
- Squid Roll accepted
- OWN-wall swimming accepted
- wall Surge accepted
- Squid fire suppression / Human fire accepted
- T8 camera and projectile-blocker regression sanity accepted

Stable T9 gameplay implementation checkpoint:
`0b95810314e5f91b047577eba4a94c6f9db89100`

Automated implementation workflow:
`35810161552`

T9 is now **STABLE FREEZE**. Next planned phase: T10 — shooter + ink economy + combat.

## v0.4.0 T9 Hosted Partial QA — 2026-09-23

- hosted coordinate audit confirmed PASS 4/4
- hosted GPU atlas origin fix confirmed visually
- Roll QA Pad full-floor rendering confirmed
- authoritative full main-floor turf confirmed at 252.0 m² / 76.62%
- main-floor OWN sampling confirmed
- Squid Roll confirmed operational by the user
- T9 remains unfrozen pending wall swim, Surge, and final regression checks

## v0.4.0 T9 GPU Atlas Origin Fix — 2026-09-23

- isolated reported main-floor visual failure to GPU atlas sampling rather than CPU/world coordinates
- corrected top-origin atlas allocation/render coordinates to bottom-origin surface texture UV sampling
- centralized GPU atlas transforms in `AtlasCoordinates.ts`
- added startup atlas write↔sample coordinate contract checks
- preserved canonical CPU PaintEvent U/V and GameplayInk ownership

Fix commit:
`0b95810314e5f91b047577eba4a94c6f9db89100`

Workflow:
`35810161552`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted visual recheck: PENDING

## v0.4.0 T9 Visual Coordinate QA — 2026-09-23

- extended stage-coordinate audit to backing-solid face normals and tangential OBB bounds
- added deterministic `Coord QA` button
- `Coord QA` stamps every PaintSurface at known local U/V coordinates
- matching render-only 3D markers are placed at the exact local→world points
- marker pattern is intentionally asymmetric to reveal U/V flips, rotations, and per-surface offsets
- updated control-panel milestone label to T9 Candidate

Implementation:
`13590bcc8d7b8ee0ca6a17e106bde97f2c83c66b`
`a152aed2f9fcc390c39172c8264b8ca775244719`

Workflow:
`35809531970`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted visual QA: PENDING

## v0.4.0 T9 Coordinate Audit Candidate — 2026-09-23

- unified world→PaintSurface coordinate conversion
- added local↔world and PaintSurface↔backing-solid startup invariants
- added atlas allocation coordinate checks
- added runtime Player/sample/PaintEvent coordinate diagnostics
- changed Roll QA Pad from an 85.4375 m² central strip to a complete main-floor fill
- preserved T0–T8 coordinate and PaintEvent contracts

Commits:
`63c81fc200a7c233b88e9f10e94e3876532cad72`
`4cabccc142e08690a169e9472e12c0812ca81532`

Workflow:
`35807116117`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted coordinate QA: PENDING

## v0.4.0 T9 Candidate Fix — 2026-09-23

- made Squid Roll input forgiving by buffering a qualifying reverse turn for 0.20 s
- loosened the reverse-angle threshold slightly so keyboard direction changes register more reliably
- added visible rotation during SQUID_ROLL so activation is obvious during QA
- changed neutral/no-ink Squid movement to Human-equivalent speed and acceleration
- retained enemy-ink slowdown
- added a `Roll ready` debug readout
- preserved T0–T8 contracts

Fix commit:
`cffcc72028863cb3c538dc9bfc16d2e470166af0`

Workflow:
`35805455465`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

## v0.4.0 T9 Implementation Candidate — 2026-09-23

### Squid / ink locomotion

- added separate Human capsule and Squid ball Rapier colliders on one kinematic body
- preserved foot baseline across form switching
- added explicit HUMAN / SQUID_DRY / SWIM_GROUND / SWIM_WALL / SQUID_ROLL / SURGE_CHARGE / SURGE states
- retained CPU-authoritative floor ink relation and added OWN-wall sampling
- added OWN-ink wall swimming
- added project-tuned Squid Roll and wall Surge locomotion actions
- suppressed main fire while in Squid form
- expanded debug overlay with locomotion/collider/wall/Surge state
- preserved T0–T8 ink and world-interaction contracts

### Validation

Implementation commit:
`110f925fe830ea2aa3865b3c88525c81d1e08f92`

Workflow:
`35804869663`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

T9 remains an implementation candidate until hosted QA is accepted.

# CHANGELOG

## v0.3.0 T8 Stable Freeze — 2026-09-23

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
- hosted runtime QA: PASS — user confirmed

### Freeze

Hosted QA was completed and accepted by the user on 2026-09-23. T8 is now **STABLE FREEZE**.

Stable T8 gameplay implementation checkpoint:
`234180436b27e0c9498c8d253348b2c366f839ce`

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
