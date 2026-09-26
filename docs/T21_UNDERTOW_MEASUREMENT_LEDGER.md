# T21-A — Undertow Spillway Evidence Freeze / Measurement Ledger

Target: **Splatoon 3 normal PvP Undertow Spillway / マテガイ放水路, Ver.7.2.0+**.

This phase intentionally does **not** rebuild the stage mesh yet. It freezes what is known, what is only a strong estimate, and what must remain unresolved so T21-B/C cannot silently turn guesses into geometry.

## Existing architecture audit

The current production stage is still the frozen T8/T13-style `StageDefinition`:

- `StageSolidDefinition[]` drives PlayCanvas box rendering and Rapier static collision.
- `StagePaintSurfaceDefinition[]` is explicit and preserves PaintSurface-local U/V.
- Recast currently derives navigation triangle soup from those solids.
- T20 stores Splat Zones metadata on `StageMetadata`.
- Existing gameplay authority remains `PaintCoordinator.processTick -> GameplayInk + visual GPU ink`.

T21-A therefore stays additive. It does not replace `PRODUCTION_STAGE_DEFINITION`, `GameplayInk`, `ProjectileSystem`, `CpuAgentSystem`, `PlayerController`, or T20 objective runtime.

## New T21 evidence layer

- `src/stage/measurement/StageMeasurementLedger.ts`
  - shared evidence/confidence schema
  - XZ / Y / transition / surface metadata
  - common rule-variant identifiers
  - structural validator
- `src/stage/undertow/UndertowSpillwayMeasurementLedger.ts`
  - canonical T21-A ledger
  - source-version boundary
  - metric assumptions
  - common-terrain evidence
  - mode-specific facts
- `src/stage/undertow/UndertowSpillwayMeasurementLedger.test.ts`
  - rejects silent promotion of unknown/provisional data
  - freezes first-drop one-way semantics
  - checks two-zone and rule-variant facts

## Confidence contract

Only these values are legal:

- `CONFIRMED`
- `HIGH`
- `PROVISIONAL`
- `UNKNOWN`

An `UNKNOWN` Y value is not allowed to carry an exact Y number. An unresolved XZ footprint remains `UNKNOWN`. Known data must cite one or more evidence IDs.

## Current frozen / high-confidence facts

- center lowest reference floor: **Y=0 CONFIRMED**
- first drop from each spawn side: **ONE_WAY_DROP CONFIRMED**
- first-drop magnitude: **4.5m HIGH** from locally registered remodeled Temple01 geometry
- center small step: **~1.5m HIGH**
- right small drop: **3.0m HIGH** from locally registered remodeled Temple01 geometry
- glass-underpass floor -> glass high reference: **+7.5m HIGH** from locally registered Temple01 geometry; the high reference is not a flat glass-plane Y
- primary vertical reconstruction grid: **1.5m HIGH**
- training-range normalization: **~5m per line HIGH**
- rule-map working transform: **~20px/m HIGH**
- spawn-to-spawn distance: **~134m HIGH**
- whole-stage ~146x87m: **PROVISIONAL**
- spawn absolute Y: **Y=7.5 HIGH** in the project frame after final center-low normalization
- raised/high-platform ~4.5m: **PROVISIONAL**
- two Splat Zones: **CONFIRMED**

## Non-negotiable first-drop rule

T21-B onward must not replace the first drop with:

- a ramp
- stairs
- bidirectional Recast connectivity
- an invisible CPU-only ramp

CPU traversal must be solved through one-way/off-mesh navigation behavior while preserving the actual stage geometry.

## T21-B handoff

T21-B should consume this ledger and convert the Turf rule map into metric XZ data, starting with:

1. common-terrain polygons
2. walls and slope footprints
3. grate / glass / boxes / water
4. spawn footprints
5. 180-degree counterpart checks
6. 20px/m residual/error analysis

No PROVISIONAL/UNKNOWN vertical value becomes production geometry merely because a renderer requires a number. T21-C remains responsible for vertical resolution.


## T21-B — 2D metric calibration checkpoint

The previous measurement pass is now encoded as an auditable map transform rather than loose notes.

Source frame:
- Turf rule map: 3508 x 2482 px
- measured project origin: (1754, 1241) px
- measured spawn-axis anchors: (547, 647) px and (2959, 1834) px
- working scale: 20 px/m, confidence HIGH

The transform defines +Z along the measured spawn axis and +X as the clockwise orthogonal map axis. This is a project coordinate frame, not a geographic east/north claim.

Derived audit:
- spawn separation: ~134.413 m
- negative-Z spawn center: approximately (0.000, -67.262) m
- positive-Z spawn center: approximately (0.000, +67.150) m
- chosen origin differs from the measured spawn midpoint by only ~1.118 px / ~0.056 m
- 180-degree spawn symmetry residual is ~0.112 m

