# Browser Ink TPS — W10-B48 genuine source ballistic preflight

## Implementation gate (CI unverified)
QA base `61f9f360965d2917b0f706427017a727f3398a47`. W10-B47 has 14/14 exact independently replayed original-source native human KeyF trajectories. B48 now performs **time-parametrized semi-implicit Euler trajectory preflight**, not B45-style straight-ray guessing, using **two real measured muzzle origins** (true native human launches #12 and #14). Each candidate initial velocity is hypothetical; its origin is original but the velocity may not be obtainable from a real native camera aim/ProjectileSystem launch solver.

Bounded **578** virtual directions: yaw -140..20 by 10° and pitch -40..40 by 5°, each at two actual source-world launch origins. Actual unchanged pulse-bomb 10.5m/s speed, +4.6m/s boost, gravity 18m/s², 1/60 fixed tick, 3s flight TTL; existing Rapier 'thrown-sub' and certified original PaintSurface casts and 0.06m priority epsilon. Record original source Rapier-first source IDs, collision ticks, exact browser query positions, PaintSurface winners and genuine no-contact trajectories separately.

**Important evidence boundaries**: read-only source geometry queries are native-code observations of hypothetical initial velocities; these are not 578 genuine human throws and not original game collision proof. No camera transforms, input spoofing, scene mutation, new stage shapes, paint or scoring. The selected candidate can only be certified as a real-gameplay native pulse-bomb collision after actual pointer-locked mouse+KeyF run with measured outgoing velocity. Do not claim that a found candidate has actually been hit.

All original source limits 25 Rapier physical/17 Paintable/26 NavLinks/0 Scoreable. `activationReady=false`, standard fixed patrol. Main, frozen T20, PR #5, Pages and owner Windows untouched. B35 occasional real-player lane test intermittency remains separately documented.

## CI
Pending measured actual Chrome run, search counts, and code SHA.

## Verified B48 actual original-source measurements — 2026-10-20 JST

### Code SHA / real CI provenance
- **Initial preflight code SHA `3eee9a9f9166d840e549ff8fa3a3335a85b1f33f`: GitHub Actions 6/6 SUCCESS** ([trusted real Chrome preflight + B35 default fixed CPU](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39343782189), original full-source and render, Ubuntu/Windows launcher checks).
- **Second tested code SHA `36cec58f3d6a5ca0941b7404f6a5d22d04eb9122`: GitHub Actions 4/4 SUCCESS**, no game behavior changes; only adds real mouse+KeyF trials using the initial preflight. [Actual Chrome 16 native KeyF throws / B48 native contact witness](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39344591775); [original full-source](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39344591876); [source A-B-A](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39344591860); [Chrome seven CPU lifecycle](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39344592119).

### Read-only time-parametrized source-ballistic preflight

578 hypothetical launch velocities from **two actually recorded human native muzzle origins** (real throws #12 and #14). Existing native engine `pulse-bomb` Euler / 60Hz / +4.6m/s / 18m/s² / 0.06m priority / 25 real Rapier solid casts and 17 real PaintSurface casts, no projectiles injected. Actual read-only native query distribution:

| Observed hypothetical 60Hz trajectory outcome | Count |
|---|---:|
| Rapier stage collider first | **19** |
| Existing original PaintSurface first | **292** |
| Neither until FLIGHT_TTL | **267** |
| **Total sampled** | **578** |

Of these Rapier-first hypothetical trajectories, **16** hit source high negative-Z spawn solid; other native source colliders were first-drop landing and right-low team-B. These candidates are **not** 19 actual human throws or original Nintendo physics certification.

### First ACTUAL chosen Rapier solid contact — human KeyF native throw #15

**Important B48 milestone: first real native bomb hit for `RAPIER_STAGE_SOLID` after previous 14 authentic bombs all selected paint/TTL.**

- Grounded preflight predicted from real throw #12 muzzle: horizontal yaw **−60°**, launch pitch **+30°**, `UndertowT21D:right-low-team-b`.
- Used the **measured real camera-to-launch offset** from old KeyF throw #12 as a *calibration*, then actual Chrome pointer-locked relative mouse movement (no direct camera writes), aiming **−62.04° camera yaw, +27.96° camera pitch**.
- Actual native `SubWeaponSystem.tryThrow` accepted true human KeyF and produced initial outgoing velocity **(−7.890806, +9.823112, −4.550196) m/s**, equivalent to native actual yaw **−60.0303°** and native boost-corrected launch pitch **+29.8307°**. Predicted native launch velocity discrepancy only **0.031393 m/s** (yaw −0.0303°, pitch −0.1693°).
- **Real Rapier contact** `UndertowT21D:right-low-team-b` at original browser-world contact XYZ **(−6.260264, 4.466928, −59.085758)** after **66 real native flight collision-query ticks**. The actual contact tick's chosen query had **Rapier solid hit distance 0.0497049m** and **no PaintSurface candidate**. Native winner was **RAPIER_STAGE_SOLID**, never inferred from paint stamps.
- `LANDED_FUSE` subsequently exploded at the exact native contact point. Explosion produced **4** actual original PaintSurface Stamp events (surface `UndertowT21D:right-low-team-b:paint`) and **77** new authoritative GameplayInk owner cells. This distinguishes **Rapier-selected physical landing** from **PaintSurface explosion projection**: the latter does not imply the former.
- Actual source foot was preserved, source invariants **25/17/26/0** and `originalGameCollisionCertified:false` in the true native witness. The original Nintendo official stage face/collision cannot be promoted from this browser test alone.

### Second native throw #16 — honest negative actual candidate

- Other predicted Rapier-first candidate came from real #14 muzzle, hypothetical yaw −50° / launch pitch −20°, original first-drop source solid.
- Actual camera via native calibrated mouse: **−48.62° / −31.42°**. But real `SubWeaponSystem` outgoing velocity yielded **yaw −40.3236° / launch pitch −27.8987°**, a mismatch of **9.6764° / −7.8987°**; 2.1673m/s initial velocity discrepancy relative to the hypothetical trajectory.
- **Actual native winner was PaintSurface** `UndertowT21D:first-drop-landing-negative-z:paint` at XYZ **(0.531810, 3.002, −56.424063)** after **19 native flight ticks**. Both PaintSurface and Rapier source casts existed: paint distance 0.113903m, Rapier distance 0.117581m; unchanged priority epsilon 0.06m correctly selected paint. Native `LANDED_FUSE` burst produced **7** Stamp events and **126** new authoritative GameplayInk cells.
- Therefore **only one of the two B48 targeted real human trials selected a Rapier solid**. Calibration cannot guarantee arbitrary outgoing velocity: further proposed aiming solutions must continue to measure actual native initial velocity.

### Independent CPU B35 comparison and preservation

Trusted real Chrome B48 workflow's original B35 source-lane clearance returned actual player retreat **3.156952m** and separation **1.712618m**: PASS with untouched thresholds. Previous B45 first-attempt sporadic failure was not reproduced but is still not causally eliminated. No CPU heuristic upgrade.

**B48 scoped decision: PASS**, specifically real exact-flight source preflight, two new genuine human KeyF trajectories, **first actual chosen Rapier collision (real #15 / 16 cumulative real throws)** and post-raster ink observation. **Still HOLD:** Nintendo-original physical fidelity of this contact primitive, exact source placements outside certified 25/17/26, scoreable turf 0, natural A–B connections 0/12, activationReady=false, automatic production 4v4, Windows RTX owner test. Standard FIXED patrol, frozen main, PR #5 draft/unmerged, Pages, T20, owner originals all untouched.

### W10-B49 suggested efficiency-first direction

B48 proves a real Rapier-selected bomb is possible **without changing physics**, so do **not** keep randomly attempting Rapier landings or promote a StageReady flag. Instead use the genuinely measured #15 contact as a **bounded source-native reproducibility sentinel** and add a small multi-trial stability check (strict natural mouse+KeyF, true owner cell outcomes) plus separate B35 real player lane sampling. Preserve original source authoritative masks. Work remains unnecessary.
