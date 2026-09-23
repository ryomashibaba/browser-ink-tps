# CURRENT_CANONICAL — v0.2.0 / T4–T7 STABLE FREEZE

Date: 2026-09-23

## Status

**T0–T3 remains the frozen ink foundation. T4–T7 is now accepted as the current stable browser-TPS slice and should be treated as frozen unless a later phase requires a documented compatibility change.**

Hosted build:
https://ryomashibaba.github.io/browser-ink-tps/

Current stable head:
`d93f5bf0cfb261515e5ad5081b1b7599e1efbdbf`

Final stabilization workflow:
`35800320770`

Final stabilization validation:

- dependency install: PASS
- TypeScript check: PASS
- production Vite build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted hands-on QA: user accepted the current T4–T7 slice as completed after camera/aim/ink alignment fixes

## Architecture freeze

Do not replace these without an explicit freeze-change decision:

- TypeScript + Vite
- PlayCanvas Engine 2 standalone/npm; no PlayCanvas Editor dependency
- PlayCanvas 2.22.1
- TypeScript 5.8.3
- Vite 7.1.7
- @dimforge/rapier3d-compat 0.20.0
- WebGPU preferred, WebGL2 fallback
- gameplay simulation fixed at 60 Hz
- rendering separated from gameplay simulation
- fixed-step state is render-interpolated for smoother high-refresh presentation
- character movement uses custom gameplay movement + Rapier 3D kinematic character collision
- future navigation remains Recast + custom tactical layer

## Ink architecture freeze

CPU gameplay ink is the only gameplay-authoritative ink representation.

GPU ink is persistent visual data only.

Canonical flow:

```text
Projectile / debug source
          ↓
      PaintRequest
          ↓ fixed tick
 one immutable PaintEvent
      ┌──────┴──────┐
      ↓             ↓
 GameplayInk     GpuInkAtlas
      ↓             ↓
 movement/turf     visuals
```

`PaintCoordinator.processTick()` remains the single PaintEvent creation/fan-out point.

CPU and GPU must not independently recompute projectile impact coordinates.

## PaintSurface / gameplay ink freeze

- gameplay cell: **0.125 m × 0.125 m**
- dirty tile: **16×16 cells**
- visual atlas request: **4096×4096 RGBA8**
- fallback atlas: **2048×2048**
- preferred atlas density: **128 px/m**
- GPU paint processing max: **2048 events/frame**
- gameplay ink is always PaintSurface-local; never replace it with one global XZ grid

Flags:

- `PAINTABLE`
- `SWIMMABLE`
- `SCOREABLE`
- `WALL`
- `FLOOR`
- `RAMP`
- `SPAWN_PROTECTED` reserved

The CPU PaintEvent U/V basis remains canonical. The GPU atlas applies only the render-target orientation correction needed to display the same event at the correct visible vertical position.

## T4 — Human movement

Implemented and retained:

- camera-relative WASD
- acceleration / deceleration
- custom gravity
- grounded state
- jump
- Rapier kinematic character controller
- max climb / slide slope configuration
- autostep
- snap-to-ground
- fixed 60 Hz gameplay movement
- render interpolation between fixed states
- actual post-collision movement speed exposed in debug metrics

The player is not a dynamic rigid body.

## T5 — Squid state / authoritative ink sampling

Implemented:

- Human / Squid state machine
- Shift-held Squid state
- world-point sampling through PaintSurface-local CPU owner grids
- OWN / ENEMY / NEUTRAL / NONE relations
- own-ink fast Squid movement
- reduced neutral/enemy Squid movement
- ground sampling filters that prevent nearby wall ink from contaminating floor movement state

Current movement numbers are project tuning, not claims about exact Splatoon internals.

## T6 — Standard shooter projectile

Implemented as a fixed pool, not one dynamic rigid body per projectile.

Current project tuning:

- pool size: 128
- nominal fire interval: 0.105 s
- speed: 28 m/s
- projectile gravity: 4 m/s²
- lifetime: 1.8 s
- impact paint radius: 0.64 m

Important stabilized behavior:

