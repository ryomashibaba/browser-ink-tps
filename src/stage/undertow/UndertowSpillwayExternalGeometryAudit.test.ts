import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_CURRENT_STAGE_ASSET_IDENTITY,
  UNDERTOW_EXTERNAL_GEOMETRY_NEXT_TARGET,
  UNDERTOW_EXTERNAL_GEOMETRY_SOURCES,
  undertowExternalGeometryAuditErrors
} from './UndertowSpillwayExternalGeometryAudit';

describe('T21-C current Temple01 external geometry audit', () => {
  it('locks the current remodel to Temple01 and excludes the common false aliases', () => {
    expect(undertowExternalGeometryAuditErrors()).toEqual([]);
    expect(UNDERTOW_CURRENT_STAGE_ASSET_IDENTITY).toMatchObject({
      sceneRowId: 'Vss_Temple01',
      modelResource: 'Model/Fld_Temple01.bfres',
      previousSceneRowId: 'Vss_Temple00',
      previousModelResource: 'Model/Fld_Temple00.bfres'
    });
    expect(UNDERTOW_CURRENT_STAGE_ASSET_IDENTITY.explicitlyExcludedSceneIds)
      .toContain('Vss_Nagasaki03');
  });

  it('allows only the actually parsed Temple01 OBJ to promote locally verified metric geometry', () => {
    const metric = UNDERTOW_EXTERNAL_GEOMETRY_SOURCES.filter(
      (source) => source.exposesMetricGeometry
    );
    const promotable = UNDERTOW_EXTERNAL_GEOMETRY_SOURCES.filter(
      (source) => source.usableForVerticalPromotion
    );

    expect(metric.map((source) => source.id)).toEqual(['KITRIX_TEMPLE01_OBJ_LFS']);
    expect(promotable.map((source) => source.id)).toEqual(['KITRIX_TEMPLE01_OBJ_LFS']);
    expect(promotable[0]?.notes).toContain('375,948 vertices');
    expect(promotable[0]?.notes).toContain('0.163m');
  });

  it('moves the next target past first-drop recapture to the remaining T21 evidence', () => {
    expect(UNDERTOW_EXTERNAL_GEOMETRY_NEXT_TARGET.id)
      .toBe('REMAINING_T21C_EVIDENCE');
    expect(UNDERTOW_EXTERNAL_GEOMETRY_NEXT_TARGET.blocksUserRecapture)
      .toBe(false);
    expect(UNDERTOW_EXTERNAL_GEOMETRY_NEXT_TARGET.preferredInputs.join(' '))
      .toContain('grate');
  });
});
