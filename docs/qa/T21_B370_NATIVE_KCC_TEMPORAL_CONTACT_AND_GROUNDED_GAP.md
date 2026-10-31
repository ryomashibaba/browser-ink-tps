# B370 — genuine 60Hz KCC temporal support witness across the original FloorLine00 transition

Date: 2026-10-31 JST. QA branch `dev/t21-f4e103w-qa-infra`.
Implementation commit [`42a0a883`](https://github.com/ryomashibaba/browser-ink-tps/commit/42a0a8830bf162fae172c2e2d177f9a8b83caaad).
**Same-SHA genuine CI** [#41179457526](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41179457526): **all job steps SUCCESS** (real game build, original OBJ SHA-pinned extraction, B239 original KCC, B241 both mirror trials and stored numeric QA).

## Purpose / method

B369 established exactly three `computedGrounded=true` / `numComputedCollisions=0` frames on each mirrored original entrance, despite nearby real registered-source footprint rays. B370 records **true pre-step and post-step kinematic human feet**, requested 60Hz movement, genuine Rapier KCC `computedMovement`, and closest actual **previous/next** original-collider upward contact events. This reuses the existing source-only B241 test and CI, without changing the native KCC setup, geometry, physics solver, players, CPUs, weapon, Recast, runtime or production. Nearby/future source contacts are **not** same-frame contact proof.

The exact private 43,263,289-byte Temple01 OBJ is SHA-checked upstream (`a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`), not committed or uploaded. Stage game authority remains 25 solids / 17 PaintSurface / 26 source NavLinks / 0 Scoreable, 0/12 authentic opposing routes.

## Actual native findings

| Mirror | Silent ticks (3 each) | Last earlier original upward KCC contact | Next actual original upward KCC contact | Requested Y step, all 3 ticks | True KCC-computed Y steps |
| --- | --- | --- | --- | --- | --- |
| POSITIVE_Z | 198, 199, 200 | tick 197, B240 exact original FloorLine00 | tick 201, existing original first-drop landing | -0.016111 m | -0.034805, -0.053935, -0.032512 m |
| NEGATIVE_Z | 196, 197, 198 | tick 195, B240 exact original FloorLine00 | tick 199, existing original first-drop landing | -0.016111 m | -0.034775, -0.053944, -0.033492 m |

The actual post-step body displacement closely matched KCC's computed movement (within the test's 0.0001m tolerance) in all six frames, and each reported grounded=true with zero **same-tick** KCC collision objects. The nine unchanged footprint rays still observed nearby registered-source geometry, but a ray is not a collision. Both isolated guided zero-offset human-capsule trials completed their bounded KCC path with zero airborne frames; the native baseline timelines were 211 and 209 steps respectively.

A plausible **hypothesis**, not a proven internal explanation, is that the existing `snapToGround=0.24m` configuration or KCC ground/slope handling contributes to the additional downward movement. The direct application of snap-to-ground on the silent frames was **not observed**. The 3+3 silent frames still cannot be upgraded to all-tick solver-contact or original collision-authority certification.

## Fixed decision / next playable priority

- SOURCE-original FloorLine geometry remains authenticated, but **live collision-intent for FloorLine00 is not authenticated**. The measured ribbon width ~0.311135m is below CPU diameter 0.60m and human diameter 0.64m. B240 CPU-safe original-radius Recast path remains unavailable.
- No natural same-body autonomous CPU cross-team passage, no full underpass route, no formal scoreable turf, no official match/winner. `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`. Draft PR #5, main, T20 and published Pages unchanged.
- **Do not spawn fictitious support, bypass capsule collision or repeat the radius-zero Recast workaround.** This bounded B370 measurement is complete; do not proliferate another diagnostic-only phase unless a genuine source-authority decision depends on it. Return the next work batch to the F1–F5 playable-game vertical slice: existing B365–B368 real 1+7 session, source movement/shooter/paint/HP/respawn and player-visible quality, preserving source-limited encounter/score HOLD.

Evidence: `scripts/T21B241OriginalFloorlineCapsuleLateralQa.test.ts`; CI log marker `B241_GENUINE_ORIGINAL_CAPSULE_TRANSVERSE_TOLERANCE_QA`, nested `b370NativeTemporalContact`; numeric artifact from the same run.