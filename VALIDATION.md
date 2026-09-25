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

**Historical candidate QA. Dualies input/timing and Splatling presentation checks in this section are superseded by the v0.9.4 section below.**

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
1. Select Twin Comets. Space without LMB, and stationary LMB+Space, must not start a Dualies dodge; both should remain normal jump input.
2. While Human, hold LMB + any WASD movement direction and press Space: the dodge should start in the movement-input direction.
3. The dodge should show the fixed-step phase structure: about 4 frames of startup, about 12 frames of roll movement, then no shooting during the roll itself.
4. About 4 frames after roll movement completes, firing should return while directional movement remains locked for the rest of the post-roll stance.
5. While still holding LMB during the post-roll stance, Space can chain the second dodge if a charge remains.
6. From accepted dodge input to full normal-state / dodge-charge recovery should be about 48 fixed 60 Hz ticks for an unchained standard roll; ordinary Human movement returns at the end of that state.
7. Select Rotor Cannon and hold LMB: its HUD/3D charge should now read visually closer to Charger (centered progress + forward guide) while still retaining subtle rotary identity.
8. Squid Space jump / Squid Roll / Surge remain unchanged.
9. T8–T13 camera, painting authority, match, CPU, stage, HUD/map behavior show no regression.

T14 remains **IMPLEMENTATION CANDIDATE** until these hosted checks pass.


## T14 v0.9.5 two-ring Splatling / Stringer hosted QA

1. Rotor Cannon: hold LMB. The inner/first charge ring should fill first and complete at about 0.80 s; the outer/second ring then fills until about 1.20 s.
2. Rotor Cannon: release below ring 1, at ring 1, and at full charge. Projectile range should grow only up to ring 1; ring 2 should mainly increase burst duration.
3. Rotor Cannon: ring-1 release should produce roughly half the full-charge volley (~18 vs ~36 shots with current project cadence).
4. Chord Stringer: first ring must complete at about 0.50 s; second/full ring at about 1.20 s.
5. Chord Stringer below ring 1: no delayed fuse explosion; the three arrows retain the wide ~8 degree spread.
6. Chord Stringer at ring 1: landed arrows create independent 0.75 s fuses and delayed 30-damage bursts; direct arrow damage has reached its 35-damage stage.
7. Chord Stringer through ring 2: direct arrow damage stays at the ring-1 level while the three-arrow spread visibly converges toward 0, projectile speed/range rises, and paint width grows.
8. Stringer ink consumption should rise with charge: approximately 5 at minimum, 6 at ring 1, 8.5 at full charge from the 100-point project tank.
9. HUD must show two distinct charge circles for Rotor Cannon and Chord Stringer, and Debug must report charge ring 0/2, 1/2, then 2/2.
10. Charger and Splatana charge presentation and behavior must remain unchanged.
11. T0–T13 ink authority, 60 Hz simulation, CPU, camera/aim, match loop, and stage behavior must show no regression.

T14 remains **IMPLEMENTATION CANDIDATE** until the hosted checks above pass.


## T14 Stable Freeze — accepted 2026-09-23

The user confirmed the final v0.9.5 hosted checks, including the two-ring Rotor Cannon / Chord Stringer behavior and the preceding Dualies corrections.

Stable T14 checkpoint:
- commit: `006f9b8ddb4a818ac0ba64a3ec18f30640a07dc4`
- GitHub Actions run #136 / `35830846217`: build + deploy success

T14 is now **STABLE FREEZE**. Future phases must preserve T0–T14 contracts unless a later explicit Freeze-change decision says otherwise.


## T15 v0.10.0 Sub Weapon + Special Gauge hosted QA

Architecture / attribution:
1. Existing main-weapon paint must continue to match CPU gameplay ink and GPU visuals exactly; no U/V or vertical aiming regression.
2. Human main-weapon paint on previously neutral/enemy Scoreable turf must increase Debug `Human scoreable paint` and SPECIAL.
3. Repainting already-owned turf must not materially increase SPECIAL.
4. CPU paint must not increase the human SPECIAL gauge.
5. Coord QA / Roll QA Pad / stress/debug paint must not increase the human SPECIAL gauge.

Pulse Bomb:
6. With at least 70 Ink, press F while playing: one visible Pulse Bomb should launch along the aim direction with a ballistic arc and consume 70 Ink.
7. With less than 70 Ink, F must not throw a bomb.
8. After first contact with stage geometry/PaintSurface, the bomb should remain at the contact point and explode about 1.0 s later.
9. Explosion must paint nearby valid PaintSurfaces, damage enemy CPU/QA targets, and increment Debug `Sub throws / bursts`.
10. Newly changed Scoreable turf painted by Pulse Bomb must contribute to SPECIAL.

Turf Pulse:
11. Paint normally until SPECIAL reaches 100%, or press `Special QA Ready`; HUD should show SPECIAL READY and Debug should report the full gauge.
12. Press G while not ready: nothing activates and the partial gauge is preserved.
13. Press G while ready: Turf Pulse activates once, consumes the gauge to 0, emits radial paint/feedback, damages nearby enemies, and increments `Special uses`.
14. Turf Pulse's own SPECIAL-source paint must not refill the gauge during the same tick.
15. Build a partial gauge, use Splat QA, and verify the gauge is reduced to about 50%; after Respawn the retained amount remains.
16. Restart Match and Clear Ink must reset the gauge to 0 and clear active Pulse Bombs.

