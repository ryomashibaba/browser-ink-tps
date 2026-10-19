# Browser Ink TPS — W10-B45 | original-source Rapier-only line-of-sight survey

**Initial code checkpoint: CI pending.** Base QA HEAD `3d80a30ba542197d711dd04f24766d4ef86c2d1b`.

B44 measured 8/10 genuine Rapier candidates but 0 actual Rapier chosen contacts. B45 is a **distinct read-only exploration phase**: from the existing native human source QA foot, scan 648 angular rays from the genuine player subweapon muzzle. Use the untouched `RapierStagePhysics.castStageSegment(...,'thrown-sub')` and already built `PaintSurface.intersectSegment`, and the exact existing `paintSurfacePriorityEpsilonMeters` to identify ray directions where an original-certified Rapier solid would take priority over the paint ray. Report nonpaint-backed original solids, scan totals, winner solid IDs, and nearest candidate rays. This is a straight-line static audit, **not** a native ballistic bomb, a game-ready collision, an original-game match, or proof of reachability at that angle.

The audit is exposed only on existing explicit F3 source QA with actual humanSub, while paused, and is run by real Chrome/CDP trusted-input CI after completing all unchanged B40-B44 KeyF trials. It creates zero new projectiles, entity actors, collision solids, paint requests, path links, spawn positions or Scoreable surfaces. Missing candidates are an honest negative result; no source authority is promoted just to satisfy the probe.

Frozen: original 25 Rapier physical solids / 17 Paintable / 26 NavLinks / **0 Scoreable**; activationReady=false; CPU FIXED baseline; natural enemy paths 0/12; T20 main, Draft PR #5, Pages, original local/private Banc and OMEN owner GPU untampered.

## Verified evidence
Pending actual CI and native Chrome survey JSON. Until a true KeyF native bomb chooses Rapier, `RAPIER_STAGE_SOLID` selected remains **UNOBSERVED/HOLD**.

## B45 authoritative CI and observations — 2026-10-20 JST

**Verified code SHA:** `5ef49a8cd10c60551cb2011fc5921ed10c51d6e2`. First read-only source-ray audit commit `e366fb831876d6e4438582c0fbc9bdef026a698b` passed **six** checks (including Ubuntu and Windows QA). Final B45 native throw commit also has **four completed SUCCESS** checks; trusted Chrome workflow's **first run attempt failed its separate existing B35 CPU lane-separation gate**, while the B45 real source trial was already PASS. GitHub **retry attempt 2** on the **same SHA**, without changing CPU or gameplay code, completed SUCCESS. Therefore *final GitHub check state green*, but B35 first-attempt failure is not erased or interpreted as proven fixed.

### Actual read-only rays from original player physical foot

Actual player position at survey: **(2.777, 3.895, -53.914)** project meters. Survey used existing source Rapier `thrown-sub` ray, original PaintSurface intersection and original 0.06m epsilon at **648** yaw/pitch directions. Results:

| Read-only straight-ray metric | Verified samples |
|---|---:|
| Total directions | **648** |
| Native Rapier collider hit | **284** |
| PaintSurface ray hit | **278** |
| Both candidates present | **278** |
| PaintSurface selected by unchanged priority | **186** |
| Rapier collider selected by unchanged priority | **98** |

The **98 Rapier-first straight rays** identified **only two original solidity IDs**: `UndertowT21D:first-drop-landing-negative-z` and `UndertowT21D:spawn-high-negative-z`. **Both have registered original paint backing**. This is NOT verification of an unpaintable original wall/grate. Eight original solids had no registered paint backing (two grate meshes and upper glass variants); **none appeared as a Rapier-first winner in this finite survey**. This finite angle/distance grid cannot prove them globally unreachable.

Nearest read-only ray: yaw **+135°**, pitch **-50°**, first original `first-drop-landing-negative-z` Rapier collision at **1.137m**, no PaintSurface ray crossing at that straight path. Other original `spawn-high-negative-z` Rapier-first directions near yaw −65° to 0°, pitch +30°, distance ≈5.540m, had a paint-surface intersection ≈5.794m (Rapier earlier). Angles/lengths are native straight-line query results, not simulated ballistic projectile hits or original Nintendo game claims.

### Additional real pointer-locked human F-key pulse bomb (11th native throw)

Using actual CDP mouse movement, camera was steered to the **nearest Rapier-first ray direction**: intended yaw +135° (equivalent to −225°), pitch −50°. Measured actual camera aim yaw **−225.06°**, pitch **−49.98°** — errors **0.06° yaw / 0.02° pitch**, no direct camera writes, player foot unchanged. One actual human KeyF throw consumed real player ink and produced one native explosion.

- **Actual native winner:** `PAINT_SURFACE_SEGMENT`, not `RAPIER_STAGE_SOLID`; source `UndertowT21D:first-drop-landing-negative-z:paint`.
- Actual native contact/explosion point **(3.669, 3.002, −52.373)**; `LANDED_FUSE` after 12 native flight query ticks.
- **Both candidate casts did return** on that contact tick: PaintSurface **0.063104m**, Rapier matching original solid **0.066215m**; existing priority epsilon **0.06m**, so PaintSurface correctly won.
- **5** genuine original PaintSurface bomb stamps; **400** new post-GameplayInk CPU-authoritative owned cells; official Scoreable remains 0.
- **B45 solid-first *straight ray* is not itself evidence of solid-first *actual ballistic trajectory***. The native projectile's gravity and upward boost lead to a different selected collision, as this real controlled comparison demonstrates. No physics tuning or gameplay change was performed to force selection.

### GitHub CI checks

- [B45 real Chrome, authentic native target + source ray scan + B40–44 + CPU baseline, retry attempt 2](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39328474479): final SUCCESS. Initial attempt failed **`T21_F3_BROWSER_REAL_PLAYER_STILL_BLOCKS_SOURCE_CPU_LANE`** during separate B35 CPU comparison (reported retreat 2.897m, separation 1.490m); retry with identical code succeeded. **Potential nondeterministic baseline remains a monitoring concern**, not an acknowledged improvement or reason to adopt alternate CPU heuristics.
- [F3G original pinned source visual](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39328474412): SUCCESS.
- [Original A-B-A render](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39328474377): SUCCESS.
- [Native 7-CPU lifecycle and render](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39328474357): SUCCESS.

**B45 decision: PASS** for honest finite native solid-first ray reconnaissance + exact user-input target throw and owner-grid observation. **Rapier as the actual selected native pulse-bomb collision: still unobserved (0/11)**; do not upgrade to a terrain or gameplay certification. B46 should target a grounded original `spawn-high-negative-z` underside/side wall only if actual source geometry supports a reproducible legal trajectory, and separately inspect B35 lane-clearance reproducibility with independent fixed-tick evidence before considering CPU regression resolution. No additional invented stage geometry, original Banc actor, artificial score masks, or new natural 4v4 authority.
