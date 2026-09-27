import { GAME_CONFIG } from '../../config/game/gameConfig';
import type { StageNavigationLinkDefinition } from '../StageDefinition';
import {
  UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT,
  undertowTemple01ModelXZToProjectXZ
} from './UndertowSpillwayModelXZGeometry';

export type UndertowDropSide = 'POSITIVE_Z' | 'NEGATIVE_Z';
type Cell = readonly [number, number];

interface UndertowDropLinkRecordBase {
  id: string;
  side: UndertowDropSide;
  upperCell: Cell;
  lowerCell: Cell;
  startYProjectMeters: number;
  endYProjectMeters: number;
  confidence: 'HIGH';
  notes: string;
}

export type UndertowFirstDropLinkRecord = UndertowDropLinkRecordBase;
export type UndertowRightSmallDropLinkRecord = UndertowDropLinkRecordBase;

const FIRST_DROP_POSITIVE_CELL_PAIRS: readonly (readonly [Cell, Cell])[] = [
  [[-204, 328], [-202, 328]],
  [[-204, 346], [-202, 346]],
  [[-204, 364], [-202, 364]],
  [[-204, 382], [-202, 382]],
  [[-190, 396], [-190, 391]],
  [[-167, 396], [-167, 391]]
] as const;

const RIGHT_SMALL_DROP_POSITIVE_CELL_PAIRS:
  readonly (readonly [Cell, Cell])[] = [
  [[-156, 401], [-155, 401]],
  [[-156, 421], [-155, 421]],
  [[-156, 441], [-155, 441]],
  [[-147, 456], [-147, 451]],
  [[-129, 456], [-129, 451]],
  [[-112, 456], [-112, 451]],
  [[-94, 456], [-94, 451]]
] as const;

function mirrorCell([x, z]: Cell): Cell {
  return [-x, -z];
}

function mirroredRecords(
  prefix: string,
  positivePairs: readonly (readonly [Cell, Cell])[],
  startYProjectMeters: number,
  endYProjectMeters: number,
  positiveNotes: string,
  negativeNotes: string
): readonly UndertowDropLinkRecordBase[] {
  const positive = positivePairs.map(([upperCell, lowerCell], index) => ({
    id: `${prefix}-positive-z-${index + 1}`,
    side: 'POSITIVE_Z' as const,
    upperCell,
    lowerCell,
    startYProjectMeters,
    endYProjectMeters,
    confidence: 'HIGH' as const,
    notes: positiveNotes
  }));
  const negative = positive.map((record, index) => ({
    id: `${prefix}-negative-z-${index + 1}`,
    side: 'NEGATIVE_Z' as const,
    upperCell: mirrorCell(record.upperCell),
    lowerCell: mirrorCell(record.lowerCell),
    startYProjectMeters,
    endYProjectMeters,
    confidence: 'HIGH' as const,
    notes: negativeNotes
  }));
  return [...positive, ...negative];
}

export const UNDERTOW_FIRST_DROP_LINK_RECORDS:
  readonly UndertowFirstDropLinkRecord[] = mirroredRecords(
    'first-drop',
    FIRST_DROP_POSITIVE_CELL_PAIRS,
    7.5,
    3,
    'POS canonical source-lip candidate snapped to the independently audited spawn-high and first-drop-landing Temple01 masks.',
    'Exact model-space 180-degree mirror of the POS canonical first-drop cells; CI #675 proves all mirrored cells exist in the independently extracted NEG masks.'
  );

export const UNDERTOW_RIGHT_SMALL_DROP_LINK_RECORDS:
  readonly UndertowRightSmallDropLinkRecord[] = mirroredRecords(
    'right-small-drop',
    RIGHT_SMALL_DROP_POSITIVE_CELL_PAIRS,
    7.5,
    4.5,
    'POS canonical source-lip candidate snapped to the independently audited spawn-high and right-low Temple01 masks.',
    'Exact model-space 180-degree mirror of the POS canonical right-small-drop cells; CI #676 proves all mirrored cells exist in the independently extracted NEG masks.'
  );

export const UNDERTOW_FIRST_DROP_LINK_AUDIT = Object.freeze({
  source: 'Temple01 local 0.125m floor masks + HIGH vector hard edge',
  auditedCandidateSpacingMeters: 2.0,
  rasterStepMeters: UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.rasterStepMeters,
  linksPerSide: 6,
  startYProjectMeters: 7.5,
  endYProjectMeters: 3.0,
  verticalDropMeters: 4.5,
  runtimeEndpointRadiusMeters: GAME_CONFIG.cpu.agentRadiusMeters,
  runtimeEndpointRadiusSource: 'GAME_CONFIG.cpu.agentRadiusMeters',
  bidirectional: false,
  confidence: 'HIGH' as const,
  notes:
    'CI #675 canonicalizes POS cells and verifies their exact 180-degree mirrors inside independently extracted NEG masks. The 2.0m spacing belongs only to the evidence-sampling pass, not a source measurement. Activation remains gated by full-stage connectivity QA.'
});

