# W10-B173 — Bulk actual original underpass surface-chain separation

**Date:** 2026-10-25 JST; after B172 source-active session commit `9e4a3d5016cd70a064556800c5a69c28e2450957`, QA branch only.

## Playability blocker
The full-original 4v4 and natural A/B fights are held by authentic navigation: the two source underpass paths are not connected, current opponent paths 0/12. Earlier CI #688 identified 42 source-authenticated triangles in ten components (five per mirrored side). CI #691 temporarily included the 5+5 original component candidates but failed Recast with 31.716227m endpoint error and two-point partial path. This rules out promoting the bundle as a verified link.

## One complete root-cause pass, rather than more micro-QA
`B173OriginalUnderpassSurfaceChain` performs a single deterministic, symmetric 3D nearest-surface investigation of all **eight sequential component pairings** among the **ten existing original mesh records**. It tests triangle vertices against actual triangle interiors and all edges against other edges, not just endpoints or projected route points. For each pair it retains closest 3D source-space points, separation in meters, prior source graph component IDs and whether the actual meshes meet within 30cm spatially. It **does not** assert Recast, original player KCC, opening, jump, line-of-sight, score or traversability from spatial proximity; it cannot authorize colliders. No original/source files are uploaded and no frozen geometry is modified.

This bulk chain result is a finite, inspectable inventory narrowing future source evidence requests to specific missing original mesh adjacency. When original provenance is still missing, **stop creating tiny B174/B175 geometry guesses** and prioritize sustained original-source eight-actor playable behavior until authorized source evidence exists. No guessed pads, bridge, NavLink, player/CPU warp, official score or winner.

## Efficient CI
The B173 pure safety/geometry tests are inserted in the existing B75 TypeScript/Vitest preflight, not a new Actions workflow. Its existing FIXED/SWEEP browser lane is reused. B131 trigger-matrix tests gain explicit protection against legacy full-browser CI fanout when the single common CDP driver changes; only existing B59 owns this shared driver trigger. B172 180s run #40153888854 was still in progress at B173 authoring; do not claim it passed.

## Frozen authority
25 Rapier solids / 17 PaintSurface / 26 source NavLinks / 0 Scoreable. Opponent routes 0/12; activationReady=false, productionAuthorized=false, unrestricted4v4Certified=false. QA-only, main/Pages/T19C/T20/Draft PR #5 and private assets unchanged. Success is limited to code/build+verified measured surface distances, not an authentic original 4v4.
