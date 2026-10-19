# Browser Ink TPS — W10-B45 | original-source Rapier-only line-of-sight survey

**Initial code checkpoint: CI pending.** Base QA HEAD `3d80a30ba542197d711dd04f24766d4ef86c2d1b`.

B44 measured 8/10 genuine Rapier candidates but 0 actual Rapier chosen contacts. B45 is a **distinct read-only exploration phase**: from the existing native human source QA foot, scan 648 angular rays from the genuine player subweapon muzzle. Use the untouched `RapierStagePhysics.castStageSegment(...,'thrown-sub')` and already built `PaintSurface.intersectSegment`, and the exact existing `paintSurfacePriorityEpsilonMeters` to identify ray directions where an original-certified Rapier solid would take priority over the paint ray. Report nonpaint-backed original solids, scan totals, winner solid IDs, and nearest candidate rays. This is a straight-line static audit, **not** a native ballistic bomb, a game-ready collision, an original-game match, or proof of reachability at that angle.

The audit is exposed only on existing explicit F3 source QA with actual humanSub, while paused, and is run by real Chrome/CDP trusted-input CI after completing all unchanged B40-B44 KeyF trials. It creates zero new projectiles, entity actors, collision solids, paint requests, path links, spawn positions or Scoreable surfaces. Missing candidates are an honest negative result; no source authority is promoted just to satisfy the probe.

Frozen: original 25 Rapier physical solids / 17 Paintable / 26 NavLinks / **0 Scoreable**; activationReady=false; CPU FIXED baseline; natural enemy paths 0/12; T20 main, Draft PR #5, Pages, original local/private Banc and OMEN owner GPU untampered.

## Verified evidence
Pending actual CI and native Chrome survey JSON. Until a true KeyF native bomb chooses Rapier, `RAPIER_STAGE_SOLID` selected remains **UNOBSERVED/HOLD**.
