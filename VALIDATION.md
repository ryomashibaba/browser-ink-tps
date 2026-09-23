# Validation Report — v0.9.0 T14 Implementation Candidate

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


## T9 Squid / Ink Locomotion stable checkpoint

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
- hosted runtime QA: **PASS — user confirmed all remaining checks on 2026-09-23**

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

## T9 GPU atlas origin root-cause fix — 2026-09-23

Fix commit:
`0b95810314e5f91b047577eba4a94c6f9db89100`

Workflow:
`35810161552`

Automated result:

- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted visual recheck: **PENDING**

Root cause:

- runtime screenshot showed `Team A turf = 252.0 m²`, exactly equal to the full 18 m × 14 m `main-floor` area
- `Last paint = main-floor / 9.00, 7.00` and `Paint world = 0.00, 0.03, 0.00` also matched the expected surface center
- therefore CPU PaintEvent, GameplayInk rasterization, PaintSurface local U/V, and local→world conversion were correct
- the visual failure was isolated to GPU atlas sampling
- atlas rectangles are allocated/rendered in top-origin render-target space, but the surface shader had been sampling `rect.y / atlasSize` as a bottom-origin texture UV
- this caused one PaintSurface to sample texels belonging to a different vertical atlas region

Fix:

- added `AtlasCoordinates.ts` as the single GPU atlas coordinate contract
- GPU brush placement still uses top-origin render-target coordinates
- surface shader now converts the packed top-origin rect into bottom-origin texture UVs
- shader sampling uses the exact active PaintSurface pixel span rather than the ceil-packed extent
- startup audit now verifies that each local U/V point written by the GPU brush resolves to the same sampled texel after origin conversion
- CPU authoritative ink coordinates were not flipped or modified

T9 remains a candidate until the hosted Roll QA Pad / Coord QA visual check passes.

## T9 hosted partial acceptance — ground locomotion / coordinate pipeline

User confirmation date: 2026-09-23

Hosted observations accepted:

- `Coord audit`: PASS 4/4
- coordinate round-trip error: approximately 8.9e-16 m
- backing-solid face gap: 0.030 m
- backing normal error: 0.000 degrees
- atlas write↔sample error: 0.0e+0
- Roll QA Pad visibly fills the complete `main-floor`
- authoritative Team A turf after full main-floor fill: 252.0 m² / 76.62%
- player foot sampling on the filled floor reports `main-floor` and OWN
- Squid Roll was successfully triggered and confirmed by the user

These observations validate the previously fixed GPU atlas origin bug and the ground portion of T9 Squid locomotion.

Remaining hosted checks before T9 Freeze:

1. paint `wall-west` with the active team, hold Shift and move into it; `Locomotion` should become `SWIM_WALL` and upward movement should occur only on OWN-painted cells
2. while attached to the OWN-painted wall, hold Space to enter `SURGE_CHARGE`, then release Space; `SURGE` should trigger cleanly
3. Human↔Squid switching should not pop or sink the player, Squid form should not fire, Human form should still fire, and T8 camera/projectile blocking should remain intact

All remaining hosted checks passed on 2026-09-23. T9 is **STABLE FREEZE**.

## T9 final hosted acceptance

User confirmation date: 2026-09-23

Final accepted T9 scope:

- coordinate / GPU atlas alignment
- Roll QA Pad full-floor behavior
- Human↔Squid physical form switching
- no-ink Squid Human-equivalent baseline
- OWN-ink fast ground swimming
- enemy-ink slowdown
- Squid Roll
- OWN-painted wall swimming
- wall Surge charge/release
- Squid-form shooting suppression with retained Human firing
- T8 camera / projectile blocker regression sanity

Stable T9 gameplay implementation checkpoint:
`0b95810314e5f91b047577eba4a94c6f9db89100`

Automated implementation workflow:
`35810161552`

T9 is now considered **STABLE FREEZE**.

## T10 Shooter / Ink Economy / Combat stable checkpoint

