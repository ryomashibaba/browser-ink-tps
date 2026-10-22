# W10-B115 — Preserve real original-ray/KCC disagreement when fall suspicion occurs

Date: 2026-10-23 JST. Branch `dev/t21-f4e103w-qa-infra`. Status: implementation awaiting exact-SHA GitHub Actions.

## Evidence and scientific boundaries
B112 [#39795029151](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39795029151) proved only **120 native ticks / 9.516901m** of authentic KeyW movement in one upper-source area with no suspicious descent. B113 [#39798202896](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39798202896) **PASS**, including Vitest **10/10** and genuine Chrome Escape + pointer-release + rendered button click + parse of the actual downloaded `T21_W10B113_ORIGINAL_FLOOR_TRACE_TICK_168.json`, preserving **25/17/26/0**. Neither result proves central-area source floor quality.

B114 adds center/forward/backward/left/right original Rapier rays at 80% of the configured human/squid radius. **These are observations, not Rapier KCC contact manifolds.** A nearby original ray by itself must NOT be used to claim the actor is supported, or suppress an actual KCC non-grounded measured descent.

## B115 actual changes
- Classify a genuine original 8+ native-tick and >=0.18m KCC-ungrounded descent at the precise detection tick as: (a) `EDGE_RAY_VISIBLE_BUT_KCC_UNGROUNDED`; (b) `NO_NEAR_ORIGINAL_FOOT_RAY_KCC_UNGROUNDED`; or (c) `FIVE_RAY_WITNESS_NOT_AVAILABLE` for pre-B114 callers.
- Record original ray solid IDs and all 5 sample measurements with the suspicious descent, explicitly `rayHitDoesNotProveKccCollision:true`. The event remains `SUSPECT_UNSUPPORTED_DESCENT_NOT_PROVEN_FLOOR_HOLE`. Importantly do **not** classify edge-only support as safe: a non-grounded real player remains non-grounded.
- Preserve this bounded immutable-ish report through a native player respawn, and automatically include it in the existing user-clicked B113 local JSON. No actor teleport, no added collider, no inferred original hidden floor or permanent gameplay change.
- Add a no-physics-mutation unit test that reproduces 16 real-format samples with original edge rays while genuine KCC stays ungrounded; ensure suspicion remains visible; also check no-near-ray and legacy/no-footprint fallbacks. Existing Chrome script rejects forged or contradictory context if any real natural fall suspicion happens. Do not invent a fall to satisfy the test.

## Acceptance and next real-world engineering gate
The [B114 5-ray run #39799477744](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39799477744) was queued/in_progress while engineering continued; check actual logs. The B115 exact-SHA consolidated source walk + real local JSON download workflow must pass, as must the new unit and TypeScript/Vite build. F2/F3 gameplay remains more valuable than endless probe tuning: next user-reported source floor repair requires a real reproducible central-road or home-base original-stage traverse and triangle identity. Frozen **25/17/26/0**, main and Pages unchanged, no 4v4 score/promotion.
