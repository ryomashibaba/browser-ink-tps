import { undertowRuntimeSurfacePlanItem } from './UndertowSpillwayRuntimeBlockoutPlan';
import { UNDERTOW_CENTER_SLOPE_SOURCE_MESHES } from './UndertowSpillwaySlopeMeshGeometry';
import { UNDERTOW_RIGHT_LOW_ROUTE_RAMPS } from './UndertowSpillwayRouteRampGeometry';
import { UNDERTOW_UPPER_GLASS_SOURCE_MESHES } from './UndertowSpillwayUpperGlassMeshGeometry';

export type UndertowRuntimePaintAuthority =
  | 'PAINTABLE'
  | 'UNINKABLE'
  | 'UNKNOWN';

export interface UndertowRuntimePaintAuthorityRecord {
  runtimeSolidId: string;
  authority: UndertowRuntimePaintAuthority;
  evidenceClass:
    | 'CANONICAL_LEDGER'
    | 'AUTHOR_VECTOR_SEMANTIC'
    | 'GEOMETRY_ONLY';
  notes: string;
}

const PAINTABLE_RUNTIME_SOLID_IDS = [
  'UndertowT21D:center-low-team-a',
  'UndertowT21D:center-low-team-b',
  'UndertowT21D:right-low-team-a',
  'UndertowT21D:right-low-team-b',
  'UndertowT21D:center-origin-step-top-face:0'
] as const;

const UNINKABLE_RUNTIME_SOLID_IDS = [
  'UndertowT21D:negative-z-grate-mesh:0',
  'UndertowT21D:positive-z-grate-mesh:0',
  'UndertowT21D:upper-glass-positive-z:visual',
  'UndertowT21D:upper-glass-negative-z:visual'
] as const;

const UNKNOWN_FLAT_RUNTIME_SOLID_IDS = [
  'UndertowT21D:glass-underpass-positive-z',
  'UndertowT21D:glass-underpass-negative-z',
  'UndertowT21D:spawn-high-positive-z',
  'UndertowT21D:spawn-high-negative-z',
  'UndertowT21D:first-drop-landing-positive-z',
  'UndertowT21D:first-drop-landing-negative-z'
] as const;

const UNKNOWN_SLOPE_RUNTIME_SOLID_IDS = UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.map(
  (record) => `UndertowT21D:${record.id}`
);

const UNKNOWN_ROUTE_RAMP_RUNTIME_SOLID_IDS = UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.map(
  (record) => `UndertowT21D:${record.id}`
);

export const UNDERTOW_PAINT_AUTHORITY_AUDIT = Object.freeze({
  sourceVersion: '7.2.0',
  runtimeSolidCount: 21,
  paintableRuntimeSolidIds: PAINTABLE_RUNTIME_SOLID_IDS,
  uninkableRuntimeSolidIds: UNINKABLE_RUNTIME_SOLID_IDS,
  unresolvedRuntimeSurfaceIds: [
    ...UNKNOWN_FLAT_RUNTIME_SOLID_IDS,
    ...UNKNOWN_SLOPE_RUNTIME_SOLID_IDS,
    ...UNKNOWN_ROUTE_RAMP_RUNTIME_SOLID_IDS
  ] as readonly string[],
  confirmedPaintableCount: PAINTABLE_RUNTIME_SOLID_IDS.length,
  confirmedUninkableCount: UNINKABLE_RUNTIME_SOLID_IDS.length,
  unresolvedCount:
    UNKNOWN_FLAT_RUNTIME_SOLID_IDS.length +
    UNKNOWN_SLOPE_RUNTIME_SOLID_IDS.length +
    UNKNOWN_ROUTE_RAMP_RUNTIME_SOLID_IDS.length,
  paintAuthorityComplete: false,
  turfScoreabilityEvaluated: false,
  publicStageSchemaFollowup: Object.freeze({
    repository: 'OctoSquiddy/Splatoon-3-Map-Editor',
    sourceCommit: '0e3c66d28b58f7b43df7cdfb6c34514e0ebc1fd4',
    temple01PntSetClass: 'Lft_FldObj_Temple01_PntSet',
    temple01PntSetHasPaintBancParam: true,
    exposedPaintBancFields: ['IsIncludeVArea'] as const,
    exposesPerFacePaintability: false,
    exposesTemple01PaintMaskPlacement: false,
    notes:
      'The public PntSet actor schema contains spl__PaintBancParam, but the published parameter only exposes IsIncludeVArea. It does not map individual Temple01 mesh faces to inkable/uninkable gameplay surfaces, and no current Temple01 placement/value record is published there.'
  }),
  evidenceBoundary: Object.freeze({
    confirmedPaintable:
      'Existing canonical ledger semantics authorize only the current center-low pair, right-low pair, and center-origin step-top paint surfaces.',
    confirmedUninkable:
      'Author/vector semantics explicitly identify the grate pair and upper-glass family as uninkable; water is also uninkable but is not a current runtime solid because its Y remains unresolved.',
    unresolved:
      'Underpass floors, spawn-high floors, first-drop landings, exact center slope quads, and exact right-low route ramps have geometry/traversal authority but no face-specific paint authority in the audited evidence.',
    materialNameRule:
      'Floor/Concrete/Slope/Grass/Line or other source object/material names are never paint authority by themselves.'
  }),
  missingAuthoritativeEvidence: [
    'Current Temple01 per-face/per-collider paint metadata or a registered paint mask that can be bound to the exact runtime source components.',
    'Or controlled gameplay paint tests/captures for each unresolved component family, registered to fixed Temple01 geometry strongly enough to prove ink acceptance versus rejection.',
    'For spawn-high surfaces, evidence must also distinguish normal paintability from any spawn/protection behavior instead of assuming ordinary floor semantics.'
  ] as const,
  confidence: 'HIGH' as const,
  notes:
    'UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING remains activation-blocking. This audit intentionally does not decide Turf scoreability; TURF_SCOREABLE_MASK_PENDING remains a separate blocker.'
});