Implementation:
`e70b7bca293ba259a4e3f4c70668aa4d7aae9c92`
`b42db91f53ddbed56e1c14c571408d6f68e20871`

Workflow:
`35811304576`

Automated result:

- Checkout: PASS
- Node.js setup: PASS
- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages configure: PASS
- Pages artifact upload: PASS
- Pages deploy: PASS
- hosted runtime QA: **PASS — user confirmed all T10 checks on 2026-09-23**

Source/architecture validation:

- T9 locomotion state is read by `PlayerResources` but not rewritten by T10
- Ink is consumed only when a pooled projectile slot exists and a shot is actually spawned
- insufficient Ink rejects the shot without creating a projectile or PaintEvent
- firing recovery lock and fixed-step recovery are simulation-time based
- OWN-ink Squid recovery is faster than Human recovery
- enemy-ink HP damage is non-lethal by itself and cannot reduce HP below the configured floor
- combat targets are ignored when same-team and only enemy targets participate in hit tests
- projectile combat hits are compared against the already-frozen nearest PaintSurface/blocker result
- a combat target only wins if it is physically closer than the resolved world hit
- PaintSurface hits still enqueue exactly one PaintRequest and retain the frozen PaintCoordinator path
- target down/reset is QA-only; player Splat/Respawn remains deferred to T11

Hosted QA required before T10 Freeze:

1. hold fire in Human form and verify Ink Tank decreases while shots/paint remain normal
2. empty the tank and verify firing stops / dry count rises without phantom projectiles
3. after firing, Human Ink recovery begins after the short lock and restores slowly
4. enter Squid form in OWN ink and verify Ink recovery becomes clearly faster
5. as Team A, shooting the magenta Target B should reduce Target B HP by about 34 per hit while Target A is ignored; Team B should behave symmetrically
6. three hits should down the enemy QA target, after which it briefly disappears and returns at 100 HP
7. stand on enemy ink and verify HP falls gradually but stops around 60; leaving enemy ink should allow delayed recovery
8. verify T9 Squid Roll / wall swim / Surge and T8 camera / blocker / painting behavior still work

All hosted T10 checks passed on 2026-09-23. T10 is **STABLE FREEZE**.

## T10 final hosted acceptance

User confirmation date: 2026-09-23

Final accepted T10 scope:

- Ink Tank consumption
- dry-fire rejection
- recovery lock
- Human Ink recovery
- OWN-ink Squid fast Ink recovery
- 100 HP combat resource state
- delayed HP regeneration
- non-lethal enemy-ink HP damage
- team-aware enemy-only projectile damage
- QA target 100→66→32→0 behavior
- QA target down / automatic reset
- preserved PaintSurface / blocker nearest-hit behavior
- preserved T8 camera/blocker contracts
- preserved T9 Squid locomotion contracts

Stable T10 gameplay checkpoint:
`b42db91f53ddbed56e1c14c571408d6f68e20871`

Automated implementation workflow:
`35811304576`

T10 is now **STABLE FREEZE**.

## T11 Spawn / Splat / Respawn / Match Loop stable checkpoint

Implementation:
`340f0f81b579d18c9072bdfd48aef77885b374af`
`0cd939c5b681264999f77791b62b5f2b2c755c53`
`037865af7e433499cf2a08c6f973b09131369d1a`

Workflow:
`35812515353`

Automated result:

- Checkout: PASS
- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- Pages deploy: PASS
- hosted runtime QA: **PASS — user confirmed all T11 checks on 2026-09-23**

Architecture validation:

- T0–T10 systems remain the stable substrate
- MatchController owns match/life timers instead of embedding them into PlayerController
- PlayerResources remains the single T10 Ink/HP state owner
- player HP reaching zero is the lifecycle transition source for Splat
- Splat QA only injects damage; it does not bypass the normal HP→Splat detection path
- player render and both physical colliders are disabled while SPLATTED
- respawn resets to Human form, restores Ink/HP, and teleports to team-specific spawn
- projectiles are cleared at Splat, match end, and match restart
- gameplay input/fire is gated by MatchController.playerCanAct
- match timer continues during the respawn period
- Turf result is captured when the match enters ENDED
- Restart Match clears PaintCoordinator/GameplayInk/GPU atlas via the frozen clear path

