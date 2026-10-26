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

## B225 actual native result — run 40291516269 (SUCCESS)

The real two-leg Chromium trial passed on **both** original mirrored sides. With one real PlayerController and **one** physical Space input per trial (on the 2.074235m floor-to-outer-slope gap), the actual KCC obtained source support in this exact order:

- Positive side: FloorConcrete01 -> outer Slope00 -> FloorConcrete02; latter support at native tick 152, became stable at tick 169. Minimum second-endpoint error 0.104314m.
- Negative side: same sequence; latter support at tick 148, became stable at tick 165. Minimum endpoint error 0.093028m.

No character relocalization after initial lab spawn; no collision with the existing 25 solids. All five additional source components are **only** active inside the 30-solid QA scene. Separately, B224's actual browser 4-direction regression passed again in run 40291516461. No full stage route can be certified from these successes.

## Fail-closed B225 regression gate and second-leg airborne evidence

The B225 browser workflow now **requires** both stable FloorConcrete02 landings, strictly ordered support transitions, first jump stability, no second Space input, no original-stage collider collision and no teleport after initial QA spawn. It separately records all real native grounded ticks, ungrounded ticks and longest airborne streak *after the first leg's stable landing*. Consequently, a briefly airborne 0.518559m second seam cannot accidentally be described as always-grounded walking. Only real KCC grounding determines whether the character remained supported, even when no second Space was sent. A workflow PASS is still a 30-solid lab PASS, not CPU Recast certification.

## Fully grounded B225 native CI verification — run #40291938082

The revised post-B225 mandatory regression workflow is **SUCCESS**, as is the B224 baseline workflow #40291938084. In addition to genuine source floor 3-step support order and required true stable landings, the same human KCC yielded:

| Side | Real native grounded ticks in second leg | Ungrounded ticks | Maximum airborne streak | FloorConcrete02 stable | Original 25 collider collisions |
|---|---:|---:|---:|---|---:|
| POSITIVE_Z | 84 | 0 | 0 | YES (tick 171) | 0 |
| NEGATIVE_Z | 91 | 0 | 0 | YES (tick 173) | 0 |

Minimum second-leg target-distance errors were respectively 0.052680m and 0.129994m. No second Space keydown, teleport, floor bridge, KCC authority override or synthetic tick was used. This **establishes fully grounded real keyboard-based traversal of the localized 0.518559m second seam** under the isolated source QA world, following the genuine initial jump. The CI regression assertion now requires zero airborne ticks and at least 18 grounded ticks on this second leg, in addition to reaching and holding the correct next original source floor.

It does **not** establish that an original player or CPU can enter this QA geometry from the whole authentic 25-solid runtime (which does not yet register the source meshes). Further candidates: the next original FloorConcrete02-to-inner-Slope00 seam, connection of this extracted chain to registered underpass geometry, actual live integration under strictly controlled authority, Recast route validation, and a real CPU actor walk. Continue to honor historical CI691 Recast disconnection.
