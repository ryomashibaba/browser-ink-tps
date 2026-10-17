# T21 / F4E103F → GitHub import gate

Status on 2026-10-17: **F4E103F local source NOT IMPORTED.** This development branch began at public `codex/t21-f4e28-ci-sandbox` commit `18cb86b09ebf9038cdb7072fcf3209bd4eb0a629`. The public CI result must NEVER be represented as a local F4E103F gameplay or performance validation.

## Protected authorities and boundaries

- `main`: existing T20 production, do not update or deploy from this branch.
- Draft PR #5 (`codex/t21-undertow-evidence-ledger`): retain unchanged, unmerged.
- F4E103F on Windows: latest working game; preserve `RUN_F4E103F.cmd` and restore path to F4E103E.
- Frozen game-authority counts: physical **25**, paintable **17**, navigation **26**, scoreable **0**. F4E103F's 39 extra source contacts are separate from this freeze.
- Maintain authoritative gameplay ink in `GameplayInk` and `PaintCoordinator`; never promote visual or GPU ink data directly to collision/nav/scoreable authority. Real movement requires Rapier KCC evidence.
- Undertow Spillway (Splatoon 3, Ver.7.2.0+, Turf War) only; original evidence required to promote topology/actors/materials.

## One-time source import procedure (not completed)

1. Export **only candidate self-authored source code and tests** from the exact F4E103F local working tree; record source hashes, actual local version, and source paths. Do not overlay all old GitHub files onto the local game.
2. Classify **each new file**: self-authored implementation; original independently modeled geometry; reference-derived geometry requiring provenance/license review; directly extracted game assets requiring separate redistribution permission; secrets/private content forbidden.
3. Exclude unreviewed original meshes, source ZIPs, videos, Face-ID files, local world folders, credentials, and private measurement payloads. An existing public file does not by itself prove distribution rights. The CI path guard alone is not copyright or secret clearance.
4. Compare F4E103F's actual `src`, `scripts`, `package.json`, and runtime ownership with the GitHub F4E28 branch. Do not infer this diff from handoff metrics or overwrite working F4E103F with the older baseline.
5. Import an audited, bounded patch into **`dev/t21-f4e103` only**; keep authoritative data and gameplay subsystems together where dependencies require it. Fail closed for unknown imports.
6. Run GitHub CI and distinct local Rapier KCC/Recast/CPU/paint/Chrome tests. Require direct measurements; mark local tests `PENDING_WINDOWS` when offline. Measure LIVE game fps separately from requestAnimationFrame control fps.
7. Only after successful tests, promote the verified patch to the local test slot. Never auto-merge to main, activate T21 production, replace PR #5, or publish original assets without explicit authorization.

## Current CI evidence scope

`.github/workflows/t21-dev-cloud-ci.yml` runs TypeScript, Vitest, build, Chrome WebGL2 baseline, and a limited known-path privacy guard. It produces sanitized **public baseline** results, not original geometry, F4E103F KCC proofs, 4v4 certification, or LIVE fps. The single GitHub Pages deployment job in this branch is separately protected with a main-only ref check.

## Next implementation

Obtain F4E103F source or a sanitized source delta; import code after provenance review. Then address F4E103G movement, original lower/underpass connection, CPU stalls and specials, paint/scoreable coverage, and actual 4v4 in dedicated gameplay commits. Do not substitute additional paper audits for gameplay work.

## Source-intake tool now available (metadata only)

The branch includes `scripts/t21-f4e103-source-intake.mjs` and the standalone Node safety tests. This is a **real implementation**, but it does **not** retrieve the Windows project, send code, authorize assets for publication, or prove the F4E103F identity.

After a verified local checkout of this development branch exists, one **optional initial Windows operation** can generate a metadata-only review report (illustrative placeholders, no automatic network transfer):

```powershell
node scripts/t21-f4e103-source-intake.mjs --source "<F4E103F local game folder>" --baseline "<dev/t21-f4e103 checkout>" --out "$env:TEMP\t21-f4e103-source-intake.json"
```

- Only recognized source code/config paths in `src/`, `scripts/` and four root files are inventoried. The `public/` tree, original OBJ/ZIP/images/videos and symlinked external trees are **not copied or uploaded**.
- SHA-256 and relative paths are recorded, with `NEW`, `UNCHANGED`, `CHANGED_OR_UNVERIFIABLE` or `REMOVED_FROM_LOCAL` comparisons when a baseline checkout is supplied. The tool does **not** inspect the `.git` history, confirm license provenance, or prove semantic compatibility.
- Known sensitive paths, embedded token patterns, binary and oversized content are blocked in the manifest. Geometry-like data is flagged for provenance review. Every remaining code file STILL requires human/publication review: a heuristic scanner cannot approve copyright or privacy.
- By default the report is written only to stdout; `--out` explicitly creates a new file outside both source and baseline trees, refusing overwrite. No game files are modified. No GitHub push, Drive upload, or browser deployment occurs.
- The Chrome CI is the older *public source baseline*. When the full F4E103F source is obtained and reviewed, migrate approved code as bounded commits, then independently validate Windows KCC/Recast, paint authority, CPU and real LIVE frame timing.

Do not run this helper from a randomly updated public branch using elevated privileges. The eventual Windows bridge must accept explicit, pinned revisions and refuse untrusted code execution.
