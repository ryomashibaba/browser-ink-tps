# T21 Phase12V: bounded original-source contact study

Phase12U has full SUCCESS CI #1440. Source Vss_Temple01.obj: 43,263,289 bytes, SHA256 a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046. Original active Face count 70,396.

Phase12S: 22 components, 488 original triangles, 524 original OBJ-ID open boundary edges. Phase12U: 436 exact geometric edge matches to other source faces, no original OBJ-ID welding, with 88 remaining unmatched edges across 8 components.

Phase12V explicitly limits its expensive 3D search to these 88 original boundaries. It reconstructs original OBJ-ID components and excludes ONLY each target's own component. The full 70,396 source triangles are queried, using exact original projected Float64 XYZ and a 0.5-meter AABB search radius (no vertex snapping). Five distinct categories: positive-length partial collinear edge overlap; strict non-coplanar segment through triangle interior; zero-distance point or coplanar contact; nearby within 0.5m; none within 0.5m. Includes original Face IDs, original vertex IDs, witness triangles and distances. NONE_WITHIN_HALF_METER is a bounded search result, not proof of an open gap in the entire source.

Independent Vitest checks that 88 targets precisely match Phase12U evidence, verifies witness original face IDs and recalculates collinear overlap and strict piercing, checks counts and 0.5m bound, and guards T20/T21 states. A JSON evidence archive is kept by GitHub Actions for 14 days.

This is strictly source-only evidence. No implied walkable surface, collision, full mesh closure, floor, cap, triangle creation, OBJ ID weld, nav, paint, score, AI, camera, runtime authorization or visual freeze. T20 production is inkworks-junction, PR #5 Draft/open/unmerged, T21 activationReady=false, Visual Freeze unapproved, base source display 124, walk-source 64, hard 42-point XZ, held 28 additional components.

Next Phase12W should be selected from actual Phase12V witness patterns, without inferring gameplay connectivity.
