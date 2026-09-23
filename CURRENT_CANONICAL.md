# CURRENT_CANONICAL — v0.3.0 / T8 STABLE FREEZE

Date: 2026-09-23

## Status

**T0–T8 is now the frozen stable foundation. T8 World Interaction Foundation passed automated CI/deploy and hosted runtime QA on 2026-09-23.**

Hosted build:
https://ryomashibaba.github.io/browser-ink-tps/

Stable gameplay checkpoint:
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

## T8 stable checkpoint

Implementation commit:
`234180436b27e0c9498c8d253348b2c366f839ce`

Automated workflow:
`35803236486`

Automated results:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: **PASS — user confirmed**

T8 candidate adds:

- one shared static stage-solid definition used by PlayCanvas box rendering and Rapier static colliders
- explicit per-solid projectile/camera blocker participation
- Rapier scene-query based world-segment tests
- non-paintable projectile blocking without fabricating a PaintRequest/PaintEvent
- paint-surface-vs-backing-solid priority tolerance while preserving frozen PaintSurface U/V
- center-ray aim target stopping on non-paintable world blockers
- third-person camera obstruction with immediate inward retraction and damped recovery

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

Stable gameplay checkpoint:
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

## T8 hosted runtime validation

Hosted-browser QA was completed and accepted by the user on 2026-09-23.

Confirmed at the phase level:

1. projectile blockers operate acceptably against non-paintable stage solids
2. PaintSurface impacts remain visually/functionally aligned
3. close-range blocker behavior is acceptable for this phase
4. third-person camera obstruction/recovery is acceptable
5. ramp/elevated geometry/box-corner/shoulder-offset QA did not reveal a blocking regression

T8 is therefore frozen. The intended order from here is:

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
