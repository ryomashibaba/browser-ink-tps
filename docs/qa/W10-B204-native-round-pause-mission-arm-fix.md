# W10-B204 — Native 180s full round pause-to-mission fix

2026-10-25 JST; prior exact-SHA B203 Actions https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40183779211 FAILED. Real user selected A1 source co-op, then explicit full 180s source mode (fresh CPU rejoin 0), started physical original seven CPU rejoin and released real pointer with ESC. This correctly froze the 180s source clock, but old B25 start UI rejected mission arming while paused, causing B162_REAL_ALLY_SYNC_NOT_ARMED.

B204 allows ONLY user-selected fullRound + actual earlier pointer lock + frozen native 180s round + pending real pointer relock + match PLAYING + mission IDLE + no source stop to ARM mission. This status change does NOT simulate any native tick, ink, score, CPU pose, navigation or time. Actual scene click to reacquire browser pointer lock remains required to resume. Ordinary non-full-round QA, terminal states, and safety stops retain fail-closed guards. Existing B200 independent fresh-world replay exact URL checker now includes the explicitly selected 180s mode without accepting arbitrary experiment flags. Added unit test of all excluded states and useful native diagnostic on false arm.

Same-SHA Chrome acceptance pending: physically rejoin 7 CPU with true Rapier KCC, real A1 co-op mission CLEAR, test P pause after mission CLEAR freezing native tick/clock/ink, native Resume button, genuine full-world replay. Full 180s TIME_UP + naturally encountered enemy combat not claimed until separate true browser evidence.

Immutable original source 25 solids,17 paintable,26 authored links,0 scoreable, 0/12 natural opposing routes, no official winner, 4v4 and production HOLD. No main/T19C/T20/Pages/PR5/private data edits.
