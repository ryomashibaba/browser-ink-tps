# Browser Ink TPS / Undertow F3 SOURCE — B268 protected actor silhouette art candidate

**2026-10-28 JST. Stage: B268 opt-in genuine WebGL2 A/B/A test. Status: candidate NOT accepted, ART HOLD, unrestricted original 4v4 HOLD, production forbidden.**

## Why this, not another optical material toggle?
Previous B265/B266 optical material tests showed source glass, metal and detail foreground overlap the actual ink region, but deleting an original material changed the whole scene and actors; **B265 renderer deletion is rejected as art**. B267 compared three already captured native camera views, and no camera profile passed holistic visual review. The bright proxy-like silhouettes and unhelpful foreground are still visually problematic.

## New candidate: B268 COMPACT SOURCE ACTOR

Keep the same existing Rapier human + seven CPU actor entities, positions, animation direction, input, ink ownership, and stage. Two **render-only** representations for the same existing B248 visual kit:
- `B248_ORIGINAL`: the current original 14-part human variant, unchanged default.
- `B268_COMPACT`: optional **21-part PlayCanvas native 3D render geometry**, finer proportions and predominantly low-glare blue-gray armor/fabric. A smaller dark helmet with a narrow team-readable visor, selective original cyan/pink team ID marks, distinct tank/weapon profile, slimmer torso, legs and arms. Both teams retain proper identity. This is not original source-game actor asset reconstruction and does not certify actual gameplay.
- No imported/generated new official asset, source original optical mesh change, original OBJ/texture edit, fake collider, new geometry used as player collision, camera move, actor relocation, navigation, paint or score change.
- The B268 root is lazily instantiated on **first authorized frozen source study request** and remains disabled in the source default mode. Thus existing gameplay default retains B248 and incurs no new mesh work.

## Native test sequence
Only under URL `t21Play=preview&t21FullSource=review&t21B253=liveInk&t21B255=actorStudy&t21B263=paintProjection&t21B268=actorComposition` with genuine WebGL2 staging pause, exact source UV, 19 textures, baseline Rapier-clipped camera, B255 HUMANOID, original raster restored, no B256 aperture, no hidden B260 original material, non-deterministic input and original **25 solids / 17 real paint surfaces / 26 NavLinks / 0 scoreable**.

`FROZEN`: A baseline native 1600×900 screenshot → B candidate 8-actor render → A2 exact original restore. Camera/world tick/actor pose fixed, no ink painted.

`REAL_INK`: use actual human keyboard + mouse shooting, 115 painted ownerGrid cells in prior real run; pause and repeat A→B→A, require nonzero owner grid and on-screen samples, no movement or ownerGrid mutation. Both screenshots preserve original optical UVs in exactly the same frame. Both original / restored framebuffer pixels must match **exactly 0 changed pixels**. B must change **at least 500 real pixels and 200 strong pixels** to exclude false/no-op art tests.

Save `B268_FROZEN_A_EXISTING_ACTORS.png`, `B268_FROZEN_B_COMPACT_RESEARCH.png`, `B268_FROZEN_A2_ACTOR_RESTORED.png`, and equivalent REAL_INK trio, plus the two native evidence JSON files in original F3G artifact. Do **not** interpret a pixel difference alone as better game art.

## Acceptance criteria
1. B268 21-part geometry, material palette, named parts, source-only URL gate, and no-authority invariants pass Vitest.
2. TypeScript build, original F3G whole-source regression, real CDP/Chrome WebGL2 both A/B/A trials and ownerGrid restoration pass.
3. Independent **visual judgment** must actually inspect full-scene original vs candidate screenshots, close-up, actor/team readability, ink visibility and original scene composition. Large structure/optical foreground and inability to navigate source underpass remain HOLD.
4. A candidate that simply produces differently colored actors, appears as blocky turquoise tubes, loses team identity, worsens crosshair readability, or makes little whole-view improvement is **ART REJECT**, never silently accepted by a technical green CI.

## Efficiency and safeguards
- B268 source actor kit is **opt-in**; old camera/stage/physics/AI/weapon code unchanged. No large editor, Blender or external-account requirement; user does no ZIP unpacking.
- Existing B131/B173 F3G push-path fanout restriction remains: don't put `src/app/UndertowF3PlayablePreviewApp.ts`, `scripts/t21-f3-browser-smoke.mjs`, or the workflow YAML itself into the trigger list. Only new isolated art module and research smoke file can trigger F3G.
- No main or production branch writes, no official full 4v4, no scoreables, no source matrix reconstruction, no release without human approval.
