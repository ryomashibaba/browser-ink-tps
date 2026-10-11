# T21 F3H — whole-stage source visual and coverage gate

Status: **nonproduction, visual-only development candidate**. T20 production must not change; T21 requires `?t21Play=preview`, whole-source requires `&t21FullSource=review` and the locally prepared pinned source pack.

## Whole-stage improvement, not new gameplay authority

- **SOLID (default)**: all non-glass original static groups are solid with depth writing, correcting F3G's all-transparent visual overlap. Glass remains translucent.
- **TRAVERSAL**: floor and slope remain opaque; roofs, tall supports and detail become transparent, so gaps and lower-level original source shapes can be inspected. This mode **does not claim that any visible floor is physically walkable**.
- **X_RAY**: previous F3G translucent optical treatment for comparison. Press **H** or use the panel's F3H button to cycle. Press **V** for the preexisting six observation cameras.
- A regenerated, SHA-pinned manifest includes source-only coverage counts: distinct included static OBJ objects, excluded FldObj face lines (potential placement-bound elements, **not** validated absent stage pieces), excluded FldBG face lines, and static triangle counts for source Z greater than 32, -32 through 32, and less than -32. A triangle is bucketed by its OBJ-space centroid, never by inferred gameplay footprint. These are descriptive counts, not actor placement proof.
- The optional new coverage field is **fail-closed** if its three buckets do not total the validated triangle count or it claims actor placement/traversal authority. Older exact F3G manifests remain accepted for backwards compatibility.

## Invariants / unresolved evidence

No modification to T20, 25 original solids, 26 original links, 17 unscored paintable surfaces, 0 scoreable, human + 7 CPU physical routes, death Y, camera collision, or world construction. This change does **not** recover the Vss_Temple01 Banc/BYML placement data. Original material semantics or camera/actor collision cannot be inferred from render groups. The F3F central route remains unconnected; the prior candidate failed with approximately 31.716 m route error. No inferred bridge or convenience nav link is allowed.

## Validation gates

Run `npm run typecheck` and `npm test` plus the fast F3 Chrome smoke. When source conversion can run, `npm run t21:source:prepare` then review solid/traversal/x-ray under all six cameras. The full source OBJ and derived BINs remain **local only** and must not be committed or attached to artifacts. F3H full visual review is not equivalent to the long seven-CPU movement proof (F3D).
