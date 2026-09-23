## v0.9.5 T14 Stable Freeze — 2026-09-23

- final hosted runtime QA accepted by the user
- stable checkpoint: `006f9b8ddb4a818ac0ba64a3ec18f30640a07dc4`
- GitHub Actions run #136 / `35830846217` passed build and Pages deploy
- T0–T14 is now the frozen gameplay foundation
- next phase: T15 Sub Weapon + Special Gauge Foundation

## v0.9.5 T14 Two-Ring Charge Candidate — 2026-09-23

- added explicit first/second charge-ring data to charge-capable weapon profiles
- Rotor Cannon now follows Splatling-style charge staging: ring 1 establishes maximum projectile range/speed while ring 2 mainly increases firing duration
- Rotor Cannon tuning now uses 0.80 s first ring / 1.20 s full charge and approximately 18 / 36 shot first/full volleys
- Chord Stringer now uses 0.50 s first ring / 1.20 s full charge
- Chord Stringer direct damage reaches 35 by ring 1, ring 1 unlocks independent 0.75 s delayed explosions, and ring 2 converges the three-arrow spread while extending range/paint
- Stringer ink consumption now follows the 5 / 6 / 8.5 charge progression
- added separate two-ring HUD rendering, first-ring feedback pulse, two-stage 3D charge feedback, and Debug charge-ring state
- T0–T13 Freeze and PaintRequest -> immutable PaintEvent authority are unchanged

## v0.9.4 T14 Dualies Post-Roll / Splatling Charge Candidate — 2026-09-23

- Dualies dodge now requires Human form + Dualies + primary fire held + non-zero movement input + Space; stationary fire+Space remains a normal jump.
- Split Dualies dodge into fixed-step startup / roll / firing-recovery / post-roll movement-recovery phases using the publicly documented 4F + 12F + 4F + 28F Splat Dualies structure as the reference.
- Post-roll focus now begins from actual roll completion instead of being consumed during startup / roll.
- Dualies may chain the second dodge from the post-roll stance when the player is still firing and presses Space.
- Splatling charge presentation now uses a Charger-like centered progress reticle and forward guide, while retaining subtle rotary markers.
- T0–T13 Freeze and PaintRequest → immutable PaintEvent authority are unchanged.

## v0.9.3 T14 Charge / Dualies / Stringer Candidate — 2026-09-23

- added distinct charge HUD + 3D feedback for Charger, Splatling, Stringer, and Splatana
- moved Dualies dodge to Space in Human form
- upgraded Dualies to two-chain dodge charges with short endlag and post-roll focused fire
- suppressed shooting during Dualies dodge/endlag
- changed Stringer charge timing to 1.20s full / 0.50s first charge
- changed charged Stringer arrows to visible independent 0.75s fuses on impact
- added explicit fuse/burst visual feedback and debug counters

Implementation:
`72649bc1f896dcb2eff1d73620ec52bceaf0918c`

Workflow:
`35824436471`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

## v0.9.2 T14 Weapon-Class Redesign Candidate — 2026-09-23

- supersedes the rejected first-pass 11-class implementation
- converted Charger to immediate charged ray/beam instead of ordinary projectile fire
- converted Roller to horizontal/vertical flick + continuous rolling paint + contact melee
- converted Brush to direct short-range swipe damage/painting with movement boost
- added Slosher trajectory paint droplets
- retained true charge-release Splatling burst behavior
- upgraded Brella to visible directional canopy with HP, break, recovery, and front-only blocking
- upgraded Stringer to charge-tightened triple arrows with delayed charged-arrow explosions
- upgraded Splatana to direct melee slash damage/painting plus traveling slash wave
- added Dualies post-dodge focused firing state
- added class-specific Human movement multipliers

Implementation:
`f017d1e5de8744fc95239ff773a26b531b9c883a`
`4c366282a20cf58a32e698259de8b51686723829`
`bccec88cf6a4898a06305c3e2aad1e016e90d9a4`

Workflow:
`35820796731`

- TypeScript: PASS
- production build: PASS
- Pages deploy: PASS
- hosted runtime QA: PENDING

## v0.9.1 T14 11-Weapon-Class Candidate — 2026-09-23

