import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT,
  undertowStageSourceIdentityAuditErrors
} from './UndertowSpillwayStageSourceIdentityAudit';

describe('T21 remodeled Undertow stage source identity', () => {
  it('binds current remodeled Undertow to Vss_Temple01 across game-data snapshots', () => {
    const a = UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT;
    expect(a.canonicalCurrentStageRowId).toBe('Vss_Temple01');
    expect(a.canonicalCurrentModelResource).toBe('Model/Fld_Temple01.bfres');
    expect(a.canonicalCurrentJapaneseLabel).toBe('マテガイ放水路（改修後）');
    expect(a.leannyEvidence.verifiedSnapshots).toEqual(['720', '920', '1130']);
    expect(a.leannyEvidence.temple01IdentityStableAcrossSnapshots).toBe(true);
  });

  it('rejects the conflicting KiTrix human-name map as source identity authority', () => {
    const a = UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT;
    expect(a.nonUndertowComparison).toEqual({
      rowId: 'Vss_Nagasaki03',
      modelResource: 'Model/Fld_Nagasaki03.bfres',
      japaneseLabel: 'チョウザメ造船'
    });
    expect(a.kitrixHumanNameMapConflict.stageLoaderMapsUndertowToNagasaki03).toBe(true);
    expect(a.kitrixHumanNameMapConflict.trustedForStageSourceIdentity).toBe(false);
    expect(a.conclusion.previousTemple01GeometryWorkRequiresRollback).toBe(false);
  });

  it('pins valid exact upstream commit SHA identities for future CI', () => {
    const a = UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT;
    expect(a.leannyEvidence.sourceCommit).toMatch(/^[a-f0-9]{40}$/);
    expect(a.kitrixHumanNameMapConflict.sourceCommit).toMatch(/^[a-f0-9]{40}$/);
    expect(a.kitrixHumanNameMapConflict.sourceCommit).toBe('0611f51b35c9736ee986fb2218461e2585b7875e');
  });

  it('passes the source identity audit', () => {
    expect(undertowStageSourceIdentityAuditErrors()).toEqual([]);
  });
});
