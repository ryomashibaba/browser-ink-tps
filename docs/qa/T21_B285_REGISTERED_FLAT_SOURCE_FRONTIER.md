# T21 B285 — registered 25-solid flat source gap scan, not a central crossing

Date: 2026-10-28 JST, QA branch only. Source stage identity `Vss_Temple01` is resolved by the prior B284 Leanny 720/920/1130 exact rows. No new source collider, link, actor displacement, scoring, release, art acceptance, or CPU clearance.

## Highest-value unresolved question

B155 native original Recast ends **31.7162272m / 31.7857453m** before the respective glass-underpass original destinations. B238–B241 establish a physically walked narrow `FloorLine00` only in a 31-solid **QA-specific expanded** registration; the original-game collision role remains unproven, its width 0.311135m is below current CPU diameter 0.60m and original native Recast at safe radius erodes the path. Re-run of the same isolated full OBJ scan, radius-zero NavMesh or an imagined bridge cannot be promoted.

## New B285 registered-only surface measurement

`src/app/B285RegisteredFlatSourceGapAudit.ts` inspects the **actual ten registered flat source polygons** and exact original 25-solid registration, verifying original Y and side symmetry. It computes **boundary-to-boundary horizontal straight-line separations** directly from the corresponding frozen project-space polygon vertices, without new stage geometry. This is an independent 2D topology screen, **not a whole 25-solid three-dimensional path search**, and does not measure intermediate ramps/triangle meshes, jump arcs, real Rapier collisions, CPU capsule sweep, or Recast continuity. Holes are part of the original registered polygons; the boundary-distance calculation is specifically outer-contour vs outer-contour (not a hole-visibility or usable corridor clearance test). The input surfaces are *registered project geometry*, not direct original-game physics inclusion proof.

| Flat registered source pair | 2D contour separation | Vertical floor delta | interpretation |
|---|---:|---:|---|
| `right-low-team-a` -> `glass-underpass-positive-z` | **27.742890m** | **−4.5m** | no direct neighboring flat polygons |
| `right-low-team-b` -> `glass-underpass-negative-z` | **27.742890m** | **−4.5m** | mirrored same result |
| `right-low-team-a` -> `center-low-team-b` | **27.491278m** | **−4.5m** | another different-height distant region |
| `right-low-team-b` -> `center-low-team-a` | **27.491278m** | **−4.5m** | mirrored same result |
| `right-low-team-a` -> `first-drop-landing-positive-z` | **0m contour touch** | **−1.5m** | proximity alone cannot certify an entire physical transition |
| `right-low-team-b` -> `first-drop-landing-negative-z` | **0m contour touch** | **−1.5m** | mirrored same result |

The first four distances are planar lower bounds for direct outer-contour separation, not minimum walkable-route lengths. Original sloped support, actual jump or other geometric connections are **NOT ruled out** by this scan. Even 0m planar contour touch with 1.5m vertical difference cannot establish Rapier KCC success. The genuine B123 ramp landing and B281 first drop remain independently valid *because they have actual physics evidence*, not because of this audit.

## Engineering change and acceptance

Use existing `t21-source-frontier-preflight.yml` (no extra workflow) to run B284 pinned SceneInfo source audit, B283 original edge margin tests and new B285 mirrored actual-source geometry tests plus type/build. B285 has explicit counterexamples for intersecting and separated polygons and requires fail-closed HOLD authority in every result. Never turn a 2D gap into an offmesh NavLink or authorize QA31 FloorLine00.

**Decisions:**
- Stage model identity: confirmed, no rollback.
- Long B127 straight physical edge excursion: historically HOLD, B283 geometric turn merely a safe-input *candidate*.
- B285 newly verified flat surface geometry: evidence only, not a 25-solid global path.
- Need genuine original-game collision/actor authority for the missing intermediate source components, or a truly distinct native Rapier + Recast path grounded in already registered 25 solids, before costly new full-route Chrome trial.
- Do not retry B283 same-floor short distances as if they resolve the central ~31m Recast terminal error.
- Preserve frozen 25/17/26/0, 0/12 opponent paths, ART HOLD, `activationReady=false`, `productionAuthorized=false`, `unrestricted4v4Certified=false`, main/Pages/PR unchanged.

**Evidence references:** B155/B156 native genuine Recast result; B228 full 30-solid isolated registered-underpass entry; B239–B241 31-solid physical/clearance; B242 source collision-role HOLD; B284 game-data stage identity; B281 original first-drop native success.