Hosted QA required before T11 Freeze:

1. reload/restart and verify COUNTDOWN starts near 3.0s; movement and shooting are disabled until PLAYING
2. verify PLAYING begins at about 3:00 and movement/shooting then work normally
3. press Splat QA during PLAYING: HP should reach 0, player should disappear/be non-colliding, Life state should become SPLATTED, and a ~2.5s respawn timer should count down
4. after respawn, player should reappear at the selected team's spawn as Human with 100 HP / 100 Ink and controls restored
5. repeat after switching Team A/B and verify the two teams respawn at opposite Z-side spawn points
6. paint unequal turf, press End Match QA, and verify state ENDED, controls/fire stop, timer is 0:00, and Result reports TEAM A or TEAM B matching turf
7. with equal/near-equal neutral turf, End Match QA should report TIE
8. press Restart Match and verify turf is cleared, resources/targets reset, result becomes '-', splat counters reset, and a new 3s countdown starts
9. sanity-check T10 Ink/HP/combat targets plus T9 Squid movement and T8 paint/camera blockers for regressions

All hosted T11 checks passed on 2026-09-23. T11 is **STABLE FREEZE**.

## T11 final hosted acceptance

User confirmation date: 2026-09-23

Final accepted T11 scope:

- COUNTDOWN / PLAYING / ENDED match states
- 3-second pre-match gate
- 180-second Turf War timer
- ACTIVE / SPLATTED player lifecycle
- HP-zero Splat transition
- splatted render/collider/input suppression
- 2.5-second respawn
- team-specific respawn locations
- Human + 100 HP + 100 Ink respawn reset
- current Turf result resolution with TEAM A / TEAM B / TIE
- Restart Match full QA reset
- projectile cleanup on Splat / match end / restart
- preserved T8–T10 regression behavior

Stable T11 gameplay checkpoint:
`037865af7e433499cf2a08c6f973b09131369d1a`

Automated implementation workflow:
`35812515353`

T11 is now **STABLE FREEZE**.

## T12 CPU / Recast navigation candidate

Implementation:
`f8fced0a205efd5ed09b8470757a6ec2833b7e8f`
`05db5bd5484105d5ca060a40dec5181ea1f033e9`
`2578c83ba50911f7163beef3ce42c8e485ab4254`

Workflow:
`35813586805`

Automated result:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- Pages deploy: PASS
- hosted runtime QA: **PASS — navigation/tactical and combat/lifecycle batches accepted by user on 2026-09-23**

Architecture validation:

- Recast is initialized before T12 navigation APIs are constructed
- Vite excludes `recast-navigation` from dependency pre-bundling per library guidance
- NavMesh input comes from the same T8 StageDefinition solids used by render/physics rather than a hand-maintained second map
- NavMesh generation is performed once at app construction for the current static QA stage
- Crowd simulation uses the existing fixed 60 Hz gameplay step
- seven CPU agents share one Crowd/NavMesh rather than each running independent pathfinding
- tactical decisions are staggered and lower frequency than the 60 Hz movement simulation
- Painter scoring reads authoritative CPU GameplayInk only
- CPU paint enters the existing PaintCoordinator via `PaintEventType.Foot` PaintRequests
- CPU painting does not write directly to GPU or GameplayInk
- T0–T11 human movement / combat / match lifecycle code remains separate and frozen

Hosted QA required for this T12 candidate batch:

