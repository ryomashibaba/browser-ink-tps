# CURRENT_CANONICAL — v0.16.0 / T19C STABLE FREEZE

Date: 2026-09-23

## Status

**T0–T19C is the frozen stable foundation. T19C hosted runtime QA was accepted by the user on 2026-09-24.**

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
- Twin Comets / Dualies while Human: hold primary fire + WASD movement + Space to dodge (up to two chained rolls)
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
2. Preserve the T0–T13 Freeze contracts.
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

## T11 stable checkpoint

Foundation commit:
`340f0f81b579d18c9072bdfd48aef77885b374af`

Integration commit:
`0cd939c5b681264999f77791b62b5f2b2c755c53`

Type-fix follow-up:
`037865af7e433499cf2a08c6f973b09131369d1a`

Automated workflow:
`35812515353`

Automated results:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: **PASS — user confirmed all T11 checks on 2026-09-23**

T11 stable scope:

- explicit match states: COUNTDOWN / PLAYING / ENDED
- 3-second pre-match countdown
- 180-second Turf War timer
- explicit player life states: ACTIVE / SPLATTED
- player collider/render removal while splatted
- 2.5-second respawn timer
- respawn at team-specific main-floor spawn points
- full Ink/HP reset on respawn
- Human-form reset on respawn
- active projectiles cleared on splat / match end / restart
- automatic Turf result snapshot at match end
- Team A / Team B / TIE result state
- Restart Match QA control clears turf/resources/targets and restarts countdown
- Splat QA control drives the real HP→splat→respawn path without requiring T12 CPU opponents
- End Match QA resolves the current Turf result immediately
- match / countdown / timer / life / respawn / splat counters in the debug overlay

T10 Ink/HP behavior is reused rather than duplicated. T11 does not alter PaintEvent, gameplay ink, projectile-blocker, or T9 locomotion contracts.

### Hosted T11 QA acceptance

Confirmed by the user on 2026-09-23:

- 3-second COUNTDOWN gates movement and firing
- PLAYING begins with the 180-second Turf War timer
- Splat QA drives the real T10 HP→0→SPLATTED lifecycle path
- splatted player render/collision/input are disabled during the respawn window
- approximately 2.5-second respawn countdown works
- respawn restores Human form, 100 HP, 100 Ink, and player control
- Team A / Team B respawn at opposite team-specific spawn positions
- End Match QA freezes play at 0:00 and resolves the current Turf leader
- neutral/equal turf resolves to TIE
- Restart Match clears turf/resources/targets/result/splat counters and restarts COUNTDOWN
- T8 camera/blocker/painting, T9 Squid locomotion, and T10 Ink/HP/combat regressions were not observed

Stable T11 gameplay checkpoint:
`037865af7e433499cf2a08c6f973b09131369d1a`

T11 is therefore **STABLE FREEZE**.

## Next phase

- T12 — CPU players / Recast navigation + tactical layer
- T13 — production stage / HUD / tactical map
- T14 — content, animation, audio, additional weapons, polish

## T12 stable checkpoint

Navigation foundation:
`f8fced0a205efd5ed09b8470757a6ec2833b7e8f`

Seven-CPU integration:
`05db5bd5484105d5ca060a40dec5181ea1f033e9`

Strict typing follow-up:
`2578c83ba50911f7163beef3ce42c8e485ab4254`

Automated workflow:
`35813586805`

Automated results:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: **PASS — navigation/tactical and CPU combat/lifecycle checks confirmed by user on 2026-09-23**

T12 candidate adds:

- `recast-navigation 0.43.1` with Vite pre-bundle exclusion
- runtime solo NavMesh generation from the shared T8 StageDefinition solid geometry
- Recast/Detour Crowd fixed-step updates at the existing 60 Hz simulation rate
- seven CPU agents so the match has eight participants including the human player
- human Team A => CPU roster A3/B4; human Team B => CPU roster A4/B3
- Crowd obstacle avoidance / separation instead of seven independent direct-chase movers
- explicit CPU roles: Painter / Skirmisher / Anchor
- staggered tactical retargeting around 3.6 Hz per bot rather than expensive full decisions every fixed tick
- Painter goals score neutral/enemy turf through CPU-authoritative GameplayInk
- opposing Skirmishers pressure positions around the human player
- Anchors patrol the home half
- CPU movement contributes turf through normal `PaintRequest -> PaintEvent -> GameplayInk + GPU atlas` flow
- CPU footprint paint runs on a lower cadence rather than every 60 Hz tick
- CPU entities are render-interpolated between fixed Crowd states
- Restart Match and team changes rebuild the CPU roster
- debug metrics for Recast status/build time, CPU counts, roles, tactical retargets, and CPU paint requests

Hosted T12 navigation/tactical QA accepted by the user on 2026-09-23:

- Recast reports READY
- 7 CPU agents and team roster split behave correctly
- COUNTDOWN/PLAYING gating behaves correctly
- Crowd routing avoids stage solids
- multi-agent separation/avoidance is acceptable
- CPU turf trails and PaintRequest counters behave correctly
- Painter / Skirmisher / Anchor behavior is directionally correct
- Restart Match resets CPU roster/counters/turf
- no unacceptable FPS / dropped-simulation regression was observed
- no T8–T11 regression was reported

Second T12 combat/lifecycle implementation:
`1ecc6543d7f5f3f226a3cb0134ff129045ea09ef`

Workflow:
`35814249152`

Second-batch automated results:

- TypeScript check: PASS
- production build: PASS
- Pages deploy: PASS
- hosted combat/lifecycle QA: **PASS — user confirmed all remaining T12 combat/lifecycle checks on 2026-09-23**

Second batch adds:

- CPU Ink/HP resource state
- CPU Ink recovery and enemy-ink non-lethal damage behavior
- CPU weapon fire requests with per-shot Ink consumption
- CPU projectiles reuse the frozen pooled ProjectileSystem
- CPU projectiles use the same ballistic solver and stage blocker/PaintSurface sweep logic
- human projectiles can damage enemy CPU agents
- CPU projectiles can damage enemy CPU agents and the human player
- friendly-fire exclusion remains team-based
- CPU Splat removes the Crowd agent and render entity from active play
- CPU Respawn after the T11 respawn duration recreates the Crowd agent at team spawn with full HP/Ink
- CPU combat metrics: alive count, average HP/Ink, shots, hits, splats, respawns, and CPU→Player hits

All remaining T12 combat/lifecycle checks passed on 2026-09-23. T12 is **STABLE FREEZE**.

### Hosted T12 final acceptance

Confirmed by the user on 2026-09-23:

- CPU shots are active only during PLAYING and shared-projectile firing is visible
- enemy CPU projectiles damage the human and friendly CPU projectiles do not
- CPU projectile damage can drive the human through the frozen T11 Splat/Respawn path
- human projectiles damage and Splat enemy CPU agents
- splatted CPU agents leave Crowd navigation while inactive
- CPU Respawn recreates a Crowd agent near the proper team spawn with full HP/Ink
- CPU-vs-CPU combat, hits, splats, and respawns occur naturally
- missed CPU projectiles still respect stage blockers and paint world surfaces
- Restart Match restores all seven CPU agents and resets CPU combat counters
- full 4v4 activity remains acceptably stable for the current QA stage
- no regressions were observed in T8–T11 behavior

Stable T12 gameplay checkpoint:
`1ecc6543d7f5f3f226a3cb0134ff129045ea09ef`

Final T12 documentation/Freeze commit follows this checkpoint.

T12 is therefore **STABLE FREEZE**.

## Next phase

- T13 — production stage / HUD / tactical map
- T14 — content, animation, audio, additional weapons, polish

## T13 implementation candidate — Stage contract / HUD / Tactical Map

Stage/HUD/Map foundation:
`936ab4d90c17c0d08920ccf996bfd766535aec59`

App integration:
`32a0430626034417a0e85a66511e4efb41fd17aa`

Automated workflow:
`35815754011`

Automated results:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: **PARTIAL PASS — HUD/Tactical Map presentation and corrected vertical map orientation confirmed; production geometry QA remains**

T13 candidate adds:

- canonical production-stage metadata on the existing validated geometry
- stage id `inkworks-junction` and display name `INKWORKS JUNCTION`
- canonical world bounds used by the Tactical Map
- canonical team spawn metadata aligned with the frozen T11 spawn positions
- legacy `TEST_STAGE_DEFINITION` alias retained so T8–T12 imports remain compatible
- player-facing top HUD with stage name, live Turf percentages, Turf balance bar, and match clock
- player-facing Ink and HP meters
- current team / own Turf / enemy Turf / locomotion readout
- large COUNTDOWN / SPLATTED+respawn / match-result center messages
- live Tactical Map rendered from the same production-stage world bounds
- scoreable CPU GameplayInk visualization on the Tactical Map
- Team A/B spawn rings on the map
- live human + seven CPU map markers
- splatted CPU agents disappear from map markers until Respawn
- `M` toggles the Tactical Map between compact and expanded modes
- HUD and map update as presentation layers only; no gameplay authority moved out of T0–T12 systems

T13 geometry policy:

- this first batch deliberately preserves the already validated physical/paintable geometry
- Production Stage metadata/HUD/map coordinates are being validated first
- larger production-stage geometry changes will follow only after this common coordinate contract is accepted
- future stage geometry must continue to drive Render / Rapier / Recast / PaintSurface / Tactical Map from shared canonical definitions

T13 remains **IMPLEMENTATION CANDIDATE**.

### T13 presentation / map hosted acceptance

User confirmation date: 2026-09-23

Accepted:

- player-facing HUD renders and tracks live Turf / match / Ink / HP state
- countdown / Splat / result center messages render correctly
- Tactical Map compact/expanded presentation works
- Tactical Map human/CPU/Turf world projection works
- initial Tactical Map vertical orientation was reversed
- vertical map projection was corrected in `c5a72770a2b3e7c05d8bca660bbe28bc20099872`
- corrected Tactical Map orientation was confirmed by the user

### T13 production geometry expansion candidate

Implementation:
`fc647806c59e43831a978897baa21e359c5305d7`

Workflow:
`35817233372`

Automated results:

- TypeScript check: PASS
- production build: PASS
- Pages deploy: PASS
- hosted production-stage QA: **PASS — user confirmed the enlarged stage, spawns, CPU navigation, cover collision/painting, Tactical Map, Coordinate Audit, and performance sanity on 2026-09-23**

Production geometry changes:

