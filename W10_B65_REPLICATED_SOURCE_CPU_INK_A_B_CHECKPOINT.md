# Browser Ink TPS — W10-B65 original CPU ink improvement replication gate

**Date:** 2026-10-21 JST. Parent `dd6f2d49984d56fe106f03ca2d5cc09ad54419fc`, branch `dev/t21-f4e103w-qa-infra`. NO production/main/PR #5 changes.

## What actually happened in B64
GitHub [native source CPU 130-second A/B](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39432637747) on the **same exact SHA** completed **BOTH actual Chromium/WebGL2 source simulation jobs SUCCESS**, without synthesized ticks, actor relocations, scoring masks, simulated ink, or synthetic opponents. First-run source-only genuine live observations:

| Genuine native 130s | FIXED default | Experimental SWEEP |
|---|---:|---:|
| Accepted source CPU weapon shots | 107 | 445 |
| CPU changed actual source-ground paint cells | 3,615 | 11,473 |
| CPU physical source-floor rejoin | 7/7 | 7/7 |
| CPU real suspected stalls | 0 | 0 |
| Sampled native patrol distance at 120s | 3,247.08m | 3,251.14m |
| CPU ink change at 60s | 3,597 | 10,587 |
| CPU ink change at 120s | 3,615 | 11,417 |
| New ink-cell changes between 60s and 120s | **18** | **830** |

At 130s, SWEEP changed **+7,858 source cells** vs FIXED (3.174x; +217.4%). This is genuine native source-only laboratory outcome, not a scored Turf percentage, not automatic CPU quality or stage authorization. The B64 *final downstream comparison job* FAILED **solely because the GitHub Actions job had no `actions/checkout`**, causing `MODULE_NOT_FOUND: scripts/t21-w10b64-compare-native-ink.mjs`; both input simulation jobs were SUCCESS, and actual artifacts were uploaded. Do not overwrite or hide failure history.

## B65 substantial completion work
1. Repair final comparison action with explicit `checkout@v4`, `setup-node@v4` and Node model tests; independent `actions:read` to retrieve **previous B64 actual source artifacts from run 39432637747**.
2. Verify source observations at 0 / 20 / 40 / 60 / 80 / 100 / 120 actual native match seconds. Fail closed if missing sample, wrong source auth, reversed physics tick, CPU shots or original ink, any original-foot suspected stall, any missing 7/7 source rejoin, source movement trace regressions, or FIXED mode accidentally receives the experimental source lateral aim.
3. Compare actual 60→120s paint *increments* as well as total changed source cells and source patrol distances. A candidate must have at least 1.5x source changed cells, >=100 additional native late-period source changed cells, >=1000 source-only changed cells absolute improvement, no native source-foot stall, at most 5% patrol distance difference and true source lateral ink candidates accepted. A candidate remains **only eligible for another genuine normal-preview regression**, never automatically adopted.
4. Repeat exact SAME source/CPU baseline on new GitHub Actions CI in *two independently started* Chromium/SwiftShader 130-game-second runs, then compare **old A/B vs new A/B**. Fresh runs can only be called PASS when real logs and workflow conclusion confirm it. The replication gate itself is read-only; no code path that promotes experimental mode to player default, production or main.
5. Keep entire original stage certification unchanged **25 physics, 17 Paintable, 26 original NavLinks, 0 Scoreable; natural opposite-team source paths 0/12; `activationReady=false`; `Vss_Temple01` active Banc instance placements and 8 original PntSet object-instance bindings unknown**. No human-enabled 4v4 or Turf result. CPU FIXED remains ordinary normal preview and all other environments.

## Determinism / risk notes
The same actual stage + code + timed mouse/keyboard are used, but separate GitHub runners are not bitwise-identical hardware and native 130s sample times may differ by fractions. Only comparable native 20s windows count. Shader/PlayCanvas render-duration metrics do not prove Windows real GPU FPS. No background agent promises; this artifact records the exact workflow results only after observed.

**Status at creation:** implementation ready to commit; CI and independent replication pending.
