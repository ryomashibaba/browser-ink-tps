# W10-B57 — Three-leg real source PAINT RELAY

QA parent `c5d4c9958d860d251e5c61bde70140c194de2d73`. Intended on 2026-10-20 JST; evidence pending CI.

## Why gameplay rather than another counter
Prior B54/B56 real Chrome native WASD/mouse runs demonstrated actual source-foot outbound and return with multiple distinct human projectile ink changes. Original two challenges can complete after painting everything at the beginning; they do not require actively changing where and WHEN the player aims. B57 adds **PAINT RELAY** as a third optional non-scoring practice mode, retaining CLASSIC/SWITCHBACK as-is.

1. **Leg 1 — OUT + INK:** from the actual originally supported physical foot, move at least 1.8m away **and** make at least 60 genuinely newly owned Human projectile impact cells. Snapshot the cumulative actual ink counter at this stage transition.
2. **Leg 2 — RETURN + FRESH INK:** return to within 0.8m of that real starting source foot **and** make **60 additional, post-turn** actual owner changed cells. Only then snapshot return ink.
3. **Leg 3 — FINISH INK:** make **60 further, post-return** genuine human source projectile-owned cells while reaching at least 12m continuous originally grounded player travel. Overall min 180 genuinely changed cells, original 60 native sim-second time budget. No artificial wall, floor, bonus ink, fake scoreboard or route Actor.

Player HUD has visible leg indicator, per-leg true newly owned 0–60 ink bar, explicit next-goal text and page-session-only separate PAINT_RELAY best. Prior mode selection is a single button cycling CLASSIC / SWITCHBACK / PAINT_RELAY while idle or finished. No per-leg old cells count twice; bomb and CPU ownership cannot satisfy the goals. Failed/aborted/partial attempts cannot set a best.

CI required: real Chrome/WebGL2 physical keyboard and mouse, natural native input and owner changes, observed original-source foot route, THREE distinct native ink differences, actual complete with native Esc+Retry preserved record. Standalone Vitest synthetic frames are only algorithm tests; do not claim manual human play. Preserve passed B54 CLASSIC and B56 SWITCHBACK regressions and all source authority checks.

**Frozen:** 25 certified original solids /17 Paintable /26 NavLinks /0 Scoreable, 0/12 authentic native opposing team paths, FIXED CPU default, `activationReady=false`; original Actor/Banc instances, central connectivity, official Turf and owner Windows manual gameplay remain HOLD. No main / PR #5 / public Pages modification.

## Final CI results
Not verified at initial commit. Update only after all returned checks are examined, including failed runs.