- expanded the weapon model from simple per-projectile tuning to 11 Splatoon-style weapon genres
- added original representatives for Dualies, Charger, Roller, Brush, Slosher, Splatling, Brella, Stringer, and Splatana/Wiper while retaining Shooter and Blaster representatives
- added charge/release, burst, spread, blast, rolling paint, guard, and charge-scaled multi-shot runtime behavior
- added RMB Dualies dodge and Brella guard
- added Q/E full weapon cycling while preserving 3/4/5 Pulse/Needle/Arc shortcuts
- added weapon class/action/charge/guard debug and HUD state
- added CPU/QA area-damage support for Blaster explosions
- CPU combat weapon remains Pulse Sprayer for isolation of player-side QA

Implementation:
`c1b3f5a6219375a9bb01a2aaf9c59d16e9c18914`
`24d384d60fb7937f76a424ff1f5e845cfaeb0f38`
`31f441f13740536ed5ceecde518df879fbef21ef`

Workflow:
`35819670569`

- TypeScript: PASS
- production build: PASS
- Pages deploy: PASS
- hosted runtime QA: PENDING

## v0.9.0 T14 Content / Weapons / Feedback Candidate — 2026-09-23

### Weapons

- added original Pulse Sprayer / Needle SMG / Arc Blaster weapon profiles
- preserved the pre-T14 standard shooter exactly as Pulse Sprayer
- added 3 / 4 / 5 weapon switching and HUD/control-panel weapon state
- added per-profile cadence, projectile speed/gravity/lifetime, damage, paint radius, visual size, and Ink cost

### Feedback / animation

- added pooled muzzle/impact/Splat/Respawn visual pulses
- added original procedural Web Audio weapon/impact/lifecycle tones
- added lightweight audio-event throttling
- added render-only Human, Squid, Squid Roll-preserving, and CPU procedural motion

Implementation:
`c65b0ea44271cffea48e5efd8bd1c4e734f8bc1a`
`a628b4c0b85133261b52a0b67d12d14eb83d308f`
`c85ef99f070f74b54d36d18deda01b1ae296b4dd`
`a4fc8f57ce55fff57e7048f8a162ba798ee8e236`
`c819e10783f2aa9e5b29641e367f53fb1dc87c29`

Workflow:
`35818653041`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

## v0.8.0 T13 Stable Freeze — 2026-09-23

### Freeze

- full hosted T13 HUD/Tactical Map QA accepted
- Tactical Map vertical-orientation correction accepted
- enlarged 32×24m INKWORKS JUNCTION production arena accepted
- far-end spawn / CPU spawn / tactical-node metadata accepted
- new cover collision / pathing / projectile blocking accepted
- scoreable paintable cover tops accepted
- Tactical Map enlarged-stage alignment accepted
- Coordinate Audit and GPU ink alignment accepted
- 4v4 performance sanity accepted
- T8–T12 regression sanity accepted

Stable T13 production-stage checkpoint:
`fc647806c59e43831a978897baa21e359c5305d7`

Automated production-stage workflow:
`35817233372`

T13 is now **STABLE FREEZE**. Next planned phase: T14 — content, animation, audio, additional weapons, polish.

## v0.8.0 T13 Production Geometry Candidate — 2026-09-23

- HUD / Tactical Map hosted QA accepted
- fixed and accepted Tactical Map vertical orientation
- expanded main arena to 32×24m
- expanded outer rails and world bounds
- added eight production cover structures with scoreable paintable tops
- moved human spawn, CPU spawn slots, and tactical nodes into Stage metadata
- retained original upper/ramp/wall/bridge validation structures

Implementation:
`fc647806c59e43831a978897baa21e359c5305d7`

Workflow:
`35817233372`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted production-stage QA: PENDING

## v0.8.0 T13 Stage / HUD / Tactical Map Candidate — 2026-09-23

### Production-stage contract

- promoted the validated stage definition to a production metadata contract
- added stage id/name, world bounds, and team spawn metadata
- retained the legacy test-stage alias for frozen-system compatibility

### Player-facing HUD

- added stage name, match timer, live Turf percentages and balance bar
- added player Ink/HP meters and compact state strip
- added countdown, Splat/Respawn, and match-result center messaging

### Tactical Map

- added compact bottom-right live map with M-key expansion
- added world-bound projection of stage geometry
- added authoritative Turf visualization
- added team spawn rings and live human/CPU markers

Implementation:
`936ab4d90c17c0d08920ccf996bfd766535aec59`
`32a0430626034417a0e85a66511e4efb41fd17aa`

Workflow:
`35815754011`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

## v0.7.0 T12 Stable Freeze — 2026-09-23

### Freeze

