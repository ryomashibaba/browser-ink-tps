# Browser Ink TPS — W10-B31 Authentic Source Ink-Aware CPU Patrol

**Date:** 2026-10-19 JST
**Parent checkpoint QA:** `f5656118bdd4fba6e1a0ef075e400609050813ca` (W10-B30)
**Fully verified code HEAD:** `8f35019a2e89f56b5af66ab241d38485ad5cfd21`
**QA branch:** `dev/t21-f4e103w-qa-infra` ONLY; T19C/T20, public main, separate Draft PR #5 and production Pages unmodified.

## Scope: genuine CPU decisions, no fabricated new world

Previously seven real original-foot CPU actors used a fixed candidate patrol sequence even after a destination had been painted their own color. B31 improves their native source-local behaviour by letting real original-source GameplayInkSystem ownership grids influence the **priority** of **only previously certified original-side patrol targets**. The goal authority never adds, constructs, interpolates or guesses a new target.

- New pure `src/app/UndertowF3PaintAwarePatrol.ts` sorts PRE-EXISTING candidate indices by real read-only `GameplayInkSystem.sampleWorld` (Paintable required): `OTHER_TEAM > NEUTRAL > UNSAMPLED > OWN`. Stable deterministic existing round-robin index order breaks ties. Missing actual original ink sampling is labeled **UNSAMPLED**, never falsely inferred as neutral.
- Actual decision in `UndertowF3SourceTraffic.chooseSourceGoal`: the existing source-side Z/Y bounds, real source physics ray floor endpoint checks, actual CPU foot → Recast `auditPath`, and ultimately native Rapier KCC collision remain mandatory. Opposing CPU original crossing still fails closed; **0 path shortcuts**, **0 foot teleports**, **0 source mesh solids**, **0 original actor placements**, **0 source scoring**.
- The selector is active in ordinary nonproduction F3 `?t21Play=preview`, and available for isolated source Chrome testing with `&t21W10B31=inkGoals`. Older deterministic trusted-mouse QA remains unchanged unless opted in. No change to shared production CPU AI, projectiles, ink application, player movement or legitimate original Nav.
- Read-only metrics separate **actual ownership lookups**, **valid real ink sampling**, **non-owned target acceptance**, **already-owned acceptance**, **unknown-owner acceptance** and **real approved goal selection**. B31 does not invent a Turf score or claim a full 4v4.

## Real build and tests — final code

1. [W10-B15/B16 real Chromium seven CPU, real original ink and B31 strict source validation](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39211445145): **SUCCESS** at `8f35019a2e`. The actual WebGL2 source world and 7 original-foot CPUs:
   - Real paint-owner grid lookups **3,948**, valid actual original-surface ink ownership samples **3,948**, unknown samples **0**.
   - Real, Recast/Rapier-authorized, source patrol goal selections **658**: **321 original ink samples NOT owned by own team** (neutral/other), **337 already own color**, 0 unknown; count exact.
   - Original native CPU travel **650.63 meters**, **72 genuine source paint shots**, **73 real source paint impacts**, **10,097 genuine ink cells changed**.
   - Natural opposite-team traversable path **0/12**: `HOLD_NO_CROSS_TEAM_NATIVE_FOOT_PATH`. No false enemy encounter, no objective scoring, no production authority.
   - Previously validated original trusted real mouse player→CPU splat/respawn, source-only HUD and CPU rendering remain green.
2. **3/3 new pure B31 ranking tests PASS** in the same integration workflow, with no fabricated goals and correctly distinguished missing samples; 4/4 prior B17 HUD tests PASS. Full browser TypeScript build and syntax gate PASS.
3. [Standard B21-B28 source WebGL2, camera/human input and original render quality regression](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39211445162): **SUCCESS** at final code SHA.
4. [Original F3G/F3L exact pinned full-source browser review](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39211445124): **SUCCESS**, final code SHA. 57,578 static original optical triangles/19 textures remain visual-only and stage collision unchanged.
5. [B14 native Chrome CPU visible hit/splat/respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39211445148): **SUCCESS**, final code SHA.
6. Earlier Ubuntu+Windows QA at app-only code `64d2d446` [39211118853](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39211118853): SUCCESS. Later B31 code changes are traffic-only bookkeeping, unit/smoke tests and workflow; this does not constitute owner's Windows GPU/subjective test.

## Honest comparative limitation

Historical baseline fixed source patrol Chrome QA measured about **701m / 87 source shots / 11,054 changed ink cells** in one run. B31 strict paint-aware sample measured **650.63m / 72 shots / 10,097 changed ink cells**. These are not randomized controlled trials on the same workload nor owner subjective QA; **do not claim that B31 is faster, more fun or increases ink output**. The measured improvement is a real new adaptive ownerGrid-based decision, NOT proven better gameplay throughput. A subsequent matched, controlled same-tick baseline vs paint-aware comparison can determine whether selection reduces total painting, and if so adjust route scoring or revert without altering original source authority.

## Original Undertow remains incomplete

Frozen original stage **25 Rapier physics solids / 17 paintable non-scoreable original surfaces / 26 original source navigation links / 0 scoreable / `activationReady=false`**. Central/underpass original Banc/SetActor placement remains unknown, 0/12 natural cross-team native footpaths certified. No authentic source team encounters, full Turf winner, inferred Actor transforms, collider or center bridge. B24 local-only private Banc preflight is available only if evidence is provided/locally identified; public original game binaries never uploaded to this repo.

## Plan, efficiency and next W10-B32

The phase reuses the existing real Chrome 7CPU pipeline rather than spawning a second 7CPU CI, and changes only a small source-only ranking helper and the existing goal choice path. This is actual gameplay AI behavior rather than another decorative HUD/camera overlay. Chat/GitHub tools, no Work, minimal user intervention.

**W10-B32 priority:** source provenance intake if authentic original Banc material is available; otherwise run a **bounded comparable original-ink painting productivity A/B test** in the same real seven-CPU scene, using native footprint/painted cells and explicit throughput regressions, before further AI tuning. Improve real accessible-stage play; avoid any synthetic bridge, score, 4v4 winner or isolated 0/12 route audit repetition.
