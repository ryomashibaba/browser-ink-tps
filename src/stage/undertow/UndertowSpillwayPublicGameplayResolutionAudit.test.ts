import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT,
  undertowPublicGameplayResolutionAuditErrors
} from './UndertowSpillwayPublicGameplayResolutionAudit';

describe('T21 Undertow public gameplay resolution pass', () => {
  it('strengthens public corroboration without clearing any blocker', () => {
    expect(undertowPublicGameplayResolutionAuditErrors()).toEqual([]);
    expect(UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT).toMatchObject({
      round: 2,
      scope: 'PUBLIC_GAMEPLAY_AND_DOCUMENTATION',
      runtimePromotionAuthorized: false,
      activationBlockersCleared: []
    });
  });

  it('records historical official glass-floor standing evidence with a strict current-layout scope limit', () => {
    expect(
      UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT.officialEvidence
        .nintendoVer200GlassFloorBugfix
    ).toMatchObject({
      authority: 'OFFICIAL',
      currentLayoutRelevant: false,
      provesUndertowHasPlayerStandableGlassFloorSemanticsHistorically: true,
      provesCurrentTemple01Glass01Identity: false,
      provesCurrentCollisionFaceSubset: false,
      provesProjectileQueryRules: false
    });
  });

  it('keeps the exact current Glass01 shell multi-level and non-authoritative for collision', () => {
    for (const side of [
      UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT.exactCurrentGlassMeshFollowup
        .positive,
      UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT.exactCurrentGlassMeshFollowup
        .negative
    ]) {
      expect(side).toMatchObject({
        triangleCount: 102,
        nearHorizontalCount: 24,
        upwardNearHorizontalCount: 12,
        downwardNearHorizontalCount: 12
      });
      expect(side.distinctNearHorizontalY.length).toBeGreaterThanOrEqual(5);
    }
    expect(
      UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT.exactCurrentGlassMeshFollowup
        .exactPlayerCollisionFaceSubsetResolved
    ).toBe(false);
    expect(
      UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT.exactCurrentGlassMeshFollowup
        .navigationPromotionAuthorized
    ).toBe(false);
  });

  it('separates author-confirmed submerge semantics from the public Abyss taxonomy', () => {
    expect(UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT.hazardSemanticFollowup)
      .toMatchObject({
        authorVectorSourceClassA: 'WATER_CYAN',
        authorVectorSourceClassB: 'WATER_CYAN',
        authorVectorSemanticSaysWaterCyan: true,
        authorLegendExplicitlyDefinesLightBlueAsSubmergeArea: true,
        publicCurrentStageTaxonomySaysAbyssOnly: true,
        taxonomyScopeMismatchResolved: true,
        gameplaySubmergeSemanticResolved: true,
        renderedHazardAppearanceResolved: false,
        visualPlanePromotionAuthorized: false,
        killThresholdPromotionAuthorized: false
      });
  });

  it('does not convert public tunnel corroboration into a navigation link', () => {
    expect(UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT.connectivityCorroboration)
      .toMatchObject({
        publicCurrentLayoutReportsTunnelBelowSnipeArea: true,
        existingCaptureAlreadyProvesUnderpassTraversalTopology: true,
        newOffMeshLinkAuthorized: false
      });
  });
});
