# CURRENT_CANONICAL — v0.1.2 / T0–T3 STABLE

Date: 2026-09-22

## Current phase

**T0–T3 foundation is complete and stabilized.**

Implemented and verified:
- engine/bootstrap
- fixed 60 Hz simulation
- PaintSurface system
- CPU gameplay ink
- GPU persistent visual ink
- debug/stress QA arena
- high-DPI left-click paint picking fix
- GitHub Actions typecheck/build gate
- GitHub Pages automatic deployment

Hosted QA build:
https://ryomashibaba.github.io/browser-ink-tps/

Next major phase: **T4–T7**, implemented as one coherent batch:
human movement → squid movement → standard-shooter projectile → projectile/paint integration → major technical QA.

## Architecture freeze

Do not replace these without the documented freeze-change procedure:

- TypeScript + Vite.
- PlayCanvas Engine 2 standalone/npm; no PlayCanvas Editor dependency.
- WebGPU preferred, WebGL2 fallback.
- Fixed gameplay simulation at 60 Hz; rendering remains independent.
- Future character collision: custom movement + Rapier kinematic character collision.
- Future navigation: Recast plus a custom tactical layer.

Direct dependency versions are pinned at the v0.1.2 checkpoint:
- PlayCanvas 2.22.1
- TypeScript 5.8.3
- Vite 7.1.7

## Ink freeze

- CPU gameplay ink is authoritative for gameplay.
- GPU ink is persistent visual data.
- Both consume the same immutable `PaintEvent` generated once by `PaintCoordinator`.
- Gameplay cells are **0.125 m × 0.125 m**.
- Ink storage is **surface-local**, never a global XZ grid.
- Dirty tiles are **16×16 cells**.
- Turf area updates only when ownership changes.
- Visual atlas stores ownership/coverage/wetness; team display colors are applied in the surface shader.
- Default atlas request: 4096×4096 RGBA8; fallback: 2048×2048.
- No per-impact decal-object accumulation.

## PaintSurface flags in use

- `PAINTABLE`
- `SWIMMABLE`
- `SCOREABLE`
- `WALL`
- `FLOOR`
- `RAMP`
- `SPAWN_PROTECTED` reserved for later use

Test-stage behavior:
- Main floor: paintable / swimmable / scoreable.
- Upper floor: paintable / swimmable / scoreable.
- Ramp: paintable / swimmable / scoreable.
- Wall: paintable / swimmable / **not scoreable**.

## Canonical T0–T3 data flow

```text
Input / future projectile impact
          ↓
      PaintRequest
          ↓ fixed tick
 immutable PaintEvent
      ┌─────┴─────┐
      ↓           ↓
 GameplayInk    GpuInkAtlas
      ↓           ↓
 Turf deltas    persistent visual atlas
```

CPU and GPU must never recalculate an impact independently.

## Canonical implementation constants

Implementation-owned values live in `src/config/game/gameConfig.ts`.
Inherited research/reference values live separately in `src/config/reference/splatoonReference.ts`.

Important T0–T3 constants:
- `tickRate = 60`
- `cellSizeMeters = 0.125`
- `dirtyTileCells = 16`
- `requestedAtlasSize = 4096`
- `fallbackAtlasSize = 2048`
- `preferredPixelsPerMeter = 128`
- `atlasGutterPixels = 8`
- `maxGpuPaintEventsPerFrame = 2048`

Do not scatter these as unexplained magic numbers.

## Implemented systems

- Vite / TypeScript project shell.
- PlayCanvas Engine 2 AppBase boot.
- WebGPU-first device request with PlayCanvas fallback semantics.
- 60 Hz accumulator and catch-up cap.
- Performance counters/debug overlay.
- PaintSurface local coordinates, grids, flags, weights, dirty tiles/revisions.
- Partial-edge score weights.
- CPU oriented ellipse rasterization.
- Incremental turf ownership and percentage calculation.
- GPU atlas shelf allocation.
- Persistent offscreen atlas render target.
- Batched GPU brush mesh; dual GLSL/WGSL shader paths.
- Surface atlas sampler shader with cyan/magenta/neutral visualization.
- Original test arena and orbit/click QA camera.
- High-DPI-safe left-click picking using canvas CSS coordinates.
- 250/2000-event paint stress triggers.
- GitHub Actions production typecheck/build/deploy pipeline.
- GitHub Pages fixed QA URL.

## Known / intentionally deferred items

Not bugs for v0.1.2:
- No player character yet.
- No Rapier dependency/use until character collision work begins.
- No Recast dependency/use until AI/navigation work begins.
- No projectile weapon yet; paint is injected by QA click/stress tools.
- No movement/HP/ink tank/respawn/match/AI/super-jump/HUD systems yet.
- No wetness decay simulation; wetness is currently event metadata used for visual emphasis.
- Debug dirty flags remain set until a future subsystem consumes/clears them; revisions already support consumer-side invalidation.

## Validation status

Verified on 2026-09-22:
- dependency install in GitHub Actions: PASS
- dependency-resolved `npm run typecheck`: PASS
- Vite production `npm run build`: PASS
- GitHub Pages configure/artifact/deploy: PASS
- hosted build opened successfully in the user's browser
- high-DPI left-click painting confirmed fixed by the user

The assistant's generic web fetcher could not directly open the Pages host, so browser rendering is user-confirmed rather than independently fetched by that tool.

## Standard development workflow

From this checkpoint onward:
1. ChatGPT edits/pushes repository changes.
2. GitHub Actions installs, typechecks, and builds.
3. Only successful builds deploy to GitHub Pages.
4. User reloads the fixed Pages URL for QA.
5. ZIP transfer and repeated local `npm install` / `npm run dev` are no longer the default workflow.

## Next milestone

Proceed as one coherent T4–T7 batch while retaining all T0–T3 data contracts:

1. Human movement state foundation.
2. Squid movement / own-ink sampling hook.
3. Standard shooter high-speed projectile simulation with swept collision.
4. Projectile → one PaintEvent → CPU/GPU integration.
5. Major QA: projectile impact position, surface identity/local coordinates, CPU/GPU agreement, turf deltas, fixed-tick stability, performance.
