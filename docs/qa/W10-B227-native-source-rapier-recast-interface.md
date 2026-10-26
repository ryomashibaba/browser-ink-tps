# W10-B227 — correct next step: physical source floor versus actual Recast navigation

Baseline 2026-10-26 JST, previous source HEAD `99ae90900cc3f8ecbdd331c1226aee0d8fd0c127`.

**Previous success:** B224 real keyboard (four mirrored jump landings), B225 consecutive source floor chain with 0 airborne second-leg ticks, and B226 mirrored inner-slope with 0 airborne third-leg ticks all passed real Chromium on **isolated original-source** faces. The actual playable runtime still has **25 solids, 17 paint surfaces, 26 nav links, zero scoreable surfaces**; all five extra CI688 source components per side remain forensic QA-only.

**What we must NOT repeat:** CI #691 inserted all 5+5 source solids and still failed Recast endpoint (31.716227m). Pass 18BH–18CA already investigated Recast grid phase/erosion/proxy and false nearest-poly identities; blanket Recast tuning, source-ground fabrication, or radius-inflated synthetic off-mesh links are not a valid next move.

**New B227 question:** At the *exact positions visited successfully by the genuine human KCC in B226*, compare:
1. Original 25-solid Rapier collider source support;
2. 30-solid isolated native Rapier + five exact CI688 faces per side;
3. Original 25-solid Recast native closest projection / true direct query; and
4. 30-solid isolated native Recast with only the same-side five exact original source faces navigation-enabled.

For each side we inspect original FloorConcrete01 → outer Slope00 → FloorConcrete02 → inner Slope00, plus a candidate nearby original underpass connector point. NavMesh paths are evaluated only if both original endpoints directly snap within 0.30m, and a native path is explicitly **not** physical KCC certification. The original frozen navigation settings and all 26 links are unchanged; the 30-solid experiment exists in Vitest memory only.

**Pass/fail interpretation:** A successful test proves only factual matched instrumentation and unaltered authority. Record any failed Recast build, failed direct projection, distant snap or wrong original physical support as a BLOCKER, not as a fabricated positive. Only after this actual native witness will we select a minimal next integration check for B228. No production/CPU changes or new user steps.

## Actual B227 native CI result: #40296331486 (SUCCESS)

One true Node/Vitest execution used **unchanged production Recast settings** and Rapier physical collider queries at the precise model/project-space points already traversed by real keyboard-driven B226 QA. 25-original and 30-original-plus-five exact source meshes were compared on positive and negative mirrored sides.

### Physical collision ground truth

| Side | Original 25: registered support at FloorConcrete01, outer Slope00, FloorConcrete02, inner Slope00 | QA 30: exact-source physical support at those four points | Existing 25 original glass-underpass candidate foot support |
|---|---|---|---|
| POSITIVE_Z | 0/4 | 4/4 | Registered `UndertowT21D:glass-underpass-positive-z` |
| NEGATIVE_Z | 0/4 | 4/4 | Registered `UndertowT21D:glass-underpass-negative-z` |

Both mirrored source mirrors reproduce accurate original CI688 triangle contact, height errors below 0.000001 m for those 4 exact support samples. Crucially this is a **ray foot-support** measurement at the B226 physical waypoints, not a second full human KCC run.

### Recast at same point, with the actual 26 existing original links

At the four source points, **all four original 25-solid baseline direct Recast projections fail** on both sides. Only the already registered glass-underpass candidate succeeds with ~0.10m snap. This proves a concrete absence of both original physical terrain and original NavMesh support at the B226 human route points.

With **five source faces enabled only in isolated QA navigation** (30-solid total), native Recast builds successfully on both sides, but still does *not* reach across the first three physical route transitions:

| CI688 original transition | Positive QA nav native endpoint error | Negative QA nav native endpoint error | Original human KCC |
|---|---:|---:|---|
| FloorConcrete01 → outer Slope00 | 2.989741m | 2.979618m | Real jump needed and succeeded |
| outer Slope00 → FloorConcrete02 | 1.500241m | 1.436857m | Grounded 0 airborne |
| FloorConcrete02 → inner Slope00 | 1.299435m | 1.358008m | Grounded 0 airborne |
| inner Slope00 → registered underpass | **0m, path reached** | **0m, path reached** | **Not yet physically tested** |

Important qualifier: Positive FloorConcrete02 source projection is **0.341400m**, above the strict 0.30m direct-valid threshold; Negative FloorConcrete02 is 0.290587m. Even for other three locally valid end projections, the native path terminates short, so merely loosening one snap or auto-injecting extra polygons is not an acceptable solution. Baseline FloorConcrete01→underpass after adding source still has terminal error **16.983789m** positive / **17.887540m** negative.

### Engineering decision and efficient next plan

B227 identifies **two independent, concrete boundaries** without another Pass18BH–CA grid sweep:

1. **Original physical registration:** The actual 25-solid game does not expose the original 4-part source chain. Those exact source faces are only in a 30-solid isolated QA test, so no runtime entrance/exit or production gameplay can be claimed.
2. **Native CPU navigation:** When the same original faces are available to nav generation, Recast still fails all three internal source-path transitions (despite fully grounded B225/B226 human KCC crossings for two of them). The **final inner-slope → glass-underpass Recast route does exist**, but has not yet passed a continuous true player KCC trial.

B228 priority should be an **actual user-input/KCC uninterrupted transition from the inner source slope into the existing registered underpass floor, with no teleports and exact source-to-runtime collider support**, then investigate a *local* navigation representation of two confirmed-grounded crossings, without inventing geometry. The first 2.074235m source gap is a jump and must not be mislabeled a walkable link. CPU jump/crossing permissions, 12 opponent routes, official scoring and winner remain HOLD.

Freeze conditions: original real stage 25/17/26/0; source meshes 5+5 **not** promoted; no changes to `main`, Pages, PR #5, T19C/T20, nav tuning or fixed 26 links. The new regression test prevents falsely inferring a continuous CPU route from physical jump/grounded success.
