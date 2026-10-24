# W10-B156 — Original Undertow right-low→underpass source-gap root classification

**Date:** 2026-10-24 JST. **QA-only:** `dev/t21-f4e103w-qa-infra`. This is the first stage of F4 spatial gap investigation, NOT a new source floor/navmesh connection.

## Genuine B155 reference actually inspected before design

[B155 native B139 seven-CPU PlayCanvas/Rapier/Recast run #40077094558](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40077094558), source SHA `b91d5c30376d4d8a5800ec78f5525994c4347950`, archived artifact `b139-original-TEAM_COVERAGE` (artifact ID 12553327637); the measured JSON is `w10b139-team_coverage.json` key `b155OriginalSourceConnectivityReview`. Native TEAM_COVERAGE job SUCCESS; overall B139 run may continue until the paired evidence audit completes.

| Measured route | +Z / A | -Z / B |
| --- | ---: | ---: |
| Recast source path query | success | success |
| Recast reaches target | **NO** | **NO** |
| Original start projection offset | 0.0711393 m | 0.1406608 m |
| Original end projection offset | 0.1000000 m | 0.1000000 m |
| Recast final path vertex → destination (endpoint audit) | 31.7162272 m | 31.7857453 m |
| Recast result native path vertices | 2 | 2 |
| Real registered Rapier ray at fractional candidate f=0 | original right-low floor | original right-low floor |
| Real Rapier candidate f=0.25 | original right-low solid, **1.125 m below sampled line** | same |
| Real Rapier candidate f=0.5 and 0.75 | no registered static solid on that bounded vertical ray | same |
| Real Rapier candidate f=1 | original glass-underpass floor | original glass-underpass floor |
| Authentic KCC continuous human crossing | **NOT MEASURED** | **NOT MEASURED** |

Six other authored `MUST_REACH` source Recast endpoints reached; both verified registered ramps showed five out of five exact matching original Rapier static support rays, unlike underpass gaps. **Note:** free drops have intermediate absent/offset static rays too while they have authored offmesh links and real first-drop KCC evidence; thus misses of vertically interpolated rays MUST NOT be called missing original floor.

**Source-supported inference:** both original endpoint regions are present in registered 25-solid/26-link source stage, but the genuine current Recast path terminates ~31.7–31.8m short of target on both sides. The **current native path is blocked/disconnected in the existing registration**. Missing original full-source triangles, missing registered collider, offmesh link absence, height mismatch, or an intentional fall are *not yet distinguished*. Do not add inferred bridge or NavLink just from these two source segment samples.

## B156 implementation batch
1. Capture the **actual Recast last waypoint** and its distance to destination from `RecastStageNavigation.auditPath` via existing B155 source review (no new route or navigation query). Existing B155 path endpoint error is measured against Recast's projected endpoint, while B156 last-waypoint distance goes to the exact original requested destination. They must not be conflated.
2. New pure read model `W10B156OriginalGapTriage.ts` consumes the eight original source B155 route witnesses. It positively classifies **both projected endpoints near NavMesh but Recast path stops short**, separately lists missing registered midspan static-ray witnesses f=.5,.75 and height-mismatched f=.25, and labels new original OBJ Face support, exact original geometry gap, real KCC pass and game authorization all **unverified**. Fails closed if actual source stage/score/KCC/production identity changes.
3. The integrated F3 preview HUD displays source connection status per side, read-only `b156OriginalUnderpassGapTriage` in genuine snapshot, and the existing B139 (FIXED/ALLY_RALLY/TEAM_COVERAGE) source evidence JSON records the actual Recast terminal positions and frozen 4v4 HOLD boundary. It reuses the existing B75/139 pipelines and small Vitest tests. This is more actionable than another independent mini-QA workflow.

## Highest-value next *F4* research and actual physical implementation
1. From new exact-SHA B156 JSON, plot source right-low start, Recast actual terminal point, and original glass-underpass endpoint **separately on each side**. Do NOT infer a direct straight bridge from the straight-line sampling points.
2. Retrieve trusted **private original `Vss_Temple01.obj`** source Face/OBJ IDs for this bounded unregistered span. Existing Phase12U/12V original 70,396 face / 88 held boundary studies are evidence candidates, not a license to publish those source vertices. Confirm whether source floor triangles really exist along a player-feasible path and whether the needed region has collision/paint/nav authority.
3. Only *after* source-verified geometry and original player movement agreement, build a small QA-only authoritatively traced region and re-run Recast+real Rapier KCC; deliberately maintain `Scoreable=0` until Turf map authority is independently earned. No manual teleports, fake supports, dropped guards, score or production promotion.
4. If original private assets unavailable, focus on a source-backed verified F3 vertical slice and request only **minimal original reference evidence** rather than iterating many speculative CI microtasks.

**Immutable:** 25 Rapier solids, 17 Paintable, 26 NavLinks, 0 Scoreable, 0/12 natural enemy paths. `activationReady=false`; `productionAuthorized=false`; `unrestricted4v4Certified=false`. T20 stable, main/Pages, Draft PR #5 untouched.

**Verification honesty:** The B155 numbers above are genuine from the exact source artifact; B156 new terminal coordinates and B156 exact-SHA Chrome effects are not proven until its own Action runs.
