# W10-B209 — Original ramp boundary gameplay warning and immediate true-CLEAR HUD synchronization

2026-10-25 JST. Existing QA branch `dev/t21-f4e103w-qa-infra`, continuation from B208 SHA `89042a29063d7ab1e5fb50c25ce45ab284053a60`.

## Independent real browser basis

- B208 real native FIXED + SWEEP CI **PASS**: [Actions #40189966361](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40189966361). The real user pressed the combat button from the ordinary preview, booted a fresh original B192+B203 source world (zero original CPU rejoins at boot, original 25/17/26/0, no teleport) and really played the new world: genuine HUMAN KCC 3.648m, 10 actual shots, 379 source HUMAN impact-changed cells, 7/7 original CPU real physics rejoins, 273 CPU source impact-changed cells, native tick 1083, REAL match PLAYING, ~179.53s remaining, no winner. This validates *playable mode selection* not natural encounters or 180s full-time.
- B208 A1 cooperative real Chromium regression **FAIL** [Actions #40189966452](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40189966452): first native mission genuinely CLEAR (human 808 / A1 40). B205 round HUD remained `data-t21B205MissionClear=false` immediately at sampled native CLEAR, even though B195 mission footer already read `A1 CO-OP CLEAR · KEEP PLAYING`. Root cause: real B25 terminal status is observed by fixed60Hz, while B205 round HUD originally updates on less frequent heavyweight render. B209 updates the complete read-only HUD **once on actual mission transition**, not by changing mission state, tick authority or wall clock. Exact real browser recheck required.
- B206 true 180s browser [Actions #40187270605](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40187270605) **FAIL, substantive original KCC unsafe route at ~140 real match seconds**. Seven original source CPUs physically participated, actual 451 native CPU shots, 11,499 impact-changed source cells. Real human route (KeyW 200, KeyD 12, KeyW 18, KeyA 12) moved onto original FloorConcrete03 ramp and past its edge. Exact original +Z ramp quad source: `right-low-route-ramp-positive-z` at `src/stage/undertow/UndertowSpillwayRouteRampGeometry.ts`, [8.333487,52.203114],[5.046481,45.49824],[0.855934,47.552619],[4.142941,54.257493] project XZ vertices.
  - At true native tick 9764 on genuine registered original ramp support: original human body XZ `[0.998295,47.498734]`, projected **inside the original ramp by just ~0.0144m (1.4cm)** from closest edge. This is ground-truth geometric proximity (not proof of complete capsule safety).
  - At tick ~9773: actual human XZ `[1.015006,46.744385]`, outside the ramp polygon by ~0.656m, center source support unconfirmed.
  - At tick 9785 human XZ `[0.7321998,46.21436]`, outside ramp by ~1.26m, native KCC grounded false and five original Rapier foot rays all null. Strict B176 `REAL_HUMAN_DID_NOT_REACH_SUPPORTED_ORIGINAL_LOWER` correctly failed.
  - **Do not generalize this precise trajectory to missing floor geometry or a safe path.** It demonstrates the specific previously issued real keys crossed a registered narrow ramp edge and subsequently lost physical support. Any successful replacement movement must be measured in a new real native KCC run. Do not insert geometry/NavLinks, teleport or convert the real failed 180s into PASS.

## B209 gameplay implementation

Add read-only `B209OriginalRampEdge` based *exclusively* on the registered source ramp polygon on both sides, real HUMAN body, genuine 60Hz native tick, and a true central Rapier source-foot ray near that exact original quad. When real physical play approaches an original ramp edge (0.65m/0.20m thresholds are **warning distances only**, not collision/traversal certification), show a visible compact warning before advancing into unverified support. Signed XZ distance is diagnostic only, never claims next step supports KCC. When outside polygon or Rapier foot ray fails, fail closed with no fabricated floor/path. Pause, terminal, unauthorized stage or invalid source evidence hide the warning. No actor/geometry movement, no physics rules changed; HUD renders only in user-selected 180s or genuine B183 original descent play.

B209 also makes the source 180s gameplay HUD update once **at genuine B25 CLEAR transition** so real A1 completion and the still PLAYING full match are simultaneously visible; does not change match clock, scoreability, mission progression or CPU. Existing B162 Chrome strict checks remain, preserving hard failure on stale HUD after an actual terminal event. Focused B209 Vitest tests include the actual B206 native tick 9764 1.4cm edge witness, outside/unsupported real footprints and stage rejection, wired into existing B75 preflight. No new workflows.

## Gates
- B209 typescript build and unit PASS: pending same-SHA CI.
- B209 real B162 A1 mission CLEAR + immediately synchronized native full round HUD: pending.
- B209 live warning after actual native ramp approach: pending dedicated real HUMAN walk.
- Real B59 full 180s with genuine KCC supported lower route: **HOLD**.
- Natural opposite-team contact, actual splats/respawns, official 4v4, original score/winner, production: **HOLD**.

Preserve **25 source Rapier solids / 17 source PaintSurfaces / 26 authored NavLinks / 0 Scoreable**, natural opposing paths 0/12, `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`, official winner NONE, no changes to `main`, Pages, T19C/T20, PR #5, or any user-owned original stage payload.
