# Browser Ink TPS — B258 native third-person composition ART gate

**2026-10-28 JST — TECHNICAL PASS / ART HOLD.** No release, default-camera, verified source physics or official 4v4 authorization.

## Provenance

- QA branch `dev/t21-f4e103w-qa-infra`; B258 implementation `9f03859b4ec2231f00d86eb1db437a75f20af786`; final verified implementation `1b842b12e236cb61cdca517e6a238d532c85f4ec`.
- [Authentic Chromium WebGL2 final PASS: F3G run 40588236399](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40588236399), artifact `t21-f3g-full-original-source-proof` **12773630192** (screenshots and witness JSONs).
- `b258-frozen-native-camera-abca.json`, `b258-real-ink-camera-abca.json` are authoritative run evidence; read these and the actual PNGs, not only CI green lights.
- Source assets remain hash-pinned and fetched inside CI; **57,578 original UV triangles / 19 verified textures**. Genuine registered SOURCE playable authority **25 Rapier solids / 17 paintable surfaces / 26 NavLinks / 0 scoreable surfaces**. No cross-team full map route certification (0/12). The gap is about **31.716m** and unresolved. Not a full 4v4 match.
- Protected main/stable/public Pages/Draft PR #5 unchanged. No original OBJ/MTL/PNG/Banc source assets committed.

## Native method

B258 is URL-opt-in, nonproduction STAGING research: `t21Play=preview&t21FullSource=review&t21B253=liveInk&t21B255=actorStudy&t21B257=depthAudit&t21B258=cameraStudy` (existing CI also requests B256 but B256 screen aperture must be OFF for optical depth audit). It uses the **actual ThirdPersonCamera** and original `castStageSegment(...,'camera')`, never an invented camera collider. Only when paused; retains actual actor positions and native mouse/shot source physics. Three compositions:

| ID | requested distance | pitch | shoulder |
|---|---:|---:|---:|
| BASELINE | 6.4m | -12° | 0.72m |
| REAR_WIDE | 8.8m | -12° | 0.72m |
| ELEVATED_RIGHT | 8.0m | -21° | 1.20m |

After each frozen A→B→C→A: real original camera position, original 8 actors, stage and framebuffer restored without a single differing pixel. Baseline is recaptured for subsequent post-real-ink stage, not improperly reused from before the player moved.

## Verified same frozen real WebGL2 composition

- True baseline human apparent center-to-head screen extent **158.21px** (not bounding box or screen area); nearby ally A2 **140.86px**, ally A3 **139.74px**.
- REAR_WIDE human **114.88px** (−27.4%), A2 **105.41px**, A3 **104.84px**.
- ELEVATED_RIGHT human **121.03px** (−23.5%), A2 **111.23px**, A3 **110.38px**.
- Native Rapier-camera clipping state for both variants: **not clipped**. Report does not claim optical mesh is a collider, nor does it certify camera positions for production gameplay.
- Different-camera 1600x900 framebuffer **1,147,164 changed pixels (79.664167%)**, restored to baseline **0 changed pixels** (from `b258-frozen-native-camera-abca.json`). Changed pixel ratio does **not** indicate quality improvement.

## Verified real gameplay-facing comparison

- Actual human keyboard motion **2.119751m**, **10 accepted player shots**, **115 truly changed SOURCE ink cells**. B256 optical opacity aperture disabled.
- Paused after native pointer-lock release (no fabricated mouse input/actor move); candidate cameras and 9 original UV ray + separate real 25-solid Rapier ray diagnoses taken on the same post-play world state; original A→B→C→A frame exactly recovered.
- `b258-real-ink-camera-abca.json`: **1,150,129 changed pixels (79.870069%)** from baseline to REAR_WIDE, **0 pixels** in baseline restore.
- See real snapshots `B258_INK_A_ORIGINAL_NATIVE_CAMERA.png`, `B258_INK_B_REAR_WIDE.png`, `B258_INK_B_ELEVATED_RIGHT.png`, `B258_INK_A2_NATIVE_CAMERA_RESTORED.png`, plus paused-before-play `B258_A_FROZEN_ORIGINAL_NATIVE_CAMERA.png`, `B258_B_FROZEN_REAR_WIDE.png`, `B258_B_FROZEN_ELEVATED_RIGHT.png`, `B258_A2_FROZEN_NATIVE_CAMERA_RESTORED.png`.

## Honest image/ART evaluation: HOLD

Images show real actor size reduction but **a huge near-field grey original structure/floorline/wall remains centered across much of the lower viewport**, with complex semitransparent original background and large debug/HUD panels occupying the sides. The source-painted 115 cells are not easily discriminated as a continuous Turf-painted traversable floor. Raising camera pitch/right shoulder alone does not solve the mismatch between optical original UV depth and certified Rapier physics or restore natural stage readability. The approximate percentage reduction in actor projected height does not certify gameplay visual quality.

**Do not promote either B258 candidate.** Continue disabled/explicitly opted in. Keep official match, scoring, 4v4, crossing and production release HOLD.

## Failures, fixes, and regression provenance

1. Initial F3G run `40585186480` failed a pre-existing B30 **byte-identical PNG** assertion. The original vs returned frame differed in only **258/1,440,000 pixels, max RGB channel Δ1**, with >1000000 intentional cutaway pixels. Corrected to the existing B77 constrained raster rule: ≤0.04% low-bit pixels, max Δ1; no unbounded tolerances. Fix `5e2dad505122c1eef4d42bd20e1ea7e5458648ca`. This does not change actual stage materials.
2. Run `40586435392` reached frozen **B258_CAMERA_ABCA_PASS** and authentic shot+ink **115 cells**, then rejected post-shot B257 audit because genuine CDP pointer lock was still engaged. This is an audit authority protection, not stage failure. Fix: exit genuine pointer lock before pausing and probing; final commit `1b842b12e236cb61cdca517e6a238d532c85f4ec`, final run **40588236399 SUCCESS** including real-ink B258 A/B/C/A.
3. A1 coop `40585186533` **FAILED** with `B140_WAIT_TIMEOUT` **AFTER** native A1 collaboration `B162_NATIVE_ORIGINAL_ALLY_SYNC_CLEAR`: true human source paint **808 cells**, **40 new real A1 tagged ink cells**. Do not conflate later timeout with failed A1 painting or assert B258 visual change caused it. Earlier B257 A1 run `40519673816` SUCCESS. Stability still needs isolation.
4. B210 180-second authentic source runs: earlier `40585186506` **SUCCESS**; later `40586435418` and `40588081850` were in progress at last handoff check and must be re-fetched, not declared PASS.

## B259 recommendation — quality-first, not parameter sweeping

The most promising next question is **why original verified visual optical near-wall/DETAIL planes still dominate the lower viewport even when real camera visibility is improved**. Work on a targeted evidence-first diagnostic of rendered surface identity vs original stage physical solidity, human/ally projections and readable real ink. Measure screen occupancy by `DETAIL`, optical `GLASS`, real actor silhouettes, HUD overlay and *actual verified paint surface* separately. Inspect the SOURCE structure and relevant existing compositing/depth pipeline before any design change. Compare playable-facing native WebGL2 frames with/without diagnostic UI overlays only in opt-in QA (never hide actual failure to create a flattering screenshot). If actual gameplay improvement cannot be clearly demonstrated, ART HOLD. Do not simply repeat large global shader transparency sweeps or arbitrary camera-height sweeps.

Maintain original 25/17/26/0 and authentic 0/12 crossing, no synthetic roads/NavLinks, fake actor teleport/ink/scoring or raw source redistribution. Preserve stable refs and main, validate Actions and summarize real commits/results.
