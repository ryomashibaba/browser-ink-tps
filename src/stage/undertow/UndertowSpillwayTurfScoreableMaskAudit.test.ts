import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_TURF_SCOREABLE_MASK_AUDIT,
  undertowTurfScoreableMaskAuditErrors
} from './UndertowSpillwayTurfScoreableMaskAudit';

describe('T21-D Undertow Turf scoreable-mask audit', () => {
  it('keeps scoreability unresolved and authorizes no Scoreable promotion', () => {
    expect(undertowTurfScoreableMaskAuditErrors()).toEqual([]);
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT).toMatchObject({
      currentConfirmedPaintableRuntimeSolidCount: 11,
      currentUnknownPaintRuntimeSolidCount: 6,
      currentScoreablePromotionsAuthorized: 0,
      scoreMaskResolved: false,
      paintAuthorityUpstreamComplete: false,
      candidateStatus: 'PAINTABLE_BUT_SCORE_AUTHORITY_PENDING',
      confidence: 'HIGH'
    });
  });

  it('records the current engine representation boundary', () => {
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.engineRepresentation)
      .toMatchObject({
        stagePaintSurfaceHasWholeSurfaceFlags: true,
        scoreableIsBaseSurfaceFlag: true,
        activeFootprintMasksInactiveCells: true,
        scoreWeightGridUsesActiveFootprintAndEdgeFractionsOnly: true,
        independentPerCellScoreMaskFieldPresent: false,
        currentSchemaCanRepresentOnlyWholeActivePaintSurfaceScoreability: true
      });
  });

  it('does not convert generic Turf rules or vector colors into stage score authority', () => {
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.genericTurfRuleEvidence)
      .toMatchObject({
        splatoon3GroundCoverageRuleConfirmed: true,
        verticalSurfacesDoNotCountRuleCorroborated: true,
        authorityScope: 'RULE_LEVEL_ONLY',
        canPromoteTemple01FacesByItself: false
      });
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.vectorSourceEvidence)
      .toMatchObject({
        hasExplicitScoreableClass: false,
        whiteSourceFaceMeansScoreable: false,
        paintableMeansScoreableByDefinition: false
      });
  });

  it('keeps all eleven currently paintable runtime solids as candidates only', () => {
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.candidateRuntimeSolidIds)
      .toHaveLength(11);
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.missingAuthoritativeEvidence)
      .toHaveLength(3);
  });
});
