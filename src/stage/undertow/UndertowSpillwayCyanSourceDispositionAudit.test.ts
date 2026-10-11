import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_CYAN_SOURCE_DISPOSITION_AUDIT,
  undertowCyanSourceDispositionAuditErrors
} from './UndertowSpillwayCyanSourceDispositionAudit';

describe('T21 Pass 14F cyan source disposition', () => {
  it('resolves the exact cyan pair as source-only annotations rather than runtime surfaces', () => {
    const a = UNDERTOW_CYAN_SOURCE_DISPOSITION_AUDIT;
    expect(a.evidenceBoundary).toMatchObject({
      pass14EDryTargetCorrectionAccepted: true,
      currentNormalPvpHazardSummary: 'ABYSS_ONLY',
      currentSymmetricTacticalMapCrossCheckAccepted: true,
      sourcePairStillExact: true,
      teamASourceClass: 'WATER_CYAN',
      teamBSourceClass: 'WATER_CYAN'
    });
    expect(a.resolution).toMatchObject({
      sourceAnnotationOnlyNoRuntimeSurface: true,
      createInternalWaterSurface: false,
      createInternalWaterKillVolume: false,
      createPaintSurfaceFromCyanAnnotation: false,
      sourcePolygonGeometryRetainedForProvenance: true
    });
  });

  it('clears only the temporary cyan semantic blocker and keeps exterior fall-out Y separate', () => {
    const a = UNDERTOW_CYAN_SOURCE_DISPOSITION_AUDIT;
    expect(a.blockerCleared).toBe('CYAN_SOURCE_REGION_GAMEPLAY_SEMANTICS_PENDING');
    expect(a.blockerStillRequired).toBe('EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING');
    expect(a.resolution.decorativeOrOffStageWaterLayoutResolved).toBe(false);
    expect(a.resolution.exteriorFalloutKillThresholdResolved).toBe(false);
    expect(a.userActionRequiredNow).toBe(false);
  });

  it('passes the Pass 14F consistency gate', () => {
    expect(undertowCyanSourceDispositionAuditErrors()).toEqual([]);
  });
});