- full hosted T12 navigation/tactical QA accepted
- full hosted CPU combat/lifecycle QA accepted
- Recast/NavMesh/Crowd routing accepted
- seven-agent role/turf behavior accepted
- CPU Ink/HP and shared projectile combat accepted
- human↔CPU and CPU↔CPU damage accepted
- CPU Splat/Respawn accepted
- 4v4 performance sanity accepted
- T8–T11 regression sanity accepted

Stable T12 gameplay checkpoint:
`1ecc6543d7f5f3f226a3cb0134ff129045ea09ef`

Automated implementation workflow:
`35814249152`

T12 is now **STABLE FREEZE**. Next planned phase: T13 — production stage / HUD / tactical map.

## v0.7.0 T12 CPU Combat / Lifecycle Candidate — 2026-09-23

- navigation/tactical hosted QA accepted
- added CPU Ink/HP resource state
- added CPU weapon fire intents through shared ProjectileSystem
- added human↔CPU and CPU↔CPU projectile damage
- added team-based friendly-fire exclusion
- added CPU Splat removal from Crowd
- added CPU Respawn with full HP/Ink and recreated Crowd agent
- added CPU combat/lifecycle debug metrics

Implementation:
`1ecc6543d7f5f3f226a3cb0134ff129045ea09ef`

Workflow:
`35814249152`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted combat/lifecycle QA: PENDING

## v0.7.0 T12 Recast / CPU Tactical Candidate — 2026-09-23

### Navigation

- added `recast-navigation 0.43.1`
- added Vite optimizeDeps exclusion for Recast WASM integration
- generated runtime solo NavMesh from canonical StageDefinition boxes
- added shared Detour Crowd fixed at 60 Hz

### CPU roster / tactics

- added seven visible CPU agents
- added balanced 4v4 roster relative to selected human team
- added Painter / Skirmisher / Anchor roles
- added staggered tactical retargeting
- added authoritative GameplayInk-aware Painter target scoring
- added Crowd separation / avoidance
- added CPU turf contribution through PaintRequest / PaintEvent
- added CPU render interpolation and performance/debug counters

Implementation:
`f8fced0a205efd5ed09b8470757a6ec2833b7e8f`
`05db5bd5484105d5ca060a40dec5181ea1f033e9`
`2578c83ba50911f7163beef3ce42c8e485ab4254`

Workflow:
`35813586805`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

CPU combat/lifecycle remains intentionally pending inside T12.

## v0.6.0 T11 Stable Freeze — 2026-09-23

### Freeze

- full hosted T11 QA accepted by the user
- countdown / 180-second match timer accepted
- HP-zero Splat and 2.5-second Respawn accepted
- team-specific spawn reset accepted
- Turf result / tie resolution accepted
- Restart Match full reset accepted
- T8/T9/T10 regression sanity accepted

Stable T11 gameplay checkpoint:
`037865af7e433499cf2a08c6f973b09131369d1a`

Automated implementation workflow:
`35812515353`

T11 is now **STABLE FREEZE**. Next planned phase: T12 — CPU players / Recast navigation + tactical layer.

## v0.6.0 T11 Implementation Candidate — 2026-09-23

### Match flow

- added COUNTDOWN / PLAYING / ENDED match states
- added 3-second start countdown and 180-second Turf War timer
- added Turf result snapshot with Team A / Team B / TIE outcome
- added Restart Match and End Match QA controls

### Player lifecycle

- added ACTIVE / SPLATTED life states
- added HP-zero Splat transition
- added 2.5-second respawn timer
- added team-specific respawn positions
- added Human-form / full-resource respawn reset
- added Splat QA damage trigger through the real T10 HP path
- clears active projectiles on splat, match end, and restart

Implementation:
`340f0f81b579d18c9072bdfd48aef77885b374af`
`0cd939c5b681264999f77791b62b5f2b2c755c53`
`037865af7e433499cf2a08c6f973b09131369d1a`

Workflow:
`35812515353`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

## v0.5.0 T10 Stable Freeze — 2026-09-23

### Freeze

- full hosted T10 QA accepted by the user
- Ink Tank consumption / dry-fire / recovery accepted
- Human and OWN-Squid recovery behavior accepted
- player HP / enemy-ink damage / recovery accepted
- team-aware combat target damage accepted
- target down / QA auto-reset accepted
- T8/T9 regression sanity accepted

Stable T10 gameplay checkpoint:
`b42db91f53ddbed56e1c14c571408d6f68e20871`

Automated implementation workflow:
`35811304576`

T10 is now **STABLE FREEZE**. Next planned phase: T11 — spawn / splat / respawn / Turf War match loop.