That residual is small enough to keep rotational symmetry at HIGH confidence, but the transform remains a reconstruction scale rather than an official Nintendo metric specification.

The old "~146 x 87 m" whole-stage note is still PROVISIONAL. Under the chosen project axes, the working interpretation is:
- X cross-stage span: ~87 m
- Z spawn-axis span: ~146 m

This fixes the previous axis-label ambiguity without promoting the bounds to confirmed geometry.

Only the measured spawn centers are promoted to HIGH-confidence XZ points in the ledger. Spawn-floor polygons, first-drop lips, central polygons, glass footprint, slopes, grates and water boundaries remain unresolved until their source pixels are traced.

## T21-C entry gate

`MeasurementGeometryGate` now prevents unresolved research values from silently becoming geometry:

- BLOCKOUT may consume CONFIRMED or HIGH exact values.
- STABLE_FREEZE may consume CONFIRMED exact values only.
- PROVISIONAL and UNKNOWN measurements return no exact geometry value.

This means the historical Spawn 7.5 -> first 4.5 -> second 1.5 -> center 0 hypothesis cannot leak into T21-D just because a renderer needs a Y number.

Still unresolved before full T21-C completion:
- exact high-end Y for both center slopes
- absolute grate elevations
- full upper-platform semantics outside the locally verified drop/right-low chain
- remaining XZ blockers for underpass/right-low/void partitioning


## Source-version guard

The repository now keeps a five-map Ver.7.2.0 reference catalog for Turf / Zones / Tower / Rainmaker / Clams.

These 1280 x 720 in-game tactical-map captures are **visual cross-checks only**. They must never inherit the 20 px/m scale from the user's 3508 x 2482 rule map because their projection is different.

The catalog deliberately excludes:
- pre-7.2 layouts
- Big Run
- legacy Tricolor

This makes an accidental old-map import detectable in tests before rule-variant geometry is built.


## T21-C — vertical constraint graph checkpoint

Vertical reconstruction is now represented as a constraint graph instead of a single guessed floor ladder.

Current exact/usable blockout relationship:
- center-low-floor = Y 0.0 m, CONFIRMED
- center-low-floor -> center-small-step-top = +1.5 m, HIGH

Resolved BLOCKOUT/HIGH remodel chain after final Temple01 normalization:
- Team A/B spawn floors = Y 7.5
- Team A/B first-drop landings = Y 3.0
- each spawn -> first-drop landing = -4.5 m
- right-low floor = Y 4.5
- right-low -> right-small-drop-upper = +3.0 m
- first-drop landing -> right-low = +1.5 m
- glass-underpass walkable floor = Y 0.0
- right-low -> glass-underpass floor = -4.5m
- glass-underpass floor -> glass high reference = +7.5m

Still candidate-only:
- center upper band relative to center-low = +4.5 to +6.0 m, PROVISIONAL
- raised/high platform absolute Y = +4.5 m candidate, PROVISIONAL

These remodel values are HIGH and therefore BLOCKOUT-usable but not STABLE_FREEZE-safe.

At BLOCKOUT level, HIGH exact relations may propagate. At STABLE_FREEZE level, only CONFIRMED exact relations propagate.


## T21-B trace-completeness gate

A map-tracing layer is now ready for the exact common-terrain outline pass:

- pixel trace -> calibrated project XZ conversion
- polygon area and bounds calculation
- 180-degree counterpart Hausdorff residual
- geometry-kind validation
- explicit trace-completion plan

Only the two spawn-center POINT traces are currently marked MEASURED.

The following gameplay-critical features deliberately remain UNTRACED until their source pixels are available:
- common playable boundary
- both spawn-floor outlines
- both first-drop lips
- center-low floor
- center small-step
- right small-drop edge
- upper glass platform
- glass underpass
- both central slope footprints
- right low floor
- central grate
- water/kill boundaries

This is intentional: no provisional rectangle or CPU-friendly replacement is allowed to masquerade as source-derived stage geometry.


## T21-B — recovered vector blueprint checkpoint

The original source has now been recovered from the user-provided Turf archives.

Primary planimetric source:
- vector PDF: Sunfish Undertow Spillway Turf blueprint
- matching JPEG: 3508 x 2482 px
- source update date: 2024-05-06
- PDF page: 841.92 x 595.32 pt
- working project scale: 4.8 PDF pt/m, HIGH
- the JPEG remains a visual/raster cross-check; PDF linework is the primary XZ source

The 4.8 pt/m value is the vector equivalent of the existing 20 px/m working transform. It remains a project calibration, not an official Nintendo real-world meter scale.

The vector spawn-ring centers refine the old raster picks:
- spawn separation: ~134.190 m HIGH
- negative-Z spawn center: approximately (+0.017, -67.117) m
- positive-Z spawn center: approximately (+0.017, +67.073) m
- source origin vs spawn midpoint residual: <0.03 m

