# T21 Undertow Phase12R — Original source-only edge incidence and normal-angle gate

## Baseline
Phase12Q pinned source geometry is I6+K4+L4+M8 = 22 complete original components / 488 triangles. It distinguishes exactly shared original XYZ from original OBJ vertex ID welding. Source Temple01 is 43,263,289 bytes SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`.

The Phase12R independent analysis examines every same-side unordered pair (55 LEFT + 55 RIGHT = 110). A coincident geometric edge is NOT a shared OBJ edge, not a physical weld, not necessarily a navigable seam. Each source triangle retains its own original Face ID, OBJ vertex ID and projected Float64 coordinates. No snap, cap, hidden backing wall, inferred floor or collider.

## Bounded independent preflight
The exact Phase12J K/L/M subset (16 original components, 356 triangles) was audited with a separate Python implementation: 56 unordered pairs; 14 pairs have exact XYZ-shared geometric edges and those 14 are boundary-to-boundary in each component; 2 pairs have a near-coplanar face-normal sample (unsigned normal angle <0.1°), 12 have a crease sample (unsigned angle >=0.1°), and 78 inter-component normal observations in total. Mirror checks 56/56 and Phase12Q subset checks 56/56. These are PRELIMINARY SUBSET findings only, not full 22-part CI results.

## Phase12R gate
* Independently reconstruct the triangle edge incidence for each original component, never modify any scene/runtime mesh.
* For each of 110 original component pairs, count exact XYZ-shared positions, geometric edges and complete triangles. Record each side's original triangle-face incidence for each shared edge (both source-boundary incidence=1 vs internal/multiple).
* Compute unsigned normal angle (minimum of angle and 180-angle); classify near-coplanar <0.1 degrees vs non-coplanar/crease >=0.1 degrees. This angle is purely geometric and is NOT a walkability or surface-authority verdict.
* Verify each original Face ID unique across all 488, no original cross-component OBJ ID sharing, and 110 original mirror relationships including edge incidence and angles.
* Cross-check ALL 110 pairs independently against generated Phase12Q JSON (which previously reconciles 80 Phase12P directional observations). If Phase12Q required evidence absent or inconsistent, fail CI.
* Emit detailed JSON artifact `t21-undertow-phase12r-original-source-edge-normal-audit`, with original source witnesses / Face IDs and no gameplay authority.

## Immutable holds
PR #5 stays Draft, unmerged. Production remains T20 inkworks-junction. T21 activationReady=false and Visual Freeze unapproved. Default visual 124, walk source 64, hard 42-point original XZ, optional review 22 components and the 28 unused original candidates (616 source triangles) are all unchanged. No geometry, collision, camera, visuals, CPU, score, paint or navigation changes are authorized.

## Next
Only after final full CI and evidence artifact verification, consider Phase12S bounded ORIGINAL source face incidence/watertightness analysis. Do not assume touching pieces are closed/collidable/walkable.
