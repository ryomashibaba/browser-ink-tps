# B222 — exact original 2m horizontal gap; isolated real Human jump verification

26 October 2026 JST. Parent verified at `6584bbbaf544b0f1f5c6a96391e752adb9a8cfc9`.

## Root-cause evidence preserved, no silent geometry promotion

Pass18H examined adjacent Temple01 classes and found **zero** qualified ordinary-walk bridge components at the 2m model-space glass destination frontier. FloorLine00 candidates are overlay graphics, not proven traversable floors. Pass18I proved the gap is exactly **2.0m horizontally in model Z, 0.0m vertically** (project 2.074234789m); no vertical stair is being mistaken for a gap. Pass18J performed 8 original Human KCC **no-jump** directed traversals: **0 succeeded** as grounded walking, airborne 20–23 ticks, feet dropped 1.99–2.52m. Previous CI691 original 5+5 triangle insertion also failed Recast route formation. Repeating those tests or adding a convenience bridge is prohibited.

## What B222 changes

A source-only **isolation test** now instantiates exactly two existing CI688 original triangle-mesh colliders per side (FloorConcrete01 and FloorSlope00 outer) in Rapier, uses the actual configured Human capsule/KCC and the production 60Hz movement, gravity, speed and jump constants, and attempts both directions with WALK control and a single JUMP. It does not modify ANY production/runtime geometry, NavMesh, CPU agent, player input, official scoring, or original evidence. The test logs raw KCC ground loss, regained ground, end-surface Rapier support solid ID and actual endpoint errors. This is a feasibility test, not a claim that the original game requires or permits such a jump.

The test runs in the B75 **preflight**, alongside baseline Vitest and full Chromium FIXED/SWEEP. A passing preflight does **not** mean jump feasibility was proven; evaluate `B222_NATIVE_ORIGINAL_GAP_KCC_JUMP_WITNESS` and its per-direction `success` field. It never authorizes an off-mesh link or 4v4.

## Required promotion gate

Even if both KCC jump directions are physically successful, preserve 25 solids / 17 paint / 26 links / 0 scoreable, productionAuthorized=false, original opposing routes 0/12 and officialWinner NONE. Before considering an AI traversal, verify original traversal semantics and actual gameplay input-driven jump in an isolated native browser scene, then test Recast route, contact, source-lane safety and return direction. No auto-jump or teleport shortcuts.

## Actual isolated Rapier results (B222 CI 40285215169, preflight SUCCESS)

The new fixture was executed, not inferred: **all four WALK controls failed** to achieve target ground support, while **all four genuine Human JUMP runs succeeded** with genuine airborne then grounded phases and target-solid Rapier foot support. Mirrored sides and forward/reverse each passed. Maximum successful-jump horizontal endpoint error 0.0439464m; maximum foot-height error 0.059021m; rise 1.1583–1.1757m. This proves local Human KCC jump feasibility on the two exact CI688 surfaces only. Runtime cross-team travel, original-game traversal semantics and CPU route certification remain unproven. The jump outcomes are now strict assertions for future regressions.
