import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_PLAYER_SUPPORT_RESOLUTION_AUDIT,
  undertowUpperGlassPlayerSupportResolutionAuditErrors
} from './UndertowSpillwayUpperGlassPlayerSupportResolutionAudit';

describe('T21 Resolution Pass 13A player-support capture resolution', () => {
  it('accepts the two mirrored continuous support clips', () => {
    const audit = UNDERTOW_UPPER_GLASS_PLAYER_SUPPORT_RESOLUTION_AUDIT;
    expect(audit.evidence.filenames).toHaveLength(2);
    expect(audit.evidence.durationsSeconds).toEqual([29.4, 17.233333]);
    expect(audit.evidence.independentlyCapturedMirroredSides).toBe(2);
    expect(audit.evidence.broadComponentsPerSideTested).toBe(3);
    expect(audit.evidence.seamCrossingsPerSideTested).toBe(2);
    expect(audit.evidence.noJumpAssistedSeamCrossingObserved).toBe(true);
    expect(audit.evidence.thinEdgeStripTested).toBe(false);
  });

  it('resolves broad support/walkability only, without runtime promotion', () => {
    const audit = UNDERTOW_UPPER_GLASS_PLAYER_SUPPORT_RESOLUTION_AUDIT;
    expect(audit.resolved.broadPlayerSupportGeometry).toBe(true);
    expect(audit.resolved.broadNavigationWalkabilityEvidence).toBe(true);
    expect(audit.unresolved.thinEdgeStripPlayerSupport).toBe(true);
    expect(audit.unresolved.exactOriginalCollisionPrimitiveIdentity).toBe(true);
    expect(audit.unresolved.ordinaryProjectileBinding).toBe(true);
    expect(audit.unresolved.cameraQueryBinding).toBe(true);
    expect(audit.runtimePromotion.playerCollisionAuthorized).toBe(false);
    expect(audit.runtimePromotion.navigationAuthorized).toBe(false);
    expect(audit.activationBlockersCleared).toEqual([]);
  });

  it('advances only to the ordinary-projectile capture', () => {
    expect(UNDERTOW_UPPER_GLASS_PLAYER_SUPPORT_RESOLUTION_AUDIT.nextRequestReady)
      .toBe('PROJECTILE_GLASS_EDGE_DIFFERENTIAL');
    expect(undertowUpperGlassPlayerSupportResolutionAuditErrors()).toEqual([]);
  });
});
