# W10-B182 — Real-native source cover targeting and actor-lifecycle stability

2026-10-25 JST. Baseline `ecf4f086b20af427cabf997351add90dea7a3b15`.

## B181 CI result verified
All six exact-SHA Actions completed successfully: B75 authentic FIXED/SWEEP real WebGL2, Linux and Windows QA launcher, B112 source KCC, B120 original first-drop, B162 native source ally, continuity. The original B75 did **not** enable B181 originalCombatSight, so its PASS never certified actual B181 behavior.

## B182 gameplay improvement
Previous B181 sight cache kept a static Vec3 from a live opponent for up to eight native physical ticks. A native enemy could move, splat or leave physical GROUND while the CPU still aimed at the old foot. B182 stores original-native actor identity and registered-ray origin; before a short cache reuse it resolves the live current candidate from the actual living grounded human/CPU positions. Missing, non-grounded, splatted, high-difference, or significantly displaced actor/body forces fresh registered Rapier cover observation. Reused aim uses the latest real actor body, not a frozen old target. No authority change for movement, weapon hits, GPU ink, score, NavMesh or collision.

Existing B75 WebGL2 SWEEP now explicitly enables B181 combat sight (B182 verification) and saves genuine native stage-ray, original-cover rejection, cache reuse and selected-target counters. FIXED remains unaffected. Zero valid opponent rays is an honest original partial-stage blocker; it must never be turned into a fabricated encounter or failed safety gate. B182 source mode is opt-in; normal user/production paths remain unchanged. B75 preflight now executes B181/B182 visibility tests; no new browser CI runner.

**Proof boundary:** this is candidate selection, not actual enemy hits. Run completion and proof require exact SHA Actions results. Original immutable 25 Rapier solids / 17 paintable / 26 source links / 0 scoreable; natural enemy crossing 0/12; `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`, official match HOLD. main, T19C, T20, protected PR #5 and public Pages unmodified.

## Next focus
After native B75 result read true `b182RealNativeSourceSight` counters and do not attribute shot/paint differences solely to visibility while SWEEP also has B179/B180 enabled. The substantial F1-F5 blocker remains source-supported cross-team routes and actual local enemy damage; improve the real player/CPU vertical slice rather than adding synthetic targets.
