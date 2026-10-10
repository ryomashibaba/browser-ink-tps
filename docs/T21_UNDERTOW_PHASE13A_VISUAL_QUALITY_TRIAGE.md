# Phase13A — visual quality triage against ACTUAL T21 review captures

## Fixed baseline and scope
- Existing Phase12Z checkpoint: `5385db2ff2526d2f73522049522b10dd0015104f`; full Phase12Z numeric-source QA, TypeScript, unit and 5-view capture had passed while long existing XZ CI steps remained running at Phase13A start. Do **not** claim a completed full CI for #1450 until GitHub says success.
- Source: pinned `Vss_Temple01.obj`, SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`, 43,263,289 bytes.
- **Actual screenshots**, from real Chrome/PlayCanvas WebGL2 review: `T21_OVERVIEW`, `T21_TOP`, `T21_POS_TO_NEG`, `T21_SPAWN_A`, `T21_SPAWN_B` (each 1600×900). Separate Phase12M context and Phase12O left/right original detail captures were also reviewed. These are the REVIEW renderer, **NOT playable screenshots**.
- The screenshots show clear cyan/orange provisional surfaces, magenta vertical columns, black/unresolved zones, a prominent left review control pane, and subtle/micro-scale original pillar detail that is better seen in the separate zoom images. We cannot infer physically missing colliders, unreachable platforms or game-balance metrics from those pixels.

## Evidence integrity implemented here
`scripts/t21-phase13a-real-five-view-visual-baseline.mjs` is a no-dependency Node read-only PNG scan:
1. Requires capture manifest `CAPTURED_PENDING_HUMAN_VISUAL_QA`, exactly five review views, 1600×900 and explicit `authorizesVisualFreeze=false` / `authorizesGameplayOrStageActivation=false`.
2. Verifies actual PNG byte count and SHA256 against each manifest item, independently reads PNG IHDR, inflates actual IDAT and reconstructs 8-bit RGB/RGBA scanlines (PNG filters 0–4). Real canvas pixels must be nonblank.
3. Counts high-contrast colored pixels only in ROI x=350..1579, y=40..864, step=4, thus conservatively excluding the left review panel. It publishes each measured ratio and its simple bounds but **does not classify floor, collision or artistic quality**.
4. Negative self-tests reject corrupted/non-PNG bytes and blank colored-ROI frames. The gate runs in the existing five-view evidence job without repeating expensive T21 source scans.
5. Uploads a separate `t21-undertow-phase13a-real-five-view-visual-baseline` JSON, retaining the original mandatory five-view screenshot artifact unchanged.

## Evidence-led review: priorities and acceptance
| Priority | Visual observation (NOT gameplay assertion) | Proposed next nonruntime action | Future acceptance/evidence |
|---|---|---|---|
| P0 | Dense fragmented central cyan/orange geometry makes a single coherent playable route visually hard to infer from overview | Split source display, draft collision/playable-route unknown markers; request an annotated map plus ground-level counterpart | A/B actual browser captures with matching cameras, explicit UNKNOWN labels, no invented connectivity |
| P0 | 2D overlap of upper and lower surfaces is ambiguous; source face contact and geometry cannot certify actual gameplay | Separate source geometry, collider, nav, paint in evidence table | Each source-only statement tagged geometry / gameplay QA / unresolved, no automatic promotion |
| P1 | Strong cyan/orange/magenta review tints are analytical, not a reliable source material/lighting recreation | Source family palette & material-reference comparison proposal only; don't recolor runtime now | Source-attested material map, screen-tested contrast / silhouette preservation |
| P1 | Pillar rim/band and underside hierarchy visible only under close-up in Phase12M/O | Keep locked BASE/WITH zoom screenshots and compare silhouette and area | Same-camera left/right review, consistent documented camera pose, no hidden inferred faces |
| P2 | Left sidebar overlays about the first 350px of frame; subject moves among cameras | Plan optional UI-free capture overlay or renderer-only presentation preset | 5 mandatory canonical views untouched; optional camera-matched no-overlay screenshot pair |

These are recommendations and must not be recorded as completed visual improvements. No user or reviewer has approved Visual Freeze. Thumbnail/ROI statistics demonstrate presence, not quality or floor topology.

## Immutable guardrails and change control
- PR #5 `codex/t21-undertow-evidence-ledger`: Draft/open/unmerged; keep T20 `inkworks-junction` live and T21 `activationReady=false`.
- 124 normal source display meshes, 64 walk-source inventory, 42-point hard outer XZ, 22 optional original source-only components/488 faces, 28 held original candidates/616 faces.
- No mesh generation, caps, source vertex welding, collision, paint, nav, scoring, CPU, physics, glass, real gameplay, stage activation, merge or publication.
- Phase13B: design a source-only camera-matched UI-free **optional review** screenshot comparison and location-specific prioritized shortlist. Any implementation affecting gameplay requires a separate authorization and specific runtime QA.
