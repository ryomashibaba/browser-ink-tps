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