Regression:
17. Brella RMB guard remains functional.
18. Dualies LMB + movement + Space dodge remains functional.
19. Charger/Splatling/Stringer/Splatana charge behavior, including T14 two-ring charge, remains unchanged.
20. 4v4 CPU, match timer/respawn, tactical map, FPS/dropped sim, projectile pool, GPU ink backlog, and T0–T14 Freeze behavior remain acceptable.

T15 remains **IMPLEMENTATION CANDIDATE** until these hosted checks pass.


## T15 Stable Freeze — accepted 2026-09-23

The user confirmed the v0.10.0 hosted checks. Stable checkpoint: `901b8c73f5313ac39c27ebb0fc42cb3ec1810bda`. GitHub Actions run #165 / `35832485527` passed build and Pages deployment.

T15 is now **STABLE FREEZE**.


## T16 v0.11.0 Weapon Kit System hosted QA

Kit switching:
1. Cycle Q/E through multiple mains; HUD and ControlPanel must update both F sub and G special names with the main weapon.
2. Build a partial special gauge, switch between a 180p/190p/200p kit, and verify the displayed percentage stays approximately constant.
3. Throw a sub or activate a sustained special, then switch main weapon; active old-kit effects should be cleared for deterministic QA.

Sub weapons:
4. Pulse Sprayer: F must use Pulse Bomb, cost 70 Ink, stop on first contact, then explode about 1.0 s later.
5. Needle SMG or Twin Comets: F must use Snap Bomb, cost 45 Ink, and explode immediately on first contact with a visibly smaller paint/damage footprint.
6. Rail Charger / Metro Roller / Rotor Cannon / Canopy Guard: F must use Anchor Bomb, cost 70 Ink, remain at first contact, then explode about 2.0 s later with the largest paint footprint.
7. All sub paint must stay HUMAN-source: genuinely changed Scoreable turf may charge the gauge, repainting owned turf should not materially charge it.
8. Insufficient Ink must prevent the selected sub from being thrown.

Special weapons:
9. Pulse Sprayer kit: Special QA Ready then G -> Turf Pulse should fire immediately around the player and consume the gauge.
10. Rail Charger or Arc Blaster kit: Special QA Ready then G -> Triple Strike should produce three staggered strikes around the current aim target, not around the player.
11. Needle SMG / Dash Brush / Wave Slosher / Canopy Guard: Special QA Ready then G -> Drift Storm should move forward for several seconds and create repeated paint/damage pulses.
12. Triple Strike and Drift Storm paint must be SPECIAL-source and must not refill the gauge.
13. Special uses must increment once per G activation, not once per strike/pulse.

Regression:
14. T15 Splat retention remains about 50% and Respawn preserves the retained gauge.
15. T14 main-weapon behavior, including Dualies dodge and two-ring Splatling/Stringer charge, is unchanged.
16. Brella RMB guard is unchanged even though F now selects its Anchor Bomb.
17. CPU paint must not charge the player special.
18. CPU/main/sub/special paint continues through PaintCoordinator -> one immutable PaintEvent -> GameplayInk + GpuInk.
19. camera/aim vertical direction, Turf scoring, match loop, 4v4 CPU, tactical map, and fixed 60 Hz behavior must show no regression.
20. FPS, dropped simulation, GPU backlog, and projectile/sub pools remain acceptable during Drift Storm + ordinary 4v4 activity.

T16 remains **IMPLEMENTATION CANDIDATE** until the checks above are accepted.


## T16 Stable Freeze — accepted 2026-09-23

The user confirmed the v0.11.0 hosted checks. Stable checkpoint: `958a1d168ea86387701eb089437bf6da6af14514`. GitHub Actions run #184 / `35833765947` passed build and Pages deployment.

T16 is now **STABLE FREEZE**. Future phases must preserve the per-main-weapon kit assignments and T15 paint-source/special-gauge contracts unless an explicit later Freeze-change decision is made.


## T17 v0.12.0 Super Jump hosted QA

Map selection:
1. During PLAYING, press M. The tactical map should expand and Pointer Lock should release.
2. Friendly alive CPUs and your own spawn should show selectable jump rings; enemies must not be valid targets.
3. Click a valid friendly CPU. The map should close, Pointer Lock should return, and HUD/Debug should enter PREP (or WAIT_GROUND first if airborne).

Phase behavior:
4. During PREP, movement/fire/sub/special should be locked but enemy shots and Splat QA should still be able to damage/splat the player.
5. After about 80 frames, the player should launch on a high arc. During TRAVEL and the final LANDING/approach phase, enemy projectiles, enemy-ink resource damage, and Splat QA must not damage the player.
6. The airborne trip should take the same amount of time for a nearby ally and a distant spawn/ally.
7. The jump should pass through/over stage blockers instead of being stopped by Rapier collision.
8. The landing marker should remain visible at the destination until landing.

Targets / lifecycle:
9. Jump to your own spawn and confirm landing at the correct team spawn.
10. Jump to a living friendly CPU and confirm the landing destination stays at the CPU position captured when you clicked it, even if that CPU moves away afterward.
11. If a jump is selected while airborne, HUD should show WAIT_GROUND and the preparation should begin after the player reaches valid ground.
12. Starting from an OWN-painted wall-swim state should allow preparation without forcing a fall first.
13. On actual landing, ordinary movement/fire should resume and the player should be back on the normal PlayerController collider/render.
14. Splat/Respawn, Restart Match, team switch, weapon switch, or match end must not leave an orphan traveler/landing marker or disabled player collider.