The old raster calibration remains useful as an independent cross-check, but vector coordinates take precedence for new T21-B plan measurements.

Newly measured:
- Team A first-drop lip: exact L-shaped vector hard edge, HIGH XZ
- Team B first-drop lip: exact 180-degree counterpart, HIGH XZ
- each first-drop lip plan length: 15.25 m
- first-drop counterpart symmetry residual: <0.03 m
- two cyan water-hazard source polygons: exact vector faces, CONFIRMED XZ
- each mapped water polygon area: ~33.004 m²
- water counterpart symmetry residual: <0.03 m

The one-way nature of the first drop remains CONFIRMED from the user's gameplay video. The PDF alone does not determine its vertical magnitude; the later Temple01 local registration resolves that magnitude to 4.5m HIGH.

The cyan source polygons are mapped WATER / KILL / UNINKABLE because the blueprint legend identifies cyan as the water/submerge hazard. The broader off-stage fall-out/void kill boundary remains UNTRACED.

Raw vector source faces were also extracted around both spawn sides and the geometric center. They are retained as source geometry only. They must not be treated as single flat floors because a 2D closed face can span multiple gameplay elevations and transitions.

Trace coverage after source recovery:
- MEASURED: 5 / 18 trace requirements
- measured set: two spawn centers, two first-drop lips, mapped water-hazard polygon family
- still unresolved: full playable boundary, actual spawn-floor polygons, center-low outline, small step, right drop, glass top/underpass, both central slopes, right-low floor, grate, and broader fall-out/void kill boundary

This supersedes the earlier note that the original 3508 x 2482 source was unavailable.


## T21-B — central semantic binding checkpoint

The recovered vector PDF is now cross-bound with the current gameplay captures and the map-author legend.

Author/source semantics used in this checkpoint:
- gray source face = uninkable
- repeated dash field = slope / ramp
- mesh source region = grate family
- cyan source face = water/submerge hazard

### Glass overhangs

Two symmetric gray source rectangles near the middle are now bound to the current glass overhang family:

- negative-Z overhang plan area: ~62.796 m²
- positive-Z overhang plan area: ~62.796 m²
- 180-degree plan residual: <0.03 m
- XZ confidence: HIGH
- surface semantics: GLASS + UNINKABLE CONFIRMED

Each glass source face contains an internal slope-marker field. Therefore the overhang must **not** be represented as one flat Y plane.

The glass vertical model now stores a `glass-overhang-high-reference` rather than a single `upper-glass-platform` floor elevation. The ~3m relationship remains a HIGH reference to the major floor below, not permission to flatten the whole footprint.

The traversable under-glass passage remains CONFIRMED as topology but its exact collision/navigation polygon remains UNTRACED.

### Center-left / center-right slope markers

The PDF dash fields nearest the geometric center form an almost exact 180-degree pair:

- center-left marker center (superseded coarse pass): approximately X=-9.805m, Z=-0.059m
- center-right marker center (superseded coarse pass): approximately X=+9.805m, Z=+0.059m
- marker-pair symmetry residual: <0.03m

These are stored as `MARKER_ENVELOPE_ONLY`. They identify which source region contains each central slope, but they are deliberately **not** promoted to collision footprints because dash markers are inset from the real hard edges.

### Grate pair

Two symmetric white mesh-pattern regions are now bound to the traversable grate family:

- plan area per grate: ~30.441 m²
- 180-degree residual: <0.03m
- XZ confidence: HIGH
- semantics: GRATE + UNINKABLE CONFIRMED
- absolute grate Y: still UNKNOWN

No WATER semantic is attached to these white mesh faces. Cyan water polygons remain separate evidence.

### Right-side second drop

The hard-edge chain immediately after each confirmed first-drop open area contains a second symmetric L-shaped edge. It matches the current layout description in which the open area after the first drop has a small drop on its right.

- Team A second-drop edge plan length: 16.90m
- Team B second-drop edge plan length: 16.90m
- 180-degree residual: <0.04m
- XZ confidence: HIGH
- transition: DROP
- vertical delta: -1.5m HIGH

The open floor *below* that edge is still not promoted to an exact polygon because the large surrounding source face spans multiple elevations.

### Trace coverage

T21-B common trace coverage at that checkpoint was **8 / 18** requirements measured.

Measured:
- 2 spawn centers
- 2 first-drop lips
- right-small-drop edge family
- glass-overhang outline family
- grate outline family
- mapped water-hazard polygon family

Still blocked:
- whole playable boundary
- both actual spawn-floor polygons
- center-low floor outline
- center small-step footprint
- glass underpass hard/navigation outline
- center-left/right slope hard footprints
- right-low floor outline
- broader fall-out/void kill boundary