- main playable floor expanded from 18×14m to 32×24m
- canonical world bounds expanded to ±16.4m X / ±12.4m Z
- human team spawns moved to ±10.2m Z
- four CPU spawn slots per team moved into Stage metadata
- 25 tactical navigation nodes moved into Stage metadata
- MatchController now reads player spawn positions from Stage metadata
- CPU tactical goals and CPU spawn positions now read Stage metadata rather than duplicated hard-coded coordinates
- added north/south asymmetric cover pairs
- added west/east mid-lane cover
- added two junction-center blocks
- added eight new scoreable paintable cover-top surfaces
- outer rails expanded to the new stage bounds
- original upper platform, ramp, wall, bridge, and T8/T9 validation geometry are retained

All remaining T13 production-stage checks passed on 2026-09-23. T13 is **STABLE FREEZE**.

### Hosted T13 final acceptance

Confirmed by the user on 2026-09-23:

- enlarged 32×24m INKWORKS JUNCTION arena is visually present and playable
- far-end Team A / Team B respawns are correct
- seven CPU agents spawn correctly and spread into the expanded lanes
- new cover blocks player/camera/projectiles correctly
- new cover tops accept ink and contribute to Turf scoring
- retained wall swim / Surge / ramp / upper-platform behavior still works
- Tactical Map shows enlarged bounds, spawns, Turf, human, and CPU positions with the corrected orientation
- Coordinate Audit remains PASS
- no GPU atlas cross-surface paint regression was observed
- 4v4 FPS / dropped-simulation / GPU-backlog behavior remains acceptable for the current stage

Stable T13 production-stage checkpoint:
`fc647806c59e43831a978897baa21e359c5305d7`

T13 is therefore **STABLE FREEZE**.

## Next phase

- T14 — content, animation, audio, additional weapons, polish

## T14 first content / polish candidate

Weapon/feedback foundation:
`c65b0ea44271cffea48e5efd8bd1c4e734f8bc1a`

Weapon selection / HUD integration:
`a628b4c0b85133261b52a0b67d12d14eb83d308f`

Character motion polish:
`c85ef99f070f74b54d36d18deda01b1ae296b4dd`

Combat impact feedback:
`a4fc8f57ce55fff57e7048f8a162ba798ee8e236`

Presentation polish:
`c819e10783f2aa9e5b29641e367f53fb1dc87c29`

Automated workflow:
`35818653041`

Automated results:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: **PENDING**

T14 first candidate adds:

- original multi-weapon catalog with three human-selectable weapons
- `Pulse Sprayer` retains the frozen standard-shooter values: 0.105 s interval / 28 m/s / 4 m/s² gravity / 1.8 s life / 0.64 m paint radius / 34 damage / 0.95 Ink
- `Needle SMG`: faster cadence and projectile speed with lower damage / Ink cost / paint radius
- `Arc Blaster`: slower cadence with higher damage, larger projectile, larger paint radius, and higher Ink cost
- weapon selection through keys 3 / 4 / 5 and ControlPanel buttons
- selected weapon shown in the player-facing HUD and Debug Overlay
- all weapons reuse the same pooled swept ProjectileSystem, ballistic aim, blocker priority, combat hit arbitration, and PaintRequest/PaintEvent pipeline
- CPU agents intentionally remain on the frozen Pulse Sprayer profile for this first T14 batch
- pooled muzzle / impact / Splat / Respawn visual feedback
- original procedural Web Audio tones for shot / impact / weapon switch / Splat / Respawn; no external audio assets
- audio is unlocked only after browser user interaction and lightly rate-limited to avoid excessive oscillator creation
- visual-only Human movement bob/squash/sway
- visual-only Squid breathing/pulse while preserving Squid Roll rotation
- visual-only CPU movement bob/squash
- animation modifies render presentation only; colliders, Rapier state, Recast state, and 60 Hz authority remain unchanged

T14 project tuning is original implementation tuning. No Nintendo weapon assets, names, sounds, models, UI assets, or proprietary internal constants are used.

T14 remains **IMPLEMENTATION CANDIDATE**. Do not Freeze until hosted weapon / audiovisual / animation / regression QA passes.

## T14 11-weapon-class expansion candidate

Foundation:
`c1b3f5a6219375a9bb01a2aaf9c59d16e9c18914`

Multi-class runtime:
`24d384d60fb7937f76a424ff1f5e845cfaeb0f38`

Gameplay/UI integration:
`31f441f13740536ed5ceecde518df879fbef21ef`

Workflow:
`35819670569`

Automated result:

- dependency install: PASS
- TypeScript: PASS
- production build: PASS
- Pages artifact: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: **PENDING**

Implemented weapon genres:

- Shooter — Pulse Sprayer / Needle SMG
- Dualies — Twin Comets
- Charger — Rail Charger
- Blaster — Arc Blaster
- Roller — Metro Roller
- Brush — Dash Brush
- Slosher — Wave Slosher
- Splatling — Rotor Cannon
- Brella — Canopy Guard
- Stringer — Chord Stringer
- Splatana / Wiper — Ink Saber

Genre mechanics currently implemented:

- Shooter: continuous automatic fire
- Dualies: paired shots plus RMB dodge roll
- Charger: hold primary to charge, release to fire; charge scales damage / speed / paint
- Blaster: slower projectile plus area blast damage
- Roller: initial wide swing plus held rolling turf paint while moving
- Brush: fast short-range fan attack
- Slosher: high-gravity arcing projectile
- Splatling: hold to charge, release into a charge-scaled rapid burst
- Brella: pellet shot plus RMB projectile guard
- Stringer: three-projectile charge shot whose spread tightens with charge
- Splatana: tap/release slash wave plus stronger charged slash wave

Weapon UI:

- Q / E cycles all weapons
- 3 / 4 / 5 preserve the previous direct shortcuts for Pulse Sprayer / Needle SMG / Arc Blaster
- ControlPanel exposes all weapon representatives
- HUD and DebugOverlay display weapon class, action, charge, and guard state

CPU agents remain on the frozen Pulse Sprayer profile for this candidate so the player-side weapon-class QA is isolated from T12 CPU behavior.

T14 remains **IMPLEMENTATION CANDIDATE** until hosted weapon-class QA passes.

## T14 weapon-class redesign candidate — supersedes the first 11-class attempt

User feedback on the first 11-class candidate:

- the weapons still behaved too much like shooters with different projectile counts
- class-defining Splatoon-style interaction was not represented strongly enough

The first 11-class candidate is therefore **not accepted and not frozen**.

Redesign foundation:
`f017d1e5de8744fc95239ff773a26b531b9c883a`

Distinct class mechanics:
`4c366282a20cf58a32e698259de8b51686723829`

Movement / guard integration:
`bccec88cf6a4898a06305c3e2aad1e016e90d9a4`

Workflow:
`35820796731`

Automated result:

- TypeScript: PASS
- production build: PASS
- Pages deploy: PASS
- hosted runtime QA: **PENDING**

Class-defining runtime now implemented:

- Shooter: normal automatic projectile weapon
- Dualies: paired fire + RMB dodge + temporary post-dodge high-accuracy/high-cadence focus
- Charger: **no normal projectile**; hold to charge and release an immediate ray/beam attack with charge-scaled range/damage and narrow line paint
- Blaster: projectile direct hit plus radial explosion damage and splash paint
- Roller: **no shooter bullets**; grounded horizontal flick, airborne vertical flick, held movement paints a roller trail, close roll contact deals melee damage
- Brush: **no shooter bullets**; rapid close-range melee swipes, wide direct ground painting, and movement-speed boost while brushing
- Slosher: high-gravity lob with visible arcing travel plus paint droplets along its trajectory
- Splatling: cannot fire while charging; hold to charge and release into a charge-scaled rapid burst
- Brella: shotgun-like spread fire plus visible front canopy on RMB, front-only projectile blocking, canopy HP, break and recovery
- Stringer: three arrows, charge-tightened spread, charge-scaled power, and sufficiently charged arrows leave delayed ink explosions after landing
- Splatana/Wiper: **melee slash is authoritative**, with close-range slash damage and direct slash paint plus a secondary traveling slash wave; longer charge produces a stronger/wider charged slash

Weapon movement presentation:

- Charger/Splatling charge slows Human movement
- Brush attack raises Human movement speed
- Roller rolling has its own movement multiplier
- Brella guard slows movement
- Splatana charge slows movement
- Dualies dodge remains a dedicated locomotion state and gains post-roll focus

T0–T13 contracts remain frozen. This redesign is T14-only and remains **IMPLEMENTATION CANDIDATE** until hosted QA.

## T14 v0.9.3 targeted weapon-feel correction

Charge VFX foundation:
`62a26d5d6deebebcaaa01409a287eb9c30818197`

Space-dodge / fuse surfacing:
`0ebf4ec7114744d16ce1b5cd4228838d28a7678b`

Dedicated charge HUD:
`36b9143693bb890f1392dac6bcbaf72a348125f8`

Final dualies/stringer mechanics:
`72649bc1f896dcb2eff1d73620ec52bceaf0918c`

Workflow:
`35824436471`

Automated result:

- dependency install: PASS
- TypeScript: PASS
- production build: PASS
- Pages artifact: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: **PENDING**

Targeted corrections:

- Dualies dodge input is Space while Human with Dualies selected
- standard-style Dualies can chain up to two dodges before recharge
- shooting is suppressed during dodge / short endlag
- post-dodge focus starts from actual dodge execution rather than keypress time
- Charger / Splatling / Stringer / Splatana each have distinct charge HUD and 3D feedback
- Stringer full charge time is 1.20s
- Stringer first-charge threshold is 0.50s
- Stringer arrows at/above first charge create independent fuses on impact
- Stringer fuse delay is 0.75s
- each fuse has visible pulsing anticipation and a visible burst on detonation
- DebugOverlay exposes Dualie roll count/remaining charges and Stringer fuse/burst counters

T0–T13 remains frozen. T14 remains candidate until user runtime acceptance.


## T14 v0.9.4 targeted correction

Dualies input/recovery:
- dodge is Human-only and requires Dualies selected, primary fire held, non-zero WASD movement input, and Space
- Space without firing, or fire+Space while stationary, is not a Dualies dodge input and remains available to normal jump handling
- dodge travel remains a dedicated locomotion state
- fixed-60Hz reference structure is 4F startup -> 12F roll -> 4F until firing returns -> remaining post-roll movement lock / roll recovery, totaling 48F
- a second dodge can start from the post-roll stance when the fire+Space requirement is met and one dodge charge remains
- two-dodge charge behavior remains intact

Splatling charge presentation:
- HUD charge is now Charger-like: centered progress ring + crosshair
- 3D charge feedback now includes a forward guide and centered tightening markers
- subtle rotary markers remain only as Splatling identity

T0–T13 remains frozen. T14 remains candidate until hosted QA confirms these corrections.


