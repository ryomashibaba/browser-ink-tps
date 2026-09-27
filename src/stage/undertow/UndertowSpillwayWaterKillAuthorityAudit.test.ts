import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_WATER_KILL_AUTHORITY_AUDIT,
  undertowWaterKillAuthorityAuditErrors
} from './UndertowSpillwayWaterKillAuthorityAudit';

describe('T21-D water kill authority audit', () => {
  it('keeps the completed XZ hazard classification separate from vertical kill authority', () => {
    expect(undertowWaterKillAuthorityAuditErrors()).toEqual([]);
    expect(UNDERTOW_WATER_KILL_AUTHORITY_AUDIT).toMatchObject({
      resolutionPass: '11B',
      mappedWaterHazardXzResolved: true,
      internalVoidClassificationResolved: true,
      exteriorPlayableHardSilhouetteResolved: true,
      killThresholdResolved: false,
      killThresholdMeters: null,
      killVolumePlacementResolved: false,
      visualWaterYCanDefineKillThreshold: false,
      currentGameplayWaterSurfaceContactRelationResolved: true,
      visibleWaterContactCausesEssentiallyImmediateDeath: true,
      largePerceptibleVisualToKillVerticalGapRuledOut: true,
      exactVisualToKillMetricOffsetResolved: false,
      exactVisualToKillMetricOffsetMeters: null,
      waterContactRelationUserDirectGameplayKnowledgeAccepted: true,
      mappedWaterPairQualitativeDeathBehaviorRelationResolved: true,
      mappedWaterPairSameEssentiallyImmediateDeathBehavior: true,
      exactMappedWaterPairKillThresholdEqualityResolved: false,
      exactMappedWaterPairKillThresholdDeltaMeters: null,
      mappedWaterPairDeathRelationUserDirectGameplayKnowledgeAccepted: true,
      waterAndExteriorFallOutQualitativeDeathHeightRelationResolved: true,
      waterAndExteriorFallOutAppearSameApproxDeathHeightBand: true,
      exactWaterVsExteriorFallOutThresholdDeltaResolved: false,
      exactWaterVsExteriorFallOutThresholdDeltaMeters: null,
      waterAndExteriorFallOutRelationUserDirectGameplayKnowledgeAccepted: true,
      confidence: 'HIGH'
    });
  });

  it('records immediate visible-water death without promoting an exact metric threshold', () => {
    const audit = UNDERTOW_WATER_KILL_AUTHORITY_AUDIT;
    expect(audit.currentGameplayWaterSurfaceContactRelationResolved).toBe(true);
    expect(audit.visibleWaterContactCausesEssentiallyImmediateDeath).toBe(true);
    expect(audit.largePerceptibleVisualToKillVerticalGapRuledOut).toBe(true);
    expect(audit.exactVisualToKillMetricOffsetResolved).toBe(false);
    expect(audit.exactVisualToKillMetricOffsetMeters).toBeNull();
    expect(audit.killThresholdResolved).toBe(false);
    expect(audit.killThresholdMeters).toBeNull();
  });

  it('records the two mapped water hazards as qualitatively equivalent without exact threshold promotion', () => {
    const audit = UNDERTOW_WATER_KILL_AUTHORITY_AUDIT;
    expect(audit.mappedWaterPairQualitativeDeathBehaviorRelationResolved).toBe(true);
    expect(audit.mappedWaterPairSameEssentiallyImmediateDeathBehavior).toBe(true);
    expect(audit.exactMappedWaterPairKillThresholdEqualityResolved).toBe(false);
    expect(audit.exactMappedWaterPairKillThresholdDeltaMeters).toBeNull();
    expect(audit.waterAndExteriorFallOutShareThresholdResolved).toBe(false);
  });

  it('records exterior fall-out as the same approximate death-height band without exact threshold equality', () => {
    const audit = UNDERTOW_WATER_KILL_AUTHORITY_AUDIT;
    expect(audit.waterAndExteriorFallOutQualitativeDeathHeightRelationResolved).toBe(true);
    expect(audit.waterAndExteriorFallOutAppearSameApproxDeathHeightBand).toBe(true);
    expect(audit.exactWaterVsExteriorFallOutThresholdDeltaResolved).toBe(false);
    expect(audit.exactWaterVsExteriorFallOutThresholdDeltaMeters).toBeNull();
    expect(audit.waterAndExteriorFallOutShareThresholdResolved).toBe(false);
  });

  it('records Mpt_PlayerDead only as a generic death-locator mechanism candidate', () => {
    expect(UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.genericDeathLocatorEvidence)
      .toMatchObject({
        locatorRowId: 'Mpt_PlayerDead',
        shapeType: 'Cube',
        targetMaskType: 'ControlledPlayer',
        locatorScale: 1,
        verifiedDataSnapshots: ['720', '800', '920', '1130'],
        definitionStableAcrossVerifiedSnapshots: true,
        stagePlacementResolved: false,
        temple01UsageResolved: false
      });
    expect(UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.comparisonLocatorEvidence)
      .toMatchObject({
        locatorRowId: 'Lft_KeepOutPlayer',
        shapeType: 'Cube',
        targetMaskType: 'ControlledPlayer',
        locatorScale: 1
      });
  });

  it('requires Temple01 placement or registered in-game trigger evidence before promotion', () => {
    expect(
      UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.publicActorSchemaEvidence
        .mptPlayerDeadClassPresent
    ).toBe(true);
    expect(
      UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.sceneMetadataPlacementEvidence
    ).toMatchObject({
      verifiedSnapshots: ['720', '800', '920', '1130'],
      sceneInfoPreloadResourcesStable: true,
      sceneInfoPreloadResources: ['Model/Fld_Temple01.bfres'],
      versusSceneInfoContainsDeathLocatorPlacement: false,
      versusSceneInfoContainsNormalModeBcettBody: false,
      leagueTypeInfoOnlyReferencesTowerControlModifier: true,
      normalModeMptPlayerDeadPlacementRecovered: false
    });
    expect(
      UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.publicActorSchemaEvidence
        .placementTransformFields
    ).toEqual(['Translate', 'Rotate', 'Scale']);
    expect(
      UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.publicActorSchemaEvidence
        .exposesTemple01Placement
    ).toBe(false);
    expect(
      UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.publicActorSchemaEvidence
        .exposesKillThresholdParameter
    ).toBe(false);
    expect(
      UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.publicActorSchemaEvidence
        .referencedTemple01RuleBinLayerScope
    ).toBe('TOWER_CONTROL_MODIFIER_REFERENCE_ONLY');
    expect(
      UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.publicActorSchemaEvidence
        .referencedTemple01RuleBinLayerContentsPublished
    ).toBe(false);
    expect(
      UNDERTOW_WATER_KILL_AUTHORITY_AUDIT
        .publicTemple01DeathPlacementRecoverySucceeded
    ).toBe(false);
    expect(
      UNDERTOW_WATER_KILL_AUTHORITY_AUDIT
        .waterAndExteriorFallOutShareThresholdResolved
    ).toBe(false);
    expect(
      UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.missingAuthoritativeEvidence.length
    ).toBeGreaterThanOrEqual(2);
  });
});