Regression:
15. Dualies fire+move+Space dodge, Squid Roll, wall swim, Surge, and T14 two-ring charge must remain unchanged outside Super Jump.
16. T16 F/G weapon kits and special-gauge behavior must remain unchanged.
17. CPU targeting/combat should target the player during PREP, ignore the player while airborne, and resume after landing.
18. camera aim direction, CPU/GPU ink alignment, Turf scoring, 4v4 CPU, tactical map orientation, and fixed 60 Hz simulation must show no regression.
19. FPS / dropped simulation / GPU backlog should remain acceptable during repeated jumps.

T17 remains **IMPLEMENTATION CANDIDATE** until these hosted checks pass.


## T17 Stable Freeze — accepted 2026-09-23

The user confirmed the final v0.12.0 hosted checks, including snapshot-based friendly CPU destinations.

Stable checkpoint:
- commit: `38836bcf73f03b7623eb09e7a41436b83027ab76`
- GitHub Actions run #222 / `35841633285`: TypeScript check, production build, and Pages deploy success

T17 is now **STABLE FREEZE**. Future phases must preserve the map-selection, destination-snapshot, vulnerability, phase-timing, and cleanup contracts unless an explicit later Freeze-change decision is made.


## T18 v0.13.0 CPU Tactical Mobility hosted QA

Forced-path QA:
1. Start a normal match and press `CPU Jump QA`.
2. Debug `CPU jump prep / air` should show one PREP CPU, then one airborne CPU.
3. A team-colored landing marker should appear at the fixed destination.
4. After about 80F PREP, that CPU should leave the ground, follow a high arc for the frozen 130F + 30F airborne phases, then land.
5. Debug `CPU jumps / landings` should increment once and `CPU last jump` should show a source->target pair.
6. The destination must remain fixed after the jump decision even if the selected friendly target moves.

Vulnerability / combat:
7. During CPU PREP, the CPU must remain hittable and may be splatted.
8. During CPU JUMP_TRAVEL / JUMP_LANDING, projectiles and area-damage specials/subs must not damage that CPU.
9. CPU must not fire or issue CPU paint requests while PREP or airborne.
10. After landing, its normal firing, painting, and Recast pathing must resume.

Natural tactical behavior:
11. Splat a CPU and allow it to respawn while a safe teammate is well ahead; within the short respawn recovery window, a forward CPU jump may occur.
12. A destination with an enemy within roughly 4.2 m must not be chosen by normal tactical logic.
13. A CPU with less than about 72 HP must not start a normal tactical Super Jump.
14. CPUs close to teammates should continue ordinary Recast movement rather than repeatedly jumping.
15. After a landing, the same CPU should respect the ~8 s jump cooldown.
16. ANCHOR should jump less aggressively than SKIRMISHER under comparable conditions.

Lifecycle / regression:
17. If a PREP CPU is splatted, its marker/jump state must clear and ordinary respawn must still work.
18. End Match / Restart Match / team switch must leave no airborne CPU or orphan CPU landing marker.
19. Human T17 Super Jump must remain unchanged, including map click selection and snapshot-at-selection ally destinations.
20. T16 sub/special kits, T14 weapon behavior, CPU combat, Turf scoring, tactical map orientation, and T0–T17 ink authority must show no regression.
21. Full 4v4 activity plus one or more CPU jumps should keep FPS / dropped sim / GPU backlog acceptable.

T18 remains **IMPLEMENTATION CANDIDATE** until these checks are accepted.


## T18 Stable Freeze — accepted 2026-09-23

The user confirmed the v0.13.0 hosted checks, including forced CPU jump QA, preparation/airborne phase behavior, landing recovery, and no observed regressions.

Stable checkpoint:
- commit: `1a097015a8217ef4fcea8689e1a5de4cf8b71b42`
- GitHub Actions run #243 / `35843150398`: TypeScript check, production build, and Pages deploy success

T18 is now **STABLE FREEZE**. Future phases must preserve the CPU jump state-machine timing, snapshot-destination semantics, PREP vulnerability, airborne invulnerability, Recast remove/re-register lifecycle, and tactical decision boundaries unless an explicit later Freeze-change decision is made.


## T19A v0.14.0 CPU Main-Weapon Diversity hosted QA

Roster / identity:
1. Start a match and confirm Debug CPU loadouts lists multiple weapon short names rather than seven Pulse Sprayers.
2. Tactical Map CPU labels should show id + weapon, such as NEEDLE / DUAL / SLOSH / BLAST / SPIN; switch human team once to expose the opposite team's slot-4 anchor weapon.
3. CPU role counts and A/B roster counts must remain the same as the frozen T12/T18 baseline.

Weapon-class behavior:
4. Needle SMG should visibly fire faster/smaller shots than Pulse Sprayer.
5. Twin Comets should fire paired projectiles rather than one generic shot.
6. Arc Blaster should produce its frozen blast-area paint/damage on impact; being near an enemy CPU Blaster blast should damage the human even without a direct body hit.
7. Wave Slosher should visibly use a heavier lob/high-gravity path and trail paint rather than a straight shooter path.
8. Rotor Cannon should spend time charging, then emit an obvious multi-shot burst; Debug CPU charge/burst should reflect this.
9. Switch human team so the opposing CPU roster includes Rail Charger. It should charge before emitting a direct beam/ray rather than repeated projectile shots.
10. Stage cover must block Rail Charger direct rays. Human Brella guard facing the Charger should absorb a guarded ray instead of HP damage.

