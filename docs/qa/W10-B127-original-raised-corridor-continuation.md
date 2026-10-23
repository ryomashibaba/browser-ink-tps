# W10-B127 — B126 raised original source continuing route

2026-10-23 JST. **Status before CI: IMPLEMENTED, NOT YET NATIVE-VERIFIED.**

Goal: from B126 genuine KCC on `UndertowT21D:right-low-team-a` at
[6.0372467041015625,5.394600868225098,38.68196487426758], source floor Y4.5 and edge margin 1.619m, attempt **two short real CDP KeyW12 phases** after replaying the prior 11 real-key phases. The existing source polygon geometry projects that moderate -Z advance remains within a narrowing corridor, but does NOT certify actual Rapier movement.

The historic shared B112 CDP runner is reused. Future follow-on source route plans now live in `scripts/t21-w10b127-original-corridor-plan.mjs` rather than repeatedly changing the shared runner and triggering 8+ unrelated historical Actions. We extend the existing B125/B126 workflow, not add another workflow, and stop triggering full native CI on Markdown-only report edits.

Fail closed if actual KCC leaves original raised floor, source polygon including holes, or required Y band; any native poll distance to source edge <0.60m or endpoint <0.65m; input steps do not occur, or the extra physical XZ movement <0.7m or Z-forward advance <0.6m. Actual source support, 5-ray, real KCC and recorded phase Tick remain distinct from geometric prediction. Record JSON/screenshots even on failure. **No geometry/NavLink/score/CPU pose changes.**

Even on PASS: 25 original solids /17 paint /26 NavLinks /0 Scoreable, opposing paths 0/12, local proxy exclusion uncertainty, and full natural 4v4 all remain HOLD. Further micro-step QA must be justified by reaching a new meaningful connected source floor, rather than arbitrary B-number growth.
