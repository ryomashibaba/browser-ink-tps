# W10-B114 — Real original Rapier 5-ray source-foot witness

Date: 2026-10-22 JST. QA branch: `dev/t21-f4e103w-qa-infra`.

## B113 prior work and acceptance boundary

- B112 actual Chrome walk [#39795029151](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39795029151) **PASS** (9.516901m real human KeyW motion in 120 native ticks; 0 observed fall suspicions in one narrow upper-source sector).
- B113 user-triggered local JSON capture was implemented and typed export/snapshot guards added. Corrected validation run [#39798202896](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39798202896) had NOT finished when this commit was authored. Its browser-download PASS is **NOT VERIFIED**. If the queued job finishes, use its actual conclusion and logs, not predictions.

## Evidence problem addressed

The first B112 monitor sampled original Rapier stage under the **capsule centerline** alone. Near an original ledge, the human or squid collision capsule can project over an original source floor from one side while the center ray misses; a center-ray void can therefore be a **false impression of a floor hole**. A genuine KCC contact result is distinct from any ray result, and neither alone proves that a new collider is justified.

## Implementation

- New `src/app/W10B114OriginalFootprintAudit.ts` computes five observed original-source ray probes at **CENTER, FRONT, BACK, LEFT, RIGHT**, with the existing `RapierStagePhysics.castCharacterFootSupport` (unchanged). Off-center samples use 80% of the *actual configured* Rapier HUMAN or SQUID capsule radius; source ray behavior still honors human/grate and squid/grate rules. Only enabled on existing explicit `?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround` QA route.
- An **edge-only** genuine original-source support ray can be distinguished from **center+edge**, **center-only**, and **no-near-original-source-ray**. Never equate a ray absence to proven wrong geometry. Existing B112 60Hz KCC ground state remains separate.
- Attach the actual measured original-ray footprint to each bounded B112 real native foot sample. It is preserved with a pre-fall suspicion, including across a real respawn, so the already existing B113 one-click JSON export includes a view of **which original solid ID** did or did not support the falling actor's physical footprint.
- Pure Vitest regressions enforce five probes, radius/projection behavior, edge-only/no-rays, far-below-surface not miscounted as near, invalid casts, and no score/geometry/certification promotion. B112 ledger tests enforce bounded read-only provenance.
- The existing shared B112/B113 native Chrome workflow also checks the B114 footprint exists with **five measured native source rays** and retains a snapshot. Browser/CDP input remains real, not `qaDriveTicks`; no new long 180-second job or fake cross-team routing added.

## Preservation, scope, and acceptance

**Frozen source 25/17/26/0; 60Hz Rapier player; 7 genuine CPU physical agents; FIXED default; scoreable and source actor promotion forbidden; natural enemy cross-routes 0/12; main/Pages/Draft PR #5 untouched.** The geometry is not changed. All B114 results are QA-only *read-only rays* and do not prove the specific historical central-path fall reproduction.

B114 is not COMPLETE until the commit's Vitest/TypeScript/Vite build and actual original-stage Chrome path have run and returned PASS, including truthful B113 manual download. For real-map fixes, first reproduce the actual user's cited area with original collision-triangle/support evidence and source registration; never add guessed bridging floors.

## Original Chrome verified result (B114 exact-source commit `48a005d2b213cb21764d8bee88dfa695fac3e08d`)
- [Workflow #39799477744](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39799477744), job `119895758491`: **all recorded steps SUCCESS**; workflow overall status was still `in_progress` when last fetched. Do not claim the workflow's final `conclusion` until that field changes.
- Tests: **4 test files / 15 Vitest tests PASS**, Vite build PASS.
- Actual Chromium held KeyW drove native original PlayerController for **121 native ticks**, genuine horizontal movement **9.603549m**. Final body approximately `[-0.173460,8.395000,58.291039]`.
- **5 real original Rapier probes** at tick **127**, `CENTER_AND_EDGE_SOURCE_RAYS`, original ID `UndertowT21D:spawn-high-positive-z`. Not a KCC contact certificate.
- Real CDP Esc + UI-button mouse and valid downloaded B113 source JSON at tick 169; original authority **25/17/26/0**, suspicious fall count **0**.
- **No actual central-road or own-home sector floor failure reproduced**. No approved collision/geometry patch.