Resources / lifecycle:
11. CPU Ink should fall according to each weapon profile and recover through the frozen CPU Ink rules.
12. A charging/bursting CPU that begins T18 Super Jump must clear its weapon state and must not resume a stale pre-jump burst after landing.
13. Splat / Respawn / Match End / Restart must clear charge/burst state without breaking CPU lifecycle.
14. CPU weapon impact paint must remain CPU-source and must not charge the human special gauge.

Regression / performance:
15. Human T14/T16 weapon behavior must be unchanged.
16. T18 CPU Super Jump behavior must remain unchanged.
17. CPU-vs-CPU and CPU-vs-human splat/respawn combat must still work with mixed weapons.
18. FPS, dropped simulation, projectile pool drops, and GPU backlog should remain acceptable with Rotor burst + ordinary 4v4 activity.
19. Camera/aim, CPU/GPU ink alignment, Turf scoring, Tactical Map orientation, and fixed 60 Hz simulation must show no regression.

T19A remains **IMPLEMENTATION CANDIDATE** until these checks pass.


## T19A Stable Freeze — accepted 2026-09-23

The user confirmed the v0.14.0 hosted checks for CPU loadout diversity and class-specific behavior.

Stable checkpoint:
- commit: `034ee78fa3e25705332a40d2456ac5ebf90b79d4`
- GitHub Actions run #266 / `35847641772`: TypeScript check, production build, and Pages deploy success

T19A is now **STABLE FREEZE**. Future work must preserve the accepted CPU Shooter / Dualies / Blaster / Slosher / Charger / Splatling behavior, per-profile Ink/cadence rules, Brella interactions, charge/burst lifecycle cleanup, and T0–T18 authority boundaries unless an explicit later Freeze-change decision is made.


## T19B v0.15.0 CPU Advanced Main-Weapon Class Parity hosted QA

Setup:
1. Start a match and press `CPU Advanced QA` once.
2. Debug `CPU advanced QA` should show `advanced-5`.
3. Debug / Tactical Map should expose ROLLER, BRUSH, BRELLA, STRING, and SABER among the first five CPU agents.
4. Restart Match after testing and confirm the accepted T19A normal loadout returns.

Roller / Brush:
5. Roller should approach a nearby enemy, lay a broad CPU-colored rolling trail at close contact, and deal contact damage.
6. At slightly longer close range, Roller should create a wide horizontal flick paint fan rather than shooter bullets.
7. Brush should actively close short gaps and repeatedly use fast melee swipes with a smaller five-point paint fan.
8. Roller/Brush paint must not increase the human Special gauge.

Brella:
9. Brella should fire a visible six-pellet spread.
10. After firing or while low on HP, a team-colored guard panel should appear in front of the Brella CPU.
11. Shoot the guard from the front: Debug `CPU guard / blocks` should increment and CPU HP should not take the blocked damage.
12. Break the 100-HP guard and confirm it drops for about 2.5 s before recovering.
13. Attack from behind while it guards and confirm body damage is not incorrectly blocked.
14. Human Charger and area-damage attacks should also respect the CPU guard direction.

Stringer:
15. At nearer valid range, Stringer should charge to first ring then release three shots with delayed explosions.
16. At long range, Stringer should visibly charge longer to full and release a tighter three-shot group.
17. Delayed bursts should occur about 0.75 s after impact and paint/damage as CPU-source effects.
18. Debug CPU charge count should reflect Stringer while charging.

Splatana:
19. At medium range, Ink Saber should perform a quick slash plus ranged wave.
20. At very close range, it should charge longer and use the stronger charged slash plus larger paint path/wave.
21. The melee slash and ranged wave should both be able to participate in CPU-vs-human / CPU-vs-CPU combat.

Lifecycle / regression:
22. Trigger CPU Jump QA while an advanced CPU is charging/guarding; weapon transient state must clear during jump and resume cleanly after landing.
23. Splat / Respawn / Match End / Restart must leave no stale guard, charge, burst, or advanced effect.
24. T19A Shooter / Dualies / Blaster / Slosher / Charger / Splatling behavior must remain unchanged.
25. Human T14/T16 weapon and kit behavior must remain unchanged.
26. T18 CPU Super Jump and T0–T19A paint/match authority must remain unchanged.
27. Mixed 4v4 combat should keep FPS / dropped simulation / projectile pool drops / GPU backlog acceptable.

T19B remains **IMPLEMENTATION CANDIDATE** until these checks pass.


## T19B Stable Freeze — accepted 2026-09-23

The user confirmed the v0.15.0 hosted checks for CPU Roller / Brush / Brella / Stringer / Splatana behavior and reported no observed problems.

Stable checkpoint:
- commit: `d2b0b01fba9d547686399f58e3347e21f247ef38`
- GitHub Actions run #287 / `35867101317`: TypeScript check, production build, and Pages deploy success

T19B is now **STABLE FREEZE**. Future work must preserve the accepted advanced main-weapon behavior, CPU Brella guard contracts, CPU-source advanced paint, T19A default roster, and T0–T19A authority boundaries unless an explicit later Freeze-change decision is made.