## T14 v0.9.5 two-ring charge correction

Rotor Cannon / Splatling:
- first charge ring = 0.80 s
- full second ring = 1.20 s
- before ring 1, projectile speed/range scales upward with charge
- at ring 1, effective projectile speed/range reaches its maximum region
- ring 2 does not extend that range further; it increases stored firing duration
- reference burst count is ~18 shots at ring 1 and ~36 shots at full charge
- HUD uses two separate concentric charge rings

Chord Stringer:
- minimum fire charge remains 0.15 s
- first ring = 0.50 s
- full second ring = 1.20 s
- direct arrow damage scales 30 -> 35 by ring 1 and stays 35 through ring 2
- ring 1 or higher gives every landed arrow an independent 0.75 s delayed burst dealing 30 area damage
- arrow spread remains 8 degrees through ring 1, then converges toward 0 degrees across ring 2
- projectile speed/range and paint width continue increasing through ring 2
- ink cost follows the 5 -> 6 -> 8.5 minimum / ring-1 / full progression
- HUD and 3D feedback expose ring 1 and ring 2 separately

The implementation uses original project weapon names/assets and project-space tuning while matching the documented Splatoon 3 charge-stage relationships. T0–T13 Freeze and PaintRequest -> immutable PaintEvent authority remain unchanged.


## T14 Stable Freeze — 2026-09-23

Hosted runtime QA for the final v0.9.5 candidate was completed and accepted by the user.

Stable T14 checkpoint:
- commit: `006f9b8ddb4a818ac0ba64a3ec18f30640a07dc4`
- GitHub Actions: run #136 / `35830846217` — success
- T0–T13 architecture and gameplay contracts remain intact
- 11 original project weapon representatives are now frozen at the T14 gameplay-feel baseline
- Dualies fire+move+Space dodge, post-roll recovery, class-specific charge feedback, Stringer delayed bursts, and Splatling/Stringer two-ring charge behavior are included in the stable baseline

T14 is therefore **STABLE FREEZE**.

## Next phase

T15 — Sub Weapon + Special Gauge Foundation:
- source-aware paint attribution without changing PaintSurface-local coordinates or CPU/GPU paint authority
- human-earned turf points feed a special gauge
- first throwable sub-weapon path with ink cost and delayed area paint/damage
- first special activation path and player-facing gauge/HUD


## T15 v0.10.0 Sub Weapon + Special Gauge Foundation candidate

T15 adds the first gameplay layer beyond main weapons.

Paint attribution extension:
- `PaintEvent` gains additive `source` metadata only: HUMAN / CPU / SPECIAL / DEBUG / SYSTEM
- canonical PaintSurface-local `surfaceId + U/V + radius + angle` fields are unchanged
- `PaintCoordinator.processTick()` remains the sole immutable PaintEvent creation point
- GameplayInk still applies the event first, and the exact same immutable event is queued to GPU ink
- GameplayInk now reports how much scoreable area actually changed ownership during each event
- only HUMAN-source scoreable changed area can charge the local player's special gauge
- CPU, DEBUG, SYSTEM, and SPECIAL-source paint cannot charge the player's gauge

Pulse Bomb sub weapon:
- input: F
- human-player only in this first candidate
- ink cost: 70 / 100
- pooled throwable with ballistic flight
- fuse begins on first stage/PaintSurface contact
- fuse: 1.0 s
- outer damage: 30 inside 2.4 m
- inner additional damage: 70 inside 1.0 m, for 100 total in the inner zone
- explosion paints nearby PaintSurfaces through normal PaintRequest -> immutable PaintEvent flow
- Pulse Bomb paint is HUMAN source, so newly covered scoreable turf contributes to the special gauge

Turf Pulse special:
- input: G when ready
- required gauge: 180p
- HUMAN scoreable paint conversion: 10p per 1 m² changed, therefore 18 m² for a full gauge at current project scale
- default Splat penalty retains 50% of current gauge
- activating consumes the full gauge
- applies an original radial area attack and radial paint pattern
- its paint source is SPECIAL, so it cannot refill its own gauge
- `Special QA Ready` fills the gauge instantly for hosted validation

T15 controls:
- F: Pulse Bomb
- G: Turf Pulse when SPECIAL is ready
- existing RMB Brella guard remains unchanged

T15 remains **IMPLEMENTATION CANDIDATE** until hosted QA is accepted.


## T15 Stable Freeze — 2026-09-23

Hosted runtime QA for v0.10.0 was completed and accepted by the user.

Stable T15 checkpoint:
- commit: `901b8c73f5313ac39c27ebb0fc42cb3ec1810bda`
- GitHub Actions: run #165 / `35832485527` — success
- source-aware PaintEvent attribution is frozen as additive metadata only
- Pulse Bomb, Turf Pulse, special-gauge scoring, Splat retention, HUD/debug integration are the stable T15 baseline

T15 is therefore **STABLE FREEZE**.

## Next phase

T16 — Weapon Kit System:
- each main weapon gets one fixed sub weapon and one fixed special
- multiple sub-weapon behaviors share the frozen T15 HUMAN paint-attribution path
- multiple special behaviors share the frozen T15 SPECIAL paint-attribution path
- weapon switching updates the active kit and HUD without weakening T0–T15 contracts


## T16 v0.11.0 Weapon Kit System candidate

T16 turns the T15 global sub/special pair into a fixed kit per main weapon.

Kit architecture:
- `WeaponKitCatalog.ts` is independent from the frozen T14 main-weapon behavior table.
- every main weapon resolves exactly one SubWeaponId and one SpecialWeaponId
- F always uses the selected main weapon's sub
- G always uses the selected main weapon's special when its gauge is ready
- Q/E and ControlPanel weapon switching update the whole kit
- switching weapons preserves special-gauge fill ratio while converting to the new special's required points
- active thrown subs and ongoing special effects are cancelled on QA weapon switch so test state remains deterministic
- T15 HUMAN/SPECIAL PaintSource attribution remains unchanged

Sub weapons:
- Pulse Bomb
  - 70 Ink
  - ballistic throw
  - first stage contact starts a 1.0 s fuse
  - outer 30 damage, inner +70 for 100 total
  - medium radial paint
- Snap Bomb
  - 45 Ink
  - faster ballistic throw
  - detonates immediately on first stage contact
  - outer 35 damage, inner +25 for 60 total
  - smaller/faster radial paint
- Anchor Bomb
  - 70 Ink
  - slower/heavier throw
  - stays at first contact point and uses a 2.0 s fuse
  - outer 30 damage, inner +70 for 100 total
  - largest radial paint of the three

Special weapons:
- Turf Pulse — 180p
  - immediate radial player-centered paint/damage
- Triple Strike — 190p
  - creates three delayed strikes centered around the current aim target
  - strike delays are staggered from about 0.72 s onward
  - each strike deals 62 area damage and paints through SPECIAL-source PaintEvents
- Drift Storm — 200p
  - starts in the player's aim direction
  - persists for 4.8 s and drifts forward
  - pulses roughly every 0.38 s for 16 area damage plus SPECIAL-source paint

Frozen special-gauge relationships remain:
- only HUMAN-source changed Scoreable turf charges the gauge
- SPECIAL paint never self-charges
- Splat retention remains 50%
- Special QA Ready fills whichever special is currently equipped

Current weapon kits:
- Pulse Sprayer — Pulse Bomb / Turf Pulse
- Needle SMG — Snap Bomb / Drift Storm
- Twin Comets — Snap Bomb / Turf Pulse
- Rail Charger — Anchor Bomb / Triple Strike
- Arc Blaster — Pulse Bomb / Triple Strike
- Metro Roller — Anchor Bomb / Turf Pulse
- Dash Brush — Snap Bomb / Drift Storm
- Wave Slosher — Pulse Bomb / Drift Storm
- Rotor Cannon — Anchor Bomb / Triple Strike
- Canopy Guard — Anchor Bomb / Drift Storm
- Chord Stringer — Pulse Bomb / Triple Strike
- Ink Saber — Snap Bomb / Turf Pulse

T16 remains **IMPLEMENTATION CANDIDATE** until hosted runtime QA is accepted.


## T16 Stable Freeze — 2026-09-23

Hosted runtime QA for v0.11.0 was completed and accepted by the user.

Stable T16 checkpoint:
- commit: `958a1d168ea86387701eb089437bf6da6af14514`
- GitHub Actions: run #184 / `35833765947` — success
- per-main-weapon fixed kit assignment is frozen
- Pulse Bomb / Snap Bomb / Anchor Bomb are the stable sub baseline
- Turf Pulse / Triple Strike / Drift Storm are the stable special baseline
- weapon-switch kit updates and special fill-ratio preservation are included
- T15 HUMAN/SPECIAL paint-source and special-gauge contracts remain unchanged

T16 is therefore **STABLE FREEZE**.

## Next phase

T17 — Super Jump / Spawn Mobility:
- map-driven destination selection
- launch / travel / landing state integrated into fixed 60 Hz player lifecycle
- teammate/spawn destination handling without weakening existing respawn contracts
- visible landing indicator / travel feedback
- interruption and safety rules isolated from T0–T16 Freeze


## T17 v0.12.0 Super Jump / Spawn Mobility candidate

Selection:
- press M to expand the tactical map
- opening the map releases Pointer Lock
- the local player may click:
  - their own team spawn
  - any currently alive friendly CPU
- enemy CPUs and splatted friendly CPUs are not valid destinations
- after a valid destination is selected, Pointer Lock is requested again automatically
- starting a jump while falling enters WAIT_GROUND and begins preparation only after reaching the ground
- wall-swim / Surge-charge states may begin preparation directly without first dropping to the floor

Timing and vulnerability:
- preparation phase: 80 fixed 60 Hz frames
- main airborne phase: 130 frames
- final airborne action/approach phase: 30 frames
- preparation is grounded/anchored and remains vulnerable
- from takeoff through the final airborne phase, the player is invulnerable
- travel time is distance-independent
- the jump path bypasses ordinary stage collision so walls/floors cannot block the jump
- after actual landing, ordinary movement/weapon control resumes immediately

Implementation boundary:
- ordinary player locomotion still uses the frozen Rapier kinematic controller
- Super Jump uses a separate T17 state machine and external travel entity only while airborne
- the normal player colliders/render are disabled only during airborne travel
- landing teleports the existing PlayerController body to the resolved destination and restores its ordinary collider/render state
- ProjectileSystem now receives separate `playerWeaponEnabled` and `playerDamageable` flags:
  - PREP: weapon disabled, damageable
  - TRAVEL / final approach: weapon disabled, not damageable
  - ordinary play: both enabled
