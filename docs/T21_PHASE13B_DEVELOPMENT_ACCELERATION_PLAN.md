# T21 Development Acceleration and Phase13B Matched-Camera Plan

Measured full build time on successful CI #1445/#1446/#1450: 538, 540, 585 seconds (mean 554s or 9m14s). 77 old Pass18 diagnostics account for 299, 297, 331 seconds respectively, about 56 percent of build. Local XZ source scan 70-77s, historical Phase12 chain 61-70s; complete unit tests plus TypeScript only 34-39s.

NEW STRATEGY: stop a source-microaudit-per-chat development process. Frozen Phase12 original SHA and evidence remain intact; focus on user-visible stage completion. Fast feedback on EVERY PR synchronize performs TypeScript, entire existing Vitest unit suite and negative screenshot gate. Full unchanged original-source/Pass18/Phase12 checks and browser evidence run on PR opened/reopened/ready/labeled, main push and manual workflow_dispatch. No historical QA step has been deleted. To request a full candidate checkpoint, add a PR label; if already present, remove then re-add it. The FULL run must match the release candidate HEAD SHA and succeed before ANY merge, Visual Freeze, gameplay/physics activation or release. Fast green NEVER substitutes for full. Branch-protection enforcement is not available via this connector; reviewers must verify manually.

Phase13B: reuse same existing Chrome browser and canonical OVERVIEW/TOP cameras; save the five normal screenshots first, hide only overlay panel CSS visibility, capture two additional 1600x900 real PNGs, restore panel. Preserve screenshot SHA and camera/preset/backend, check original and UI-free image hashes. Separate PNG pixel QA verifies scene stays materially similar outside panel and panel pixels change inside. Do not interpret this as collision, floor, nav, painting, scoring or gameplay connectivity evidence.

Next outcomes:
- Phase13C: bounded visual/material/route readability A/B, prioritized source-only approval decision; no invented platform.
- Phase14: separately approved source-evidenced playable path vertical slice; collision/camera/paint/nav QA independently.
- Phase15: 4v4 and four ranked-mode gameplay, CPU and movement QA, profiling and geometry acceptance.
- Phase16: exact-head full CI SUCCESS, independent gameplay and visual review, explicit user release decision then merge/deploy.
- For every major source/geometry/physics change, run full checkpoint immediately rather than waiting for release.
- Use one atomic batch per milestone and stop repetitive historical micro-audits unless source hash/digest drift or concrete acceptance failure demands them.

Hard freezes: T20 production inkworks-junction, T21 activationReady=false, PR #5 Draft/unmerged, Visual Freeze unapproved; 124 default source display, 64 walk-source, hard 42-point XZ, 22 reviewed original opt-in components (488 original triangles), 28 unused original candidates (616 triangles) HOLD. No added source faces, colliders, nav, paint, score, game activation, live deployment.
