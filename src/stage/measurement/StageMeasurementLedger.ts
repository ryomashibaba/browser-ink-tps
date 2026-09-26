export type EvidenceConfidence = 'CONFIRMED' | 'HIGH' | 'PROVISIONAL' | 'UNKNOWN';

export type EvidenceKind =
  | 'HANDOFF_CANONICAL'
  | 'USER_RULE_MAP'
  | 'USER_CAPTURE'
  | 'NINTENDO_CHANGELOG'
  | 'WEB_OVERHEAD'
  | 'WEB_GAMEPLAY_REFERENCE'
  | 'EXTRACTED_GAME_GEOMETRY';

export type RuleVariantId = 'TURF' | 'ZONES' | 'TOWER' | 'RAINMAKER' | 'CLAMS';

export type SurfaceSemantic =
  | 'PAINTABLE'
  | 'UNINKABLE'
  | 'GLASS'
  | 'GRATE'
  | 'WATER'
  | 'KILL'
  | 'ONE_WAY_DROP'
  | 'SOLID_DECORATION'
  | 'OBJECTIVE_SURFACE';

export type TransitionKind =
  | 'NONE'
  | 'SLOPE'
  | 'STEP'
  | 'DROP'
  | 'ONE_WAY_DROP'
  | 'JUMP_REQUIRED'
  | 'INKRAIL';

export interface EvidenceReference {
  id: string;
  kind: EvidenceKind;
  label: string;
  sourceVersion?: string;
  notes?: string;
}

export interface ConfidenceTag {
  confidence: EvidenceConfidence;
  evidenceIds: readonly string[];
  notes?: string;
}

export interface LedgerAssumption extends ConfidenceTag {
  id: string;
  value: number | string | boolean | null;
  unit?: string;
  candidates?: readonly (number | string | boolean)[];
}

export interface XzMeasurement extends ConfidenceTag {
  kind: 'UNRESOLVED' | 'POINT' | 'RECT' | 'POLYLINE' | 'POLYGON' | 'POLYGON_SET';
  pointMeters?: readonly [number, number];
  rectMeters?: Readonly<{
    centerX: number;
    centerZ: number;
    width: number;
    depth: number;
  }>;
  polylineMeters?: readonly (readonly [number, number])[];
  polygonMeters?: readonly (readonly [number, number])[];
  polygonSetMeters?: readonly Readonly<{
    outerMeters: readonly (readonly [number, number])[];
    holesMeters?: readonly (readonly (readonly [number, number])[])[];
  }>[];
}

export interface YMeasurement extends ConfidenceTag {
  floorId?: string;
  yMeters?: number;
  deltaMeters?: number;
  candidatesMeters?: readonly number[];
}

export interface TransitionMeasurement extends ConfidenceTag {
  kind: TransitionKind;
  deltaYMeters?: number;
  candidatesMeters?: readonly number[];
}

export interface SurfaceMeasurement extends ConfidenceTag {
  semantics: readonly SurfaceSemantic[];
}

export interface StageMeasurementEntry {
  id: string;
  feature: string;
  region: string;
  featureKind: 'SURFACE' | 'TRANSITION' | 'OBJECT' | 'OBJECTIVE';
  appliesTo: readonly RuleVariantId[];
  confidence: EvidenceConfidence;
  evidenceIds: readonly string[];
  xz: XzMeasurement;
  y: YMeasurement;
  transition: TransitionMeasurement;
  surface: SurfaceMeasurement;
  notes?: string;
}

export interface StageRuleFact extends ConfidenceTag {
  id: string;
  rule: RuleVariantId;
  statement: string;
  values?: Readonly<Record<string, number | string | boolean>>;
}

export interface StageMeasurementLedger {
  stageId: string;
  displayName: string;
  sourceVersion: string;
  commonTerrainId: string;
  coordinateSystem: Readonly<{
    upAxis: 'Y';
    centerX: 0;
    centerZ: 0;
    centerLowestFloorY: 0;
    centerLowestFloorConfidence: EvidenceConfidence;
    symmetry: 'ROTATE_180' | 'NONE' | 'UNKNOWN';
    symmetryConfidence: EvidenceConfidence;
  }>;
  evidence: readonly EvidenceReference[];
  assumptions: readonly LedgerAssumption[];
  entries: readonly StageMeasurementEntry[];
  ruleFacts: readonly StageRuleFact[];
}

function validateEvidenceIds(
  ids: readonly string[],
  evidenceIds: ReadonlySet<string>,
  context: string,
  errors: string[]
): void {
  for (const id of ids) {
    if (!evidenceIds.has(id)) errors.push(`${context}: unknown evidence id '${id}'.`);
  }
}

function validateTag(
  tag: ConfidenceTag,
  evidenceIds: ReadonlySet<string>,
  context: string,
  errors: string[]
): void {
  validateEvidenceIds(tag.evidenceIds, evidenceIds, context, errors);
  if (tag.confidence !== 'UNKNOWN' && tag.evidenceIds.length === 0) {
    errors.push(`${context}: ${tag.confidence} data must cite evidence.`);
  }
}

