# Browser Ink TPS — W10-B18 source-only playable camera/control checkpoint (2026-10-18)

**Scope:** `dev/t21-f4e103w-qa-infra`, Undertow T21 preview `?t21Play=preview` only.  
**Main implementation commit:** `7e78a9d8833361b23094575e9658d1337007b2db`  
**Actual live-camera proof commit:** `c6de20bbf37cad090cf713d057297b2fff0197e4`

## Actual user-facing improvement

- **Q while pointer-locked:** Switch the camera between the right and left shoulder, with damped lateral camera recovery. The actual current camera offset is measured from camera state, not just a toggle flag. A source-stage collision ray and immediate retraction remain in charge; no camera collision bypass.
- **M:** Hide/show the existing source tactical radar without removing physical actor footprints, NavMesh evidence, or source-only authority. All real-actor positions remain available when the radar is re-shown.
- Source-game camera `update()` reuses persistent Vec3 storage for camera positioning, look direction, and ink-ray end rather than allocating transient direction/target clones in its high-frequency path. This is an **allocation reduction**, not a measured FPS increase; do not advertise a speed-up until a benchmark.
- Original nonproduction debug display, gameplay controls, HUD, weapon effects and source-only frozen 25/17/26/0 authority unchanged. Source controls are opt-in on the explicit `UndertowF3PlayablePreviewApp`; the shared camera's ordinary non-F3 route does not accept Q shoulder input.

## Real browser acceptance

- [Chrome B15 + B18 + 7CPU B16 integrated action](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39129708855): **SUCCESS** at `c6de20bbf37c`. Actual Browser WebGL2, genuine pointer lock and native 60Hz Rapier/Recast.
- `T21_W10B18_REAL_Q_SHOULDER_AND_M_RADAR_PASS`: trusted Chrome KeyQ input changes actual source camera target; M hides and restores the radar DOM. Original authority unchanged.
- `T21_W10B18_LIVE_CAMERA_SHOULDER_PASS`: genuine real-time PlayCanvas renderer/physics continued for **84 fixed ticks** during the test; camera offsets right **+0.720m** → left **-0.632m** → restored right **+0.632m**. Captured three actual Chromium PNGs (`W10B18_0_RIGHT_SHOULDER_LIVE.png`, `W10B18_1_LEFT_SHOULDER_LIVE.png`, `W10B18_2_RIGHT_SHOULDER_RESTORED.png`) with distinct byte hashes.
- Original B15 real mouse fire and native CPU defeat/respawn, CPU visible framebuffer restoration, all stayed green.
- Native B16 7-CPU source patrol stayed green: ~702.9m aggregate actual source-local patrol, **87 autonomous source paint shots**, **92 native paint impacts**, 11,064 CPU ink cells changed. Still **0** native paths among 12 true-foot cross-team pairs; HOLD.
- [B14 actual WebGL2 render regression](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39129708978): **SUCCESS** for the same latest script HEAD `c6de20bbf37c`.
- [Windows + Ubuntu QA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39129529740): both **SUCCESS** at gameplay runtime commit `7e78a9d88333`. Subsequent `c6de20bbf37c` changed only the Chrome smoke script.

## Source authority unchanged — limitations

Stage collision solids 25, paintable physical surfaces 17, Recast NavLinks 26, scoreable surfaces 0, `activationReady=false`. CPU and player spawn provenance is source-supported QA, not certified original official 4v4. Natural opposing-team firefight, original underpass, `Vss_Temple01` Banc/SetActor instance positions and Turf score mask remain **HOLD**. No source mesh, private archive or unverified spawn is uploaded. main / PR #5 / production unchanged.

**Next decision:** W10-B19 should collect **real Chrome frame-time / camera clipping / input latency measurement** with low-noise bounded user-visible QA, then improve only demonstrated issues. Immediately prioritize original Banc/SetActor placement authentication if valid user-provided local source data becomes available; never add imaginary stage geometry.
