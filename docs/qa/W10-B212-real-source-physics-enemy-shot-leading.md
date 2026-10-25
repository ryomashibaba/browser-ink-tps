# W10-B212: original-source moving enemy ballistic response

QA branch, based on `91cf3b82527e83cef22ea4f0c856e63eacb2765c`, 2026-10-25 JST. QUALITY-FIRST F1-F5.

**Actual gameplay change:** in the user-selected B207 SOURCE COMBAT 180s mode ONLY, source CPU weapons with physical projectiles may aim slightly ahead of a real moving, living native enemy. The earlier original Rapier line-of-sight B181 is mandatory. The B212 candidate uses actual prior/current fixed 60Hz physical feet, original weapon projectile velocity and real measured separation. No stationary, jump, teleport-like (over 12m/s) or invalid steps are eligible. A maximum of 0.30 seconds and 0.85 meters of predictive aim is applied, requires real weapon range and an ADDITIONAL original Rapier blocker ray. An unsupported projected aim reverts to the current real enemy body. Hits, HP, ink, guards and respawns still execute exclusively in the existing ProjectileSystem + CpuAgentSystem combat path. Source actor locations, scoring and navigation are UNMODIFIED.

**Verification:** focused 4 native-input unit tests are added to existing B75 preflight; the real B75 FIXED Chromium user-click B207 lane verifies that the B212 opt-in exists, has no teleport/scoring/damage-injection authority, and honestly reports 0 accepted aims if real same-side encounters do not happen. Same-SHA CI, real hit, respawn and natural encounter remain unverified until final Actions logs.

**Other important outstanding evidence:** B211 A1 real cooperative Chromium regression #40195052784 failed due to a 100-second wait on post-PAUSE resume with pointer lock and 5 native ticks not reached. It does NOT prove loss of source support. B210 180s #40193651931 and B211 B75 Chromium #40195052823 were still IN_PROGRESS at initial B212 work. Do not label them passed without final evidence.

**Release HOLD unchanged:** 25/17/26/0 original source, enemy source paths 0/12, activationReady=false, productionAuthorized=false, unrestricted4v4Certified=false, official winner NONE. No main/T20/Pages/PR #5 alterations.
