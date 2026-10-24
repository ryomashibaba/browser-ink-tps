# W10-B167 — Native source enemy combat awareness

**Date:** 2026-10-25 JST · QA-only nonproduction stage.

## Actual playable change
Normal F3 preview now presents a compact camera-relative enemy CPU contact cue during genuine running play. It reads **real physical B1–B4 CPU foot coordinates, physically-rejoined state, ACTIVE lifecycle and native HP**, all from the existing seven-source-CPU simulation, not a new bot spawn or invented encounter. Nearest native opponent within 32m receives a readable left/right/ahead/behind bearing, distance and HP.

A genuine original Rapier stage-only sightline query indicates original static cover versus a clear straight stage ray, only with similarly elevated real feet. A stage ray is **not** proof of a bullet hit, damage, navigability, or a certified opponent route. The cue is hidden for untrusted/paused/time-up/splatted/airborne/out-of-range cases. Absence of an enemy contact must not be turned into fake gameplay. Source 0/12 cross-map routes remain unresolved.

## Files and validation
- `B167NativeEnemyCombatCue.ts` plus source-provenance and cover test.
- `UndertowF3SourceTraffic.ts`: native lifecycle and HP in read-only snapshot, no CPU behavior changes.
- `UndertowF3PlayablePreviewApp.ts`: noninteractive, visible compact combat cue using native camera and registered original Rapier stage ray.
- Reuse B75 workflow TypeScript/Vite/selected Vitest/real Chromium FIXED + SWEEP; no new CI workflow.

## Authority and next work
Unchanged 25 Rapier solids, 17 paintable, 26 original links, 0 scoreable, 0/12 cross-opponent paths, `activationReady=false`, `productionAuthorized=false`, unrestricted 4v4 HOLD; `main`, Pages, T19C/T20 and PR #5 untouched. B166's seven exact-SHA CI were SUCCESS. **B167 exact-SHA CI not yet verified at code creation time.** Next: only source-proven stage connection and genuinely continuous human vs enemy real combat can promote wider play. Further read-only indicators are not a substitute.
