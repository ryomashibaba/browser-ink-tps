# Browser Ink TPS — B254 authentic SOURCE actor capsule provenance

**2026-10-27 JST**. Target QA branch `dev/t21-f4e103w-qa-infra`. **Technical diagnostic PASS; source UV art promotion remains HOLD**.

## The resolved question

The B253 screenshot showed **three big turquoise capsule-like shapes** at the native camera. It was uncertain whether these were missing / incorrect original Temple01 objects, UV mesh artifacts or actor rendering.

B254 did a true 1600x900 Chromium/WebGL2 frozen-camera experiment at the *same native SOURCE player pose* and *same original UV asset state*. Only the `.render.enabled` on the already-existing real Player and all seven registered CPU render components was temporarily switched, without changing any Entity.enabled or physical/crowd component.

[GitHub Actions B254 actual F3G source review — SUCCESS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40505144658), artifact `t21-f3g-full-original-source-proof` ID **12735505045**. Evidence `b254-frozen-native-actor-visual-provenance.json` and four `B254_REAL_NATIVE_VISUAL_*.png` frames.

| Same-camera frozen review | 1600×900 changed pixels compared with all actors visible | Render visibility | Observed subject |
|---|---:|---|---|
| HIDE_CPU | **1.369861%** | Player on; all seven existing CPU capsule renders off | The **center** foreground cyan capsule remains |
| HIDE_PLAYER | **1.020694%** | Player capsule off; CPU renders on | The **left and right** cyan foreground capsules remain (plus a smaller distant CPU) |
| HIDE_BOTH | **2.390556%** | Player and CPU visual-only renders off | All three huge foreground cyan shapes disappear |
| ALL | **0%** | Full original actor renders restored | Exact baseline screenshot restored (byte-for-byte in the frozen test) |

**Conclusion:** The visual defect is caused by oversized plain native **Player + CPU capsule proxies becoming visible through translucent source-review UV geometry**, not by three new or mysteriously misplaced original Temple01 stage structures. The native SOURCE Actor bodies and original spawn / gameplay positions were not altered or inferred. This is a visual-layer and camera/depth composition deficiency; it does **not** certify the originally unplaced FldObj models.

## Safety / limitations

The transient isolation API only permits the explicitly opted-in B253 source UV research URL, while *paused, STAGING, no pointer lock, not the official 180s full round*. It never disables Actor Entity hierarchy, actor bodies, Rapier colliders, Recast agents, CPU AI, projectiles, HP or original registered stage geometry. The *ALL* actor visibility is restored and pixel-checked before the actual keyboard+mouse practice.

Frozen SOURCE authority **25 Rapier solids / 17 paintable / 26 genuine NavLinks / 0 scoreable**. The screenshot sample retains all actors; no official enemy crossing, 4v4 or winner certification.

Linked regression: B75 preflight [current run](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40505023052) succeeds, including B131 narrow Actions trigger tests; FIXED/SWEEP browser jobs should be evaluated independently. Genuine 180s source-only run [B210](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40500577852) **SUCCESS**: all 7 CPUs physically rejoined, 793 actual CPU shots by TIME_UP, true 180s/00:00, official score 0, winner NONE. No opposing-team path is certified.

## Art decision and next high-value action

**B253/B254 ART HOLD.** Hiding genuine actors in a released game is not an acceptable visual fix. Nor is recoloring the terrain or inventing new physical ramps. The next QUALITY-FIRST visual prototype should reuse the B248/B249 humanoid model already in SOURCE 180s; compare *real camera* original capsule versus humanoid proxies under a single opt-in render-only visual flag. Then focus on screen-space body framing, third-person camera collision with the real 25 solids, transparent depth interaction against original static walls, and genuine ink visibility. Promote only when representative real in-play images and actual movement/shots support it, while leaving normal preview and released game untouched.
