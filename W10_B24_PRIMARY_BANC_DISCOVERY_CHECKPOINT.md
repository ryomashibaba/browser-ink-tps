# Browser Ink TPS — W10-B24 Primary Banc/SetActor Discovery Checkpoint

**Date:** 2026-10-19 JST  
**Parent B23 QA HEAD:** `3f689c2479b76a11126270e4dcba878fa9babf59`  
**Verified implementation head:** `189dd1afda34dfcdb5f8c60706c0cbd4f4c685b3`  
**QA branch:** `dev/t21-f4e103w-qa-infra` only.

## Critical original stage discovery

The existing real `src/stage/undertow/UndertowW10SetActorBancEvidenceGate.ts` proves **8 unresolved `FldObj_Temple01_PntSet_*` source mesh components** across both sides (4 positive-Z, 4 negative-Z). The schema-only gate recognizes five original-looking `Lft_FldObj_Temple01_*Set` Gyaml classes, but has **no authenticated actual `Vss_Temple01` Banc/BYML actor payload** in public source control. Neither original actor instance/world transforms nor active Layer bindings can be inferred from a mesh, OBJ local bounds, plausible XYZ, synthetic fixture or class count. The original central/underpass physical crossing and opposite-team native path therefore remain HOLD.

**Do not run further synthetic 0/12 Recast bridge probes, use guessed world transforms, or promote optical geometry.** Getting a private original Banc instance export is the practical critical path, subject to provenance and applicable rights. A schema-valid file is not proof of original authenticity.

## Actual code delivered

- Added `scripts/t21-w10b24-private-banc-preflight.mjs`, an entirely offline **metadata-only** discovery tool for user-owned locally prepared source folders. Checks only Temple01-labelled candidate filenames and decoded JSON/undecoded BYML.
  - Strict size/depth/file-count bounds and skip symbolic links. Never execute private files, decompress archives, copy them to the repo, modify local source, or connect to GitHub.
  - Output per candidate is **basename, SHA-256 and aggregate Actor/Gyaml-class counts**, valid/invalid schema counts, and coarse reject reasons; never original Actor transforms, private layers, source JSON, raw mesh vertices, or absolute source file paths.
  - Recognized/decoded input still yields `HOLD_BANC_AUTHENTICITY_AND_MESH_BINDING_UNPROVEN` (or multiple-candidate HOLD). Undecoded BYML yields `HOLD_NEEDS_PRIVATE_OFFLINE_BYML_DECODE`; missing files yield `HOLD_NO_DECODED_VSS_TEMPLE01_BANC`.
  - Report includes frozen authority **25 physics / 17 paintable / 26 NavLinks / 0 scoreable / activationReady=false**, **zero** source promotion, zero new runtime collision/nav/score, no production authorization.
- Added `RUN_T21_W10B24_PRIVATE_BANC_PREFLIGHT_ONCE.cmd`: optional **one-step Windows local use** on already reviewed QA source checkout. Defaults to the known private F4E66 folder only when it exists; accepts a direct folder argument or `T21_B24_BANC_DIR`. Refuses overwrite, outputs one local metadata JSON under Downloads, never uploads assets, credentials, actor transforms or metadata. It can find/inspect a decoded export ONLY if such a file is actually present.
- Added `scripts/t21-w10b24-private-banc-preflight.test.mjs` covering absent source HOLD, plausible synthetic schema but no actor-coordinate/layer leakage, raw BYML/wrong stage/multiple candidates HOLD, output containment/no overwrite.
- Added a dedicated **tiny CI** rather than costly repeated browser/7-CPU runs (gameplay code untouched).

### Proven tests

[W10-B24 isolated QA — GitHub Actions](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39167911759): **SUCCESS** at code HEAD `189dd1afda34`. Node 24 syntax checked, **4/4** negative/privacy tests PASS, baseline gate confirms original authority remains zero. No real private source files, original instance placements, original route or owner Windows runtime have been tested here.

Previously verified B23 live real Chrome [integrated source input+7 CPUs](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39167138894) remains VALID because this B24 batch **only adds** private preflight CLI, synthetic tests, CMD and isolated workflow. No gameplay code was changed.

## Source/production safeguards

- **Immutable authority:** 25 certified original collision solids, 17 paintable original surfaces, 26 certified original NavLinks, **zero** official scoreable surfaces, `activationReady=false`.
- No Banc-authentic instance transforms recovered, no registered central connection, no source license gate crossed, **no natural 4v4**.
- T19C/T20 frozen, `main=fbd922cea900df8e1a139f21b3c61ed927b3fdd9`, separate Draft PR #5 `8cfc95756ef0b56e2c33dc9f89a9041126daa272` unmerged, production Pages untouched.
- No owner Windows filesystem accessed remotely; no private original assets included on the public GitHub repo.

## B25 actual next step

If the owner locally produces and chooses to share the B24 **metadata-only report** and it reveals a candidate `Vss_Temple01` decoded export, establish a separately reviewed authenticity/provenance gate and one-to-one Actor GUID → source mesh identity + layer + coordinate-system relationship **privately**. Do not import original actor transforms or meshes publicly without rights review. Only after primary source binding and direct Rapier/Recast continuous KCC proof consider additions to T21 physical/nav and eventually scoring.

If no decoded source is available, keep HOLD and focus higher-impact **true original-stage playable experience**, avoiding low-value fictional connection, repeated synthetic Recast proofs or endless test work. The optional local helper does not block continuing Chat/GitHub development.

**Audit:** This phase advances the primary dependency with a working private evidence discovery tool, not fake stage reconstruction. Efficient isolated synthetic testing, accurate outcome distinctions; Chat/GitHub-only, no Work handoff or local system mutation.
