# W10-B170 — Native source A1 guard compile repair and actual foot-motion evidence

2026-10-25 JST; B169 baseline `f20655937e3b30f8d28983792ab60907a729e909`. QA-only, do not promote to production.

## Why the actual experiment did not run
B169 exact-SHA B75 #40148358452, B162 #40148358453 and B139 FIXED_DEFAULT #40148358429 all failed in TypeScript preflight (TS2345 at SourceTraffic line 460 and 467). A safe `Readonly<{x,y,z}>` point from the B169 original-goal-only ranker was passed directly to native Recast `auditPath` and PlayCanvas `Vec3.copy`. No B169 real-Chromium result existed at the time of B170 implementation. Continuity metadata SUCCESS is not a gameplay pass.

## Repair and scoped gameplay proof
Convert only the chosen existing original source patrol coordinates into a real `new Vec3(goal.x,goal.y,goal.z)` before the same original Rapier ray, real current native Recast route audit and Crowd goal assignment. This does not create a waypoint or elevate a surface. Splatted A1 is excluded. The existing genuine B162 Chromium driver now captures the actual A1 physical foot and B169 source-approved/rejected guard counts during the genuine human upper source practice and actual lower-source walk, plus the real A1-human planar gap at lower arrival. The old A1 true source impact/CLEAR criteria are unchanged; no falsified shots, physics, score or test successes.

## Verification, only when exact SHA Actions finish
B75 TypeScript + goal safety Vitest + real native WebGL2 FIXED and SWEEP; B139 real original 7CPU human source; B162 actual 60Hz cooperative Chromium; continuity. Any failures remain HOLD with exact stage evidence. Do not claim B170 PASS before those workflows finish.

Original authority unchanged: 25 real Rapier solids, 17 Paintable, 26 original NavLinks, 0 Scoreable, opponent 0/12 native paths, unrestricted original 4v4/production authorization HOLD. main / Pages / frozen T19C/T20 / PR #5 remain unchanged.
