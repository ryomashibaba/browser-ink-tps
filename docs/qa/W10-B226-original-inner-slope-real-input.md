# B226 — actual human third source transition, outer -> inner floor source

2026-10-26 JST; parent `e60599b5411ab602a93481828f12c6a35aa06452`.

B225 confirmed that the genuine CDP/PlayerInput -> PlayerController/KCC walked FloorConcrete01 -> outer Slope00 (one actual Space) -> FloorConcrete02 (no second jump, 0 airborne native ticks), mirrored both sides, in a 30-solid isolation scene. The original source geometry still has a distinct 0.518559m geometric seam FloorConcrete02 -> **inner** Slope00 that cannot be assumed traversable.

This iteration keeps the *same* human physical body, the same five exact CI688 source triangle mesh components **only in isolated QA**, and continues with two real CDP mouse-look / W/S input segments. They follow a verified floor02 model-space waypoint (-12.1, Y=4.5, Z=12.2) and then probe the original inner Slope00 surface at (-12.05, Y=4.383..., Z=10.15). The actor is never teleported after its one initial test spawn, and **one total Space press** must remain recorded (the first 2.074m seam). Native source-foot support, KCC grounded/airborne ticks, and true landing stability on inner Slope00 are logged, not injected. Both sides are tested.

CI success here initially means only the QA controls executed with no cheating and past 2-leg source physical passage remained valid. Third-leg touch/stability results are separately reported; they must not be claimed successful until the real Chromium output confirms. No production stage/navigation/AI/scoring changes. Live frozen authority stays 25/17/26/0 and certified opposing routes 0/12, officialWinner NONE. CI691 five+five Recast insertion failure remains valid.

## First native B226 run — 40293452614 (FAIL, evidence retained)

Positive Z with one real human, original five CI688 QA meshes and the immutable 25 existing solids successfully reached and stabilized on **inner Slope00**. Source support order: FloorConcrete01 → outer Slope00 → FloorConcrete02 → inner Slope00. Third leg genuine grounded ticks 150, airborne 0, single Space keypress in the whole run, no original collider contacts and no teleports. Minimum inner-target distance 0.017422m.

Negative Z independently repeated the first real 2m jump but second-leg W/S was released when merely **0.216853m from the FloorConcrete02 target**, before a registered FloorConcrete02 support hit: the existing B225 early stop condition also accepted proximity <0.55m. Therefore the following B226 segment did not start, and the workflow correctly FAILED. This does not yet prove negative-side geometry untraversable.

The correction only for B226 keeps real W/S input active until **actual native source FloorConcrete02 support**, not guessed geometric proximity (or the existing 120-tick safety cap). The B225 baseline stopping behavior remains unchanged; no pose adjustments or fabricated supports are allowed.

## B226 first corrected Chromium run #40293716638 — successful three-leg physics

First B226 QA run #40293452614 initially **failed** on the negative Z side because the B225 inherited stopping rule accepted a small XZ distance before confirming FloorConcrete02 actually supported the character. The first dedicated B226 correction (commit `ed6ce35062a63a7a24840fa7d5b7a464b8576d9f`) removed that premature geometric stop condition **only in B226**. Native run #40293716638 then **SUCCEEDED** on both sides, using one physical human, one actual Space input, and the true player camera/movement controls:

| Side | FloorConcrete01 -> outer Slope00 -> FloorConcrete02 -> inner Slope00 | Third-leg grounded | Third-leg airborne | Closest inner target |
|---|---|---:|---:|---:|
| Positive Z | all four authentic collider supports observed, inner stable | 156 ticks | 0 | 0.089170 m |
| Negative Z | all four authentic collider supports observed, inner stable | 150 ticks | 0 | 0.038887 m |

The old B224 four-direction browser QA was also SUCCESS at #40293716502. **However, old B225 browser QA #40293716588 FAILED** on the negative side for the same false-near-target release, even while retaining physical ground support on the outer slope. Consequently the geometric stop is now removed in **both** B225 and B226 corridor scripts: they must observe the exact FloorConcrete02 real foot-support collider, not centroid proximity. The 120-native-tick safety ceiling is retained. B226 real inner-slope stability and ground continuity are promoted to hard CI assertions only after this measured proof. Entire procedure stays isolated QA with 30 solids, not the actual runtime's 25.

## Final B226 true Chromium result — all regressions green

Source implementation at `aa3c69c008ae4a14839418373926d42f6deccbad` was checked in the three real-browser CI workflows:

- B226 three-leg (including both mirrored inner slopes) **SUCCESS**: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40293999559
- B225 real two-leg grounded regression **SUCCESS**: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40293999528
- B224 four-direction source jump regression **SUCCESS**: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40293999462

B226 Native CDP log for the **same** player physical body, following FloorConcrete01 -> outer Slope00 -> FloorConcrete02 -> inner Slope00, strictly ordered original collider supports:

| Side | Waypoint reached on authentic FloorConcrete02 | Third-leg grounded native ticks | Third-leg ungrounded native ticks | Inner Slope00 contacted and stable | Minimum inner-target XZ error | Extra Space inputs | Collisions against 25 existing solids |
|---|---|---:|---:|---|---:|---:|---:|
| POSITIVE_Z | YES | 149 | **0** | YES | 0.183773 m | 0 | 0 |
| NEGATIVE_Z | YES | 159 | **0** | YES | 0.014317 m | 0 | 0 |

B226 strict gate `B226_REAL_INNER_SLOPE_GROUNDED_GATE_PASS` is emitted only after both inner slope stable contacts, 18+ grounded third-leg ticks each, zero airborne third-leg ticks, one total first-gap Space press, exact original source support-chain order, no teleport after initial test spawn, and zero contacts against the 25 existing original runtime solids. No fake clock, KCC displacement injection, artificial floor or scoring promotion.

**Bounded claim:** full original five-source-component local chain is physically navigable by actual user keyboard/mouse input in **an isolated 30-solid QA environment**, for the tested trajectories; this says nothing about live runtime availability of these components or a Recast/Crowd CPU planning path. Live 25/17/26/0 remains unchanged; genuine cross-team routes remain 0/12, productionAuthorized=false, unrestricted4v4Certified=false and officialWinner NONE. Future B227 should seek authentic physical and Recast ingress into the currently registered 25-solid playable world without replacing the original source package or inventing artificial connectors. Do not repeat CI691's failed 5+5 NavMesh promotion.