A new `UndertowSpillwayBlockoutGate` keeps T21-D disabled while those XZ items, spawn/first-drop absolute Y, and exact first-drop vertical relations remain unresolved.


## T21-B — center floor and outer-silhouette checkpoint

A coordinate-system audit confirmed that all `PdfPoint` values in the Undertow vector module use the PDF renderer/JPEG-compatible **top-left origin with +Y downward**. This convention is now explicit in code and tests. Do not invert PDF Y before passing coordinates to `undertowPdfPointToProjectXZ`.

New exact plan measurements:
- common playable exterior hard silhouette: 42 vertices after removing collinear-only intermediate points
- exterior polygon plan area: ~8970.464 m² under the HIGH project-meter transform
- 180-degree self-residual: <0.03m
- outer hard-silhouette span: ~98.798m in project X, ~156.528m in project Z, HIGH
- these supersede the old ~87m / ~146m PROVISIONAL envelope
- central-low source face: ~28.830m², HIGH XZ, with Y=0 still CONFIRMED
- two central small-step source strips: ~4.650m² each
- each step strip is 0.75m deep in plan and keeps the existing +1.5m HIGH vertical relation
- step-strip 180-degree residual: <0.03m

The outer boundary is an exterior silhouette only. Internal holes are not automatically classified as kill voids; therefore the separate fall-out/void kill-boundary requirement remains unresolved.

Slope-marker extraction was also tightened directly from PDF short-line vectors:
- center-left dash envelope center: approximately X=-9.909m, Z=+0.354m
- center-right dash envelope center: approximately X=+9.931m, Z=-0.365m
- the envelopes remain marker-only and are not collision footprints

T21-B common trace coverage is now **11 / 18**.

Still unresolved for the T21-D gate:
- actual Team A/B spawn-side terrain envelopes
- exact under-glass walkable/navigation outline
- center-left/right slope hard footprints
- right-low floor polygon
- broader internal/off-stage fall-out/void kill boundaries
- required absolute spawn / first-drop / right-low / glass-lower Y relationships


## T21-B/C — slope footprint and vertical-readiness checkpoint

The central dashed-hatch regions are now treated as **slope semantic footprints** rather than unresolved XZ:

- left footprint: 3.30m x 11.975m, ~39.5175m², HIGH XZ
- right footprint: 3.30m x 11.975m, ~39.5175m², HIGH XZ
- refined centers: approximately (-9.909,+0.354) and (+9.931,-0.365) project XZ
- 180-degree residual remains small
- these polygons describe where continuous slope interpolation occurs; they are not hard walls

No slope endpoint Y has been invented. T21-C now has explicit low/high endpoint nodes for each central slope, with only A/B symmetry relations. Until one side receives an evidence-backed absolute/relative seed, both slopes remain vertically unresolved.

The blockout readiness gate now resolves the vertical constraint graph at BLOCKOUT confidence before checking readiness. This allows center-small-step-top to resolve to Y=1.5 from the confirmed center-low Y=0 + HIGH 1.5m relation, while still blocking unresolved values.

Additional T21-D-required vertical nodes now include:
- center small-step top
- glass lower floor and glass high reference
- center-left/right slope low/high endpoints
- negative-Z/positive-Z grate elevations
- right-low / right-small-drop upper
- both spawn floors and first-drop landing floors

T21-B trace coverage is now **13 / 18 measured**.

Remaining XZ blockers:
- Team A spawn-floor outline
- Team B spawn-floor outline
- exact under-glass walkable/navigation outline
- right-low floor outline
- broader internal/off-stage fall-out/void kill boundary


## Under-glass passage evidence boundary

Current public post-7.2 references independently corroborate the topology already seen in the user's gameplay captures: Ver.7.2.0 added a tunnel / pass-through space below the raised central perch area for the relevant normal-PvP layouts.

This raises **existence of the passage** to strong corroboration, but it does not provide the exact walkable/navigation polygon, support-column collision margins, or ceiling-clearance profile. Therefore `glass-underpass-outline` deliberately remains UNTRACED rather than inheriting the glass-top rectangle.


## T21-B — spawn terrain / remaining topology checkpoint

The exact white vector faces containing each spawn ring are now promoted as **spawn-side connected terrain envelopes**:

- Team A and Team B XZ polygons are HIGH
- each source face is ~1168.201 m² under the project transform
- counterpart 180-degree residual is <0.03m
- these regions are **not** one flat floor: they contain multiple elevations and transition subregions
- the spawn-ring center remains the separate absolute-Y node

The old trace-gate names `team-*-spawn-floor-outline` were therefore corrected to `team-*-spawn-terrain-outline`. This prevents later code from interpreting the source envelope as a constant-height floor.

T21-B trace coverage is now **15 / 18 measured**.

A new source-topology audit records why the final three XZ blockers cannot safely be extracted from the current 2D vector source alone:

