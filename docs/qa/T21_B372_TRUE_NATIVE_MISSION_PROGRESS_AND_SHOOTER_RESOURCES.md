# B372 — truthful original-source mission completion and native shooter readiness

Date: 2026-10-31 JST. Branch `dev/t21-f4e103w-qa-infra`. Source-preserving F3 playable HUD batch.

## Evidence-led reason

The predecessor B371 was **independently proven** in genuine Chromium [B343 CI #41179953155](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41179953155): SUCCESS, genuine B366 same-session original first-drop/raised-ramp/impact-ink local clear, 10 physical accepted human shots, 90 human changed original-source ink cells, 11.7439m grounded travel, 7 genuine CPU actors, no enemy-route claim (0/12) and official winner NONE.

B371's display, however, labelled an *incomplete* `PAINT_ON_RAISED` stage `3/3`, and did not distinguish true low player ink from physical projectile pool saturation. The B372 player-facing improvement corrects both without changing game physics.

## Actual implementation

- `src/app/B371RealSourceMissionCue.ts`: completed-step count `0/3` (pre-drop), `1/3` (real lower landing), `2/3` (original raised-floor arrival, real ink incomplete), `3/3` **only after native B186 `REAL_LOCAL_CIRCUIT_CLEAR`**. The cue remains the same existing B183 mission card, not a new overlay.
- `src/app/UndertowF3PlayablePreviewApp.ts`: feed real `PerformanceStats.playerInk`, actual user-selected shooter ink cost, B343 native pool size/free slots/rejected volleys and real ink-dry-fire attempts. Pure read-only data presentation: `LOW_INK` (ink units below shooter shot cost), `PHYSICAL_POOL_FULL` (zero free native projectile slots) and `INK_AND_SLOT_AVAILABLE` (only ink + a free slot are present; **no guarantee of instant fire due to other gameplay cooldowns**). No fake ink, projectile, damage, stage writes or game authorization.
- `src/app/UndertowF3PlayableHud.test.ts`: positive progress and negative source/provenance and resource-count cases.
- `src/projectile/B343OriginalSourceVolleyBudget.test.ts`: verify the player cue agrees with B343's genuine physical projectile capacity.
- `scripts/t21-b343-real-source-volley-round.mjs`: existing genuine-Chromium source-play test now checks 0/3 at initial source spawn, 2/3 at **true original ramp KCC** before fresh paint, and 3/3 after native physical ink completion; also checks the source-only actual projectile-resource cue. No new test runner or isolated pretend actor.

## Gate / observed CI state

- First B372 SHA [#41180673437](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41180673437) **FAILED** in the old B371 starting-step test (expected 1/3 but truthful count is 0/3). Earlier intermediate commits also had TS optional-fixture errors, subsequently corrected.
- Corrected assertions and type-safety were committed; existing full B343 CI for **`d582b0d47b82932979b5d6f659a5cca12db7d68a`** is [#41180736237](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41180736237). Verify its final job result, actual script verdict and image/JSON before declaring B372 full PASS. No unfinished/queued test is a PASS.
- Successful source shader build/unit tests do not independently establish F5 visual quality or the original game's full 4v4.

## Immutable policy and next gameplay work

Actual registered SOURCE boundary remains **25 Rapier solids / 17 PaintSurface / 26 source NavLinks / 0 Scoreable**; original opposing routes **0/12**. `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`. No artificial floor, warp, actor, opponent encounter, path, scoring or formal win. No changes to main, frozen T19C/T20, Draft PR #5, published Pages or private original OBJ.

After native B372 acceptance, return to **playable vertical slice and actual human experience**: combine physical shooter/paint, 7 true CPU, HP/splat/respawn and controllable original walking in a coherent unscored round; source-authentic cross-team encounter remains HOLD until genuine navigation and original authority exist. Prefer single coherent gameplay feature and reused CI over proliferating small QA steps.
