# B240 — real KCC-grounded original FloorLine00: Recast clearance erosion diagnosed, safe CPU navigation NOT certified

2026-10-26 JST. Base HEAD B239 `6c07ca13df7259fda23d92e8a9e33ddcc138aa67`. Branch `dev/t21-f4e103w-qa-infra`.

## Exact source chain and CI truth

- Initial genuine full KiTrix 43MB Temple01 SHA-256 / 375,948 original vertices / 70,396 active triangles / B238 exact original OBJ-edge component reconstruction / 4 exact FloorLine00 source triangles per both mirrors / B239 real Rapier KCC walk: re-executed in B240 CI.
- Original OBJ SHA-256: `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`. Original filename `stages/Vss_Temple01/Vss_Temple01.obj`. No OBJ committed or uploaded to artifacts.
- First actual B240 controlled experimental CI [#40329965562](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40329965562): **SUCCESS**, native 2/2 mirrored repeated source KCC walking, full TypeScript/game build, source-hash verification, native Recast parameter comparisons on real KCC source-foot samples.
- Second stronger linkless-control B240 CI [#40330372402](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40330372402): **SUCCESS**, including linkless generator counterfactual. The further strict linkless assertion commit should be verified against its own CI before being called passed.
- Production code change: a single guarded `b240IsolatedOriginalStageTriangleSoup` export from `src/navigation/RecastStageNavigation.ts`. It *calls* exactly the existing production geometry soup builder, but refuses all stages except `b240-isolated-original-floorline-*`. No modification to the `RecastStageNavigation` constructor, live CPU navigation defaults, mesh objects, solver configuration, NavLinks, physics collision code, paints, scores, CPU movement or rendering.

Isolated QA stage is *per side*, contains original unchanged 25 solids + five authentic CI688 source meshes + **one** authentic two-triangle FloorLine00 source mesh (31 StageSolid objects total). Source original face ids positive 37118/37119, negative 37112/37113, original OBJ source material `Fld_Temple01_FloorLine00`. The additional exact mesh is never promoted to live gameplay. B239 true same-body KCC test is re-executed and outputs actual grounded frames, not generated approximate coordinates; B240 consumes the exact native walking ground-contact trace from that same CI. Recast queries use those physical-foot coordinates as source targets (including actual FloorLine00 and Slope01 ground contacts), alongside original face centroids and real Slope01 upper approach.

## Measured native Recast source-target projection, both original mirrors

The **native `auditPath().reachedTarget` flag alone is insufficient**: it may end on a projected polygon over a meter from actual original source. Strict test requires actual source target projection error <=0.30m, path endpoint error <=0.30m and reachable path; true original Rapier source ID match is recorded separately. A native strict `true` in this B240 query is STILL NOT a moving CPU capsule demonstration, clearance certificate, or production route authorization.

| Diagnostic Recast generation (all using same original triangles and actual physical feet) | effective radius erosion | positive Z exact Slope01 snap | negative Z exact Slope01 snap | genuine CPU .30m and human capsule .32m clearance? | strict projected Recast ingress |
|---|---:|---:|---:|---|---|
| **Unchanged production generation**: cs .18m, radius 2 voxels | .36m | 1.043973m | 1.034338m | YES | FAIL both |
| Native region filtering 3/8 -> 0/0, other parameters unchanged | .36m | 1.043973m | 1.034338m | YES | FAIL both |
| Finer cells cs .12m / radius 3 voxels | .36m | 1.060754m | .982878m | YES | FAIL both |
| Finer cells cs .09m / radius 4 voxels / ch .05m | .36m | .973903m | .964586m | YES | FAIL both |
| Fine cells + region filtering disabled | .36m | .973903m | .964586m | YES | FAIL both |
| Slope 52° -> 55° (radius unchanged) | .36m | 1.043973m | 1.034338m | YES | FAIL both |
| **Diagnostic-only** radius 1 voxel, cs .18m | .18m | .319817m | .313467m | **NO** | FAIL both |
| **Diagnostic-only** radius 0 voxels, cs .18m | 0m | **.117615m** | **.127428m** | **NO** | projected native strict true both, PHYSICAL CLEARANCE INVALID |
| **Linkless diagnostic-only** radius 0 voxels, no input offmesh links | 0m | **.117615m** | **.127428m** | **NO** | projected strict true both even with zero offmesh links |

All 9 conditions are applied only to a constructed QA generator. The original `StageDefinition.navigationLinks` remains the same 26 links by reference; the linkless run merely passes an empty *generator argument* for the counterfactual, never edits/deletes original or invents a link.

Two original FloorLine00 triangle **centroids** remain >1.1m away from native projection in **all CPU-safe cases** (fine-cell variants modestly reduce the errors). At zero radius, both centroids project onto a true original-source Rapier support within .14–.15m; the actual grounded human-KCC sample around tick 180 also changes from >1.2m snap to <.09m on genuine FloorLine00. This is independent of the 26 original offmesh links as shown in the counterfactual. It is exceptionally strong evidence that **Recast erosion of a narrow source surface is a proximate cause of lost source coverage**, not just aggressive region merging, source provenance error, slope angle or voxel size.

**Important caveat:** the quantitative parameter sweep does not itself establish the *exact effective transverse walkable clearance* of all nearby original solids or validate a 0.30m-radius moving Crowd agent. The true KCC human capsule can physically follow the B239 guided authentic floor without needing the *Recast* surface to retain that narrow feature; this is not a reason to shrink the agent, cheat overlap, or mark live CPU navigable.

## Scope and honest authority classification

- Authentic exact source face discovered: **YES B238**.
- Native original source Rapier contact: **YES B239, independently repeated B240**.
- KCC human-sized one-body guided **WALK** from existing registered right-low floor, across FloorLine00, to exact Slope01: **YES B239, independently repeated B240**. No post-spawn teleport, zero max consecutive airborne frames walking.
- Native Recast source-accurate path with CPU-safe radius: **NO in all six tested safe configurations**. Radius-zero bypass is physically unsafe.
- Real `CpuAgentSystem` executing this route: **NOT TESTED**.
- Fully connected underpass, 12 original team crossings, official 4v4, win/score: **NOT CERTIFIED**.

Frozen original stage still exactly 25 registered solids, 17 paint surfaces, 26 navigation links, 0 scoreable; original opponent CPU routes 0/12, `productionAuthorized:false`, `unrestricted4v4Certified:false`, `officialWinner:NONE`. QA's 31 solids remain isolated only.

## B241 priority / quality-first decision

Do **not** adopt the radius-zero NavMesh or a physically invalid small-agent radius. Do **not** add invented floor, bridges, extra NavLinks, or magical Recast offmesh jump for this contact.

Next derive the *actual original-sourced walkable envelope and physical capsule centerline* from the KCC-supported B239 trace and exact adjacent original mesh boundaries. Compare width, lateral tolerance, physical collision contact and the genuine CPU .30m radius; explicitly prove or reject a safe local way to steer the real CPU-sized Rapier capsule across the authentic narrow surface. If a safe line survives natural-source Rapier, prototype a narrowly gated **QA-only** local source-following KCC steering handoff (existing physical body, no teleports, no fake NavMesh path or new NavLink), not a global relaxation of Recast. Validate with genuine CPU actor behavior and Chrome only after source contact / obstacle / tolerance gates pass; preserve the frozen stage until source-to-source continuation, full F3 and both sides are demonstrably correct.

Reference scripts:
- `scripts/t21-b240-pinned-original-floorline-qa.ts`
- `scripts/T21B240OriginalRecastClearanceRootCause.test.ts`
- `.github/workflows/t21-b240-original-recast-clearance.yml`
- `scripts/T21B239ExactFloorlineNativeIngress.test.ts` (measured grounded KCC trace required by this B240 test)
- `scripts/undertow-temple01-b239-extract-exact-floorline.py` (full-OBJ SHA-pin exact source reconstruction)
