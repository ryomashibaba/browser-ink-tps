import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_VERTICAL_CAPTURE_REQUESTS,
  undertowRequestReadyVerticalCaptureIds
} from './UndertowSpillwayVerticalEvidenceCapturePlan';

describe('T21-C Undertow vertical evidence capture plan', () => {
  it('has no request-ready vertical capture after the 2026-09-26 correction', () => {
    expect(undertowRequestReadyVerticalCaptureIds()).toEqual([]);
  });

  it('retains the superseded side-profile request only as an invalidated audit record', () => {
    const request = UNDERTOW_VERTICAL_CAPTURE_REQUESTS[0]!;
    expect(request.status).toBe('INVALIDATED_BY_HEIGHT_ORDER_CORRECTION');
    expect(request.invalidatedBecause).toContain(
      'red-guide-side versus blue-guide-side height ordering'
    );
    expect(request.invalidatedBecause).toContain(
      'cannot be used as a direct first-drop magnitude reference'
    );
  });
});
