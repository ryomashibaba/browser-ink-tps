# B369 — native Rapier KCC and capsule-footprint provenance on original FloorLine00

Date: 2026-10-31 JST. Branch: `dev/t21-f4e103w-qa-infra`. Independent native evidence: [CI #41166850919](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41166850919), **SUCCESS**. Commit `78ff0b88bb453d82e249029b79286de9f32f06d0`.

## Purpose and immutable boundaries

The B241 actual original FloorLine00 KCC experiment was physically grounded on both mirrored sides, but its single center-of-foot vertical stage ray returned no source ID for 7 POSITIVE_Z and 8 NEGATIVE_Z transition frames. A missing center ray does not prove the 0.32m-radius capsule was unsupported, nor does a grounded KCC Boolean prove source-authentic clearance.

B369 retains the **exact original 43,263,289-byte pinned Temple01 OBJ**, SHA-256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`. Every native CI reruns original B238/B239 extraction and physical source walking before B241/B369. No OBJ enters the game repository or artifact.

The experiment uses the unchanged separate 31-solid physical QA world: original runtime **25 solids, 17 paint surfaces, 26 NavLinks, zero scoreable**, plus five B235 authentic source meshes and one two-triangle B238 original FloorLine00 source collider on each separately tested side. It never promotes any collider to live gameplay. No change to Recast, original geometry, CPU radius, AI behavior, player dynamics, actors, scoring, main or production.

## Exact B369 native collision observations

For **each** formerly unknown center-ray frame, the experiment now reads the genuine Rapier KCC `computedCollision(i)` data for that native 60Hz step, including original registered collider ID, world-space collision witness `witness1`, outward collider normal `normal1.y`, and time-of-impact. Independently, nine unmodified vertical registered-source character-mode rays sample the real capsule footprint: center plus eight directions at radius **0.2496m** (inside the 0.32m human radius). Only nearby floor heights within 0.20m enter the footprint comparison. The rays are **measurements**, never supporting impulses, foot correction, invented colliders, or KCC collision responses.

| Genuine native result | POSITIVE_Z | NEGATIVE_Z |
|---|---:|---:|
| Center-ray-null frames | 7 (ticks 196–200, 202–203) | 8 (ticks 194–201) |
| Nearby original-source peripheral ray on those frames | 7/7 | 8/8 |
| Native KCC collision with upward source normal in the same frame | 4/7 | 5/8 |
| Same real original collider independently found by native KCC and foot ray | 4/7 | 5/8 |
| No KCC collision returned in that same native frame | **3/7** | **3/8** |

In the early overlap, the actual KCC collisions identify the isolated **B240 exact original FloorLine00** with upward `normal1.y` around 0.935–0.971. Later collisions identify the unchanged registered original first-drop floor with normals approximately 0.98–1.0. The 3+3 remaining frames have `computedGrounded()===true` and nearby authentic-source rays but **no collision returned by the character-controller query that frame**. This cannot be upgraded to continuous solver-confirmed original support based on the rays.

The original isolated FloorLine00 remains only **0.311135m wide** in the measured source sections, smaller than both the 0.60m CPU and 0.64m human capsule diameters. Nearby authentic registered floors can still contribute, but the isolated FloorLine alone is not a CPU-clearance proof.

## Formal gate

B369 establishes **some genuine collider-specific Rapier upward contacts that the center-only B241 ray misses**. It narrows the unknown transition and preserves the unresolved frames. No claim that the entire source transition is free of unsupported moments; no proof of natural same-body autonomous CPU traversal, original-game collision flag for potentially decorative FloorLine00, full F3 underpass ingress, opponent crossing, score or official 4v4.

- Source-authentic FloorLine00 *geometry*: YES, SHA-verified original source
- Isolated guided human-sized Rapier KCC passage: YES, 2 sides
- Source-collider KCC contacts for formerly center-null frames: PARTIAL, 4/7 and 5/8
- All formerly center-null ticks collision-confirmed: **NO**, 3 on each side remain unresolved
- Live collision inclusion / author intent for FloorLine00: **UNVERIFIED**
- CPU-safe native Recast path at original radius: **NO**, B240
- Natural cross-team passage: **0/12**, gameplay/art/production HOLD

## Next engineering step

Do not repeat the already failed radius-zero Recast workaround or add invented geometry. First distinguish the **3+3 KCC silent frames** via solver snap-to-ground history, previous/next real contact witnesses and shape/capsule support geometry (keeping real 60Hz movement unchanged), while independently authenticating original FloorLine00 collision semantics if possible. Only then consider a guarded QA-only physical CPU-motor experiment; require real CPU identity, genuine source-backed continuous support and full original route evidence before any activation.

Evidence: `scripts/T21B241OriginalFloorlineCapsuleLateralQa.test.ts`, `/tmp/b241/b241-physical-width-and-lateral-qa.json`, Actions numeric artifact ID `13029363698`. No external source OBJ is included.