1. `right-low-floor-partition`
   - the first-drop and right-small-drop hard edges both border the same spawn-side and central connected source faces
   - the right-low elevation region therefore does not close into an independent PDF polygon
2. `glass-underpass-walkable-outline`
   - the PDF has the upper glass footprint but no independent lower-layer walkable/support-clearance polygon
3. `internal-void-kill-boundaries`
   - exterior silhouette and cyan water are exact, but overlapping upper/lower layers make some internal blank regions ambiguous between abyss and lower passage

These three stay blocked rather than being created from convenience geometry.


## T21-C — center-side slope endpoint binding

The center-facing edge of each central slope footprint coincides exactly with the outer edge of its corresponding +1.5m center-step strip in the vector plan:

- negative/positive center step top: Y=+1.5m at BLOCKOUT confidence
- center-left slope center-side endpoint: Y=+1.5m HIGH
- center-right slope center-side endpoint: Y=+1.5m HIGH

Only the center-side endpoints are resolved. The far/high endpoints remain UNKNOWN, so the slope grade and upper landing height are still not fabricated.

The central dash regions are now typed as `SLOPE_SEMANTIC_FOOTPRINT`; the smaller dash fields inside the gray glass faces remain `MARKER_ENVELOPE_ONLY`. This prevents both kinds of dashed source notation from being treated identically.


## T21-B/C — existing-video re-audit and minimal capture contract

All five previously supplied Undertow gameplay videos were re-audited at one-second intervals, with higher-resolution frame extraction around the central raised/glass structure and right-low route.

The re-audit confirms that the remaining three XZ gaps are real source-projection limits rather than missed PDF lines:

- right-low: the video clearly shows the low open/grass floor and its transitions, but not enough synchronized plan anchors to close the constant-height partition exactly
- under-glass: the video clearly shows a traversable lower passage, roof/upper structure and support columns, but the upper PDF projection does not encode a separate lower walkable/support-clearance polygon
- internal voids: existing views distinguish several lower passages from open gaps, but not every top-down blank region can be classified geometrically without a targeted view

A minimal three-target evidence contract is now encoded in `UndertowSpillwayEvidenceCapturePlan.ts`.

No spawn, first-drop, water, glass-top, grate, center-low, small-step, outer-boundary or central-slope reshoot is requested.

Capture priority:
1. right-low perimeter / transition classification
2. under-glass entrance-to-exit support-clearance walk
3. only the still-ambiguous internal gaps for void-vs-lower-route classification


## T21-B/C — 2026-09-25 targeted capture integration

Two requested captures were received and reviewed:

- `user-underpass-capture-2026-09-25`
  - file: `20260925-01M3CC7J9A5C9AE8YTYYE6HSHM-4D9D9F84-E6A2-4AF9-8A4B-D2534454E0B1.mp4`
  - 29.63s
  - confirms current covered lower passage traversal
  - confirms solid support/wall geometry must be excluded from navigation
  - confirms traversable route continuity to the adjacent low/open route; the perspective clip does not measure an exact canonical Y delta
- `user-right-low-capture-2026-09-25`
  - file: `20260925-01M3CC7W69VA9ZBR9NJWR0KYYG-7AD89BB0-8510-46E3-8C98-A64A14F92CAE.mp4`
  - 29.50s
  - confirms the measured small drop enters the right-low open/grass floor
  - confirms at least one traversable ramp exits that floor
  - confirms route continuity into the covered underpass; equal canonical floor Y is not established by the perspective clip

The captures strengthen the layered topology without inventing a simple top-down polygon.

Current HIGH vertical/topology relations:
- first-drop upper -> landing = -4.5m
- right-small-drop upper -> right-low = -3.0m
- first-drop landing -> right-low = +1.5m
- right-low -> covered underpass lower floor = -4.5m HIGH from Temple01 geometry; capture footage contributes connectivity only

The previous claim that first-drop open/landing floor = right-small-drop upper floor is **superseded and invalid**. The corrective still pair itself remains qualitative; exact floor identities and metric deltas come from the independently registered remodeled Temple01 OBJ.

The two requested captures are now `CAPTURE_RECEIVED`; they must not be requested again. The right-low and underpass source-topology states are `CAPTURED_REQUIRES_PLAN_REGISTRATION`, meaning only the exact PDF-coordinate boundary registration remains.

The only still-not-received capture category is `INTERNAL_VOID_CLASSIFICATION`. It should not be requested until the remaining ambiguous gaps are enumerated and shown on a marked map.

### User capture-guidance contract

Future capture requests for Undertow must include a marked stage map. The map must show:
- capture area
- start position
- route or camera direction
- boundary/object to look at
- whether the 180-degree symmetric counterpart is acceptable

Prose-only location instructions are no longer sufficient.


## T21-B — targeted-capture plan-registration checkpoint

