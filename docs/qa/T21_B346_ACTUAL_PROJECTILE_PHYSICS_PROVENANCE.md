# B346 — Actual SOURCE physics projectile spawn/exit witness

Genuine B345 original source shooter experiment CI
#40998885811 **PASS**: first 12 native ticks 7 -> 2 shots (B344 baseline
to B345 experiment), subsequent 12-tick windows 2,2,2,2.
Actual original changed cells remained 91; no scoring/production.

## Problem and bounded instrument

B344/B345 sampled accepted human shooting and original paint changes,
but their native checkpoint counters did NOT capture the physical
projectile launch positions or exact spawning ticks.

B346 adds a bounded **read-only** event recorder at the exact original
`ProjectileSystem.spawnProjectile` and `finishProjectile`
functions: only original human SHOOTER 3D slots (not CPU, not rays,
not fake projectiles) are recorded. It stores:
- Real native engine tick supplied by the genuine `stepFixed` loop
- Actual physically allocated projectile slot and unique launch id
- Real muzzle/world position and initial 3D velocity
- Existing gravity, life, paint radius, active weapon profile
- Physical finish tick and world-space point and reason, distinguishing
  original Paintable, solid Rapier collider, actual CPU/player/QA combat
  or natural TTL; original hit surface id only when a real original
  Paintable intersection exists.
- Exactly original projectile collision and actual project-owned ink
  paths unchanged. The recorder does NOT certify that a Paintable
  collision created changed owner cells; that must be independently
  compared to actual ownerGrid.

The opt-in is strictly `t21QaDrive=source`,
`t21W10B203=fullRound`, `t21W10B343=sourceVolleyAtomic`,
`t21W10B345=sourceShooterOpening`, and
`t21W10B346=nativeShooterPhysicsWitness`.
Existing B343 + B345 can only enable in exact source 25/17/26/0
world with scoreable zero. Reset leaves opt-in enabled but resets
all recorded native event histories. 256 event max memory with
explicit overflow counts, never silent missing evidence.

This foundation's unit/build success alone is not actual physical
3D game QA; its next phase must drive real CDP mouse and run an
independent audit verifying a corresponding LAUNCH and EXIT ID for
real human shot requests, actual ticks and original surface hits.

T20, existing default F3, B340/B341, normal B344/B345, 7 CPU aim,
native Rapier, original collision and source ownerGrid unchanged.
ART HOLD, 4v4 HOLD, natural cross-team 0/12, official winner NONE.
