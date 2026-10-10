# T21 Undertow — Phase12U pinned whole-original boundary edge inventory

## Purpose and source
Phase12T audited 524 original OBJ-ID boundary edges on 22 optional source-only Temple01 parts (488 original faces). Among the 28 held Phase12J original source candidate components (616 original triangles), 176 edges had exact Float64 projected XYZ endpoint matches with distinct source OBJ IDs; 348 had no such matching edge **within those 28 only**. Phase12U broadens the exact source edge evidence window to all 70,396 active original Temple01 faces. No source vertex, triangle, collider, floor, navigation, paint, CPU or production code is added.

The canonical KiTrix `Vss_Temple01.obj` must be byte-identical: size 43,263,289 and SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`. The full-original source scan uses the same pinned original Face-index counting rule and static-source projection used by earlier phases, excluding no active original faces from the source search index. Source Face IDs, original OBJ vertex IDs, source object/material, exact Float64 positions and witness Face IDs are retained in evidence.

## Independent source algorithm
1. SHA/size/70,396 original-face validation precedes any output.
2. Rebuild original OBJ ID-connected components within the same original object and material (not equal XYZ), locate all 22 shown review-source components from Phase12T minFace, independently verify all 488 original faces and each of their 524 boundary ID-edges.
3. Build exact original OBJ-ID edge and independently exact projected-XYZ geometric edge lookups from **all 70,396 original active source faces**, excluding the 488 shown original triangles from the *external witness* set.
4. For each original boundary edge, distinguish an externally shared original OBJ-ID edge, exact geometry with separate OBJ IDs, and no exact matching full-original edge; record exact original Face-ID/object/material witness and number of matches. Keep prior T classification and the special subset of 348 formerly unmatched held28 edges.
5. Assert that all 176 Phase12T held matches are present in the expanded source search; any mismatch means a genuine authority/evidence gate failure, not an excuse to infer or repair geometry.
6. The independent Vitest gate re-verifies frozen source arrays, T20 production, T21 inactive, 524 original boundary source records, original witness IDs, 22 per-component sums, 176/348 reconciliation and output classification semantics. The general npm test has no original OBJ artifact requirement; the explicit CI source gate **requires** both T/U artifact inputs.

The CI artifact `t21-undertow-phase12u-full-original-source-boundary-neighbors` contains all 524 edge records and per-original-part summaries. The exact full-original counts must be read from **CI output**, never guessed.

## Important scope limitation
An exact XYZ endpoint edge match is not a shared OBJ-ID edge and not proof of physical welding. Lack of an exact edge match does **not** mean lack of touching, intersecting, overlapping, near-but-nonidentical surfaces, nor missing full-original face support. Coplanar subdivision, T-junctions and near-distance candidates need separate, threshold-labeled evidence; Phase12U does not silently claim their absence or add missing faces.

## Frozen authority
PR #5 stays Draft/open/unmerged; T20 production remains `inkworks-junction`; T21 `activationReady=false`; Visual Freeze remains unapproved. Original default review 124, walk source inventory 64, hard 42-point XZ, optional 22 complete source-only components and 28 held candidates all unchanged. Runtime floor, roof, collision, paint, scoring, CPU, navigation and activation authority: NONE.

## Continuation
Only when the source QA, TypeScript, complete Unit suite and real five-view browser evidence pass on the same final HEAD may Phase12V investigate unresolved full-source edges via tightly bounded 3D AABB, triangle/segment intersections and separately labeled *near source* evidence. New render/collision authority remains explicitly held.