- enemy-ink resource damage and Splat QA also respect airborne invulnerability
- previously-fired projectiles, active subs, and active specials continue independently

Destination behavior:
- spawn uses the frozen team spawn position
- friendly CPU destinations are snapshotted at the exact map-selection moment
- after selection, subsequent CPU movement does not alter the locked destination
- the landing marker remains fixed at that snapshotted destination throughout PREP / TRAVEL / LANDING
- Tactical Map shows selectable friendly rings and the active JUMP destination

Visual / UI:
- dedicated high-arc traveler entity
- visible landing marker
- launch and landing FX/audio
- HUD states: WAIT_GROUND / PREP / TRAVEL / LANDING
- Debug shows jump state, target, progress, target XYZ, and completed jump count

Reference relationship:
- the 80F preparation / 130F main / 30F final phase structure follows public Splatoon Super Jump reference timing
- the browser implementation remains project-owned; arc height, selection radius, visual treatment, and other presentation details are project tuning

T17 remains **IMPLEMENTATION CANDIDATE** until hosted runtime QA is accepted.


## T17 Stable Freeze — 2026-09-23

Hosted runtime QA for v0.12.0 was completed and accepted by the user.

Stable T17 checkpoint:
- commit: `38836bcf73f03b7623eb09e7a41436b83027ab76`
- GitHub Actions: run #222 / `35841633285` — success
- Super Jump map selection to own spawn or living friendly CPUs is frozen
- friendly CPU jump destinations are snapshotted at the exact map-selection moment and do not track later CPU movement
- phase structure is frozen at 80F preparation / 130F main airborne / 30F final airborne approach
- preparation remains vulnerable; airborne phases remain invulnerable
- distance-independent high-arc travel, landing marker, Pointer Lock recovery, HUD/debug state, and lifecycle cleanup are included
- T0–T16 contracts remain unchanged outside the additive T17 mobility path

T17 is therefore **STABLE FREEZE**.

## Next phase

T18 — CPU Tactical Mobility:
- let CPU agents use the frozen T17 Super Jump concept for tactical front-line recovery / regrouping
- keep CPU jump decisions in the tactical layer instead of normal Recast pathing
- use fixed destination snapshots rather than live-tracking teammates
- preserve the human T17 map-selection and lifecycle contracts
- keep CPU jump behavior isolated from T0–T17 paint / combat / match authority


## T18 v0.13.0 CPU Tactical Mobility candidate

Purpose:
- CPU agents may use Super Jump for front-line recovery after respawn and for limited regrouping when badly isolated.
- CPU Super Jump decisions live in the tactical AI layer; normal Recast navigation remains unchanged while grounded.
- CPU jumps never alter the human T17 map-selection or lifecycle contracts.

CPU mobility states:
- GROUND
- JUMP_PREP
- JUMP_TRAVEL
- JUMP_LANDING

Timing / vulnerability:
- uses the frozen T17 phase timing:
  - PREP: 80 fixed 60 Hz frames
  - JUMP_TRAVEL: 130 frames
  - JUMP_LANDING/final approach: 30 frames
- PREP remains targetable and vulnerable
- JUMP_TRAVEL / JUMP_LANDING are invulnerable to projectile and area damage
- enemy-ink resource damage is skipped while airborne
- CPU cannot paint or fire while preparing or airborne

Navigation boundary:
- at JUMP_PREP start, the CPU CrowdAgent is removed from Recast so the CPU remains stationary
- airborne travel uses independent fixed-step world coordinates and a high arc
- on actual landing, the snapshotted destination is projected to the navmesh and a fresh CrowdAgent is registered there
- normal Recast pathing resumes after landing
- match end / splat / reset safely clears jump state and markers

Destination contract:
- jump destinations are snapshotted when the CPU decides to jump
- they never live-track a moving teammate after decision time
- candidate destinations are living grounded friendly CPUs or the living human teammate when on the same team
- airborne friendly CPUs are not valid destinations
- human teammates are not valid while the human is in T17 airborne invulnerability

Tactical decision rules:
- CPU must be ACTIVE / grounded / have a live CrowdAgent
- CPU must have at least 72% HP
- minimum jump distance: 8.0 m
- ordinary regrouping is considered only when nearest friendly distance is at least 12.0 m
- after CPU respawn, a 2.4 s front-line recovery window strongly biases Super Jump
- destination is rejected if an active enemy is within 4.2 m
- per-CPU cooldown after landing: 8.0 s
- SKIRMISHER has the strongest forward-jump bias
- PAINTER has a moderate bias
- ANCHOR is intentionally conservative
- a forward-progress component favors destinations closer to the opposing side
- tactical score threshold: 5.4

Visual / QA:
- each CPU owns a team-colored landing marker
- airborne CPU uses the existing CPU entity with a spinning elongated travel presentation
- Debug exposes CPU jump PREP count, airborne count, total jumps, landings, cancels, and last source->target pair
- `CPU Jump QA` forces one valid CPU jump for hosted verification
- QA fallback may use a safe front tactical position when no valid friendly candidate is far enough; normal gameplay never uses that fallback

T0–T17 Freeze:
- PaintCoordinator / GameplayInk / GpuInk authority is unchanged
- human T17 Super Jump code and destination snapshot semantics are unchanged
- MatchController is unchanged
- normal CPU paint/combat/Recast behavior resumes exactly after landing

T18 remains **IMPLEMENTATION CANDIDATE** until hosted runtime QA is accepted.


## T18 Stable Freeze — 2026-09-23

Hosted runtime QA for v0.13.0 was completed and accepted by the user.

Stable T18 checkpoint:
- commit: `1a097015a8217ef4fcea8689e1a5de4cf8b71b42`
- GitHub Actions: run #243 / `35843150398` — success
- CPU GROUND / JUMP_PREP / JUMP_TRAVEL / JUMP_LANDING mobility states are frozen
- CPU Super Jump uses the frozen T17 80F / 130F / 30F timing structure
- CPU PREP remains vulnerable; airborne CPU remains invulnerable
- CPU jump destinations are snapshotted at tactical-decision time and never live-track moving teammates
- respawn-recovery / isolation-regrouping rules, safety filters, HP threshold, cooldown, and role bias are included
- PREP removes the Recast CrowdAgent; landing recreates it at the snapshotted navmesh destination
- CPU painting/firing suspension during PREP/airborne, lifecycle cleanup, Debug metrics, and CPU Jump QA are included
- human T17 Super Jump and T0–T17 authority contracts remain unchanged

T18 is therefore **STABLE FREEZE**.

## Next phase

T19 — CPU Loadout Diversity / Weapon Kit Parity:
- remove the long-standing T14 isolation where every CPU uses the Pulse Sprayer profile
- assign CPU main weapons by role / slot while preserving the frozen seven-agent tactical roles
- route CPU fire through the existing weapon-specific runtime models rather than generic projectile-count variation
- keep weapon-class behavior consistent with the frozen T14 player weapon contracts
- preserve T16 kit assignments as the canonical main/sub/special mapping source
- introduce CPU sub/special use only where it can be safely integrated without changing HUMAN/SPECIAL paint-source authority
- maintain T12 CPU combat/lifecycle, T18 mobility, and T0–T18 performance contracts


## T19A v0.14.0 CPU Main-Weapon Diversity candidate

Scope:
- this is the first T19 batch
- CPU main weapons are diversified now
- CPU sub/special use remains deferred to a later T19 batch until main-weapon parity is accepted
- Roller / Brush / Brella / Stringer / Splatana CPU runtime remains deferred because those classes depend on movement, guard, delayed multi-hit, or melee state that should not be approximated as generic projectiles

CPU loadout catalog:
- Team A slot 1 — Needle SMG / PAINTER
- Team A slot 2 — Twin Comets / SKIRMISHER
- Team A slot 3 — Wave Slosher / PAINTER
- Team A slot 4 — Rail Charger / ANCHOR
- Team B slot 1 — Pulse Sprayer / PAINTER
- Team B slot 2 — Arc Blaster / SKIRMISHER
- Team B slot 3 — Needle SMG / PAINTER
- Team B slot 4 — Rotor Cannon / ANCHOR
- because the human occupies one team slot, the human team has three CPU loadouts and the opposing team has four; switching human team exposes the opposite slot-4 anchor weapon

Runtime contracts:
- every CPU stores a canonical WeaponId from the frozen T14 WeaponCatalog
- CPU Ink consumption uses that WeaponProfile's inkCost rather than the old global shooter cost
- CPU firing cadence uses the selected profile rather than the old global CPU interval
- CPU weapon charge / burst state is separate per bot
- charge / burst state is cleared on Super Jump preparation, jump cancellation, respawn, and match end
- weapon projectiles remain in the shared pooled ProjectileSystem
- CPU projectile/world paint remains PaintSource.Cpu and cannot charge the human special gauge

Supported T19A fire models:
- Pulse Sprayer / Needle SMG:
  - normal profile-based automatic projectile fire
- Twin Comets:
  - two simultaneous projectiles using the frozen Dualies spread
  - CPU does not receive a Dualies dodge in T19A
- Arc Blaster:
  - one direct projectile using frozen Blaster blast radius and blast damage
  - enemy CPU Blaster blast area now also damages the human player when in radius
  - Brella guard can absorb enemy CPU blast damage from the guarded direction
- Wave Slosher:
  - high-gravity lob trajectory
  - frozen Slosher-style trail paint radius
- Rail Charger:
  - CPU charges to full before firing
  - uses the frozen Charger direct-ray range / damage / paint scaling
  - ray compares world blockers, enemy CPU targets, and the human target
  - CPU Charger line paint uses PaintSource.Cpu
  - human Brella guard can block the CPU Charger from the guarded direction
- Rotor Cannon:
  - charges to the frozen first ring (0.80 s)
  - releases approximately half of the frozen 36-shot capacity: 18-shot burst
  - uses the frozen 0.075 s burst cadence
  - no generic shooter approximation

Tactical / range tuning:
- Charger CPU target range: 24 m
- Splatling: 13.5 m
- Slosher: 10.5 m
- Blaster: 10.0 m
- Dualies: 9.8 m
- ordinary Shooters use the frozen CPU combat range
- existing PAINTER / SKIRMISHER / ANCHOR target-selection logic remains authoritative

Presentation / diagnostics:
- Debug exposes the whole CPU loadout string
- Debug exposes number of CPUs currently charging and currently bursting
- Tactical Map labels CPU markers as id + weapon short name, e.g. A1·NEEDLE or B2·BLAST
- existing CPU role labels, HP/Ink, combat, jump, and performance diagnostics remain available

