# W10-B151 — turn original A1 support-ink aims into measured real projectiles

2026-10-24 JST. Opt-in QA, original Undertow Ver.7.2.0 only. **CI pending; do not call the new effect PASS until exact-SHA Chromium JSON confirms it.**

## B150 actual findings (not synthetic)
[Actions #40070275499](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40070275499) on `8803b43222f2bfaeff11661d9c95f5f9255f9caa` completed SUCCESS:
- 7 true CPU physical source rejoins; A1 original-source standoff; 515 near 60Hz frames; 0 exact human KCC/A1 Rapier contacts; fixed patrol has 0 ally approvals.
- B150 ally support candidates **5,052**, approved aims **3**, actual per-actor A1 Turf shot **0**. The rest of the CPUs did paint, but their cells are NOT an A1 paint achievement.
- Therefore B150 demonstrated a proposal path, **not** real A1 support firing; missing A1 physical projectile/ink proof was the blocker.

## B151 actual gameplay changes
- A1 support aim requests now occur only if its existing weapon fire timer is ready, not while the shot is blocked by `fireRemaining`.
- Expand the real-floor proposal sweep from 15 sparse positions to up to 42 points over six radii and seven away-from-human angles. Reject all points within 2.6m of the actual human before original stage/ink validation.
- Throttle source collision/ink candidate validation to at most every eight authentic physics ticks, avoiding a dense scan on every 60Hz frame.
- Preserve all existing B150 original Rapier flat-solid identity, 0.75m footprint inset, exact paint ownership and Scoreable=0 gates. `CpuAgentSystem` still handles real weapon cooldown, range, ink and projectile request; no direct PaintEvent injection or artificial movement.
- Record actual **A1 projectile Impact/WallImpact changed cells** from the existing `PaintCoordinator` callback. Foot paint and raw candidate counts are excluded. These per-actor events may include legacy A1 projectile impacts, so they are not by themselves proof the new B151 aim caused them.
- Existing B139 original real Chrome rally probe now saves new per-actor impact evidence. B75 preflight runs B150/B151 source candidate Vitest without creating a separate CI workflow.

## Next proof gate
Same SHA B75 build + candidate tests; B139 ALLY_RALLY and unmodified FIXED_DEFAULT real Chromium. Verify B151 actual A1 shot requests, actual A1 impact events, changed real original source paint cells and unchanged B147/B148/B149 KCC/Crowd collision evidence. If no A1 shots or paint, report HOLD and diagnose original floor coverage/cooldown rather than alter source certification.

## Frozen source and release
25 Rapier solids, 17 Paintable, 26 source NavLinks, 0 Scoreable; opponent natural paths 0/12. `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`. 180s certified formal 4v4 remains HOLD. main, T19C/T20 stable, Pages, Draft PR #5, private source extraction and Windows original untouched.
