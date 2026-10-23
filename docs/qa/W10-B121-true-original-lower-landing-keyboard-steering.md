# W10-B121 — True CDP W-D-W-A-W keyboard route steering from original lower first-drop

Date: 2026-10-23 JST. Nonproduction QA `dev/t21-f4e103w-qa-infra`.

## Ground truth before B121
- [B120 real Chrome #39899687346](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39899687346): **PASS**, native first-tick 6→246, real W 240 ticks, 19.83775m genuine forward, first-drop KCC original landing supported and foot INSIDE registered source polygon with 1.21m clearance. Natural descent suspicion 1, original 25/17/26/0, original 7 CPU untouched; local touchdown only, no next route certification.
- [B119 straight 480-tick #39885838391](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39885838391): physical HUMAN passed original first-drop landing, then at real native tick 270 walked outside the registered original lower slab, physically dropped, stop at tick 392 with `T21_F3_OUTSIDE_AUTHORIZED_PHYSICAL_SOURCE_RESET_REQUIRED`. This is an original floor boundary exit, not proven floor-hole inside that slab.
- Original source next-door named `right-low-team-a` is at canonical project Y=4.5, **1.5m HIGHER than** first-drop-landing Y=3.0. Do not invent walkable height transition or claim connected 4v4. Original `center-low-team-a` is much farther away; no source-verified direct gap crossing.
- True PlayerController uses camera-relative original W forwards, native KeyD lateral +x and KeyA lateral -x; do not fake movement with direct setPosition, synthetic ticks or CPU relocations.

## B121 real keyboard experiment (not a new engine move routine)
The existing real Chromium PlayCanvas/WebGL2 script adds **explicitly opt-in only** `T21_B121_REAL_LANDING_STEER=source`, requiring a bounded total **280 genuine native 60Hz ticks**. The regular 120-tick and B120 touchdown paths remain unchanged.

Run a conservative sequence of real CDP keyDown/keyUp from a real source spawn:
1. **200 real native ticks** of W to fall from original upper `spawn-high-positive-z` onto the original first-drop landing.
2. **12 real ticks** of D-only lateral motion while on lower landing.
3. **16 real ticks** of W-only forward motion on the lower landing.
4. **24 real ticks** of A-only source-aligned lateral correction.
5. **28 real ticks** of W-only guarded progression (then all keys up).

Actual end body, native Tick, original source solid IDs, KCC grounding, original 5-ray footprint and original `B120` registered lower slab polygon are sampled at real time in all five segments. An observed KeyD +X then KeyA -X shift **>0.2m in each direction** is required; a command alone never substitutes for measured Rapier motion. All original source support retained; if the actor exits a genuine floor, actual fail closed + JSON/screenshot preserved.

**Acceptance levels deliberately separate:** (a) genuine physical source-backed lower-landing steering verified, versus (b) distinct original next-floor source and Rapier KCC actually reached, versus (c) safely connected original full map/4v4 (still HOLD). A PASS for (a) never implies (b) or (c). Stop if genuine original source ungrounded; do not bridge any missing floor or infer a connecting ramp.

## CI
Dedicated exact-SHA [B121 GitHub Actions](https://github.com/ryomashibaba/browser-ink-tps/actions/workflows/t21-w10b121-real-first-drop-steering.yml) performs native Vitest/typed Vite build and real Chrome original keyboard actions with retained provenance JSON and screenshot. Source 25 solids, 17 paintable, 26 NavLinks, 0 scoring unchanged, main/Pages/PR #5 unchanged.
