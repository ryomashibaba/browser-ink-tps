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

## B287 genuine screenshot inspection and correction (not merely DOM tests)

The actual earlier **B286 FIXED** source-Chromium artifact (run #40685368214, `w10b75-live-source-ink-FIXED`) was opened and its **1600x900** `b246-source-player-ready.png` and `b249-real-native-inplay.png` inspected. It showed functional truth (`0/3,0/4,7/7 REJOINING` at READY, `3/3,4/4` after seven genuine CPU rejoin) **but visual failure**: B286 panel was placed at right/top 14px directly over the existing original tactical radar, bleeding its `SOURCE / TACTICAL LIVE PHYSICS` content through B286's translucent background; narrow 212px panel wrapped `OPPONENTS 4/4` into a separate line. B286 was TECH PASS but UI VISUAL HOLD.

B287 moves the genuine compact panel only to the **previously free bottom-right** of the actual 1600x900 original preview, expands bounded width to 278px, increases text background opacity to .97, and keeps the opponent count on one line. This is a **display-only DOM/CSS change**; no source physics, material assets, camera, AI, score or registered collisions change.

The early B287 true Chromium READY probe now **fails closed** if the original F3 tactical radar and B286 compact box have any nonzero bounding-rectangle overlap or if the count line overflows/wraps. It checks both PLAYER views before/after F8 QA, retains exact native tick0/180s time and screenshot saves. ART HOLD remains for game-wide stage/actor presentation; B287 can only establish correct compact UI placement in the tested real source viewport.

## Exact-SHA native B287 early gate (2026-10-28)

The source-code commit under test was `3081bed8f7eec2fc11e264389ba34c27001f1cd8`.
The new [B287 consolidated Actions run #40687710260](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40687710260) completed:
- TypeScript/Vite + source regression preflight: **SUCCESS**.
- Independent `B287 fast genuine Chromium selected-round READY and F8 player HUD` job: **SUCCESS**.
- Saved [actual browser artifact #12814864930](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40687710260/artifacts/12814864930), including `b246-source-player-ready.png`, `b246-source-qa-ready.png`, `b246-source-player-restored.png` and `b287-fast-original-player-ready.json`.

The **actual 1600×900 framebuffer was downloaded and inspected**, not merely asserted from DOM. The original top-right `SOURCE / TACTICAL` radar is fully unobstructed; the new bottom-right compact team panel has no text bleeding, and its ally/opponent count is on a single line. Independent native DOM:
- `compactRadarOverlap:0`; `compactCountsSingleLine:true` in both PLAYER frames.
- Actual user-selected round remains at `tick:0`, `timeRemaining:180`; CPU participation rightly shows `0/3,0/4,7 REJOINING`.
- QA F8 hides compact and restores full source evidence. Returning to PLAYER restores the exact original framebuffer SHA256 `2f946a6d9674ae4fe1d56b02a03c4a334f5fabd94788de2ce675ff61b3805955`.
- Original world unchanged, virtual ticks 0, actor relocations 0, Scoreable 0, official winner NONE, ART accepted false.

The **full** genuine B75 FIXED/SWEEP follow-up jobs belong to the same Actions run but were still in progress when this specific B287 *early* acceptance was recorded; their outcomes must be checked independently. The older B286 run [#40685368214](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40685368214) fully completed **SUCCESS** on old source HEAD `1c4f02882c3b6d019fe5f477474c56e17398f468`, proving actual 7CPU 3/3 and 4/4 roster after 0 physical warps. It did **not** carry the subsequent B287 radar overlap correction.

**Disposition**: B287 early source-ready real-browser UI and proof acceleration **TECH PASS**. Stage/actor art, original-game collision inclusion for FloorLine00, 12 opposing routes, formal full 4v4 and production remain **HOLD**.
