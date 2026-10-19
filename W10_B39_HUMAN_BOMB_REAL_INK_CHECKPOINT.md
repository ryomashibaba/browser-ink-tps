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

## Validation status

**PENDING** at initial implementation. Read actual Chrome CI before marking a positive ink-cell result; visible paint is not proof of CPU authoritative ownership without the post-raster counter.