function finite(value: number | undefined): boolean {
  return value === undefined || Number.isFinite(value);
}

export function validateStageMeasurementLedger(ledger: StageMeasurementLedger): string[] {
  const errors: string[] = [];
  const evidenceIds = new Set<string>();
  for (const evidence of ledger.evidence) {
    if (evidenceIds.has(evidence.id)) errors.push(`duplicate evidence id '${evidence.id}'.`);
    evidenceIds.add(evidence.id);
  }

  const assumptionIds = new Set<string>();
  for (const assumption of ledger.assumptions) {
    if (assumptionIds.has(assumption.id)) errors.push(`duplicate assumption id '${assumption.id}'.`);
    assumptionIds.add(assumption.id);
    validateTag(assumption, evidenceIds, `assumption '${assumption.id}'`, errors);
    if (assumption.confidence === 'UNKNOWN' && assumption.value !== null) {
      errors.push(`assumption '${assumption.id}': UNKNOWN data cannot expose an exact value.`);
    }
  }

  const entryIds = new Set<string>();
  for (const entry of ledger.entries) {
    if (entryIds.has(entry.id)) errors.push(`duplicate entry id '${entry.id}'.`);
    entryIds.add(entry.id);
    validateTag(entry, evidenceIds, `entry '${entry.id}'`, errors);
    validateTag(entry.xz, evidenceIds, `entry '${entry.id}' XZ`, errors);
    validateTag(entry.y, evidenceIds, `entry '${entry.id}' Y`, errors);
    validateTag(entry.transition, evidenceIds, `entry '${entry.id}' transition`, errors);
    validateTag(entry.surface, evidenceIds, `entry '${entry.id}' surface`, errors);

    if (entry.appliesTo.length === 0) errors.push(`entry '${entry.id}': appliesTo must not be empty.`);
    if (entry.xz.kind === 'UNRESOLVED' && entry.xz.confidence !== 'UNKNOWN') {
      errors.push(`entry '${entry.id}': unresolved XZ must stay UNKNOWN.`);
    }
    if (entry.xz.kind === 'POINT' && !entry.xz.pointMeters) {
      errors.push(`entry '${entry.id}': POINT XZ requires pointMeters.`);
    }
    if (entry.xz.kind === 'RECT' && !entry.xz.rectMeters) {
      errors.push(`entry '${entry.id}': RECT XZ requires rectMeters.`);
    }
    if (
      entry.xz.kind === 'POLYLINE' &&
      (!entry.xz.polylineMeters || entry.xz.polylineMeters.length < 2)
    ) {
      errors.push(`entry '${entry.id}': POLYLINE XZ requires at least two points.`);
    }
    if (
      entry.xz.kind === 'POLYGON' &&
      (!entry.xz.polygonMeters || entry.xz.polygonMeters.length < 3)
    ) {
      errors.push(`entry '${entry.id}': POLYGON XZ requires at least three points.`);
    }

    if (entry.xz.kind === 'POLYGON_SET') {
      const polygons = entry.xz.polygonSetMeters;
      if (!polygons || polygons.length === 0) {
        errors.push(`entry '${entry.id}': POLYGON_SET XZ requires at least one polygon.`);
      } else {
        polygons.forEach((polygon, polygonIndex) => {
          if (polygon.outerMeters.length < 3) {
            errors.push(
              `entry '${entry.id}': POLYGON_SET polygon ${polygonIndex} requires at least three outer points.`
            );
          }
          (polygon.holesMeters ?? []).forEach((hole, holeIndex) => {
            if (hole.length < 3) {
              errors.push(
                `entry '${entry.id}': POLYGON_SET polygon ${polygonIndex} hole ${holeIndex} requires at least three points.`
              );
            }
          });
        });
      }
    }

    if (!finite(entry.y.yMeters) || !finite(entry.y.deltaMeters)) {
      errors.push(`entry '${entry.id}': Y contains a non-finite value.`);
    }
    if (!finite(entry.transition.deltaYMeters)) {
      errors.push(`entry '${entry.id}': transition contains a non-finite value.`);
    }
    if (
      entry.y.confidence === 'UNKNOWN' &&
      (entry.y.yMeters !== undefined || entry.y.deltaMeters !== undefined)
    ) {
      errors.push(`entry '${entry.id}': UNKNOWN Y cannot expose an exact value.`);
    }
    if (entry.surface.confidence !== 'UNKNOWN' && entry.surface.semantics.length === 0) {
      errors.push(`entry '${entry.id}': known surface metadata must declare semantics.`);
    }
  }

  const factIds = new Set<string>();
  for (const fact of ledger.ruleFacts) {
    if (factIds.has(fact.id)) errors.push(`duplicate rule fact id '${fact.id}'.`);
    factIds.add(fact.id);
    validateTag(fact, evidenceIds, `rule fact '${fact.id}'`, errors);
  }

  return errors;
}