1. page loads normally and overlay `Recast` reports `READY` rather than FAILED
2. overlay reports 7 CPU agents and, as Team A, A3/B4; switch to Team B and verify A4/B3
3. during the 3-second COUNTDOWN CPUs stay at their spawn area; once PLAYING begins all seven start moving
4. CPU agents route around the center block / stage solids instead of moving straight through them
5. when several CPUs converge, they visibly separate/avoid rather than permanently stacking at one point
6. CPU movement produces cyan/magenta turf trails and `CPU paint req` rises, while regular player paint remains correct
7. Painter agents should visibly spread toward neutral/enemy areas over time; opposing Skirmishers should tend to pressure the player's vicinity; Anchors should stay biased toward their home half
8. Restart Match clears turf and resets CPU tactical/paint counters and roster positions
9. verify FPS remains acceptably close to the previous build with all seven CPUs active; there should be no runaway dropped-simulation time
10. sanity-check T11 countdown/match/result, T10 Ink/HP/targets, T9 Squid movement, and T8 camera/paint blockers

Expected limitation of this candidate:

- CPU agents currently navigate and paint but do not yet fire weapons, take projectile damage, Splat, or Respawn

T12 remains **IMPLEMENTATION CANDIDATE**.

## T12 hosted navigation/tactical partial acceptance

User confirmation date: 2026-09-23

Accepted:

- Recast runtime initialization
- 7-agent A/B roster balancing
- COUNTDOWN/PLAYING CPU gating
- obstacle-aware Crowd routing
- separation/avoidance
- CPU PaintRequest turf contribution
- role behavior
- Restart Match CPU reset
- performance sanity with all 7 CPUs active
- T8–T11 regression sanity

## T12 CPU combat / lifecycle completion candidate

Implementation:
`1ecc6543d7f5f3f226a3cb0134ff129045ea09ef`

Workflow:
`35814249152`

Automated result:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- Pages deploy: PASS
- hosted runtime QA: **PASS — user confirmed all T12 combat/lifecycle checks on 2026-09-23**

Architecture validation:

- CPU fire intents are generated by CpuAgentSystem but actual projectiles are spawned and simulated by the existing pooled ProjectileSystem
- CPU shots use the same ballistic launch solver as the human shooter
- dynamic CPU/player hit checks are compared against the same nearest world PaintSurface/blocker distance before damage is applied
- human projectiles ignore friendly CPU teammates and can damage enemy CPU agents
- CPU projectiles cannot damage the human when the CPU is on the same team
- CPU projectile damage uses the frozen T10 34-damage standard projectile value
- CPU Splat/Respawn uses the frozen T11 respawn duration
- splatted CPU agents are removed from Recast Crowd so invisible agents do not obstruct navigation
- respawn creates a new Crowd agent at the proper team-side spawn with full HP/Ink
- CPU weapon misses continue into the existing world-hit / PaintRequest pipeline

Hosted QA required before T12 Freeze:

1. during PLAYING, CPU shots should become visible and `CPU shots` should rise; COUNTDOWN/ENDED should not generate ongoing CPU fire
2. enemy CPU shots should lower player HP and increment `CPU→Player hits`; friendly-team CPU shots must not damage the player
3. three standard enemy hits should be capable of splatting the player through the existing T11 HP→SPLATTED→Respawn flow
4. shooting an enemy CPU should reduce its HP; repeated hits should make that CPU disappear/Splat and increment CPU splats
5. roughly 2.5 s later the splatted CPU should reappear near its team spawn with full resources and CPU respawns should increment
6. CPU-vs-CPU fighting should occur when opposing agents meet; `CPU combat hits`, splats, and respawns should rise naturally
7. CPU misses/world impacts should still paint surfaces and must respect stage blockers
8. Restart Match should restore all 7 CPU agents, full resources, and reset CPU combat counters
9. with full 4v4 activity, FPS/dropped-simulation/GPU backlog should remain stable enough for the current QA stage
10. sanity-check T8–T11 behavior again for regressions

All hosted T12 combat/lifecycle checks passed on 2026-09-23. T12 is **STABLE FREEZE**.

## T12 final hosted acceptance