## T19C v0.16.0 CPU Sub / Special Kit Parity hosted QA

### Fast acceptance path
1. Start a normal match. Debug `CPU kits` must show each CPU's T16 Sub/Special pair and `CPU scoreable paint` should rise as CPUs capture new turf.
2. Let the match run briefly. `CPU sub / special uses` should show Sub use; visible CPU bombs must match Pulse / Snap / Anchor behavior rather than one generic bomb.
3. Press `CPU Kit QA Ready`. `CPU special ready / avg` should immediately show ready CPUs / 100% average before tactical activation begins.
4. Continue combat and confirm all three Special types can appear across the roster:
   - Turf Pulse centered on the CPU
   - three staggered Triple Strikes at a fixed target area
   - forward-moving Drift Storm
5. After a CPU Special fires, its own Special paint must not immediately refill that CPU. Average / per-CPU % should restart near 0 and only rise again as CPU main/Sub paint captures new scoreable cells.
6. Use `CPU Advanced QA`, then `CPU Kit QA Ready`. Active old kit effects must clear and the five advanced weapons must use their T16-assigned kits.
7. Run `CPU Jump QA` during the same match. Airborne CPU must not start a new Sub/Special, while already-active Special effects may continue until normal completion.
8. Splat CPUs during Triple Strike / Drift Storm. Remaining active effect from that source must cancel; already-thrown CPU Bombs must remain and may still explode.
9. Test enemy CPU Bomb/Special damage against the Human Canopy Guard and during Human Super Jump; guard direction / jump invulnerability must still apply.
10. Press `Clear Ink`, `End Match QA`, then `Restart Match` in separate checks. No stale CPU bomb, storm, strike, ready gauge, or QA loadout may survive the relevant reset.

### Detailed regression checks
11. T19A Shooter / Dualies / Blaster / Slosher / Charger / Splatling CPU behavior remains unchanged.
12. T19B Roller / Brush / Brella / Stringer / Splatana CPU behavior remains unchanged.
13. Human F/G Sub/Special behavior remains unchanged for all 12 main weapons.
14. CPU Sub paint can charge its source CPU Special gauge; CPU Special paint cannot.
15. CPU paint never changes the Human Special gauge.
16. CPU Splat retains 50% Special points; a lingering Bomb may add new points afterward if it captures new scoreable turf.
17. Team change rebuilds CPU roster and kit state from the frozen T16 WeaponKitCatalog.
18. Tactical Map orientation, Human camera/aim, CPU/GPU paint alignment, Turf scoring, and fixed 60 Hz simulation show no regression.
19. During mixed 4v4 main/Sub/Special activity, FPS, dropped simulation, projectile pool drops, CPU kit pool drops, and GPU backlog remain acceptable.
20. Debug `CPU kits` must remain consistent with the current CPU main-weapon ids; no duplicate or independent CPU-only kit map may appear.

T19C remains **IMPLEMENTATION CANDIDATE** until these checks are accepted.


### T19C cross-debug additions

- CPU Sub pool exhaustion is transactional: if the CPU bomb runtime rejects a Sub request because all slots are occupied, the source CPU receives its Sub Ink back, the normal Sub cooldown is rolled back to a short retry delay, and the successful-use counter is corrected. `CPU kit pool drops` still records the overload event.
- CPU Special activation is deferred from request intake to `CpuKitSystem.fixedUpdate()`, which runs after `ProjectileSystem.fixedUpdate()` in the same 60 Hz tick. This ensures Turf Pulse and the initial state of other CPU Specials use the current Human position, Super Jump invulnerability, and Brella guard context rather than the previous tick's values.
- These fixes are T19C-only and do not alter the frozen T19A/T19B main-weapon runtime.


## T19C Stable Freeze — accepted 2026-09-24

The user completed the hosted v0.16.0 acceptance path and reported no observed problems after the large T19C implementation and cross-system debug pass.

Stable implementation checkpoint:
- commit: `c1807e5c70c7869d346ce1fa6ed0a5def31c59f9`
- GitHub Actions run #335 / `35979800671`: TypeScript check, production build, and Pages deploy success
- final candidate documentation HEAD before Freeze: `11b3bd584d80715a41f251529b06729461fa6233`
- run #338 / `35980005463`: success

T19C is now **STABLE FREEZE**. Future work must preserve CPU kit assignment authority, actual-paint Special charging, Special self-charge prevention, CPU Sub/Special lifecycle semantics, and the T0–T19B frozen contracts unless a later explicit Freeze-change decision is made.


## T20 v0.17.0 Game Mode Foundation + Splat Zones candidate validation

### Automated / structural checks
- T0–T19C base: `d34c46953b38d9ad7244d19054b0c6c56c4a08c4`
- candidate implementation checkpoint: `4c856e871dd491e4217659d8e47320def1930df9`
- PR: #3
- TypeScript check: PASS after widening the new zone counter fields from literal config types to mutable numeric runtime state
- deterministic rule tests: PASS
- production build: PASS
- PR-only Pages deployment is intentionally skipped; only `main` may deploy the hosted build
- changed systems do not replace PaintCoordinator, GameplayInk, GPU atlas, PlayerController, ProjectileSystem, Human weapon runtimes, CPU weapon/kit runtimes, or Super Jump contracts

### T20 cross-debug automated follow-up

