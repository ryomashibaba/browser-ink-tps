import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';

interface BridgeCandidate {
  sourceObject: string;
  sourceMaterial: string;
  walkQualifiedFaceCount: number;
  overlayFaceCount: number;
  steepOrNonUpwardFaceCount: number;
  distanceToA: number;
  distanceToB: number;
}

interface GapRecord {
  a: { id: string };
  b: { id: string };
  distanceMeters: number;
  bboxAxisGapsMeters: [number, number, number];
  verticalRangesOverlap: boolean;
  nearbySourceComponentCount: number;
  trusted030BridgeCandidateCount: number;
  humanContact0345BridgeCandidateCount: number;
  trusted030BridgeCandidates: BridgeCandidate[];
  humanContact0345BridgeCandidates: BridgeCandidate[];
}

interface Pass18hRecord {
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  localMarginMeters: number;
  trustedBridgeMeters: number;
  humanContactMeters: number;
  grate: Record<'POSITIVE_Z' | 'NEGATIVE_Z', GapRecord>;
  glass: Record<
    'POSITIVE_Z' | 'NEGATIVE_Z',
    {
      frontierDistanceMeters: number;
      tiedFrontierCount: number;
      gaps: GapRecord[];
    }
  >;
}

interface Fixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  pass18h: Pass18hRecord;
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';

function materialLeaf(material: string): string {
  return material.replace(/^Fld_Temple01_/, '');
}

describe('T21 Pass 18H local gap source-class audit', () => {
  it('proves strict bridge candidates are overlays or non-walk geometry only', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if (!fixturePath) return;

    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const audit = fixture.pass18h;
    expect(audit.diagnosticOnly).toBe(true);
    expect(audit.runtimePromotionAuthorized).toBe(false);
    expect(audit.localMarginMeters).toBe(3.0);
    expect(audit.trustedBridgeMeters).toBe(0.30);
    expect(audit.humanContactMeters).toBe(0.345);

    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const grate = audit.grate[side];
      expect(grate.distanceMeters).toBeCloseTo(0.518558697214614, 12);
      expect(grate.bboxAxisGapsMeters).toEqual([0, 0, 0]);
      expect(grate.verticalRangesOverlap).toBe(true);
      expect(grate.nearbySourceComponentCount).toBe(142);
      expect(grate.trusted030BridgeCandidateCount).toBe(4);
      expect(grate.humanContact0345BridgeCandidateCount).toBe(4);
      expect(grate.trusted030BridgeCandidates).toHaveLength(4);
      expect(
        grate.trusted030BridgeCandidates.every(
          (candidate) => candidate.walkQualifiedFaceCount === 0
        )
      ).toBe(true);
      expect(
        grate.trusted030BridgeCandidates.filter(
          (candidate) => materialLeaf(candidate.sourceMaterial) === 'FloorLine00'
        )
      ).toHaveLength(3);
      const object00 = grate.trusted030BridgeCandidates.filter(
        (candidate) => materialLeaf(candidate.sourceMaterial) === 'Object00'
      );
      expect(object00).toHaveLength(1);
      expect(object00[0]!.overlayFaceCount).toBe(0);
      expect(object00[0]!.steepOrNonUpwardFaceCount).toBeGreaterThan(0);
      expect(object00[0]!.distanceToA).toBeCloseTo(0, 12);
      expect(object00[0]!.distanceToB).toBeCloseTo(0, 12);
    }

    const expectedGlass = {
      POSITIVE_Z: {
        bridgedTarget:
          'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c12',
        unbridgedTarget:
          'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c15'
      },
      NEGATIVE_Z: {
        bridgedTarget:
          'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c17',
        unbridgedTarget:
          'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c13'
      }
    } as const;

    for (const side of ['POSITIVE_Z', 'NEGATIVE_Z'] as const) {
      const glass = audit.glass[side];
      expect(glass.frontierDistanceMeters).toBeCloseTo(2.07423478885845, 12);
      expect(glass.tiedFrontierCount).toBe(2);
      expect(glass.gaps).toHaveLength(2);
      expect(glass.gaps.map((gap) => gap.trusted030BridgeCandidateCount).sort())
        .toEqual([0, 2]);

      const bridged = glass.gaps.find(
        (gap) => gap.trusted030BridgeCandidateCount === 2
      )!;
      const unbridged = glass.gaps.find(
        (gap) => gap.trusted030BridgeCandidateCount === 0
      )!;
      expect(bridged.b.id).toBe(expectedGlass[side].bridgedTarget);
      expect(unbridged.b.id).toBe(expectedGlass[side].unbridgedTarget);
      expect(bridged.humanContact0345BridgeCandidateCount).toBe(2);
      expect(unbridged.humanContact0345BridgeCandidateCount).toBe(0);
      expect(
        bridged.trusted030BridgeCandidates.every(
          (candidate) =>
            candidate.walkQualifiedFaceCount === 0 &&
            candidate.overlayFaceCount > 0 &&
            materialLeaf(candidate.sourceMaterial) === 'FloorLine00'
        )
      ).toBe(true);
      expect(unbridged.trusted030BridgeCandidates).toEqual([]);
    }

    const allStrictCandidates = [
      ...Object.values(audit.grate).flatMap(
        (gap) => gap.trusted030BridgeCandidates
      ),
      ...Object.values(audit.glass).flatMap((side) =>
        side.gaps.flatMap((gap) => gap.trusted030BridgeCandidates)
      )
    ];
    expect(
      allStrictCandidates.filter(
        (candidate) => candidate.walkQualifiedFaceCount > 0
      )
    ).toEqual([]);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  });
});
