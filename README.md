# Browser Ink TPS

A standalone PC-browser 3D ink TPS built with **TypeScript + Vite + PlayCanvas Engine 2**.

This is an original project that uses territory-painting and third-person-shooter mechanics as systems-level references. It does not copy Nintendo characters, stages, models, textures, UI assets, audio, logos, or other protected game assets.

## Hosted build

https://ryomashibaba.github.io/browser-ink-tps/

The normal workflow is GitHub-first: changes on `main` are dependency-installed, typechecked, production-built, and deployed by GitHub Actions.

## Current milestone

**v0.10.0 / T15 STABLE FREEZE**

Stable gameplay checkpoint:
`d93f5bf0cfb261515e5ad5081b1b7599e1efbdbf`

The T0–T14 gameplay foundation is frozen. The next implementation phase is T15 — Sub Weapon + Special Gauge Foundation:

- third-person Human movement
- Rapier kinematic character collision
- jump / gravity / slope handling
- Human/Squid form with separate capsule/ball physical colliders
- explicit HUMAN / SQUID_DRY / SWIM_GROUND / SWIM_WALL / SQUID_ROLL / SURGE_CHARGE / SURGE locomotion states
- CPU-authoritative OWN / ENEMY / NEUTRAL ink sampling
- OWN-ink wall swimming, buffered/reliable Squid Roll, and wall Surge
- neutral/no-ink Squid movement at Human-equivalent speed; enemy ink remains slowed
- canonical PaintSurface world/local coordinate conversion with startup cross-audit
- runtime coordinate diagnostics in the technical overlay
- `Coord QA` deterministic ink + matching 3D world markers across all PaintSurfaces
- corrected GPU atlas top-origin render placement vs bottom-origin texture sampling mismatch
- Roll QA Pad fills the complete main-floor for easy locomotion QA
- pooled swept shooter projectiles
- 100-unit Ink Tank with per-shot cost / recovery lock / Human and OWN-Squid recovery
- player HP / delayed recovery / non-lethal enemy-ink damage
- Team A/B combat QA targets with enemy-only projectile damage
- 3-second countdown / 180-second Turf War timer / ENDED result state
- HP-zero Splat lifecycle with 2.5-second respawn
- team-specific respawn points with Human + full HP/Ink reset
- Restart Match / Splat QA / End Match QA controls
- production-stage metadata for `INKWORKS JUNCTION`
- player-facing match/Turf/Ink/HP HUD
- live Tactical Map with Turf, spawn, human, and CPU markers
- seven CPU participants using a shared Recast/Detour Crowd
- Painter / Skirmisher / Anchor tactical roles
- GameplayInk-aware tactical turf goals
- CPU turf contribution through the canonical PaintRequest/PaintEvent pipeline
- center-crosshair TPS aiming
- projectile-gravity compensation toward the visual aim target
- fixed 60 Hz gameplay simulation
- render interpolation for player/projectiles
- shared projectile → PaintRequest → immutable PaintEvent pipeline
- persistent GPU visual ink aligned with CPU-authoritative paint
- Pointer Lock mouse look and robust input cleanup
- shared stage-solid source of truth for render + Rapier collision
- non-paintable projectile blockers
- blocker-aware center-ray aim target
- third-person camera obstruction with smooth recovery

## Core ink architecture

```text
input / projectile impact
          ↓
      PaintRequest
          ↓ fixed 60 Hz
  immutable PaintEvent
      ┌─────┴─────┐
      ↓           ↓
 GameplayInk    GpuInkAtlas
      ↓           ↓
movement/turf    visuals
```

CPU gameplay ink is authoritative.

GPU ink is persistent visual data.

CPU and GPU do not independently recalculate projectile impacts.

Ink remains PaintSurface-local at **0.125 m/cell**, never a global XZ grid.

## Controls

- Click game view once — acquire Pointer Lock
- Mouse move — TPS camera look
- Esc — release Pointer Lock
- WASD — move
- Space — jump
- F — throw Pulse Bomb sub weapon (70 Ink)
- G — activate Turf Pulse when SPECIAL is full
- Twin Comets / Dualies while Human: hold Left mouse + WASD movement + press Space — dodge roll (up to two chained rolls)
- Shift — Squid form / swim
- Shift + move into OWN-painted wall — wall swim
- Roll QA Pad — fill the entire main floor with the selected team's ink
- Coord QA — clear ink, stamp deterministic probes on all PaintSurfaces, and show matching 3D marker positions
- While fast-swimming in OWN ink, reverse direction then press Space within ~0.20 s — Squid Roll
- On OWN-painted wall, hold Space then release — Surge
- Left mouse — fire
- Mouse wheel — camera distance
- 1 / 2 — Team A / Team B
- Restart Match — clear turf/resources and begin a new 3s countdown
- Splat QA — apply lethal QA damage through the real HP→Splat path
- End Match QA — immediately resolve the current Turf result
- R — clear ink
- B — 2000-event ink stress burst
- Alt + Left click — retained direct-paint QA path

