# W10-B130 — F2/F3 registered original flat floor edge guidance

2026-10-23 JST. **QA only**. Builds on B129's genuinely source-based
right raised-floor warning without inventing walkable surfaces or traversable
connections. Adds a pure inspector for every original-source, physically
registered, unrotated flat footprint and its source holes. Rejects
mesh/slopes/GRATE/disabled collision, mismatched true Rapier source ID, stale
tick, invalid body Y, paused/unhealthy human, original source drift.
Display only reports **original foot-center distance**, not capsule safety
or a confirmed possible route. Physically safe KCC or actor movement is
not modified. The old B129 audit API is retained as compatibility fallback.

B129 known last real B127 run remains HOLD: [CI #39943003186](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39943003186).
New Vitest tests use two actual B126/B127 native raised coordinates to
check numerical equivalence with B124's original raised polygon, plus the
real native first-drop Y3 landing coordinate for generalized warnings.
B75 existing workflow preflight now runs *B129 and B130 tests* with the
TypeScript/Vite build and former ink HUD tests. FIXED/SWEEP real Chrome
jobs are separate source-ink regression, not visual proof of the new
warnings. Actual source-floor near-edge browser screenshot remains HOLD.

Do not promote 25/17/26/0, 0/12 routes, scoreability,
activation, production or unrestricted real 4v4. Do not touch
main, frozen PR #5 or Pages. Further work must tackle meaningful
F2/F3 interconnected physical routes and match play, not endless
microtest steps.
