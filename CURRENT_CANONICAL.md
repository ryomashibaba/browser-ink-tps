# CURRENT_CANONICAL — v0.5.0 / T10 STABLE FREEZE

Date: 2026-09-23

## Status

**T0–T10 is now the frozen stable foundation. T10 Shooter + Ink Economy + Combat Foundation passed automated CI/deploy and full hosted runtime QA on 2026-09-23.**

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
- Shift: Squid form / swim
- Shift + movement into OWN-painted wall: wall swim
- fast OWN-ink swim + reverse direction + Space: Squid Roll
- on OWN-painted wall, hold Space then release: Surge
- Left mouse: fire (Human form only)
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

## T9 stable checkpoint

Initial implementation commit:
`110f925fe830ea2aa3865b3c88525c81d1e08f92`

Current T9 coordinate-audit candidate:
`0b95810314e5f91b047577eba4a94c6f9db89100`

Current automated workflow:
`35810161552`

Automated results:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: **PASS — user confirmed all T9 checks on 2026-09-23**

T9 candidate adds:

- distinct Human capsule and Squid ball Rapier colliders on the same kinematic body
- foot-height-preserving Squid collider offset
- explicit locomotion states: HUMAN / SQUID_DRY / SWIM_GROUND / SWIM_WALL / SQUID_ROLL / SURGE_CHARGE / SURGE
- OWN-ink high-speed ground swimming while neutral/enemy/non-ink remains slow
- OWN-ink wall detection through the CPU-authoritative PaintSurface grid
- Shift + movement into an OWN-painted wall for wall swimming
- Squid Roll from OWN-ink ground swimming with a 0.20 s reverse-turn grace window before jump, reducing 60 Hz input timing misses
- wall Surge charge/release using jump while attached to an OWN-painted wall
- visible Squid Roll rotation feedback
- canonical world→PaintSurface projection shared by gameplay sampling and ray impacts
- startup coordinate audit covering local↔world round-trip, atlas dimensions, PaintSurface↔backing-solid face gap, face-normal alignment, and tangential bounds
- runtime coordinate diagnostics for Player XYZ, sampled surface/U/V, and last PaintEvent local/world position
- `Coord QA` visual test: deterministic ink probes on every PaintSurface plus matching world-space 3D markers to expose GPU/local/world offsets
- fixed GPU atlas sampling-origin mismatch: atlas render placement is top-origin while surface texture sampling is bottom-origin; conversion is now centralized in `AtlasCoordinates.ts`
- CPU PaintEvent / GameplayInk U/V and world coordinates remain unchanged
- Roll QA Pad now fills the entire `main-floor` instead of a narrow strip
- no-ink / neutral Squid movement uses Human-equivalent speed and acceleration; enemy ink remains slowed
- Squid-form main-fire suppression
- Squid-specific physical/render profile plus debug overlay state/collider/wall/charge readouts

All values added here are project tuning, not claims of exact Nintendo internal numbers.

### Hosted T9 QA acceptance

Confirmed by the user on 2026-09-23:

- coordinate audit reports PASS 4/4
- GPU atlas write↔sample contract reports zero error
- Roll QA Pad visually fills the complete main-floor
- CPU turf for full main-floor is 252.0 m² / 76.62% of current scoreable area
- player sampling on the filled main-floor reports `main-floor / OWN`
- no-ink Squid movement uses the intended Human-equivalent baseline
- Squid Roll is now operational and was confirmed in hosted play

Also confirmed by the user on 2026-09-23:

- OWN-painted wall swimming
- wall Surge charge/release
- Human↔Squid switching without abnormal pop/sink
- Squid-form main-fire suppression and retained Human fire
- T8 camera / projectile blocker regression sanity

T9 is therefore **STABLE FREEZE**.

## T8 hosted runtime validation

Hosted-browser QA was completed and accepted by the user on 2026-09-23.

Confirmed at the phase level:

1. projectile blockers operate acceptably against non-paintable stage solids
2. PaintSurface impacts remain visually/functionally aligned
3. close-range blocker behavior is acceptable for this phase
4. third-person camera obstruction/recovery is acceptable
5. ramp/elevated geometry/box-corner/shoulder-offset QA did not reveal a blocking regression

T8 remains frozen and T9 is now frozen. The intended order from here is:

- T10 — shooter + ink economy + combat
- T11 — spawn / splat / respawn / Turf War match loop
- T12 — CPU / Recast + tactical layer
- T13 — production stage / HUD / map
- T14 — content, animation, audio, additional weapons, polish

## Standard workflow

1. Work from current GitHub `main`.
2. Preserve the T0–T10 Freeze contracts.
3. Design the next coherent batch before implementation.
4. Push/merge through GitHub.
5. GitHub Actions must pass typecheck + production build.
6. Successful build deploys to the fixed Pages URL.
7. Browser/runtime QA is performed on the hosted build.
8. Do not return to ZIP transfer or repeated local npm setup as the normal workflow.

## T10 stable checkpoint

Implementation commit:
`e70b7bca293ba259a4e3f4c70668aa4d7aae9c92`

Type-fix follow-up:
`b42db91f53ddbed56e1c14c571408d6f68e20871`

Automated workflow:
`35811304576`

Automated results:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: **PASS — user confirmed all T10 checks on 2026-09-23**

T10 stable scope:

- 100-unit player Ink Tank
- 0.95 Ink consumption per successful projectile spawn
- 0.35 s recovery lock after firing
- Human-form passive Ink recovery
- fast Ink recovery while Squid in OWN ink
- dry-fire rejection when Ink is insufficient
- 100 HP player resource state
- delayed HP regeneration after damage
- accelerated HP regeneration while Squid in OWN ink
- non-lethal enemy-ink damage floor at 60 HP
- deterministic enemy-only projectile damage against combat QA targets
- 34 damage per standard projectile hit
- Team A / Team B QA targets with 100 HP and short automatic QA reset
- projectile nearest-hit arbitration extended to PaintSurface / blocker / enemy combat target
- same-team combat targets are ignored by damage queries
- debug metrics for Ink, HP, recovery states, fired/dry shots, combat hits, target downs, and target HP

T11 remains responsible for player splat / spawn / respawn / match-flow state transitions. The T10 QA target down/reset behavior is diagnostic scaffolding, not the production respawn loop.

T10 project tuning values are original implementation tuning. Reference constants remain separately labeled under `src/config/reference/`.

### Hosted T10 QA acceptance

Confirmed by the user on 2026-09-23:

- Ink Tank decreases only on successful Human-form shots
- dry-fire stops projectile creation when Ink is insufficient
- Human Ink recovery resumes after the post-fire lock
- OWN-ink Squid recovery is clearly faster
- enemy-only combat target damage works for both Team A and Team B
- 34-damage target progression and three-hit QA down behavior work
- QA target auto-reset returns the target at full HP
- enemy-ink HP damage is gradual and stops at the configured non-lethal floor
- HP recovery resumes after leaving enemy ink and waiting through the delay
- T9 Squid Roll / wall swim / Surge regressions were not observed
- T8 camera / blocker / paint regressions were not observed

Stable T10 gameplay checkpoint:
`b42db91f53ddbed56e1c14c571408d6f68e20871`

T10 is therefore **STABLE FREEZE**.

## Next phase

- T11 — spawn / splat / respawn / Turf War match loop
- T12 — CPU / Recast + tactical layer
- T13 — production stage / HUD / map
- T14 — content, animation, audio, additional weapons, polish