- previous-position → next-position swept PaintSurface intersection
- fractional fire-cooldown remainder is preserved instead of permanently rounding cadence to fixed ticks
- projectile rendering is interpolated between fixed states
- center-crosshair targeting is converted to a low-arc launch vector that compensates configured projectile gravity

## T7 — Projectile → PaintEvent

On impact, the projectile resolves:

1. hit PaintSurface identity
2. exact world impact
3. surface-local U/V
4. team
5. impact / wall-impact event type
6. paint ellipse dimensions

It then enqueues one `PaintRequest`.

The existing `PaintCoordinator` creates one immutable `PaintEvent` and sends that same event to authoritative CPU gameplay ink and persistent GPU visual ink.

## Camera / input stable behavior

Current controls:

- click game view once: acquire Pointer Lock
- mouse movement: TPS camera look without holding a mouse button
- Esc: release Pointer Lock
- WASD: move
- Space: jump
- Shift: Squid state
- Left mouse: fire
- Mouse wheel: camera distance
- 1 / 2: Team A / Team B
- R: clear ink
- B: 2000-event QA stress burst
- Alt + Left click: retained direct-paint QA path

Stabilization rules:

- the first click used to acquire Pointer Lock does not fire
- gameplay key/fire state is cleared on Pointer Lock release, tab visibility loss, or window blur
- camera state is synchronized before and during fixed-step catch-up ticks
- center-screen camera ray defines the visual aim target
- projectile launch is solved from muzzle to that target with gravity compensation
- GPU visual ink V orientation is corrected without changing CPU-authoritative PaintEvent coordinates

## Stability hardening added during T4–T7 QA

The current stable slice also includes:

- invalid/non-finite fixed-step frame delta protection
- PaintSurface dimension and orthogonal-basis invariants
- GPU brush batch guard for Uint16 index capacity
- QA hotkey repeat suppression
- render interpolation for player and projectiles
- wall exclusion in feet-level ink sampling
- Pointer Lock/input boundary cleanup

## Final validation checkpoint

Stable head:
`d93f5bf0cfb261515e5ad5081b1b7599e1efbdbf`

GitHub Actions:
`35800320770`

Result:

- TypeScript: PASS
- production build: PASS
- GitHub Pages deployment: PASS

The user then accepted the current state as completed for this phase.

## Intentionally deferred / not part of T4–T7 Freeze

These remain future work rather than hidden bugs in the current slice:

- complete projectile blocking against non-paintable stage geometry
- third-person camera obstruction / wall avoidance
- state-specific Squid physical collider
- full ink tank / ink consumption / refill loop
- player damage / HP / splat
- respawn
- match flow / timer / result
- 4v4 participant model
- CPU AI / Recast navigation
- super jump
- final HUD / tactical map
- production character models / animation / audio
- production stage content
- wetness decay
- final dirty-tile consumer / clearing policy
- bundle-size optimization

## Next planned phase

**T8 — World Interaction Foundation**

Before adding HP, CPUs, or the full match loop, the next phase should unify world interaction:

1. projectile collision against non-paintable blockers
2. clear relationship between stage render geometry, Rapier collision geometry, and PaintSurfaces
3. third-person camera obstruction handling
4. collision/occlusion edge cases around ramps, walls, rails, and elevated geometry
5. preserve all T0–T7 frozen contracts while adding the shared world-interaction layer

After T8, the intended order is:

- T9 — complete Squid / ink locomotion
- T10 — shooter + ink economy + combat
- T11 — spawn / splat / respawn / Turf War match loop
- T12 — CPU / Recast + tactical layer
- T13 — production stage / HUD / map
- T14 — content, animation, audio, additional weapons, polish

## Standard workflow

1. Work from current GitHub `main`.
2. Preserve the T0–T7 Freeze contracts.
3. Design the next coherent batch before implementation.
4. Push/merge through GitHub.
5. GitHub Actions must pass typecheck + production build.
6. Successful build deploys to the fixed Pages URL.
7. Browser/runtime QA is performed on the hosted build.
8. Do not return to ZIP transfer or repeated local npm setup as the normal workflow.
