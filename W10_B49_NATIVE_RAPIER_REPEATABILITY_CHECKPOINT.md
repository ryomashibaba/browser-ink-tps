# Browser Ink TPS — W10-B49 native Rapier contact repeatability

**Final decision: B49 bounded native repeatability PASS.** 2026-10-20 JST.
- Verified **B49 tested code SHA**: `39eaffaacfacd7a2b88f827f8828c32008fca72d` (includes previous QA-only witness retention adjustment `b5d6194940f1e09bfe10130cdb0c7c43e5bd6e6a`).
- Starting QA HEAD: `02ffd22981280dec61beb8f9120562a4e69bbf9c`.
- Trusted GitHub-hosted Chrome original-human control input (actual pointer-locked mouse and native KeyF), true SubWeaponSystem, native Rapier stage casts, original PaintSurface projection and post-`GameplayInkSystem` ownership. **All four GitHub Actions checks on verified code SHA completed SUCCESS.**

## Mission and fixed positive control

B48 achieved first genuine human KeyF **Rapier-selected** original-source collision on bomb #15, source `UndertowT21D:right-low-team-b`: exact native contact world point **(−6.26026353, 4.46692788, −59.08575785)**, 66 native flight queries, native initial velocity **(−7.89080617,+9.82311157,−4.55019599) m/s**, 4 original PaintSurface stamps and **77 newly owned authoritative GameplayInk cells**. On its collision tick, `Rapier id=right-low-team-b` returned a real hit while `PaintSurface paintId=null`; native `LANDED_FUSE` explosion occurred at the contact point.

B49 source-QA-only passive witness retention was increased **from 16 to 32** to retain actual bomb #17–#19. This does not alter physics/paint/CPU or authoritative map masks.

## Exact B49 authentic three additional human throws

The existing real human #15 measured camera yaw **−62.04°**, pitch **+27.96°** served as the **positive target**. For each of three additional throws:
1. Native Chrome pointer lock and actual `Input.dispatchMouseEvent` moved the real camera to the same target; no camera field setter, player teleport, virtual collision, projectile injection, arbitrary ink award or synthetic native witness.
2. Human ink refill came from actual `advanceQaTicks`; each real KeyF throw consumed the normal resource and produced one observed genuine native bomb explosion.
3. Positive match required `RAPIER_STAGE_SOLID`, same original `right-low-team-b` source collider, **actual Rapier candidate present and PaintSurface candidate absent** on the winning native flight tick. Stamps and ownership are separately reconciled from post-raster canonical ink.

| Real human throw ID | Actual camera yaw/pitch | Native chosen physical contact | Flight queries | Native stamp events | New authoritative owned cells |
|---|---|---|---:|---:|---:|
| **#17** | −62.04° / +27.98° | **Rapier source `right-low-team-b`** | 66 | 4 | **0** |
| **#18** | −62.04° / +27.98° | **Rapier source `right-low-team-b`** | 66 | 4 | **0** |
| **#19** | −62.04° / +27.98° | **Rapier source `right-low-team-b`** | 66 | 4 | **0** |

**B49 native Rapier-positive repeats: 3/3**, after a separate first genuine positive B48 #15. All three repeats selected exactly the same source physics collider, with source-only collision contact point **(−6.2602632654, 4.4679343679, −59.0863858544)**, native Rapier cast distance **0.0532201044m** and **no simultaneous PaintSurface candidate**. `LANDED_FUSE` and 66 ticks unchanged.

- **Max world contact-point discrepancy from B48 first positive #15: 0.001186264m (≈1.19mm)**.
- **Max initial native velocity discrepancy from #15: 0.003676899m/s**.
- Actual native camera yaw error **0°** and pitch error **−0.02°** relative to original successful measured view; physical player-foot difference **0.000002146m**.
- **4 real PaintSurface stamp events** occurred for each of #17/#18/#19, but **0 newly owned cells** each: the same original cells were already painted from the earlier throw. This is **not** bomb physics failure. A stamp, a render or a changed owner cell alone is **not** evidence of Rapier collision; the native winning contact witness is the authority.

The samples are **three genuine repeats in a single deterministic Chrome session**, not across sessions/OS/human manual trials or a Nintendo-original geometry validation. Do **not** present this as comprehensive edge/grate/wall collision conformance.

## Existing B35 fixed CPU lane independent CI

Native original source baseline, standard FIXED CPU and all thresholds unchanged. This verified real-Chrome B49 run recorded the original lane clearance:
- Keyboard-driven real player retreat **3.156951909m**;
- Native source lane separation **1.712617989m**;
- Source-only geometry, at physical tick **183**, **PASS** original thresholds 1.5m/1.6m.

Earlier **B45 run attempt 1** failed B35 lane clearance and passed on same-commit retry; intermittent baseline risk remains known and **not causally fixed** by B49. Do not adopt B31–B35 experimental CPU heuristics or weaken lane thresholds.

## Actual GitHub Actions provenance — verified B49 code SHA

- [Trusted native Chrome B49 19 real KeyF throws + three Rapier repeats + unchanged B35 fixed CPU comparison](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39346462176): SUCCESS.
- [Original F3G full pinned original source visual](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39346462134): SUCCESS.
- [Original source render A-B-A](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39346462249): SUCCESS.
- [Real Chrome 7-CPU lifecycle / render / respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39346462131): SUCCESS.

## Freeze / HOLD

**Original source authority preserved:** 25 physical Rapier solids, 17 Paintable, 26 NavLinks, **0 Scoreable**; `activationReady=false`, naturally navigable opposing-team connections **0/12** and original Banc/SetActor actor placement unproven. Standard FIXED CPU, main, frozen T19C/T20, Draft PR #5, Pages and owner's original Windows source files untouched. Local OMEN RTX and full natural 4v4 activation remain HOLD.

**Next W10-B50 (efficiency first):** Audit and harden B35 lane-clearance intermittency via evidence from multiple independent same-SHA real Chrome runs, without changing CPU heuristics/physics thresholds, while treating current Rapier repeatability as a regression sentinel rather than repeating identical experiments indefinitely. Prioritize player-visible original source geometry/navigation and gameplay quality after closing the transient baseline gap.