T0–T18 Freeze:
- human T14/T16 weapon and kit behavior is unchanged
- T12 CPU lifecycle / combat target selection remains the base
- T18 CPU Super Jump remains unchanged
- PaintCoordinator / GameplayInk / GPU atlas authority remains unchanged
- MatchController remains unchanged

T19A remains **IMPLEMENTATION CANDIDATE** until hosted runtime QA is accepted.


## T19A Stable Freeze — 2026-09-23

Hosted runtime QA for v0.14.0 was completed and accepted by the user.

Stable T19A checkpoint:
- commit: `034ee78fa3e25705332a40d2456ac5ebf90b79d4`
- GitHub Actions: run #266 / `35847641772` — success
- CPU main-weapon diversity is frozen for:
  - Pulse Sprayer
  - Needle SMG
  - Twin Comets
  - Arc Blaster
  - Wave Slosher
  - Rail Charger
  - Rotor Cannon
- CPU profile Ink costs / cadence / gravity / damage are frozen to T14 WeaponCatalog values
- CPU Dualies paired fire, Blaster blast, Slosher lob/trail, Charger charge/ray, and Splatling first-ring burst are included
- CPU Charger and Blaster interactions with human Brella guard are included
- CPU charge / burst state cleanup across T18 mobility and lifecycle transitions is included
- CPU map/debug loadout identity is included
- human T14/T16 behavior and T0–T18 authority contracts remain unchanged

T19A is therefore **STABLE FREEZE**.

## Next phase

T19B — CPU Advanced Main-Weapon Class Parity:
- complete CPU support for the five remaining T14 classes:
  - Metro Roller
  - Dash Brush
  - Canopy Guard
  - Chord Stringer
  - Ink Saber
- do not approximate these as generic projectiles
- preserve each frozen T14 class identity:
  - Roller flick / rolling-contact paint
  - Brush melee swipe / mobility-pressure behavior
  - Brella pellet burst / directional guard
  - Stringer charge rings / three-shot spread / delayed burst
  - Splatana direct slash / ranged wave / charged slash
- integrate class behavior with existing CPU tactical roles and T18 mobility
- keep CPU Sub/Special parity deferred to T19C until all 11 main-weapon classes have a genuine CPU runtime


## T19B v0.15.0 CPU Advanced Main-Weapon Class Parity candidate

Scope:
- completes CPU runtime support for all 11 frozen T14 main-weapon classes
- preserves the accepted T19A default CPU roster unchanged
- advanced classes are exposed through `CPU Advanced QA` so T19A's frozen normal loadout assignments are not silently changed
- Restart Match / team reset restores the canonical T19A default CPU roster
- CPU Sub/Special parity remains deferred to T19C

CPU Advanced QA preset:
- first five CPU agents are temporarily reassigned to:
  1. Metro Roller
  2. Dash Brush
  3. Canopy Guard
  4. Chord Stringer
  5. Ink Saber
- Debug `CPU advanced QA` becomes `advanced-5`
- Tactical Map continues to show each CPU's active weapon short name

Metro Roller CPU:
- no generic projectile approximation
- approaches nearby targets through Recast
- at close contact range, performs rolling contact:
  - CPU-source rolling paint
  - 38 contact damage
  - 0.075 s rolling paint cadence
  - frozen roll paint Ink cost
- at medium-close range, performs the frozen ground horizontal flick:
  - 58 melee/flick damage radius
  - seven-point paint fan
  - frozen main-shot Ink cost / cadence
- airborne vertical flick is not synthesized because the CPU has no ordinary airborne attack state in T19B

Dash Brush CPU:
- no projectile approximation
- pushes toward targets inside the pressure radius
- performs the frozen close-range brush swipe:
  - 24 melee damage
  - five-point paint fan
  - frozen 0.16 s cadence and Ink cost
- class pressure comes from target pursuit plus fast repeated melee swipes

Canopy Guard CPU:
- fires the frozen six-pellet / 18-degree Brella burst
- owns independent directional guard state:
  - 100 guard HP
  - 28 HP/s guard recovery while not guarding and not broken
  - 2.5 s guard-break lock after guard HP reaches zero
- guard faces the latest combat target
- guard is used after firing and while HP is low
- guard is a visible team-colored box in front of the CPU
- projectile / Charger ray uses a front shield hit before body hit when the guard is active
- area damage is absorbed when the blast center lies in the guarded direction
- guard does not apply while Super Jump airborne

Chord Stringer CPU:
- no generic three-projectile approximation
- uses frozen two-stage charge structure:
  - targets below 9.5 m use first-ring release
  - targets at or above 9.5 m charge to full
- fires three projectiles
- spread contracts through second ring exactly through the T14 stage math
- direct damage grows 30 -> 35 through first ring
- speed / paint continue scaling through second ring
- first-ring and full releases create the frozen delayed 0.75 s explosive burst
- delayed burst damage / paint remain PaintSource.Cpu
- CPU Ink cost follows the frozen Stringer 5 -> 6 -> 8.5 charge cost curve

Ink Saber CPU:
- no generic projectile approximation
- within 2.25 m, charges to the frozen 0.62 s full slash
- farther valid targets use a 0.16 s quick release
- release combines:
  - direct melee slash
  - CPU-source slash paint path
  - ranged wave projectile
- charged slash uses the frozen 95 melee damage / larger radius
- quick slash uses the frozen 42 melee damage
- ranged wave speed / size / damage / paint scale with charge

Shared advanced-runtime contracts:
- CPU requests now carry an explicit action:
  - PROJECTILE
  - ROLLER_FLICK
  - ROLLER_ROLL
  - BRUSH_SWIPE
  - BRELLA_BURST
  - STRINGER_RELEASE
  - SPLATANA_RELEASE
- request includes both muzzle origin and body position
- CPU-side Ink is consumed before the request enters ProjectileSystem
- ProjectileSystem never charges human PlayerResources for CPU attacks
- advanced direct/melee/paint effects use the shared Combat/Paint paths
- CPU advanced paint always uses PaintSource.Cpu
- advanced charge / burst / guard state is cleared on Splat, Respawn, Super Jump preparation/cancel, match end, and QA weapon reassignment

Brella interaction contracts:
- Human attacks may be blocked by CPU Canopy Guard when they approach from the guarded direction
- Human Charger direct ray sees the CPU shield before the body when appropriate
- Human area attacks may be absorbed by the CPU guard based on blast direction
- existing Human Canopy Guard behavior remains unchanged

Diagnostics:
- Debug keeps the complete CPU loadout list
- Debug charge / burst counts remain available
- Debug adds current CPU guard count and cumulative guard blocks
- Debug shows whether the advanced-5 QA preset is active

T0–T19A Freeze:
- T19A normal CPU assignments are unchanged
- Human T14/T16 main/sub/special behavior is unchanged
- T18 CPU Super Jump behavior is unchanged
- PaintCoordinator / GameplayInk / GPU atlas authority is unchanged
- MatchController is unchanged

T19B remains **IMPLEMENTATION CANDIDATE** until hosted runtime QA is accepted.


## T19B Stable Freeze — 2026-09-23

Hosted runtime QA for v0.15.0 was completed and accepted by the user.

Stable T19B checkpoint:
- commit: `d2b0b01fba9d547686399f58e3347e21f247ef38`
- GitHub Actions: run #287 / `35867101317` — success
- CPU runtime now has genuine class-specific behavior for all frozen T14 weapon classes
- accepted advanced classes:
  - Metro Roller
  - Dash Brush
  - Canopy Guard
  - Chord Stringer
  - Ink Saber
- Roller rolling contact / flick behavior is included
- Brush pursuit / melee swipe behavior is included
- CPU Brella directional guard, guard HP, guard recovery, guard break, and front-hit interception are included
- CPU Stringer first/full charge, three-shot convergence, and delayed 0.75 s burst are included
- CPU Splatana quick/charged slash plus ranged wave is included
- advanced CPU paint remains PaintSource.Cpu
- T19A default roster remains unchanged; `CPU Advanced QA` is a hosted verification preset only
- advanced transient state cleanup across Splat / Respawn / T18 Super Jump / Match End / Restart is included
- human T14/T16 behavior and T0–T19A authority contracts remain unchanged

T19B is therefore **STABLE FREEZE**.

## Next phase

T19C — CPU Sub / Special Kit Parity:
- use the frozen T16 WeaponKitCatalog as the only main->sub/special assignment authority
- give each CPU the sub and special belonging to its current main weapon
- preserve CPU-source paint attribution for CPU subs/specials
- do not allow CPU sub/special paint to charge the human Special gauge
- add tactical usage rules so CPUs do not spam subs/specials on cooldown
- keep main-weapon identity and T19B advanced class behavior unchanged
- integrate Sub / Special use with CPU Ink, Splat/Respawn, Super Jump, and match lifecycle
- keep human T16 kit controls and HUMAN/SPECIAL source contracts unchanged


## T19C v0.16.0 CPU Sub / Special Kit Parity candidate

Architecture:
- `WeaponKitCatalog` remains the only main-weapon -> Sub/Special assignment authority
- every CPU resolves its current kit directly from its current `WeaponId`
- no duplicate CPU-only kit mapping exists
- CPU kit execution is isolated in `CpuKitSystem`
- Human `SubWeaponSystem` and `SpecialGaugeSystem` remain unchanged
- CPU kit requests are emitted by `CpuAgentSystem` and executed later in the same fixed 60 Hz tick

Paint attribution / Special gauge:
- `PaintEvent` / `PaintRequest` gained optional `actorId` metadata only
- coordinate authority, local U/V semantics, source authority, and immutable-event flow are unchanged
- `PaintTickReport` reports actual changed scoreable area by CPU actor
- CPU main-weapon paint, movement paint, and CPU Sub paint use:
  - `PaintSource.Cpu`
  - the source CPU's actor id
  - gauge-eligible paint
- CPU Special paint uses:
  - `PaintSource.Cpu`
  - the source CPU's actor id
  - `gaugeEligible: false`
- therefore CPU Special paint cannot self-charge
- CPU paint never contributes to the Human Special gauge
- CPU gauge gain uses the same frozen T15 conversion:
  - actual newly changed scoreable area only
  - `GAME_CONFIG.special.pointsPerScoreableSquareMeter = 10`
- same-team already-owned cells do not charge a CPU gauge

CPU kit state:
- per CPU:
  - Sub cooldown
  - Special points
  - Special tactical decision cooldown
- Special required points come from the T16 Special profile:
  - Turf Pulse 180p
  - Triple Strike 190p
  - Drift Storm 200p
