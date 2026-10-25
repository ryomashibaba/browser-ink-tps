# W10-B175 — Restore real 180s CPU sweep evidence and reject frontloaded ink

**2026-10-25 JST** · baseline `6fbcf848f4b7c27e93825f6c6a35de90daf379e5`, original-only QA branch.

## Root-cause triage from actual CI, not simulated play
B174 full native run [#40155592602](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40155592602) **FAILED** at the first 20-second source telemetry checkpoint: `ReferenceError: elapsed is not defined` inside genuine Chrome driver. The 4 pure B174 Node tests, TypeScript and Vite build passed; native 180-second CPU/ink behavior was **NOT measured** because the test stopped early. Do not report a failed native CPU performance result from this CI. The script already had the actual measured numeric value `row.elapsedMatchSeconds`; B175 now uses that directly.

## Actual implementation
- Bind all B174 measurement times to the native measured 20-second progress row rather than a nonexistent variable.
- At the real source boot, assert CPU ownership-shot map has **seven** actors, actual accepted shots and original changed ink counters are integers, and original B64 SWEEP is truly active. Fail before expensive 180s WebGL2 if any input is missing.
- At every real 20s checkpoint, write `w10b174-native-source-progress.json` incrementally, retaining original stage authority and actual seven-actor shots/paint/rejoins. If the simulation fails later, GitHub Actions artifact upload can now preserve the earlier real evidence instead of dropping the entire test with no artifact.
- Additional B175 condition to substantiate the actual `180s` gameplay rather than a brief burst: compare true source changed cells at first recorded >=60s and >=120s. Require **more than the historical B172 FIXED 18 newly changed source cells** during that interval as a nonofficial source QA objective. This is *not* an official score metric nor a same-SHA FIXED/SWEEP A/B; report historical comparison clearly. No synthetic ink, shots, times, hardware performance, route or actors.
- Two new focused Node regression tests for actual driver fields and late-60-to-120 ink stall; no new CI runner, existing B59 runs native 180s with the genuine CDP user and all seven original CPU.

## Scope/efficiency
B172 same-runtime 180s real 7-CPU/human input SUCCESS [#40153888854](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40153888854): actual 126 player shots, 1018 player changes, 112 CPU shots, 3615 CPU changes and all seven CPU rejoined. B64 earlier authenticated source SWEEP had 434 shots and 11417 cells in 120s vs FIXED 106 and 3615, but exact B174 180s is yet to be verified. B175 is a one-group error fix and release gate, not another cosmetic project. Next goal after actual 180s is stage-source-backed natural opponent contact, depending on source evidence. Preserve 25 solids, 17 paint, 26 original links, 0 Scoreable and 0/12 opponent native crossing.

**Never** modify main/Pages/T19C/T20/PR #5. activationReady=false, productionAuthorized=false, unrestricted4v4Certified=false. Unrestricted original Turf War remains HOLD.
