# W10-B141 — Human-readable live A1 teammate elevation/position, opt-in only

2026-10-24 JST, QA branch only.

## Actual trigger
B138 genuine Chromium 180s [CI #39976080987](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39976080987) finished on both FIXED and ALLY, 7/7 physical CPU first-drop returns, 0 physical CPU position relocations, 3,615 CPU paint-changed cells. Native candidate checks 650 but **0** A1 source-goal approvals in ALLY. The human KCC body remained near Y=8.395m while real A1 physical foot was Y=4.472m at TIME_UP. This is a user-visible vertical-location problem, not verified A1 route failure. B139/B140 true keyboard descent remains CI queued when B141 was authored.

## Visible source-practice improvement
Only explicit `t21W10B137=allyRally` nonproduction F3 mode gets a compact teammate proximity overlay. Every render reads actual human KCC position corrected by the canonical body-foot offset and real CPU A1 Rapier `physicalFoot`, with horizontal separation, vertical difference, and actual 7/7 CPU readiness. Clearly distinguish A1 below, above, non-grounded, outside possible source-lower range, or prior source goal requests. **No verified path or physical meeting is asserted**, even after earlier Recast goal approvals. Display stops in TIME_UP, survey and gallery. Normal FIXED default gets no overlay.

Code is view-only; no CPU target, collision, original stage geometry, scoreable mask, player movement, shooting, simulated tick, or NavMesh was modified. Original 25 solids/17 PaintSurface/26 NavLinks/0 Scoreable, opponent original routes 0/12, productionAuthorized=false, unrestricted4v4Certified=false, activationReady=false, formal 4v4 HOLD.

Regression: B75 TypeScript/Vitest and real WebGL2 FIXED/SWEEP. Do not claim this UI solves actual teammate physical meeting or genuine original human descent until native evidence exists.
