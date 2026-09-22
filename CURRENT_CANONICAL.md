# CURRENT_CANONICAL — v0.2.0 / T4–T7 TECHNICAL SLICE

Date: 2026-09-22

## Status

**T0–T3 remains the frozen stable foundation. T4–T7 is now integrated on `main` and has passed dependency-resolved CI + production build + GitHub Pages deployment.**

Hosted QA build:
https://ryomashibaba.github.io/browser-ink-tps/

Current code commit for the first T4–T7 deployment:
`b065157f3a86bb8aceb6c922d9791ce25403c0fa`

Hosted hands-on gameplay QA is still required before labeling T4–T7 fully browser-validated.

## Architecture freeze retained

Do not replace these without a documented freeze-change procedure:

- TypeScript + Vite.
- PlayCanvas Engine 2 standalone/npm; no PlayCanvas Editor dependency.
- PlayCanvas 2.22.1.
- TypeScript 5.8.3.
- Vite 7.1.7.
- WebGPU preferred, WebGL2 fallback.
- Gameplay simulation fixed at 60 Hz and separated from rendering.
- Character movement is custom game movement + Rapier 3D kinematic character collision.
- Future navigation remains Recast + custom tactical layer.

T4 introduces:

- `@dimforge/rapier3d-compat 0.20.0`, pinned.
- Rapier is initialized once during boot before gameplay physics objects are created.

## Ink architecture freeze retained

CPU gameplay ink is still the only gameplay-authoritative truth.

GPU ink remains persistent visual data.

The canonical path is still:

```text
Projectile/debug source
        ↓
   PaintRequest
        ↓ fixed tick
one immutable PaintEvent
    ┌──────┴──────┐
    ↓             ↓
GameplayInk    GpuInkAtlas
    ↓             ↓
movement/turf   visuals
```

`PaintCoordinator.processTick()` remains the single PaintEvent creation/fan-out point. Projectile code does not independently paint CPU or GPU state.

## PaintSurface / gameplay ink freeze retained

- gameplay cell: **0.125 m × 0.125 m**
- dirty tile: **16×16 cells**
- visual atlas request: **4096×4096 RGBA8**
- fallback atlas: **2048×2048**
- preferred atlas density: **128 px/m**
- GPU paint processing max: **2048 events/frame**
- all gameplay ink is surface-local; never a global XZ grid

Flags remain:

- `PAINTABLE`
- `SWIMMABLE`
- `SCOREABLE`
- `WALL`
- `FLOOR`
- `RAMP`
- `SPAWN_PROTECTED` reserved

## T4 — Human Movement

Implemented:

- `PlayerInput`
- `ThirdPersonCamera`
- `RapierStagePhysics`
- `PlayerController`
- camera-relative WASD
- acceleration/deceleration
- custom gravity
- grounded state
- jump
- Rapier kinematic character controller
- max climb/slide slope configuration
- autostep + snap-to-ground
- all gameplay movement inside the fixed 60 Hz simulation callback

The player is not a dynamic Rigidbody.

## T5 — Squid Movement / authoritative ink sampling

`GameplayInkSystem.sampleWorld()` projects a world point onto registered PaintSurfaces and samples the authoritative CPU owner/flags in each surface's local grid.

This supports:

- own ink
- enemy ink
- neutral ink
- non-swimmable/no-surface
- floor/ramp/wall architecture through the same PaintSurface basis

Current Human/Squid state is controlled by Shift.

Current movement hooks:

- Human speed
- Squid + own ink: fast swim movement
- Squid + neutral: reduced movement
- Squid + enemy ink: strongly reduced movement

These movement numbers are **project tuning**, not exact reference values.

## T6 — Standard Shooter Projectile

Implemented as a pool, not as one dynamic rigid body per bullet.

Current project tuning:

- pool size: 128
- fire interval: 0.105 s
- speed: 28 m/s
- projectile gravity: 4 m/s²
- lifetime: 1.8 s
- impact paint radius: 0.64 m

Each fixed tick advances a projectile from previous position to next position and uses `PaintSurface.intersectSegment()`, preventing a fast projectile from relying on point-only overlap.

## T7 — Projectile → PaintEvent

On a surface impact the projectile resolves:

1. hit PaintSurface identity
2. exact world impact
3. surface-local U/V
4. team
5. impact / wall-impact event type
6. paint ellipse dimensions

It then enqueues one `PaintRequest`.

The existing `PaintCoordinator` creates one immutable `PaintEvent` for that request and sends that same event to authoritative CPU gameplay ink and the GPU atlas.

## Controls

- WASD: move
- Space: jump
- Shift: Squid state
- Left mouse: fire
- Right mouse drag: rotate third-person camera
- Mouse wheel: camera distance
- 1 / 2: Team A / Team B
- R: clear ink
- B: 2000-event legacy ink stress burst
- Alt + Left click: retained T0–T3 direct-paint QA path
- QA brush slider affects only the retained direct-paint QA path

## Validation completed

GitHub Actions run `35745535871`:

- dependency install: PASS
- `npm run typecheck`: PASS
- Vite production build: PASS
- Configure Pages: PASS
- Upload Pages artifact: PASS
- Deploy to GitHub Pages: PASS

The T0–T3 high-DPI click coordinate fix was not removed.

## Runtime QA still required

The following must be checked hands-on in the hosted build before T4–T7 is called fully browser-validated:

- WASD movement and camera-relative direction
- frame-rate-independent apparent movement
- collision against arena geometry
- ramp/slope behavior and jump
- Shift Human↔Squid transition
- own-ink vs neutral/enemy movement difference
- sustained shooter fire
- floor/ramp/wall projectile impacts
- projectile impact location matching visible paint
- CPU turf change matching GPU visual paint
- no abnormal GPU backlog under normal fire/stress

## Intentionally deferred / current limitations

Not bugs for this technical slice unless they break the above QA:

- no damage/HP
- no ink tank
- no respawn
- no match loop
- no CPU AI/navigation
- no super jump
- no full HUD/map
- no final character animation/model
- no wetness decay
- dirty-tile consumer/clear policy remains deferred
- projectile sweep currently targets PaintSurface planes; a complete non-paintable obstacle projectile-collision layer is not yet implemented
- Squid state currently keeps the shared Rapier capsule collider
- third-person camera obstruction avoidance is not yet implemented

## Standard workflow

1. Work from current GitHub `main`.
2. Preserve T0–T3 freeze contracts.
3. Implement a coherent batch.
4. Push/merge.
5. GitHub Actions must pass typecheck + production build.
6. Successful build deploys to the fixed Pages URL.
7. Browser QA is done by reloading the fixed URL.
8. Do not return to ZIP transfer or repeated local npm setup as the normal workflow.
