# B338 Source round player HUD and QA isolation

**2026-10-30 JST** — branch `dev/t21-f4e103w-qa-infra`.

B337 verified [real Chromium + independent validation #40958187917](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40958187917) at `ef796bd9`: 0.5686m genuine original grounded KeyW, 9 real human shots, 91 human painted original cells, camera yaw +4.4°, CPU 7/7. Technical short source PASS; no all-stage or unrestricted 4v4 certification.

B338 derives a compact player instruction from genuine native tick, paused state, matchState, and stopReason. The real clock and 25/17/26/0 score authority do not change. READY means paused STAGING at tick0; TIME_UP is **NO WINNER**. The optional practice challenge panel is hidden **only** during source PLAYER PLAYING; paused player and F8 QA restore it. All underlying original mission and replay logic remain intact.

Tested by unit policy plus reuse of B337 real Chromium runner, which now records `b338-real-playing-hud.json` and captures player screenshot; fails if actual normal PLAYER PLAYING still shows overlapping practice/QA panels or the new native guidance is absent. Do not run B335 heavy 180-second CI simply to certify UI.

**HOLD:** B338 exact-head TIME_UP art frame, human playtest, overall ART, central underpass collision authority, opposing natural routes 0/12, scoreable 0, official 4v4, release. Main, T20, PR #5, Pages protected.
