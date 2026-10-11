import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_PLAYER_SOLIDITY_RESOLUTION_AUDIT,
  undertowUpperGlassPlayerSolidityResolutionAuditErrors
} from './UndertowSpillwayUpperGlassPlayerSolidityResolutionAudit';

describe('T21 Resolution Pass 13F player glass solidity knowledge', () => {
  it('states the purpose and accepts underside/side blocking knowledge', () => {
    const audit = UNDERTOW_UPPER_GLASS_PLAYER_SOLIDITY_RESOLUTION_AUDIT;
    expect(audit.purpose).toContain('underside and side/edge');
    expect(audit.evidence.undersideBlocksUpwardJump).toBe(true);
    expect(audit.evidence.sideEdgeBlocksLateralMovement).toBe(true);
    expect(audit.evidence.broadSolidFromAboveBelowAndSide).toBe(true);
    expect(audit.evidence.directGameplayKnowledgeAccepted).toBe(true);
    expect(audit.evidence.redundantCaptureRequired).toBe(false);
  });

  it('resolves broad player collision behavior but not primitive identity', () => {
    const audit = UNDERTOW_UPPER_GLASS_PLAYER_SOLIDITY_RESOLUTION_AUDIT;
    expect(audit.resolved.broadPlayerCollisionBehavior).toBe(true);
    expect(audit.unresolved.exactOriginalCollisionPrimitive).toBe(true);
    expect(audit.unresolved.oneForOneDecorativeThinFaceBinding).toBe(true);
    expect(audit.runtimePromotion.authorized).toBe(false);
    expect(audit.activationBlockersCleared).toEqual([]);
  });

  it('passes the Pass 13F authority-boundary audit', () => {
    expect(undertowUpperGlassPlayerSolidityResolutionAuditErrors()).toEqual([]);
  });
});
