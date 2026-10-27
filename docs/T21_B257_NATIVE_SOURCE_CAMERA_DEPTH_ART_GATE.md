# Browser Ink TPS — B257 genuine original-source camera / optical / Rapier depth audit

**2026-10-27 JST — technical PASS, ART HOLD.** Research-only, no production promotion.
Implementation: `8c6d2269791900ed7d71d2f008fc938dc6302660` on `dev/t21-f4e103w-qa-infra`.

## Evidence provenance and CI

- Real pinned original Temple01 F3L OBJ/UV textures are downloaded and SHA-verified **inside CI**, not committed, re-created, repositioned or approved for gameplay collision. The original static UV consists of **57,578 triangles** and **19 verified textures**.
- [Genuine Chromium PlayCanvas WebGL2 full-source CI SUCCESS, run 40519673148](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40519673148). Artifact `t21-f3g-full-original-source-proof` **ID 12741786799**. Unit tests, source authority, typecheck/build and native WebGL2 route passed.
- Browser artifact includes `B257_NATIVE_FROZEN_SOURCE_DEPTH_REFERENCE.png`, `b257-native-source-optical-rapier-depth.json`, `B257_REAL_NATIVE_INK_UNALTERED_OPTICAL_DEPTH.png`, `b257-original-camera-real-ink.json`.
- No image generation, synthetic map, forged camera move, synthetic actor relocation, physical geometry edit, official match result or guessed NavLinks.
- Exclusive URL `?t21Play=preview&t21FullSource=review&t21B253=liveInk&t21B255=actorStudy&t21B257=depthAudit` (CI also enables the B256 opt-in but **the opacity aperture is OFF during B257 audit and B257 real gameplay**). QA must be paused, native STAGING, 7 original CPUs and 25/17/26/0. Runtime rejects unauthorized use.
- Nine genuine camera pixel rays each scan exactly 57,578 authenticated optical triangles with double-sided triangle intersection and separately query only the actual Rapier original stage 25 solids. **The two data sources are not interchangeable.** No mesh ray result counts as certified physics.

## Actual frozen native camera and actor projection (1600 × 900)

Native camera world XYZ: **(0.73693, 10.27571, 74.15285)**, yaw **0°**, pitch **−12°**.
Human real actor: **(0.01693, 8.39507, 67.89270)**. A2: (0.83693, 8.28, 67.07270). A3: (−0.80307, 8.28, 67.07270). A1: (1.13264, 8.30479, 59.74395). B1–B3 are approximately Z **−67.11718**, B4 approximately Z **−59.01292**.

Actor center-to-head world y +1.4m projection (a descriptive apparent-size metric, **not exact bounding pixel area**):
- Human **158.21 px**, screen center (747.30, 509.99);
- A2 **140.86 px**, screen center (838.36, 498.41);
- A3 **139.74 px**, screen center (675.30, 496.64);
- A1 **72.00 px**, screen center (849.27, 396.24);
- B1/B2/B3/B4 **7.58 / 7.58 / 7.58 / 8.04 px**, near x 822–837 and y ~305.

**Critical geometric observation:** the real human, A2 and A3 are closely grouped around the player camera's ~6m follow distance. Their large projection consumes prime center/lower foreground space. Remote enemies are ~18–21 times smaller in this descriptive center-to-head metric. This does not prove that moving actors or cheating their coordinates is warranted; it identifies the composition to redesign.

## Optical source triangles versus original Rapier camera rays

Each probe is the same real camera frustum ray, using identical near and 60m world endpoints; original-source optical meshes are read-only and their intersections **have no Rapier authority**.

| Source camera probe | First optical kind / original material | First optical distance | First certified Rapier distance | Physical solid |
| --- | --- | ---: | ---: | --- |
| CENTER | GLASS / `Fld_Temple01_Glass01` | 3.760m | 13.281m | `UndertowT21D:spawn-high-positive-z` |
| UPPER_AIM | GLASS | 3.676m | no hit | none |
| LOWER_AIM | DETAIL / `Fld_Temple01_FloorLine02` | 3.914m | 6.809m | `UndertowT21D:spawn-high-positive-z` |
| LEFT_GROUND | DETAIL | 4.985m | 6.509m | same |
| CENTER_GROUND | DETAIL | 4.539m | 4.962m | same |
| RIGHT_GROUND | DETAIL | 4.750m | 6.509m | same |
| LEFT_MIDDLE | GLASS | 4.463m | 13.690m | same |
| RIGHT_MIDDLE | GLASS | 4.256m | 13.690m | same |
| LOWER_CENTER | DETAIL | 5.019m | 4.162m | same |

In **8/9 rays** an optical material is geometrically intersected ahead of the first actual physical obstacle; this is **not proof** that GLASS visually obscures, since material opacity in INK_SAFE_REVIEW is deliberately low (GLASS ~0.09); DETAIL ~0.72 can be significant. Optical glass, floor lines and physical solid must remain separate in policy and interpretation.

## True gameplay, not a synthetic still

Native Chromium real keyboard movement: **2.119751m**, **10 true player shots**, **115 genuinely changed human ink cells**, **B256 aperture OFF**. Genuine player A + 7 CPU original source practice with zero certified scoreable areas and no unrestricted real 4v4. Source authority remains **25 stage Rapier solids / 17 registered paintables / 26 original Recast links / 0 scoreables**; **0/12 true opposite-team crossings**.

## Art verdict: HOLD

Native screenshot still shows visually oversized human+A2+A3 humanoid silhouettes clustered in the center/lower field, a broad grey foreground stage wall/plane, intense semitransparent original architecture and a difficult-to-find real 115-cell paint footprint. The original optical/physics disparity and unusually imbalanced near/far actor projection now have genuine numerical evidence. **No evidence of an ART PASS**. Nine rays are point samples; they are not the whole-screen visible-pixel mask, and projection center-to-head measurement is not a pixel area estimate.

B256's aperture approach was technically demonstrable but art-inadequate. B257 deliberately **changes no camera composition yet**, to prevent guessing. Preserve original actor placements, certified Rapier collision, KCC, shooting target/paint origin and original imagery.

## B258 priority and acceptance

1. In QA-only research, evaluate **native camera geometry** candidates (view height, shoulder, distance and pitch) against actual Rapier camera cast clearance; no camera-through-solid, no source mesh retroactive collider and no actor teleport. Keep any candidate distinct from production/default camera and reversible.
2. On the same real source tick compare camera positions, actual 8 actor projections, original source mesh intersections, certified physical hits, and genuine WebGL2 **gameplay-facing** frames. A different camera must not silently falsify native aim and real input.
3. Visually evaluate whether human and two nearby ally silhouettes stop dominating the center while original floor and **real ink** are readable. Avoid whole-screen opacity tuning and color filters. If not improved, continue **ART HOLD**.
4. Isolate A1 co-op flakiness/failure from visual work. Prior B255 A1 failed with no A1 paint; B256 A1 failed with B140_WAIT_TIMEOUT after genuine native pause/resume. Never manufacture A1 crossing or delete safety gates. Do not infer an independent source-path failure was caused by this renderer-only audit.

**Stable main, Pages, Draft PR #5, releases untouched. No original raw OBJ/MTL/PNG/Banc committed.**
