# W10-B189 — Repair the B187 native Chrome start deadlock using real source-traffic snapshot fields

2026-10-25 JST; baseline QA commit `6983cf879ed9d4b5aa29f0c15eac2fab3c4acb48`.

## Exact facts from GitHub (not hypothetical results)
At B189 intake, B187 native Chrome [Actions 40166552340](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40166552340), B188 [40167192991](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40167192991), and B188 WebGL2 [40167193006](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40167193006) were still **queued**, with no job start timestamps, logs, Chrome screenshot or B186/B187 local-circuit PASS. The queue is external to source code; this commit does **not** unqueue any GitHub-hosted runner. Preserve previous completed evidence only for its actually tested scope.

## Discovered certain root cause in B187 actual source code
The first 480-second B187 real-gameplay wait after pointer-lock required
```js
s.matchState==='PLAYING' &&
s.nativeSourceCpuRejoined===7 &&
s.nativeSourceCpuFreeCombat===true
```
BUT **neither `nativeSourceCpuRejoined` nor `nativeSourceCpuFreeCombat` exists** in the actual `UndertowF3PlayablePreviewApp.snapshot()` contract! The genuine app publishes `cpu:this.traffic.snapshot()`, where `UndertowF3SourceTraffic.snapshot()` exports `physicalRejoins`, `cpu[]` records with actual `released/rejoined/physicalFoot`, and `freeCombatEnabled`; see `UndertowF3SourceTraffic.ts`. Thus even seven real source CPUs successfully rejoining would have caused B187's first-phase wait to time out, making downstream gameplay entirely unreachable.

## B189 actual repair
- Replace the impossible snapshot paths in `scripts/t21-w10b187-real-native-source-circuit.mjs` with `b189RealSevenCpuSourceRelease(s)`, consuming ONLY existing real native `s.cpu.physicalRejoins`, `s.cpu.cpu` and `s.cpu.freeCombatEnabled`.
- Real CPU gate accepts exactly seven **unique** original `A1/A2/A3/B1/B2/B3/B4` source IDs with actual **released and rejoined** evidence and valid finite 3D physical feet. Require true `PLAYING`, the existing original source production=false flag and `physicalFootRelocations=0`. Other staging states, duplicated CPU ID, non-finite foot, false rejoin/free combat or fake obsolete fields fail closed.
- The source-only witness `actualNativeCpuRejoined:7` in the B187 saved real evidence now derives exclusively from the real seven-member native source array after native PLAYING; not a synthetic tally, CPU relocation or match-state override.
- Add 5 focused `node --test` regressions, including a reproduction of the two missing legacy fields. Reuse the existing `t21-w10b120-genuine-original-touchdown.yml` **single** Chrome workflow and preflight; no new runner, no PlayCanvas/Crowd/physics rewrite or global shared-app trigger.
- This is a deterministic pre-execution integration defect diagnosed by comparing real source contracts. It does **not** mean the browser test has completed or that B186 paint quota and named raised KCC route are now genuine Chrome PASS. Keep HOLD and inspect the next exact-SHA artifact when Actions start.

## Scope and long-term completion
Original runtime static authority remains 25 original Rapier solids / 17 source Paintable / 26 approved NavLinks / **0 Scoreable**; natural cross-team original source 0/12, original full 4v4 HOLD, `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`. Genuine B123 independent historical human original ramp crossing and B182 independent source-ink run retain their previously measured narrow successes, not automatic B187 cumulative proof. No new stage route, author face import, CPU/actor teleport, score, winner or production deployment.

B190 should first collect the exact B189 CI and native B187 route/shot evidence, fail-closed on authentic deficiencies, prioritize user-controlled actual combat and original source connectivity. Do not add telemetry or per-cm tweaks while the real runner remains queued.
