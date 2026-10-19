# Browser Ink TPS — W10-B48 genuine source ballistic preflight

## Implementation gate (CI unverified)
QA base `61f9f360965d2917b0f706427017a727f3398a47`. W10-B47 has 14/14 exact independently replayed original-source native human KeyF trajectories. B48 now performs **time-parametrized semi-implicit Euler trajectory preflight**, not B45-style straight-ray guessing, using **two real measured muzzle origins** (true native human launches #12 and #14). Each candidate initial velocity is hypothetical; its origin is original but the velocity may not be obtainable from a real native camera aim/ProjectileSystem launch solver.

Bounded **578** virtual directions: yaw -140..20 by 10° and pitch -40..40 by 5°, each at two actual source-world launch origins. Actual unchanged pulse-bomb 10.5m/s speed, +4.6m/s boost, gravity 18m/s², 1/60 fixed tick, 3s flight TTL; existing Rapier 'thrown-sub' and certified original PaintSurface casts and 0.06m priority epsilon. Record original source Rapier-first source IDs, collision ticks, exact browser query positions, PaintSurface winners and genuine no-contact trajectories separately.

**Important evidence boundaries**: read-only source geometry queries are native-code observations of hypothetical initial velocities; these are not 578 genuine human throws and not original game collision proof. No camera transforms, input spoofing, scene mutation, new stage shapes, paint or scoring. The selected candidate can only be certified as a real-gameplay native pulse-bomb collision after actual pointer-locked mouse+KeyF run with measured outgoing velocity. Do not claim that a found candidate has actually been hit.

All original source limits 25 Rapier physical/17 Paintable/26 NavLinks/0 Scoreable. `activationReady=false`, standard fixed patrol. Main, frozen T20, PR #5, Pages and owner Windows untouched. B35 occasional real-player lane test intermittency remains separately documented.

## CI
Pending measured actual Chrome run, search counts, and code SHA.
