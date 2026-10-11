# F3K — original source asset geometry showroom (opt-in)
F3J pinned full-source gallery extension. **Never an actual object placement.**
The 43MB original OBJ is parsed twice by the owner-side conversion pipeline:
1. F3I collects all 190 unplaced source objects and sorts their canonical families.
2. F3K extracts representative original triangles for the top 8 families, checks original triangle counts and exact original SHA-256, and emits local hash-checked review binaries only.
No original OBJ or derived binary is committed, distributed in the repository, or promoted into the playable map.

In `?t21Play=preview&t21FullSource=review`, press **G** to open the separate geometry showroom, then G for next representative and finally return to the normal player camera. The gallery renders geometry **normalized to a fixed viewing box**; relative size is intentionally NOT authoritative. All meshes and the showroom camera are approximately 900 m outside the source stage view and are enabled only for inspection. Physical simulation pauses during inspection; no player/CPU teleports and no world geometry edits occur.

## Safety
- F3K files need exact original SHA-256, matching triangle counts and file hashes.
- Asset space is `ORIGINAL_OBJ_LOCAL_UNPLACED`, viewer space `ISOLATED_NORMALIZED_SHOWCASE`; **neither** supplies original Banc/BYML actor transforms.
- 25 stage solids, 26 navigation links, 17 unscored ink surfaces, zero score surfaces are untouched.
- Human / CPU movement, central ~31.716 m discontinuity and Turf scoring are unchanged.
- No release / T20 mutation. PR #5 remains Draft.
