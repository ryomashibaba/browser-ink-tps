# Validation Report — v0.3.0 T8 Implementation Candidate

Date: 2026-09-23

## T8 candidate checkpoint

Implementation commit:
`234180436b27e0c9498c8d253348b2c366f839ce`

Workflow:
`35803236486`

Automated result:

- Checkout: PASS
- Node.js setup: PASS
- npm dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages configure: PASS
- Pages artifact upload: PASS
- Pages deploy: PASS
- hosted runtime QA: **PENDING**

The T0–T7 stable rollback checkpoint remains `d93f5bf0cfb261515e5ad5081b1b7599e1efbdbf`.

## Stable checkpoint

Stable gameplay checkpoint:
`d93f5bf0cfb261515e5ad5081b1b7599e1efbdbf`

Final stabilization workflow:
`35800320770`

Hosted build:
https://ryomashibaba.github.io/browser-ink-tps/

## Automated validation

Final stabilization results:

- Checkout: PASS
- Node.js setup: PASS
- npm dependency install: PASS
- TypeScript check (`npm run typecheck`): PASS
- production build (`npm run build -- --base=/browser-ink-tps/`): PASS
- GitHub Pages configure: PASS
- Pages artifact upload: PASS
- Pages deploy: PASS

The final workflow validates the complete stabilized source tree, not only the original first T4–T7 implementation.

## Architecture audit

Confirmed in the current stable source:

- gameplay simulation remains fixed at 60 Hz
- render presentation is interpolated between fixed states
- player movement remains custom movement + Rapier kinematic character collision
- projectiles remain pooled rather than dynamic rigid bodies
- projectile motion uses previous→next segment sweeps against PaintSurfaces
- projectile impact produces one `PaintRequest`
- `PaintCoordinator.processTick()` remains the single immutable PaintEvent creation point
- CPU gameplay ink remains authoritative
- GPU visual ink consumes the same PaintEvent rather than recomputing impact
- gameplay ink remains surface-local
- turf accounting remains incremental
- feet-level movement ink sampling excludes wall surfaces
- Pointer Lock/input state boundaries are explicitly handled

## T8 world-interaction automated audit

Confirmed by source audit + passing TypeScript/build pipeline:

- stage static solids are declared once in `src/stage/StageDefinition.ts`
- the same solid definitions drive PlayCanvas box rendering and Rapier static colliders
- projectile and camera blocker participation are explicit solid properties
- projectile sweeps compare frozen PaintSurface hits against Rapier blocker hits
- non-paintable blocker hits consume the projectile without generating paint
- PaintSurface hit U/V still comes from the existing `PaintSurface.intersectSegment()` path
- `PaintCoordinator.processTick()` remains the only PaintEvent creation point
- camera obstruction uses target→desired-camera Rapier segment queries
- camera retracts immediately on tighter obstruction and expands with exponential damping
- center-screen aim target now stops at the nearest non-paintable stage blocker when appropriate

Runtime behavior still requires hosted hands-on QA before T8 Freeze.

## Camera / aiming validation

The stabilized camera path now uses:

1. one click to acquire Pointer Lock
2. raw mouse movement for TPS camera control
3. center-screen camera ray for the visual target
4. muzzle position as the projectile origin
5. a gravity-compensated low-arc launch solution toward the center-ray target

Additional protections:

- activation click is not treated as a shot
- Esc releases Pointer Lock
- movement/fire states clear when Pointer Lock is lost
- states also clear on tab visibility loss or window blur
- latest camera yaw/pitch is applied before fixed ticks
- catch-up ticks refresh the camera transform before aiming

## Ink visual alignment validation

CPU PaintEvent U/V remains canonical.

The GPU atlas performs the required visual V-orientation correction inside each PaintSurface atlas rectangle. This fixes the observed failure where aiming upward visibly painted below and aiming downward painted above.

The correction does not alter:

- projectile world impact
- CPU ownership grid
- turf scoring
- PaintEvent coordinates
- PaintSurface local basis

## Fixed-step / presentation validation

The stabilized slice additionally verifies:

- invalid/non-finite frame deltas do not poison the fixed-step accumulator
- player render position interpolates using `FixedStepClock.alpha`
- projectile render positions interpolate using the same fixed-step alpha
- gameplay simulation itself remains 60 Hz
- projectile fire cadence preserves fractional timing remainder rather than being permanently rounded to a 7-tick cadence

## Defensive validation / invariants

Added and retained:

- PaintSurface dimensions must be finite and positive
- PaintSurface cell/tile sizes must be valid
- U/V basis axes must be non-zero and orthogonal
- invalid PaintSurface normals fail fast
- GPU brush batch size is capped below Uint16 index overflow
- QA keyboard shortcuts ignore key-repeat event storms

## Hands-on hosted QA

The user performed iterative hosted-browser QA throughout T4–T7 stabilization and reported issues as they appeared.

Resolved from that QA include:

- reversed camera drag direction from the earlier camera implementation
- replacement of hold-to-drag camera operation with Pointer Lock TPS mouse look
- camera/shot vertical disagreement
- crosshair/projectile direction mismatch
- projectile-gravity vertical offset
- final visible ink vertical inversion

After the final visual ink orientation correction, the user accepted the current phase as completed.

This is considered the T4–T7 Stable Freeze checkpoint.

## Observable debug hooks retained

Debug overlay exposes:

- Human/Squid state
- grounded state
- measured horizontal movement speed
- OWN / ENEMY / NEUTRAL / NONE ink relation
- active projectile count
- projectile impact count
- projectile pool drops
- paint events/s
- ink cells/s
- GPU paint backlog
- turf percentages

The retained Alt+Left direct-paint QA path can still be used to compare the original paint path against projectile-generated PaintEvents.

## Known boundaries intentionally deferred

The following are not part of the completed T4–T7 slice:

- state-specific Squid physical collision shape
- ink tank / consumption / refill
- damage / HP / splat
- respawn
- match timer / result / complete Turf War loop
- CPU players / Recast navigation
- super jump
- production HUD / tactical map
- production character art / animation / audio
- production stage
- wetness decay
- final dirty-tile consumer policy
- bundle-size optimization

These should be handled in later phases instead of weakening the current freeze.
