# B406 同じ本物の180秒試合における人間と敵B1–B4の近接距離 — 独立監査

2026-11-03 JST. Branch `research/t21-b406-single-session-real-enemy-range-audit-20261103`. Based on B405 corrected research HEAD `833b43693b3f11cb376fb076f75d30130ad08faa`, preserving QA `8c104658a1842218bdfeff07792b3ab35576a0c4`, main, T20, Draft PR#5, Pages.

## Rationale
B403 SOURCE 180s human vs B CPU distances and B404 32x28 source corridor comparison establish distance bounds only from different genuine Chrome runs. B404 cross-session closest ~97.553m **is not a same-frame encounter**.

B405 [corrected Actions #41601683883](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41601683883) attempts 1 genuine original human/7 CPU full 180s session: actual native B337 pointer-locked shots/ink/WASD followed by the same world's TIME_UP, capturing seven interval snapshots including true world human `player` position and seven physical CPU `foot` and genuine life/HP/rejoin fields.

B406 reads ONLY that exact unchanged B405 JSON (no game modification) and, after running the strict B405 180s auditor plus independent B337 input/auditor, computes **human and B1–B4 at the SAME native snapshot tick** at 7 timestamps. Enemies count as optical proximity candidates only when actually alive, HP>0 and source-rejoined at that tick. Full actual B CPU body list remains even for splatted enemies, with explicit truthful status. This avoids cross-session comparisons falsely implying a true encounter.

At each genuine native sample, horizontal distance and vertical separation are independently calculated. A <=32m observation is a *B181 optical-window candidate only*, NOT a physics ray, original source line-of-fire, actual projectile, HP damage, valid Recast path or human KCC passage. Output includes explicit `false` certification for all those claims. No interpolated entire-180s minimum, no simulated positions.

## Execution strategy
The B406 research CI tests the new auditor and existing B405 source contract **without running a second costly Chromium game**. Once B405 actual artifact exists, B406 CLI can be called on the genuine B405 artifact folder to generate a standalone 7-frame same-session report. A successful pure CI alone is not a real proximity result. If B405 native round is FAIL, B406 real witness stays HOLD. No new actor motion, geometry, collision, HP, score, ownerGrid or original world alteration.

SOURCE 25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 scoreable; natural opponent paths 0/12, formal 4v4/ART/production HOLD, no QA/main/published changes.

## Audit strength correction
A real source frame's reported CPU physical rejoin count must equal the number of actual seven-actor rows with rejoined=true; B406 must reject count/actor contradictions even if an upstream global count is within 0–7. The controlled splatted B1 test now correctly uses six actual rejoined CPUs and rejects mismatched counters. This only tightens read-only evidence, without gameplay mutation or changed physical behavior.

## 2026-11-03 TRUE B405 original 180s artifact was verified
- B405 real Chromium [#41601683883](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41601683883) **SUCCESS**, artifact #13215309208. Its `b405-same-original-180s-round.json` SHA256 is `97f1f3bd08d1fe38c58f9fa5ed566c2fc7228f6d771561948952e5ab281227a5`.
- Original one-game TIME_UP native tick 11855. Original human input 9 real shots/92 source ownerGrid changed cells. Seven true CPU rejoin; native CPU source shot requests 108, actual CPU changed cells 11,773. Native human-to-CPU HP hit events **0**, splat/respawn **0**. No actual opponent duel or 4v4 certification.
- Independent body-distance readout of the *same game's seven snapshots*: AFTER_INPUT nearest B1 **116.991m**; 150s B4 **119.324m**; 120s B2 **117.479m**; 90s B2 **117.653m**; 60s B1 **117.658m**; 30s B2 **117.677m**; 0s B2 **117.630m**. These represent seven real native checkpoints, NOT a continuous nearest distance for every game tick. All seven well beyond the B181 maximum 32m optical candidate window.
- New B406 workflow replays the original B405 GitHub Actions **same-world** artifact after SHA verification; runs the B337/B405 independent auditor and B406, and stores actual numeric JSON. This is not another expensive game-run or cross-session extrapolation. Only the same-SHA GitHub workflow's success can certify the *new B406 replay*, never CPU hit or opposing route.
