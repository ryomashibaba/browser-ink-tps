# W10-B137 — True same-source teammate CPU rally (F2/F3 gameplay)

Date: 2026-10-23 JST. QA development branch only. Macro focus: CPU actually responds to the human's movement in genuine terrain, beyond HUD and tests.

## Background
B136 real pointer-locked native CPU splat and respawn [#39965161094](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39965161094) is SUCCESS on prior SHA. The game still has 0/12 original cross-team naturally reachable routes. A forced enemy, invented floor or manually moved actor would be false confidence.

## B137 source-native playable behavior
Opt in on existing F3 preview using `?t21Play=preview&t21W10B137=allyRally`. Existing proven FIXED source patrol remains the **default** pending comparable 180s genuine native Chrome trials; no parameter makes a synthetic official match.

CPU **A1 only**, once all genuine 7 source drops / rejoins have occurred, may prefer to approach the real friendly human foot in the same positive-Z original-source lower area. Requires:
- actual human KCC grounded, HP >0, both genuine feet on same team side (Z≥33), same native vertical band 2.7–5.25m, height difference at most .30m, separation 3–18m
- both endpoints cast to real original Rapier collider IDs, inside registered frozen **flat source footprints**, original holes included, center-to-boundary ≥.75m and vertical height ±.22m
- unmodified Recast path from real A1 CPU foot to true human foot, exact native start/end snap ≤.20m, and every 0.30m Recast polyline sample physically supported by original-source Rapier collision (existing strict `hasSourceSupportedRoute`).
- every CPU ACTUAL movement step still passes ordinary Rapier KCC / player collision. Recast is only a destination.

If ANY check fails, immediately fall back to the prior source-patrol selection; no new nav links, enemy/teammate spawns, positions, raw stage, player physics, bullets or ink scoring. Keeps separated Team B untouched and avoids pulling multiple allied actors into one collision radius.

New immutable telemetry `sourcePatrol.b137*` exposes candidate checks/approved native ally rally goals/refusals. Pure gate unit tests cover actor/team, original underpass/height/real foot and range. Combined B75 regression includes new tests, main TypeScript/Vite build and existing native 7-CPU physical test. **Theoretical goal approval is not proof of an actually completed rally**. Human-to-CPU natural enemy encounter is still not certified until original cross-side structure/paths and full collision-tested traversal are obtained.

Next: native real Chrome A/B opt-in 180s gameplay evidence and inspect source-path-approved A1 movement, no changes to protected main/Pages/PR #5.
