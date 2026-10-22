# W10-B102 — Original Rapier KCC contact-gated A3 detour

**Date:** 2026-10-22 JST  
**Status:** Baseline/left real-human-contact **PASS**; genuine right-side blocked-lane proof **HOLD**. Research-only QA, not a production or unrestricted-4v4 authorization.

## What changed

- [`a027620`](https://github.com/ryomashibaba/browser-ink-tps/commit/a0276209608f1fdb0eb97fc7388ff064ea9d2b6f) — restored the genuine B100 KeyD-before-KeyW-release chronology for right-lane research, removed the B101 KeyA post-correction that had moved the player into a non-obstructing lane; source-only `t21W10B102=contactProbe` URL opt-in.
- [`2b2f6cd`](https://github.com/ryomashibaba/browser-ink-tps/commit/2b2f6cda0b01c68727ff5371d0b15a240f812fdc) — attached a **read-only wrapper** around `UndertowPhase14QSharedActorCollision.auditGroundStep` for actor A3 only, opt-in to `t21QaDrive=source`, `t21W10B93=upperDetour`, and `t21W10B102=contactProbe`. The wrapper calls the original audit and **returns the unmodified result**; it never approves blocked movement, changes pose, changes NavMesh or touches source geometry. Snapshot captures A3 native audit count, rejected step count, Rapier collision owner IDs, real A3 foot and actual human foot, and first 12 contact candidates when the real native dynamic-collider rejection occurs horizontally within 1.2 m of the human.
- [`28c43e4`](https://github.com/ryomashibaba/browser-ink-tps/commit/28c43e4a133f9a71d884580d29798b922298f3d5) and [`451a64d`](https://github.com/ryomashibaba/browser-ink-tps/commit/451a64db11490e1ee0cd830400e38d1950467e02) — hardened original-link 7/7 success to also require a **real Rapier KCC dynamic human-proximate rejection witness**; enabled the same positive control in the proven baseline and left original-source lanes, not just the unstable right-input variant.

## Results — true Chrome + original 60Hz physics

| Genuine player location | A3 KCC original audits | Rejected A3 native steps | Rejected against real-player/unregistered-dynamic collider with actual human within 1.2 m | Original A3 alternate link | Actual CPU physical rejoins | Evidence |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Reference human at X=−0.172, Z=63.648 | 1,065 | 8 | **7** | `first-drop-positive-z-6` | **7/7 at tick 1107, PASS** | [CI 39731863515](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39731863515) |
| Genuine KeyA+W human at X=−0.273, Z=63.857 | 1,065 | 9 | **8** | `first-drop-positive-z-6` | **7/7 at tick 1107, PASS** | [CI 39731863540](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39731863540) |
| Genuine KeyD+W intended right obstruction; player instead coasted to X=+0.313, Z=63.988 on latest attempted run | Not eligible for a blocked-case inference | — | **Not verified** | Not assessed; genuine player failed right-side collision-lane prequalification | **HOLD**, no 7/7-detour pass claimed | [CI 39731863511](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39731863511) |

The original result owner's literal ID is `REAL_PLAYER_OR_UNREGISTERED_DYNAMIC_ACTOR`; **do not rewrite it** as uniquely identifying the human. The current evidence combines this native KCC rejection with the measured proximity to the actual human foot (about 0.64 m) and a verified later native detour and physical rejoin. A3 Rapier movement was genuinely rejected before alternative-route recovery. The actor still takes authentic Recast goals and Rapier movement.

## Immutable stage and authorization

- **25** authentic source solids, **17** paint surfaces, **26** source navigation links, **0** scoreable source promotions.
- `activationReady=false`, `unrestricted4v4Certified=false`; no production promotion, forced match start, fake NavLink, actor relocation, or change to default FIXED or opt-in SWEEP.
- All modifications are limited to `dev/t21-f4e103w-qa-infra`; **`main` and Draft PR #5 unchanged**. Original Draft PR #5 head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`.

## Next gate — W10-B103

Characterize **actual lateral positioning from genuine Chrome key events** before long real-CPU runs. In the blocked-right test, fail early when the player drifts outside the actual human/A3 contact corridor. Use short browser position-calibration runs and unchanged real physics to obtain stable right-of-baseline-but-still-blocking placement. Only then demand **both** direct native KCC human-proximate rejection and an alternate **original** drop link followed by real 7/7 rejoin. Distinguish a legitimate unblocked direct rejoin from an unresolved blocked-lane detour; do not lower the criteria to claim success.

The native build/24-test B75 preflight passed on B102 script HEAD `451a64db`; its latest SWEEP Chrome job was PASS and FIXED was still in progress at the time this document was drafted. Recheck both before claiming full CI pass.