export const UNDERTOW_RIGHT_SMALL_DROP_LINK_AUDIT = Object.freeze({
  source: 'Temple01 local 0.125m floor masks + HIGH separate right-drop hard edge',
  auditedCandidateSpacingMeters: 2.0,
  rasterStepMeters: UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.rasterStepMeters,
  linksPerSide: 7,
  startYProjectMeters: 7.5,
  endYProjectMeters: 4.5,
  verticalDropMeters: 3.0,
  runtimeEndpointRadiusMeters: GAME_CONFIG.cpu.agentRadiusMeters,
  runtimeEndpointRadiusSource: 'GAME_CONFIG.cpu.agentRadiusMeters',
  bidirectional: false,
  confidence: 'HIGH' as const,
  notes:
    'CI #676 canonicalizes seven POS right-small-drop cells and verifies exact mirrored NEG mask membership with XOR=0. This remains a one-way drop; no hidden ramp is created.'
});

function recordsToLinks(
  records: readonly UndertowDropLinkRecordBase[],
  userIdBase: number
): readonly StageNavigationLinkDefinition[] {
  const cell = UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.rasterStepMeters;
  return records.map((record, index) => {
    const startXZ = undertowTemple01ModelXZToProjectXZ([
      record.upperCell[0] * cell,
      record.upperCell[1] * cell
    ]);
    const endXZ = undertowTemple01ModelXZToProjectXZ([
      record.lowerCell[0] * cell,
      record.lowerCell[1] * cell
    ]);
    return {
      id: record.id,
      start: [startXZ[0], record.startYProjectMeters, startXZ[1]],
      end: [endXZ[0], record.endYProjectMeters, endXZ[1]],
      radiusMeters: GAME_CONFIG.cpu.agentRadiusMeters,
      bidirectional: false,
      userId: userIdBase + index
    };
  });
}

export function undertowFirstDropNavigationLinks():
  readonly StageNavigationLinkDefinition[] {
  return recordsToLinks(UNDERTOW_FIRST_DROP_LINK_RECORDS, 2100);
}

export function undertowRightSmallDropNavigationLinks():
  readonly StageNavigationLinkDefinition[] {
  return recordsToLinks(UNDERTOW_RIGHT_SMALL_DROP_LINK_RECORDS, 2200);
}

export function undertowDropNavigationLinks():
  readonly StageNavigationLinkDefinition[] {
  return [
    ...undertowFirstDropNavigationLinks(),
    ...undertowRightSmallDropNavigationLinks()
  ];
}

function mirroredRecordErrors(
  records: readonly UndertowDropLinkRecordBase[],
  linksPerSide: number,
  label: string
): string[] {
  const errors: string[] = [];
  const half = records.length / 2;
  if (half !== linksPerSide) {
    errors.push(`${label} link count no longer matches audited links-per-side`);
    return errors;
  }
  for (let i = 0; i < half; i += 1) {
    const positive = records[i]!;
    const negative = records[i + half]!;
    const expectedUpper = mirrorCell(positive.upperCell);
    const expectedLower = mirrorCell(positive.lowerCell);
    if (
      negative.upperCell[0] !== expectedUpper[0] ||
      negative.upperCell[1] !== expectedUpper[1] ||
      negative.lowerCell[0] !== expectedLower[0] ||
      negative.lowerCell[1] !== expectedLower[1]
    ) {
      errors.push(`${positive.id}: mirrored NEG cell pair drifted`);
    }
  }
  return errors;
}

export function undertowDropNavigationErrors(): readonly string[] {
  const errors = [
    ...mirroredRecordErrors(
      UNDERTOW_FIRST_DROP_LINK_RECORDS,
      UNDERTOW_FIRST_DROP_LINK_AUDIT.linksPerSide,
      'first-drop'
    ),
    ...mirroredRecordErrors(
      UNDERTOW_RIGHT_SMALL_DROP_LINK_RECORDS,
      UNDERTOW_RIGHT_SMALL_DROP_LINK_AUDIT.linksPerSide,
      'right-small-drop'
    )
  ];

  const ids = new Set<string>();
  const userIds = new Set<number>();
  for (const link of undertowDropNavigationLinks()) {
    if (ids.has(link.id)) errors.push(`${link.id}: duplicate navigation link id`);
    ids.add(link.id);
    if (link.userId === undefined) {
      errors.push(`${link.id}: userId missing`);
    } else if (userIds.has(link.userId)) {
      errors.push(`${link.id}: duplicate userId ${link.userId}`);
    } else {
      userIds.add(link.userId);
    }
    if (link.bidirectional) errors.push(`${link.id}: drop link must remain one-way`);
    if (link.radiusMeters !== GAME_CONFIG.cpu.agentRadiusMeters) {
      errors.push(`${link.id}: endpoint radius no longer follows CPU agent radius`);
    }
    if (!(link.start[1] > link.end[1])) {
      errors.push(`${link.id}: drop link no longer descends`);
    }
  }
  return errors;
}

// Backward-compatible focused validator retained for callers/tests added at the
// first-drop checkpoint.
export function undertowFirstDropLinkErrors(): readonly string[] {
  const errors = mirroredRecordErrors(
    UNDERTOW_FIRST_DROP_LINK_RECORDS,
    UNDERTOW_FIRST_DROP_LINK_AUDIT.linksPerSide,
    'first-drop'
  );
  for (const link of undertowFirstDropNavigationLinks()) {
    if (link.bidirectional) errors.push(`${link.id}: first drop must remain one-way`);
    if (link.start[1] !== 7.5 || link.end[1] !== 3) {
      errors.push(`${link.id}: first-drop Y endpoints drifted`);
    }
    if (link.radiusMeters !== GAME_CONFIG.cpu.agentRadiusMeters) {
      errors.push(`${link.id}: endpoint radius no longer follows CPU agent radius`);
    }
  }
  return errors;
}
