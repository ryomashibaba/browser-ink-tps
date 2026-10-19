# W10-B47 — Real native ballistic launch replay / genuine mouse throws

Status: pre-CI, bounded opt-in source QA only. Base 798543ea12ccae5dbe79470b1d117bf45d6ada3c.

## Exact change
Observe the native human bomb's initial **velocity after the actual player launch solve and subweapon +upwardBoost**, only in the existing optional source-QA explosion witness. No game velocity, aim, stage, resource, collision query or render modification.

Replay each recorded live native trajectory **read-only** from its observed native origin and velocity: semi-implicit Euler dt=1/60, true pulse bomb speed 10.5m/s, upwards boost 4.6m/s, gravity 18m/s², native TTL, existing PaintSurface and Rapier 'thrown-sub' segment casts, and unchanged 0.06m priority epsilon. Compare chosen native contact ID/type, exact contact coordinates, flight tick and candidate query counters against the *real* B43/B44 witness. Replay is a validation tool, not a substitute for actually thrown native physics.

All prior 12 authentic KeyF player throws remain tested, then two more genuine pointer-locked relative CDP mouse+KeyF variations. Total 14 real throws. No injected projectiles, camera writes, new original geometry, scoreable mask or fabricated source actor. Audit passes only if 14 live launch traces independently match actual-source ray replay; fail/HOLD on mismatch, never secretly adjust physics.

## Frozen
25 original physical solids/17 Paintable/26 NavLinks/0 Scoreable, activationReady=false, natural opposing team connectivity unproven, standard FIXED patrol, PR5 Draft and protected main/T20/Pages/owner Windows unchanged. B45 B35 CPU lane intermittency not forgotten.

## CI
Pending verified GitHub browser and cross-platform QA; append measured results only from actual logs.
