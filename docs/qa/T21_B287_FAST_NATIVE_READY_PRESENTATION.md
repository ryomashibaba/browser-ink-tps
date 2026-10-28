# T21 B287 — early genuine Chromium READY HUD proof before long CPU rejoin

Date 2026-10-28 JST. QA branch. This is an efficiency/quality-control change, not a stage, gameplay or cosmetic promotion.

## Why

B286 adds a truthful 1+7 compact native team panel to the player-selected real-source 180s round. Unit tests and B75 SWEEP are PASS, but the existing B75 FIXED path performs heavyweight B250+ shader/material A/B, native time/focus/pointer experiments and slow genuine 7CPU rejoin **after** its B246 PLAYER → QA → PLAYER HUD screenshot. A time-out deep in those later scenarios does not distinguish whether the new B286 READY display passed. Uncritically waiting for a full 24-minute B75 FIXED before reading UI evidence slows development and conflates independent objectives.

## B287 architecture

Reuse **the identical genuine** `scripts/t21-w10b75-live-native-ink-hud.mjs` Chrome/PlayCanvas/Rapier/CDP path. Explicit, fail-closed `T21_B287_READY_ONLY=1` requires `FIXED` and the normal `T21_B207_REAL_COMBAT_SELECT=1`. The existing real user CDP click launches a new full source round; B242 P-key READY native tick/time world freeze, B246 PLAYER/F8 QA/F8 PLAYER transitions, B286 true 0-rejoined/7-rejoining native panel, original source authority and screenshot hash checks all run unchanged. Only **after all those assertions and actual screenshots**, B287 emits minimal JSON and returns before unrelated long B250+ optical A/B and 7CPU wait. The real FIXED long path remains unchanged when env opt-in absent.

The existing **B75 consolidated** CI adds a fast source-only B287 job after preflight and gates the original FIXED and SWEEP heavy jobs on its success; no new one-off workflow, action on main, production, injected tick, invented actor or shortcut to formal 4v4. This prevents expensive native replay when the player UI itself already fails, while preserving full heavyweight tests for genuine accepted display changes.

## Evidence contract and limits

Check screenshot artifacts `b246-source-player-ready.png`, `b246-source-qa-ready.png`, `b246-source-player-restored.png` and `b287-fast-original-player-ready.json`. READY player must have `0/3` + `0/4` active and `7/7` REJOINING, zero scoreable and a visible compact B286 panel. F8 QA must hide compact B286 while revealing original full B211. F8 PLAYER restores compact without any actual world/clock change. A screenshot or DOM PASS establishes presentation/real WebGL2 evidence only, not aesthetic ART acceptance.

The eventual full B75 FIXED still proves only its original 180s source **non-scoring**, partial genuine human+CPU world. A native READY smoke is **not** 7 CPU navigation, original combat encounter, FloorLine00 original-game collision role, cross-map proof, or formal 4v4. Original project remains 25/17/26/0, activationReady=false, productionAuthorized=false, unrestricted4v4Certified=false, enemy full crossings 0/12, ART HOLD. Keep main, release Pages and PR unchanged.

### Before claiming B287 acceptance

Record exact GitHub Actions SHA, B287 fast job result, FRAMEBUFFER screenshot artifacts and separate full FIXED/SWEEP conclusions. Do not claim B287 successful merely from B75 SWEEP or a completed TypeScript build.