- Splat retains 50% of CPU Special points, matching the frozen Human retention factor
- lingering CPU Sub paint after source Splat may add gauge after the retention event, matching the Human lingering-Sub behavior
- Advanced Weapon QA resets affected CPU kit gauges because it changes the CPU's main weapon / kit
- Clear Ink clears CPU kit gauges and attributed paint diagnostics

CPU Sub runtime:
- separate 16-slot pooled CPU bomb runtime
- Pulse Bomb / Snap Bomb / Anchor Bomb use the frozen T16 profile values
- flight speed, upward boost, gravity, fuse, damage, and paint radii match the Human profiles
- Snap Bomb detonates on world impact
- Pulse / Anchor use their frozen fuse timings after contact
- CPU Sub damage uses the shared guard-aware area-damage route
- CPU Sub paint is CPU-source and gauge-eligible
- thrown CPU Subs persist if their source CPU is Splatted
- bomb paint geometry matches the frozen Human Sub geometry, including ring stamp scale / plane distance

CPU Special runtime:
- Turf Pulse:
  - frozen Human pulse damage radius / damage / paint radius / ring radius
- Triple Strike:
  - three fixed activation-time target points at -1.65 / 0 / +1.65 m
  - delays 0.72 / 0.88 / 1.04 s
  - each strike radius 2.15 m / damage 62
  - paint radius 0.92 / ring 1.85 / 10 ring stamps
- Drift Storm:
  - begins 1.1 m forward
  - duration 4.8 s
  - travel 1.45 m/s
  - pulse every 0.38 s
  - radius 1.85 / damage 16
  - paint 0.62 / ring 1.25 / 8 ring stamps
- CPU Special radial paint geometry now exactly matches the frozen Human Special ring-stamp size
- active Triple Strike / Drift Storm effects are cancelled if their source CPU is Splatted
- Turf Pulse is instantaneous
- active CPU Specials may continue through Super Jump because the source CPU remains ACTIVE, matching the Human jump contract
- Match End / Restart / Team change / Clear Ink reset active CPU kit effects

Shared damage routing:
- CPU Sub / Special area damage routes through `ProjectileSystem.applyExternalAreaDamage()`
- this reuses the frozen combat path for:
  - enemy CPUs
  - QA combat targets
  - Human player
  - Human Super Jump invulnerability
  - Human Canopy Guard directional blocking
  - CPU Canopy Guard directional blocking via `CpuAgentSystem.applyAreaDamage()`

Tactical CPU kit usage:
- CPU cannot use a kit while not grounded, while guarding, charging, or releasing a stored burst
- a recent main-weapon action briefly wins over kit use
- Special is evaluated before Sub so one CPU cannot emit both in the same decision
- Sub target window: 2.6–11.5 m
- base Sub cooldown:
  - Snap Bomb 2.8 s
  - Pulse Bomb 4.2 s
  - Anchor Bomb 5.1 s
- role multiplier:
  - SKIRMISHER x0.88
  - PAINTER x1.00
  - ANCHOR x1.16
- Turf Pulse: use within 4.2 m or at HP <= 52
- Triple Strike: use at 4.0–18.0 m
- Drift Storm: use at 3.2–15.0 m
- post-Special decision cooldown: 2.6 s
- post-Special Sub lock: 0.8 s
- all T19C tuning lives under `GAME_CONFIG.cpu.kit`

QA / diagnostics:
- `CPU Kit QA Ready` fills every active CPU's currently assigned Special and clears kit decision cooldowns
- Debug exposes:
  - each CPU's Sub/Special pair and current Special %
  - number of ready CPUs
  - average CPU Special %
  - cumulative actual CPU scoreable paint driving gauges
  - Sub uses / Special activations
  - active CPU Subs / active Special effects
  - Sub explosions / CPU kit pool drops
  - last CPU kit action
- `CPU Advanced QA` first clears active CPU kit effects, then changes the five advanced weapon classes
- Restart Match restores the frozen T19A default roster and clears T19C runtime state

Cross-system regression audit:
- T19B advanced main-weapon behavior remains unchanged
- T19A default CPU roster remains unchanged
- T18 Super Jump state/timing remains unchanged
- Human T16 Sub/Special controls and profiles remain unchanged
- Human T15 Special gauge and HUMAN/SPECIAL source contracts remain unchanged
- PaintCoordinator remains the sole immutable PaintEvent creator
- CPU/GPU paint coordinates remain unchanged
- MatchController remains unchanged

T19C remains **IMPLEMENTATION CANDIDATE** until hosted runtime QA is accepted.

Candidate implementation checkpoint:
- implementation/code checkpoint: `c1807e5c70c7869d346ce1fa6ed0a5def31c59f9`
- GitHub Actions run #335 / `35979800671`: TypeScript check, production build, and Pages deploy success
- final cross-debug fixes included before this checkpoint:
  - CPU Sub pool rejection refunds Ink and rolls back the full cooldown to a short retry delay
  - CPU Special activation is deferred to CpuKitSystem.fixedUpdate so current-tick Human damage / guard / Super Jump context is authoritative
- later T19C documentation commits do not change gameplay code



## T19C Stable Freeze — 2026-09-24

Hosted runtime QA for v0.16.0 was completed and accepted by the user after the T19C multi-stage implementation and cross-system debug pass.

Stable T19C implementation checkpoint:
- commit: `c1807e5c70c7869d346ce1fa6ed0a5def31c59f9`
- GitHub Actions: run #335 / `35979800671` — TypeScript check, production build, and Pages deploy success
- final candidate documentation HEAD before Freeze: `11b3bd584d80715a41f251529b06729461fa6233`
- GitHub Actions run #338 / `35980005463` — success

Frozen T19C scope includes:
- T16 WeaponKitCatalog as the sole CPU main->Sub/Special assignment authority
- actor-attributed CPU scoreable paint and real-paint-driven per-CPU Special gauges
- CPU Special self-charge prevention
- Pulse Bomb / Snap Bomb / Anchor Bomb CPU runtime
- Turf Pulse / Triple Strike / Drift Storm CPU runtime
- CPU kit tactical usage rules and centralized tuning
- 50% Splat Special retention
- Sub pool rejection rollback
- current-tick Human guard / Super Jump-aware CPU Special damage context
- Match End / Restart / Team change / Clear Ink / Advanced QA lifecycle cleanup
- CPU Kit QA Ready and T19C diagnostics
- preservation of T0–T19B main-weapon, movement, match, and paint-authority contracts

T19C is therefore **STABLE FREEZE**.

## T20 v0.17.0 implementation candidate — Game Mode Foundation + Splat Zones

T20 is additive on top of the frozen T0–T19C foundation.

Initial T20 integration:
- PR #3 merged to main as `61ab9aa492595468973141572179753c38115fe4`
- main GitHub Actions run #352 / `35983355005`: TypeScript check, unit tests, production build, and Pages deploy all PASS

T20 cross-debug / rule-fidelity follow-up:
- PR #4 head: `a3a6153010579b71db10a99a84e2e58d7fa1a66d`
- PR GitHub Actions run #354 / `35986533331`: TypeScript check, unit tests, and production build PASS; deploy correctly skipped for PR
- this follow-up remains candidate until merged and hosted runtime QA is accepted

T20 candidate scope:
- `GameModeId` introduces `TURF_WAR` and `SPLAT_ZONES`; Turf War remains the default
- `SplatZonesObjectiveSystem` reads only existing authoritative GameplayInk owner cells
- the stage declares the central objective as PaintSurface-local U/V metadata; no global-XZ ink authority is introduced
- zone cells are precomputed once and only that bounded set is sampled each fixed tick
- Splat Zones uses 100 counts with a series-style ~60 s clean hold, 70% capture threshold, and 50% opposing-coverage neutralization as project tuning
- control-period penalty follows a 0.75 progress formula and is applied when the opposing team takes control rather than merely when the zone becomes neutral
- overtime supports a 10 s recent-control-loss grace and a 5 min safety cap; these rules remain mode-local
- `MatchController` is mode-aware while preserving the frozen Turf result path and player lifecycle
- CPU tactical goals become zone-aware through `CpuTacticalDirector`; all frozen CPU weapon, kit, Recast, Super Jump, damage, and lifecycle runtimes remain unchanged
- HUD / Tactical Map / DebugOverlay expose mode, control, counters, paint share, penalties, loss age, overtime elapsed/grace, and result
- an in-world four-edge objective outline is visible only in Splat Zones and changes neutral/A/B color with control
- Tactical Map draws the objective overlay after ink so the border cannot be hidden by map ink
- deterministic rule tests cover 70% capture, neutralization, ~60 s count pace, documented penalty examples, overtime entry/grace/retake/overtake/cap, and count-based winner resolution
- PR CI runs TypeScript check + unit tests + production build; Pages deploy is main-only

Freeze boundaries:
- `PaintCoordinator.processTick()` remains the sole immutable PaintEvent creation point
- GameplayInk remains the only gameplay truth; GPU ink remains visual-only
- PaintSurface-local coordinates remain canonical
- T14 Human weapon runtime and T19 CPU main-weapon parity are unchanged
- T16/T19C Sub/Special assignment, gauge attribution, and lifecycle semantics are unchanged
- T17/T18 Super Jump behavior is unchanged
- no broad refactor of ProjectileSystem, CpuAgentSystem, or PlayerController is part of T20

Reference audit note: Nintendo publicly describes the 100-count objective; Inkipedia documents the 70% series capture threshold, 36-frame count pacing, 0.75 control-period penalty formula, and Splat Zones overtime grace. The exact Splatoon 3 internal neutralization threshold was not independently confirmed, so the current 50% value is explicitly project tuning rather than an exact-internal-value claim.

T20 remains **IMPLEMENTATION CANDIDATE** until PR #4 is merged, Pages is redeployed from main, hosted Pages QA is accepted, and the final horizontal regression pass is closed.


## T21-A — Undertow Spillway Evidence Freeze / Measurement Ledger candidate — 2026-09-24

Base main HEAD: `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`.

Target source boundary: **Splatoon 3 normal PvP Undertow Spillway / マテガイ放水路, Ver.7.2.0+**. Pre-7.2 terrain, Big Run, and legacy Tricolor variants are excluded from common terrain.

T21-A is additive and does not replace the frozen gameplay/stage runtime. `PRODUCTION_STAGE_DEFINITION`, `PaintCoordinator`, `GameplayInk`, GPU visual ink, `ProjectileSystem`, `CpuAgentSystem`, `PlayerController`, Recast runtime, and T20 objective runtime are unchanged.

