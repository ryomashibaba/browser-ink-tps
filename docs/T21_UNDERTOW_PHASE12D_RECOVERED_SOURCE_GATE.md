# Phase12D part 2 — exact original four-piece source candidate review gate

Phase12D searched all 4,136 original static FloorLine02 triangles (1,846 original vertex-ID-connected components) from the pinned Temple01 OBJ. It recovered the previously missing actual source 180° counterparts: 60006 ↔ 61728 and 61516 ↔ 62086, each error less than 6e-15m. There is no need to pretend that 60006 and 61516 mirror one another: their Y and area differ.

The recovery script extracts all **8 actual original triangle faces** in the four complete two-face original components, retaining original face ID, triple of original OBJ vertex IDs, and all original Float64 projected 3D XYZ. It recomputes original connected-component membership from original vertex IDs; checks Y, mirrored source areas and exact origin SHA; produces an immutable source-only artifact. It does not register them as game surfaces.

Independent Vitest loads **all 124 default + 8 Phase12C opt-in original source meshes**, checks each triangle for exact raw 64-bit and conservative 1e-7m near-duplicate coordinates, samples seven points per triangle against the existing frozen 42-point XZ polygon, and verifies unique 180° original mirror pair from real source triangles. Each of the four source components is classified separately and the resulting GitHub Actions report is exported. Passing requires zero duplicate and near duplicate source triangles, no hard-XZ sample outside, exactly one mirror partner. This is only a gate for later **separate opt-in** rendering, never a public stage floor/collider proof. No existing default graphics or runtime changed.

Also Phase12D original hard-outline audit found four held source components extending 0.41–0.51m past the frozen hard-XZ boundary; leave all four HELD without clipping or widening.

PR #5 stays Draft/unmerged. Main/T20 production, T21 activationReady=false, 64 walk source, 124 default original source displays, 8 Phase12C original opt-in source meshes, game physics/collider/paint/nav/scoring untouched.
