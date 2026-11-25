# F4 performance batch 3
Research source inspected d2aff25b6889a4f276d93937bf6d90ff07d6ab3a; Windows share 175e1a63f4825d28761e57eef9ca2b44aeccb6db; chief partial 01 blob 40832b8e741b058c4a1b19827dc6c48b547ea96a.
Chief manifest confirms performance-mask and performance-raster included; do NOT apply those twice. GPU pack and B216 CPU grid overlays not included in that manifest.

Apply these new independent overlays after chief partial 01, with git apply --check; if chief advanced, review context before integration.
- paint-backing-query.patch: src/physics/RapierStagePhysics.ts (post-chief reconstructed preimage; Windows source blob 57579a64169dbb795cde98f263764ad582b6407c)
- radar-scratch.patch: src/app/B402NativeSourceInkRadarSamples.ts (research preimage e6bdf1195923f501249c19416b99c4050d0ce05b; not in Windows shared file list)

Physical backing: reuse temporary world point and projected hit result, use same scalar ray components and normal flip, fresh origin/direction records and Ray, stable collider filter reading live map. No query count change, no ray caching, no tolerance or eligibility changes. Existing stage safety preserved.
Radar: use existing PaintSurface.localToWorld output parameter, copy retained dots, hoist tile boundaries and count team dots in same pass. Same tiles, active cell checks, height/range checks, ordering, freshness and counts. Legacy two-argument mocks remain compatible. No game/scoring writes.

Executed connector V8 isolation: actual source method bodies with type annotations removed and mock Vec3/Ray/world/surface. 5000 backing cases incl downward normals, signed zero, inactive cells, hit/miss; 4615 actual mock query calls per implementation with exact ray components, range, solid mode, filter and result; 100 additional hit selection cases exact; total ray calls 5081 each. Vec3 creations in 4615 backing queries 18460 -> 0 (one persistent scratch per physics instance, two fresh plain vector objects and Ray per query still allocated). No native Rapier result claimed.
Radar actual source vs patched: 120 scenarios (17 grids each), 51543 returned dots identical including order/positions/counts; mock world-coordinate Vec3 creations 476536 -> 120 using existing output overload. Not measured FPS or GC times. Both patch replays exact against respective preimages. Native TS/Vitest/Rapier/PlayCanvas pending. Run existing B402 tests, physics tests and typecheck after integration.
No changes to chief files, previous handoffs, official QA or fixed simulation. Do not prioritize diagnostic optimizations over the actual playable integration.
