import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_GUIDE_LINE_SIDE_OBSERVATIONS,
  UNDERTOW_LINE_SEMANTIC_BINDING_AUDIT,
  UNDERTOW_SIDE_REGISTRATION_FINDINGS,
  undertowLineSemanticAuditErrors
} from './UndertowSpillwayLineSideSemanticAudit';

describe('T21-C Undertow line-side semantic audit', () => {
  it('keeps measured vector-line identities while clearing canonical floor-side bindings', () => {
    expect(undertowLineSemanticAuditErrors()).toEqual([]);

    expect(
      UNDERTOW_LINE_SEMANTIC_BINDING_AUDIT.map((binding) => ({
        id: binding.lineId,
        trace: binding.vectorTraceId,
        lower: binding.lowerSideCanonicalFloorId,
        upper: binding.upperSideCanonicalFloorId,
        status: binding.sideBindingStatus
      }))
    ).toEqual([
      {
        id: 'TEAM_A_FIRST_DROP_RED',
        trace: 'team-a-first-drop-lip',
        lower: null,
        upper: null,
        status: 'UNRESOLVED_AFTER_2026_09_26_CORRECTION'
      },
      {
        id: 'TEAM_A_RIGHT_SMALL_DROP_BLUE',
        trace: 'team-a-right-small-drop-lip',
        lower: null,
        upper: null,
        status: 'UNRESOLVED_AFTER_2026_09_26_CORRECTION'
      }
    ]);
  });

  it('records the user-observed red-vs-blue ordering without turning it into a floor Y edge', () => {
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

  it('keeps every existing-media finding below canonical floor-side binding strength', () => {
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
