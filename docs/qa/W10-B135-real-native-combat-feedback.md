# W10-B135 — real 60Hz combat feedback in F3 playable preview

2026-10-23 JST. QA branch only. The original source remains 25/17/26/0.
The stage still has 0/12 cross-side certified original pathways.

## Product reason
B134 succeeded in placing authentic edge warnings at the real 60Hz
Rapier feet, but F3 hit/splat confirmation, HP damage flash and
respawn timer still depended on the throttle of `practiceHud.render`
(every 12 GPU-rendered frames). In software Chrome this can mean dozens
of native KCC/projectile ticks of combat latency. When users move and
shoot, real CPU hits / HP drops / respawns should appear immediately.

## Implementation
- New narrow `F3NativeCombatPulse` is read-only, contains native tick,
  actual health/ink/ink relation, actual human CPU direct hits/splats,
  actual respawn ticks, genuine matchState and frozen original authority.
- After **physical player/KCC + CPU + projectiles + ink + real health/
  respawn + B112 foot ledger**, the current native fixed tick calls
  `practiceHud.renderNativeCombat` independently from the heavyweight
  existing 12-GPU-frame HUD.
- Light DOM presentation includes HP/ink bars, enemy-ink and low HP
  warning, real damage vignette, actual direct-hit/splat marker, native
  splat/respawn timer. No new damage, bullets, target locations,
  actor positions, AI/CPU behavior or score is added.
- Existing `render(value)` still calls this same method and updates
  regular source ink coach and practice panels at prior cadence.
  Native tick tags allow browser QA to verify presentation recency.
- Fail closed on authority drift (25/17/26/0, production=false,
  unrestricted4v4=false) and invalid monotonic counters. The native
  pulse cannot imply an enemy encounter on the incomplete map.

## Acceptance
B75 consolidated preflight: Vite/TypeScript build, B75 HUD Vitest,
the B135 combat cadence regression check. Original FIXED/SWEEP 180s
Chrome regression is separate and expected; no claimed actual human CPU
hit/splat without direct measured counters. The B135 source changes
should trigger the four consolidated app workflows, NOT the historic
19 one-off test suite fanout. Preserve full playable-loop HOLD.