## v0.5.0 T10 Implementation Candidate — 2026-09-23

### Ink economy

- added 100-unit Ink Tank
- added per-shot Ink consumption and dry-fire rejection
- added post-fire recovery lock
- added Human slow recovery and OWN-ink Squid fast recovery

### Combat foundation

- added player HP / recovery state
- added non-lethal enemy-ink HP damage
- added Team A/B damageable QA targets
- added enemy-only projectile damage and nearest-hit arbitration
- added QA target down / short auto-reset behavior
- added combat / Ink / HP debug metrics

Implementation:
`e70b7bca293ba259a4e3f4c70668aa4d7aae9c92`
`b42db91f53ddbed56e1c14c571408d6f68e20871`

Workflow:
`35811304576`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

## v0.4.0 T9 Stable Freeze — 2026-09-23

### Freeze

- full hosted T9 QA accepted by the user
- coordinate / GPU atlas pipeline accepted
- Human/Squid collider switching accepted
- own/no-ink/enemy-ink locomotion behavior accepted
- Squid Roll accepted
- OWN-wall swimming accepted
- wall Surge accepted
- Squid fire suppression / Human fire accepted
- T8 camera and projectile-blocker regression sanity accepted

Stable T9 gameplay implementation checkpoint:
`0b95810314e5f91b047577eba4a94c6f9db89100`

Automated implementation workflow:
`35810161552`

T9 is now **STABLE FREEZE**. Next planned phase: T10 — shooter + ink economy + combat.

## v0.4.0 T9 Hosted Partial QA — 2026-09-23

- hosted coordinate audit confirmed PASS 4/4
- hosted GPU atlas origin fix confirmed visually
- Roll QA Pad full-floor rendering confirmed
- authoritative full main-floor turf confirmed at 252.0 m² / 76.62%
- main-floor OWN sampling confirmed
- Squid Roll confirmed operational by the user
- T9 remains unfrozen pending wall swim, Surge, and final regression checks

## v0.4.0 T9 GPU Atlas Origin Fix — 2026-09-23

- isolated reported main-floor visual failure to GPU atlas sampling rather than CPU/world coordinates
- corrected top-origin atlas allocation/render coordinates to bottom-origin surface texture UV sampling
- centralized GPU atlas transforms in `AtlasCoordinates.ts`
- added startup atlas write↔sample coordinate contract checks
- preserved canonical CPU PaintEvent U/V and GameplayInk ownership

Fix commit:
`0b95810314e5f91b047577eba4a94c6f9db89100`

Workflow:
`35810161552`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted visual recheck: PENDING

## v0.4.0 T9 Visual Coordinate QA — 2026-09-23

- extended stage-coordinate audit to backing-solid face normals and tangential OBB bounds
- added deterministic `Coord QA` button
- `Coord QA` stamps every PaintSurface at known local U/V coordinates
- matching render-only 3D markers are placed at the exact local→world points
- marker pattern is intentionally asymmetric to reveal U/V flips, rotations, and per-surface offsets
- updated control-panel milestone label to T9 Candidate

Implementation:
`13590bcc8d7b8ee0ca6a17e106bde97f2c83c66b`
`a152aed2f9fcc390c39172c8264b8ca775244719`

Workflow:
`35809531970`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted visual QA: PENDING

## v0.4.0 T9 Coordinate Audit Candidate — 2026-09-23

- unified world→PaintSurface coordinate conversion
- added local↔world and PaintSurface↔backing-solid startup invariants
- added atlas allocation coordinate checks
- added runtime Player/sample/PaintEvent coordinate diagnostics
- changed Roll QA Pad from an 85.4375 m² central strip to a complete main-floor fill
- preserved T0–T8 coordinate and PaintEvent contracts

Commits:
`63c81fc200a7c233b88e9f10e94e3876532cad72`
`4cabccc142e08690a169e9472e12c0812ca81532`

Workflow:
`35807116117`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted coordinate QA: PENDING

## v0.4.0 T9 Candidate Fix — 2026-09-23

- made Squid Roll input forgiving by buffering a qualifying reverse turn for 0.20 s
- loosened the reverse-angle threshold slightly so keyboard direction changes register more reliably
- added visible rotation during SQUID_ROLL so activation is obvious during QA
- changed neutral/no-ink Squid movement to Human-equivalent speed and acceleration
- retained enemy-ink slowdown
- added a `Roll ready` debug readout
- preserved T0–T8 contracts

