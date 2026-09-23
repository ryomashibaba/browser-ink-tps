# Browser Ink TPS

A standalone PC-browser 3D ink TPS built with **TypeScript + Vite + PlayCanvas Engine 2**.

This is an original project that uses territory-painting and third-person-shooter mechanics as systems-level references. It does not copy Nintendo characters, stages, models, textures, UI assets, audio, logos, or other protected game assets.

## Hosted build

https://ryomashibaba.github.io/browser-ink-tps/

The normal workflow is GitHub-first: changes on `main` are dependency-installed, typechecked, production-built, and deployed by GitHub Actions.

## Current milestone

**v0.3.0 / T8 STABLE FREEZE**

Stable gameplay checkpoint:
`d93f5bf0cfb261515e5ad5081b1b7599e1efbdbf`

The T0–T8 stable foundation is frozen. The current `main` includes:

- third-person Human movement
- Rapier kinematic character collision
- jump / gravity / slope handling
- Human/Squid state
- CPU-authoritative OWN / ENEMY / NEUTRAL ink sampling
- pooled swept shooter projectiles
- center-crosshair TPS aiming
- projectile-gravity compensation toward the visual aim target
- fixed 60 Hz gameplay simulation
- render interpolation for player/projectiles
- shared projectile → PaintRequest → immutable PaintEvent pipeline
- persistent GPU visual ink aligned with CPU-authoritative paint
- Pointer Lock mouse look and robust input cleanup
- shared stage-solid source of truth for render + Rapier collision
- non-paintable projectile blockers
- blocker-aware center-ray aim target
- third-person camera obstruction with smooth recovery

## Core ink architecture

```text
input / projectile impact
          ↓
      PaintRequest
          ↓ fixed 60 Hz
  immutable PaintEvent
      ┌─────┴─────┐
      ↓           ↓
 GameplayInk    GpuInkAtlas
      ↓           ↓
movement/turf    visuals
```

CPU gameplay ink is authoritative.

GPU ink is persistent visual data.

CPU and GPU do not independently recalculate projectile impacts.

Ink remains PaintSurface-local at **0.125 m/cell**, never a global XZ grid.

## Controls

- Click game view once — acquire Pointer Lock
- Mouse move — TPS camera look
- Esc — release Pointer Lock
- WASD — move
- Space — jump
- Shift — Squid state
- Left mouse — fire
- Mouse wheel — camera distance
- 1 / 2 — Team A / Team B
- R — clear ink
- B — 2000-event ink stress burst
- Alt + Left click — retained direct-paint QA path

The first click used to acquire Pointer Lock is not treated as a shot.

## Technology

Pinned direct dependencies:

- PlayCanvas 2.22.1
- @dimforge/rapier3d-compat 0.20.0
- TypeScript 5.8.3
- Vite 7.1.7

Rendering is WebGPU-first with WebGL2 fallback.

Gameplay simulation is fixed at 60 Hz and independent of render FPS. Player and projectile visuals are interpolated between fixed states for high-refresh displays.

## Important files

- `src/app/InkLabApp.ts` — application composition and fixed-tick/render ordering
- `src/player/PlayerController.ts` — Human/Squid movement + Rapier character controller + render interpolation
- `src/input/PlayerInput.ts` — Pointer Lock-aware gameplay input
- `src/camera/ThirdPersonCamera.ts` — TPS camera + center-ray aim target + QA paint picking
- `src/stage/StageDefinition.ts` — T8 shared static-solid / blocker definition
- `src/physics/RapierStagePhysics.ts` — static collision + projectile/camera scene queries
- `src/projectile/ProjectileSystem.ts` — pooled swept projectiles + fire cadence + ballistic launch solution
- `src/ink/PaintSurface.ts` — local surface geometry/grid + segment intersection + invariants
- `src/ink/GameplayInkSystem.ts` — authoritative rasterization, turf, filtered world sampling
- `src/ink/PaintCoordinator.ts` — single immutable PaintEvent creation/fan-out
- `src/ink/GpuInkAtlas.ts` — persistent visual atlas + visual V-orientation correction
- `src/config/game/gameConfig.ts` — project-owned tuning
- `src/config/reference/splatoonReference.ts` — separately labeled research/reference constants
- `CURRENT_CANONICAL.md` — frozen architectural contract and next phase
- `VALIDATION.md` — automated + hosted QA record

## Validation state

T8 implementation commit:
`234180436b27e0c9498c8d253348b2c366f839ce`

T8 automated workflow:
`35803236486`

Passed:

- dependency install
- TypeScript check
- Vite production build
- GitHub Pages artifact upload
- GitHub Pages deployment

Hosted runtime QA for T8 was completed and accepted by the user on 2026-09-23.

Final T4–T7 stabilization workflow:
`35800320770`

Passed:

- dependency install
- TypeScript check
- Vite production build
- GitHub Pages artifact upload
- GitHub Pages deployment

The user completed iterative hosted QA for this phase and accepted the current state as complete after the final visible ink vertical-orientation correction.

## Stable invariants

Do not casually replace:

- CPU-authoritative gameplay ink
- one immutable PaintEvent consumed by CPU and GPU
- PaintSurface-local grids
- fixed 60 Hz gameplay simulation
- custom movement + Rapier kinematic character collision
- pooled swept projectiles
- GitHub-first CI/deploy workflow

## Deferred scope

The stable T4–T7 slice intentionally does **not** yet include:

- a distinct physical Squid collider
- ink tank / consumption / refill
- damage / HP / splat
- respawn
- full three-minute Turf War match loop
- CPU players / Recast navigation
- super jump
- production HUD / tactical map
- production models / animation / audio
- production stage
- final performance/bundle optimization

## Next phase

**T9 — complete Squid / ink locomotion**

T8 is frozen. The next implementation phase may extend locomotion, but must preserve the T0–T8 frozen world-interaction and ink contracts.

Planned order:

- T9 — complete Squid / ink locomotion
- T10 — shooter + ink economy + combat
- T11 — spawn / splat / respawn / Turf War match loop
- T12 — CPU / Recast + tactical layer
- T13 — production stage / HUD / map
- T14 — content, animation, audio, weapons, polish
