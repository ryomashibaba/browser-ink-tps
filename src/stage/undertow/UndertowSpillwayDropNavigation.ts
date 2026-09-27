import { GAME_CONFIG } from '../../config/game/gameConfig';
import type { StageNavigationLinkDefinition } from '../StageDefinition';
import {
  UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT,
  undertowTemple01ModelXZToProjectXZ
} from './UndertowSpillwayModelXZGeometry';

export type UndertowFirstDropSide = 'POSITIVE_Z' | 'NEGATIVE_Z';
type Cell = readonly [number, number];

export interface UndertowFirstDropLinkRecord {
  id: string;
  side: UndertowFirstDropSide;
  upperCell: Cell;
  lowerCell: Cell;
  startYProjectMeters: 7.5;
  endYProjectMeters: 3;
  confidence: 'HIGH';
  notes: string;
}

const POSITIVE_Z_CELL_PAIRS: readonly (readonly [Cell, Cell])[] = [
  [[-204, 328], [-202, 328]],
  [[-204, 346], [-202, 346]],
  [[-204, 364], [-202, 364]],
  [[-204, 382], [-202, 382]],
  [[-190, 396], [-190, 391]],
  [[-167, 396], [-167, 391]]
] as const;

function mirrorCell([x, z]: Cell): Cell {
  return [-x, -z];
}

const positiveRecords: readonly UndertowFirstDropLinkRecord[] =
  POSITIVE_Z_CELL_PAIRS.map(([upperCell, lowerCell], index) => ({
    id: `first-drop-positive-z-${index + 1}`,
    side: 'POSITIVE_Z' as const,
    upperCell,
    lowerCell,
    startYProjectMeters: 7.5 as const,
    endYProjectMeters: 3 as const,
    confidence: 'HIGH' as const,
    notes:
      'POS canonical link candidate: source HIGH first-drop lip snapped to independently audited spawn-high / first-drop-landing Temple01 masks.'
  }));

const negativeRecords: readonly UndertowFirstDropLinkRecord[] =
  positiveRecords.map((record, index) => ({
    id: `first-drop-negative-z-${index + 1}`,
    side: 'NEGATIVE_Z' as const,
    upperCell: mirrorCell(record.upperCell),
    lowerCell: mirrorCell(record.lowerCell),
    startYProjectMeters: 7.5 as const,
    endYProjectMeters: 3 as const,
    confidence: 'HIGH' as const,
    notes:
      'Exact model-space 180-degree mirror of the POS canonical first-drop link cells. CI must prove mirrored cells exist in the independently extracted NEG masks.'
  }));

export const UNDERTOW_FIRST_DROP_LINK_RECORDS:
  readonly UndertowFirstDropLinkRecord[] = [
  ...positiveRecords,
  ...negativeRecords
];

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
    'The 2.0m spacing belongs only to the evidence-sampling pass, not a source measurement. Runtime endpoint radius is derived from the existing CPU agent radius. Activation remains gated by full-stage connectivity QA.'
});

export function undertowFirstDropNavigationLinks():
  readonly StageNavigationLinkDefinition[] {
  const cell = UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.rasterStepMeters;
  return UNDERTOW_FIRST_DROP_LINK_RECORDS.map((record, index) => {
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
      userId: 2100 + index
    };
  });
}

export function undertowFirstDropLinkErrors(): readonly string[] {
  const errors: string[] = [];
  const half = UNDERTOW_FIRST_DROP_LINK_RECORDS.length / 2;
  if (half !== UNDERTOW_FIRST_DROP_LINK_AUDIT.linksPerSide) {
    errors.push('first-drop link count no longer matches audited links-per-side');
  }
  for (let i = 0; i < half; i += 1) {
    const positive = UNDERTOW_FIRST_DROP_LINK_RECORDS[i]!;
    const negative = UNDERTOW_FIRST_DROP_LINK_RECORDS[i + half]!;
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

  for (const link of undertowFirstDropNavigationLinks()) {
    if (link.bidirectional) {
      errors.push(`${link.id}: first drop must remain one-way`);
    }
    if (Math.abs(link.start[1] - 7.5) > 1e-9 || Math.abs(link.end[1] - 3) > 1e-9) {
      errors.push(`${link.id}: first-drop Y endpoints drifted`);
    }
    if (link.radiusMeters !== GAME_CONFIG.cpu.agentRadiusMeters) {
      errors.push(`${link.id}: endpoint radius no longer follows CPU agent radius`);
    }
  }
  return errors;
}
