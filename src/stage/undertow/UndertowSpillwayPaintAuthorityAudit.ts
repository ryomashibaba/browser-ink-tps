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
    | 'PUBLIC_CURRENT_GAMEPLAY'
    | 'GEOMETRY_ONLY';
  notes: string;
}

const CANONICAL_LEDGER_PAINTABLE_RUNTIME_SOLID_IDS = [
  'UndertowT21D:center-low-team-a',
  'UndertowT21D:center-low-team-b',
  'UndertowT21D:right-low-team-a',
  'UndertowT21D:right-low-team-b',
  'UndertowT21D:center-origin-step-top-face:0'
] as const;

const AUTHOR_RESOLVED_SLOPE_PAINTABLE_RUNTIME_SOLID_IDS =
  UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.map(
    (record) => `UndertowT21D:${record.id}`
  );

const AUTHOR_RESOLVED_ROUTE_RAMP_PAINTABLE_RUNTIME_SOLID_IDS =
  UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.map(
    (record) => `UndertowT21D:${record.id}`
  );

const AUTHOR_RESOLVED_FIRST_DROP_PAINTABLE_RUNTIME_SOLID_IDS = [
  'UndertowT21D:first-drop-landing-positive-z',
  'UndertowT21D:first-drop-landing-negative-z'
] as const;

const PUBLIC_RESOLVED_SPAWN_PAINTABLE_RUNTIME_SOLID_IDS = [
  'UndertowT21D:spawn-high-positive-z',
  'UndertowT21D:spawn-high-negative-z'
] as const;

const PAINTABLE_RUNTIME_SOLID_IDS = [
  ...CANONICAL_LEDGER_PAINTABLE_RUNTIME_SOLID_IDS,
  ...AUTHOR_RESOLVED_SLOPE_PAINTABLE_RUNTIME_SOLID_IDS,
  ...AUTHOR_RESOLVED_ROUTE_RAMP_PAINTABLE_RUNTIME_SOLID_IDS,
  ...AUTHOR_RESOLVED_FIRST_DROP_PAINTABLE_RUNTIME_SOLID_IDS,
  ...PUBLIC_RESOLVED_SPAWN_PAINTABLE_RUNTIME_SOLID_IDS
] as const;

const UNINKABLE_RUNTIME_SOLID_IDS = [
  'UndertowT21D:negative-z-grate-mesh:0',
  'UndertowT21D:positive-z-grate-mesh:0',
  'UndertowT21D:upper-glass-positive-z:visual',
  'UndertowT21D:upper-glass-negative-z:visual'
] as const;

const UNKNOWN_FLAT_RUNTIME_SOLID_IDS = [
  'UndertowT21D:glass-underpass-positive-z',
  'UndertowT21D:glass-underpass-negative-z'
] as const;


export const UNDERTOW_PAINT_AUTHORITY_AUDIT = Object.freeze({
  sourceVersion: '7.2.0',
  runtimeSolidCount: 21,
  paintableRuntimeSolidIds: PAINTABLE_RUNTIME_SOLID_IDS,
  uninkableRuntimeSolidIds: UNINKABLE_RUNTIME_SOLID_IDS,
  unresolvedRuntimeSurfaceIds: [
    ...UNKNOWN_FLAT_RUNTIME_SOLID_IDS
  ] as readonly string[],
  confirmedPaintableCount: PAINTABLE_RUNTIME_SOLID_IDS.length,
  confirmedUninkableCount: UNINKABLE_RUNTIME_SOLID_IDS.length,
  unresolvedCount: UNKNOWN_FLAT_RUNTIME_SOLID_IDS.length,
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
      'Existing canonical ledger semantics authorize the center-low pair, right-low pair, and center-origin step-top. Resolution Pass 4 binds the four exact FloorSlope00 central quads. Resolution Pass 5 binds the two exact spawn-high components to current Turf evidence. Resolution Pass 10A binds the two exact FloorConcrete03 route-ramp quads to the author Turf PDF white slope-marker class. Resolution Pass 10C binds the two exact model-Y=6.0 first-drop landing components to the current author Turf white flat class while retaining adjacent gray faces as a negative control.',
    confirmedUninkable:
      'Author/vector semantics explicitly identify the grate pair and upper-glass family as uninkable; water is also uninkable but is not a current runtime solid because its Y remains unresolved.',
    unresolved:
      'Only the two whole underpass floors outside the already-registered Splat-Zone intersections still lack equally strong face-specific paint authority.',
    materialNameRule:
      'Floor/Concrete/Slope/Grass/Line or other source object/material names are never paint authority by themselves.'
  }),
  missingAuthoritativeEvidence: [
    'Current Temple01 per-face/per-collider paint metadata or a registered paint mask that can resolve the underpass remainder outside the exact Splat-Zone intersections.',
    'Or controlled gameplay paint tests/captures for the remaining underpass floor cells, registered strongly enough to prove ink acceptance versus rejection outside the objective subregions.'
  ] as const,
  confidence: 'HIGH' as const,
  notes:
    'Resolution Pass 10C reduces UNKNOWN runtime paint authority from four solids to two by promoting only the exact mirrored first-drop landing pair from author-vector semantics. UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING remains activation-blocking only for the two whole underpass solids. TURF_SCOREABLE_MASK_PENDING remains a separate activation blocker.'
});