New canonical research layer:
- `StageMeasurementLedger` schema with `CONFIRMED / HIGH / PROVISIONAL / UNKNOWN`
- explicit XZ / Y / transition / surface semantics / evidence IDs
- Undertow common-terrain and rule-variant facts
- structural validation preventing UNKNOWN values from silently acquiring exact dimensions
- first spawn-side descent frozen as `ONE_WAY_DROP`; no slope/stairs/bidirectional or invisible CPU ramp
- center-low reference floor frozen at Y=0
- 20px/m and 1.5m vertical grid retained as HIGH rather than official/confirmed dimensions
- historical checkpoint value: spawn project Y=6.0 was superseded by the final Temple01 center-low normalization; current canonical spawn Y is 7.5
- the later vector outer-silhouette measurement supersedes the old ~146x87m provisional envelope

T21-B may convert the Turf map to metric XZ polygons using this ledger, but it must not promote PROVISIONAL/UNKNOWN dimensions without new evidence.


## T21-B metric calibration / T21-C entry checkpoint — 2026-09-24

The T21 research branch now contains an auditable 2D project-meter transform for the user-provided Turf rule map:

- source frame: 3508 x 2482 px
- origin: (1754, 1241) px
- spawn-axis anchors: (547, 647) / (2959, 1834) px
- scale: 20 px/m HIGH
- measured spawn separation: ~134.413 m
- project spawns: approximately Z=-67.262 m / +67.150 m
- origin-vs-spawn-midpoint residual: ~0.056 m
- 180-degree spawn symmetry residual: ~0.112 m

Only the spawn-center XZ anchors have been promoted to HIGH. The full spawn polygons, first-drop lips, central surface polygons, glass footprint, slopes, grates, water boundaries, and all unresolved vertical values remain unpromoted.

The prior ~146 x 87 m whole-stage estimate remains PROVISIONAL. In the project frame the long spawn axis is Z (~146 m) and the cross-stage axis is X (~87 m).

A new measurement-to-geometry gate enforces:
- T21-D blockout: CONFIRMED/HIGH exact values only
- Stable Freeze: CONFIRMED exact values only
- PROVISIONAL/UNKNOWN values cannot silently become exact geometry

No runtime stage geometry has been swapped in yet.


## T21-C vertical constraint checkpoint — 2026-09-24

The Undertow reconstruction now uses an explicit vertical constraint graph rather than a guessed absolute-height ladder.

Resolved for BLOCKOUT:
- center-low-floor = Y 0.0 m CONFIRMED
- center-small-step-top = Y 1.5 m via HIGH +1.5 m relation

**Superseded by the 2026-09-26 Temple01 local-geometry audit.** The earlier unseeded/candidate state is no longer current.

Current BLOCKOUT/HIGH vertical results after the final Temple01 center-low normalization:
- Team A/B spawn floor = project Y 7.5
- Team A/B first-drop landing = project Y 3.0
- first drop = -4.5m, ONE_WAY_DROP semantics retained
- right-small-drop upper = project Y 7.5
- right-low = project Y 4.5
- right small drop = -3.0m
- right-low -> glass-underpass floor = -4.5m HIGH
- glass-underpass floor -> glass high reference = +7.5m HIGH
- first-drop landing -> right-low = +1.5m HIGH

These HIGH values remain BLOCKOUT-only; STABLE_FREEZE still accepts CONFIRMED exact values only.


## T21-B recovered-vector source checkpoint — 2026-09-24

The original Turf source is now available from the user's uploaded PDF/JPEG archives. The matching JPEG is exactly 3508 x 2482 px, and the PDF contains vector CAD linework rather than a raster page.

The vector PDF is now the primary T21-B planimetric source; the JPEG and previous raster measurements remain cross-checks.

Superseding measurements:
- working vector scale: 4.8 pt/m HIGH, equivalent to the existing 20 px/m project transform
- refined spawn separation: ~134.190 m HIGH
- spawn centers: approximately X=+0.017 m, Z=-67.117 / +67.073 m
- source-origin vs spawn-midpoint residual: <0.03 m
- both first-drop lips: HIGH exact XZ polylines from vector hard edges
- first-drop lip plan length: 15.25 m each
- first-drop 180-degree XZ residual: <0.03 m
- two mapped cyan water hazards: CONFIRMED exact XZ polygons, ~33.004 m² each
- mapped-water 180-degree residual: <0.03 m

First-drop traversal semantics remain ONE_WAY_DROP CONFIRMED. Its later Temple01 local registration resolves the exact BLOCKOUT/HIGH magnitude to 4.5m; this supersedes the earlier candidate-only state.

The PDF does not justify flattening large closed source faces into gameplay floors. Spawn-floor outlines, center floor boundaries, glass, slopes, grate, and broader fall-out/void boundaries stay unresolved until source-line semantics are bound to gameplay evidence.

T21-B trace coverage is now 5 / 18 requirements measured. No runtime production stage swap has occurred.


## T21-B semantic binding / T21-D gate checkpoint — 2026-09-25

Using the recovered vector Turf PDF + matching 3508x2482 JPEG + current user gameplay captures:

- two symmetric glass-overhang XZ polygons are HIGH and GLASS/UNINKABLE semantics remain CONFIRMED
- each glass overhang plan area is ~62.796m² with <0.03m 180-degree residual
- internal dash fields prove the glass overhang contains slope-marked subregions; it must not become a single flat Y plane
- the glass vertical node is now a high-reference point, not a flat platform floor
- center-left/right slope dash markers are located around project X=-9.805/+9.805m, Z≈0 with <0.03m symmetry residual, but remain marker envelopes rather than collision footprints
- two symmetric white mesh/grate polygons are HIGH XZ, ~30.441m² each, GRATE/UNINKABLE CONFIRMED, Y UNKNOWN
- the second right-side L-edge is HIGH XZ on both sides, 16.90m plan length; later Temple01 local registration resolves its vertical delta to -3.0m HIGH
- right-low floor polygon itself remains unresolved
- mapped cyan water remains separate from white grate semantics

T21-B common trace coverage at that checkpoint: **8 / 18 measured**.

T21-D remains blocked by an automated readiness gate until the unresolved common boundary / spawn floors / center-low / small-step / under-glass passage / central slope hard footprints / right-low floor / broader fall-out boundary and required absolute Y constraints are resolved.

No production runtime stage geometry has been replaced.


## T21-B center/outer-vector checkpoint — 2026-09-25

The recovered Undertow PDF uses the same top-left/+Y-down coordinate convention as the matching 3508x2482 JPEG. This is now explicit and tested; PDF Y must not be inverted before the project XZ transform.

New canonical research facts:
- exact common exterior silhouette: 42 vertices, HIGH XZ
- outer span: X ~98.798m / Z ~156.528m HIGH under the project scale
- old X ~87m / Z ~146m PROVISIONAL envelope is superseded
- exterior silhouette rotational residual: <0.03m
- center-low face: exact HIGH XZ, ~28.830m²; Y=0 remains CONFIRMED
- central small-step pair: exact HIGH XZ, ~4.650m² each, 0.75m plan depth, +1.5m HIGH Y relation
- central slope dash envelopes refined to approximately (-9.909,+0.354) / (+9.931,-0.365) project XZ; they remain marker-only

T21-B trace coverage is **11 / 18 measured**.

The outer silhouette does not classify internal holes as kill voids. Spawn-floor polygons, under-glass walkable outline, central slope hard footprints, right-low floor and broader fall-out/void boundaries remain unresolved. T21-D runtime blockout remains gated.


## T21-B/C slope + readiness checkpoint — 2026-09-25

The exact dashed-hatch regions beside center are now HIGH XZ slope semantic footprints:
- each is ~3.30m x 11.975m / ~39.5175m²
- centers approximately (-9.909,+0.354) and (+9.931,-0.365)
- they remain continuous slope regions, not hard-wall geometry
- start/end Y are still UNKNOWN

T21-C now explicitly tracks both slopes' low/high endpoint Y values plus both grate elevations. A/B counterparts are symmetry-linked at HIGH confidence, but no absolute Y is fabricated.

The T21-D readiness gate now evaluates the BLOCKOUT vertical constraint solution instead of looking only at raw absolute fields. Thus center-small-step-top correctly resolves to Y=1.5, while glass/slope/grate/spawn/drop values without a valid seed remain blocking.

T21-B common trace coverage: **13 / 18 measured**.

Remaining XZ blockers are the two spawn-floor polygons, exact under-glass walkable outline, right-low floor polygon, and broader fall-out/void kill boundary. Production stage runtime remains unchanged.


## T21-B spawn-terrain / topology-limit checkpoint — 2026-09-25

Spawn-side plan reconstruction is no longer blocked:

- exact Team A/B connected white source faces containing the spawn rings are HIGH XZ
- each is ~1168.201m² with <0.03m 180-degree residual
- they are explicitly multi-elevation terrain envelopes, not flat spawn floors
- spawn-ring absolute Y remains a separate UNKNOWN vertical node

Trace-gate terminology is now `spawn-terrain-outline`, preventing accidental flat-floor interpretation.

T21-B common trace coverage: **15 / 18 measured**.

Only three XZ topology blockers remain:
- right-low floor elevation partition
- exact under-glass walkable/support-clearance outline
- internal/off-stage void kill boundaries beyond the already exact exterior silhouette and cyan water hazards

A structured source-topology audit documents that those three cannot be closed safely from the current top-down PDF alone. T21-D remains gated; no convenience polygons are substituted.


## T21-C center-side slope endpoint checkpoint — 2026-09-25

Vector adjacency now resolves the center-facing endpoint of both main central slopes:
- center-small-step-top = Y +1.5m at BLOCKOUT
- center-left slope low endpoint = Y +1.5m HIGH
- center-right slope low endpoint = Y +1.5m HIGH
- both slope high endpoints remain UNKNOWN

Main center slope dash regions are typed as semantic slope footprints; dash fields embedded inside the gray glass overhangs remain marker-only. No upper landing or slope grade is invented.


## T21-B/C final-source-gap checkpoint — 2026-09-25

The five existing gameplay videos were re-audited after the PDF topology pass. They corroborate the remaining right-low / under-glass / internal-gap topology but do not provide enough registered plan information to derive exact XZ boundaries safely.

A three-target minimal evidence-capture contract is now canonical:
1. RIGHT_LOW_PARTITION
2. GLASS_UNDERPASS_CLEARANCE
3. INTERNAL_VOID_CLASSIFICATION

Already-resolved areas are explicitly excluded from re-shooting. T21-D remains blocked rather than substituting convenient geometry.


## T21 targeted-capture integration checkpoint — 2026-09-25

The two requested 2026-09-25 gameplay captures are valid and are now canonical evidence.

