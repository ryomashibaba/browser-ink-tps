import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_USER_CAPTURE_EVIDENCE,
  undertowCaptureEvidence
} from './UndertowSpillwayCaptureEvidence';

describe('T21 user capture evidence', () => {
  it('binds the two 2026-09-25 traversal captures and the 2026-09-26 corrective still pair', () => {
    expect(UNDERTOW_USER_CAPTURE_EVIDENCE).toHaveLength(3);
    expect(undertowCaptureEvidence('user-underpass-capture-2026-09-25').region)
      .toBe('GLASS_UNDERPASS');
    expect(undertowCaptureEvidence('user-right-low-capture-2026-09-25').region)
      .toBe('RIGHT_LOW');
    expect(undertowCaptureEvidence('user-first-drop-height-stills-2026-09-26').region)
      .toBe('GUIDE_LINE_SIDE_HEIGHT_ORDER');
  });

  it('confirms traversal continuity without promoting a metric Y equality', () => {
    const rightLow = undertowCaptureEvidence('user-right-low-capture-2026-09-25');
    const underpass = undertowCaptureEvidence('user-underpass-capture-2026-09-25');
    expect(rightLow.facts.join(' ')).toContain('connects into the covered underpass');
    expect(rightLow.facts.join(' ')).toContain('not equal canonical floor Y');
    expect(underpass.facts.join(' ')).toContain('does not establish an exact canonical floor-to-floor Y delta');
  });

  it('uses the new stills only for qualitative ordering, not a metric delta', () => {
    const stills = undertowCaptureEvidence('user-first-drop-height-stills-2026-09-26');
    expect(stills.filenames).toEqual(['IMG_6112.jpeg', 'IMG_6111.jpeg']);
    expect(stills.facts.join(' ')).toContain('below the red guide line');
    expect(stills.facts.join(' ')).toContain('does not establish canonical floor identities or an exact metric delta');
  });

  it('does not claim an exact underpass polygon from perspective video alone', () => {
    const underpass = undertowCaptureEvidence('user-underpass-capture-2026-09-25');
    expect(underpass.facts.join(' ')).toContain('support/wall geometry');
    expect(underpass.facts.join(' ')).not.toContain('exact polygon');
  });
});