The two 2026-09-25 captures have now been registered to measured plan landmarks without promoting perspective-derived geometry:

- right-low capture -> Team A measured right-small-drop lip
- underpass capture -> measured positive-Z glass-overhang footprint
- registration confidence: HIGH for **which plan feature the clips belong to**
- trace promotion: **not allowed**

The remaining blocker is no longer capture-location uncertainty.

`right-low-floor-outline` stays UNTRACED because the perspective perimeter walk does not expose a second independent measured plan anchor with enough geometric precision to map every wall/ramp corner to one unique PDF vertex. Multiple candidate edges also overlap in the 2D source projection.

`glass-underpass-outline` stays UNTRACED because the vector PDF contains only the upper glass projection; it has no independent lower-layer support/clearance path. The traversal clip confirms supports, openings and route connectivity, while Temple01 resolves the lower floor Y separately; perspective footage still does not provide unique metric corner offsets.

Therefore T21-B common trace coverage remains **15 / 18**, rather than being inflated to 17 / 18 from convenience geometry. The two capture categories remain complete and must not be requested again. `UndertowSpillwayBlockoutGate.ready` remains false, and T21-D runtime geometry is still blocked.

## T21-B — internal-void ambiguity audit

A second pass compared the recovered vector plan, the post-7.2 visual reference set, the current-layout descriptions, and the two received 2026-09-25 clips.

The following overlap regions are **HIGH traversable lower-layer topology**, not kill voids:
- negative-Z central undercut below the high platform
- positive-Z central undercut / covered passage
- right-low to covered-underpass traversable route connection; equal-Y semantics are not inferred from the clips

This narrows the ambiguity but does **not** justify an exhaustive claim that there are no other internal abyss regions. No remaining internal blank can currently be localized strongly enough to draw a truthful capture box on the plan. Therefore:
- `fall-out-void-kill-boundary` remains UNTRACED
- `INTERNAL_VOID_CLASSIFICATION` remains `DEFERRED_PENDING_MAP_ENUMERATION`
- no new user capture is request-ready
- no convenience kill polygon or blanket 'everything inside the exterior is floor' rule is allowed

The next evidence request may only be activated after a concrete ambiguous region is identified and can be marked on the source map.


## T21-C — minimum vertical evidence component audit

The current exact/HIGH BLOCKOUT relations were decomposed into connected vertical components so missing evidence can be requested minimally rather than by guessing floor heights.

Seeded now:
- CENTER_SEEDED: center-low Y=0, center-small-step Y=1.5, and both center-side slope low endpoints Y=1.5

Seeded exact/HIGH components:
- CENTER_SEEDED: center-low Y=0, center-small-step Y=1.5, both center-side slope low endpoints Y=1.5
- SPAWN_RIGHT_LOW_SEEDED: Team A/B spawn Y=7.5, first-drop landings Y=3.0, right-low Y=4.5, right-small-drop upper Y=7.5, glass-underpass Y=0.0 and glass high reference Y=7.5 resolved through Temple01 geometry

Unseeded:
- SLOPE_HIGH_UNSEEDED: both central slope high endpoints
- GRATE_UNSEEDED: both grate elevations

Minimum remaining vertical evidence classes:
1. one center-slope high-end tie
2. one grate-elevation tie

This does not start T21-D and does not relax the blockout gate.


## T21-C — 2026-09-26 first-drop interpretation correction

The marked side-profile request is **invalidated**.

The guide assumed a three-terrace chain:
spawn upper -> first-drop landing / right-small-drop upper -> right-low.

The user's direct in-game observation plus `IMG_6112.jpeg` / `IMG_6111.jpeg` disproved the guide's shared-middle-level assumption. The later Temple01 local registration resolves the sides independently:
- user-observed red-guide-side floor < blue-guide-side floor — CONFIRMED qualitative ordering
- red upper/lower = project Y 7.5 / 3.0 HIGH
- blue upper/lower = project Y 7.5 / 4.5 HIGH
- first-drop landing = right-small-drop upper — removed / invalid
- exact first-drop magnitude = 4.5m HIGH
- exact right-small-drop magnitude = 3.0m HIGH

No replacement first-drop capture is needed. The old `FIRST_DROP_MAGNITUDE_SIDE_PROFILE` request is retained only as `SUPERSEDED_BY_TEMPLE01_GEOMETRY`. Runtime geometry remains unchanged and T21-D stays blocked by remaining evidence gates.


## T21-C — existing-media line-side semantic audit

A full re-audit of the first-drop video, the 2026-09-25 right-low capture, the 2026-09-26 corrective stills, and the current-layout textual cross-check separates measured hard-edge geometry from side-of-line floor semantics.

