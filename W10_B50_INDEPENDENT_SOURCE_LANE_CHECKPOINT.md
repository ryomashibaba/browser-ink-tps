# Browser Ink TPS — W10-B50 independent real Chrome B35 source-lane stability

**Initial implementation; CI not yet checked.** QA base `2c22907b63fae0f6203dd26bdfa8575d9d97eec4`.

## Why
B45 first Chrome attempt measured only ~1.49m original-source A3 lateral separation vs **1.6m** accepted limit despite S retreat >1.5m. Same SHA retry passed, and B46–B49 subsequent runs passed. Causes of variation in real SwiftShader rendering / actual native key-hold ticks / initial foot position are unverified. Do NOT lower thresholds, change player KCC, alter original source geometry or claim already fixed.

## New bounded isolated test
Separate QA-only GitHub Actions workflow runs **three independent fresh Chrome processes on three separate Ubuntu GitHub matrix jobs**, all on one exact SHA with source autonomy and default **FIXED** CPU. The existing script's focused `T21_W10B50_LANE_ONLY=1` branch is only allowed in original source W10B16 mode with B35 native sparse refresh disabled and blocked-human mode disabled. It uses the same original browser boot, trusted pointer-lock input, W held >=25 native physics ticks, real mouse shot observed for >=30 native ticks, S held >=38 native ticks, and original A3 source lane comparison. It stops before expensive 1080-tick comparative CPU research loop.

Each *individual fresh process* writes `w10b50-independent-native-lane.json` with actual observed W/S physics ticks, S key wall-clock hold, original actual foot coordinates at each genuine input phase, authentic human shot delta, original lane separation/retreat and signed margins vs **unchanged 1.5m/1.6m gates**. Evidence is written **before rejecting** a genuine subthreshold sample; failures are preserved as failed CI, not silently suppressed. A single PASS or 3/3 PASS would show only a bounded cross-job same-SHA observation, not a universal proof or actor placement certification.

## Protected
Source physical 25 / Paintable 17 / NavLink 26 / Scoreable 0, original opposing paths 0/12, activationReady=false, default FIXED patrol, Draft PR #5 and main, frozen T20 and Pages and local Windows originals unchanged. Never promote degraded B35 sparse-goal research CPU variant or infer official Nintendo collision equivalence. After genuine repeated gate evidence, prioritize actual original source topology/actor evidence and player-visible quality over additional micro-heuristic loops.

## Observations
Pending actual 3 separate GitHub runner measurements and related unaffected Chrome regressions.
