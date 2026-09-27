import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_USER_CAPTURE_EVIDENCE,
  undertowCaptureEvidence
} from './UndertowSpillwayCaptureEvidence';

describe('T21 user capture evidence', () => {
  it('binds the traversal, corrective-height, paint and upper-glass support captures', () => {
    expect(UNDERTOW_USER_CAPTURE_EVIDENCE).toHaveLength(7);
    expect(undertowCaptureEvidence('user-underpass-capture-2026-09-25').region)
      .toBe('GLASS_UNDERPASS');
    expect(undertowCaptureEvidence('user-right-low-capture-2026-09-25').region)
      .toBe('RIGHT_LOW');
    expect(undertowCaptureEvidence('user-first-drop-height-stills-2026-09-26').region)
      .toBe('GUIDE_LINE_SIDE_HEIGHT_ORDER');
    expect(
      undertowCaptureEvidence(
        'user-underpass-outside-zone-paint-stills-2026-09-27'
      ).region
    ).toBe('GLASS_UNDERPASS_PAINT_OUTSIDE_ZONES');
    expect(
      undertowCaptureEvidence(
        'user-upper-glass-support-route-videos-2026-09-27'
      ).region
    ).toBe('UPPER_GLASS_PLAYER_SUPPORT_ROUTE');
    expect(
      undertowCaptureEvidence(
        'user-upper-glass-ordinary-projectile-knowledge-2026-09-28'
      ).region
    ).toBe('UPPER_GLASS_ORDINARY_PROJECTILE_BLOCKING');
    expect(
      undertowCaptureEvidence(
        'user-upper-glass-camera-blocking-knowledge-2026-09-28'
      ).region
    ).toBe('UPPER_GLASS_CAMERA_BLOCKING');
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

  it('records both Pass 12B outside-Zone paint probes without promoting scoreability', () => {
    const paint = undertowCaptureEvidence(
      'user-underpass-outside-zone-paint-stills-2026-09-27'
    );
    expect(paint.filenames).toEqual([
      'IMG_6137.jpeg',
      'IMG_6136.jpeg',
      'IMG_6135.jpeg',
      'IMG_6134.jpeg'
    ]);
    expect(paint.facts.join(' ')).toContain('both independently registered outside-Zone probes');
    expect(paint.facts.join(' ')).toContain('authorized PAINTABLE');
    expect(paint.facts.join(' ')).toContain('does not authorize Turf Scoreable');
  });

  it('records both mirrored Pass 13A support routes without inferring projectile/camera authority', () => {
    const support = undertowCaptureEvidence(
      'user-upper-glass-support-route-videos-2026-09-27'
    );
    expect(support.filenames).toHaveLength(2);
    expect(support.durationsSeconds).toEqual([29.4, 17.233333]);
    expect(support.facts.join(' ')).toContain('three broad Glass01 upward-component probe regions');
    expect(support.facts.join(' ')).toContain('THIN_EDGE_STRIP');
    expect(support.facts.join(' ')).toContain('does not establish projectile blocking');
    expect(support.facts.join(' ')).toContain('coincident hidden primitive');
  });

  it('accepts direct user gameplay knowledge for ordinary projectile blocking without overextending it', () => {
    const projectile = undertowCaptureEvidence(
      'user-upper-glass-ordinary-projectile-knowledge-2026-09-28'
    );
    expect(projectile.facts.join(' ')).toContain('ordinary shots do not pass through Undertow glass at all');
    expect(projectile.facts.join(' ')).toContain('does not by itself resolve thrown subs');
    expect(projectile.facts.join(' ')).toContain('camera-query behavior');
  });

  it('accepts direct user gameplay knowledge for camera blocking without inventing primitive identity', () => {
    const camera = undertowCaptureEvidence(
      'user-upper-glass-camera-blocking-knowledge-2026-09-28'
    );
    expect(camera.facts.join(' ')).toContain('camera is pushed to the near side');
    expect(camera.facts.join(' ')).toContain('does not pass through the glass');
    expect(camera.facts.join(' ')).toContain('does not identify whether the original game uses visible Glass01 triangles');
  });

  it('does not claim an exact underpass polygon from perspective video alone', () => {
    const underpass = undertowCaptureEvidence('user-underpass-capture-2026-09-25');
    expect(underpass.facts.join(' ')).toContain('support/wall geometry');
    expect(underpass.facts.join(' ')).not.toContain('exact polygon');
  });
});
