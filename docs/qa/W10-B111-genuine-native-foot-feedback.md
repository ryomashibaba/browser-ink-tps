# W10-B111 — Bounded native-foot feedback / original-contact classification

Date: 2026-10-22 JST. QA branch: `dev/t21-f4e103w-qa-infra`.
Starting HEAD: `670694b593d6c889cd0d9524f6f9e0b56788f371`.

## Purpose / classification boundary

Reproduce the B105 actual original-source short A3 contact and safe **direct** physical recovery, if and only if genuine Chromium KeyD/KeyA/KeyW inputs settle the original human on the previously qualified source lane. If genuine contacts instead produce an original-link detour or no contact, retain the real B106 classification; **never call either direct B105 reproduction**. Candidate feet are not source-authored actor positions.

Existing source authority remains **25 source Rapier solids / 17 PaintSurfaces / 26 original NavLinks / 0 formally Scoreable promotions**. No original actor relocation, invented collider/NavLink, synthetic ticks, changes to normal FIXED CPU or production activation. Frozen main / Pages / PR #5 are out of scope.

## Actual QA implementation

- `scripts/t21-w10b111-feedback-native-contact.mjs` forks the existing native Chrome/CDP QA runner without changing gameplay runtime.
- Stage 1 samples genuine native human X/Z and applies at most one original keyboard KeyA correction (after original KeyD), conditioned on both the original approach-Z and observed lateral X with a finite fallback; there is no repeated left-right oscillation.
- Stage 2 samples native feet at a shorter interval before genuine KeyW-up and records predicted vs actual coast and settled position. The 0.355 m coast is a **prior from B110**, not a guaranteed physics rule, proof, or replacement coordinate.
- Only qualified settled original human feet permit expensive 7-CPU actual Rapier/Recast testing. The strict B110-derived gate is maintained: X in [-0.12,-0.01], Z in [63.89,64.135], appropriate source Y, spatial relation to the previously blocked A3 source foot, and >=0.13 m displacement from the B104 detour case.
- Actual original NavLink, native A3 KCC human-proximate rejects / reject ticks and real 7/7 physical rejoins are classified using the unchanged B106 classifier. A classified **detour** would be a valid observed outcome, not B105 direct recovery.
- Initial finite genuine KeyW-up thresholds: 64.46 and 64.50. No geometry/threshold relaxation.

## Verified CI evidence

Initial [Actions #39792194930](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39792194930): code syntax, 9/9 B106 classifier cases and original build **passed both jobs**.

| Native candidate | Outcome | Observed human foot (m) | CPU physics |
| --- | --- | --- | --- |
| Genuine KeyW gate 64.46 | **CALIBRATION_MISS** | X=-0.026324572, Y=8.394924164, Z=63.852622986 | Not entered |
| Genuine KeyW gate 64.50 | **INFRASTRUCTURE TIMEOUT** | No genuine input/foot result: Chrome CDP start timed out at 40 s | Not entered |

At Z=64.46, actual W-up observed Z=64.206726074 and final foot Z=63.852622986, i.e. ~0.3541 m of actual remaining motion. The final original Z missed the strict lower edge 63.89 by ~0.0374 m. Genuine KeyA correction observed 6 native ticks. A calibration miss is not a confirmed gameplay regression.

Because the 64.50 attempt never got past Chrome startup, the workflow was narrowed to **one controlled reattempt, without re-running 64.46**:
[Actions #39792781308](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39792781308) — state was **QUEUED** when this report was first authored. Its final result must be read from GitHub; do not assume PASS, FAIL, or actual contact.

## Decision rule

If the single 64.50 retry qualifies, inspect the genuine original KCC / NavLink / 7-CPU classification before claiming any success. If not qualified or Chrome still cannot run, mark direct B105 reproduction **HOLD** and return effort to F1–F5 playable game objectives instead of extending endless positional micro-calibration.

No B111 direct recovery, 7/7 physical success, source scoreable certification, or formal 4v4 completion has been established by the initial two CI jobs.

## Final bounded retry — confirmed (2026-10-22 JST)

[Actions #39792781308](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39792781308) completed **FAIL-CLOSED** after the single 64.50 genuine Chromium retry, not an infrastructure-only failure this time.

- Script syntax, original TypeScript/Vite build and existing B106 classifier **9/9 PASS**.
- Real CDP KeyD **6 observed native ticks**; KeyA **6 observed native ticks**.
- Original player stop body **X=-0.183939129, Y=8.395095825, Z=63.994564056**. Z satisfies the pre-existing candidate range [63.89,64.135], but X is **outside** [-0.12,-0.01] (0.06394m too far left).
- Accordingly **no 7CPU original A3 contact/rejoin test was run**, and no B105 direct-recovery reproduction was established. B111 ends **HOLD — FINITE CALIBRATION EXHAUSTED**. Do not loosen its gate, mutate the original KCC, or keep searching arbitrary centimeter timings.
- Return to F1–F5 playable development. Immediate W10-B112 priority is the previously reported human falling-through / floor-support issue, using actual original Rapier witnesses without fictitious floors. A suspicion from a diagnostic ray or downward velocity alone cannot certify a source geometry defect.

**B111 completed research status:** implementation/associated code and classifier checks PASS; real target positioning / B105 reproduction NOT CERTIFIED. Normal FIXED/default gameplay, source 25/17/26/0, Stage source auth, main, frozen PR #5 and public Pages unchanged.
