# W10-B213 — Real native CPU hit-triggered counterfire; player resume reliability

Date 2026-10-25 JST. Only QA branch. B210 genuine 180s 1 human + 7 CPU completed (138 actual human shots; 112 CPU shots; human 426 changed cells; CPU 3,615); B211 actual B75 FIXED/SWEEP PASS with genuine visible 1+7 HUD. Enemy contact/splat NOT verified.

B213 opt-in B207 real user-selected source combat mode: a CPU that really loses HP to an actual HUMAN or opposite-team CPU direct projectile remembers only that genuine attacker ID for up to 120 real native frames. Original B181 requires the offender to be currently ACTIVE, source-height validated, within 12m preferred range and unblocked by the real source Rapier stage ray. On real damage the source sight cache is invalidated so the injured actor may turn to the shooter, but the target still may be invisible and shooting may be impossible. This uses already existing real CPU weapons/hit/guard/HP/splat/respawn; no fake damage, no attack grants, no navlinks, no spawns, no actor relocations. A shot stopped by guard/source paint does not generate fake counterfire. Respawn clears the memory. Default/T20 paths remain untouched.

B213 also fixes an actual Chromium B201 pause/resume regression: B211 co-op run #40195052784 timed out 100s after blind center click, while the same run proved an actual B206 resume BUTTON click works. Replace B201 resume blind click with that exact real CDP user button and state check. No qaDriveTicks or virtual inputs.

Existing B75 preflight imports focused tests and its authentic Chromium user-selected B207 lane verifies read-only B213 honest counters, which may be zero when natural encounters are blocked. Existing co-op workflow exercises B201 user button. Correctness requires same-commit build + CI proof; ZERO hits must never be called combat verified.

Permanent: source Rapier solids25 / paint17 / navlinks26 / Scoreable0, natural opponent routes0/12, activationReady=false, productionAuthorized=false, unrestricted4v4Certified=false, official winner NONE. Keep main/T20/T19C/Pages/PR5 frozen.
