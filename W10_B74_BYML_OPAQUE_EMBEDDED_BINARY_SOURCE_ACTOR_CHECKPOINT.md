# Browser Ink TPS — W10-B74 original Banc BYML embedded blob handling

2026-10-21 JST. Parent QA SHA `4c2b06f7af070094e4eb682723390e6e953e7437`. QA branch only; main, Draft PR #5 and production Pages unchanged.

## Actual implementation

BYML files can contain offset-backed 0xA1 binary payloads (since BYML v4) and 0xA2 embedded file payloads (since v5). These are documented Nintendo format primitives. Before B74, encountering a valid unrelated binary value caused the entire local metadata scanner to reject otherwise parseable Actor records. B74 adds bounded in-memory skipping (not decoding/exporting) of these two documented types. Original source sizes, BYML versions, bounds and embedded 0xA2 alignment are validated before skipping; blob size capped at 1MiB. The result is **null**, never a dummy ID or string: this is important because B60 actor identity counting must not mistakenly treat an opaque private binary value as an authenticated actor identity. Unrecognized, malformed or unusual types still fail closed.

Also corrects an embedded-NUL string check: string table entries now reject literal NUL, rather than checking the two-character backslash-zero sequence. Neither the string field name nor source-private value is emitted from B24/60 metadata. The original private one-click scanner continues using ordinary raw, vanilla Zstd and owner-provided adjacent dictionary capabilities from B71/B73.

## Exact-safe test design

Add synthetic little and big endian BYML with an otherwise structurally valid Temple01 class Actor and a separate opaque binary field of type 0xA1 or 0xA2. Validate four parsers (YB/BY × A1/A2), that recognized Actor count remains 1, opaque Actor Hash is null and not an ID, stage authenticity and Actor↔PntSet mesh binding remain HOLD. Negative cases: out-of-range blob offset, >1MiB blob, unsupported BYML version, corrupted embedded-file alignment, literal NUL in string table, plus B73 original Zstd dictionary regression and B24/B60 privacy checks.

## Honest limits

No actual owner private Nintendo source is in the repository or CI. All tests use synthetic fixtures, so a PASS proves only the bounded parser and metadata filtering behavior, not actual `Vss_Temple01` source file validity, real actor-to-mesh matching or gameplay topology. 25 certified original collision solids, 17 Paintable, 26 NavLinks, **zero** Scoreable and 0/12 opposing-team physical paths remain unchanged; 8 PntSet actor transforms unresolved, `activationReady=false`. No gameplay scene, bot, source level, public PR, main or Pages modifications.

BYML type documentation: https://zeldamods.org/wiki/Byml

## CI

Existing B24 private Banc metadata preflight (already watches these source files and runs B71/B73 Node tests) and B60 privacy negatives are the only automatically triggered workflows. Do not run another expensive Chromium session for a change confined to local metadata parsing. B72 actual separate 180s Chrome storage test must be independently checked and not inferred from this offline work.
