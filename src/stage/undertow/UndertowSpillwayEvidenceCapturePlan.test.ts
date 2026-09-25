import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN,
  undertowReceivedCaptureIds,
  undertowRequiredCaptureIds
} from './UndertowSpillwayEvidenceCapturePlan';
import { unresolvedUndertowSourceTopologyLimits } from './UndertowSpillwaySourceTopologyAudit';

describe('T21 Undertow targeted evidence capture plan', () => {
  it('keeps the three source-topology gaps but does not request received captures again', () => {
    expect(undertowReceivedCaptureIds()).toEqual([
      'RIGHT_LOW_PARTITION',
      'GLASS_UNDERPASS_CLEARANCE'
    ]);
    expect(undertowRequiredCaptureIds()).toEqual([
      'INTERNAL_VOID_CLASSIFICATION'
    ]);
    expect(UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN).toHaveLength(3);
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
