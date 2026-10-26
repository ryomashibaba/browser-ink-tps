# B239 — pinned original FloorLine00 actual Rapier KCC traverses; native Recast still fails

2026-10-26 JST. Branch `dev/t21-f4e103w-qa-infra`. Parent baseline B238 head `d07e49485dd0c31600b4625b896e553438d30a73`.

**Actual first native source/physics run: [#40328240414](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40328240414) SUCCESS** (production build, SHA256-checked 43MB KiTrix original, exact source extraction, genuine physics, native Recast both mirrors, B236 regression, 3/3 Vitest including seeded source). B239 fail-closed real KCC walk and invalid Recast target-snap regression was strengthened in a following commit; see the latest B239 Actions run for this strict regression.

## What exactly was reconstructed

B238 source parser was actually re-executed against freshly downloaded `kirakira-dev/KiTrix/stages/Vss_Temple01/Vss_Temple01.obj`. Exact 43,263,289 byte source SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`; 375,948 original vertices / 70,396 active triangles. A strict new extractor finds **only** exact source `Fld_Temple01_group21600_1__FloorLine00`, same original OBJ shared-edge component, preserved face winding, source vertex positions, source material provenance `Fld_Temple01_FloorLine00`; it exports no source OBJ or new polygons.

- Positive: original active faces **37118/37119**, original OBJ vertices `[320413,320414,320415]` and `[320414,320416,320415]`.
- Negative: original active faces **37112/37113**, original OBJ vertices `[320401,320402,320403]` and `[320402,320404,320403]`.
- Both exactly two original triangles, original source area 1.525233995m² each mirror, signed source normal Y **+0.9520354685** for each triangle. The original material string is preserved in strict provenance; the hidden QA collision solid necessarily uses the runtime's generic `medium` stage-material enum, **not a claim of rendered-material identity**.

A 31-solid **isolation-only** environment has 25 unchanged original registered stage solids + five original CI688 underpass-route source meshes from B235 + one mesh containing the two unmodified FloorLine00 original triangles **per side**. Thus this QA adds **2 original triangles per side**, not 2 additional StageSolid entries per side. Existing paint-17, existing navigation links-26 and all 25 frozen solids are held by reference. Stage `activationReady:false`; the 31st mesh is never added to the production StageDefinition, live renderer, game scoring or live `CpuAgentSystem`. No fabricated bridges, offmesh links, runtime surface geometry, teleports or fake winners.

## Genuine native results, first measured CI

A real production-profile Rapier capsule and character controller (`createConfiguredPlayerCharacterController`) were spawned at the previously recorded **B235 genuine 7-CPU Recast right-low terminal** for each mirror. The test uses scripted QA waypoint inputs sourced from the original boundary/source triangle witnesses, CPU speed and acceleration limits, production gravity and real Rapier KCC collision resolution, stepping the **same KCC body continuously** from the original right-low support, across the two original FloorLine00 triangles and onto source FloorSlope01. **This is not a live autonomous CpuAgentSystem run.** Each separate walking/jumping trial has one initial spawn, zero subsequent teleports. Ground support is checked by actual Rapier source collision IDs, not simply the KCC target-coordinate proximity or Recast route.

| Measurement | Positive Z | Negative Z |
|---|---:|---:|
| Both original triangle centroid vertical Rapier source contact, before | missing | missing |
| Same genuine source contact with FloorLine00, after | both valid (Y error < 0.000001m) | both valid (Y error < 0.000001m) |
| **WALK** one-body KCC right-low -> FloorLine00 -> source Slope01 | **PASS** | **PASS** |
| Walking native KCC steps (60Hz) | **212** | **210** |
| Walking grounded ticks on exact FloorLine00 | **60** | **59** |
| Walking grounded ticks on source Slope01 destination | **3** | **3** |
| Walking max airborne frame streak | **0** | **0** |
| Separate one-jump KCC trial, same source supports | PASS | PASS |
| Teleports after initial spawn | 0 | 0 |
| Recast right-low -> actual source Slope01 target snap, before | 1.177147m | 1.034338m |
| Recast target snap **after adding genuine FloorLine00** | **1.043973m** | **1.034338m** |
| Strict Recast entry (< =0.30m snap plus target reached) | **FAIL** | **FAIL** |
| Real `CpuAgentSystem` full corridor move | **NOT TESTED** | **NOT TESTED** |

The source FloorLine00 provides **real newly proven physically walkable ingress** under the specified guided input, rather than merely the 0.017m / 0.333m proximity reported in B238. It does *not* mean the whole original underpass is now accessible in native Recast, autonomous CPU pathfinding, or production gameplay.

### Precise Recast blocker (native measured, not a guess)

Both FloorLine triangle **centroids** remain far from the generated nearest-poly surface even after exact original insertion:

| FloorLine centroid projection error | Positive Z | Negative Z |
|---|---:|---:|
| First triangle, before → after | 1.164032 → **1.164032m** | 1.222158 → **1.222158m** |
| Second triangle, before → after | 1.334762 → **1.334762m** | 1.350805 → **1.350805m** |

At a different original source edge witness close to the original Slope01, target snap DOES improve, **0.371100→0.125718m** positive / **0.401332→0.117308m** negative. This is only **local** Recast coverage. The exact Slope01 upper approach target still has **>1.03m** snap error. `auditPath().reachedTarget === true` therefore remains a misleading affirmative for actual source-accurate arrival; B239's strict `<=0.30m` requirement **fails both**.

Potential next root causes include Recast walkable-radius erosion, narrow authentic 2-face source footprint, voxel resolution, region merging, and disconnected original CI688 slope segments. These hypotheses are NOT yet established by a controlled parameter sweep. Do not widen source triangles, generate artificial steps, add offmesh links, lower the CPU capsule radius, or mark the route complete merely to silence NavMesh errors.

## Next integrated slice, instead of another geometry-only catalog

First, use a **QA-only native Recast parameter/fidelity audit on unchanged genuine source triangles**, comparing nav mesh polygons/projection with the measured KCC-supported source positions at individual path ticks. Determine exactly why `FloorLine00` midpoint and slope upper region fail to project onto genuine navigation and whether exact legal clearances admit a CPU-radius pathway. Retain CPU production radius and local physical feasibility as gating inputs. Then couple the certified limited physical segment to **real `CpuAgentSystem`** only if trustworthy Recast and genuine same-actor KCC steering exist; verify an actual F3 Chrome bot, not just a replay of sampled coordinates.

Reused QA scripts: `scripts/undertow-temple01-b238-pinned-full-seam-scan.py`, `scripts/undertow-temple01-b239-extract-exact-floorline.py`, `scripts/T21B239ExactFloorlineNativeIngress.test.ts`; dedicated workflow `.github/workflows/t21-b239-exact-floorline-native-ingress.yml`. Workflow uploads **only small original numerical provenance / physical audit JSON** and never the 43MB external source OBJ.

**Authority remains strictly** original 25 solids / 17 paint surfaces / 26 navigation links / 0 scoreable; 0/12 opposing team routes, `productionAuthorized:false`, `unrestricted4v4Certified:false`, `officialWinner:NONE`. B239 demonstrates a real local physical passage, **not** general game completion or sanctioned 4v4.
