# W10-B100 — Three genuine Chrome human-lip occupancy positions

**Date:** 2026-10-22 JST  
**Branch:** `dev/t21-f4e103w-qa-infra`  
**Status:** **QA experiment only; production HOLD.** Original Draft PR #5 and `main` unchanged.

## Real-Chrome source-collision results

The human was moved exclusively by Chrome DevTools Protocol **Input.dispatchKeyEvent** to real PlayerController/Rapier feet. After real KeyW keyup and natural coast, the human remained parked with no reverse KeyS. The A3 experimental upper detour was enabled **only** under `t21Play=preview&t21QaDrive=source&t21W10B93=upperDetour`. The scripts did not write any CPU/human pose, fabricate a link, force a match start, or add original-stage collision surfaces.

| Case | Human genuine parked (X, Z), m | Original A3 alternate NavLink | Source-floor escape (X, Y, Z), m | Verified physical seven rejoins | GitHub Actions |
| --- | --- | --- | --- | --- | --- |
| B98 real KeyW baseline | (-0.172, 63.563) | `first-drop-positive-z-6` | (1.768, 7.600, 64.420) | **7/7 by native tick 1107** | [39722290224](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39722290224) |
| B99 real KeyA + KeyW `LEFT_SHORT` | (-0.273, 63.771) | `first-drop-positive-z-6` | (1.721, 7.600, 64.571) | **7/7 by native tick 1114** | [39722290273](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39722290273) |
| B100 real KeyD + KeyW `RIGHT_SHORT` | (-0.058, 63.962) | **`first-drop-positive-z-2`** | **(-2.172, 7.600, 64.524)** | **7/7 by native tick 1328** | [39723814249](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39723814249) |

Notable: the third actual human position causes A3 to choose an authentic **opposite-side original drop**, not the `-6` drop from the earlier two cases. This is evidence of physically executed, position-dependent native route selection in the *opt-in QA variant only*. The original first-drop link IDs and collision audit remain authoritative. The B100 workflow attached a native render screenshot and JSON evidence on SUCCESS.

## Authority and limits

- Exactly **25 original source solids**, **17 original paint surfaces**, **26 original navigation links**, **0 original scoreable promotions**. `activationReady=false` and unrestricted 4v4 certification **false**.
- Neither B98/B99/B100 Chrome trial proves all original stage navigation or unrestricted real 4v4; no automatic promotion to FIXED, SWEEP or production. Default CPU FIXED is unchanged.
- Existing 24/24 native-physics test suite and baseline B75 FIXED/SWEEP Chrome checks pass on the B99 baseline head; latest B100 code touches the CDP QA script plus separate workflow only. The latest B100 parallel FIXED/SWEEP job outcomes should be checked independently before further promotion.
- Real-keyboard release timing is frame-sensitive under software WebGL2. Some concurrent regression runs fail **fail-closed** with `B98_TRUE_W_KEYUP_OVERSHOT_BLOCKING_LIP` when CDP sees the player after the required lip position. This is **not** a successful blocked-route trial and is **not** evidence of a physics regression. Later runs must separately qualify keyup position, player standstill, observed alternate source link and real 7/7 Rapier rejoin.
- New B100 right-hand case is reproducibility evidence from **one successful right-side trial**; additional repeats/other placements are still needed before default-play adoption.

## Next QA gate (W10-B101)

Make real Chrome KeyW-release observation less susceptible to skipped render frames, **without changing source physics or synthesizing human motion**. Repeat the genuine left/right/baseline input variants, confirm the actual source-collision obstruction and lateral physical escape in multiple runs, and preserve original stage/production HOLD until that gate passes.