User confirmation date: 2026-09-23

Final accepted T12 scope:

- Recast runtime initialization and NavMesh generation
- shared 60 Hz Detour Crowd for seven CPU agents
- 4v4 roster balancing around the human player's selected team
- obstacle-aware navigation and Crowd separation
- Painter / Skirmisher / Anchor tactical roles
- authoritative GameplayInk-aware CPU turf decisions
- CPU turf contribution through PaintRequest/PaintEvent
- CPU Ink/HP resource simulation
- CPU weapon fire through the shared ProjectileSystem
- human↔CPU and CPU↔CPU projectile damage
- friendly-fire exclusion
- CPU Splat removal from Crowd
- CPU Respawn and Crowd-agent recreation with full HP/Ink
- Restart Match full CPU reset
- current 4v4 performance sanity
- preserved T8–T11 behavior

Stable T12 gameplay checkpoint:
`1ecc6543d7f5f3f226a3cb0134ff129045ea09ef`

Automated implementation workflow:
`35814249152`

T12 is now **STABLE FREEZE**.

## T13 Production Stage contract / HUD / Tactical Map candidate

Implementation:
`936ab4d90c17c0d08920ccf996bfd766535aec59`
`32a0430626034417a0e85a66511e4efb41fd17aa`

Workflow:
`35815754011`

Automated result:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- Pages deploy: PASS
- hosted runtime QA: **PASS — HUD/map and production-stage geometry accepted by user on 2026-09-23**

Architecture validation:

- production-stage metadata is attached to the same StageDefinition used by frozen world systems
- the legacy test-stage export aliases the same production definition rather than creating a second geometry copy
- Tactical Map world projection uses StageDefinition world bounds
- Tactical Map ink is read from CPU-authoritative GameplayInk and never writes gameplay state
- CPU map markers are read-only views of existing T12 agent state
- HUD reads existing T10/T11 stats and Turf snapshots only
- no match, movement, projectile, collision, Recast, Ink, HP, or Splat ownership changed in this batch

Hosted QA required before the T13 production-geometry expansion:

1. page loads normally with `T13 CANDIDATE`; existing 4v4 match starts and plays normally
2. top HUD shows `INKWORKS JUNCTION`, A/B Turf percentages, Turf bar, and a 3:00 match clock that counts down
3. bottom HUD Ink and HP bars follow the existing T10 resource values; changing team changes the Ink/team accent
4. COUNTDOWN shows a large center 3→2→1 message; player Splat shows SPLATTED + respawn countdown; End Match shows the resolved winner/draw
5. compact Tactical Map appears at bottom-right and shows stage solids, A/B spawn rings, human marker, and seven CPU markers
6. cyan/magenta map ink should broadly match the visible world Turf distribution and update while players/CPUs paint
7. player/CPU map markers should move in the same directions/areas as their world counterparts; no north/south or east/west mirroring
8. splatted CPU markers disappear and return after Respawn
9. pressing `M` toggles an expanded map and pressing `M` again returns to compact view without stealing normal movement/fire input
10. HUD/Map must not materially destabilize FPS, dropped simulation, GPU backlog, or the frozen T8–T12 gameplay behaviors

T13 remains **IMPLEMENTATION CANDIDATE** until this presentation/coordinate QA passes.

## T13 presentation / map hosted acceptance

User confirmation date: 2026-09-23

- HUD: PASS
- Tactical Map display/markers/Turf: PASS
- Tactical Map vertical orientation: corrected and PASS
- correction commit: `c5a72770a2b3e7c05d8bca660bbe28bc20099872`

## T13 production-stage geometry candidate

Implementation:
`fc647806c59e43831a978897baa21e359c5305d7`

Workflow:
`35817233372`

Automated result:

- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- Pages deploy: PASS
- hosted runtime QA: **PASS — user confirmed all remaining T13 production-stage checks on 2026-09-23**

Architecture validation:

- Render / Rapier / Recast / PaintSurface / Tactical Map continue to consume the shared StageDefinition
- player spawn positions moved from duplicated GAME_CONFIG values to Stage metadata
- CPU spawn slots and tactical nodes moved to Stage metadata
- the original wall/ramp/upper-platform validation structures remain present
- new cover-top PaintSurfaces each bind to an explicit backing solid
- existing PaintRequest/PaintEvent, gameplay ink, projectile, locomotion, match, and CPU contracts are unchanged

Hosted QA required before T13 Freeze:

1. stage should now be visibly much larger, with broad outer lanes and additional cover while retaining the original ramp/wall/upper structures
2. player Team A/B respawns should occur near opposite far ends of the enlarged stage
3. all seven CPUs should spawn in four-slot team formations near those far ends and navigate the whole enlarged arena
4. CPU Painter/Skirmisher/Anchor behavior should spread into the new outer lanes rather than clustering only in the old 18×14 area
5. new cover boxes must block player/camera/projectiles correctly and CPUs must path around them
6. cover tops should accept visible ink and contribute to Turf scoring
7. wall swim / Surge on the retained wall and ramp/upper-platform traversal should still work
8. Tactical Map should show the enlarged arena, new cover footprint, new spawn positions, Turf, player, and CPU locations with the already-corrected orientation
9. Coordinate Audit should remain PASS and no GPU atlas cross-surface paint mismatch should reappear
10. full 4v4 performance / dropped-simulation / GPU backlog should remain acceptable

All hosted T13 checks passed on 2026-09-23. T13 is **STABLE FREEZE**.

## T13 final hosted acceptance

User confirmation date: 2026-09-23

Final accepted T13 scope:

- production-stage metadata and shared world bounds
- player-facing Turf / match / Ink / HP HUD
- Tactical Map compact/expanded modes
- corrected Tactical Map vertical orientation
- enlarged 32×24m INKWORKS JUNCTION arena
- far-end human and CPU spawn metadata
- StageDefinition-owned CPU spawn slots and tactical nodes
- new outer-lane / mid-lane / junction cover geometry
- new scoreable paintable cover-top surfaces
- preserved wall/ramp/upper-platform validation structures
- shared Render / Rapier / Recast / PaintSurface / Tactical Map coordinate contract
- production-stage 4v4 performance sanity
- preserved T8–T12 behavior

Stable T13 production-stage checkpoint:
`fc647806c59e43831a978897baa21e359c5305d7`

Automated production-stage workflow:
`35817233372`

T13 is now **STABLE FREEZE**.

## T14 first content / animation / audio / weapon candidate

Implementation:
`c65b0ea44271cffea48e5efd8bd1c4e734f8bc1a`
`a628b4c0b85133261b52a0b67d12d14eb83d308f`
`c85ef99f070f74b54d36d18deda01b1ae296b4dd`
`a4fc8f57ce55fff57e7048f8a162ba798ee8e236`
`c819e10783f2aa9e5b29641e367f53fb1dc87c29`

Workflow:
`35818653041`

Automated result:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- Pages deploy: PASS
- hosted runtime QA: **PENDING**

Architecture validation:

- Pulse Sprayer profile directly references the frozen standard projectile / combat / Ink tuning
- Needle SMG and Arc Blaster are separate project-owned WeaponProfiles
- selected weapon changes only human projectile profile; CPU T12 behavior remains on Pulse Sprayer
- all three weapons use the same pooled projectile slots and swept collision logic
- weapon-specific damage participates in the existing nearest world/combat arbitration
- weapon-specific paint radius still creates one PaintRequest and follows the immutable PaintEvent path
- PlayerResources now accepts a per-shot Ink cost while preserving the frozen default cost
- visual feedback uses a bounded 48-entity pool
- Web Audio uses generated oscillators only and requires browser interaction before playback
- procedural character motion is render-only and does not modify physics/collision/navigation authority

Hosted QA required before this T14 batch can be accepted:

