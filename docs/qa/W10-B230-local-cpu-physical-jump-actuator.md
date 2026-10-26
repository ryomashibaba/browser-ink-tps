# W10-B230 — isolated CPU-speed physical takeoff and landing actuator

**Baseline:** 84e7c2c261373d5a3647f2ea491244f95f9771ff, 2026-10-26 JST. Existing B229 real Rapier KCC CPU-speed case 4/4 and no-jump failure 0/4 (CI #40301728134). No production CPU navigation is authorized; full original 25/17/26/0 remains frozen and opposing route certification is 0/12.

B229 proved a series of inline QA KCC operations could jump the exact CI688 2.074235m gap at CPU 4.4m/s speed and 18m/s² acceleration with a QA-proposed real vertical takeoff of 8.2m/s. The ordinary `CpuAgentSystem` uses Recast Crowd for actual steering and disables ordinary tactical jumps under F3 source-only QA; its legacy superjump position lerp must NOT be repurposed.

B230 moves this physical algorithm into a **dedicated, reusable, staged CPU-locomotion QA actuator** `src/ai/B230CpuLocalGapQaActuator.ts`. It owns its own real native Rapier capsule, actual shared character controller and genuine per-tick kinematic collision movement, 60Hz, and a source-only approach / takeoff / airborne / physically grounded landing / fail state machine. Launch requires both grounding and the exact original source solid ID, not proximity or Crowd projection alone. Target landing requires the other **exact** original source mesh and 18 consecutive physically grounded ticks within 0.65m. Both directions, both mirrored sides and four disabled-jump controls are exercised in a dedicated native CI.

The constructor refuses any stage outside `b230-exact-source-local-cpu-qa`, any stage not consisting of the **unchanged existing 25** original solids plus exactly **two exact CI688 original source mesh references**, any tampering with the 17 paint surfaces or 26 links, any navigation-enabled extra source, and any out-of-range/fake goal. Production route cannot instantiate it silently. Source CI688 originals, PR #5, main, Pages, the native CPU class and score/AI world state remain unchanged.

**Success means only a reusable isolated CPU-speed real physical actuator candidate**. The test does not instantiate `CpuAgentSystem` or native `Crowd`, and does not identify an authenticated Recast connector. Never count this as original CPU autonomous path completion, official 4v4, score or winner; opposing routes remain 0/12, productionAuthorized=false.

Next gate after measured CI: independently verify physically safe source launch plus Recast Crowd approach/hold/rejoin *within a QA sandbox* without altering the 25 source-stage original or producing an arbitrary offmesh teleport.
