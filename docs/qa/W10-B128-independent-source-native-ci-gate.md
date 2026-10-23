# W10-B128 — Independent true Chromium source-route CI, no evidence masking

Date 2026-10-23 JST. QA branch `dev/t21-f4e103w-qa-infra`.

## Actual B127 outcome at the prior source SHA

At `cbc55b2f0eeed6f9f1f0762f82aba3ef6b9d0ba3`,
[Actions #39940891148](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39940891148) failed in the **B125 genuine CDP replay step**, before B126 or B127 actually executed. This is a *physical original registered floor edge observation*, not a parser or build error.

A genuine Team A original raised floor KCC endpoint was [7.455799102783203, 5.394876956939697, 39.35778045654297] with original polygon edge distance **0.642861132072824m**. Stage endpoint threshold remains **0.65m**; the last B125 W24 stage was **HOLD** despite KCC grounded/inside source. All new B127 corridor phases in that failed CI were **NOT RUN**. The same SHA passed original source static tests, 7/7 files with 29 Vitest cases, 9 Node tests and Vite build.

Other standalone historic B121 and B119 runs on that SHA also FAILED in their specific original source bounds; B120, B122, B123, B124 and B112 source runs passed within their own limited scope. Do not merge these into a claimed end-to-end 4v4 pass. Differences from earlier B126 PASS show variability in true native input ticks and trajectory; do not relabel a 0.643m edge as safe or fabricate a floor.

## New B128 CI reliability milestone

The combined original-corridor workflow now runs **all three independent real Chromium/CDP source trials**, even if a previous trial fails. Each trial retains unchanged strict original source KCC/source-edge support, actual tick conditions, original source authority and no teleport. Use per-step `continue-on-error: true` ONLY to permit remaining trials to execute; **an explicit final gate checks all three original outcomes** and exits failure if any is failed or skipped.

- Every real trial gets separately uploaded failure/PASS JSON and screenshot via `if: always()`.
- CI summary explicitly states B125, B126 and B127 outcomes. Neither zero nor partial success counts as aggregate PASS.
- Modifies **only the already existing source-native Actions workflow**, plus this report; never creates more workflows and never changes the physical game or 25/17/26/0 source geometry.
- Because no shared native runner edits are needed, avoid retriggering historical B112–B124 workflows unnecessarily.

## Remaining HOLD

No full native B127 PASS was yet demonstrated at the previous source SHA. Outcome of this newly isolated workflow must be verified from Actions on its **exact SHA and preserved artifacts**. Frozen 25 original solids, 17 PaintSurface, 26 NavLinks, 0 Scoreable, 0/12 cross-team routes, local passive proxy CPU/HUMAN avoidance uncertainty, official unrestricted 4v4 all remain unchanged and HOLD. F1/F2/F3 playable match integration remains the priority over repeating tiny step-length tuning.
