# T21 F3 — true native weapon/ink/movement sound slice (2026-11-05)

Continuation of the immutable F1–F5 Fast Track. Only research branch `research/t21-b406-single-session-real-enemy-range-audit-20261103`.

## Playable capability

- Twelve **actually selected** main weapon profiles now drive twelve different shot pitches, with weapon-class timbres and real accepted-shot counters. There is no fabricated gunfire or downloaded copyrighted sound.
- After the actual 60Hz PaintCoordinator step, a new original SOURCE cell emits a low-volume ink-impact cue. Already-painted cells do not.
- Genuine PlayerResources ink increase while SQUID in OWN ink yields refill feedback; actual grounded Rapier player movement in OWN ink yields squid movement feedback; a real airborne→grounded transition yields a landing cue.
- Actual fractional damage (e.g., .25 HP) is supported. The previous integer-only validator could silence every subsequent sound after valid fractional damage.
- All sounds are synthesized locally, unlocked only by a real canvas gesture. N mute is now independent of the existing M radar toggle (regression fix); unsupported AudioContext fallback remains intact. Short cooldowns keep sound overhead bounded.

## Safety / acceptance

This only reads existing 60Hz authentic native counters, PlayerController mode/position/grounded, selected weapon and post-PaintCoordinator ink evidence. **No writes** to actor, CPU, AI, collision, Recast, Rapier, camera, ink ownership, timer or score. Original 25 solids / 17 paint / 26 nav / **0 scoreable** immutable. Natural cross-map enemy routes **0/12**, enemy HP encounter and official Turf winner **HOLD**. The native PAINT sound does not mean a point scored; SWIM does not prove whole-stage connectivity.

TypeScript/Vitest and real Chrome must be checked on the new **exact commit SHA**, using the existing B441 7-CPU source workflow (no new CI lane). Hardware audibility and subjective sound quality need a real human playtest; CI cannot certify them. No activation, merge, Pages, production or Draft PR #5 changes. Work/Computer Use not started.
