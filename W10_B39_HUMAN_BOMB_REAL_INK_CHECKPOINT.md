# Browser Ink TPS — W10-B39 native human bomb *actual ink* gate

**Date:** 2026-10-19 JST  
**Base:** `8b4a20b72cba1612e7c81237809514fddb524e1f` (B38 QA).  
**Scope:** `dev/t21-f4e103w-qa-infra` only. Never touch default T20, main or Draft PR #5.

## Motivation

B38 proved a real F-key throw, true ink consumption and one native bomb explosion. However a bomb could explode in unsupported empty air and alter **zero** original GameplayInk cells while the animation and B38 test still PASS. B39 makes this difference observable, and strictly fails its Chrome paint-quality witness when no actual source-owned ink changes.

## Implementation

- Extend the existing read-only `PaintCoordinator.processTick` post-`GameplayInkSystem.apply()` feedback sink to count Human + Bomb stamps, events with **strictly positive authoritative changedCells**, last verified surface, last changed tick and changed cell totals. It never increments official Turf score, invents a new PaintRequest, or infers painted cells from a fired/animated bomb.
- Preserve B23 human projectile Impact/WallImpact counters unchanged. B25's **180 impact cells + 12m grounded** practice condition remains projectile-impact-only, not silently credited by Bomb.
- Reuse the existing unobtrusive center-screen confirmation marker to show `BOMB INK +N real cells` for 27 genuine 60Hz ticks after a changed-cell Bomb; prioritize the more recent of bomb and bullet feedback. No additional overlay obstructs the gameplay.
- Add pure unit tests rejecting non-Human/invalid/zero-change bomb events and proving independence of projectile/bomb counters.
- Enforce a stronger B38 browser witness: genuine F key + pointer lock + actual `SubWeaponSystem` explosion must also yield >=1 authoritative changed cell on a real original paintable surface. The test rejects a zero-paint explosion instead of declaring success.

## Safety

25 original source physics solids / 17 original paintable / 26 original NavLinks / **0 official scoreable**; only the existing certified partial setup. Cross-team authentic foot paths remain 0/12, `activationReady=false`. No original actor transformations or private source assets recovered. B31-B35 research-only CPU strategies remain disabled by default; FIXED patrol unchanged. No User Windows GPU / full 4v4 claim.

## Completed QA — precise evidence

**Implementation + browser QA tested SHA:** `061170a5804b63f298775353834078fd6f653f62`. The later final documentation-only commit is not falsely claimed as a new code test. All tests below ran on that implementation SHA.

| Test | Verified result |
| --- | --- |
| [Trusted input, real WebGL2 human F-key bomb, seven CPU and aligned baseline](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39243322223) | **SUCCESS** (all steps). Real browser pointer-locked KeyF / native human `SubWeaponSystem` throw + 60Hz Rapier and GameplayInk explosion |
| [B14 actual browser CPU render and respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39243322205) | **SUCCESS** |
| [B21 frozen original-source render A-B-A](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39243322268) | **SUCCESS** |
| [Windows and Ubuntu hosted QA launcher/physics regressions](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39243322215) | **SUCCESS** (matrix-specific skips do not count as PASS on skipped OS) |
| [Pinned original visual pack/real browser rendering](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39243322133) | **SUCCESS** |

The trusted browser job log directly records:
- **1** real F-key human bomb throw with normal ink resource consumption, **1** actual bomb explosion, **144** additional native 60Hz simulation ticks.
- **9** human Bomb paint stamp events, **9** events with a strictly positive authoritative `GameplayInkSystem.apply()` changed-cell result; **830** actually changed original-source ink cells in total. The last original surface: `UndertowT21D:first-drop-landing-negative-z:paint`.
- Certified stage remains **25 original solids / 17 paintable / 26 original NavLinks / 0 official scoreable**, `activationReady=false`, no new original actor topology.
- B25 human projectile-impact practice is **not credited** by bomb paint. Its original success thresholds and scoring semantics remain unchanged.
- New and previous source feedback unit suite **6/6 PASS**; B37 input **12/12 PASS**, B17 HUD **4/4 PASS**, source-goal/recast pure tests **11/11 PASS**. Real Chrome authenticated F throw and original GPU integration regressions also PASS.
- B31–B35 optional CPU route research remains separate from normal FIXED source patrol. The trusted job's previous B35 paired native baseline comparator also completed successfully; this is a **regression test**, not acceptance of B35 as a gameplay upgrade.

## What this proves, and what is still unknown

**Confirmed:** actual F-key bomb explosion can paint 830 authorized ink cells in this specific original local landing scenario. Successful visual feedback now refers to positive authoritative changes, never to an unverified bomb launch or animation. Scoreable remains zero; no Turf winner is inferred.

**Not yet certified:** arbitrary locations/bomb throw angles, balance or quality in varied human play sessions, a real owner's Windows RTX device, measured gameplay FPS, screenshot-level review of the new `BOMB INK` confirmation, any original private actor-layer transform, real continuous cross-team paths, or free natural 4v4 combat. This result is **one Chrome QA throw**, not a statistical average. Browser 144 physics ticks do not imply 144 frames at 60 displayed FPS.

## Immutable source and protected refs

- **25** physical original solids / **17** original paintable / **26** original NavLinks / **0** scoreable, `activationReady=false`.
- Verified opposing-team native paths still **0/12** for current incomplete authority setup; not proof that the original Splatoon map is disconnected.
- Original `Vss_Temple01` Banc/SetActor GUID, genuine instance world transforms/active Layer bindings and underpass identity **remain HOLD/UNKNOWN**. No unauthorized corridor, bridge, spawn, collider, original mesh/actor placement, score, or CPU teleport was fabricated.
- Last read-only protected-ref check: `main=fbd922cea900df8e1a139f21b3c61ed927b3fdd9`; PR #5 head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`, open/draft/unmerged. T19C/T20 frozen production, published Pages, and owner Windows originals untouched. No private original asset payload committed.

## Next product-quality decision

On authorized original source surfaces, favor human-facing gameplay credibility and actual interactive experience, rather than low-yield CPU goal retarget heuristics. First secure lawful private original Banc/SetActor evidence if obtainable so continuous authentic gameplay routes can be certified. Without it, continue validating playable source-local movement, bombs, rendering and feedback. Use controlled original-foot/ink evidence; never invent a 4v4 match or release status.
