# W10-B73 — owner-local adjacent Zstandard dictionary to unblock private Temple01 metadata reading

Base QA HEAD: `1c588b7a37f4fb37176e8554356708471faefa42`. 2026-10-21 JST.

## Actual improvement over B71

- The same **existing one-click** `RUN_T21_W10B24_PRIVATE_BANC_PREFLIGHT_ONCE.cmd` now recognizes one **owner-provided raw Zstandard dictionary** adjacent to a Temple01 `*.byml.zs` candidate. Supported local filename suffixes: `.dict`, `.dic`, `.zsdic`, `.zstdict`. Uses the Node.js 24.20+ native Zstd dictionary option to locally decompress, rather than requiring the owner to manually create a plaintext JSON conversion.
- Exactly zero or one local raw dictionary per source folder. If multiple matches, symlinks, non-files, undersized or >512 KiB dictionary: **HOLD**; never pick one arbitrarily. All private source files remain on the owner's device. No dictionary bytes, filename, ID, transforms, Actor positions, private layers, source mesh geometry or GUID leave RAM. The report includes only a boolean marking an owner-provided raw dictionary was used.
- No outside download, GitHub assets, external service, archive extraction or new tool installation. This does not automatically extract proprietary `ZsDic.pack` contents; it requires an already locally available raw dictionary and otherwise remains HOLD.
- The fallback retains B71 raw BYML and ordinary no-dictionary `*.zs` decoding. Unsupported or corrupt frames remain HOLD. Neither successful parse nor class names, transform schema or BYML header authenticates a Nintendo original `Vss_Temple01` Banc or yields the 8 missing actor-to-source PntSet mesh bindings.

## Validation scope

B73 synthetic tests cover owner raw dictionary Zstd compress/decompress and the B24 preflight end-to-end with a deliberately fictitious local Temple01 actor. Tests verify no coordinate, private layer or dictionary secret appears in report, ambiguous multiple adjacent dictionary files fail closed, and empty, oversized or invalid dictionary inputs are rejected.

The existing B24 isolated Node 24 workflow already includes `scripts/t21-w10b71-private-byml-metadata.test.mjs`, so the new positive and negative tests run when these source files change. The B60 regression workflow runs for B24 changes as well. Actual private original Nintendo source is **not** present in CI; do not claim original Stage Actor placements, navigation or official 4v4 are restored.

## Frozen authority

Actual source stage 25 physics solids / 17 original Paintable / 26 audited NavLinks / **0 Scoreable**; 8 PntSet still unbound, opposing-team naturally traversable routes 0/12, `activationReady=false`, `officialWinner=NONE`. CPU default remains FIXED. No mutation of real game source, visual stage, gameplay, publishing, main or Draft PR #5.

## B72 status at writing

Repaired B70/B72 real 180s browser-storage workflow [39542106594](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39542106594) still IN PROGRESS; B72 fast preflight already PASS. Prior B70 run failed only after demonstrating genuine 180s FIXED source play, physical click, storage and SWEEP reload because its QA checker confused outer tab schema with nested per-match schema.

## Useful documentation

- Node.js v24.20.0 `ZstdOptions.dictionary` is documented under [the official Node.js zlib API](https://nodejs.org/download/release/v24.20.0/docs/api/zlib.html).
- This is an offline convenience for lawfully owned source; metadata export is privacy-filtered. No authenticated source placements, meshes, score, winner or original 4v4 is produced.
