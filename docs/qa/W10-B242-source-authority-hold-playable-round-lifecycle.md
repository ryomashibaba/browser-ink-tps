# W10-B242 — SOURCE_AUTHORITY HOLD; player-owned source round lifecycle

2026-10-26 JST. Baseline QA HEAD: `845693b11427e6998c2a05bd59af6678c053db53`.
Branch: `dev/t21-f4e103w-qa-infra`. Implementation/browser acceptance is pending CI; this document does not claim browser PASS.

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

Existing B75 FIXED/SWEEP integration is reused; no workflow is added. The existing F3 app push gates remain active.
Lightweight candidate checks: real JavaScript syntax check PASS; TypeScript 5.8.3 parse diagnostics: zero. Full semantic type/build and browser outcomes await Actions.

B75 FIXED additionally checks real ready/P-key waiting, an actual Start click, STAGING Esc pause, resumed real HUMAN movement/shots/paint and 7 CPU rejoins, actual PLAYING focus loss via a second Chrome target, unchanged native clock/HP/ink/positions/shots while paused, explicit resume with identical performance.timeOrigin, zero actor relocation and unchanged source authority. It saves a ready framebuffer and a numeric lifecycle JSON. No QA ticks or fabricated state are introduced.

This is a round-control and gameplay-regression acceptance, not a newly completed 180s match, natural cross-team encounter, hit/splat guarantee or official 4v4 result. Earlier B210's 180s evidence remains historical evidence for its own SHA.

## Frozen boundary and next playable work

25 solids / 17 paint / 26 links / 0 scoreable; opposing natural routes 0/12; activationReady=false; productionAuthorized=false; unrestricted4v4Certified=false; officialWinner=NONE.
main, T19C/T20, public Pages and Draft PR #5 are unchanged.
Next: source-limited aiming, true projectile/HP feedback and player visibility in the existing supported region. Natural enemy encounters and full-map completion remain HOLD.