- initial T20 main merge: `61ab9aa492595468973141572179753c38115fe4`
- main run #352 / `35983355005`: TypeScript check, unit tests, build, deploy PASS
- rule-fidelity / visual follow-up head: `a3a6153010579b71db10a99a84e2e58d7fa1a66d`
- PR #4 run #354 / `35986533331`: TypeScript check, unit tests, build PASS; PR deploy skipped as intended
- unit tests now cover 70% capture, 50% project-tuned opposing-coverage neutralization, 36-frame count pace, 0.75 penalty examples, recent-loss overtime grace, winning-team retake, overtime-team overtake, and 5-minute overtime cap
- in-world objective visualization is render-only and does not create or mutate gameplay ink
- Clear Ink QA now resets the T20 objective state together with authoritative ink so stale zone control/penalty cannot survive a debug clear
- Tactical Map draws the objective after ink to preserve visibility

### Hosted Pages acceptance path
1. Default launch must still be Turf War. Confirm countdown, ordinary 4v4 play, Turf percentages, Splat/Respawn, Sub/Special, and match result still behave as before.
2. Select **Splat Zones**. Match must restart cleanly with a 5:00 timer, 100 / 100 counters, neutral central zone, and no stale Sub/Special/Super Jump state.
3. In Splat Zones, a bright four-edge objective outline must be visible on the main-floor in the 3D world. It must be neutral when uncontrolled and change to Cyan/Magenta with control. It must disappear again in Turf War.
4. Open the Tactical Map with M. The central objective rectangle must align with the 3D outline and remain visible above map ink, using the accepted T13 orientation.
5. Paint the central zone. HUD/debug percentages must follow authoritative ink. From neutral, control should require about 70% own coverage; while controlled, the zone should neutralize when opposing coverage reaches the project-tuned 50% threshold.
6. During a clean uninterrupted hold, the 100-count clock should take about 60 seconds to reach zero. Only the controlling team's count may fall.
7. Neutralizing a zone must stop the count without immediately adding a new penalty. If the opposing team subsequently takes control, the former controller receives a progress-based penalty; on retake, penalty counts down before the main count resumes.
8. CPUs in Splat Zones must visibly converge around the objective according to PAINTER / SKIRMISHER / ANCHOR roles without losing their T19 weapon-class or T19C kit identities.
9. Use normal combat plus CPU Kit QA / CPU Advanced QA / CPU Jump QA during Splat Zones. Main weapons, Subs, Specials, guard, jump invulnerability, and CPU Super Jump must remain functional.
10. Use Clear Ink once during Splat Zones. The objective must return to a clean neutral 100/100 state without stale penalty/control while the rest of the T19C cleanup contract remains intact.
11. Switch back to Turf War and restart. Zone counters/control and the 3D outline must leave the active mode, and Turf War must again resolve from global scoreable turf percentage.
12. Run mixed 4v4 combat long enough to check FPS, dropped simulation, projectile/kit pool drops, dirty tiles, and GPU backlog for a regression.
13. Report any mismatch before T20 Freeze. Do not Freeze solely from automated checks.

T20 remains **IMPLEMENTATION CANDIDATE** until these hosted checks are accepted.


## T21-A Undertow Spillway Evidence Freeze / Measurement Ledger

Branch: `codex/t21-undertow-evidence-ledger`
Base main: `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`

Automated scope:
- evidence IDs are unique and every non-UNKNOWN fact cites evidence
- unresolved XZ remains UNKNOWN
- UNKNOWN Y cannot expose an exact numeric value
- center reference Y=0 is CONFIRMED
- working 20px/m scale remains HIGH
- whole-stage ~146x87m remains PROVISIONAL
- Team A/B first descents are CONFIRMED `ONE_WAY_DROP`
- first-drop 1.5m/3m magnitudes remain PROVISIONAL candidates
- spawn absolute Y remains UNKNOWN
- upper glass is explicit UNINKABLE + GLASS gameplay geometry
- Splat Zones objective count is recorded as two
- Tower/Rainmaker/Clams geometry differences remain rule-variant facts

This batch intentionally changes no runtime geometry, collision, paint authority, CPU traversal, objective scoring, or UI. Hosted gameplay QA is therefore not required for T21-A itself; PR CI must pass typecheck, Vitest, and production build before the ledger is accepted as the input to T21-B/C.


## T21-B / T21-C automated calibration checks

The branch now validates the measured Turf-map frame in addition to the T21-A evidence ledger.

Expected checks:
- 3508 x 2482 source-map frame is explicit
- measured origin maps exactly to project X=0, Z=0
- spawn-pixel distance converts to ~134.413 m at 20 px/m
- both spawn centers project to the same X axis within millimetric rounding
- negative/positive spawn Z values are approximately -67.262 / +67.150 m
- origin differs from spawn midpoint by <0.06 m
- 180-degree spawn symmetry residual is <0.12 m
- pixel -> metric -> pixel round-trip is deterministic
- ~87 m X / ~146 m Z whole-stage bounds remain PROVISIONAL
- blockout rejects PROVISIONAL/UNKNOWN exact Y
- Stable Freeze rejects HIGH as well as PROVISIONAL/UNKNOWN Y

Runtime production geometry, collision, paint authority, Recast traversal, T20 scoring, weapons, and Super Jump remain unchanged by this checkpoint.


## T21-C vertical-constraint automated checks

