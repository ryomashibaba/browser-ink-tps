import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT,
  undertowInternalWaterSemanticCorrectionAuditErrors
} from './UndertowSpillwayInternalWaterSemanticCorrectionAudit';

describe('T21 Pass 14E internal-water semantic correction', () => {
  it('treats IMG_6141 as direct evidence that the former Pass 14D target is dry', () => {
    const a = UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT;
    expect(a.directGameplayEvidence).toMatchObject({
      filename: 'IMG_6141.jpeg',
      markedPass14DTargetObservedDry: true,
      visibleInternalWaterlineAtObservedTarget: false,
      userReportsNoWaterAtRequestedLocation: true
    });
  });

  it('retains cyan plan geometry while revoking WATER/KILL gameplay authority', () => {
    const a = UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT;
    expect(a.sourceProvenanceBoundary.exactCyanPolygonGeometryStillUsableAsSourceGeometry)
      .toBe(true);
    expect(a.sourceProvenanceBoundary.cyanAnnotationGameplayWaterAuthorityAuthorized)
      .toBe(false);
    expect(a.currentSemantics.cyanSourceRegionGameplaySemanticsResolved).toBe(false);
  });

  it('retires the false water blockers and replaces them without activating T21', () => {
    const a = UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT;
    expect(a.blockerTransition.retired).toEqual([
      'WATER_VISUAL_Y_PENDING',
      'WATER_KILL_THRESHOLD_PENDING'
    ]);
    expect(a.blockerTransition.added).toEqual([
      'CYAN_SOURCE_REGION_GAMEPLAY_SEMANTICS_PENDING',
      'EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING'
    ]);
    expect(a.userActionRequiredNow).toBe(false);
    expect(a.runtimePromotionAuthorized).toBe(false);
  });

  it('does not promote the broader water-only-outside hypothesis from one still', () => {
    expect(
      UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT
        .currentSemantics.waterOnlyOutsideStageHypothesisPromoted
    ).toBe(false);
  });

  it('passes the correction consistency gate', () => {
    expect(undertowInternalWaterSemanticCorrectionAuditErrors()).toEqual([]);
  });
});
