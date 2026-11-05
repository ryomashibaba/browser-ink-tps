# B412 native real 180s TIME_UP then independent audit rejection — 2026-11-05

The exact SHA `d412f40a` [real run #41944309332](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41944309332) ended FAILURE, artifact [#13378648373](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41944309332/artifacts/13378648373) was read directly.

**True gameplay that worked:** 7 original CPU, genuine original SOURCE 25 solids / 17 paint / 26 nav links / 0 scoreable; human OWN squid movement and recovery; restored human and 14 reshoot projectiles; 121 genuine total shots and native real 180s TIME_UP at tick 11859. This does not certify a second real 180s game, official 4v4, cross-side path, or turf winner.

**Root cause of failed independent B412 audit:** in `b412-original-upper-real-own-ink-swim.json`, real KeyW from-to delta was `[0.5586967468,-0.2990646362]`, while immediately following KeyD lateral displacement was `[0.5536394119,0.2382659912]`. Runtime selected the last segment with direction `TOWARD_REAL_120S_PAINT` regardless of its actual key, incorrectly writing KeyD as `returnForwardWDelta`. The independent audit correctly rejected `ACTUAL_NATIVE_FORWARD_VECTOR_MUST_MATCH_OBSERVED_KCC`. At the last measured return position true W orientation would select KeyA, not the previous incorrect KeyS.

**Change:** only real supported original SOURCE KeyW KCC may determine native physical forward. A new strict `b412ObservedNativeForwardW` helper checks the actual W input, from/to, bounded movement distance, and returns its measured delta; existing 5m approach, return 0.85/0.95m, original Rapier foot, 7 CPU, no fake ink, no actor writes, and the independent KeyW witness remain unchanged. RAW coordinate regression added to the existing Node tests; no new workflows.

The historical artifact stays a failed independent audit. A fresh genuine B413 Chromium run must prove this fix; no PASS claim based solely on unit tests. Preserve main, source, T19C/T20, formal QA, PR#5, Pages, production, and Work approval rules. F1–F5 Fast Track unchanged.
