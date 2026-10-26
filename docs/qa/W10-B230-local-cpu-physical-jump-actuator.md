# W10-B230 — isolated CPU-speed physical takeoff and landing actuator

**Baseline:** 84e7c2c261373d5a3647f2ea491244f95f9771ff, 2026-10-26 JST. Existing B229 real Rapier KCC CPU-speed case 4/4 and no-jump failure 0/4 (CI #40301728134). No production CPU navigation is authorized; full original 25/17/26/0 remains frozen and opposing route certification is 0/12.

B229 proved a series of inline QA KCC operations could jump the exact CI688 2.074235m gap at CPU 4.4m/s speed and 18m/s² acceleration with a QA-proposed real vertical takeoff of 8.2m/s. The ordinary `CpuAgentSystem` uses Recast Crowd for actual steering and disables ordinary tactical jumps under F3 source-only QA; its legacy superjump position lerp must NOT be repurposed.

B230 moves this physical algorithm into a **dedicated, reusable, staged CPU-locomotion QA actuator** `src/ai/B230CpuLocalGapQaActuator.ts`. It owns its own real native Rapier capsule, actual shared character controller and genuine per-tick kinematic collision movement, 60Hz, and a source-only approach / takeoff / airborne / physically grounded landing / fail state machine. Launch requires both grounding and the exact original source solid ID, not proximity or Crowd projection alone. Target landing requires the other **exact** original source mesh and 18 consecutive physically grounded ticks within 0.65m. Both directions, both mirrored sides and four disabled-jump controls are exercised in a dedicated native CI.

The constructor refuses any stage outside `b230-exact-source-local-cpu-qa`, any stage not consisting of the **unchanged existing 25** original solids plus exactly **two exact CI688 original source mesh references**, any tampering with the 17 paint surfaces or 26 links, any navigation-enabled extra source, and any out-of-range/fake goal. Production route cannot instantiate it silently. Source CI688 originals, PR #5, main, Pages, the native CPU class and score/AI world state remain unchanged.

**Success means only a reusable isolated CPU-speed real physical actuator candidate**. The test does not instantiate `CpuAgentSystem` or native `Crowd`, and does not identify an authenticated Recast connector. Never count this as original CPU autonomous path completion, official 4v4, score or winner; opposing routes remain 0/12, productionAuthorized=false.

Next gate after measured CI: independently verify physically safe source launch plus Recast Crowd approach/hold/rejoin *within a QA sandbox* without altering the 25 source-stage original or producing an arbitrary offmesh teleport.

## Verified B230 strict native Rapier CI — #40304161442 SUCCESS

One new stateful CPU-speed native Rapier actuator and the previous B229 baseline were both executed in GitHub Actions with an ordinary application build, genuine Rapier WASM ground/collider contact and explicit negative controls.

| CI688 source gap direction | QA local takeoff tick | Native first target collider landing tick | Target stable grounded | Original 25-solid collisions | Accepted |
|---|---:|---:|---:|---:|---|
| POSITIVE_Z FloorConcrete01 → outer Slope00 | 29 | 63 | 18 consecutive ticks | 0 | YES |
| POSITIVE_Z outer Slope00 → FloorConcrete01 | 39 | 73 | 18 consecutive ticks | 0 | YES |
| NEGATIVE_Z FloorConcrete01 → outer Slope00 | 30 | 64 | 18 consecutive ticks | 0 | YES |
| NEGATIVE_Z outer Slope00 → FloorConcrete01 | 39 | 73 | 18 consecutive ticks | 0 | YES |

The corresponding four walk-only tests had **0 success** and failed normally when the real native KCC capsule left the source floor. The target distances in all four successful cases were approximately 0.0015–0.0027m. No interpolated superjump, Crowd teleport, scripted pose assignment after initial spawn, substituted floor, or score change occurred. The physical actuator itself decides when the real 60Hz KCC has reached the source-backed takeoff region and may launch only when the exact original CI688 source collider supports the body.

**Fail-closed constructor negative cases pass** for normal production-stage ID, incomplete 26-solid package, navigation-enabled source mesh, and deliberately distant target; no registration or scoring authority is gained. The test logs `actualCpuAgentSystemInstantiated:false`, `cpuNavigationPathCertified:false`, `productionAuthorized:false`. This is a physical CPU-speed actuator *candidate*, not certified AI gameplay.

CI: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40304161442. Three tests across the B229+B230 test files passed and the project build passed. Earlier CI #40303601004 failed on TypeScript class field declaration syntax before the physics tests; corrected in commit `b26384bfeedb31d294f2805d4feb63bca49d3160`.

## B231 focused plan (quality, not repetitive test inflation)

The next meaningful blocker is that the original Recast graph still does not span FloorConcrete01 → outer Slope00 (a true *jump*, not walking), nor the two later human-grounded seams. The live 25-solid stage does not register those source faces. Do **not** simply attach this test actuator to production CPU code or declare 12 team-crossing routes: first develop a separate, explicit QA-only transition interface for a genuine `CpuAgentSystem`/Crowd agent that can relinquish its invalid Crowd steer **without teleport**, use the B230 real KCC actor, and safely resume Crowd only on a physically and nav-supported original destination. Reject any crossing whose source/target original face provenance, launch support or real return-to-Crowd match fails. The first two-side true transition and actual gameplay encounters must precede any release authority, paint scoring or winner logic.
