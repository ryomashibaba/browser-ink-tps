# W10-B116 — Extended **real** original-source human forward walk

**2026-10-23 JST · Branch `dev/t21-f4e103w-qa-infra`**

## Starting evidence

- B112 genuine Chrome Rapier 120-tick limited upper walk: [#39795029151](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39795029151) PASS, ~9.52m forward.
- B113 Chrome real Escape + clicked JSON save: [#39798202896](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39798202896) PASS, 10 tests.
- B114 Chrome genuine KCC/capsule-width five original source rays: [#39799477744](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39799477744) original workflow's job all steps SUCCESS, 15 tests, 9.60m, `spawn-high-positive-z` center+edge.
- B115 [#39801894294](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39801894294) **PASS**, 16 tests and true keyboard + browser export. Distinguishes KCC non-grounded and actual nearby original Rapier ray without false source-hole promotion.

## B116 materially different engineering step

Instead of another small HUD probe, an **independent real Chrome source-route QA** holds genuine `KeyW` continuously for up to **480 original 60Hz Rapier ticks**. Existing 120-tick B112-B115 default script path remains unchanged; the longer mode is explicitly enabled only with `T21_B116_FORWARD_NATIVE_TICKS=480`.

Every >=12 native ticks (and final state), retain the *real actual* player body position, original source-hit solid ID, true KCC grounded state, original five-ray source IDs/classification and physical unsupported descent suspicions. The file `b116-real-forward-original-support-traverse.json` tracks original-solid transitions, furthest actually reached Z, and actual observed native stop reason. A real screenshot `b112-real-source-human-walk.png` is retained in the same Actions artifact.

If a genuine out-of-world failure/stop occurs early, the run writes its recorded evidence first, marks `NATIVE_STOP_BEFORE_TARGET` and **fails closed** without fake ticks, telemetry invention or moving the player to target. If the full 480 ticks occur but actual forward movement remains below 20m, it marks `LIMITED_FORWARD_PROGRESS` and fails closed as a real blocked/insufficient route. The acceptance gate now also **fails closed if any real unsupported-descent suspicion was recorded**, or if the real Rapier KCC is not grounded on an existing original-source ray at the measured endpoint. A ray never substitutes for actual KCC grounding. This is a limited genuine human route QA, not proof of historically reported home/center holes.

## Acceptance and non-claims

The exact-SHA [B116 GitHub Actions workflow](https://github.com/ryomashibaba/browser-ink-tps/actions/workflows/t21-w10b116-genuine-forward-original-floor.yml) runs true PlayCanvas/WebGL2 + native original Rapier and the QA-only mode, validates original **25 solids / 17 paintable / 26 links / 0 scoreable** and no actor physical relocation, and retains even failed-route evidence. Its initial run must be inspected before claiming new routes.

**Not certified:** actual historical user-reported self-spawn or central lane gaps, all crossing routes, synthetic stage supports, Nintendo-authorized Turf Winner or unrestricted 4v4. No central-path reach claim without observed supporting source collider / genuine KCC transition. Main, Pages, original source geometry, CPU FIXED default, 0/12 natural opposing routes, official HOLD remain unchanged.

If 480-tick straight W cannot cover the alleged center route, investigate the recorded real stopping pose and original stage navigation before designing a second source-grounded real player steering sequence; never substitute fabricated coordinates, teleports or invented original geometry.

## Specific CI provenance
- Baseline [B112-B115 workflow #39854344288](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39854344288): **SUCCESS** at B116 initial-source script SHA `71ff1a41be54378d35418ce9e7e9a2c491ee1c78`; backward-compatible 120-tick real browser capture remains functional.
- Strengthened forward native acceptance SHA `46b443ddd1ba4e395baedf3aa906c101e0460499`: [B116 run #39854645982](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39854645982) **queued when inspected**. A prior queued run on less strict SHA `71ff1a41be54378d35418ce9e7e9a2c491ee1c78` is not a substitute for the final acceptance gate. Verify actual run logs/JSON before asserting long-route reach.
