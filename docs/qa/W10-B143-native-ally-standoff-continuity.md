# W10-B143 — Native original-source A1 2m standoff continuity

2026-10-24 JST, QA branch only.

## Code-audited control flow issue
B137 newly requests a teammate goal only at **3–18m** between actual grounded human and A1 feet; B142 source-approved an actual native path standoff 2m before the real human. Once A1 physically enters <3m, re-evaluating the NEW-goal gate rejects this existing goal and can send A1 back onto unrelated source patrol. This is a control flow finding, **not observed in a successful real rally**: all B139/B141/B142 real browser trial runs on current HEAD were still queued at B143 start.

## Real movement improvement
Only explicit `t21W10B137=allyRally`, only A1 with a **previous truly source-audited B142 goal**, and only when the actual grounded A1 is 1.7–3m from the grounded team A human may it continue that goal. This does NOT relax B137's original >=3m threshold for new goals. Require the human to remain within .25m horizontal and .10m vertical of the previously approved physical foot, and reauthorization at most 120 natural 60Hz ticks old. Every actual decision re-audits: real A1 foot, real human foot and previously approved native standoff all on exact frozen original Rapier flat polygons with holes, <=.22m Y and >=.75m boundary clearance; independent complete native Recast paths from real A1 to human AND from real A1 to the old goal (<=.20m snap, every .30m path segment original Rapier supported). Reject if any check fails, clear history and fall back to unchanged safe original patrol. Successful reauthorization merely re-requests the same actual Recast goal; per-tick Rapier KCC collision authority is unchanged.

Read-only `sourcePatrol.b143ReauthorizedStableStandoffGoals` and `b143UnsafeOrStaleGoalHoldsRejected` distinguish reauthorized requests from rejections. Neither is physical arrival, capsule safety, game completion or official scoring proof. CPU FIXED mode and all other CPUs unchanged. Preserve 25 solids / 17 paintable / 26 links / 0 scoreable, original opponent routes 0/12, activationReady=false, productionAuthorized=false, unrestricted4v4Certified=false, formal 4v4 HOLD. No main/T19C/T20/Pages/Draft PR #5 change.

## Evidence gate
Existing B75 workflow already runs the modified B142/B143 helper tests, the SourceTraffic tests, build and genuine WebGL2 native patrol smoke. Existing B139 real-key descent/ally jobs must finish before any assertion that B143 actually moved/held A1. GitHub CI queued is NOT PASS. Do not create new redundant workflows.