export const UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS:
  readonly UndertowRuntimePaintAuthorityRecord[] = [
  ...CANONICAL_LEDGER_PAINTABLE_RUNTIME_SOLID_IDS.map((runtimeSolidId) => ({
    runtimeSolidId,
    authority: 'PAINTABLE' as const,
    evidenceClass: 'CANONICAL_LEDGER' as const,
    notes: 'Canonical ledger already carries BLOCKOUT-safe PAINTABLE semantics for this runtime floor.'
  })),
  ...AUTHOR_RESOLVED_SLOPE_PAINTABLE_RUNTIME_SOLID_IDS.map((runtimeSolidId) => ({
    runtimeSolidId,
    authority: 'PAINTABLE' as const,
    evidenceClass: 'AUTHOR_VECTOR_SEMANTIC' as const,
    notes:
      'Resolution Pass 4 binds this exact FloorSlope00 quad to the white dashed central slope field; the author legend marks gray as uninkable and dashes as slope/ramp.'
  })),
  ...AUTHOR_RESOLVED_ROUTE_RAMP_PAINTABLE_RUNTIME_SOLID_IDS.map((runtimeSolidId) => ({
    runtimeSolidId,
    authority: 'PAINTABLE' as const,
    evidenceClass: 'AUTHOR_VECTOR_SEMANTIC' as const,
    notes:
      'Resolution Pass 10A registers this exact FloorConcrete03 quad to the pinned Turf PDF white slope-marker class: 0.24pt black / 0.96pt dash family, median brightness 255, and 64 brightness levels of separation from the gray uninkable glass class.'
  })),
  ...AUTHOR_RESOLVED_FIRST_DROP_PAINTABLE_RUNTIME_SOLID_IDS.map((runtimeSolidId) => ({
    runtimeSolidId,
    authority: 'PAINTABLE' as const,
    evidenceClass: 'AUTHOR_VECTOR_SEMANTIC' as const,
    notes:
      'Resolution Pass 10C registers the exact model-Y=6.0 first-drop landing component to the pinned current Turf PDF white flat class: median brightness 255, near-white fraction >0.93, adjacent gray control median 191, gray overlap <1%, and first-drop lip boundary residual <=0.5m.'
  })),
  ...PUBLIC_RESOLVED_SPAWN_PAINTABLE_RUNTIME_SOLID_IDS.map((runtimeSolidId) => ({
    runtimeSolidId,
    authority: 'PAINTABLE' as const,
    evidenceClass: 'PUBLIC_CURRENT_GAMEPLAY' as const,
    notes:
      'Resolution Pass 5 registers the exact spawn-center-seeded Y=7.5m component to current Turf references that describe the broad spawn/base high ground as territory players must ink.'
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
  if (audit.unresolvedCount !== 2 || audit.paintAuthorityComplete) {
    errors.push('the two remaining unknown runtime paint surfaces must remain localized and activation-blocking');
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
  for (const id of PUBLIC_RESOLVED_SPAWN_PAINTABLE_RUNTIME_SOLID_IDS) {
    if (!records.some(
      (record) =>
        record.runtimeSolidId === id &&
        record.authority === 'PAINTABLE' &&
        record.evidenceClass === 'PUBLIC_CURRENT_GAMEPLAY'
    )) {
      errors.push(`${id}: current-layout spawn paint authority record missing`);
    }
  }
  if (
    UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.length !== 4 ||
    UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.some(
      (record) => record.paintAuthority !== 'PAINTABLE'
    )
  ) {
    errors.push('four exact central slope quads must remain author-resolved PAINTABLE');
  }
  if (
    UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.length !== 2 ||
    UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.some(
      (record) => record.paintAuthority !== 'PAINTABLE'
    )
  ) {
    errors.push('right-low route ramp pair must remain author-resolved PAINTABLE');
  }
  for (const id of AUTHOR_RESOLVED_ROUTE_RAMP_PAINTABLE_RUNTIME_SOLID_IDS) {
    if (!records.some(
      (record) =>
        record.runtimeSolidId === id &&
        record.authority === 'PAINTABLE' &&
        record.evidenceClass === 'AUTHOR_VECTOR_SEMANTIC'
    )) {
      errors.push(`${id}: Resolution Pass 10A route-ramp paint authority record missing`);
    }
  }
  for (const id of AUTHOR_RESOLVED_FIRST_DROP_PAINTABLE_RUNTIME_SOLID_IDS) {
    if (!records.some(
      (record) =>
        record.runtimeSolidId === id &&
        record.authority === 'PAINTABLE' &&
        record.evidenceClass === 'AUTHOR_VECTOR_SEMANTIC'
    )) {
      errors.push(`${id}: Resolution Pass 10C first-drop paint authority record missing`);
    }
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
