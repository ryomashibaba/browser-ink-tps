# W10-B71 — Owner-local raw BYML Banc metadata support, original 4v4 critical-path aid

2026-10-21 JST. QA branch dev/t21-f4e103w-qa-infra only. Frozen main, Draft PR #5 and published Pages unchanged.

## Why
The eight unbound original Temple01 PntSet source components, original active layers, real SetActor instances/transforms, and original central physical continuity block authentic 4v4. B24/B60 one-step PRIVATE local actor metadata report previously accepted only externally converted JSON and reported raw BYML as requiring manual decoding. B71 reduces that owner prep burden **without uploading or authorizing Nintendo content**.

## Code
- Adds scripts/t21-w10b71-private-byml-metadata.mjs with tiny bounded, read-only, in-memory Nintendo-style BYML parser (BY and YB endian, version 2–7 headers, C2 strings, C0 array, C1 named dictionary, primitive and 64-bit values), strict byte ranges, recursive depth 32 / source element 100000 / decoded size 16 MiB limits, safe UTF-8 and cyclic-node detection.
- Tries standard Zstandard *.byml.zs via Node 24 native zstd with 16 MiB output cap, with no external dictionary or tool installation. If the frame is dictionary-compressed or structurally unsupported, **fails closed** and returns an explicit HOLD. V7 hash-container 0x20/0x21 and unknown nodes are intentionally not guessed. No raw BYML/actor/object JSON is ever persisted or uploaded.
- The existing Windows one-step RUN_T21_W10B24_PRIVATE_BANC_PREFLIGHT_ONCE.cmd remains the only launcher. The established B24 scanner now can ingest raw or standard-zstd-compressed binary exports whose Temple01-labelled name passes the existing local-only gate, and records only aggregate actor/class/transform-validity/identity/layer-hint counts, plus coarse binary format version/endianness. Private numeric transforms and exact layer strings/GUIDs never leave RAM.
- A decoded BYML file's `stageRowId` field remains self-claimed if present, or unverified if missing. Neither a filename, legal provenance, structural decode, Zstd decoding success nor an actor class establishes active original actor-to-mesh transforms. Original 25 solids/17 Paintable/26 native NavLinks/0 Scoreable, 0/12 cross-team real paths, 8 unbound PntSet source components, original Turf score 0, activationReady=false: **all HOLD**. No game physics, Recast, CPU, score, spawn or standard preview changes.

## Tests
- New synthetic-only BYML fixtures big and little endian, one internal Temple01 PntSet actor, multiple matrices, Zstd reversible decode, malformed lengths, invalid version, v7 hashed dictionary unsupported, source-coordinate/layer leak prevention and real B24 integration in a temporary folder.
- Extends existing B24 isolated Node24 GitHub workflow, not broad, expensive Chromium 180s workflows. The synthetic BYML fixtures are not authentic original data and can only establish parser correctness and output privacy.
- Real private original Banc and dictionary contents were **not** supplied and must NOT be generated, downloaded, inferred or pushed automatically. A real decoded candidate remains HOLD until independent provenance, exact Actor identity/active layer, world-coordinate transforms and original Rapier/Recast direct human/CPU crossing are privately corroborated.

## Current QA
New exact-SHA workflow pending. Earlier B70 owner-local 180s actual Chrome test was running on SHA 2ead60fc881cb41a737a7179fe30245b191cc5f6 when work began; its own result must be checked independently and never claimed PASS before completion.

References: BYML structure https://zeldamods.org/wiki/BYML ; Node24 zstd https://nodejs.org/download/release/v24.20.0/docs/api/zlib.html