Confirmed from the 2026-09-25 traversals:
- right-small-drop upper descends into the captured right-low open floor; Temple01 local registration later resolves this drop to 3.0m HIGH
- right-low route connects into the covered underpass; the clips confirm traversable continuity only and do not establish equal canonical floor Y
- the right-low area has at least one traversable ramp exit
- the underpass contains solid support/wall geometry that must become explicit navigation/collision exclusions

**2026-09-26 correction:** the earlier same-height binding between first-drop landing/open area and right-small-drop upper is invalid. IMG_6112.jpeg / IMG_6111.jpeg plus direct user observation establish only a red-guide-side < blue-guide-side floor ordering. The guide did not independently bind either visible side to a canonical floor node, so no first-drop-landing/right-low ordering or exact delta is promoted.

Capture state:
- RIGHT_LOW_PARTITION: CAPTURE_RECEIVED
- GLASS_UNDERPASS_CLEARANCE: CAPTURE_RECEIVED
- INTERNAL_VOID_CLASSIFICATION: NOT_YET_CAPTURED

The first two remain plan-registration blockers, not capture blockers. Do not ask the user to repeat them.

Future Undertow capture requests must always include a marked map with capture area, start, route/view direction, target boundary, and symmetry note.


## T21-B targeted-capture plan-registration checkpoint — 2026-09-25

The two received targeted captures are now registered to measured plan landmarks:

- right-low capture -> Team A measured right-small-drop lip
- underpass capture -> measured positive-Z glass-overhang footprint
- registration confidence is HIGH for capture-to-plan identity
- neither perspective clip is promoted to an exact XZ polygon

The right-low perimeter remains non-unique because the clip does not expose a second independently measured plan anchor with enough metric precision to bind every wall/ramp corner to one PDF vertex. The underpass remains non-unique because the PDF has no independent lower-layer support/clearance path beneath the upper glass projection.

Source-topology status for both is now PLAN_REGISTERED_POLYGON_UNRESOLVED. Common trace coverage intentionally remains **15 / 18**. The two capture categories are complete and must not be requested again.

T21-D remains blocked; production runtime geometry is unchanged.


## T21-B internal-void ambiguity checkpoint

- The post-7.2 central undercut pair is classified HIGH as traversable lower-layer topology, not an abyss.
- The received right-low -> underpass overlap remains HIGH traversable. Equal-Y semantics are explicitly not inferred from the perspective clips.
- No concrete remaining internal blank can currently be localized strongly enough to justify another capture.
- `INTERNAL_VOID_CLASSIFICATION` therefore stays `DEFERRED_PENDING_MAP_ENUMERATION`; request-ready capture IDs remain empty.
- This is deliberately **not** an exhaustive no-internal-void claim.
- `fall-out-void-kill-boundary` remains UNTRACED; trace coverage remains 15/18.
- T21-D blockout remains disabled.
- Validation head before this documentation checkpoint: `dede055dedaa10c34b6f4fa1c9d3aa7368910cc8`, Actions run #502 / `36194505652`: PASS.


## T21-C vertical evidence decomposition checkpoint

The current HIGH/CONFIRMED vertical graph is audited by connected component.

- center component is seeded from center-low Y=0
- spawn / first-drop landing / right-low / right-small-drop upper / glass references now form one exact HIGH seeded component through the Temple01 local registration
- slope-high pair and grate pair remain separate unseeded components

The corrective stills themselves remain qualitative only; the exact graph edges come from the independently registered Temple01 OBJ.


## T21-C first-drop interpretation correction — 2026-09-26

The previous marked side-profile request is invalidated because its topology premise was wrong.

Corrected evidence state after final Temple01 normalization:
- user-observed red-guide-side floor < blue-guide-side floor — CONFIRMED qualitative ordering
- red lower side -> Team A first-drop landing = project Y 3.0 HIGH
- red upper side -> Team A spawn floor = project Y 7.5 HIGH
- blue lower side -> right-low = project Y 4.5 HIGH
- blue upper side -> right-small-drop upper = project Y 7.5 HIGH
- first-drop landing = right-small-drop upper — REMOVED / INVALID
- first-drop exact magnitude = 4.5m HIGH
- right-small-drop exact magnitude = 3.0m HIGH

The old `FIRST_DROP_MAGNITUDE_SIDE_PROFILE` request is now `SUPERSEDED_BY_TEMPLE01_GEOMETRY`; no replacement user capture is needed for these magnitudes. PR #5 remains Draft / unmerged and T21-D remains gated by remaining XZ plus slope-high/grate Y blockers.


## T21-C line-side semantic audit — 2026-09-26

The red/blue marked-guide correction was re-audited against all existing local evidence.

Canonical result:
- vector-line geometry identities remain HIGH
- pre-model media alone was insufficient to bind the line sides
- Temple01 OBJ local registration now resolves the red/blue canonical floor sides at HIGH confidence
- registered first-drop lips match the 10.5<->6.0 model-Y discontinuity
- registered right-small-drop lips match the 10.5<->7.5 model-Y discontinuity
- after the final center-low model-Y=3.0 normalization, these are project Y 7.5<->3.0 and 7.5<->4.5
- the user's red-lower < blue-lower observation is reproduced by 3.0 < 4.5
- the superseded three-terrace interpretation remains forbidden

T21-D stays gated for remaining geometry evidence; no first-drop recapture is needed.


## T21-C current model identity / external geometry gate — 2026-09-26

Current remodeled Undertow identity is now source-locked:

- scene: `Vss_Temple01`
- model: `Model/Fld_Temple01.bfres`
- `Vss_Temple00` / `Fld_Temple00.bfres` = pre-remodel only
- `Vss_Nagasaki03` / `Fld_Nagasaki03.bfres` = Sturgeon Shipyard; forbidden as Undertow geometry

The KiTrix `Vss_Temple01.obj` LFS body has now been read in CI: 43,263,289 bytes, 375,948 vertices. Common `Fld_Temple01` plus Turf `PntSet` geometry yields 70,396 active audit triangles.

Only locally verified registration is promotable. The four red/blue drop-lip segments coincide with the expected OBJ height-discontinuity contours within 0.163m in the 0.5m audit raster. The full exterior registration still has a large p95 residual, so arbitrary PDF->OBJ projection remains forbidden.

T21-D remains gated and runtime geometry remains unchanged.


## T21-C remodeled 3D source checkpoint

External-source audit now fixes the correct remodel model family:

- Nintendo Ver.7.2.0: Undertow terrain changed in all modes
- Leanny 7.2.0 metadata: `Vss_Temple01` = マテガイ放水路（改修後）, preload `Fld_Temple01.bfres`
- `Vss_Temple00 / Fld_Temple00` is pre-remodel and must not be used for the current T21 target
- Salmon Run `Temple_Low/Mid/High` images are wrong-mode evidence and excluded
- KiTrix BFRES-derived 43,263,289-byte `Vss_Temple01.obj` LFS body is now readable through the CI audit
- 375,948 vertices were parsed; common + Turf `PntSet` local geometry was audited
- KiTrix StageLoader display-name mapping is known-wrong and is not provenance evidence
- locally verified drop-lip geometry is promotable at HIGH confidence; blanket full-model registration is not

Promoted BLOCKOUT/HIGH Y values are limited to the locally verified chain: spawn 7.5, first-drop landing 3.0, right-low 4.5, right-small-drop upper 7.5, glass-underpass floor 0, glass high reference 7.5, first drop -4.5, right drop -3.0, right-low -> underpass -4.5, underpass -> glass high reference +7.5.


## T21-B Temple01 XZ contour checkpoint — 2026-09-26

Temple01 local floor extraction now promotes two XZ blockers to HIGH/BLOCKOUT-safe:

- `center-low-floor-outline` -> MEASURED
  - model Y=3.0m = canonical project Y=0
  - two symmetric connected components
  - 0.125m raster, <=0.20m contour simplification
- `right-low-floor-outline` -> MEASURED
  - model Y=7.5m = project Y=4.5
  - seeded from the locally verified lower side of the right-small-drop lip
  - two symmetric connected components with explicit holes

At this checkpoint trace coverage was **16/18**. It is superseded by the later glass-underpass promotion checkpoint below.

At this checkpoint the remaining XZ blockers were:
- `glass-underpass-outline`
- `fall-out-void-kill-boundary`

Vertical BLOCKOUT blockers were already closed.


## T21-C cross-file vertical semantic reconciliation — 2026-09-26

The Temple01 local geometry audit is the single metric authority for the right-low / glass-underpass / glass-high-reference chain.

Current canonical project Y:
- right-low = 4.5m HIGH
- glass-underpass walkable floor = 0.0m HIGH (model Y=3.0m)
- glass-overhang high reference = 7.5m HIGH (model Y=10.5m)
- right-low -> glass-underpass = -4.5m HIGH
- glass-underpass -> glass-high-reference = +7.5m HIGH

The two 2026-09-25 traversal captures remain canonical topology evidence, but their former same-height interpretation is superseded. RIGHT_LOW -> GLASS_UNDERPASS is represented as non-metric traversable route continuity; it carries no capture-derived delta-Y.

UndertowSpillwayVerticalSemanticInvariant.test.ts now cross-checks RemodelGeometryAudit, VerticalModel, CaptureTopology, MeasurementLedger, and SourceTopologyAudit so green CI cannot silently preserve conflicting vertical authorities.


## T21-B glass-underpass XZ promotion checkpoint — 2026-09-26

The remaining under-glass XZ blocker is now resolved from remodeled Temple01 geometry at HIGH/BLOCKOUT confidence.

Audit method:
- seed the connected model-Y=3.0 / project-Y=0 walkable floor beneath each registered glass structure
- retain only cells physically roofed by Temple01 BridgeMetal / Glass geometry
- subtract floor-level Pillar/Wall solid cells
- raster resolution = 0.125m
- contour simplification <=0.15m
- preserve support/obstruction holes explicitly

CI #631 results per side:
- roofed floor = 3951 cells
- floor-level obstacles = 88 cells
- navigable floor = 3863 cells = 60.359375m²
- outer contour signed area ≈61.094m²
- one support hole ≈0.672m²
- 180-degree raw-mask XOR = 0 cells
- missing = 0, extra = 0, mirror-XOR area = 0.000m²

Canonical consequences:
- `glass-underpass-outline` -> MEASURED HIGH
- source topology -> `RESOLVED_FROM_TEMPLE01_MODEL`
- MeasurementLedger stores center-low, right-low, and glass-underpass layered geometry as `POLYGON_SET` so multiple symmetric components and holes are not flattened
- common trace coverage = **17/18**
- the only remaining XZ blocker is `fall-out-void-kill-boundary`
- all BLOCKOUT vertical blockers remain closed
- T21-D remains gated; production runtime geometry is still unchanged
- PR #5 remains Draft / unmerged
