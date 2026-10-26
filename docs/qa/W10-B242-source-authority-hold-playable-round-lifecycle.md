# W10-B242 — SOURCE_AUTHORITY HOLD; player-owned source round lifecycle

2026-10-26 JST. Baseline QA HEAD: `845693b11427e6998c2a05bd59af6678c053db53`.
Branch: `dev/t21-f4e103w-qa-infra`. Implementation and round-control browser acceptance PASS. Corridor certification remains SOURCE_AUTHORITY HOLD.

## B242 corridor decision: SOURCE_AUTHORITY HOLD — research stopped

The minimum source audit did not authenticate original-game collision inclusion for FloorLine00.
Pinned third-party KiTrix revision: `0611f51b35c9736ee986fb2218461e2585b7875e`.

- [MTL](https://github.com/kirakira-dev/KiTrix/blob/0611f51b35c9736ee986fb2218461e2585b7875e/stages/Vss_Temple01/Vss_Temple01.mtl) contains material/color/texture declarations, not original collision flags.
- [BFRES-to-OBJ converter](https://github.com/kirakira-dev/KiTrix/blob/0611f51b35c9736ee986fb2218461e2585b7875e/bfres2obj/Bfres2Obj/Program.cs) exports rendering geometry/materials, without binding original-game collision attributes.
- [StageCollider](https://github.com/kirakira-dev/KiTrix/blob/0611f51b35c9736ee986fb2218461e2585b7875e/KiTrix/SceneKit/StageCollider.swift) performs SceneKit rendered-stage segment hit tests, not original-game collision decoding.
- The complete public recursive tree (13,965 entries, not truncated) did not expose material sufficient to authenticate this collision role. This is an absence in the inspected source, not proof that the original game has no collision.
- Additional provenance caution: [StageLoader](https://github.com/kirakira-dev/KiTrix/blob/0611f51b35c9736ee986fb2218461e2585b7875e/KiTrix/SceneKit/StageLoader.swift) maps Undertow Spillway to Vss_Nagasaki03 and Camp Triggerfish to Vss_Temple01. This third-party label is not itself official stage authority; target/version identity must be reconciled before any future source promotion.

The [B241 exact-SHA Actions](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40333114860) is completed/success on `15caaf30875feb8db65f9810c2fbb92cab44e606`.
Its code reads KCC computedCollision collider identities into an aggregate set; it does not retain tick-bound normals/contact points for the 7 positive-Z / 8 negative-Z center-ray-null frames.
Those frames therefore remain CONTACT_PROVENANCE HOLD. Neither falling nor safe capsule support is inferred from a null center ray.
Original CPU diameter remains 0.60m; the measured 0.311135m ribbon alone and radius-eroded Recast failure do not certify safe passage or prove full surrounding clearance impossible.

Original collision authority is independently necessary for GO even if capsule contact were identified. No new 43MB download, full mesh rescan, lateral trial, speculative connector, per-B workflow, or production promotion is justified. This FloorLine00 research is stopped until new authoritative collision/target-version evidence arrives. Do not reopen the same two triangles as B243/B244 diagnostics without such evidence.

## Coherent playable improvement: ready → start → pause → same-world resume

The selected 180s SOURCE round previously advanced physical staging and eventually its match clock before the player's first mouse lock. Loss of lock during STAGING did not pause it. Window/tab focus loss had no world-level stop handler.

- A selected full round now boots in a visible READY state at native tick 0 / 180s. CPU, player, projectiles and ink wait together.
- START or a genuine canvas click acquires mouse lock and starts the actual existing physical world. The first lock click retains the original no-fire input behavior.
- Esc/P and lost pointer/app/tab focus pause the same world during STAGING as well as PLAYING.
- Returning focus does not resume play automatically. The existing explicit button reacquires mouse lock and resumes the same world.
- P cannot bypass initial readiness or restart an ended match. Existing full-world manual replay stays unchanged.
- No floor, CPU path, actor placement, weapon damage, paint ownership, score or source certification is changed.

## Acceptance and evidence

Existing B75 FIXED/SWEEP integration was reused; no workflow was added.
Game/application + B75 acceptance code SHA: `13242af5aa3e94d06a25f8ef877893cee562ff59`.
Cooperative test-harness adaptation SHA: `97731ecfeb25eea4c25374472a7fbeaeb80f0bf2`; application and B75 runner are byte-identical to the game SHA. The later report-only HEAD does not introduce untested gameplay.

| Existing Actions | SHA | Measured result |
| --- | --- | --- |
| [B75 #40340049154](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40340049154) | 13242af | SUCCESS: type/build, 47 Vitest files / 208 tests, node regressions, real FIXED + SWEEP |
| [Windows/Linux QA #40340049080](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40340049080) | 13242af | SUCCESS, both OS jobs |
| [B112–115 #40340049044](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40340049044) | 13242af | SUCCESS, real browser original-floor witness |
| [B120 #40340049457](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40340049457) | 13242af | SUCCESS, actual descent/ramp/human ink |
| [B234 #40340049193](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40340049193) | 13242af | SUCCESS, seven real CPU readiness; no corridor promotion |
| [B139 #40340716069](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40340716069) | 97731ec | SUCCESS: FIXED_DEFAULT / TEAM_COVERAGE / ALLY_RALLY and paired proof |
| [B162 #40340716095](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40340716095) | 97731ec | SUCCESS: actual co-op clear twice, pause/resume and fresh replay |

The first [B162 #40340049433](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40340049433) failed `B140_NOT_REAL_ORIGINAL_7CPU_KCC_BOOT`: its historic full-round boot assertion required unpaused play before the first click. The existing runner was updated to require the stronger real READY / tick 0 / 180s state, then click the visible START button. No movement, paint, clearance or authority threshold was relaxed. The later B162 success above is the corrected verification; the earlier failure is not concealed.

### Genuine Chromium measurements (B75 FIXED)

Artifact `w10b75-live-source-ink-FIXED` contains `b242-real-source-round-lifecycle.json` and `b242-source-round-ready.png`.

- Ready and real P-key waiting: native tick 0 → 0, time 180 → 180, HP/ink/positions/shots/CPU unchanged.
- Real START button; STAGING Esc pause at tick 0, explicit same-world resume to tick 6.
- Real human KCC travel **3.556m**, **9** accepted shots, **365** changed human impact cells; real CPU rejoin **7/7**. These are movement/shots/paint observations, not hits or Turf score.
- Genuine activity window: **360 native ticks / 6.0s**, **70** CPU source-shot requests and **3,172** CPU changed paint cells. These counters are separate observations, not causal shot-to-cell attribution.
- A real second Chrome target caused PLAYING focus loss. Native world remained unchanged during the pause at tick **1505**, time **173.9s**. Explicit UI click resumed tick **1511** with the same `performance.timeOrigin`. Actor relocations **0**, injected QA ticks **0**.
- The actual ready framebuffer was inspected: the central instructions and START button are readable. Inherited peripheral diagnostic panels remain dense/overlapping; overall HUD/visual quality is still a POLISH/VISUAL_FIDELITY task, not completed by this slice.

### Existing cooperative game regression (B162)

Two genuine source-limited cooperative CLEARs: human impact cells **808 / 818**, grounded travel **35.76 / 35.86m**, tagged actual A1 changed cells **41 / 37**. Actual pause/resume succeeds before and after objective CLEAR. Mission-card, terminal HUD and R-key replays rebuild clean worlds (native tick 0, STAGING, no CPU rejoin yet, zero actor relocation). These are existing local cooperative objectives, not cross-team encounters or official wins.

PASS covers player-controlled round start, same-world interruption/resume, native movement/ink/CPU activity, existing cooperative replay and the listed regressions. No newly completed 180-second match is claimed on this SHA. Natural enemy encounter, actual enemy hit/splat guarantee, full-stage routes and official 4v4 remain HOLD. Earlier B210's 180s evidence remains historical evidence for its own SHA.

## Frozen boundary and next playable work

25 solids / 17 paint / 26 links / 0 scoreable; opposing natural routes 0/12; activationReady=false; productionAuthorized=false; unrestricted4v4Certified=false; officialWinner=NONE.
main, T19C/T20, public Pages and Draft PR #5 are unchanged.
Next: source-limited aiming, true projectile/HP feedback and player visibility in the existing supported region. Natural enemy encounters and full-map completion remain HOLD.
