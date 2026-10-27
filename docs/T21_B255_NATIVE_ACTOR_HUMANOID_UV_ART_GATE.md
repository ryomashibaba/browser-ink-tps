# Browser Ink TPS — B255 native humanoid / SOURCE original UV art gate

**2026-10-27 JST**. Branch `dev/t21-f4e103w-qa-infra`. Implementation commit `f42692b94933597ca4e5f2f4e59f6ab24c9142a7`.

**Decision: TECHNICAL PASS / ART HOLD. No production promotion.**

## Problem and precise intervention

B254 proved that the three near-camera cyan capsule shapes seen through translucent B253 static UV architecture came from the **existing genuine native Player and seven CPU render components**, not missing Temple01 buildings. B255 therefore does not hide the actors or rebuild models. It allows an explicit *nonproduction*, paused SOURCE + verified original UV + B253 ink-safe research route to reversibly switch the same actor Entities between the old capsule renderers and the existing B248/B249 14-part humanoid/gear renderers. Player/CPU controllers already use B248 for a separate genuine full-180s mode, which B255 leaves unchanged.

B255 opt-in `?t21Play=preview&t21FullSource=review&t21B253=liveInk&t21B255=actorStudy` alone is not sufficient: valid SHA-verified UV pack, 7 actual existing CPUs, paused STAGING, verified 25/17/26/0, ink-safe B253 mode explicitly enabled, no full round / pointer lock / competing study must also pass. B255 cannot change actor/AI/HP/coordinates, Rapier physics, Recast links, source OBJ vertices, paint authority, scoring or published game modes. Native model preview and camera return to their prior representation.

## Real Chrome/WebGL2 evidence

- [B255 full-source original UV Actions run](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40512342237): **SUCCESS**.
- Artifact: `t21-f3g-full-original-source-proof` ID **12738052066**. This contains the actual 1600 × 900 native PlayCanvas WebGL2 framebuffer images, **not generated mockups**.
- Freeze at SOURCE tick **140**: `B255_A_CAPSULE_SAME_CAMERA.png` → `B255_B_EXISTING_HUMANOID_SAME_CAMERA.png` → `B255_A2_CAPSULE_RESTORED_SAME_CAMERA.png`.
- Model substitution: **39,545 changed / 1,440,000 pixels = 2.746181%**, of which **33,068** have channel differences ≥8. Original image restoration: **0 changed pixels**, byte-identical frozen screenshots. Physical player position and tick unchanged.
- **Real-input follow-through**, `B255_REAL_HUMANOID_SOURCE_UV_INK_PLAY.png`: actual keyboard movement **2.119751m**, **10 real shots**, **115 real human-owned changed SOURCE ink cells**. Sample remained source STAGING, not certified natural full 180s/4v4; no official points or winner.
- Machine evidence: `b255-native-actor-humanoid-ab.json` and `b255-native-actor-real-ink-play.json`.
- SHA-verified original OBJ UV/albedo **57,578 original static triangles**, 19 validated textures. Native source authority remains 25 Rapier solids, 17 paintable surfaces, 26 genuine NavLinks, **0 scoreable**. Certified opposite-team crossings remain **0/12**; ~31.716m underpass gap unresolved.
- Regression: B255/ B254 opt-in tests, original material tests, TypeScript typecheck and Vite build **PASS**. The WebGL2 test passes. This does not imply art acceptance.

## Actual visual assessment (not merely pixel metrics)

**ART HOLD.** The three plain cyan cylinders are now recognizably small-headed, two-legged player/CPU silhouettes with visible body/helmet/gear parts. This is real visible change, but the three foreground actors **still dominate the lower-center frame**, and the coarse primitives are stylistically far from an appealing third-person shooter. In the real-input image the large original optical structure cuts across the same viewport region, producing confusing character/architecture overlaps. The foreground wall obscures the lower screen. Paint ownership telemetry proves 115 changed cells, but the actual paint region is not clearly legible in the pictured game camera. The dense translucent optical mesh and grey block masses still make the intended floor and route ambiguous. The debug/status HUD occupies a large proportion of the view.

**Do not describe a 2.75% visual pixel difference as a 2.75% quality gain.** Do not describe numerical painting as adequate feedback when the player cannot find it in the framebuffer. The reason for ART HOLD is visual composition/depth and source physical-to-optical mismatch, not insufficient text, a lack of test counts, or the need for arbitrary recoloring.

## Next quality-first decision

**B256 should focus on camera and authentic *render-only* depth/occlusion composition**, before additional character details, cosmetic material changes or more tests. First diagnose the camera eye position and ray path versus (a) the authoritative 25 original Rapier solids, (b) the original UV optical triangle geometry, (c) the existing actor positions, and (d) the painted SOURCE surfaces. Reuse prior W10-B26 smart camera and B252–B255 real-browser comparison infrastructure. Never certify or physically promote the UV wall as an original Rapier obstacle. Test an isolated optical-only solution, not a globally opaque wall that might simply hide the playable floor.

Then compare the *same real camera* before/after and a **real movement + shot + changed ink** state. An art improvement requires a readable character silhouette that does not obscure the actual path, a legible floor/paint region, and coherent foreground depth. Preserve diagnostic data in QA but simplify the gameplay-facing HUD only under a separate explicit presentation option after the play view itself improves.

If all proposals still obscure the floor or paint, retain ART HOLD and move to a more fundamental stage/camera-composition study, not another colour adjustment. **main, stable build, published Pages and Draft PR #5 remain untouched. No raw OBJ/MTL/textures/private Banc committed.**
