# W10-B117 — Real original Recast HUMAN proxy projection versus post-Crowd source seal

Date: 2026-10-23 JST. Branch `dev/t21-f4e103w-qa-infra`.

## True blocker from B116
[Original B116 Chrome run #39854645982](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39854645982) **FAIL/HOLD, not a reported floor hole**:
- Original player actual KeyW held for 128 progressed physics ticks (tick 6→134), forward movement **10.207942962646484m**, only source `UndertowT21D:spawn-high-positive-z`, genuine KCC grounded and original 5-ray source supported; **zero** floor-loss suspicions.
- Native stop `T21_PHASE14Q_CROWD_PROXY_POSTSEAL_UNSAFE`. The independent original proxy-source seal throws from `UndertowPhase14QHumanCrowdAnchor.sealAfterCrowdUpdate` when `sealed.footToCrowdHorizontalMeters > .065`.
- JSON/screenshot evidence uploaded as [Actions artifact 12459595583](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39854645982), `w10b116-true-original-forward-floor-evidence`.
- Build and 13 source regression tests PASS, real route certification HOLD. Nothing was reported to have fallen through the map.

## Root boundary mismatch (source-based diagnosis)
The genuine Rapier human foot is projected by the original `RecastStageNavigation.closestPoint` onto the nearest original NavMesh location. Existing `UndertowPhase14QHumanCrowdAnchor.project` accepts a **maximum 3D projection distance 0.26m**, and `syncActualPlayerFoot` demands the passive Crowd proxy match that *source-projected* location within 0.065m. However, **after** the Crowd step, `sealAfterCrowdUpdate` previously tested a different quantity: horizontal difference between the restored projected proxy and the *unprojected* physical player foot, against 0.065m. A legitimate NavMesh edge projection may exceed 0.065m while the original player is physically grounded and the proxy is correctly restored to its source-projected point. The existing B116 stop code alone does not prove this is the only cause; the corrected real test must establish the result.

## Changes
- Introduce a pure audited helper `UndertowPhase14QProjectedProxySeal.ts`. It separately checks original physical foot→source projected nearest NavMesh point **≤0.26m 3D**, and source-projected point→restored Recast Crowd proxy **≤0.065m 3D**. It returns the real physical-to-proxy horizontal distance but **never declares it equivalent to KCC contact**. Out-of-navmesh and unsealed Crowd proxy still throw, fail-closed.
- `UndertowPhase14QHumanCrowdAnchor.syncActualPlayerFoot` now surfaces the actual source-projected point it already obtains. `sealAfterCrowdUpdate` audits against that projection; preserves the original physical-to-Crowd reported distance separately. Seven actual CPU positions, real Rapier body, Recast source navigation, original stage geometry and CPU autonomy are untouched.
- Five regression tests verify a genuine .12m source-edge offset is measured without a false "not sealed" result, while a real .065m source-projection restoration failure and an >.26m original source projection remain **rejected**. No 4v4 physical interaction is claimed.
- Extend **existing** B116 480-tick real Chromium workflow (instead of another redundant browser CI) to include this code and audit Vitest. The genuine `KeyW` drive remains unmodified, the strict source KCC/foot support final gate unchanged, native stop still archived as evidence.

## Post-run acceptance
Do not mark B117 or the B116 longer human route PASS until the **exact source-SHA** real Chrome B116/B117 workflow passes. If it still stops early, report actual new stop and preserve the JSON artifact; no synthetic floor and no fake CPU route. Frozen authority: **25 original solids, 17 Paintable, 26 NavLinks, 0 Scoreable; 0/12 formal crossing paths; 4v4 HOLD**. No main/Pages/PR #5 deployment.

## Exact B117 real Chromium outcome — HOLD, genuine source evidence retained

[Actions #39856772443](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39856772443) at code SHA `ffd2eff1d5237ffb5ae53475dbcfdfe05d77f7ef`: **completed FAILURE**. The source TypeScript/Vite build and **4 test files / 18 Vitest tests PASS**. The real-browser 480-native-tick run is **not certified** and failed its correct fail-closed gate. The [actual evidence archive (artifact ID 12460630172)](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39856772443) contains `b116-real-forward-original-support-traverse.json`, `b112-real-source-foot-walk.json`, and a real-browser screenshot. This is the actual artifact readout, not reconstructed coordinates.

- Real Chrome KeyW: **tick 6→175**, **13.76180648803711m forward**, final original body **[-0.1737196147441864, 3.8949975967407227, 54.13089370727539]**.
- Original source solids independently witnessed: `UndertowT21D:spawn-high-positive-z` (higher original floor) and `UndertowT21D:first-drop-landing-positive-z` (original lower landing). Neither source solid was created or changed by this QA.
- Original support transition: **tick 137** KCC grounded/high source center+edge; **tick 138** center ray misses but **edge** high-floor source ray remains; **tick 143** genuine KCC becomes airborne; **tick 150** the preexisting unsupported-descent suspicion triggers after **0.330555m downward displacement**, classified `NO_NEAR_ORIGINAL_FOOT_RAY_KCC_UNGROUNDED`. At **tick 174**, KCC is grounded again on original `first-drop-landing-positive-z` (center+edge source rays); still grounded at tick 175.
- This is a documented, genuine **high-platform-edge → native first-drop landing** passage; the observed intermediate unsupported descent **does not establish a missing original floor**. The existing B116 acceptance gate correctly leaves the full route HOLD because any such suspicious interval is still conservatively preserved.
- **New native failure at tick 175:** `T21_PHASE14Q_UNBOUNDED_CROWD_DRIFT` in the human passive Crowd proxy seal (existing **>2m source-proxy drift** fence). This is distinct from the original B116 false positive `CROWD_PROXY_POSTSEAL_UNSAFE` at tick 134. **Do not relax the existing >2m fence** or suppress the source evidence to obtain a green CI.
- Provisional implication: B117 correction of the projected-foot residual appears to eliminate the exact old stop and allows source-connected first-drop motion. It **does not** certify the cause of the original failure, general CPU/human contact, native passage safety, central-road coverage, or 4v4.

## Required next source-grounded action (B118 candidate)

Inspect why Recast's eighth **passive** HUMAN neighbour undergoes >2m intra-tick drift at the first-drop landing transition while original Rapier HUMAN is grounded. Record measured before/after Crowd proxy and source-projected Rapier foot *at the exact failing native tick*, preserving source and CPU authority. Prefer correcting the actual first-drop proxy lifecycle/source-layer transition over broadening any collision or NavMesh tolerance. Original Rapier player collision, the seven CPU physical actors, original 25/17/26/0, production and official 4v4 HOLD remain frozen.
