import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_WATER_VISUAL_Y_PASS14D_AUDIT,
  undertowWaterVisualYPass14DAuditErrors
} from './UndertowSpillwayWaterVisualYPass14DAudit';

describe('T21 Pass 14D visual-water Y source exhaustion', () => {
  it('retains source-scan history without selecting a visual-water Y', () => {
    const a = UNDERTOW_WATER_VISUAL_Y_PASS14D_AUDIT;
    expect(a.ciSourceScan.fullCoverageBackgroundCandidateProjectY).toBe(-45);
    expect(a.ciSourceScan.fullCoverageBackgroundCandidateRejectedAsVisualWater).toBe(true);
    expect(a.ciSourceScan.floorFenceCandidateProjectYRange).toEqual([5.8, 5.9]);
    expect(a.ciSourceScan.floorFenceCandidateRejectedAsVisualWaterAuthority).toBe(true);
    expect(a.exactVisualWaterYResolved).toBe(false);
    expect(a.exactVisualWaterYMeters).toBeNull();
  });

  it('supersedes the capture request after IMG_6141 shows the marked target is dry', () => {
    const a = UNDERTOW_WATER_VISUAL_Y_PASS14D_AUDIT;
    expect(a.status).toBe('SUPERSEDED_BY_14E');
    expect(a.existingReceivedCaptures.premiseCorrectionStill).toBe('IMG_6141.jpeg');
    expect(a.existingReceivedCaptures.formerMarkedTargetObservedDry).toBe(true);
    expect(a.premiseInvalidatedByCurrentGameplay).toBe(true);
    expect(a.formerNextEvidence).toBe('WATER_VISUAL_Y_SIDE_PROFILE');
    expect(a.nextEvidence).toBeNull();
    expect(a.requestReady).toBe(false);
    expect(a.supersededBy).toBe('14E');
  });

  it('passes the superseded Pass 14D authority-boundary audit', () => {
    expect(undertowWaterVisualYPass14DAuditErrors()).toEqual([]);
  });
});
