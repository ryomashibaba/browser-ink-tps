# W10-B160 — F4 exact original-source gap decision + playable 180s seven-CPU ink activity

**Date:** 2026-10-24 JST. **Repository:** `ryomashibaba/browser-ink-tps`, ONLY QA branch `dev/t21-f4e103w-qa-infra`.

## Measured root boundary; stop repeating speculative link probes

W10-B159 exact-SHA (`dfc21d324fe2e1d4da8fe0410a2948d6dc84afc4`), [real B139 7CPU original PlayCanvas/Recast/Rapier Chromium #40081386935](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40081386935), `b139-original-TEAM_COVERAGE` artifact **12555054646**, original `w10b139-team_coverage.json` key `b159OriginalFaceNavMeshProjection`:

- CI #688 already exposed 42 exact original Temple01 source triangles in 10 mirrored route parts.
- Actual current **frozen 25-solid F3 native Recast nearest-polygon query** produced successful closest projections **2/42 centroids**, both at `underpass-route-slope00-inner` (one on each team side). Both were **outside the <=0.35m same-elevation criterion**: **1.916m** and **1.762m** 3D native projection distance; the projected NavMesh Y was **0.4m below each queried original Face centroid**.
- Other source parts (two `FloorSlope01`, two `FloorConcrete01`, two `FloorSlope00 outer`, two `FloorConcrete02`) returned **0/38** nearest-polygons in the current *bounded/default* Recast `findClosestPoint` query. This is not a global nearest-search and cannot prove that another native polygon does not exist outside Recast's extents.
- **0/42 of the bounded ±1.2m static Rapier source rays hit a registered runtime solid** at these exact original triangle centroids. The 42 CI #688 route faces are **not current authoritative stage solids**, consistent with the source code.
- Real original right-low→underpass paths remain stopped in both directions; native Recast last endpoints and genuine registered solids are in B157/B158 evidence. Historical CI **#691** *already tested all five exact original route parts per side as added navigation geometry*, and **failed to connect** (partial two-point path, 31.716m endpoint residual). Repeating blindly is invalid; no guessed NavLink or fake floor.

These measurements narrow the engineering decision: full original geometry registration, Recast polygon island connectivity, step/fall elevation semantics and genuine Rapier human KCC must be reconciled together **before any F4 promotion**. The original source OBJ Face → actual admissible Recast/KCC link is not yet proven. The current stage remains 25/17/26/0, opposite-team natural paths 0/12, source F4 HOLD.

## B160 actual visible gameplay improvement (instead of another diagnostic-only stage)

- Add `B160SourceCpuActivityView.ts`: strict reusable view model consuming **authoritative B154 PaintCoordinator event outcome** (7 CPU per-actor *accepted changed ink cells*), checking exactly A1/A2/A3 and B1/B2/B3/B4, team sums, nonnegative impact/foot/stamp event consistency and forbidden production/scoreable authority.
- Integrate with the **existing 180-second F3 source practice session board**, **not a new game mode or score screen**:
  - While playing: compact readable Team A vs Team B **actual changed ink cells** and genuine CPU participation (e.g. 6/7, without pretending all seven painted).
  - On genuine `TIME_UP` with no source stop: a readable seven-CPU per-actor contribution chart with individual accepted ink changes, and clearly labeled no Turf score/area/winner. It is an activity chart including possible repaints, **not an accumulated unique colored map area or any official win probability**.
  - Scoped to existing preview only; no extra CPU steering, relocation, reload, NavMesh, Rapier collision, score, gameplay ink writes or production promotion.
- `B160SourceCpuActivityView.test.ts`: actual input contract guard, all seven actor IDs, 0-cell player, corrupted/forged actor changes, wrong team sums, false scoreable authority.
- Reuse existing B75 typecheck + Vitest and B139 7CPU real Chromium (no new workflow); native runner explicitly checks B160 live DOM exists, reports actual sources as unscored, and saves the corresponding observations in original paired evidence JSON. 180s terminal behavior is conditional and **not asserted by a short B139 physical trial**.

## Next substantial F4 engineering trial

The immediate *geometry* problem cannot be certified by adding the known 42 faces: CI #691 rejected that. A useful next stage requires a meaningful source-backed **bounded local 3D Recast island/component plus human KCC support** comparison, or new original private Face evidence where uncovered. If no new source evidence is available, prioritize longer **source-verified playable F3 interaction** and actual combat/CPU ink rather than indefinite one-metric-per-commit QA.

## Protected authority

Never touch `main`, T19C/T20 stable, Pages, Draft PR #5 or original Windows assets. Preserve 25 solids, 17 paint surfaces, 26 links, Scoreable=0, 0/12 natural opposing-side routes; `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`; formal original 4v4 **HOLD**. A local CPU changed-cell comparison is not a Turf result or winner.

**Verification status:** commit/CI results of B160 belong to exact SHA and must be read before claiming type/build/real-Chromium PASS. B159 facts above come from the inspected prior actual uploaded browser artifact, not a fake fixture.