New deterministic coverage verifies:
- HIGH exact vertical relations propagate for BLOCKOUT only
- HIGH relations do not enter STABLE_FREEZE
- an unseeded HIGH relation cannot invent an absolute Y
- contradictory exact constraints are reported
- center-low Y=0 resolves center small-step to 1.5m at blockout level
- glass-top absolute Y stays unresolved while its lower reference floor is unknown
- spawn and first-drop landing absolute Y stay unresolved
- first-drop 1.5m / 3.0m remains a PROVISIONAL candidate pair rather than an exact delta
- +4.5 to +6.0m upper band and +4.5m raised-platform candidate remain PROVISIONAL

No runtime stage geometry or traversal changes are introduced by this checkpoint.


## T21-B vector-source validation

The recovered user Turf archive adds an independent vector-source validation layer.

Expected deterministic checks:
- vector page is bound to the matching 3508 x 2482 Turf JPEG
- project vector scale remains 4.8 pt/m HIGH
- vector spawn-ring centers produce ~134.190 m separation
- source origin differs from the spawn midpoint by <0.03 m
- Team A/B first-drop lips are HIGH POLYLINE XZ measurements
- each first-drop lip has 15.25 m plan length
- first-drop pair 180-degree residual is <0.03 m
- first-drop Y remains the PROVISIONAL [1.5, 3.0] m candidate pair
- both mapped cyan water regions are CONFIRMED polygons
- each mapped water polygon has ~33.004 m² plan area
- mapped-water pair symmetry residual is <0.03 m
- raw large spawn-side source faces are preserved as raw plan geometry and never promoted to one flat floor
- trace-completeness reports 5 / 18 requirements measured
- broader playable/fall-out boundaries, glass, slopes, grate, center floor and spawn-floor polygons remain UNTRACED

No hosted runtime QA is required for this vector-source checkpoint because production geometry/collision/navigation is still untouched. TypeScript, Vitest, and production build must pass.


## T21-B central semantic-binding validation

Deterministic coverage now checks:

- glass overhang pair plan area ~62.796m² each
- glass overhang 180-degree residual <0.03m
- glass is HIGH exact XZ + CONFIRMED GLASS/UNINKABLE
- glass internal slope markers remain distinct from the hard outline
- vertical reconstruction no longer treats the whole glass footprint as one flat Y
- center-left/right slope marker centers are approximately X=-9.805/+9.805m, Z≈0
- center slope marker pair residual <0.03m
- marker envelopes cannot be used as collision footprints
- grate pair plan area ~30.441m² each
- grate pair residual <0.03m
- grate XZ is HIGH; GRATE/UNINKABLE semantics are CONFIRMED; WATER is absent
- right-side second-drop pair has 16.90m plan length and <0.04m symmetry residual
- second-drop XZ is HIGH and vertical delta remains -1.5m HIGH
- center-small-step XZ is still UNRESOLVED
- common trace coverage is 8/18
- T21-D readiness stays false while critical XZ/Y evidence is missing
- confirmed center-low Y=0 does not bypass the missing center-low XZ-outline requirement

Production StageDefinition, Rapier, GameplayInk, GPU ink, Recast runtime, combat, Super Jump and T20 objectives remain untouched.


## T21-B center/outer-vector validation

Latest deterministic checks additionally require:
- PDF vector coordinates declare TOP_LEFT origin and +Y DOWN
- glass/source coordinates remain in that convention without a hidden Y flip
- common outer boundary has 42 vertices
- outer-boundary area is ~8970.464m² under the HIGH project transform
- outer-boundary 180-degree residual is <0.03m
- outer spans are ~98.798m X / ~156.528m Z and HIGH, replacing the old provisional 87/146 envelope
- center-low exact XZ polygon is present, ~28.830m², while Y=0 remains CONFIRMED
- both central small-step polygons are present, ~4.650m² each
- step-strip symmetry residual is <0.03m
- both step transitions retain +1.5m HIGH vertical relation
- central slope dash centers use the refined vector coordinates near (-9.909,+0.354) / (+9.931,-0.365)
- trace coverage is 11/18
- outer-boundary completion does not automatically complete the internal fall-out/void kill-boundary requirement

T21-D must remain blocked until the remaining required XZ and vertical constraints are resolved.


## T21-B/C slope-footprint and readiness validation

Latest deterministic coverage additionally verifies:
- exact center slope dash rectangles are [393.6,312.36,409.44,369.84] and [432.48,225.36,448.32,282.84] in top-left PDF coordinates
- each central slope semantic footprint is ~39.5175m²
- both slope XZ entries are HIGH POLYGON measurements
- slope transition kind remains SLOPE while endpoint Y stays UNKNOWN
- T21-B trace coverage is 13/18
- T21-D vertical readiness runs through the BLOCKOUT constraint resolver
- center-small-step-top resolves to Y=1.5 and is not reported unresolved
- glass lower/high reference remain unresolved without an absolute lower seed
- all four central slope endpoint Y nodes remain unresolved without a seed
- both grate Y nodes remain unresolved without a seed
- counterpart slope/grate symmetry relations alone cannot manufacture an absolute Y

The gate must remain false until the remaining XZ and vertical blockers are resolved.


## T21-B spawn-terrain and source-limit validation

