# Browser Ink TPS — W10-B37 pointer cancellation checkpoint

Date: 2026-10-19 JST
Branch: dev/t21-f4e103w-qa-infra
Base: `3a4024e63855765e1d33a78918706e9ca32f95fa` (B36)

## B36 verification before implementation

Remote QA branch matched the supplied B36 HEAD.
[B36 trusted-input CI](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39237624388) at `6cfbdd77cef1b9f65b60baf4ab120caee0910326` completed SUCCESS, including all build, trusted mouse/CPU lifecycle, pixel-diff and aligned fixed-vs-B35 comparison steps.
[B36 render lifecycle CI](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39237617100) at `40f9acdf82f26ebe56c05cdfded425a2baaf532d` completed SUCCESS.
These are implementation/workflow commits preceding the documentation-only B36 HEAD, not a new test run of that documentation SHA. No owner Windows or human play certification follows.

## Concrete bug and change

At the base revision, PlayerInput's canvas pointercancel handler only sets fire=false.
It leaves primaryPressedQueued, secondary and secondaryPressedQueued intact.
Consequently a cancelled press can still be consumed at the next fixed tick, and the right button can remain logically held without pointerup. This is a code-established cancellation defect; its natural occurrence/frequency on the owner's device is unmeasured.

B37 shares a pointer-state cleanup between full gameplay cleanup and pointercancel.
Cancellation now clears both held buttons and both pending pointer presses.
It preserves keyboard movement and queued keyboard actions when Pointer Lock is retained.
Completed pointerup taps retain the existing once-per-tick consumption behavior.
Blur, hidden document and pointer-lock release still clear all physical gameplay input.
No new CPU targets, camera behavior, collider, navigation, score or original asset data.

## Verification conditions

- New and existing PlayerInput tests cover cancellation, immediate recovery, completed short left/right taps, lock gating and full focus cleanup. Simulated event handlers, not real browser evidence.
- Existing trusted-input workflow now runs these input tests.
- Existing real Chrome WebGL2 smoke presses the mouse through browser-native CDP with actual Pointer Lock, then **injects an untrusted DOM pointercancel** before the next fixed tick and checks that no shot is emitted and held fire is released.
- The same Chrome run then checks a genuine completed quick-tap, aim, CPU hits/splat/respawn and native render pixel evidence.
- Chrome cancellation coverage proves the application's response to an injected cancel; it does **not** prove Chrome/Windows/OS naturally issued one. Both button states and queues are covered by unit tests; the browser cancellation probe checks primary fire only.
- Initial implementation checkpoint intentionally marked all B37 results PENDING. The completed results below supersede that pending status for the exact implementation SHA.

## Frozen authority and scope

Normal play retains B35-and-earlier proven fixed patrol; B31/B33/B34/B35 remain optional experiments.
Original certified physical solids **25**, paintable surfaces **17**, NavLinks **26**, official scoreable surfaces **0**; opposing-team native routes **0/12**; `activationReady=false`.
Static optical meshes receive no physics/nav/score promotion. Banc/SetActor placement evidence remains HOLD.
This change edits shared input code on the QA branch only: frozen branches/checkpoints are not rewritten.
No main, T19C/T20 branch, Draft PR #5, hosted production, owner Windows originals or private source-data change.
GitHub connector edits and existing CI are used; no local repository checkout, Work handoff, local game execution or private-data inspection.

## Unverified

Owner Windows/RTX behavior and performance, natural OS pointer cancellation, human-perceived gameplay quality, authentic actor placement, connected natural 4v4 and official Turf outcomes remain unverified or HOLD.

## Completed CI evidence

Implementation and all five workflows tested **`f6b6a6218b651751e6cf92bf709087d53c7818a1`**. This final result update changes documentation only; it is not a claim that CI executed on the later documentation commit.

| Workflow | Result | Evidence |
| --- | --- | --- |
| Trusted mouse input / B37 / CPU lifecycle | SUCCESS, no skipped steps | [39238944312](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39238944312) |
| Actual Chrome CPU render lifecycle | SUCCESS | [39238944311](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39238944311) |
| Frozen source render A-B-A | SUCCESS | [39238944241](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39238944241) |
| Full original public-source visual integration | SUCCESS | [39238944333](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39238944333) |
| QA launcher and physical regressions, Ubuntu + Windows hosted runners | SUCCESS on both jobs | [39238944229](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39238944229) |

The QA launcher matrix skips the PowerShell parser on Ubuntu and the offline missing-project smoke on Windows, as configured. Those skipped steps are not PASS on those platforms. Hosted windows-latest is not the owner's Windows PC.

Trusted-input job log confirms:
- TypeScript + browser bundle build succeeded.
- PlayerInput suite: **12 tests passed** (simulated event delivery).
- Chrome WebGL2: genuine pointer-locked press followed by **untrusted injected DOM cancel**; shots **0 before / 0 after**, held fire **false**, Pointer Lock retained, source authority **25/17/26/0**, activationReady **false**.
- Artifact `w10b37-pointer-cancel.json` records `naturalOsCancelTested:false`; no OS-generated-cancel certification.
- Genuine completed quick tap accepted by the next physics tick after the cancelled press; trusted aim and actual projectile CPU splat/respawn continued successfully.
- Identical-camera CPU respawn image comparison: **9,042 changed pixels**, **8,967 magenta-pixel gain**; isolated QA placements are explicitly declared by that existing test. This is not natural enemy encounter proof.
- Existing aligned baseline: tick **1800–2880**, changed ink **1,407**, accepted original-paint shots **21**, physical patrol **498.423m**, stationary grounded samples **78**. Optional B35 remains **1,124 / 16 / 493.495m / 401**, with **511** duplicate requests suppressed. The existing comparison workflow succeeded as a research regression; **B35 gameplay quality remains rejected for default activation**.

Code review of the complete base-to-implementation diff found only input cleanup, input tests, the existing browser witness/workflow and this checkpoint. No CPU, source geometry, NavLink, paint authority, score, assets, production workflow or main/PR ref was modified.
Protected refs checked before implementation: main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`; PR #5 head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`, open/draft/unmerged. Final read-only verification confirmed these exact states unchanged.
