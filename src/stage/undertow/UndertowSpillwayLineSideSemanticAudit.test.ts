import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_GUIDE_LINE_SIDE_OBSERVATIONS,
  UNDERTOW_LINE_SEMANTIC_BINDING_AUDIT,
  UNDERTOW_SIDE_REGISTRATION_FINDINGS,
  undertowLineSemanticAuditErrors
} from './UndertowSpillwayLineSideSemanticAudit';

describe('T21-C Undertow line-side semantic audit', () => {
  it('keeps the measured line identities and resolves their canonical floor sides only through Temple01 local registration', () => {
    expect(undertowLineSemanticAuditErrors()).toEqual([]);

    expect(
      UNDERTOW_LINE_SEMANTIC_BINDING_AUDIT.map((binding) => ({
        id: binding.lineId,
        trace: binding.vectorTraceId,
        lower: binding.lowerSideCanonicalFloorId,
        upper: binding.upperSideCanonicalFloorId,
        lowerY: binding.lowerSideProjectY,
        upperY: binding.upperSideProjectY,
        status: binding.sideBindingStatus
      }))
    ).toEqual([
      {
        id: 'TEAM_A_FIRST_DROP_RED',
        trace: 'team-a-first-drop-lip',
        lower: 'team-a-first-drop-landing',
        upper: 'team-a-spawn-floor',
        lowerY: 1.5,
        upperY: 6,
        status: 'RESOLVED_BY_TEMPLE01_LOCAL_REGISTRATION'
      },
      {
        id: 'TEAM_A_RIGHT_SMALL_DROP_BLUE',
        trace: 'team-a-right-small-drop-lip',
        lower: 'right-low-floor',
        upper: 'right-small-drop-upper',
        lowerY: 3,
        upperY: 6,
        status: 'RESOLVED_BY_TEMPLE01_LOCAL_REGISTRATION'
      }
    ]);
  });

  it('retains the user stills as qualitative ordering evidence rather than pretending they measured the exact deltas', () => {
    expect(UNDERTOW_GUIDE_LINE_SIDE_OBSERVATIONS).toEqual([
      expect.objectContaining({
        lowerGuideSideLineId: 'TEAM_A_FIRST_DROP_RED',
        higherGuideSideLineId: 'TEAM_A_RIGHT_SMALL_DROP_BLUE',
        semanticFloorBinding: 'UNRESOLVED',
        safeToCreateVerticalRelation: false
      })
    ]);
    expect(UNDERTOW_GUIDE_LINE_SIDE_OBSERVATIONS[0]!.exactDeltaMeters)
      .toBeUndefined();
  });

  it('keeps every pre-model media finding below canonical floor-side binding strength', () => {
    expect(
      UNDERTOW_SIDE_REGISTRATION_FINDINGS.map((finding) => finding.result)
    ).toEqual([
      'NO_SHARED_SIDE_REGISTRATION',
      'LOCAL_TOPOLOGY_ONLY',
      'GUIDE_SIDE_ORDER_ONLY',
      'SEMANTIC_CROSSCHECK_ONLY'
    ]);

    for (const finding of UNDERTOW_SIDE_REGISTRATION_FINDINGS) {
      expect(finding.canBindCanonicalFloorSides).toBe(false);
    }
  });
});
