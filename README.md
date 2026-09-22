# Browser Ink TPS — T0–T3 Foundation

A standalone browser 3D ink-game prototype foundation built with **TypeScript + Vite + PlayCanvas Engine 2**. This repository currently contains the stabilized T0–T3 technical vertical slice: fixed-step simulation, surface-local gameplay ink, shared paint events, and a persistent GPU visual ink atlas.

This is an original project inspired by the system-level idea of territory painting. It does **not** include Nintendo characters, logos, models, textures, audio, stages, UI assets, or other copied game content.

## Play the hosted QA build

https://ryomashibaba.github.io/browser-ink-tps/

The normal development workflow is now GitHub-first: changes pushed to `main` are typechecked and production-built by GitHub Actions, and successful builds deploy automatically to GitHub Pages.

## What is implemented

- Fixed **60 Hz** simulation clock, separated from render rate.
- `PaintSurface` local coordinate system for floor / ramp / wall surfaces.
- Authoritative CPU gameplay ink at **0.125 m per cell**.
- 16×16-cell dirty tiles with per-tile revisions.
- `PaintEvent` as the single source event consumed by CPU gameplay ink and GPU visual ink.
- Oriented ellipse rasterization with sin/cos calculated once per event.
- Incremental turf-area accounting; no full-stage scan every frame.
- Scoreable and non-scoreable surfaces.
- Persistent RGBA8 GPU ink atlas storing ownership / coverage / wetness rather than display colors.
- WebGPU-preferred graphics-device creation with PlayCanvas WebGL2 fallback semantics.
- Dual GLSL / WGSL `ShaderMaterial` paths.
- One dynamic batched brush mesh rather than one decal object per paint event.
- Bright near-future QA arena.
- Debug overlay with frame/simulation/paint/atlas/turf metrics.
- Paint stress buttons (250 / 2000 events).
- High-DPI-safe click-to-paint picking.
- GitHub Actions build gate and GitHub Pages automatic deployment.

## Local run (optional)

Local npm setup is no longer required for ordinary QA; use the hosted URL above. For local development:

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run typecheck
npm run build
npm run preview
```

## Controls

- **Left click** a paintable floor, ramp, or wall: paint.
- **Left drag**: orbit debug camera.
- **Mouse wheel**: zoom.
- **1 / 2**: Team A / Team B.
- **R**: clear CPU and GPU ink.
- **B**: enqueue 2000 paint events.
- UI buttons expose team, brush size, 250/2000-event stress tests, and clear.

## Atlas override

```text
?inkAtlas=4096
?inkAtlas=2048
```

Default request is 4096² RGBA8 with 2048² fallback.

## Architecture

```text
Debug click / future projectile impact
              ↓
          PaintRequest
              ↓ fixed 60 Hz
      immutable PaintEvent
        ┌────────┴────────┐
        ↓                 ↓
CPU Gameplay Ink     GPU Visual Ink
PaintSurface grid    Persistent atlas
        ↓                 ↓
Turf / movement      Surface shader
/ future AI
```

CPU and GPU do **not** independently recalculate impact positions.

## Important files

- `src/core/FixedStepClock.ts`
- `src/ink/PaintSurface.ts`
- `src/ink/GameplayInkSystem.ts`
- `src/ink/PaintCoordinator.ts`
- `src/ink/GpuInkAtlas.ts`
- `src/ink/InkSurfaceMaterial.ts`
- `src/stage/TestStage.ts`
- `src/config/reference/splatoonReference.ts`
- `src/config/game/gameConfig.ts`
- `CURRENT_CANONICAL.md`
- `VALIDATION.md`

## Current scope / next phase

T4+ gameplay is intentionally not yet implemented: controllable third-person movement, squid movement, shooter projectiles, damage, respawn, match loop, CPUs, super jump, full HUD/map, Flow Aura, audio, and final polish.

The next coherent milestone is **T4–T7**:
human movement → squid movement → high-speed projectile simulation → projectile-to-PaintEvent integration → major technical QA.

## Validation status

The stabilized v0.1.2 checkpoint has passed:
- dependency-resolved GitHub Actions install
- `npm run typecheck`
- Vite production build
- GitHub Pages configure/upload/deploy
- hosted browser launch confirmed by the user
- left-click painting confirmed fixed in the hosted/browser workflow

See `VALIDATION.md` for details.
