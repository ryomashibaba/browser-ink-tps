# B275 — targeted native Rapier KCC after F3G time limit

2026-10-28 JST. QA branch `dev/t21-f4e103w-qa-infra` only.

## Confirmed predecessor
B274 exact HEAD `a010fcb88255ab7d9820b4e504711fd256bb8f1b` F3G [run 40667115235](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40667115235) completed CANCELLED after reaching the 24-minute job limit. It passed all preflight B273/B274 tests, original UV/17-surface audits and real visual A/B/A restoration. The final real browser log `B274_GENUINE_BROWSER_INPUT_READY` confirmed `beforeLocked:false, afterLocked:true, relockedByRealCdpMouse:true`. No B273 key-leg motion result was logged before cancellation, so actual new route travel is UNKNOWN.

## Change
New workflow `t21-b275-fast-native-kcc.yml` uses the source-pinned F3G original OBJ/MTL/texture preparation, SHA checking, original PlayCanvas + Rapier build and a new narrowly scoped **real Chromium WebGL2/CDP** runner. This runs B273 genuine `KeyW` + KCC original-source telemetry **without** the 24-minute B258–B271 image/material review. Original visual review remains available in its own F3G workflow (with a 30-minute maximum), but that workflow no longer automatically runs B273 or triggers on B273-only code changes.

For B275, a real snapshot must show 25 original solids, 17 PaintSurfaces, 26 NavLinks, zero Scoreables, native tick progression and genuine grounded B112 original support. B274 pointer lock is acquired by native CDP mouse events. The B273 observer records true body position, original collider ID, physical motion and screenshot evidence. No teleports, injected player axes, synthetic ticks, invented floor or modified source data are authorized.

A bounded native KCC movement PASS does **not** imply original lower-floor arrival. If the actor moves but no distinct lower original source support is recorded, report `REAL_KCC_MOVED_LOWER_ROUTE_HOLD`. Only actual named grounded lower source can produce `ORIGINAL_LOWER_REACHED`. Invalid or absent physical motion must FAIL. Historical limited B122/B123/B125 source KCC passes remain valid independently. CPU radius / Recast narrow FloorLine00 and full underpass remain HOLD.

Frozen safety: `25/17/26/0`, ART HOLD, zero formally adopted visuals, 0/12 certified opposing routes, official 4v4 unapproved, production forbidden; `main` and live Pages unchanged.
