# W10-B76 — Human shot/confirmed source paint + actual ink refill feedback

QA branch only. Baseline `fc620f661b489d6fecea0f9eff2d6bd96216b991` (B75 genuine FIXED+SWEEP Chromium PASS). Date: 2026-10-21 JST. Main, public Pages and Draft PR #5 unchanged.

## User-facing game-feel improvement, not an additional debug panel
- Add a compact **YOUR SOURCE PAINT · LAST 3s** row directly below the existing B75 CPU source-ink section of the top-center native gameplay HUD.
- Display only the measured recent actual Human Impact changed source-paint cells, genuinely accepted human weapon shots and dry-fire attempts. Counter activity is sampled at real 60Hz native physics tick by reading the already existing `b23HumanInkFeedback.humanChangedCells` and `stats.shotsFired`; zero-change projectiles or dry-fire may not produce fake painted cells.
- Read native PlayerResources' `playerInkRecoveryState` and real `inkDryFireAttempts` without mutating player resources, paint coordinator, input or game time. When ink is low, the HUD provides an actionable **Hold Shift on your own ink** tip grounded in actual PlayerInput's Shift→squid and own-ink recovery condition. When truly squid and own ink recovery is active, the HUD says **REFILLING · OWN INK**. This is a contextual practice aid, not a new ammo or movement mechanic. No official scoring or claimed hit percentage.
- Do not divide source paint cells by shots to invent hit-rate: bullets may hit later than firing, and already owned cells/geometry can affect new cell count independently of enemy/player combat.
- The 180-native-tick window deduplicates repeated PlayCanvas render refresh for a single physics tick and fail-closes on negative, nonfinite or decreasing native counters, unsupported player modes, original 25/17/26/0 drift, or any original 4v4 certification claim.
- Existing B23 transient confirmed source contact marker, B75 source CPU display, CPU default FIXED, B64/B68 opt-in SWEEP and all original 25/17/26/0 gameplay authority are retained unchanged.

## Real verification
- Add `UndertowF3HumanInkCoach.test.ts` cases for native shot-vs-actual-changed-ink distinction, same-tick deduplication, genuine dry/recovery states, 3s window expiry, invalid metrics and incompatible legacy HUD fixtures.
- Integrate into the **already existing** two-lane B75 short WebGL2/Rapier/Recast/Chrome smoke (FIXED and explicit SWEEP), to avoid four redundant long-run workflows. Require actual physical browser mouse input, observed real Human source ink increase, visible/accurate B76 labels and read-only source gate. We do not accelerate ticks or fake paint.
- Existing B75 full workflow reruns two genuine ~13 native seconds source sessions with screenshots; this is **not** a full owner Windows/RTX gameplay performance study and does not test official 4v4.
- At authoring, newly pushed exact-SHA CI is PENDING. Do not mark this B76 step PASS until workflow results confirm all jobs succeeded.

## Original Undertow authenticity HOLD
- Original collision solids 25, source-native Paintable 17, audited native NavLinks 26, Scoreable 0.
- Original SetActor/Banc identities and 8 PntSet component transforms/mesh bindings unresolved; 0/12 natural source paths between opposing teams; `activationReady=false`; none of these are created or promoted by B76.
- No inferred winner, Turf scoring, official 4v4, owner-GPU FPS, successful original enemy encounter, user-production publication, source-actor placement, artificial bridge or fake physics.
