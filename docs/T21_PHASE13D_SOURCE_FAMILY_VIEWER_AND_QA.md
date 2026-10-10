# T21 Phase13D — Original Source Family Lens, Review-only

Purpose: make route-oriented original-source surfaces distinguishable from vertical/high source geometry, without inventing floors, caps, walls or gameplay collision.

Three modes: OFF leaves every existing original review preset unchanged; WALK_ORIENTED temporarily selects five existing original-source families; VERTICAL_HIGH temporarily selects ten existing vertical/high/underside source families. Both hide five macro/debug/non-original display roots while active. Saved enabled-state flags for all 20 roots are restored exactly when OFF, or upon manual layer/preset changes. This is display family isolation, NOT physical Y altitude clipping.

An optional small top-right HUD states which evidence is visible and warns that collider, navigation, ink, scoring and walkability remain UNKNOWN. It is hidden by default in all standard screenshots.

Actual Chrome QA: after unchanged canonical five BASE captures, Phase13B two BASE UI-free captures, and Phase13C two CENTER_FOCUS captures, capture WALK_ORIENTED and VERTICAL_HIGH original-source displays on one identical centered camera in the same Chrome process. Restore OFF and BASE. Verify actual PNG SHA, dimensions, renderer, source-family root signature 5/0 vs 0/10, no release authority, and visually distinct scene pixels. No second browser boot or full source geometry scan.

CI optimization preserved: every commit goes to fast typecheck, complete existing unit tests and screenshot negative tests; full original/Pass18/Phase12 and real screenshots only at integrated checkpoints or when source/physics could change, always at final release HEAD.

Frozen: production T20 inkworks-junction, T21 activationReady=false, PR #5 Draft unmerged, Visual Freeze not approved; 124 default source displays, 64 walk-source components, 42 XZ hard outline, 22 additional original source-only review components and 28 held candidates. No new game geometry, CPU, collider, paint, nav, scoring, activation or merge.

Next direction: use actual browser A/B result to choose a default reviewer preset and then shift toward explicit source-authorized playable corridor implementation planning (Phase14), not an endless provenance microaudit.