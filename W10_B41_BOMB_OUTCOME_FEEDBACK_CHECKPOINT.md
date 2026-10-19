# Browser Ink TPS — W10-B41 source-only bomb feedback checkpoint

**Code checkpoint (not yet CI-verified)**; base QA HEAD `10cfafb92f04ea9d7be4465549f3be6d89659cba`.

## Change
Only after genuine Human SubWeaponSystem explosion and same 60Hz-tick PaintCoordinator/GamePlayInkSystem post-raster result, distinguish `NEW_CELLS`, `STAMP_ZERO_CHANGE`, `NO_CERTIFIED_STAMP` and `MULTIPLE_UNRESOLVED`. A no-stamp event is **not** a verified physics miss. When new ownership is zero, player receives neutral, short-lived source-practice feedback instead of a misleading success claim. B25 shooting practice remains completely separate. Tests cover three outcomes and multi-blast ambiguity, and real Chrome B40 three-throw checks assert attribution.

This checkpoint cannot prove varied map locations or GUI readability on owner hardware. CI must be inspected before claiming PASS.

Unchanged: original 25 solids / 17 Paintable / 26 NavLink / 0 Scoreable; local cross-team FootPath 0/12; `activationReady=false`; standard FIXED CPU; main, T19C/T20, PR#5, Pages, Windows original and private Banc data untouched.

## Verification complete — 2026-10-19 JST
**B41 implemented and verified code SHA:** `9f81775192124fbe7f8b0e65ccbece454ebbdda0` (the final documentation HEAD is a separate commit).

The B41-modified source ink Vitest suite: **9/9 PASS**. Existing pointercancel 12/12, HUD 4/4, CPU goal tests 11/11 PASS. TypeScript/Vite real PlayCanvas browser build PASS; CDP JavaScript syntax PASS.

**Native Chrome/WebGL2 actual KeyF explosion source-ink evidence on the verified SHA:**

| Real trial | Source paint stamps | Zero-change stamps | Newly changed GameplayInk ownership cells | B41 result |
|---|---:|---:|---:|---|
| First actual source-local throw | 9 | 0 | **830** | `NEW_CELLS` |
| Repeat same camera aim after natural ink refill | 9 | 9 | **0** | `STAMP_ZERO_CHANGE` |
| Real pointer-locked mouse pitch +14.4 degrees | 9 | 2 | **546** | `NEW_CELLS` |

Three accepted real human throws, three native explosions; 144 fixed physics ticks after each. The B41 UI neutral outcome is based on post-raster ownership truth, not a guessed physics miss. These are controlled **single local-point** observations; no near/far/wall/edge map-wide certification.

**All six GitHub Actions checks SUCCESS** for `9f81775192124fbe7f8b0e65ccbece454ebbdda0`:
1. [Trusted Chrome mouse, bomb ink and fixed-vs-experimental CPU](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39262148254)
2. [Actual Chrome 7 CPU render/respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39262148123)
3. [Original static Temple01 full-source visual integration](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39262148143)
4. [Original render A-B-A](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39262148336)
5. [Windows/Ubuntu isolated QA launcher](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39262148226), two jobs SUCCESS.

**Status: W10-B41 implementation + authoritative Chrome validation PASS**. Owner OMEN RTX FPS, unassisted actual user playfeel, physical wall/edge contact origins, natural 4v4 and original Banc/SetActor remain explicitly **UNKNOWN/HOLD**. The six hosted checks do not establish those facts. QA-only, no main/PR5/Pages/Windows original mutations.
