# W10-B166 — Real original A1 rendezvous guidance for playable ALLY SYNC

**Date:** 2026-10-25 JST · existing Browser Ink TPS · QA branch `dev/t21-f4e103w-qa-infra` only. Nonproduction.

## Verified B165 gate before B166
At `38e9e6a5948b32506226a7c9dcd6ee5ea2e59d37`:
- [Real ALLY SYNC Chrome #40104161099](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40104161099): **SUCCESS**, including browser-visible third native A1 actual-impact bar and genuine CLEAR; original #40101671443 independently recorded 808 genuine human changed cells, 37.22m real human grounded movement, and 36 genuine new A1 impact-changed cells/1 real tagged impact after arming.
- [Native CPU 7/7 + 3 variants + independent audit #40104161042](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40104161042): all four jobs **SUCCESS**.
- [Actual WebGL2 CPU ink FIXED + SWEEP #40104161045](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40104161045): all three jobs **SUCCESS**; preflight 97/97 Vitest plus Vite/TypeScript passed.

### Actual user experience problem addressed
ALLY SYNC is genuinely playable now, but if human physical movement ends several meters from the source A1 rally position, authentic source ally aim requests never occur. Neither just firing, the third ink progress bar, nor looking at a top-down map alone explains the source-only spatial standoff. Users need in-game, **read-only location context**, not AI steering, synthetic floors, or a route to cross an uncatalogued original gap.

## B166 user-facing feature
- `B166OriginalAllyRendezvous.ts`: pure native-readout function for the existing active ALLY SYNC. Inputs are current actual source PlayCanvas 60Hz native tick, genuine Rapier HUMAN body, authenticated native CPU A1 **physical foot**, whether the actual original CPU has physically rejoined, real grounded/active human status and real A1 tagged impact-change counters. Does not touch A1 AI, native stage collision, Recast navigation, ink or practice goals.
- Critically, **normalize HUMAN Rapier player BODY Y to physical FOOT Y** using the single engine-authoritative `PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters`. The real B164 original human body was around Y=3.895 while actual A1 foot was around Y=3.10. Comparing raw body with A1 foot would falsely report a dangerous 0.795m elevation mismatch. Native common support tests MUST compare like-for-like physical foot coordinates, and may not take an arbitrary new KCC offset.
- Display real **horizontal A1 separation** and authentic vertical **foot-height difference**, with source-scoped contextual hints: A1 hasn't physically rejoined, human not grounded, different height band, very close A1, outside empirically observed source-support interval, close to A1 awaiting genuine paint, or actual tagged A1 ink observed. The bounded proximity advisory is ~1.70–2.45m based on original verified local source A1 standoff, **not proof of a safe route** or any guarantee that a shot will be approved by the rest of the source system. Always explicitly say **DIRECT DISTANCE IS NOT A SAFE ROUTE**.
- Integrate only into the existing B165 ALLY SYNC card. No new modal, no additional background/QA workflow, no additional game mode, no painting after a shot request, no player or CPU move from code. No A1 hints in CLASSIC/SWITCHBACK/PAINT_RELAY.
- Unit tests validate real B164 body/foot offset, unsafe different original height band, out-of-distance and too close, live true original A1 impact status, non-source authority and forged CPU ID/coordinates. The exact-SHA existing B162 true-Chromium action must observe B166's non-route, no-winner data in the same independently sourced live clear after genuine human+A1 inputs. Reuse existing B75 and B139 preflight regression checks.

## Hard source authority gates
Unchanged **25 original solids / 17 Paintable / 26 native NavLinks / 0 Scoreable**; original cross-team KCC 0/12. `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`, unrestricted original 4v4 HOLD. Hint state does not authorize floor, a path, a NavLink, an A1 aim or a win. No `main`, production Pages, T19C/T20, original Windows files, or Draft PR #5 changes.

Exact-SHA B166 Chromium is to be evaluated from CI; no new B166 native PASS is claimed until evidence.