Results:
- the red guide polyline remains the HIGH measured Team A first-drop hard edge
- the blue guide polyline remains the HIGH measured Team A right-small-drop hard edge
- pre-model video/stills alone were insufficient to bind their sides
- Temple01 local registration now binds red upper/lower to spawn / first-drop landing
- Temple01 local registration now binds blue upper/lower to right-small-drop upper / right-low
- the four line segments match the expected OBJ height-discontinuity contours within 0.163m in the 0.5m audit raster
- the corrective still pair provides an independent qualitative cross-check: red lower < blue lower

Consequences:
- first-drop landing = right-small-drop upper remains forbidden
- first-drop landing -> right-low = +1.5m HIGH
- first-drop magnitude = 4.5m HIGH
- right-small-drop magnitude = 3.0m HIGH
- no further first-drop capture is required

No runtime stage geometry changes are allowed from this audit alone.


## T21-C — current Temple01 external-geometry audit

Public extracted-data cross-checks establish the current remodeled Undertow identity before any more vertical inference:

- current remodeled scene row: `Vss_Temple01`
- current model resource: `Model/Fld_Temple01.bfres`
- pre-remodel scene/model: `Vss_Temple00` / `Model/Fld_Temple00.bfres`
- `Vss_Nagasaki03` / `Fld_Nagasaki03.bfres` is Sturgeon Shipyard and is explicitly excluded from Undertow geometry

Additional public-source findings:
- KiTrix contains `Vss_Temple01` OBJ/MTL data whose material names are `Fld_Temple01_*` and include the current environment's concrete floors, slopes, glass, pillars and ceiling
- the OBJ body is stored in Git LFS and was successfully retrieved by the branch CI audit; 375,948 vertices were parsed
- Splatoon-3-Map-Editor contains `Fld_Temple01` / `Lft_FldObj_Temple01_*` actor classes, but its inspected repository tree contains no Temple01 layout BYML/BCETT payload
- Leanny LeagueTypeInfo names current Temple01 rule-layer BCETT paths, but the coordinate payloads themselves are not present in the inspected public dataset

The Temple01 OBJ now promotes only **locally verified** HIGH geometry/Y relations. Actor schemas and path references alone still do not promote coordinates.

Next evidence priority is no longer first-drop recapture. Remaining work should target the unresolved slope-high, grate Y, underpass/right-low XZ partition, and void-boundary evidence.


## T21-C — remodeled external 3D source audit

Public reverse-engineered sources were audited specifically to avoid requesting more screenshots before exhausting available model evidence.

### Version / model identity

Nintendo Ver.7.2.0 explicitly changed Undertow Spillway terrain in all modes. Leanny commit `458cbf271a161fea78db893aec6ee958e4684121` is named `7.2.0 update` and adds `data/mush/720/SceneInfo.json`.

That 7.2.0 scene metadata distinguishes:
- `Vss_Temple00` -> マテガイ放水路 -> `Model/Fld_Temple00.bfres`
- `Vss_Temple01` -> マテガイ放水路（改修後） -> `Model/Fld_Temple01.bfres`

Therefore the remodel target for this project is Temple01, not Temple00.

Nintendo's published update history through Ver.11.3.0 contains later Undertow bug/rule fixes but no later documented all-mode terrain redesign. Temple01 is therefore the strongest known current normal-PvP model family, while this absence of later documented redesigns must not be treated as vertex evidence.

### Rejected Salmon Run source

Leanny's `Temple_Low.png / Temple_Mid.png / Temple_High.png` page is titled `Salmon Run Pillar Index`. It is rejected for T21-C normal-PvP floor-height reconstruction.

### KiTrix Temple01

`kirakira-dev/KiTrix` contains:
- `stages/Vss_Temple01/Vss_Temple01.obj`
- Git LFS declared body size: 43,263,289 bytes
- Temple01 MTL with 278 material/shape-family names
- `Fld_Temple01_*` and `FldObj_Temple01_*` families
- rule-set families `PntSet / VarSet / VclSet / VglSet / VlfSet`

Its BFRES->OBJ converter:
- derives `Vss_Temple01` mechanically from an input named `Fld_Temple01...`
- applies BFRES bone world transforms
- writes transformed vertex X/Y/Z directly to OBJ
- does not apply a project-specific scale or axis swap at export

The CI audit successfully retrieved the 43,263,289-byte LFS body and parsed 375,948 vertices. Common `Fld_Temple01` plus Turf `PntSet` produced 70,396 active audit triangles.

The PDF-to-model exterior registration is **not** globally trusted because its outer p95 residual is ~10.242m. Promotion is restricted to local landmarks whose geometry was independently verified. The red/blue drop lips meet that bar: their expected OBJ discontinuity contours are within at most 0.163m in the 0.5m audit raster.

KiTrix's own `StageLoader.swift` display-name mapping is explicitly **not** trusted: it maps Undertow to `Vss_Nagasaki03`, while Leanny's extracted game metadata identifies `Vss_Nagasaki03` as Sturgeon Shipyard and `Vss_Temple01` as remodeled Undertow. Model-file identity and the app's display-name table are therefore treated separately.

