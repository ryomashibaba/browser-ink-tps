# W10-B81 — complete B70/B72 same-tab FIXED → SWEEP comparison

2026-10-21 JST. Parent B80 `18d9afe3224e58ec06de2567b3f1cc5a09a6f5f4`.
QA branch only: `dev/t21-f4e103w-qa-infra`. Work switching unused.

B70/B72 verified one genuine FIXED 180s round, explicit save and reload
into SWEEP STAGING. They did not verify the second full round and final
comparison in the same browser test. B81 adds an isolated two-round real
Chromium/WebGL2/PlayCanvas/Rapier/Recast workflow to close that gap.

The runner completes FIXED in the ordinary preview, physically clicks SAVE,
checks the stored record against production B70 capture of actual native
counters, completes SWEEP in the same tab, verifies it was not automatically
saved, physically clicks SAVE again, and checks the visible comparison
numbers and input-difference notice against both captured native rounds.
It also checks refresh is idempotent and explicit clear removes the record.
The production B70 model is reused directly under Node24; schema validation
is not independently reimplemented. Negative tests reject stale counters,
schema confusion, private extra fields and incorrect/hidden comparison text.

B80's read-only diagnostic classifier watches both full sessions with a
90-wall-second no-tick limit, 20s heartbeat and always-retained numeric
progress artifact. No synthetic ticks, clock acceleration, fabricated paint,
actor relocation, forced resume or mid-session aim change is used. The host
budget is 62 minutes per round because software rendering is slow; the job
allows 135 minutes for both rounds. This is not a Windows hardware GPU test.

Only B81 scripts, its workflow and this checkpoint are changed. Gameplay
implementation remains B80 pending evidence of an actual product defect.
Main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`, Draft PR #5 head
`8cfc95756ef0b56e2c33dc9f89a9041126daa272`, published Pages and frozen
T19C/T20 must remain untouched. Authority HOLD: 25 solids / 17 Paintable /
26 NavLinks / 0 Scoreable; eight Actor bindings unresolved; 0/12 natural
opponent paths; activationReady=false. Default FIXED, SWEEP experimental.

## Verified result

[B81 run 39572819950](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39572819950)
completed SUCCESS, 2/2 jobs, on code commit
`581bcac00ee5f8c3df4f7dfb7fa83d82c0816263`. Build, related Vitest 14/14,
and Node checker/diagnostic regressions 9/9 PASS both locally and in CI.
The following documentation-only result commit does not change tested code.

| Actual native measurement | FIXED | SWEEP |
| --- | ---: | ---: |
| Native match seconds | 180 | 180 |
| Native terminal tick | 11,859 | 11,860 |
| Actual CPU source shots | 112 | 491 |
| CPU impact changed source cells | 3,615 | 11,779 |
| Original-foot patrol meters | 4,951.4 | 4,951.4 |
| Distinct physical CPU rejoins | 7 | 7 |
| Suspected physical stalls | 0 | 0 |
| Human shots | 8 | 8 |
| Human changed source cells | 294 | 301 |
| Host callback p95, ms (not GPU latency) | 1,091.6 | 1,091.8 |

FIXED took 2,085,337 wall ms and SWEEP 2,076,964 wall ms after their early
human input. Both reached TIME_UP with remaining clock zero, no stop reason
and genuine native physics; no 90-second tick stall occurred. The whole
browser job took about 71 minutes using software rendering.

The same tab retained the exact FIXED record after the first actual save
click and SWEEP reload. SWEEP was not saved until the second actual click.
The final visible UI reported TWO_REAL_COMPLETED_ROUNDS, matched both actual
records, displayed the 3.258x source-ink ratio (+8,164 changed cells), and
correctly warned HUMAN INPUT DIFFERED (294 vs 301 human cells). This is not
a controlled game-quality benchmark, official Turf score or AI-strength
result. Explicit refresh was idempotent; explicit clear removed storage
and hid the comparison. No product defect requiring a gameplay change was
observed within this test.

[Retained screenshots and anonymous native progress/comparison artifacts](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39572819950/artifacts/12336577478)
have 14-day retention. B79's earlier intermittent freeze was not reproduced
here; its original cause is still unresolved. Owner Windows hardware GPU
performance, original Actor8 bindings, natural opposing paths and formal
score/4v4 remain unverified. All original authority HOLDs above are retained.
