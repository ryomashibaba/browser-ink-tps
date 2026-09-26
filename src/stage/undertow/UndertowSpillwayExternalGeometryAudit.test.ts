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

  it('does not promote Y from source names, MTL data, LFS pointers or class definitions', () => {
    expect(
      UNDERTOW_EXTERNAL_GEOMETRY_SOURCES.filter(
        (source) => source.usableForVerticalPromotion
      )
    ).toEqual([]);
    expect(
      UNDERTOW_EXTERNAL_GEOMETRY_SOURCES.filter(
        (source) => source.exposesMetricGeometry
      )
    ).toEqual([]);
  });

  it('keeps external current-model geometry ahead of another user capture', () => {
    expect(UNDERTOW_EXTERNAL_GEOMETRY_NEXT_TARGET.id)
      .toBe('TEMPLE01_METRIC_PAYLOAD');
    expect(UNDERTOW_EXTERNAL_GEOMETRY_NEXT_TARGET.blocksUserRecapture)
      .toBe(true);
  });
});
