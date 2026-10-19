# W10-B47 — Real native ballistic launch replay / genuine mouse throws

Status: pre-CI, bounded opt-in source QA only. Base 798543ea12ccae5dbe79470b1d117bf45d6ada3c.

## Exact change
Observe the native human bomb's initial **velocity after the actual player launch solve and subweapon +upwardBoost**, only in the existing optional source-QA explosion witness. No game velocity, aim, stage, resource, collision query or render modification.

Replay each recorded live native trajectory **read-only** from its observed native origin and velocity: semi-implicit Euler dt=1/60, true pulse bomb speed 10.5m/s, upwards boost 4.6m/s, gravity 18m/s², native TTL, existing PaintSurface and Rapier 'thrown-sub' segment casts, and unchanged 0.06m priority epsilon. Compare chosen native contact ID/type, exact contact coordinates, flight tick and candidate query counters against the *real* B43/B44 witness. Replay is a validation tool, not a substitute for actually thrown native physics.

All prior 12 authentic KeyF player throws remain tested, then two more genuine pointer-locked relative CDP mouse+KeyF variations. Total 14 real throws. No injected projectiles, camera writes, new original geometry, scoreable mask or fabricated source actor. Audit passes only if 14 live launch traces independently match actual-source ray replay; fail/HOLD on mismatch, never secretly adjust physics.

## Frozen
25 original physical solids/17 Paintable/26 NavLinks/0 Scoreable, activationReady=false, natural opposing team connectivity unproven, standard FIXED patrol, PR5 Draft and protected main/T20/Pages/owner Windows unchanged. B45 B35 CPU lane intermittency not forgotten.

## CI
Pending verified GitHub browser and cross-platform QA; append measured results only from actual logs.

## Verified original-source native results — 2026-10-20 JST

**Verified code SHA: `52efd0f5177b16dec930da8fff40aea0212f7432`; GitHub Actions 6/6 completed SUCCESS.** The initial B47 implementation SHA `685c505d1f4e02dfd21f1811254af226b72948ea` failed the TypeScript compile because the replay diagnostic indexed an optional tuple in a callback. The verified SHA corrected only that typed coordinate difference expression (explicit X/Y/Z). No player physics or source authority changed. Never treat the failed initial SHA as PASS.

### Real native velocity plus independent source-query replay

Exactly **14 / 14** genuine human pointer-locked KeyF bomb launches were independently replayed and **matched actual SubWeaponSystem witness** in:
1. Chosen contact type and exact source ID;
2. actual flight query ticks;
3. counts of native PaintSurface and Rapier candidates and simultaneous candidates;
4. actual contact point where present.

Measured contact point error **0 meters for all 11 real contact cases**, and **3 genuine no-contact FLIGHT_TTL cases** (#8, #10, #14). Among 14 native cases: **11 PAINT_SURFACE_SEGMENT**, **0 RAPIER_STAGE_SOLID**, **3 NONE**. Thus exactly matching ballistic replays **do not** establish that a true Rapier-first bomb is reachable from this human foot.

Actual source pulse-bomb model, not hand-tuned:
- Throw speed **10.5 m/s**, upward boost **+4.6 m/s** added AFTER native launch solver;
- gravity **18 m/s²**, timestep **1/60s** (native semi-implicit Euler);
- existing Rapier `thrown-sub` and original PaintSurface segments queried in matching order on each flight tick;
- existing **0.06m** paint priority epsilon, original three-second TTL unchanged.
No new collision surface or guessed Nintendo-source ballistic model was involved.

### Two additional real Chrome human throws

| Case | Actual camera yaw/pitch | True launch velocity (x,y,z) m/s | True native result | New owner cells |
|---|---|---|---|---:|
| #13 `B47_TRUE_BALLISTIC_AIM_A` | −120.12° / −40.98° | (−8.088, −1.630, 2.453) | first-drop landing PaintSurface, contact at tick 15 | **4** |
| #14 `B47_TRUE_BALLISTIC_AIM_B` | −93.72° / −1.38° | (−10.300, +6.423, +0.912) | no contact, FLIGHT_TTL at tick 180 | **0** |

Actual #13 native contact point **(0.483, 3.002, −53.097)**; #14 native no-contact explosion **(−28.701, −57.879, −51.125)** in existing browser coordinates. The latter **does not certify** official Nintendo abyss behavior or a missing collision; the observed native browser flight simply encountered none of the 25 approved Rapier stage solids or 17 Paintable originals.

### Independent B35 CPU source lane comparison

This verification run's original B35 real keyboard retreat check completed PASS: native retreat **3.157m** and physical lane separation **1.713m**, using original thresholds (≥1.5m, ≥1.6m). The B45 first-attempt transient failure is still known and not proven repaired. Standard default CPU FIXED patrol maintained.

### CI evidence

- [Actual Chrome authentic 14 human KeyF throws + 14/14 full native replay + existing B35 comparison](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39342524137)
- [Original full-source visual integration](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39342524066)
- [Original A-B-A render](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39342524026)
- [Native Chrome 7 CPU lifecycle/render](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39342524054)
- [Ubuntu and Windows QA launcher checks](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39342524013)

**B47 verdict: PASS** for the actual native launch velocity observer, **14/14** exact independent deterministic source-world collision trace replays and two more genuine KeyF launches. **Original-game Rapier-selected contact remains HOLD (0/14)**, and cannot be claimed from an alternative straight-ray winner. Recommended B48: bounded *time-parametrized source-only velocity-angle search* using this now validated replay, predicting genuine Rapier-first opportunities from the real player foot **before** requesting genuine new KeyF trials. Crucially, the camera sightline/native projectile-launch solver may rotate the outgoing direction; a hypothetical direction is not a direct camera aim target. Require read-only preflight, then real observed human throw; no artificial new original source/actor masks or gameplay tuning.

Everything frozen: physical **25**, Paintable **17**, NavLink **26**, Scoreable **0**, source `activationReady=false`, default FIXED CPU, original team 4v4 connectivity HOLD, protected main, PR #5 Draft, T20 frozen, Pages and owner Windows environment.
