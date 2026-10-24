# W10-B157 — Two-way native Recast source-gap proof and visible F4 original-route map

**Date:** 2026-10-24 JST. **Project:** `ryomashibaba/browser-ink-tps`; QA branch `dev/t21-f4e103w-qa-infra` only. The output is a real source-backed preview diagnostic, NOT an authorization to rebuild missing floor, NavLink, KCC route or scoreable Turf.

## Confirmed original native browser source at start

[B156 genuine 7CPU B139 real Chromium / original Rapier / original Recast #40078122824](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40078122824), SHA `f9a9f8356985d6450da868d701056d72e3329b20`. Three real native original variants and the final independent B147-B154 evidence proof jobs all completed **SUCCESS**. Actual source artifact `b139-original-TEAM_COVERAGE` ID `12554615061`; JSON `w10b139-team_coverage.json`, `b155OriginalSourceConnectivityReview`, `b156OriginalUnderpassGapTriage`.

### B156 actual source path and geometry witness, not simulation

| Measured quantity | +Z Team A | -Z Team B |
| --- | --- | --- |
| Source right-low start | (6.689984, 4.5, 48.850677) | (-6.460616, 4.5, -48.656113) |
| REAL original-source Recast native forward path terminal | **(5.604740, 4.600000, 35.832825)** | **(-3.035261, 4.600000, -36.707176)** |
| Original underpass destination | (-7.828056, 0, 7.456266) | (8.057424, 0, -7.261702) |
| Original endpoint Recast projection offsets | 0.071m start / 0.100m goal | 0.141m start / 0.100m goal |
| Real native Recast path end residual to projected goal | 31.716m | 31.786m |
| Actual final native Recast waypoint → original requested goal | **31.731m** | **31.800m** |
| Existing registered stage ray f=0 | original right-low solid | original right-low solid |
| Registered stage ray f=.25 | same lower surface at 1.125m vertical difference | same |
| Registered stage ray f=.5 / .75 | no registered collider hit in 2.4m sampled Y window | same |
| Registered stage ray f=1 | original glass underpass floor | original glass underpass floor |
| Real original human KCC continuous passage across these spans | **not tested / HOLD** | **not tested / HOLD** |

Six OTHER existing original source authored route Recast endpoint queries reached their endpoints. The two F4 gap queries did **not**, despite both ends snapping within 0.15m of original NavMesh. This distinguishes a navigation source-registration disconnect from simple endpoint-selection failure, **but does not by itself prove whether any original Temple01 Face is absent from extracted source**.

## B157 coherent implementation

1. On the existing F3 non-production preview boot, execute exactly **two bounded reverse original Recast path audits** (original underpass→right-low start, one per side), retaining old forward results. A reverse-only path suggests directionality, but is NOT a physically certified one-way traversal; two-way failures suggest current source registration disconnect, not a license to invent an original link.
2. Cast original read-only Rapier stage rays solely at actual forward and reverse **native Recast path terminal waypoints**, recording original collider IDs and vertical difference, not artificially chosen bridge points. No actors or nav agents are moved.
3. B157 snapshot and same B139 native original-browser JSON contain the two-way reachability, terminal coordinates, last-waypoint-to-goal gaps and actual original collider witnesses. The existing F3 source status line surfaces reverse outcome without claiming full 4v4.
4. In the F3 source preview, a collapsed `F4 source gap map` shows +Z and -Z registered original starts (S), genuine forward Recast terminal positions (F), registered original underpass endpoints (E), and actual reverse Recast terminals (R) as **separate top-down points**, in original project X/Z coordinates. Deliberately draw **no speculative connecting line/bridge**. The map includes a visible 'POINTS ONLY' non-certification warning.
5. Add pure nonfabrication unit tests covering all combinations of reverse reachability, counterfactual/forged authorities, missing source gaps, and the visual map's refusal to draw a bridge. Reuse existing B75 (build + Vitest + Chromium) and B139 (actual 3-variant original physical 7CPU) workflows; **no additional browser workflow**.

## Important distinction / final gate

- B157's **new reverse** original Recast facts and last native static source ray hits are unknown until its own exact-SHA real Chromium completes. Unit fixtures are explicitly synthetic and may not be displayed as native observations.
- One-direction Recast route can exist for a native original gravity drop. Recast reachability is not evidence that a KCC will physically traverse the route. A read-only ray cannot grant source geometry and has no collision or nav effect.
- The original assets `Vss_Temple01.obj`/Face indices are private; B157 never reads, publishes, rehosts or fabricates any private original source vertex/triangle. Access to private original Face evidence is needed for the next genuine F4 geometry decision; only already registered source stage collider IDs are recorded.
- Frozen authority: **25 original solids / 17 Paintable / 26 native offmesh links / 0 Scoreable**, original enemy crossing 0/12; `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`; full original 4v4 HOLD. T19C/T20, `main`, Pages, original Windows source and Draft PR #5 remain untouched.

## Immediately useful B158 decision gate

From B157 same-SHA real JSON, group per-side:
- **REVERSE_ONLY_RECAST_REACHABLE_NOT_PHYSICAL:** suspect one-way source navigation; inspect original drop geometry/height and real KCC constraints before any authored movement approval.
- **BOTH_RECAST_DIRECTIONS_STOP_SHORT:** prioritize original Face registration and physical route evidence in the region around real forward+reverse Recast terminal coordinates. Do not add a guessed link.
- **RECAST_DIRECTIONS_UNRESOLVED:** inspect Recast projection failures first.
- Either way, the first practical path to original F4 is a **bounded, private source Face-to-collider match**, then original collision → NavMesh → true human/CPU physical proof; scoreable surface authority is separate. If private original evidence is unavailable, improve the already source-verified playable F3 region instead of inventing missing world.

No run is marked PASS without exact-SHA CI evidence.
