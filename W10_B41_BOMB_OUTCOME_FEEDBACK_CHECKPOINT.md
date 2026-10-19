# Browser Ink TPS — W10-B41 source-only bomb feedback checkpoint

**Code checkpoint (not yet CI-verified)**; base QA HEAD `10cfafb92f04ea9d7be4465549f3be6d89659cba`.

## Change
Only after genuine Human SubWeaponSystem explosion and same 60Hz-tick PaintCoordinator/GamePlayInkSystem post-raster result, distinguish `NEW_CELLS`, `STAMP_ZERO_CHANGE`, `NO_CERTIFIED_STAMP` and `MULTIPLE_UNRESOLVED`. A no-stamp event is **not** a verified physics miss. When new ownership is zero, player receives neutral, short-lived source-practice feedback instead of a misleading success claim. B25 shooting practice remains completely separate. Tests cover three outcomes and multi-blast ambiguity, and real Chrome B40 three-throw checks assert attribution.

This checkpoint cannot prove varied map locations or GUI readability on owner hardware. CI must be inspected before claiming PASS.

Unchanged: original 25 solids / 17 Paintable / 26 NavLink / 0 Scoreable; local cross-team FootPath 0/12; `activationReady=false`; standard FIXED CPU; main, T19C/T20, PR#5, Pages, Windows original and private Banc data untouched.