export const UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS:
  readonly UndertowRuntimePaintAuthorityRecord[] = [
  ...PAINTABLE_RUNTIME_SOLID_IDS.map((runtimeSolidId) => ({
    runtimeSolidId,
    authority: 'PAINTABLE' as const,
    evidenceClass: 'CANONICAL_LEDGER' as const,
    notes: 'Canonical ledger already carries BLOCKOUT-safe PAINTABLE semantics for this runtime floor.'
  })),
  ...UNINKABLE_RUNTIME_SOLID_IDS.map((runtimeSolidId) => ({
    runtimeSolidId,
    authority: 'UNINKABLE' as const,
    evidenceClass: 'AUTHOR_VECTOR_SEMANTIC' as const,
    notes: 'Author/vector semantics explicitly classify this family as uninkable.'
  })),
  ...UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedRuntimeSurfaceIds.map(
    (runtimeSolidId) => ({
      runtimeSolidId,
      authority: 'UNKNOWN' as const,
      evidenceClass: 'GEOMETRY_ONLY' as const,
      notes:
        'Runtime geometry exists, but geometry/material naming/traversal alone does not establish paint authority.'
    })
  )
];

export function undertowPaintAuthorityAuditErrors(): readonly string[] {
  const audit = UNDERTOW_PAINT_AUTHORITY_AUDIT;
  const errors: string[] = [];
  const records = UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS;
  const ids = new Set(records.map((record) => record.runtimeSolidId));

  if (records.length !== audit.runtimeSolidCount || ids.size !== audit.runtimeSolidCount) {
    errors.push('runtime paint-authority inventory no longer accounts for exactly 21 unique solids');
  }
  if (
    audit.confirmedPaintableCount +
      audit.confirmedUninkableCount +
      audit.unresolvedCount !==
    audit.runtimeSolidCount
  ) {
    errors.push('runtime paint-authority counts no longer balance');
  }
  if (audit.unresolvedCount !== 12 || audit.paintAuthorityComplete) {
    errors.push('unknown runtime paint surfaces must remain exactly localized and activation-blocking');
  }
  if (audit.turfScoreabilityEvaluated) {
    errors.push('paint authority audit must not resolve Turf scoreability');
  }
  if (
    audit.publicStageSchemaFollowup.exposesPerFacePaintability ||
    audit.publicStageSchemaFollowup.exposesTemple01PaintMaskPlacement
  ) {
    errors.push('public stage schema unexpectedly claims per-face Temple01 paint authority');
  }

  for (const id of PAINTABLE_RUNTIME_SOLID_IDS) {
    if (!records.some((record) => record.runtimeSolidId === id && record.authority === 'PAINTABLE')) {
      errors.push(`${id}: confirmed paintable runtime solid missing from authority inventory`);
    }
  }
  for (const id of UNINKABLE_RUNTIME_SOLID_IDS) {
    if (!records.some((record) => record.runtimeSolidId === id && record.authority === 'UNINKABLE')) {
      errors.push(`${id}: confirmed uninkable runtime solid missing from authority inventory`);
    }
  }

  if (undertowRuntimeSurfacePlanItem('upper-glass-underpass').paintAuthority !== 'UNKNOWN') {
    errors.push('underpass ledger paint authority drifted from UNKNOWN');
  }
  if (undertowRuntimeSurfacePlanItem('negative-z-grate-mesh').paintAuthority !== 'UNINKABLE') {
    errors.push('grate ledger paint authority drifted from UNINKABLE');
  }
  if (undertowRuntimeSurfacePlanItem('center-lower-floor').paintAuthority !== 'PAINTABLE') {
    errors.push('center-low ledger paint authority drifted from PAINTABLE');
  }
  if (undertowRuntimeSurfacePlanItem('right-low-floor').paintAuthority !== 'PAINTABLE') {
    errors.push('right-low ledger paint authority drifted from PAINTABLE');
  }
  if (UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.length !== 4) {
    errors.push('center slope unresolved paint family no longer contains four exact source quads');
  }
  if (UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.length !== 2) {
    errors.push('right-low route ramp unresolved paint family no longer contains two exact source quads');
  }
  if (
    UNDERTOW_UPPER_GLASS_SOURCE_MESHES.some(
      (record) => record.paintAuthority !== 'UNINKABLE'
    )
  ) {
    errors.push('upper-glass paint authority drifted from explicit UNINKABLE');
  }

  return errors;
}
