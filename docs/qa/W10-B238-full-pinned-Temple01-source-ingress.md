# B238 — independently pinned full Temple01 OBJ source ingress scan

Base `c5884cf5423defee2a16d92b4ca554599e3a39ad` (2026-10-26 JST). B237 native 104-mesh read-only source review yielded 0 candidates on either mirrored side within 0.35m of BOTH original registered right-low boundary (project Y4.5) and genuine CI688 source FloorSlope01 upper edge (project Y2.93). The review catalog was partial and not a whole source result.

**B238 essential improvement:** obtain full Git LFS original KiTrix `stages/Vss_Temple01/Vss_Temple01.obj` from the public repository, verify the entire exact 43,263,289-byte SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046` *before parsing*, require exact 375,948 original vertices and 70,396 common+Turf active triangles; do not settle for a Git LFS pointer or a different version. The original is never committed or included in Actions artifacts.

An original-stage-seed Vitest imports the actual 25/17/26/0 stage, B236 verified original right-low polygon contours on BOTH mirrored sides and exact CI688 Slope01 two-point upper edge. It exports a small numeric input JSON. Python scans all 70,396 source triangles, using the existing original model→project registration; builds *full original OBJ-ID connected components by source object/material* (not by approximate welded coordinates), then narrows face distances via a conservative 8m bounding region. It computes real 3D finite source-boundary-segment→original-triangle distances, ranks entire original OBJ-ID components whose original triangles approach both endpoints and records unmodified original face IDs/OBJ vertex IDs/materials/source objects. A geometric touch does **not** prove valid terrain normals, installed static game geometry, actor placement, Rapier support, NavMesh, a continuous player path, or 4v4.

If LFS cannot be downloaded the strict SHA-checked CI must fail, explicitly demonstrating B238 full-OBJ evidence unavailable; it must not emit a counterfeit 70,396-face result. B237 and B236 remain valid independent results; official stage and gameplay are unchanged. After true original full-source results, select genuine candidate and test in isolated real physics rather than creating synthetic bridge.

The source file is a third-party repository asset and is only temporarily fetched within GitHub CI; artifact intentionally includes *numeric report and source identities only*. Frozen authority: original solids25/paint surfaces17/nav links26/scoreable0, real opposing routes0/12, productionAuthorized false, official winner NONE.

## B238 ACTUAL SHA-PINNED 43 MB FULL OBJ NATIVE CI — VERIFIED 2026-10-26 JST

The full scan did genuinely run against the downloaded complete original `kirakira-dev/KiTrix` Git LFS source, **not** an LFS pointer or partial source. The downloaded file passed independent `sha256sum --check` for `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`, exact size **43,263,289 bytes**, and parser count **375,948 original OBJ vertices / 70,396 active common+Turf source triangles**. Scan geometry was not uploaded or copied into the game repository; only source ID metadata and numerical point/face evidence in a small GitHub Actions artifact.

Baseline native source survey [#40322041594](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40322041594) **SUCCESS**, including 3 Vitest tests, original 104-source B237 regression, exact original seam seed production, geometric self-test, source SHA/length verification and full 70,396-face scan. This exposed **three source-contact candidates on each 180° mirrored side** missed by B237's incomplete extracted 104-component subset. It did **not** authorize a route.

The second strict scan [#40322547939](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40322547939) **SUCCESS**, changing connectivity grouping to an **original shared OBJ-VERTEX-ID EDGE**, *not* shared single vertices or approximate XYZ welds, to avoid false connections from one touching corner; the same three pairs survived. This logged the precise source-face area, normals and object IDs.

The third final strict repeat [#40323037306](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40323037306) **SUCCESS**, including application build, 3/3 Vitest regression cases, original triangle geometry self-test, 43MB hash-checked full-source scan, and an **explicit extra strict fail-closed candidate classifier** that also checks exact original OBJ IDs, real matched 2-triangle geometry and production denial. The report artifact contains pinned numerical evidence ONLY; original OBJ is not uploaded or retained.

| Full pinned original-source result | POSITIVE_Z | NEGATIVE_Z |
|---|---:|---:|
| Original active source triangles scanned | 70,396 | 70,396 (same whole source) |
| Local prefilter triangle hits | 9,004 | 9,004 |
| Original edge-ID components with some evidence near both boundaries | 470 | 470 |
| Genuine original edge-connected components within 0.35m of BOTH boundary faces | **3** | **3** |
| Among them floor-facing triangle components | **1** | **1** |
| Near-vertical/nonwalkable contact components | **2** | **2** |
| Certified real CPU traversal of the new seam | **0** | **0** |

The sole floor-facing **candidate**, `Fld_Temple01_group21600_1__FloorLine00`, contains exactly two genuine original triangles joined by an original OBJ-ID edge. Project Y extents **3.05–4.55m** and real original triangle area **1.525233995m²**. Its nearest 3D source distance to the real registered original right-low boundary is **0.017329m**; to the exact CI688 source Slope01 top edge, **0.333474m**. These are geometrical closest-approach distances only, NOT native registered Rapier foot support at both ends. Exact original IDs:

- **Positive side**: active original face indices **37118, 37119**; original OBJ vertex IDs `[320413,320414,320415]`, `[320414,320416,320415]`.
- **Negative side**: active original face indices **37112, 37113**; original OBJ vertex IDs `[320401,320402,320403]`, `[320402,320404,320403]`.

Other geometric dual-contact candidates are not valid walking surfaces by triangle normal: `FloorLine00` 2-face narrow vertical (area 0.233351m²) and `FloorLine05` 1-face vertical (area 3.500271m²). They may be decorative or boundary geometry; never register them as artificial traversal authority.

**Critical quality judgment:** The original-source 4.22m apparent air gap in prior 104-piece catalog was an **incomplete-extraction artifact**, not an absolute absence of original intermediate triangles. The *actual complete original OBJ* contains previously unlisted thin `FloorLine00` candidate faces almost joining the two regions. Whether the true player/CPU capsule can stand on and traverse them remains **UNTESTED**: walkable slope angle, usable contact width, original object active placement, Rapier collision body, Recast poly radius and connection, and actual in-scene CPU identity all require testing. Even a 0.333m face-to-face gap cannot be silently bridged with a fabricated polygon or invented NavLink.

### B239 next: prioritized genuine physical isolated QA, not more catalog speculation

Use only the two exact source faces per mirrored side, retrieved from the SHA-pin-checked numeric B238 artifact, preserving true original triangle vertices/materials/winding. In a **separate opt-in QA scene only**, register them as original-sourced Rapier candidate collision and separately test Recast navigation. Challenge a real KCC capsule at the existing original right-low registered floor boundary toward `FloorLine00` and source Slope01, with no scripted position after initial spawn, no fake closure or nav jump, and record continuous original solid-foot ID, step/drop, possible failures and lateral width/angle. Compare with an unchanged frozen 25 and existing original-source 30 QA baseline, then only consider actual `CpuAgentSystem` integration if ground support and path reachability are confirmed. No single face-contact-distance metric confers a true gameplay route.

Frozen official unchanged: 25 solids, 17 paint surfaces, 26 original links, 0 scoreable; opponent crossings **0/12**, `unrestricted4v4Certified:false`, `productionAuthorized:false`, official winner `NONE`.
