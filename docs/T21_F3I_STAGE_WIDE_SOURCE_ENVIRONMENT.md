# T21 F3I — macro environment review / missing actor inventory

**No production permission.** This F3I candidate keeps T20 frozen and T21 behind `?t21Play=preview&t21FullSource=review`. PR #5 remains draft.

## Batch implemented
- Stream the separately SHA-pinned 43MB original OBJ **again**, without retaining or committing it.
- Export original `FldBG_Temple01_*` mesh faces (within established ±300 OBJ-space bound) as a **separate**, SHA-checked F3I diagnostic BIN for opt-in visual comparison. Nothing is merged into the exact F3G 57,578 static-triangle ledger. The file is not distributed in source control or regular deployment.
- Inventory `FldObj_Temple01_*` unplaced objects with their face/triangle counts and original local coordinate bounds, ranked by triangle count. Actor parts are deliberately **not placed into gameplay space** without valid Banc/BYML matrices.
- Expose review-only background toggle (B). It is OFF by default to prevent unsupported 3D placement assumptions. F3H SOLID/TRAVERSAL/X_RAY and observation camera cycling (H/V) are kept.
- Fail closed on SHA mismatch, malformed face index, unexpected manifest authority fields, local BIN count/hash mismatch, or mesh size exceeding conservative limits.

## Limits and next actual stage work
- Source OBJ coordinates alone do not prove where `FldBG` belongs in the runtime scene. Even if a backdrop *looks right*, it is not registered collision, a path, or a scoring region.
- `FldObj` part bounds are **not** actor placements. The large central physical route continues to be on HOLD pending trustworthy position and collision data.
- The user-facing priority remains full-stage visual completeness and movement topology, not dozens of tiny fixture additions. Next use the ranked actor inventory to target recoverable placed assets in bulk, conditional on instance transforms.
- QA: F3I isolated fixture tests; full `typecheck`, unit and Chrome smoke; source SHA and visual-source CI logs; T20 untouched.
