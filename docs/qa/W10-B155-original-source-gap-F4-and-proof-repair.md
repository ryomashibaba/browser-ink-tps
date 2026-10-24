# W10-B155 — Macro F4 original-source route-gap visibility + QA repair

Date 2026-10-24 JST. QA branch only `dev/t21-f4e103w-qa-infra`.

## Why this batch is different
B152 authenticated real A1 original-source ally ink (6 genuine shots, 6 registered source impacts, 175 changed ink cells). B154 combined source-only real seven-CPU ink had **15,141** changed original paint cells in TEAM_COVERAGE, against **10,241 FIXED** and **10,187 ALLY_RALLY** in separate real-Chromium source runs (Actions #40075155293). All 7 CPUs painted; real 60Hz human A1 collisions 0. These are *paint changes*, not scoreable Turf percentages or a controlled full-stage victory experiment.

That B154 Action was overall FAILURE **despite three genuine browser jobs SUCCESS**: B153's negative-case audit test asserted the wrong earlier error precedence. The mistake was QA code/test semantics, not a new source-stage gameplay collision. The fast-route source gap remained untouched in B154.

## B155 completed source and QA changes
1. Fix the B153 **fail-closed error ordering**: a fabricated fixed-mode B152 ally-provenance value is rejected immediately as `FIXED_DEFAULT_PROVENANCE_CONTAMINATION`, not a less specific numeric violation. The actual unchanged FIXED data have all six provenance counters 0 and remain valid. Separate unit test now provides an internally consistent fake shot→surface→ink sequence to exercise the `TAGGED_PROVENANCE_EXCEEDS` guard rather than stopping on an earlier inconsistency.
2. New `W10B155OriginalSourceConnectivityReview`: at genuine F3 preview boot, assess the **existing original eight authored probe pairs** from `UndertowSpillwayConnectivityQa.ts`. The six previously registered MUST_REACH start/end Recast queries and two explicitly held `right-low-to-underpass` ±Z gaps are passed through actual `RecastStageNavigation.auditPath` on the original 26-link NavMesh. Each original endpoint span gets five bounded vertical **real registered Rapier static stage casts** (40 samples total) with original collider IDs and distance-to-expected-ray-height; absent/mismatched support is logged without reconstructing missing triangles, creating NavLinks or pretending a physical player capsule passed. All new gap statuses are `UNVERIFIED_SOURCE_GAP` even when Recast reports an endpoint reached or a source ray hits. No path is treated as authorized for CPU traversal.
3. Add on-screen F3 source preview route warning and read-only `b155OriginalSourceConnectivityReview` to existing game snapshot and B139 Chromium JSON evidence; the next real source QA will produce exact per-probe start/end, source solid witnesses, endpoint snap distances, Recast result, and suspected missing source ray samples. The display expressly says **not actual KCC route certification**. Never writes game state, shot target, collision or movement.
4. Extend existing B75 preflight with the B153 and B154 independent negative proof unit tests **before running expensive Chromium**, and a new three-case B155 source-lock/unit read model test. Keep the existing B139 source browser; no new browser runner or expensive CI lane.

## Interpret correctly
- `MUST_REACH` means six specific authored original NavMesh *queries*, **not six human-validated traversal routes**. Recast success is not Rapier support. A static ray is not a capsule or human movement test.
- `DIAGNOSTIC_GAP` remains HELD for both original right-low→underpass entries, regardless of endpoint results or nearby original solid ID.
- The source **70,396 active original Temple01 faces** remain private, unuploaded. Phase12U full-source boundary inventory and Phase12V near-contact evidence previously studied 88 unresolved original component boundary edges. Their source contact evidence is *not* a runtime walkable-floor or player-route license. B155 does not make it one.
- The source package remains exactly **25 Rapier solids, 17 paint surfaces, 26 source navigation links, 0 Scoreable**. Natural enemy-opponent routes 0/12; `activationReady=false`, `unrestricted4v4Certified=false`, `productionAuthorized=false`, full original 4v4 HOLD. T20 stable/main/Pages/PR #5 untouched.

## Next actual F4 batch (only from evidence)
1. Read B155 exact-SHA genuine Chrome evidence: the two underpass gap probes’ Recast endpoint success, start/end snaps, original ray witnesses, and possible collider IDs. Compare ±Z. **Classify** whether the current block is missing source registration, NavMesh connectivity, vertical geometry ambiguity, or neither; do not declare a floor hole from a sparse ray miss.
2. Trace candidate original OBJ Face/part provenance using existing archived source audits or explicit trusted private source access, not generic assumptions about the game’s map.
3. Only if original witness and real Rapier/KCC are independently consistent should a bounded, source-derived new link/collider/scoreable decision be separately proposed for authorization. If evidence unavailable, leave F4 HOLD and progress playable F3 motion/interaction elsewhere on verified registered source.
4. Reduce QA reruns: batch code/test checks, isolate small audit regressions before the three full 7-CPU browser comparisons, and favor gameplay block resolution to additional B-number micro-checks.

CI note: B155 code/compile/browser results require checks on **exact new commit SHA**. This file documents intended semantics, not a claim of a real Chrome PASS that has not happened yet.
