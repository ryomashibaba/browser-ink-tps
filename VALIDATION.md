# Validation Report — v0.2.0 T4–T7 Technical Slice

Date: 2026-09-22

## Automated validation

First T4–T7 deployment commit:
`b065157f3a86bb8aceb6c922d9791ce25403c0fa`

GitHub Actions workflow run:
`35745535871`

Results:

- Checkout: PASS
- Node.js setup: PASS
- npm dependency install: PASS
- TypeScript check (`npm run typecheck`): PASS
- production build (`npm run build -- --base=/browser-ink-tps/`): PASS
- GitHub Pages configure: PASS
- Pages artifact upload: PASS
- Pages deploy: PASS

## Architecture audit

Confirmed in the integrated source:

- gameplay simulation still advances through `FixedStepClock` at 60 Hz
- Human/Squid movement is called from the fixed-tick callback
- Rapier character movement uses a kinematic-position-based body and Rapier character controller
- standard shooter bullets use a fixed-size object pool instead of dynamic rigid bodies
- projectile movement performs previous→next segment intersection against PaintSurfaces
- projectile impact creates a `PaintRequest`, not separate CPU/GPU paint
- `PaintCoordinator.processTick()` still creates the immutable `PaintEvent` once
- the same event is consumed by `GameplayInkSystem` and `GpuInkAtlas`
- `GameplayInkSystem.sampleWorld()` samples the existing CPU owner grid using PaintSurface-local coordinates
- turf accounting remains incremental

## T4/T5 verification hooks exposed in the build

Debug overlay now exposes:

- Human/Squid state
- grounded state
- horizontal movement speed
- sampled ink relationship: OWN / ENEMY / NEUTRAL / NONE

This makes hosted QA observable without adding a second gameplay truth.

## T6/T7 verification hooks exposed in the build

Debug overlay now exposes:

- active pooled projectile count
- projectile impact count
- projectile pool drops
- existing paint events/s
- ink cells/s
- GPU paint backlog
- turf percentages

The aiming crosshair and retained Alt+Left direct-paint path allow projectile paint to be compared against the pre-existing T0–T3 debug paint path.

## Hands-on hosted QA pending

CI validates compilation and production bundling; it does not prove browser input/physics/render behavior.

The hosted build should therefore be checked for:

1. WASD movement in camera-relative directions.
2. Space jump and stable landing.
3. no obvious collision tunneling through arena geometry.
4. traversal of the ramp/slope.
5. Shift Human↔Squid state transition.
6. OWN ink causing the intended fast Squid movement.
7. NEUTRAL/ENEMY producing visibly slower Squid movement.
8. sustained left-click shooter fire.
9. floor impact painting.
10. ramp impact painting.
11. wall impact painting without adding wall area to Turf score.
12. visible paint centered on the projectile impact.
13. Team A/B switching affecting both player/projectile team and paint.
14. CPU turf and GPU visual ink remaining aligned.
15. GPU backlog returning toward zero under normal fire and after stress.

## Known validation boundary

Projectile segment collision currently resolves the paintable PaintSurface planes. A full projectile-blocking representation of decorative/non-paintable boxes is not part of v0.2.0.

Squid movement is authoritative-ink-driven, but this slice retains the shared character collision capsule rather than changing the physical capsule per state.

These are documented follow-up items rather than hidden assumptions.