1. key 3 selects Pulse Sprayer and its cadence, Ink use, 34-damage behavior, trajectory, and 0.64m-class painting should feel unchanged from T13
2. key 4 selects Needle SMG; it should fire visibly faster with smaller/faster shots, lower damage, smaller paint marks, and lower Ink use per shot
3. key 5 selects Arc Blaster; it should fire much slower with larger/slower shots, 70-damage hits, much larger paint marks, and noticeably higher Ink use
4. ControlPanel selected button, HUD weapon chip, and Debug `Weapon` value should stay synchronized when switching 3/4/5
5. center-crosshair ballistic aiming, walls/cover blockers, friendly-fire rules, CPU hits, and Turf painting must work with every weapon
6. shot and impact visual pulses should appear without leaving permanent entities or obvious runaway FX
7. after the first click/key interaction, weapon switch / firing / impact / Splat / Respawn tones should be audible; no severe crackling or excessive volume stacking
8. Human movement should have subtle visual bob/squash, Squid should visibly pulse/breathe, Squid Roll should retain its 360-degree roll, and CPUs should have subtle movement motion
9. these visual motions must not change collision, movement speed, wall swim, Surge, Splat/Respawn, CPU navigation, or Tactical Map positions
10. full 4v4 play with FX/audio must keep FPS, dropped-simulation time, GPU backlog, and projectile pool behavior acceptable

T14 remains **IMPLEMENTATION CANDIDATE**.

## T14 11-weapon-class hosted QA candidate

Implementation:
`c1b3f5a6219375a9bb01a2aaf9c59d16e9c18914`
`24d384d60fb7937f76a424ff1f5e845cfaeb0f38`
`31f441f13740536ed5ceecde518df879fbef21ef`

Workflow:
`35819670569`

Automated:

- TypeScript: PASS
- production build: PASS
- Pages deploy: PASS

Required hosted QA:

1. Shooter: Pulse/Needle retain automatic fire and existing T14 behavior.
2. Dualies: Twin Comets fire paired shots; RMB causes a short directional dodge without breaking normal Squid Roll.
3. Charger: Rail Charger charges while LMB is held and fires only on release; higher charge visibly increases shot strength.
4. Blaster: Arc Blaster direct hits and nearby blast damage work against enemy CPU/QA targets.
5. Roller: Metro Roller produces a wide swing on press and paints turf under/around the player while LMB is held and the player moves.
6. Brush: Dash Brush repeatedly throws a short, wide fan of ink.
7. Slosher: Wave Slosher follows a visibly arcing trajectory and can attack over low cover.
8. Splatling: Rotor Cannon charges while held and releases a burst whose duration increases with charge.
9. Brella: Canopy Guard fires a spread shot; RMB guard blocks incoming CPU projectile damage while held.
10. Stringer: Chord Stringer releases three shots; higher charge narrows the spread and increases shot strength.
11. Splatana: Ink Saber tap/release creates a fast slash wave; longer hold produces the stronger charged slash.
12. Q/E cycling and all ControlPanel weapon buttons stay synchronized with HUD/Debug weapon class/name.
13. Human/Squid movement, wall swim, Surge, Squid Roll, Splat/Respawn, Turf scoring, CPU navigation, Tactical Map, camera blocking, and immutable PaintEvent flow show no regression.
14. 4v4 performance remains acceptable and projectile pool drops / GPU backlog do not run away.

Do not Freeze T14 until the hosted checks are confirmed.

## T14 weapon-class redesign validation candidate

Supersedes the previous first-pass 11-class behavior after user rejection.

Implementation:
`f017d1e5de8744fc95239ff773a26b531b9c883a`
`4c366282a20cf58a32e698259de8b51686723829`
`bccec88cf6a4898a06305c3e2aad1e016e90d9a4`

Workflow:
`35820796731`

Automated:

- TypeScript: PASS
- production build: PASS
- Pages deploy: PASS

Hosted QA focus:

