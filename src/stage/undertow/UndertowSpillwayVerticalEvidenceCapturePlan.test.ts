import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_VERTICAL_CAPTURE_REQUESTS,
  undertowRequestReadyVerticalCaptureIds
} from './UndertowSpillwayVerticalEvidenceCapturePlan';

describe('T21-C Undertow vertical evidence capture plan', () => {
  it('has no request-ready first-drop capture after Temple01 resolves the magnitude', () => {
    expect(undertowRequestReadyVerticalCaptureIds()).toEqual([]);
  });

  it('retains the old side-profile request only as a superseded audit record', () => {
    const request = UNDERTOW_VERTICAL_CAPTURE_REQUESTS[0]!;
    expect(request.status).toBe('SUPERSEDED_BY_TEMPLE01_GEOMETRY');
    expect(request.invalidatedBecause).toContain('10.5/6.0m');
    expect(request.invalidatedBecause).toContain('10.5/7.5m');
    expect(request.invalidatedBecause).toContain('No replacement user capture is needed');
  });
});
