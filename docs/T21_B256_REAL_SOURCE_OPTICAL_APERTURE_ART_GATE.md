# Browser Ink TPS — B256 authentic SOURCE optical sightline study

Date: **2026-10-27 JST**. Target QA branch `dev/t21-f4e103w-qa-infra`.
Implementation commit: `c7da0aaa94d73e4947de34ea158f89566671007f`.
**Gate: TECHNICAL PASS / ART HOLD. Not approved for default or production.**

## Why this was attempted

B254 proved that three large near-viewport cyan capsules were the actual Player and CPU render proxies. B255 successfully replaced these with existing B248/B249 14-part humanoids under a source-only visual flag, but the optical original stage structure still confused character depth, floor and real ink visibility. Simply recoloring source geometry or adding fake physics was forbidden.

B256 therefore tests a tightly bounded alternative: an **explicitly nonproduction camera-screen-local transparency aperture**. It overrides only the PlayCanvas 2.22.1 opacity shader chunk of the 42 verified original UV material groups typed METAL/SUPPORT/STRUCTURE/DETAIL, not FLOOR/SLOPE/GLASS; keeps the exact verified original 57,578 source triangles and 19 albedo textures unchanged. Attenuation is maximal around the near-center lower-screen area, not a new geometry cut-out or a collider. This method does not use the optical mesh to certify physical traversal.

Research URL adds `t21B256=opticalAperture` to `t21Play=preview&t21FullSource=review&t21B253=liveInk&t21B255=actorStudy`. Only actual paused STAGING, human presentation, verified original texture pack and SOURCE 25/17/26/0 permit switching. Production, deterministic QA, active full rounds and ordinary preview cannot invoke it.

## Genuine WebGL2, not fabricated imagery

[Full-source B256 Chrome WebGL2 Actions SUCCESS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40515938885). Artifact `t21-f3g-full-original-source-proof`, **ID 12739722295**, contains 1600×900 native WebGL2 screenshots and JSON witnesses:

- `B256_A_HUMANOID_ORIGINAL_OPTICAL_DEPTH.png`
- `B256_B_LOCAL_SOURCE_OPTICAL_SIGHTLINE.png`
- `B256_A2_RESTORED_SOURCE_OPTICS.png`
- `B256_REAL_HUMAN_INK_OPTICAL_APERTURE.png`
- `b256-native-camera-optical-aperture-ab.json`
- `b256-native-source-optical-live-ink.json`

Identical frozen camera/source actor transforms: **487,260/1,440,000 changed pixels (33.8375%)**, of which **350,703 pixels have channel difference at least 8**. Original restored exactly **0 different pixels**; identical original and restored screenshot SHA-256. Static source tick **110**, actor movement **0** during frozen A/B/A.

Genuine WebGL2 real keyboard and mouse continuation: **2.119751m**, **10 shots**, **115 actual human-authored changed SOURCE ink cells**. The source does not supply verified scoreable areas or an opponent natural crossing: **25 Rapier solids / 17 paintable / 26 genuine NavLinks / 0 scoreable**, original opposite-team routes **0/12**. No official Turf win, unrestricted 4v4, production certification, original Banc instance placement or invented bridge.

Unit tests, source-gate tests, typecheck/build, shader execution, actual player input and reversible original raster evidence passed. These are technical facts, **not** an art promotion.

## Direct image evaluation: ART HOLD

The aperture visibly reduces the near central original optical wall's dominance and changes the view. However, the three close human/CPU silhouettes remain extremely large in the foreground, the local fade introduces ghostlike walls and dubious character-wall depth, and much of the lower screen remains occupied by a grey wall/plane. In the real shooting frame, a small cyan mark is visible ahead, but the 115 human painted cells are **not** a clear visually readable painted area. HUD/debug panels also obscure major portions of the playfield. The original foreground structure's identity and collision status are still confusing.

Crucially **33.84% changed pixels do not establish any percentage improvement in playability**. This screen-local transparency implementation is a *rejected-for-art-promotion research prototype*, not the correct final fix. It remains disabled by default and confined to its isolated URL.

## Regression separation

B256's linked A1 native cooperative workflow [40515939185](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40515939185) **FAILED** with `B140_WAIT_TIMEOUT` after a true start/resume; B255's preceding A1 run [40512342269](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40512342269) had a **different failure**: player 843 ink cells, A1 0 tagged impacts and no certified nearby goal. Do not conflate either with a deterministic causal proof against B256; do not invent an A1 route or synthetic paint to pass. Isolate performance/timing variance and genuine A1 source eligibility in a dedicated future lane rather than cosmetically relaxing guards.

Other new B256 CI at doc time: F4E103W QA and B234 physical CPU readiness SUCCESS; B75 and B210 were still executing. Avoid launching duplicate historical 180s suites simply to increase green counters.

## Next quality-first action: B257

**Stop iterating arbitrary opacity/color.** Diagnose the real optical wall crossing against camera position, SOURCE 25-solids visibility and real human/CPU projections in *world geometry* first. Assess whether to improve the camera framing or use bounded depth-based optical visibility **without treating any static optical triangle as physically certified**. Compare gameplay-facing screenshots rather than debug-only paused captures, and quantify whether actual human ink becomes findable on the floor. If the source floor cannot be visually separated from the original static presentation, stay ART HOLD and investigate a more fundamental source integration/camera approach rather than another tint or parameter sweep.

No changes to main, stable, published Pages or Draft PR #5. No original raw OBJ/MTL/PNG or private Banc was committed or included in reports.
