# W10-B241 — authentic original FloorLine00 width and native KCC lateral tolerance

**2026-10-26 JST — B241 implementation/measurement complete; physical QA successes, strict continuous-source support HOLD.** Baseline B240 `b6bcf1b2b63ba511f246f7c42e0a2307a30930c2`. Actual final strict B241 [GitHub Actions #40333114860](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40333114860) **SUCCESS** on `15caaf30875feb8db65f9810c2fbb92cab44e606`.

## Provenance and isolation

The CI re-downloads the complete exact 43,263,289-byte `kirakira-dev/KiTrix/stages/Vss_Temple01/Vss_Temple01.obj`; checks SHA-256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`; parses 375,948 vertices / 70,396 active source triangles and validates B238 original shared-OBJ-ID edge provenance. It reconstructs exact only-two-triangle-per-side `Fld_Temple01_group21600_1__FloorLine00` component, positive face IDs 37118/37119 and negative 37112/37113, without moving a source vertex, changing winding, widening a surface, creating a synthetic floor or copying the copyrighted OBJ into game Git. Original source material identity remains `Fld_Temple01_FloorLine00` (hidden QA collision solid uses generic stage material). **Original game's collision-flag / physical collision inclusion for this potentially decorative FloorLine00 source object is NOT independently authenticated**; explicit collider inclusion is opt-in research QA only, not evidence the official game collides against it.

The QA stage remains 25 frozen source solids + five unchanged CI688 source corridor meshes + one 2-triangle source FloorLine00 mesh **per side**. Total **31** isolated QA StageSolid objects, not 31 authorized game solids. Production physics, original 25/17/26/0, CPU runtime, Recast parameters, navigation links, scoring, rendering, F3 and winner authority untouched. A genuine Rapier KCC human-sized capsule of **0.32m radius** (more conservative than the CPU navigation agent radius **0.30m**), original CPU speed/acceleration limits, gravity, and one continuous native KCC body moves under explicit source-derived QA waypoint steering; no teleport after initial recorded right-low supported spawn, no invented jump, no offmesh link.

## Actual original-source geometry: cross-sectional WIDTH

Five horizontal constant-Y slices of **the true two original source triangles** on *each* mirror returned **0.3111352183m XZ source width** throughout 10%, 25%, 50%, 75%, 90% along the slope. The 0.311m ribbon is approximately half the 0.60m CPU navigation diameter and less than the 0.64m real human physics capsule diameter.

This value is the **width of FloorLine00 source geometry in isolation**, not the full navigable physical clearance formed by surrounding registered original surfaces, not a complete capsule sweep result and not proof of impassability. At four of five sections the center vertical ray independently found the QA FloorLine00 source collider; at the 90% section it did not, showing that simple triangle width cannot replace actual support/neighbor contact data.

## Actual Rapier KCC: two-sided lateral waypoint perturbation

Measured native 60Hz physical KCC tests on **both 180° original mirrors**, using exactly one body per trial; original positions/winding/capsule kept unchanged. Values below describe *induced lateral waypoint deviation*, not source shape widening or guaranteed continuous per-frame support.

| Lateral waypoint offset | Positive Z KCC grounding | Negative Z KCC grounding |
|---|---|---|
| 0 | walked, no airborne frames | walked, no airborne frames |
| −0.10m / +0.10m | both walked, no airborne frames | both walked, no airborne frames |
| −0.20m / +0.20m | both walked, no airborne frames | both walked, no airborne frames |
| −0.35m / +0.35m | both walked, no airborne frames | both walked, no airborne frames |
| −0.50m | walked, no airborne frames | walked, no airborne frames |
| **+0.50m** | **UNSAFE: 6 consecutive airborne frames** | **UNSAFE: 7 consecutive airborne frames** |

Even on the +0.50m run, the target slope may be reached physically after the airborne segment; this **MUST NOT** be classified as continuously grounded and secure. A pass for zero/near-zero lateral control is a genuine KCC physical experiment, not a moving `CpuAgentSystem` or Recast CPU route.

## New B241 strict integrity blocker: KCC computedGrounded is not exact ground-source foot proof

A second stricter witness records the original registered solid ID by a **vertical ray at actual KCC foot center each tick**, and separately keeps the Rapier KCC `computedGrounded()` flag.

- **0m baseline POSITIVE_Z:** KCC stayed grounded during the guided passage; Rapier foot-center vertical source query returned `null` on **7 frames**, at ticks **196,197,198,199,200,202,203**, just before reaching original CI688 Slope01.
- **0m baseline NEGATIVE_Z:** same guided KCC grounding; foot-center source query returned `null` on **8 frames**, ticks **194–201**.
- Therefore `strictOriginalSourceFootRayContinuity:false` for **both** baseline mirrored trials. These null queries do **not** prove that the whole capsule was floating: a 0.32m-radius body can contact sloping surfaces away from the center foot ray. The exact valid contact patch and original collision identity during these specific frames remain unknown.
- Under large lateral offsets, many more original-center-ray nulls are measured. The code stores precise original 3D foot positions, native tick indices, source collider identities when present, and zero offmesh/teleport authorizations. The correction after CI #40332613871 removed an earlier log-scoping error which included normal solid IDs in unexpected detail; the final strict CI correctly records **only actual null/invalid support** samples.

**Conclusion:** the width measurement and guided KCC walk prove **a limited physical test can traverse opt-in original triangle colliders**, but **do not** provide the required continuous original-source capsule contact/clearance proof needed for safe CPU behavior. This is more cautious than the B239 local physical result and does not revoke its genuine KCC observations.

B241 tests have stringent regressions for the authentic 0.311m source width, immutable 25/17/26/0 stage, two-sided zero-deviation walking, actual failure of +0.50m lateral excursion, original source hash and zero teleports. Existence or absence of strict continuous foot ray proof is recorded explicitly, not forged.

### Test implementation and verified Actions

- `scripts/T21B241OriginalFloorlineCapsuleLateralQa.test.ts`
- `scripts/t21-b240-pinned-original-floorline-qa.ts` (extended exact right-low boundary witness type)
- `.github/workflows/t21-b241-original-capsule-lateral.yml`
- B239 source extraction + physical baseline are re-executed within the same workflow; final numeric artifact `b241-original-physical-width-lateral-numeric-qa` contains genuine JSON only, never the 43MB original OBJ.
- Full real production app TypeScript build PASS, original SHA gate PASS, exact source extraction PASS, genuine B239 KCC PASS, B241 18 native lateral KCC trials and ten source horizontal Y cross sections PASS in strict [#40333114860](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40333114860).

### B242 next: physical contact provenance, not easy NavMesh hacks

Priority 1: At the 7/8 ambiguous baseline frames (near source slope entrance), query native KCC computed-collision normals, collider handles/IDs, capsule bottom/side contact points and multi-ray footprint on the **unchanged** 31-solid isolate. Establish exactly which original registered / exact source mesh provides support and whether the required actual body disk genuinely fits. Do not conclude the center ray's absence is automatically a fall or automatically safe.

Priority 2: Authenticate whether the original `Fld_Temple01_group21600_1__FloorLine00` is actually intended as physical collision in the source game or a visually decorative line. The exact original vertex metadata by itself establishes geometric originality, **not original collision authority**. If collision provenance cannot be established, keep all source collider ingress QA explicitly hypothetical and do not promote.

Priority 3: Only after physical support + source collision identity + original continuation are verified, test narrow fail-closed local movement handoff on the genuine same CPU body and actual `CpuAgentSystem`, then real Chromium F3. Do not reduce runtime agent radius, add made-up geometry/links or certify route from nearest-poly projection. Maintain no manual ZIP / no user setup.

**Frozen official state: 25 solids / 17 paint / 26 navigation links / 0 scoreable, opponent CPU original routes 0/12, `unrestricted4v4Certified:false`, `productionAuthorized:false`, winner `NONE`.**
