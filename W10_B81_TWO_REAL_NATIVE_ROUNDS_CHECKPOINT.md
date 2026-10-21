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

Validation: Node checker regressions 9/9 PASS locally. TypeScript/Vite build
PASS locally. Exact-commit CI and two-round native result PENDING; no native
completion is claimed before inspecting the actual workflow result.
