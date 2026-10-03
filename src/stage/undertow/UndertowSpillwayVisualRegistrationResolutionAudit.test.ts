import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_VISUAL_REGISTRATION_RESOLUTION_AUDIT,
  undertowVisualRegistrationResolutionAuditErrors
} from './UndertowSpillwayVisualRegistrationResolutionAudit';

describe('T21 Undertow current-layout visual registration resolution pass', () => {
  it('resolves the Sunfish light-blue semantic without inventing a visual Y', () => {
    expect(undertowVisualRegistrationResolutionAuditErrors()).toEqual([]);
    expect(UNDERTOW_VISUAL_REGISTRATION_RESOLUTION_AUDIT.sunfishAuthorLegend)
      .toMatchObject({
        postVer720: true,
        lightBlueLegendMeaningJapanese: '水没してしまうところ',
        lightBlueMeaning: 'SUBMERGE_AREA',
        undertowPublishesWithWaterNotationVariant: true,
        undertowPublishesWithoutWaterNotationVariant: true,
        waterSemanticAuthorConfirmed: true,
        numericWaterVisualYProvided: false
      });
  });

  it('treats public Abyss taxonomy as compatible with the author submerge annotation', () => {
    expect(UNDERTOW_VISUAL_REGISTRATION_RESOLUTION_AUDIT.hazardRegistration)
      .toMatchObject({
        teamASourceClass: 'WATER_CYAN',
        teamBSourceClass: 'WATER_CYAN',
        exactXzHazardPolygonsRemainAuthoritative: true,
        gameplaySubmergeSemanticResolved: true,
        publicAbyssTaxonomyIsCompatibleClassification: true,
        renderedSurfaceOrEffectKindResolved: false,
        renderedVisualYResolved: false,
        killThresholdResolved: false
      });
  });

  it('promotes only family-level current glass platform semantics', () => {
    expect(UNDERTOW_VISUAL_REGISTRATION_RESOLUTION_AUDIT.currentGlassPlatformFamily)
      .toMatchObject({
        sourceXzFamilyAlreadyRegistered: true,
        currentLayoutGuideCallsStructureUninkableGlass: true,
        currentLayoutGuideCallsStructureTransparentPlatform: true,
        currentLayoutGuideConfirmsPassThroughSpaceBelow: true,
        platformFamilyStandabilitySemanticsResolved: true,
        exactWalkableFaceSubsetResolved: false,
        exactPlayerCollisionFaceSubsetResolved: false,
        exactProjectileCollisionFaceSubsetResolved: false,
        exactCameraQueryFaceSubsetResolved: false,
        navigationPromotionAuthorized: false
      });
  });

  it('keeps the exact Glass01 shell split into multiple upward components', () => {
    expect(UNDERTOW_VISUAL_REGISTRATION_RESOLUTION_AUDIT.glassMeshTopology)
      .toMatchObject({
        positiveUpwardComponentCount: 4,
        negativeUpwardComponentCount: 4,
        wholeGlassShellIsSingleWalkableSurface: false
      });
    expect(
      UNDERTOW_VISUAL_REGISTRATION_RESOLUTION_AUDIT.glassMeshTopology
        .positiveUpwardComponents[0]?.areaSquareMeters
    ).toBeGreaterThan(30);
  });
});
