# Browser Ink TPS — T0–T3 Foundation

A standalone browser 3D ink-game prototype foundation built with **TypeScript + Vite + PlayCanvas Engine 2**. This repository is intentionally limited to the T0–T3 technical vertical slice: fixed-step simulation, surface-local gameplay ink, shared paint events, and a persistent GPU visual ink atlas.

This is an original project inspired by the system-level idea of territory painting. It does **not** include Nintendo characters, logos, models, textures, audio, stages, UI assets, or other copied game content.

## What is implemented

- Fixed **60 Hz** simulation clock, separated from render rate.
- `PaintSurface` local coordinate system for floor / ramp / wall surfaces.
- Authoritative CPU gameplay ink at **0.125 m per cell**.
- 16×16-cell dirty tiles with per-tile revisions.
- `PaintEvent` as the single source event consumed by CPU gameplay ink and GPU visual ink.
- Oriented ellipse rasterization with sin/cos calculated once per event.
- Incremental turf-area accounting; no full-stage scan every frame.
- Scoreable and non-scoreable surfaces (the wall paints visually/gameplay-wise but does not count toward turf score).
- Persistent RGBA8 GPU ink atlas. It stores ownership / coverage / wetness rather than hard-coded display colors.
- WebGPU-preferred graphics-device creation with PlayCanvas' WebGL2 fallback path.
- Dual GLSL / WGSL `ShaderMaterial` implementations for the atlas brush and painted surfaces.
- One dynamic batched brush mesh rather than one decal object per paint event.
- Bright near-future test arena with floor, elevated floor, ramp, wall, obstacles, rails, lighting, cyan / magenta teams, and neutral gray.
- Debug overlay with FPS, frame time, fixed-tick data, paint throughput, dirty tiles, GPU paint workload/backlog, atlas resolution, draw-call best-effort, and live turf percentages.
- Paint stress buttons (250 / 2000 events).

## Run

Requirements:

- Node.js 20+ (Node 22 LTS is a good choice)
- A current Chromium / Firefox / Safari browser with WebGL2. WebGPU is used when available through PlayCanvas' preferred-device path.

```bash
npm install
npm run dev
```

Open the URL printed by Vite.

Production build:

```bash
npm run build
npm run preview
```

## Controls

- **Left click** a paintable floor, ramp, or wall: paint at that point.
- **Left drag**: orbit the debug camera.
- **Mouse wheel**: zoom.
- **1 / 2**: Team A / Team B.
- **R**: clear all CPU and GPU ink.
- **B**: enqueue the 2000-paint-event stress test.
- UI buttons expose Team A/B, brush size, 250/2000-event stress tests, and clear.

## Atlas override

The default requested visual atlas is 4096×4096. It automatically falls back to 2048×2048 if the graphics device cannot support 4096. You can force either size for QA:

```text
?inkAtlas=4096
?inkAtlas=2048
```

The 4096 request only succeeds when `maxTextureSize` supports it.

## Architecture

```text
Debug click / future projectile impact
              ↓
          PaintRequest
              ↓  fixed 60 Hz
      immutable PaintEvent
        ┌────────┴────────┐
        ↓                 ↓
CPU Gameplay Ink     GPU Visual Ink
PaintSurface grid    Persistent atlas
        ↓                 ↓
Turf / movement      Surface shader
/ future AI
```

The CPU and GPU sides do **not** independently recalculate impact positions. `PaintCoordinator` creates one `PaintEvent`; the gameplay grid applies it and the same event object is queued to the atlas.

## Important files

- `src/core/FixedStepClock.ts` — fixed 60 Hz accumulator.
- `src/ink/PaintSurface.ts` — local grid basis, flags, weights, dirty tiles, ray intersection.
- `src/ink/GameplayInkSystem.ts` — authoritative ellipse rasterization and turf deltas.
- `src/ink/PaintCoordinator.ts` — shared event fan-out to CPU + GPU.
- `src/ink/GpuInkAtlas.ts` — persistent render-target atlas and batched brush rendering.
- `src/ink/InkSurfaceMaterial.ts` — atlas sampling and team-color application.
- `src/stage/TestStage.ts` — T0–T3 QA arena.
- `src/config/reference/splatoonReference.ts` — inherited research/reference constants, not project tuning.
- `src/config/game/gameConfig.ts` — original-project implementation/quality/debug values.
- `CURRENT_CANONICAL.md` — the state to inherit in the next development phase.

## Current scope / not yet implemented

T4+ gameplay is intentionally not in this milestone: controllable third-person character movement, squid movement, shooter projectiles, damage, respawn, match loop, CPUs, super jump, full HUD/map, Flow Aura, audio, and final polish.

The clickable brush exists only to QA T0–T3 before projectile integration.

## Validation status

The source has passed a TypeScript syntax/transpile check in the generation environment. The PlayCanvas-specific graphics code was cross-checked against the current PlayCanvas Engine 2.22.1 API/manual, including `createGraphicsDevice`, `ShaderMaterial` GLSL/WGSL support, `Mesh` UV channels/dynamic update APIs, `CameraComponent.renderTarget`, and render-target orientation.

The generation environment could not download npm dependencies (registry access timed out), so an actual `npm install` + browser/WebGPU/WebGL2 execution was **not** available there. Run the commands above locally; if a runtime-specific PlayCanvas regression appears, preserve the architecture freeze and fix the narrow API mismatch rather than replacing the ink design.
