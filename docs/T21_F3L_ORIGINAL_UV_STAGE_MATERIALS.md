# T21 F3L — high-impact original static UV and albedo renderer

**Candidate: nonproduction source review only.** This is the first large material-fidelity pass beyond the uniform F3G palette. It does not resolve absent object-instance registration.

## Change set

- Preserve the original 57,578 static Temple01 triangles and their *actual OBJ vertex/texture-coordinate indices*. No invented polygons, texture projection, inferred bridge or gameplay terrain.
- Use immutable KiTrix commit `0611f51b35c9736ee986fb2218461e2585b7875e` for the original MTL and 20 selected high-impact albedo textures (floors, concrete, wall metal, pillars, bridge, roof, stage-side, lines). Verify the MTL Git blob SHA `93b6d30ecac396e960058d6c71db80aadca10fef`; also verify original OBJ SHA-256, exact total triangles, original UV presence, all local preview BIN SHA-256, and individual PNG SHA-256.
- No original MTL, OBJ, original PNGs, or derived preview BINs are committed to Git. CI generates them temporarily for `?t21Play=preview&t21FullSource=review`. Texture transparency and original shader/material parameters are **not asserted**; this is a static UV + albedo visual review, not final parity.
- The full-source review can switch between old flat F3H rendering and new F3L UV texture material rendering via **T**, while **H** keeps flat source study modes, **B** toggles separate F3J environment, and **G** opens isolated F3K representative showroom. F3L is OFF until explicitly enabled.
- Real Chrome smoke must verify texture mode and flat fallback with 25 untouched stage collision solids, 26 untouched navigation links, 17 original paintable but unscored surfaces, no score mask and zero physical source promotions.

## Blocking issues not reclassified

The 190 unplaced actor meshes are never world-registered from the source-local gallery. Without legitimate Temple01 Banc/BYML transforms, new authoritative bridges, jump lanes, actor collisions, Turf score and the ~31.716 m central gap remain unresolved. This is a visual-quality stage-wide pass rather than deceptive navigational completion.

## Next prioritization

Compare F3L central and team A/B source-camera screenshots against canonical references. If source UVs and materials pass, bring the F3L textured view up to legibility quality as opt-in default only after human visual review. Then focus on retrieving verifiable object placements and authoritative route topology; do not spend future cycles on decorative microdetail before solving those.