Fix commit:
`cffcc72028863cb3c538dc9bfc16d2e470166af0`

Workflow:
`35805455465`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

## v0.4.0 T9 Implementation Candidate — 2026-09-23

### Squid / ink locomotion

- added separate Human capsule and Squid ball Rapier colliders on one kinematic body
- preserved foot baseline across form switching
- added explicit HUMAN / SQUID_DRY / SWIM_GROUND / SWIM_WALL / SQUID_ROLL / SURGE_CHARGE / SURGE states
- retained CPU-authoritative floor ink relation and added OWN-wall sampling
- added OWN-ink wall swimming
- added project-tuned Squid Roll and wall Surge locomotion actions
- suppressed main fire while in Squid form
- expanded debug overlay with locomotion/collider/wall/Surge state
- preserved T0–T8 ink and world-interaction contracts

### Validation

Implementation commit:
`110f925fe830ea2aa3865b3c88525c81d1e08f92`

Workflow:
`35804869663`

- TypeScript: PASS
- production build: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PENDING

T9 remains an implementation candidate until hosted QA is accepted.

# CHANGELOG

## v0.3.0 T8 Stable Freeze — 2026-09-23

### Added

- Added a shared stage-solid definition layer for render/physics/world-query relationships.
- Added Rapier scene-query based projectile blockers for non-paintable stage geometry.
- Added nearest-hit arbitration between frozen PaintSurfaces and backing solids without changing CPU-authoritative U/V.
- Added non-paintable projectile consumption without creating fake PaintRequests/PaintEvents.
- Added blocker-aware center-ray aim targeting.
- Added third-person camera obstruction against stage solids.
- Added immediate camera retraction plus damped recovery after obstruction clears.

### Preserved

- T0–T7 stable gameplay checkpoint remains `d93f5bf0cfb261515e5ad5081b1b7599e1efbdbf`.
- Fixed 60 Hz gameplay simulation remains unchanged.
- Player physics remains custom movement + Rapier kinematic character controller.
- Projectiles remain pooled swept projectiles.
- CPU gameplay ink remains authoritative.
- PaintSurface-local U/V remains canonical.
- `PaintCoordinator.processTick()` remains the only PaintEvent creation point.
- GPU visual ink still consumes the same immutable PaintEvent.

### Automated validation

Implementation commit:
`234180436b27e0c9498c8d253348b2c366f839ce`

Workflow:
`35803236486`

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted runtime QA: PASS — user confirmed

### Freeze

Hosted QA was completed and accepted by the user on 2026-09-23. T8 is now **STABLE FREEZE**.

Stable T8 gameplay implementation checkpoint:
`234180436b27e0c9498c8d253348b2c366f839ce`

## v0.2.0 Stable Freeze — 2026-09-23

### Stabilized

- Replaced hold-to-drag camera control with standard browser TPS Pointer Lock mouse look.
- Added safe Pointer Lock acquisition/release behavior and cleared stuck movement/fire state on unlock, blur, and visibility loss.
- Reserved the first click for Pointer Lock acquisition so entering gameplay does not accidentally fire.
- Corrected TPS camera vertical mouse direction.
- Changed aiming to use the actual center-screen camera ray.
- Added muzzle-to-crosshair targeting instead of assuming camera-forward and muzzle-forward are identical.
- Added a low-arc ballistic launch solution so configured projectile gravity still converges toward the center-crosshair target.
- Synchronized camera state before fixed simulation and during catch-up ticks to remove render-FPS-dependent aim lag.
- Added render interpolation for player and projectile presentation while retaining fixed 60 Hz gameplay simulation.
- Preserved fractional fire-cooldown remainder to avoid permanent fixed-tick cadence drift.
- Prevented nearby wall ink from contaminating feet-level movement ink sampling.
- Corrected GPU visual ink vertical orientation while preserving CPU-authoritative PaintEvent U/V.
- Added PaintSurface geometry/basis invariants.
- Added invalid frame-delta protection.
- Added GPU brush Uint16 batch-capacity protection.
- Added QA shortcut key-repeat suppression.

### Final validation

Stable gameplay checkpoint:
`d93f5bf0cfb261515e5ad5081b1b7599e1efbdbf`

Workflow:
`35800320770`

Results:

- dependency install: PASS
- TypeScript check: PASS
- production build: PASS
- Pages artifact upload: PASS
- GitHub Pages deploy: PASS
- hosted iterative QA: completed for this phase and accepted by the user

### Freeze

T0–T7 is now treated as the stable foundation for the next development phase.

