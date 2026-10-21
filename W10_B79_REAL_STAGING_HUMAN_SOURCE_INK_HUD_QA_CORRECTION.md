# W10-B79 — correct B76 real Human paint timing on native STAGING

Date 2026-10-21 JST. QA branch only. Base `608c4d08c7295e1d3842d5840754034e3041baa4`.

## Observed real Chrome evidence

The first B76 2-lane [FIXED/SWEEP real smoke 39549700850](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39549700850) failed **only because its new test runner waited until after the early Human 3s feedback window to inspect the Human HUD**. The genuine player accepted 7 mouse shots, changed 200 original source cells already in native STAGING (`tick≈42`) and reached 281 actual changed Human source cells by later PLAYING. Native B76 HUD independently displayed source authority `REAL_HUMAN_ORIGINAL_INK_ONLY` / nonproduction 0 Scoreable / original 4v4 false, but at PLAYING native 5 seconds the initial Human paint signal had already expired, correctly showing zero recent Human input. Both source modes continued to generate and display genuine CPU ink and to preserve frozen source geometry. No Human physics or paint implementation failure demonstrated.

## B79 real-input driver correction

- Keep browser's existing real physical Pointer Lock + left mouse + KeyW input active while waiting for the actual B76 source Human ink HUD to confirm fresh changed cells and accepted shots.
- Inspect the live HUD during **the native time it really occurred** (STAGING source practice), before the three-second history expires, not at a later unrelated CPU spray window. Verify HUD native observed tick >0 and <= live actual tick, source changed cells >0 and <= actual real Human changed source cells, accepted weapon shots >0 and <= native shots, original 25 solids / 17 Paintable / 26 native NavLinks / 0 Scoreable, original 4v4 false and production false.
- After actual Human ink contact witnessed, release physical keyboard/mouse, preserve the separate B75 CPU actual source ink witness from PLAYING native >=13s in FIXED and explicitly opt-in SWEEP, and demand both independent positive proofs before green. No fake player shots, paint deltas or synthetic ticking. Fail quickly if Human HUD never displays genuine source paint.
- B76 game code unchanged; the user-visible Human 3-second feedback and low-ink recovery guide remain read-only. Other B77/B78 original A-B-A presentation QA patches preserve visual fidelity with pixel-based thresholds and no renderer/geometry mutation.

## CI / HOLD

The B75 workflow automatically executes B79's real Chrome two-mode smoke on QA branch; at authoring the exact SHA result is pending. The previous B76 **preflight** succeeded but previous actual real browser acceptance was failure due to the inspector's wrong time window, so do not mark B79 pass without new completed real browser CI.

Main, published Pages, Draft PR #5, source stage physics 25/paintable 17/NavLinks 26/Scoreable 0 and original 8 unplaced SetActor/PntSet bindings all unchanged. Default CPU remains FIXED and original4v4 activationReady=false, opposing native routes 0/12.
