# W10-B152 — strict provenance of authentic A1 teammate-ink impacts

2026-10-24 JST. Branch `dev/t21-f4e103w-qa-infra`. Source-only opt-in; never production.

## B151 exact native browser finding
[GitHub Actions 40071365037](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40071365037) at `4385f610ac3e948fab0f743e702e6024ee1fd0ec`:
- `ALLY_RALLY`: 7 genuine CPU rejoins, 503 actual near frames, exact human KCC/A1 contacts 0, A1 **15** accepted turf-shot requests, actual A1 impact events **15**, real changed impact cells **405**.
- `FIXED_DEFAULT`: 7 rejoins, 0 near frames, 0 exact human contacts, A1 **11** turf shot requests, A1 actual impact events **0**, changed impact cells **0**.
- Source-certified standoff preserved. Fixed/default has **zero** ally rally or source-aim goal approvals. Stage remains original 25 solids/17 paintable/26 nav links/0 scoreable.
- Crucial limit: ALL A1 impacts were counted, including legacy aim. They were **not proven attributable** to the B151 original ally support aim.

## B152: exact aim-to-ink causal trace (new code, native proof pending)
Only when the unchanged authenticated real original A1 ally-aim branch selects `allyInk`, its genuine `CpuAgentSystem.queueCpuWeaponRequest` carries diagnostic `qaSourceAim='A1_ORIGINAL_ALLY_SUPPORT_INK'`. `ProjectileSystem.queueCpuShot` retains the label for this request, then each actual A1 CPU shot retains it in the **real pooled projectile slot**. At actual real stage `SurfaceRayHit`, `enqueueImpact` carries the same label into its normal `PaintRequest`; immutable `PaintCoordinator` `PaintEvent` passes it to the current original gameplay + GPU ink rasterizer without altering collision or ink. The F3-only existing accepted-paint callback credits only the tagged A1 CPU `Impact`/`WallImpact` events after real paint rasterization. Untagged A1 shots, feet, mid-droplets, other CPU teams, simulated proposals or default FIXED do NOT qualify.

The QA-only read-only snapshot records:
- `acceptedSourceAimShotRequests`: actual accepted A1 ally-aim weapon request
- `spawned`: real tagged pooled projectiles spawned
- `originalSourceSurfaceCollisions`: actual source surface collisions
- `impactEvents`: tagged CPU A1 `PaintCoordinator` impact events
- `changedImpactCells`: **real** accepted cells whose ownership changed from those events
- `zeroChangedInkImpacts`: genuine tagged impact with no net repaint

The previous B151 all-A1 impact witness remains separate for comparison. B152 new source filter is unit-tested and run in existing B75 preflight, while B139 existing ALLY_RALLY vs FIXED_DEFAULT native Chromium continues to output exact data at full 60Hz with no test-only teleport or synthetic paint event.

## Gates and caveats
B152 is not certified until the **B152 SHA native browser outputs** prove actual tagged positive `changedImpactCells`; the GitHub Actions job green alone is not coverage. The new tag is provenance, **never authorizes shot, stage geometry, team, collision, ink, navigation, scoring, or production**. This first tagged lane covers the actual A1 shooter `PROJECTILE` used in the B139 probe; charger/splatling/melee CPU kit workflows are not claimed tagged.

Keep `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`, genuine cross-team paths 0/12, scoreable mask 0. Formal original 180s 4v4 remains HOLD. Frozen `main`, public production, T19C/T20, legacy Windows source and PR #5 are untouched.