The next planned phase is **T8 — World Interaction Foundation**, focused on projectile blockers, render/physics/PaintSurface relationship, and third-person camera obstruction before combat, AI, and the complete match loop are added.

## v0.2.0 — 2026-09-22

### Added

- Added T4 human movement with camera-relative WASD input, acceleration/deceleration, custom gravity, jump, slope handling, autostep, ground snap, and Rapier kinematic character collision.
- Added pinned `@dimforge/rapier3d-compat 0.20.0`.
- Added T5 Human/Squid state machine and authoritative CPU gameplay-ink sampling through each PaintSurface local basis.
- Added own/enemy/neutral/non-swimmable movement hooks. Current tuning values are project-owned temporary tuning, not claimed Splatoon internals.
- Added T6 pooled standard-shooter projectiles. Projectiles are not dynamic rigid bodies and use previous-position → next-position segment sweep each fixed tick.
- Added T7 projectile impact resolution to PaintSurface identity + surface-local U/V, followed by the existing PaintRequest → immutable PaintEvent → CPU/GPU pipeline.
- Added third-person camera, aiming crosshair, player/projectile debug metrics, and updated controls.

### Preserved

- T0–T3 CPU gameplay ink remains the only gameplay-authoritative ink representation.
- GPU ink remains persistent visual data.
- `PaintCoordinator` still creates exactly one immutable PaintEvent for each queued PaintRequest; CPU and GPU consume that same event.
- Surface-local 0.125 m gameplay grids, dirty-tile architecture, turf delta accounting, atlas layout, WebGPU-first renderer, and fixed 60 Hz simulation remain intact.

### Initial validation

- GitHub Actions dependency install: PASS.
- `npm run typecheck`: PASS.
- Vite production build: PASS.
- GitHub Pages configure/upload/deploy: PASS.
- Workflow run: `35745535871`.
- First deployed code commit: `b065157f3a86bb8aceb6c922d9791ce25403c0fa`.

## v0.1.2 — 2026-09-22

### Added

- Added GitHub Actions CI/CD for automatic dependency install, TypeScript checking, Vite production build, GitHub Pages artifact upload, and deployment.
- Added fixed hosted QA URL: https://ryomashibaba.github.io/browser-ink-tps/

### Changed

- Pinned direct dependency versions for the stabilized T0–T3 checkpoint.
- Updated canonical/validation documentation to reflect actual CI and hosted-browser verification.

### Fixed

- Fixed three TypeScript literal-type narrowing errors discovered by the first real dependency-resolved CI typecheck.
- Confirmed the previous high-DPI left-click painting fix works in the hosted browser build.

### Validation

- GitHub Actions: dependency install PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- GitHub Pages configure/upload/deploy: PASS.
- Hosted build opened successfully by the user.

## v0.1.1 — 2026-09-22

### Fixed

- Fixed left-click painting on high-DPI / device-pixel-ratio displays. Mouse coordinates are now passed to PlayCanvas `CameraComponent.screenToWorld()` in canvas CSS pixel coordinates instead of incorrectly scaling them to the render-buffer resolution.
- Kept orbit dragging, wheel zoom, PaintEvent generation, CPU gameplay ink, GPU atlas rendering, and all T0–T3 canonical behavior unchanged.

## v0.1.0 — 2026-09-22

### Added

- Vite + TypeScript + PlayCanvas Engine 2 standalone project foundation.
- WebGPU-preferred graphics-device bootstrap with WebGL2 fallback path.
- Fixed 60 Hz simulation clock independent of rendering.
- T0 debug/performance overlay.
- Surface-local `PaintSurface` system with 0.125 m gameplay cells.
- Paint flags, per-cell turf weighting, 16×16 dirty tiles, tile revisions.
- Shared immutable `PaintEvent` pipeline.
- CPU oriented-ellipse rasterization.
- Incremental Team A / Team B turf accounting.
- Persistent RGBA8 GPU visual ink atlas.
- Atlas allocator with per-surface rectangles and constant pixels-per-meter packing.
- Batched atlas brush rendering rather than per-impact decal entities.
- Dual GLSL/WGSL shaders for GPU brushing and painted surface visualization.
- Scoreable floor/ramp and non-scoreable paintable wall test surfaces.
- Original bright near-future QA arena.
- Orbit/click paint QA camera.
- 250-event and 2000-event stress tools.
- Central separation between inherited reference constants and original game implementation tuning.
- `README.md` and `CURRENT_CANONICAL.md` handoff documentation.
