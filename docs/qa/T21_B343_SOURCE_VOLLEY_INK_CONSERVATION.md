# B343 source-only human volley capacity preflight

Genuine source-only QA flag `t21W10B343=sourceVolleyAtomic`, with
`t21QaDrive=source` and full 180s original stage, validates exactly
25 solids / 17 paint surfaces / 26 links / 0 scoreable before enabling.

The original generic `ProjectileSystem.fireProjectiles` spent player ink
before checking availability of a physical 128-slot projectile pool.
B343 checks whether the **entire real projectile volley** has available
slots *before* spending ink, rejecting an unavailable human volley
without spending real ink. No score, route, actor, teleport, paint,
damage, physics tick or synthetic projectile is invented.

Default T20, normal T21, existing B335–B341 and all CPU fire paths are
intentionally unchanged. This remains an **opt-in investigation**, not
a Nintendo weapon parity or original-fidelity certificate.

B343 unit and build checks cover absent, partial, full pool capacity
and invalid counts. Real pointer-locked Chromium input and natural
pool exhaustion require their own evidence gate. Original movement,
source 25/17/26/0, ART and unrestricted 4v4 HOLD.