Automated coverage now additionally requires:
- both spawn-side connected terrain envelopes are HIGH polygons
- each spawn region remains vertically UNKNOWN as a whole and explicitly warns against flat-floor use
- trace gate uses `team-a/b-spawn-terrain-outline` rather than the misleading flat-floor name
- common trace coverage is 15/18
- right-low floor partition stays unresolved because the relevant hard edges border the same two connected source faces
- under-glass walkable outline stays unresolved because no independent lower-layer polygon exists in the vector source
- internal void classification stays unresolved where top-down overlap is ambiguous
- the source-topology audit reports exactly those three unresolved vector-topology limits

T21-D readiness must remain false until those geometry limits and the outstanding vertical constraints are resolved.


## T21-C center-side slope endpoint validation

Automated checks now require:
- center-left/right main dash regions use `SLOPE_SEMANTIC_FOOTPRINT`
- glass internal dash fields remain `MARKER_ENVELOPE_ONLY`
- BLOCKOUT constraint resolution produces Y=1.5m for both center-side slope endpoints
- both far/high slope endpoints remain unresolved
- Stable Freeze still accepts only independently CONFIRMED exact values


## T21 final evidence-gap validation

Automated tests now verify that the additional-evidence plan contains exactly three targets matching the unresolved source-topology audit:
- RIGHT_LOW_PARTITION
- GLASS_UNDERPASS_CLEARANCE
- INTERNAL_VOID_CLASSIFICATION

The plan must not request already-resolved spawn terrain, mapped water, upper-glass outline, or first-drop geometry, and captures must include plan-registration landmarks before they can promote XZ evidence.


## T21 2026-09-25 capture integration validation

Automated checks now verify:
- both targeted 2026-09-25 files are represented as CONFIRMED user capture evidence
- right-low and underpass entries cite those captures but retain UNRESOLVED XZ until plan registration
- first-drop landing -> right-small-drop upper is a 0m HIGH relation
- right-low -> covered-underpass floor is a 0m HIGH relation
- right-small-drop upper remains 1.5m above right-low
- these relations do not manufacture absolute Y without a seed
- captured topology records a same-level underpass connection, a 1.5m small drop, and a visible ramp exit
- underpass support/wall exclusions remain explicit
- RIGHT_LOW_PARTITION and GLASS_UNDERPASS_CLEARANCE are CAPTURE_RECEIVED
- only INTERNAL_VOID_CLASSIFICATION remains NOT_YET_CAPTURED
- future capture requests require marked-map annotations rather than prose-only directions

T21-D remains gated while exact plan registration and outstanding vertical seeds are unresolved.


## T21 targeted-capture plan-registration validation

Automated checks now additionally require:
- right-low capture is bound to the measured Team A right-small-drop lip
- underpass capture is bound beneath the measured positive-Z glass-overhang footprint
- every plan-registration anchor references an existing vector trace
- both registrations remain PLAN_REGISTERED_POLYGON_UNRESOLVED
- neither registration may promote a trace to blockout geometry
- source-topology audit keeps right-low and underpass unsafe for blockout
- common trace coverage remains 15/18 rather than being inflated from perspective-only geometry
- UndertowSpillwayBlockoutGate remains false

GitHub Actions run #496 passed TypeScript check, Unit tests, production build, Pages configuration and Pages artifact upload for the first plan-registration implementation. No hosted gameplay QA is required because runtime StageDefinition/collision/navigation remains untouched.


## T21 internal-void ambiguity audit validation

Automated checks now additionally verify:
- both current central undercut regions are retained as HIGH traversable lower-layer topology rather than kill voids
- the received right-low/underpass connection remains traversable and same-height
- the audit does not fabricate an exhaustive no-void conclusion
- no additional user capture becomes request-ready without a concrete mapped ambiguous region
- `fall-out-void-kill-boundary` remains UNTRACED
- common trace coverage remains 15/18 and T21-D remains gated

GitHub Actions run #502 / `36194505652` passed TypeScript check, unit tests, production build, Pages configuration and artifact upload at head `dede055dedaa10c34b6f4fa1c9d3aa7368910cc8`.

No runtime StageDefinition, collision, navigation, paint authority, combat, Super Jump, or T20 objective behavior changed in this checkpoint.


## T21-C minimum vertical-evidence audit validation

Automated checks now additionally require:
- the exact/HIGH BLOCKOUT graph has exactly one currently seeded component: center-low / center-step / center-side slope-low
- Team A/B first-drop landings, right-small-drop upper, right-low, glass lower and glass high reference form one internally constrained but unseeded component
- Team A/B spawn floors remain a separate component because the first-drop 1.5m/3.0m edge is still PROVISIONAL
- central slope high endpoints and grate elevations remain separate unseeded components
- no perspective-only capture may fabricate a center-to-right-low absolute Y tie

T21-D remains blocked pending both XZ completion and these vertical evidence classes.


## T21-C first-drop magnitude capture validation

Automated checks now additionally require:
- exactly one vertical capture request is request-ready: `FIRST_DROP_MAGNITUDE_SIDE_PROFILE`
- the request explicitly compares the unresolved 1.5m / 3.0m first-drop candidates against the adjacent HIGH 1.5m right-small drop
- the guide requires all three terrace levels in one approximately side-on view
- already received right-low and underpass traversals are not requested again
- the request remains evidence-only and cannot promote any Y before the capture is reviewed

GitHub Actions run #509 / `36197224763` passed TypeScript check, unit tests, production build, Pages configuration and artifact upload at head `5d109d78c65bb4c50f55f708f5e218dd6998bdfd`.
