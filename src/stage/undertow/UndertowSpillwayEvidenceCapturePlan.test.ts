import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_CAPTURE_REQUEST_POLICY,
  UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN,
  undertowReceivedCaptureIds,
  undertowRequestReadyCaptureIds,
  undertowRequiredCaptureIds
} from './UndertowSpillwayEvidenceCapturePlan';
import { unresolvedUndertowSourceTopologyLimits } from './UndertowSpillwaySourceTopologyAudit';
import { undertowConcreteVoidCaptureRegionIds } from './UndertowSpillwayVoidAmbiguity';

describe('T21 Undertow targeted evidence capture plan', () => {
  it('keeps the three source-topology gaps but does not request received captures again', () => {
    expect(undertowReceivedCaptureIds()).toEqual([
      'RIGHT_LOW_PARTITION',
      'GLASS_UNDERPASS_CLEARANCE'
    ]);
    expect(undertowRequiredCaptureIds()).toEqual([
      'INTERNAL_VOID_CLASSIFICATION'
    ]);
    expect(undertowRequestReadyCaptureIds()).toEqual([]);
    expect(undertowConcreteVoidCaptureRegionIds()).toEqual([]);
    expect(UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN).toHaveLength(3);
    expect(
      UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN.find(
        (capture) => capture.id === 'INTERNAL_VOID_CLASSIFICATION'
      )?.status
    ).toBe('DEFERRED_PENDING_MAP_ENUMERATION');
    expect(unresolvedUndertowSourceTopologyLimits()).toEqual([
      'right-low-floor-partition',
      'glass-underpass-walkable-outline',
      'internal-void-kill-boundaries'
    ]);
  });

  it('does not ask for already-resolved spawn, water, glass-top or first-drop evidence', () => {
    const allBlocks = UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN
      .flatMap((capture) => capture.blocks)
      .join(' ');
    expect(allBlocks).not.toContain('spawn-terrain-outline');
    expect(allBlocks).not.toContain('mapped-water-hazard-polygons');
    expect(allBlocks).not.toContain('upper-glass-platform-outline');
    expect(allBlocks).not.toContain('first-drop-lip');
  });

  it('requires a marked-map guide for every future capture request', () => {
    expect(UNDERTOW_CAPTURE_REQUEST_POLICY.mapAnnotationRequired).toBe(true);
    expect(UNDERTOW_CAPTURE_REQUEST_POLICY.requiredMapAnnotations).toEqual([
      'CAPTURE_AREA',
      'START_POSITION',
      'ROUTE_OR_CAMERA_DIRECTION',
      'LOOK_AT_BOUNDARY',
      'SYMMETRIC_COUNTERPART_IF_ALLOWED'
    ]);
  });

  it('requires plan-registration landmarks before a capture can resolve XZ', () => {
    const rightLow = UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN.find(
      (capture) => capture.id === 'RIGHT_LOW_PARTITION'
    );
    const underpass = UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN.find(
      (capture) => capture.id === 'GLASS_UNDERPASS_CLEARANCE'
    );
    expect(rightLow?.acceptance.join(' ')).toContain('PDF landmarks');
    expect(underpass?.acceptance.join(' ')).toContain('known upper glass/source hard edges');
  });
});
