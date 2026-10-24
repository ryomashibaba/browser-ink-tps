# W10-B150 — original-source A1 teammate ink support (opt-in)

2026-10-24 JST. QA branch only. **Implementation prepared; verdict pending same-SHA CI evidence.**

## Player-visible change

After genuine B142/B143 native source teammate-station approval, A1 can optionally aim real CPU weapon projectiles at *unowned original floor paint cells* nearby rather than staying inactive at the safe two-metre station. Actual projectile impact and GameplayInk ownership, not target-selection counters, determine paint success. Combat still takes precedence.

Opt-in: `t21QaDrive=source&t21W10B137=allyRally&t21W10B150=allyInk`. Default FIXED and B137 alone remain unchanged.

## Safety authority

Only real active A1 after actual 7/7 rejoin, physically grounded on same strictly verified original flat solid as the real human, with recent approved B142/B143 2m goal. Candidate ink points are directed away from the human. Runtime requires original Rapier solid identity, >=0.75m interior source footprint, matching valid Paintable grid ownership, not already Team A ink, and non-Scoreable status. A failed check means no requested B150 shot.

No source geometry, NavLink, collision thresholds, player/CPU position, action timing, fallback patrol, physics state, projectile hit semantics, Turf score or production route changed. Existing real projectile -> PaintRequest -> PaintCoordinator -> GameplayInk/GPU path is preserved.

## Evidence required

- `npx vitest run src/app/UndertowF3OriginalAllySupportInk.test.ts`, typecheck and build.
- B139 full original real Chromium FIXED_DEFAULT vs ALLY_RALLY. The latter now explicitly enables B150 and reports `b150SourceCandidateSamples`, `b150ApprovedInkAims` and `b150ActualAllyTurfShots`.
- Real original paint impact cells and A1 sourced shots must be distinguished from mere candidate counts; no positive change should be asserted without JSON proof.
- Existing B147/B148/B149 real physics/rally and 60Hz KCC contact audit must remain passing.

## Status and HOLD

Implementation only until actual CI reports. No numeric B150 paint improvement is certified merely by adding code.

25 solids / 17 paint / 26 source NavLinks / 0 Scoreable. Opposite natural routes 0/12. `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`. Original 4v4 formal Turf match and outcome remain HOLD. main/Pages/T19C/T20/PR #5 and private source stay frozen.

Next: inspect actual same-SHA Actions/JSON, fix integration if FAIL. If no B150 safe ink target exists at the stationary original floor, report HOLD and examine source-supported alternatives; do not invent geometry or mislabel candidate count as changed turf.