### Rule-set filtering

Independent Splatoon rule-code implementations map:
- `cPnt` -> Turf War
- `cVar` -> Splat Zones
- `cVgl` -> Rainmaker
- `cVlf` -> Tower Control
- `cVcl` -> Clam Blitz

Because Temple01 contains matching `PntSet / VarSet / VglSet / VlfSet / VclSet` families, the successful Turf audit uses **common Temple01 + PntSet**, not all five mode-specific sets.

### Current vertical result

Locally verified project-frame values after final center-low normalization:
- center-low reference = 0.0
- center small-step top = 1.5
- spawn floor = 7.5
- first-drop landing = 3.0
- right-small-drop upper = 7.5
- right-low = 4.5
- glass-underpass floor = 0.0
- glass high reference = 7.5
- center slope low/high = -1.5 / 0.0
- grate visual top ≈7.4
- first drop = -4.5
- right small drop = -3.0
- right-low -> underpass = -4.5
- underpass -> glass high reference = +7.5

No BLOCKOUT vertical blocker remains. These HIGH values are still not Stable-Freeze exactness unless independently CONFIRMED.


## T21-B — Temple01 local XZ contour promotion checkpoint

The remodeled Temple01 OBJ is now used for two previously unresolved XZ floor partitions, without relaxing the remaining underpass/void gates.

Extraction method:
- common `Fld_Temple01` + Turf `PntSet` only
- target horizontal floor bands sampled independently of higher overlapping layers
- 0.125m model-space raster
- boundary simplification bounded to <=0.20m
- PDF/project <-> Temple01 registration already locally verified at center-step and right-drop landmarks
- A/B counterparts independently rasterized and found symmetric before the canonical counterpart was generated by 180-degree mirroring

Promoted at HIGH:
- `center-low-floor-outline`: two symmetric Temple01 model-Y=3.0m / project-Y=0 connected components, including one support/obstruction hole per side
- `right-low-floor-outline`: two symmetric Temple01 model-Y=7.5m / project-Y=4.5 connected components, including three holes per side

The contours are stored in `UndertowSpillwayModelXZGeometry.ts`, with both model-space and project-space coordinates. They are BLOCKOUT-safe but not Stable-Freeze exact geometry.

At this checkpoint common trace coverage was **16 / 18**.

At this checkpoint the remaining XZ blockers were:
1. `glass-underpass-outline`
2. `fall-out-void-kill-boundary`

The later underpass-promotion checkpoint below supersedes this blocker list. All BLOCKOUT vertical evidence was already resolved.


## T21-C — cross-file vertical semantic reconciliation (2026-09-26)

The final Temple01 local-geometry audit supersedes the earlier capture-only same-level interpretation.

Metric authority:
- right-low: model Y=7.5m / project Y=4.5m HIGH
- roofed glass-underpass walkable floor: model Y=3.0m / project Y=0.0m HIGH
- glass-overhang high reference: model Y=10.5m / project Y=7.5m HIGH
- right-low -> underpass: -4.5m HIGH
- underpass -> glass high reference: +7.5m HIGH

Capture authority is deliberately narrower: the 2026-09-25 videos prove traversable route continuity and support/wall exclusions, but do not measure an equal floor Y. The current capture-topology edge therefore has no numeric delta.


## T21-B — glass-underpass navigable contour promotion

The glass-underpass XZ blocker is now resolved from the remodeled Temple01 OBJ rather than from perspective footage or the upper glass PDF rectangle.

Extraction:
- connected walkable floor at model Y=3.0m / project Y=0
- retain cells with Temple01 BridgeMetal/Glass roof above
- subtract floor-level Pillar/Wall solid footprints
- 0.125m raster
- <=0.15m contour simplification
- preserve interior support holes

CI #631:
- roofed floor: 3951 cells per side
- excluded obstacles: 88 cells per side
- navigable mask: 3863 cells / 60.359375m² per side
- outer signed area: ~61.094m²
- support hole: ~0.672m²
- exact 180-degree raw-mask symmetry: XOR 0 cells, missing 0, extra 0

The contours are stored in `UndertowSpillwayModelXZGeometry.ts` as two HIGH components. `StageMeasurementLedger.XzMeasurement` now supports `POLYGON_SET`, allowing center-low, right-low, and underpass geometry to retain symmetric components and holes without flattening.

Current common trace coverage: **17 / 18**.

Only remaining XZ blocker:
1. `fall-out-void-kill-boundary`

The 2026-09-25 underpass capture remains valid semantic/traversal evidence, but it is not the metric polygon source. Its capture-only plan registration remains non-promotable by itself. T21-D remains gated until the void boundary is resolved.
