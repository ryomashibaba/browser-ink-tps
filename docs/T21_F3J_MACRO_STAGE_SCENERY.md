# T21 F3J — Stage-wide visual scenery + macro asset gap families

Branch PR #5 remains Draft. **T20 and all physical T21 geometry unchanged**.

## Macro step
1. F3I's independently SHA-verified original \`FldBG\` visual background (34,426 original OBJ-space triangles on the verified base) becomes **ON by default only inside** \`?t21Play=preview&t21FullSource=review\`. Press B to compare ON/OFF. Source OBJ-space vertices are directly used; this does not assert a verified stage instance transform. No new collision, paint, navigation, spawn, or score components.
2. Aggregate **all** \`FldObj_Temple01_*\` mesh definitions into deterministic canonical families using the exact string suffix after the last \`__\`. The family ledger reports total source-mesh variants, faces, triangles and largest representative, sorted by aggregate triangle count. Prefix variants (e.g. color and material presets) are not counted as placed instances.
3. Show family count and four priority families in existing nonproduction HUD, top eight in the QA snapshot, and send full top-24 ledger through a manifest generated only by the pinned original OBJ. This directs the next reconstruction effort at large bridge, pillar and structural families *without inventing placement matrices*.
4. Fail closed if the family ledger contains bad numbers, duplicates, unsafe names, inconsistent counts or falsely grants placement authorization. Backwards-compatible older F3I manifests remain accepted, but no family claim is made for them.
5. Whole-source GitHub Actions verifies the actual manifest, browser scenic-default render, B toggle round-trip, unmodified 25 physics solids, 26 navigation links and zero new scored surfaces.

## Still blocked — gameplay quality gate
No trusted \`Vss_Temple01\` Banc/BYML transform graph, so original actor-family meshes **cannot be registered on the stage**. Family priority is geometric, not geographic or evidence of traversable connection. The disconnected ~31.716m central gap, original scoring layout, and T20 frozen stage are untouched. Avoid turning attractive scenery into walkable surfaces without exact collision & topology evidence.

## Faster next delivery
The most impactful dependency is *trusted instance matrices*, followed by batch source component assembly / playable eligibility checks. Do not burn steps on low-impact cosmetic tweaks or repeated full regressions; run fast type/unit checks and CI source-browser proof as one batch.
