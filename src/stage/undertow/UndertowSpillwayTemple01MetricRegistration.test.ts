import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_TEMPLE01_DROP_RELATIONS,
  UNDERTOW_TEMPLE01_METRIC_REGISTRATION,
  undertowTemple01MetricAuditErrors,
  undertowTemple01MetricFeature
} from './UndertowSpillwayTemple01MetricRegistration';

describe('T21-C Temple01 registered metric geometry', () => {
  it('anchors the model Y datum to the existing canonical center-low Y=0', () => {
    expect(undertowTemple01MetricAuditErrors()).toEqual([]);
    expect(UNDERTOW_TEMPLE01_METRIC_REGISTRATION.modelCenterLowY).toBe(4.5);
    expect(UNDERTOW_TEMPLE01_METRIC_REGISTRATION.canonicalYOffset).toBe(-4.5);
  });

  it('resolves the spawn-side floor levels from the remodel mesh at HIGH confidence', () => {
    expect(undertowTemple01MetricFeature('TEAM_A_SPAWN').canonicalY).toBe(6);
    expect(undertowTemple01MetricFeature('TEAM_B_SPAWN').canonicalY).toBe(6);
    expect(undertowTemple01MetricFeature('TEAM_A_FIRST_DROP_LANDING').canonicalY).toBe(1.5);
    expect(undertowTemple01MetricFeature('TEAM_B_FIRST_DROP_LANDING').canonicalY).toBe(1.5);
    expect(undertowTemple01MetricFeature('RIGHT_LOW').canonicalY).toBe(3);
    expect(undertowTemple01MetricFeature('RIGHT_SMALL_DROP_UPPER').canonicalY).toBe(6);
  });

  it('supersedes the old first-drop and right-small-drop magnitude hypotheses', () => {
    expect(UNDERTOW_TEMPLE01_DROP_RELATIONS).toEqual({
      firstDropMeters: -4.5,
      rightSmallDropMeters: -3,
      firstDropLandingToRightLowMeters: 1.5,
      spawnToRightSmallDropUpperMeters: 0
    });
  });

  it('requires strong local lip-to-discontinuity agreement despite the looser global outer fit', () => {
    expect(
      UNDERTOW_TEMPLE01_METRIC_REGISTRATION.localDropRegistration
        .maxNearestExpectedDiscontinuityMeters
    ).toBeLessThanOrEqual(0.163);
    expect(
      UNDERTOW_TEMPLE01_METRIC_REGISTRATION.pdfToModelXZ.outerP95Meters
    ).toBeGreaterThan(1);
  });
});
