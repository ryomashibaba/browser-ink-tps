import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_EXTERIOR_FALLOUT_THRESHOLD_AUDIT,
  undertowExteriorFalloutThresholdAuditErrors
} from './UndertowSpillwayExteriorFalloutThresholdAudit';

describe('T21 Pass 16A exterior fall-out threshold authority audit', () => {
  it('keeps the exact 42-vertex exterior XZ envelope while leaving vertical death Y unresolved', () => {
    const a = UNDERTOW_EXTERIOR_FALLOUT_THRESHOLD_AUDIT;
    expect(a.horizontalAuthority).toMatchObject({
      hazardTaxonomy: 'ABYSS',
      exactPlayableOuterBoundaryVertexCount: 42,
      exactExteriorXZEnvelopeResolved: true,
      internalCyanPolygonsUsedAsKillXZ: false
    });
    expect(a.verticalAuthority.exactFalloutKillYResolved).toBe(false);
    expect(a.verticalAuthority.killYProjectMeters).toBeNull();
    expect(a.verticalAuthority.numericThresholdPromotionAuthorized).toBe(false);
  });

  it('rejects unrelated numeric shortcuts instead of manufacturing a kill plane', () => {
    const a = UNDERTOW_EXTERIOR_FALLOUT_THRESHOLD_AUDIT;
    expect(a.rejectedNumericShortcuts).toEqual([
      'LOWEST_PLAYABLE_SURFACE_Y',
      'WORLD_BOUNDS',
      'CYAN_SOURCE_ANNOTATION',
      'SUPERSEDED_INTERNAL_WATER_Y',
      'LOCKER_EDITOR_OUT_OF_BOUND_DOWN'
    ]);
    expect(a.publicSchemaFollowup.observedOutOfBoundDownValue).toBe(5);
    expect(a.publicSchemaFollowup.observedOutOfBoundDownScope)
      .toBe('LOCKER_EDITOR_ONLY');
    expect(
      a.publicSchemaFollowup.lockerOutOfBoundApplicableToVersusStageFallout
    ).toBe(false);
  });

  it('records generic fall-related actor schema without pretending Temple01 placement was recovered', () => {
    const a = UNDERTOW_EXTERIOR_FALLOUT_THRESHOLD_AUDIT.publicSchemaFollowup;
    expect(a.genericLocatorPlayerPatchAreaSchemaPresent).toBe(true);
    expect(a.genericNoAirFallParameterPresent).toBe(true);
    expect(a.genericNoAirFallParameterDefinesNumericKillY).toBe(false);
    expect(a.temple01LocatorPlayerPatchAreaPlacementRecovered).toBe(false);
    expect(a.temple01NormalModePlacementBodyRecovered).toBe(false);
    expect(a.publicTemple01PlacementRecoverySucceeded).toBe(false);
  });

  it('retains the activation blocker, keeps Undertow inert, and requests no low-value capture', () => {
    const a = UNDERTOW_EXTERIOR_FALLOUT_THRESHOLD_AUDIT;
    expect(a.blockerRetained).toBe('EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING');
    expect(a.blockerCleared).toBe(false);
    expect(a.runtimeKillVolumePromotionAuthorized).toBe(false);
    expect(a.productionStageActivationAuthorized).toBe(false);
    expect(a.userCaptureRequiredNow).toBe(false);
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).toContain('EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING');
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });

  it('passes the Pass 16A evidence-boundary consistency gate', () => {
    expect(undertowExteriorFalloutThresholdAuditErrors()).toEqual([]);
  });
});
