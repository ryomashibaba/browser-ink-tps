# W10-B177 — 180s human native Rapier KCC rehome, CPU paint retained

2026-10-25 JST · QA-only baseline B176 `81f75523b8f826ba87db8f0f718d133126c9e909`.

## Actual failure
B175 [CI #40156107941](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40156107941) failed at ~140 native seconds. After repeated true S34/W34 human foot motion, actual human body was `[-0.138,5.728,74.964]` and true original high-source Rapier support missing. The W34 reverse had only ~1.1m movement while S34 moved ~2.6m; cumulative unequal physical inertia caused a real fall. This is the test driver, not proof of failed CPU SWEEP. Before the fall, actual SWEEP at 120.08s: seven true CPU rejoined, 434 actual CPU weapon requests and 11,417 genuinely changed original ink cells. From 60s to 120s 10,587 -> 11,417: +830 true cells vs historical B172 FIXED +18; not a same-SHA A/B.

## B177 correct physical input
Keep genuine S34 and genuine KeyW, but release real KeyW only after the native original upper-foot KCC body **actually returns within .75m** of the real measured source-grounded body immediately after initial W33. On each real native observation require original Rapier grounded source, player high height 8.1..9.6m, elevation deviation <=.30m, x displacement <=1.2m, no more than .8m forward overshoot or 4m backward escape, max 105 true W ticks, minimum 34 true W ticks. The measured original KCC foot is a read-only reference and is **never assigned** to an actor's position or NavMesh. The following real B176 W200/D12/W18/A12 original first-drop remains a true physics experiment and must land on an original collider. Source CPU SWEEP, B175 real 60–120s paint criteria and 180s game clock retained. One existing B59 CI, four fast B177 Node tests; no extra CI runners.

This does NOT authorize stage, cross-team route, official scoring, production or original Nintendo Turf. Frozen 25 original solids / 17 paintable / 26 links / 0 Scoreable, opposite-team native paths 0/12, full 4v4 HOLD. main/Pages/T19C/T20/PR #5 untouched. B177 gameplay CI is NOT proven merely by committing.
