# Browser Ink TPS — W10-B19 input, live frame and camera checkpoint (2026-10-18 JST)

**Scope:** nonproduction T21 F3 opt-in source lab only, `dev/t21-f4e103w-qa-infra`. Parent checkpoint `edde3a60c1f37a8a392cb4224d8cd2cc3e55591e`. Implemented/tested code HEAD `21d0241077c9996027ca9aeb9e1a99d7902a54ed`.

## Shipped source-only behavior
- Real mouse **press and release entirely between 60Hz fixed ticks** now retains a one-tick primary press, without modifying continuous held fire; first click to request Pointer Lock is still not a shot. W10-B19 genuine CDP/Chromium pointer events -> PlayerInput -> same native ProjectileSystem -> shotsFired increased after **one native fixed physics tick**. This is not synthetic projectile or HP mutation.
- The F3-only live-loop pre-tick camera update was removed. True camera updates remain inside the fixed physics tick before Projectile aim and once after interpolated rendering, and **both use the same original Rapier stage collision ray**. No source physics/collision bypass. Screen-center original blocker guidance suggests Q shoulder switching when camera retracts under 2 m; the blocked-view visual has **not yet been independently screenshot-certified**.
- Bounded 180-sample live PlayCanvas update callback interval p50/p95/p99, fixed-step ticks/dropped time, camera ray count and genuine pointer event to accepted native shot measurement are available in the explicit F3 snapshot and folded developer diagnostics. Paused deterministic QA latency is excluded. This is **not** a GPU timer, frame presentation timing guarantee, or human RTX measurement.

## Tested GitHub Actions at code HEAD `21d0241077c9`
- [B15 + B16 + B18 + B19 real Chromium WebGL2](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39132601016): **SUCCESS**. Genuine quick-tap native projectile, prior B15 mouse HP/splat/respawn, render PNG pixel comparison, B18 Q/M, genuine live camera optimization and B16 seven CPU patrol.
- [B14 real Chrome CPU render lifecycle](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39132601100): **SUCCESS**.
- [Ubuntu + Windows source QA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39132601105): both **SUCCESS**, not owner Windows GPU LIVE PASS.

### Native live Chrome source-only metric (SwiftShader headless runner)
- **18** callback interval samples: **p50 242.7 ms, p95 483.4 ms, p99 483.4 ms**. These reflect this software-rendered CI environment only. Do not convert into a general GPU FPS claim or assert uplift from the B18 baseline; no controlled baseline GPU frame-time distribution was collected.
- In the measured continuous section, **92 native fixed ticks + 17 actual frame callbacks = 109 original-stage camera raycasts**. The previous structure performed one extra pre-tick ray per callback, so **17 unnecessary casts are structurally avoided over this section**. No claim of proportional render performance improvement.
- B16 independent true seven CPU source-only patrol still passes: **87 native source turf shots / 92 native ink impacts / 11,054 changed cells / about 700.95 m aggregate real-foot patrol**. Genuine opposing-team native paths **0/12** (HOLD), nearest gap about **98.75m**, no natural full 4v4.
- W10-B15 visible native respawn compared from identical camera: **9,042 changed pixels / 8,967 magenta gain**; local QA CPU placement, not original natural enemy encounter.

## Provenance / freeze
- Original T21 supported collision **25**, paintable **17**, original NavLinks **26**, formally scoreable **0**, `activationReady=false`. `Paintable != Scoreable`.
- No original unplaced Actor matrix certified, no fabricated floor/bridge/warp/nav/score/collision, no leaked nonpublic original OBJ/Banc/BYML geometry.
- `main=fbd922cea900df8e1a139f21b3c61ed927b3fdd9` unchanged; PR #5 separately draft/open/unmerged at `8cfc95756ef0...`; T19C/T20 and production Pages untouched.

## Continuing HOLDs and B20 dependencies
1. Correct `Vss_Temple01` original Banc/SetActor instance placement, version/normal PvP identity, underpass and true supported central/side connectivity require lawful locally verified primary evidence before any gameplay authority.
2. A naturally continuous 1-human+7-CPU match, real original navigable enemy contact, scored Turf victory and Visual Freeze are **not proven**. Native 0/12 cross-team paths remain HOLD.
3. Headless software renderer has severe callback delays; profile CPU simulation vs browser render/GPU atlas on a controlled browser/real PC before claiming an FPS gain. Do not repeat 0/12 audits without new source evidence.
4. Validate obstruction banner on an actual source geometry clipping case and actual user Windows GPU responsiveness at a meaningful manual playtest milestone; no repeated manual ZIP tests.

**Direction / plan / efficiency / evidence audit:** original v7.2+ 4v4 goal and source authority preserved; gameplay quick-click reliability improved, redundant camera work removed; existing integrated Chrome lane reused; CI headless, owner Windows, natural 4v4 and original source verification remain separate evidence classes.
