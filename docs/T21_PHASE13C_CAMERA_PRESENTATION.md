# Phase13C: central focus camera for genuine source-only review

Problem: Phase13B actual OVERVIEW/TOP UI-free images are not ideal for inspecting the center source structural hierarchy. This milestone adds a user-selectable CENTER_FOCUS camera to the T21 REVIEW APP ONLY. Existing BASE framing and all five canonical evidence shots stay unchanged. CENTER_FOCUS for OV/TOP uses original stage XZ bounds center, Y=8.5 camera target, overview yaw30/pitch53/distance max(32,span*.58); top yaw0/pitch80/distance max(32,span*.62). The Y value is a camera aim, NOT a gameplay geometry position.

The review controls now have whole-stage and center-detail framing. URL parameter reviewComposition=CENTER_FOCUS selects a focused view without touching the production stage. A DOM dataset records review camera mode and pose key. Every focus switch changes ONLY camera aim, angles and distance. No source original vertices, caps, objects, render mesh counts, collision, paint, nav or CPU path change.

The same existing Chrome/PlayCanvas five-view suite captures all five canonical BASE shots and Phase13B UI-free BASE comparisons first, then two optional camera-only CENTER_FOCUS UI-free PNGs in the SAME browser and active scene, and restores BASE before the next canonical view. The Phase13C QA independently checks original PNG bytes, SHA256, manifest original camera/pose state, nonduplicate source pixels, and measured colored-geometry bounding rectangles. These metrics indicate image difference, NOT proved improved gameplay, map connectivity, walkable floors or human Visual Freeze.

Speed: NEW short-loop t21-fast-feedback.yml still runs full existing Vitest suite, TypeScript, source JS syntax and negative capture QA on every PR synchronize. Full legacy Pass18 / pinned OBJ / phase12 / WebGL2 screenshot QA remains for integrated review checkpoints and before any release (exact candidate SHA success mandatory). Fast does not substitute for full.

Future Phase13D: visually compare the actual focused pair to the BASE pair, choose best route/elevation presentation and add a compact source-confidence legend if warranted. Stop repetitive source microtopology QA; pursue real stage quality only under explicit source/physics authority.

All Holds: PR #5 Draft open unmerged. T20 inkworks-junction production. T21 activationReady=false, Visual Freeze not approved; normal source 124 meshes, walk inventory 64, hard outer XZ 42, optional source-only 22 parts 488 triangles, held 28 more candidates 616 triangles. NO runtime promotion, floor, collision, nav, paint, score or merge.
