# W10-B62 — Real full-round CPU / Human play evidence, owner-only

Parent code HEAD `811b1cb3dcd4782a984134f9f671e908834f524e`, date 2026-10-20 JST.

## Why this is product work, not another invented practice challenge
Original 4v4 still depends on source-licensed `Vss_Temple01` Banc/SetActor mapping for 8 PntSet components and original right-low/underpass continuous physical navigation. Stage topology is certified only **25 physics / 17 Paintable / 26 NavLinks / 0 Scoreable** with **0/12 cross-team paths**; the seven CPUs use the previous **FIXED** source-patrol baseline. Previous B59 full native Chrome host budget expired at 80.08 genuine match seconds despite 7/7 source-local CPU rejoin, 101 real CPU shots and ~3.6k actual CPU source ink-cell changes by 60–80s, not a physical game crash. B61 [long run](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39417199123) continues independently and must prove actual TIME_UP/end/restart, not assumed success. Existing [same-SHA F3G visual rerun](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39417198833) passed on second attempt; initial screenshot hash mismatch remains historical, not erased.

## Actual B62 feature
- New read-only `UndertowF3NativeSessionEvidence.ts`, built into F3's existing real snapshot refresh, with minimal bounded ~10 **native match** second observations (not fake host-clock elapsed seconds).
- Samples real original CPU 7 source-ground rejoin count, Human and CPU genuine projectile-owned changed cells, Human/CPU true shots, splats/respawns, actual source CPU stall diagnostics and callback p95. Timeline includes **actual counter deltas** so owners can objectively see whether the CPUs stopped shooting/painting partway through a full run. Each observation is from unchanged native PlayCanvas/Rapier/Recast/GameInk, not re-simulation.
- Strict source authority fail-closed, monotonic native tick, monotonic cumulative paint and shot totals, distinct STAGING/paused/safety-stop/PLAYING/TIME_UP. **No JSON completion unless an actual observed PLAYING state precedes genuine native TIME_UP at 180.00 seconds, at least 10,800 native physics ticks**, with an output restricted to primitive numeric counts and non-scoring status. Data does not include actor poses/transforms, source mesh IDs, GUIDs, private original resources, user-agent, absolute paths, hardware identity or URLs.
- New **SAVE REAL 180s SESSION DATA (LOCAL JSON)** button on B59's already-existing complete-session panel. The owner must click to download; data is never automatically uploaded or sent off-device. Existing RESTART remains. Completion result still states NO TURF WINNER / cross-team paths unverified. UI and recorder do not modify actual stage, CPU, movement, physics, camera, scoring or default render quality.
- Vitest verifies genuine 10s native timeline, 180s export, CPU ink deltas, zero scoring, missing original authority fail, safety-stop refusal and spoofed time/tick rejection. Existing real Chrome B54 source-run workflow includes these tests and confirms app/build/pointer-locked input regression.
- No assumptions about owner NVIDIA RTX performance from hosted SwiftShader; never silently downscale rendering. Earlier B21 A/B/A had insufficiently stable gain; native image quality remains default.

## QA verdict
Code prepared; **PENDING exact-SHA CI** until new dedicated B62 build/model suite and existing B54 real Chromium regression complete. No original Nintendo 4v4 or owner Windows full three-minute run is certified. B61's separate 180-second full-run is still its own QA gate.

## Next real blocker
Obtain original-stage authorized actor instance/layer/mesh coordinates privately with provenance, then direct physically continuous opposing-team 8-character encounter certification. Use owner local session JSON only when owner explicitly chooses to save and share it; no extra routine screenshots/ZIPs.
