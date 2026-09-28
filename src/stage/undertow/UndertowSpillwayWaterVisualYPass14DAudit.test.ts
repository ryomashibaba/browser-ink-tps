import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_WATER_VISUAL_Y_PASS14D_AUDIT,
  undertowWaterVisualYPass14DAuditErrors
} from './UndertowSpillwayWaterVisualYPass14DAudit';

describe('T21 Pass 14D visual-water Y source exhaustion', () => {
  it('rejects background/fence coincidences as visual-water authority', () => {
    const a = UNDERTOW_WATER_VISUAL_Y_PASS14D_AUDIT;
    expect(a.ciSourceScan.fullCoverageBackgroundCandidateProjectY).toBe(-45);
    expect(a.ciSourceScan.fullCoverageBackgroundCandidateRejectedAsVisualWater).toBe(true);
    expect(a.ciSourceScan.floorFenceCandidateProjectYRange).toEqual([5.8, 5.9]);
    expect(a.ciSourceScan.floorFenceCandidateRejectedAsVisualWaterAuthority).toBe(true);
  });

  it('keeps exact water Y unresolved after the multi-level boundary scan', () => {
    const a = UNDERTOW_WATER_VISUAL_Y_PASS14D_AUDIT;
    expect(a.ciBoundaryLedgeScan.teamACandidateLevelCount).toBe(72);
    expect(a.ciBoundaryLedgeScan.teamBCandidateLevelCount).toBe(71);
    expect(a.ciBoundaryLedgeScan.multipleSharedSourceYLevelsRemain).toBe(true);
    expect(a.exactVisualWaterYResolved).toBe(false);
    expect(a.exactVisualWaterYMeters).toBeNull();
    expect(a.nextEvidence).toBe('WATER_VISUAL_Y_SIDE_PROFILE');
  });

  it('passes the Pass 14D authority-boundary audit', () => {
    expect(undertowWaterVisualYPass14DAuditErrors()).toEqual([]);
  });
});