The first click used to acquire Pointer Lock is not treated as a shot.

## Technology

Pinned direct dependencies:

- PlayCanvas 2.22.1
- @dimforge/rapier3d-compat 0.20.0
- TypeScript 5.8.3
- Vite 7.1.7

Rendering is WebGPU-first with WebGL2 fallback.

Gameplay simulation is fixed at 60 Hz and independent of render FPS. Player and projectile visuals are interpolated between fixed states for high-refresh displays.

## Important files

- `src/app/InkLabApp.ts` — application composition and fixed-tick/render ordering
- `src/player/PlayerController.ts` — Human/Squid movement + Rapier character controller + render interpolation
- `src/input/PlayerInput.ts` — Pointer Lock-aware gameplay input
- `src/camera/ThirdPersonCamera.ts` — TPS camera + center-ray aim target + QA paint picking
- `src/stage/StageDefinition.ts` — T8 shared static-solid / blocker definition
- `src/physics/RapierStagePhysics.ts` — static collision + projectile/camera scene queries
- `src/projectile/ProjectileSystem.ts` — pooled swept projectiles + fire cadence + ballistic launch solution
- `src/ink/PaintSurface.ts` — local surface geometry/grid + segment intersection + invariants
- `src/ink/GameplayInkSystem.ts` — authoritative rasterization, turf, filtered world sampling
- `src/ink/PaintCoordinator.ts` — single immutable PaintEvent creation/fan-out
- `src/ink/GpuInkAtlas.ts` — persistent visual atlas + visual V-orientation correction
- `src/config/game/gameConfig.ts` — project-owned tuning
- `src/config/reference/splatoonReference.ts` — separately labeled research/reference constants
- `CURRENT_CANONICAL.md` — frozen architectural contract and next phase
- `VALIDATION.md` — automated + hosted QA record

## Validation state

T9 initial implementation commit:
`110f925fe830ea2aa3865b3c88525c81d1e08f92`

T9 current coordinate-audit candidate:
`0b95810314e5f91b047577eba4a94c6f9db89100`

T9 current automated workflow:
`35810161552`

Passed:

- dependency install
- TypeScript check
- Vite production build
- GitHub Pages artifact upload
- GitHub Pages deployment

Hosted runtime QA for T9 is complete and accepted.

T10 automated build/deploy and hosted Ink/HP/combat QA are complete and accepted.

T11 automated build/deploy and hosted match/lifecycle QA are complete and accepted.

Confirmed:

- coordinate / atlas alignment
- full-floor Roll QA Pad
- main-floor OWN sampling
- Human↔Squid physical switching
- no-ink Squid Human-equivalent baseline
- enemy-ink slowdown
- Squid Roll
- OWN-wall swim
- wall Surge
- Squid-form shooting suppression / Human firing
- T8 camera and projectile-blocker regression sanity

T9 is **STABLE FREEZE**.

T8 implementation commit:
`234180436b27e0c9498c8d253348b2c366f839ce`

T8 automated workflow:
`35803236486`

Passed:

- dependency install
- TypeScript check
- Vite production build
- GitHub Pages artifact upload
- GitHub Pages deployment

Hosted runtime QA for T8 was completed and accepted by the user on 2026-09-23.

Final T4–T7 stabilization workflow:
`35800320770`

Passed:

- dependency install
- TypeScript check
- Vite production build
- GitHub Pages artifact upload
- GitHub Pages deployment

The user completed iterative hosted QA for this phase and accepted the current state as complete after the final visible ink vertical-orientation correction.

## Stable invariants

Do not casually replace:

- CPU-authoritative gameplay ink
- one immutable PaintEvent consumed by CPU and GPU
- PaintSurface-local grids
- fixed 60 Hz gameplay simulation
- custom movement + Rapier kinematic character collision
- pooled swept projectiles
- 11 Splatoon-style weapon genres with original project weapons: Shooter, Dualies, Charger, Blaster, Roller, Brush, Slosher, Splatling, Brella, Stringer, and Splatana/Wiper
- Q / E full weapon cycling plus preserved 3 / 4 / 5 Pulse / Needle / Arc shortcuts with player-facing HUD state
- pooled shot/impact/Splat/Respawn visual feedback
- original procedural Web Audio SFX
- render-only Human/Squid/CPU procedural motion
- GitHub-first CI/deploy workflow