1. Charger must feel fundamentally different: no visible traveling bullet; hold/release produces an immediate beam/ray and narrow line paint.
2. Roller must not shoot pellets: ground click gives wide horizontal flick, airborne click gives narrower forward vertical flick, holding LMB while moving leaves a continuous roller-width paint trail.
3. Brush must not shoot pellets: repeated short-range swipes should deal close damage, paint a wide fan directly on nearby ground, and visibly allow faster movement while held.
4. Slosher must travel in a strong arc and leave intermittent paint beneath/along the lob path.
5. Splatling must only charge while held and fire the stored rapid burst after release; longer charge should clearly create a longer burst.
6. Brella RMB must show a physical front canopy; front CPU shots are blocked and reduce canopy HP, rear shots are not blocked, and the canopy can break then recover.
7. Stringer must fire three arrows; charge should tighten them and sufficiently charged arrows should produce delayed explosions after impact.
8. Splatana must deal close slash damage/paint even without relying on the traveling wave; longer hold should create a substantially stronger charged slash.
9. Dualies RMB dodge should move the player, then briefly tighten/improve follow-up firing.
10. Blaster explosion must damage enemies near the impact point, not only on exact direct contact.
11. Shooter remains the baseline automatic gun and should now be obviously different from the other ten genres.
12. T8–T13 locomotion, camera, ink authority, match, CPU, stage and Tactical Map behavior must remain intact.

Do not freeze T14 until the user explicitly accepts this redesigned runtime.

## T14 v0.9.3 targeted hosted QA

Implementation:
`72649bc1f896dcb2eff1d73620ec52bceaf0918c`

Workflow:
`35824436471`

Automated:

- TypeScript: PASS
- production build: PASS
- Pages deploy: PASS

Hosted checks:

1. Dualies: select Twin Comets, stay Human, press Space while moving; player must dodge in movement direction rather than jump.
2. Dualies: a second Space input can chain a second dodge before charges recover; Debug `Dualie rolls / charges` must count and reach 0 remaining.
3. Dualies: LMB must not fire during the dodge itself; follow-up fire after the roll is tighter/faster.
4. Charger: hold LMB; dedicated circular precision reticle + 3D beam-guide charge effect must build, with full-charge pulse.
5. Splatling: hold LMB; dedicated rotating charge ring/orbit effect must accelerate/build, distinct from Charger.
6. Stringer: hold LMB; three visual arrows/bars must visibly converge as charge rises.
7. Splatana: hold LMB; dedicated blade-fill/glow effect must build, distinct from the other charge classes.
8. Stringer: release before ~0.50s — arrows should not create delayed explosions.
9. Stringer: release at/after ~0.50s — each landed arrow should leave a visible fuse marker, then explode about 0.75s later with damage/paint.
10. Debug `Stringer fuses / bursts` should increase when the charged arrows land and later explode.
11. Existing Squid Space behavior (jump / Squid Roll / Surge) remains unchanged because Dualies Space interception is Human-only.

Do not freeze T14 until the user confirms these hosted checks.


## T14 v0.9.4 Dualies / Splatling hosted QA

Required hosted checks:
1. Select Twin Comets. Press Space without LMB: no Dualies dodge should start.
2. Hold LMB and press Space while Human: the dodge should start.
3. During the dodge itself, firing remains suppressed.
4. Immediately after the dodge, firing should return before free movement; directional movement should remain briefly locked.
5. While still holding LMB during the post-roll stance, Space can chain the second dodge if a charge remains.
6. After the post-roll lock expires, ordinary Human movement returns.
7. Select Rotor Cannon and hold LMB: its HUD/3D charge should now read visually closer to Charger (centered progress + forward guide) while still retaining subtle rotary identity.
8. Squid Space jump / Squid Roll / Surge remain unchanged.
9. T8–T13 camera, painting authority, match, CPU, stage, HUD/map behavior show no regression.

T14 remains **IMPLEMENTATION CANDIDATE** until these hosted checks pass.
