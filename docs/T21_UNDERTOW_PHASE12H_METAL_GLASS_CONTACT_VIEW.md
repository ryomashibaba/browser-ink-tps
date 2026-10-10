# T21 Phase12H — pinned original metal/glass source intersection view

Previous Phase12G #1399 found 47 individual original-triangle contact records across four edges, NOT 47 gameplay connections. Phase12H deliberately selects the **four unambiguous original source metal/glass point intersections** at top original FloorLine02 edges #60006 edge2 and #61728 edge2, whose original Float64 source coordinates and source global face IDs are proven in the pinned KiTrix Temple01 43MB source artifact.

Two symmetric source-only sides:
- source #60006, original edge #2, metal original face #35412 at t=0.43438914027149556; glass original face #35648 at t=0.7171945701357494.
- source #61728, original edge #2, metal original face #35414 at t=0.4343891402714977; glass original face #35650 at t=0.7171945701357494.

The exact original 3D endpoints, contact point XYZ, materials, source face IDs and original segment parameter are encoded in `UndertowSpillwayPhase12HSourceContactEvidence.ts` and verified **bit-for-bit** against the full SHA256-pinned independent Phase12G CI original-OBJ report. No inferred bridge or new source triangle is created. One original short segment is drawn with thin purple optical bar; actual metal intersection is amber, glass is cyan, the same source original two-triangle thin FloorLine quad is shown behind it. To avoid z-fighting, **visual marker Y only** is lifted by 8cm relative to the existing source-rendering correction (original stored XYZ stays unchanged). The display markers are not actual collider glass/metal or render-authorized gameplay.

Opt in with `?stageReview=undertow&reviewRenderer=webgl2&reviewSourceContacts=60006` or `&reviewSourceContacts=61728`, or click **Metal / glass contact −Z/+Z** in Visual Review. The contact marker root is **OFF** in every ordinary preset, hides during the normal 5-view Chrome captures, and returns OFF on exit. Source optical focus uses Phase12E's one-quad source-only camera; all 124 ordinary source-display mesh inventory and 64 frozen walk-source count remain unchanged. Two optional Chrome 1600x900 PNGs are recorded in the five-view evidence ZIP, separate from mandatory five directions, with `CAPTURED_NOT_GAMEPLAY_PROOF`.

Freeze: T20 `inkworks-junction` unchanged; T21 `activationReady=false`; PR #5 Draft and unmerged, 42-point hard outer frozen. Four detected original intersections **do not** prove OBJ-vertex-ID welded adjacency (Phase12F proved 0/16), playable floor, closed glass, projectile physics, collisions, nav, or paint. Do not approve Visual Freeze without separate user review.
