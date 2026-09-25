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
- first-drop magnitude: **1.5m or 3m candidates only; PROVISIONAL**
- center small step: **~1.5m HIGH**
- right small drop: **~1.5m HIGH**
- glass-top to main floor directly below: **~3m HIGH**
- primary vertical reconstruction grid: **1.5m HIGH**
- training-range normalization: **~5m per line HIGH**
- rule-map working transform: **~20px/m HIGH**
- spawn-to-spawn distance: **~134m HIGH**
- whole-stage ~146x87m: **PROVISIONAL**
- spawn absolute Y: **UNKNOWN**
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
- spawn absolute Y
- exact first-drop magnitude (1.5 m vs 3.0 m)
- absolute Y for the lower tunnels/right low area
- exact start/end Y for both center slopes
- full upper-platform absolute height


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

Known relative relationships that remain unresolved in absolute Y:
- right-low-floor -> right-small-drop-upper = +1.5 m, HIGH
- glass-lower-major-floor -> upper-glass-platform = +3.0 m, HIGH
- Team A/B spawn floors are symmetry-linked at equal Y, HIGH
- Team A/B first-drop landing floors are symmetry-linked at equal Y, HIGH

Still candidate-only:
- each spawn -> first-drop landing = -1.5 m or -3.0 m, PROVISIONAL
- center upper band relative to center-low = +4.5 to +6.0 m, PROVISIONAL
- raised/high platform absolute Y = +4.5 m candidate, PROVISIONAL

The resolver only propagates an exact relation when an allowed-confidence chain has an absolute seed. Therefore the 3m glass clearance does not fabricate a glass-top absolute Y while the lower floor is unknown, and the first-drop candidate relation never fabricates a spawn or landing Y.

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

The one-way nature of the first drop remains CONFIRMED from the user's gameplay video. The PDF only strengthens the plan footprint; it does **not** promote the vertical fall magnitude, which remains 1.5 m / 3.0 m PROVISIONAL.

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
- actual Team A/B spawn-floor polygons
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
