# W10-B183 — Playable real-human first-drop challenge on frozen original source

2026-10-25 JST; baseline QA `160841a6185d3299aee1734010e4787a6fc9d188`. One non-scoring original-source gameplay vertical slice; NO new stage or actor.

## Actual previous result / blockers
B181 exact-SHA CI `ecf4f086` completed all six workflows successfully; however B181 combat sight was not enabled by the existing B75 run. B182 `160841a6` uses that existing B75 SWEEP lane to opt into the actual original-source Rapier ray, but at the B183 intake its new CI jobs were queued, so B182 target selection and real damage improvements remain **unverified**. Original opponent natural paths remain **0/12**; do not turn that absence into fabricated enemies.

B176 and B177 earlier demonstrated actual human Rapier KCC source-upper -> source-lower landing during genuine 180s browser play. The current QA app had no simple visible player-facing goal for this genuine, source-local mobility accomplishment. Test and metric counts do not make a game.

## B183 actual gameplay feature
- One visible **PLAY ORIGINAL UPPER → LOWER DESCENT** button starts a new explicitly opted-in `t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay` session. No headless testing switch or hidden UI is required for the human. Clicking is user-initiated reload; no mid-physics pose manipulation.
- A compact always-visible in-play objective tracks *real* 60Hz human Rapier KCC positions and native grounded status. Source upper supports only after actual original Rapier hit, registered support ID and foot gap <= 0.22m at the source upper height. Native descending phase requires real player to leave the upper stage into the air; lower completion requires actual grounded native Rapier source support at original lower height, >= 2m native body vertical descent, correct side and consecutive continuous physical steps.
- A nonphysical discontinuity (>0.8m in one fixed tick), dropped native observation, incorrect immutable stage, invalid native body or missing source landing cannot trigger CLEAR. Death and native respawn reset the current attempt rather than pretending a drop. Every contact condition is purely a read-only challenge acceptance guard; it does not change Rapier collision, stage geometry, CPU navigation or the actual game kill/reset policy.
- Player-facing states: SEEK UPPER, SUPPORTED UPPER, DESCENDING, genuine SOURCE LOWER LANDED, or HOLD. Genuine landing status appears immediately from actual native 60Hz simulation, not a delayed graphics/render tick.
- B183 is local unscored practice, not a source route certification or a finished 4v4. All labels and snapshots explicitly retain `officialWinner=NONE`, `crossTeamRouteCertified=false` and zero scoreable promotions.

## Minimal verification gate
Pure B183 state machine regression cases (genuine source support required, lower-without-upper not awarded, upper jump not counted as descent, simulated transport/invalid stage rejected, dead/unplaying not rewarded) are attached to the existing B75 preflight. There is **no new long-running browser workflow**. Only the real manual original-stage Chromium session can finally validate that a player successfully completes this gameplay activity under live KCC after this change; older B176/B177 first-drop proofs do not automatically certify the new B183 UI integration.

## Frozen project authority
25 original Rapier solids / 17 paintable original surfaces / 26 original source links / **0 Scoreable**. Natural opposite routes **0/12**. `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`, original ordinary Turf War HOLD. Protected `main`, T19C/T20, Draft PR #5, Pages and non-public source assets must remain unchanged.

## B184 direction
If B182 CI is complete, consume its real native sight telemetry without overclaiming opponent contact. Validate B183 actual user-facing native upper -> lower completion, then prioritize source-backed stage connection, genuine contact/weapon damage and the play loop. Do not create unverified bridges, actors, or score masks to make a test pass.
