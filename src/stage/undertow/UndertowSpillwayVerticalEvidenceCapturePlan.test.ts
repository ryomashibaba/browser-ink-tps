import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_VERTICAL_CAPTURE_REQUESTS,
  undertowRequestReadyVerticalCaptureIds
} from './UndertowSpillwayVerticalEvidenceCapturePlan';

describe('T21-C Undertow vertical evidence capture plan', () => {
  it('requests only the first-drop magnitude comparison at this checkpoint', () => {
    expect(undertowRequestReadyVerticalCaptureIds()).toEqual([
      'FIRST_DROP_MAGNITUDE_SIDE_PROFILE'
    ]);
  });

  it('uses the adjacent known 1.5m right-small drop as the comparison reference', () => {
    const request = UNDERTOW_VERTICAL_CAPTURE_REQUESTS[0];
    expect(request.purpose).toContain('1.5m');
    expect(request.purpose).toContain('3.0m');
    expect(request.symmetricCounterpartAllowed).toBe(true);
  });

  it('requires one side-profile view of all three terrace levels without re-requesting old captures', () => {
    const request = UNDERTOW_VERTICAL_CAPTURE_REQUESTS[0];
    expect(request.mapGuideRequired).toBe(true);
    expect(request.acceptance.join(' ')).toContain('upper spawn floor');
    expect(request.acceptance.join(' ')).toContain('middle first-drop landing');
    expect(request.acceptance.join(' ')).toContain('lower right-low floor');
    expect(request.avoid.join(' ')).toContain('already received right-low perimeter');
    expect(request.avoid.join(' ')).toContain('underpass');
  });
});
