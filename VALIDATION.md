# Validation Report — v0.4.0 T9 Implementation Candidate

Date: 2026-09-23

## T8 stable checkpoint

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
- hosted runtime QA: **PASS — user confirmed 2026-09-23**

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

Hosted hands-on QA was subsequently completed and accepted by the user. T8 is frozen.

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


## T8 hosted acceptance

The user completed the hosted-browser T8 QA pass and confirmed completion on 2026-09-23.

Accepted phase scope includes:

- projectile blocking by non-paintable stage geometry
- retained paint behavior on floor/ramp/wall PaintSurfaces
- camera obstruction and smooth recovery
- ramp/elevated-floor/box-corner/close-range/shoulder-offset checks
- no blocking regression reported in the T0–T7 frozen gameplay foundation

T8 is now considered **STABLE FREEZE**.

Stable T8 gameplay implementation checkpoint:
`234180436b27e0c9498c8d253348b2c366f839ce`

Automated implementation workflow:
`35803236486`

Candidate-document workflow:
`35803430382`


## T9 Squid / Ink Locomotion candidate

Initial implementation commit:
`110f925fe830ea2aa3865b3c88525c81d1e08f92`

Current candidate fix commit:
`cffcc72028863cb3c538dc9bfc16d2e470166af0`

Current workflow:
`35805455465`

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

Source/architecture audit:

- Human remains a capsule collider and Squid now uses a separate ball collider attached to the same position-based kinematic rigid body.
- The inactive form collider is disabled; the existing Rapier character controller drives the active form collider.
- Squid collider placement preserves the existing foot baseline instead of moving the player upward on form change.
- CPU-authoritative PaintSurface sampling remains the only source for OWN / ENEMY / NEUTRAL locomotion decisions.
- wall swimming only attaches to a SWIMMABLE + WALL PaintSurface cell owned by the current team.
- PaintEvent / GameplayInk / GpuInkAtlas flow is unchanged.
- T8 projectile/camera world interaction is unchanged.
- Squid Roll and Surge are locomotion-only project-tuned actions; combat effects/damage armor remain deferred to T10.
- Squid Roll reverse intent is buffered for 0.20 s so reverse input and jump do not need to land on the same 60 Hz tick.
- Squid Roll has explicit visual rotation feedback during the action.
- neutral/no-ink Squid movement now uses Human-equivalent speed and acceleration; enemy ink remains the slowed case.
- main-weapon fire is suppressed while the player is in Squid form.
- debug overlay exposes locomotion state, active collider, wall surface, and Surge charge.

Hosted QA required before T9 Freeze:

1. Human↔Squid switching does not pop the player upward/downward or fall through the stage.
2. OWN ground ink enters SWIM_GROUND and moves clearly faster; neutral/no-ink SQUID_DRY moves at Human-equivalent speed; enemy ink remains clearly slower.
3. ramps/steps remain traversable in both forms without obvious clipping or stuck states.
4. an OWN-painted section of `wall-west` can be climbed while holding Shift and moving into it; unpainted/enemy-painted wall sections cannot be climbed.
5. while swimming fast in OWN ink, reverse direction then press Space within roughly 0.20 s; SQUID_ROLL should trigger reliably and show a visible rotation. Ordinary Space without a qualifying reverse still performs the normal Squid jump.
6. on an OWN-painted wall, hold Shift + movement into wall + Space to charge, then release Space to trigger SURGE.
7. holding left mouse while Squid does not fire; Human fire remains unchanged.
8. T8 camera obstruction and projectile/paint alignment still behave normally.

T9 is **not frozen** until hosted hands-on QA passes.


## T9 coordinate cross-audit — 2026-09-23

Coordinate unification commit:
`63c81fc200a7c233b88e9f10e94e3876532cad72`

Runtime diagnostics commit:
`4cabccc142e08690a169e9472e12c0812ca81532`

Workflow:
`35807116117`

Automated result:

- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted coordinate QA: **PENDING**

Findings and hardening:

- the previous Roll QA Pad deliberately painted a central local-space strip; at 0.125 m gameplay cells its expected authoritative CPU area is 85.4375 m², matching the reported 85.4 m² screenshot
- world→PaintSurface U/V conversion is now canonicalized in `PaintSurface.projectWorldPoint()` instead of being separately recomputed by gameplay sampling
- projectile/ray hit resolution and CPU movement ink sampling now share the same PaintSurface basis conversion
- all PaintSurfaces declare their backing stage solid
- startup audit validates local↔world coordinate round trips, atlas allocation dimensions, and PaintSurface distance from backing solid faces
- current backing-plane separations are expected small visual offsets and must remain <= 0.08 m
- runtime overlay now exposes Player XYZ, sampled PaintSurface and U/V, last PaintEvent local U/V, and last PaintEvent world XYZ
- Roll QA Pad now fills the complete `main-floor` in PaintSurface-local coordinates, making any visible offset obvious and providing a full Squid Roll runway

Expected clean-state QA after pressing Roll QA Pad:

- `main-floor` should be visually filled across its full paintable rectangle
- Team A turf should be about 76.6% when Team A is selected and all other scoreable surfaces are neutral
- the coordinate audit row should report PASS
- while standing on the filled main floor, sampled surface should be `main-floor` and ink relation should be OWN

This remains T9 candidate validation and does not freeze T9.

## T9 visual coordinate QA hardening — 2026-09-23

Visual QA implementation:
`13590bcc8d7b8ee0ca6a17e106bde97f2c83c66b`

Strict typing follow-up:
`a152aed2f9fcc390c39172c8264b8ca775244719`

Workflow:
`35809531970`

Automated result:

- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted visual coordinate QA: **PENDING**

Additional cross-audit coverage:

- every PaintSurface corner is transformed into the backing solid's local OBB space
- surface face-normal alignment against the declared backing solid is validated
- maximum surface-to-backing-face gap is validated
- tangential corner bounds are validated with only a small tolerance for the intentionally offset ramp surface
- all current surfaces remain under the existing 0.08 m face-gap contract by design

`Coord QA` clears ink and, on every PaintSurface, stamps four deterministic CPU/GPU PaintEvents while placing render-only 3D spheres at the exact corresponding `localToWorld(u,v)` points. The four probes intentionally use different team/radius/marker-size combinations, so U flip, V flip, 180° rotation, or cross-surface offset cannot hide behind a symmetric pattern.

Hosted acceptance condition:

- overlay `Coord audit` reports PASS
- every cyan/magenta ink probe is centered directly under its corresponding same-color 3D marker on main floor, upper floor, ramp, and wall
- no marker/ink pair is mirrored or displaced on only one surface
- `Roll QA Pad` fills the complete main-floor rectangle and movement sampling on it reports `main-floor / OWN`

T9 remains unfrozen until this hosted check is accepted.
