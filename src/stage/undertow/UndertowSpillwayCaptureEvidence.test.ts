import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_USER_CAPTURE_EVIDENCE,
  undertowCaptureEvidence
} from './UndertowSpillwayCaptureEvidence';

describe('T21 user capture evidence', () => {
  it('binds the two 2026-09-25 captures to the requested regions', () => {
    expect(UNDERTOW_USER_CAPTURE_EVIDENCE).toHaveLength(2);
    expect(undertowCaptureEvidence('user-underpass-capture-2026-09-25').region)
      .toBe('GLASS_UNDERPASS');
    expect(undertowCaptureEvidence('user-right-low-capture-2026-09-25').region)
      .toBe('RIGHT_LOW');
  });

  it('confirms the same-height right-low -> underpass walking connection', () => {
    const rightLow = undertowCaptureEvidence('user-right-low-capture-2026-09-25');
    const underpass = undertowCaptureEvidence('user-underpass-capture-2026-09-25');
    expect(rightLow.facts.join(' ')).toContain('same walking elevation');
    expect(underpass.facts.join(' ')).toContain('without a visible step or drop');
  });

  it('does not claim an exact underpass polygon from perspective video alone', () => {
    const underpass = undertowCaptureEvidence('user-underpass-capture-2026-09-25');
    expect(underpass.facts.join(' ')).toContain('support/wall geometry');
    expect(underpass.facts.join(' ')).not.toContain('exact polygon');
  });
});
