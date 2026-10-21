# W10-B78 — authenticated F3L original UV → flat → UV screenshot QA repair

2026-10-21 JST. QA branch parent `6e803201856a7fd9a37815fce3b8ff984d6dd80d`. No owner original Banc, source geometry, gameplay, main, release Pages or Draft PR #5 change.

## Actual original F3L screenshot forensics
The B77 same-SHA [full original-source WebGL2 run 39550640305](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39550640305) FAILED specifically on the historic **strict PNG SHA equality** checker after an actual real browser UV→flat→UV switch. Downloaded original WebGL2 screenshot artifact `12323387477` and numerically compared the RGB pixels:

- Original textured UV A vs restored UV A2: **258 / 1,440,000 pixels differ (0.0179167%)**, maximum RGB channel difference **1**, strong (>=8) channel difference **0**, bbox x=1301..1563, y=396..410.
- Original textured UV A vs intentionally different flat B: **1,079,334 / 1,440,000 pixels differ (74.95375%)**, maximum RGB channel difference **187**, strong-difference pixels **849,479**.
- This is the same localization and micro-quantization seen in the other original source B28 A/B/A [failure artifact], now resolved by B77 [actual Chrome pass 39550640308](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39550640308).

## Implemented B78
Reuse B77's **strict, genuine decoded RGB A/B/A** checker for this second F3L exact original UV↔flat↔UV presentation, rather than checking compressed PNG SHA. The shared helper requires A/A2 difference <=1/255 for every RGB channel, and <=0.04% altered pixels, and also an actual B change of >=0.5% pixels, >=0.2% significantly changed pixels, and maximum >=16; it rejects visible source visual regressions rather than hiding them. Preserve all original frozen native 25/17/26/0 geometry gates, verified source UV original triangle count 57578, 8+ verified textures, 10+ original material groups, no original actor transforms, source-only camera input and no gameplay score/AI change.

## CI
The `T21 F3G pinned full original Temple01 visual integration` workflow automatically reruns because its original native WebGL2 smoke script changed. Do not claim a new full-source result until this **B78 exact-SHA** run succeeds. B76's human-source-ink gameplay HUD still has a separate FIXED/SWEEP live-Chrome QA workflow. Both still demand real Chrome not synthetic GPU image generation.

No original opponent topology change, no real original 4v4, and no main/PR/published changes.
