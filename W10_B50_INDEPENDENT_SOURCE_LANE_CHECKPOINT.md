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

## Verified W10-B50 — 2026-10-20 JST

**Tested code SHA: `c59173b88b9aab1c09eca42ca3d45c6b6aa5f5b3`.** The dedicated GitHub Actions [independent source-lane matrix](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39347917640) ran **three independent fresh source-only PlayCanvas/Chromium/WebGL2 environments** at exactly this same revision; every job built the real browser, used trusted CDP keyboard and actual mouse shot, independently recorded coordinates, wrote the evidence JSON, and completed **SUCCESS**. Evidence artifact per trial saved under `w10b50-source-lane-trial-1`, `-2`, `-3`.

| Source-only real native metric | Trial 1 | Trial 2 | Trial 3 |
|---|---:|---:|---:|
| Real W held physics ticks | 30 | 30 | 30 |
| Real S held physics ticks | 42 | 42 | 42 |
| Observed S key elapsed wall ms | **4,042** | **3,382** | **4,952** |
| True retreat meters | **3.156951909** | **3.156951909** | **3.156951909** |
| True original A3 lane separation meters | **1.712617990** | **1.712617990** | **1.712617990** |
| Retreat margin over 1.5m | **+1.656951909** | **+1.656951909** | **+1.656951909** |
| Separation margin over 1.6m | **+0.112617990** | **+0.112617990** | **+0.112617990** |
| Verifiable actual result | **PASS** | **PASS** | **PASS** |

Each trial started W from player original source foot **(0.016930774, 8.395071983, 67.892700195)** at tick **45**. After real W: foot **(0.017398810, 8.395095825, 65.772949219)** at tick **75**. Prior to S: foot **(0.017257592, 8.395099640, 65.419197083)** at ticks **144/143/142**, respectively. After real S: foot **(0.017115042, 8.395000458, 68.576148987)** at ticks **186/185/184**, respectively. All three precise native feet at the final observation match despite 1.57 seconds of variation in the host wall clock. Source physical 25 / Paintable 17 / native NavLinks 26 / scored surfaces 0 preserved. Original thresholds untouched.

### Comparison with actual previous failure, not memory or a guess

Read **original B45 GitHub Actions first attempt job ID 118320312124** in [B45 workflow run 39328474479](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39328474479). It actually failed `REAL_PLAYER_STILL_BLOCKS_SOURCE_CPU_LANE`, emitting **retreat=2.897263290m, lane separation=1.489856455m, physics tick=181**, source foot **(0.017134788, 8.397133827, 68.316459656)**. This is below original 1.6m by **−0.110143545m**. The three B50 successes instead exited at ticks **184..186** with **Z=68.576148987**. The historical failure foot Z differs from B50 success by approximately **0.259689331m**. Because the original S-release code waits for **at least** 38 physics ticks but observes asynchronously in Chrome's software-rendered callback, its release checkpoint can land on different actual ticks. This is an **evidence-supported plausible timing/sampling hypothesis**, not yet a controlled causal proof. Do not claim a CPU navigation fix or refute the historic failure.

This comparison reveals that changing the acceptance threshold, altering Rapier KCC, or retuning CPU goal-refresh is *not* justified. Next **W10-B51** should, if pursued, separately measure and qualify exact requested/observed source-key hold tick boundaries (38 vs 42) without changing game physics or quietly weakening the fail gate; then direct development attention back to the original source's missing actor geometry/central natural route certification.

### Existing regressions also green on verified B50 code SHA

All **7 GitHub check runs completed SUCCESS** on `c59173b88b9aab1c09eca42ca3d45c6b6aa5f5b3`:
- [3 independent B50 lane trials](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39347917640) — 3/3 independent jobs SUCCESS.
- [Existing full native Chrome B39–B49 original trusted input and fixed/experimental CPU comparison](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39347917515) — SUCCESS.
- [Original pinned full-source visual](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39347917493) — SUCCESS.
- [Original frozen source A-B-A render](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39347917453) — SUCCESS.
- [Existing actual Chrome 7-CPU lifecycle/render](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39347917486) — SUCCESS.

**B50 PASS is bounded to 3 separately booted, same-SHA source-only actual Chrome trials and original regression suite**; it does NOT prove perfect universal determinism, and there is still an actual earlier failing run on record. Protected main, Draft PR #5, frozen T20 and Pages remain untouched. Owner local RTX/Windows and original Nintendo-game source collision authority not tested; original scoreable 0 and natural cross-team path 0/12 remain HOLD.
