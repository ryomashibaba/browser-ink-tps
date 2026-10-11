import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION, type StageVector3 } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';

interface GapVector {
  aComponentId: string;
  bComponentId: string;
  distanceMeters: number;
  modelDistanceMeters: number;
  projectDelta: StageVector3;
  modelDelta: StageVector3;
  projectHorizontalDistanceMeters: number;
  modelHorizontalDistanceMeters: number;
  projectVerticalDeltaMeters: number;
  modelVerticalDeltaMeters: number;
  aPointModel: StageVector3;
  bPointModel: StageVector3;
}

interface Fixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  pass18i: {
    diagnosticOnly: true;
    runtimePromotionAuthorized: false;
    grate: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GapVector>;
    glass: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GapVector[]>;
  };
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';

function expectPureModelZGap(record: GapVector, meters: number) {
  expect(record.modelDistanceMeters).toBeCloseTo(meters, 12);
  expect(record.modelHorizontalDistanceMeters).toBeCloseTo(meters, 12);
  expect(record.modelVerticalDeltaMeters).toBeCloseTo(0, 12);
  expect(record.projectVerticalDeltaMeters).toBeCloseTo(0, 12);
  expect(record.modelDelta[0]).toBeCloseTo(0, 12);
  expect(record.modelDelta[1]).toBeCloseTo(0, 12);
  expect(Math.abs(record.modelDelta[2])).toBeCloseTo(meters, 12);
}

describe('T21 Pass 18I exact source-gap vector decomposition', () => {
  it('proves the localized gaps are pure horizontal model-Z separations', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if (!fixturePath) return;

    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);
    expect(fixture.pass18i.diagnosticOnly).toBe(true);
    expect(fixture.pass18i.runtimePromotionAuthorized).toBe(false);

    const gratePos = fixture.pass18i.grate.POSITIVE_Z;
    const grateNeg = fixture.pass18i.grate.NEGATIVE_Z;
    expectPureModelZGap(gratePos, 0.5);
    expectPureModelZGap(grateNeg, 0.5);
    expect(gratePos.distanceMeters).toBeCloseTo(0.5185586972146141, 12);
    expect(grateNeg.distanceMeters).toBeCloseTo(0.5185586972146198, 12);
    expect(gratePos.modelDelta[2]).toBeCloseTo(0.5, 12);
    expect(grateNeg.modelDelta[2]).toBeCloseTo(-0.5, 12);
    expect(gratePos.aPointModel[0]).toBeCloseTo(-30.5, 12);
    expect(gratePos.aPointModel[1]).toBeCloseTo(9.0, 12);
    expect(gratePos.aPointModel[2]).toBeCloseTo(35.5, 12);
    expect(gratePos.bPointModel[0]).toBeCloseTo(-30.5, 12);
    expect(gratePos.bPointModel[1]).toBeCloseTo(9.0, 12);
    expect(gratePos.bPointModel[2]).toBeCloseTo(36.0, 12);
    expect(grateNeg.aPointModel[0]).toBeCloseTo(30.5, 12);
    expect(grateNeg.aPointModel[1]).toBeCloseTo(9.0, 12);
    expect(grateNeg.aPointModel[2]).toBeCloseTo(-35.5, 12);
    expect(grateNeg.bPointModel[0]).toBeCloseTo(30.5, 12);
    expect(grateNeg.bPointModel[1]).toBeCloseTo(9.0, 12);
    expect(grateNeg.bPointModel[2]).toBeCloseTo(-36.0, 12);

    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const records = fixture.pass18i.glass[side];
      expect(records).toHaveLength(2);
      for (const record of records) {
        expectPureModelZGap(record, 2.0);
        expect(record.distanceMeters).toBeCloseTo(2.07423478885845, 12);
        expect(Math.abs(record.aPointModel[0])).toBeCloseTo(
          Math.abs(record.bPointModel[0]),
          12
        );
        expect(record.aPointModel[1]).toBeCloseTo(3.0, 12);
        expect(record.bPointModel[1]).toBeCloseTo(3.0, 12);
        expect(Math.abs(record.aPointModel[2])).toBeCloseTo(21.5, 12);
        expect(Math.abs(record.bPointModel[2])).toBeCloseTo(19.5, 12);
      }
    }

    const glassAbsX = fixture.pass18i.glass.POSITIVE_Z
      .map((record) => Math.abs(record.aPointModel[0]))
      .sort((a, b) => a - b);
    expect(glassAbsX[0]).toBeCloseTo(4.25, 12);
    expect(glassAbsX[1]).toBeCloseTo(16.0, 12);

    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  });
});
