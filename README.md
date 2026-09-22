# Browser Ink TPS

A standalone PC-browser 3D ink TPS built with **TypeScript + Vite + PlayCanvas Engine 2**.

This is an original project that uses territory-painting and third-person shooter mechanics as systems-level references. It does not copy Nintendo characters, stages, models, textures, UI assets, audio, logos, or other protected game assets.

## Hosted QA build

https://ryomashibaba.github.io/browser-ink-tps/

The normal workflow is GitHub-first: changes on `main` are dependency-installed, typechecked, production-built, and deployed by GitHub Actions.

## Current milestone

**v0.2.0 / T4–T7 technical vertical slice**

The frozen T0–T3 ink foundation is retained, and the project now adds:

- third-person Human movement
- Rapier kinematic character collision
- jump / gravity / slope handling
- Human/Squid state
- CPU-authoritative own/enemy/neutral ink sampling
- pooled high-speed shooter projectiles
- previous→next projectile segment sweeps
- projectile → PaintSurface local hit → PaintRequest → one immutable PaintEvent
- the existing shared CPU gameplay ink + GPU visual atlas fan-out

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

CPU gameplay ink is authoritative. GPU ink is persistent visual data. CPU and GPU do not independently recalculate an impact.

Ink remains PaintSurface-local at **0.125 m/cell**, never a global XZ grid.

## Controls

- WASD — move
- Space — jump
- Shift — Squid state
- Left mouse — fire
- Right mouse drag — rotate camera
- Mouse wheel — camera distance
- 1 / 2 — Team A / Team B
- R — clear ink
- B — 2000-event ink stress burst
- Alt + Left click — direct-paint QA path retained from T0–T3

## Technology

Pinned direct dependencies:

- PlayCanvas 2.22.1
- @dimforge/rapier3d-compat 0.20.0
- TypeScript 5.8.3
- Vite 7.1.7

Rendering is WebGPU-first with WebGL2 fallback. Gameplay simulation is fixed at 60 Hz and independent of render FPS.

## Important files

- `src/app/InkLabApp.ts` — application composition and fixed-tick ordering
- `src/player/PlayerController.ts` — Human/Squid movement + Rapier character controller
- `src/input/PlayerInput.ts` — gameplay input abstraction
- `src/camera/ThirdPersonCamera.ts` — TPS camera + QA paint picking
- `src/physics/RapierStagePhysics.ts` — static collision representation
- `src/projectile/ProjectileSystem.ts` — pooled swept projectiles
- `src/ink/PaintSurface.ts` — local surface geometry/grid + segment intersection
- `src/ink/GameplayInkSystem.ts` — authoritative ink rasterization, turf, world sampling
- `src/ink/PaintCoordinator.ts` — single immutable PaintEvent creation/fan-out
- `src/ink/GpuInkAtlas.ts` — persistent visual atlas
- `src/config/game/gameConfig.ts` — project-owned tuning
- `src/config/reference/splatoonReference.ts` — separately labeled inherited research/reference values
- `CURRENT_CANONICAL.md` — current handoff contract
- `VALIDATION.md` — validation state and browser QA checklist

## Validation state

The first T4–T7 code deployment passed:

- dependency install
- `npm run typecheck`
- production Vite build
- GitHub Pages artifact upload/deploy

Hands-on hosted-browser gameplay QA is still required. See `VALIDATION.md`.

## Current deferred scope

Damage/HP, ink tank, respawn, three-minute Turf War match flow, CPUs/Recast navigation, super jump, full HUD/map, production models/animation/audio, camera collision, and final polish are not yet implemented.

Projectile sweep currently resolves PaintSurface planes; a complete non-paintable obstacle projectile collision layer is a later step.