## Deferred scope

The current project intentionally does **not** yet include:

- super jump
- production character models / authored animation assets
- final performance/bundle optimization

## Current phase

**T14 — 11 weapon-class hosted QA and further Splatoon-like gameplay polish**

T0–T13 remains frozen. The first T14 candidate adds original weapon variety, pooled FX, procedural SFX, and render-only motion while preserving the frozen gameplay architecture. Additional T14 polish remains possible after hosted acceptance.


T13 hosted runtime QA is complete and accepted. The enlarged production arena, HUD, Tactical Map, shared stage metadata, and 4v4 regression/performance checks are frozen.

### T14 weapon-class redesign

The first 11-class pass was rejected because too many classes still behaved like shooter variants. The current candidate replaces that approach with class-specific runtime models: immediate Charger beams, non-projectile Roller/Brush melee painting, arcing Slosher paint, charge-release Splatling bursts, directional Brella canopy durability, delayed Stringer explosions, direct Splatana slashes, and Dualies dodge focus.

### T14 v0.9.3 targeted corrections

- Dualies dodge uses Space in Human form and supports two chained rolls.
- Charger, Splatling, Stringer, and Splatana now have distinct charge presentation instead of a generic charge indicator.
- Charged Stringer arrows become visible impact fuses and detonate after a delayed interval.
- DebugOverlay exposes roll charges plus Stringer fuse/burst counters for hosted verification.


### T14 v0.9.4 targeted corrections

- Dualies dodge is now fire + movement input + Space only in Human form; stationary fire+Space remains a normal jump.
- Dualies recovery follows the public Splat Dualies timing structure at fixed 60 Hz: 4F startup, 12F roll, 4F until firing returns, then the remaining post-roll movement-lock / roll-recovery window.
- The second dodge can still chain from that stance while firing.
- Splatling charge HUD/3D feedback is intentionally closer to Charger, using a centered progress reticle and forward guide with only subtle rotary accents.


### T14 v0.9.5 two-ring charge correction

- Rotor Cannon / Splatling now uses two charge rings:
  - first ring: 0.80 s; projectile speed/range reaches its maximum region and a first-stage burst is stored
  - second ring/full: 1.20 s; range no longer increases, while stored burst duration grows to roughly double the first-ring volley
  - reference burst sizing is approximately 18 shots at ring 1 and 36 shots at full charge
- Chord Stringer now uses the Tri-Stringer-style two-ring structure:
  - first ring: 0.50 s; direct arrow damage reaches 35 and landed arrows gain the 0.75 s delayed explosion
  - second ring/full: 1.20 s; direct damage remains 35 while the three-arrow spread converges from 8 degrees toward 0, projectile speed/range rises further, and paint width increases
  - charge-scaled ink cost follows the 5 / 6 / 8.5 reference progression for minimum / first-ring / full shots
- HUD renders separate first/second charge circles for Splatling and Stringer.
- 3D charge feedback gives a distinct first-ring pulse and only begins Stringer convergence during the second ring.


### T14 Stable Freeze

Final v0.9.5 hosted QA was accepted on 2026-09-23. Stable checkpoint: `006f9b8ddb4a818ac0ba64a3ec18f30640a07dc4`. GitHub Actions run #136 passed build and Pages deployment.

### Next: T15

T15 starts the match-system expansion beyond main weapons: source-aware turf-point attribution, a player special gauge, a first throwable sub weapon, and a first special activation path. The immutable PaintEvent / PaintSurface-local CPU authority remains unchanged.


### T15 v0.10.0 candidate

T0–T14 remains frozen. T15 adds an additive paint-source attribution layer so the game can distinguish HUMAN, CPU, SPECIAL, and QA/debug paint without changing PaintSurface-local coordinates or the immutable CPU/GPU PaintEvent path.

The first sub/special pair is project-original:
- **Pulse Bomb** — F, 70 Ink, ballistic throw, 1.0 s post-contact fuse, radial paint/damage
- **Turf Pulse** — G at 180p, charged only by scoreable turf actually changed by HUMAN main/sub paint

At current project scale, 1 m² of newly changed scoreable Human paint awards 10p. Splat retains 50% of the current gauge. Special-generated paint does not recharge itself.


### T15 Stable Freeze

v0.10.0 hosted QA was accepted on 2026-09-23. Stable checkpoint: `901b8c73f5313ac39c27ebb0fc42cb3ec1810bda`; Actions #165 passed build/deploy.

### Next: T16 Weapon Kits

T16 expands the frozen T15 sub/special foundation into per-main-weapon kits with multiple project-original sub and special behaviors.
