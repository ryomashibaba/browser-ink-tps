# W10-B225 — original two-leg ingress/egress, live keyboard QA

Date 2026-10-26 JST. Parent HEAD `fbbe32b9654609678f841194b14f5068200ed8e1`.

## Why

B224 proved that real pointer-locked W/S and Space through PlayerInput, PlayerController and Rapier could jump 2.074235m from original FloorConcrete01 to original outer Slope00 and in reverse, four stable isolated landings. However the scene included only two CI688 exact source faces, and never tested whether the same actual player could continue off the outer slope toward the original FloorConcrete02 across the next 0.518559m seam.

## B225 actual code

The original B224 input QA stays intact. A second explicitly opt-in B225 QA route (not a game/production route) registers **all five** verified CI688 components on only the selected side, next to the existing original **25 solids**; exactly 30 QA solids, 17 original paint definitions and 26 original nav links, but **zero runtime additions**.

Actual Chromium physically performs a real first jump from FloorConcrete01 to outer Slope00, requires 18 native grounded ticks with source ID evidence, then uses the **same real human** and another ordinary W/S press/release to continue toward original FloorConcrete02. No Space on the second leg; this is a genuine test of unassisted grounded continuity at 0.518559m. The trial records first FloorConcrete02 source support and whether it remains stable after real input release. The source floor mesh and physical world are never relocated. The extra source triangle meshes are QA-only and will NOT be promoted based on this test alone.

The diagnostic CI requires honest real 2m first-leg success and executed second-leg input, not automatic second-leg success. If the second seam fails, retain the failure to determine whether it needs a legitimate jump or alternative original route. Do not relax geometry, add bridges, fake foot support or convert a Recast path into KCC authorization.

## Official stage hold

Original live stage remains 25 solids/17 paint/26 NavLinks/0 scoreable; no CPU navigation promotion, no official encounters, productionAuthorized=false, unrestricted4v4Certified=false, officialWinner NONE. Historical CI #691 5+5 Recast insertion still failed and is not retried as a certification experiment. Next steps depend strictly on measured Chromium evidence.
