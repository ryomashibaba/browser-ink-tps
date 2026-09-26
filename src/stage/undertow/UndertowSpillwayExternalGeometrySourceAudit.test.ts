import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT,
  undertowExternalGeometrySourceAuditErrors
} from './UndertowSpillwayExternalGeometrySourceAudit';

describe('T21-C Undertow external geometry source audit', () => {
  it('identifies Temple01 as the remodeled Versus scene without inventing mesh geometry', () => {
    expect(undertowExternalGeometrySourceAuditErrors()).toEqual([]);

    const remodel = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
      (entry) => entry.id === 'LEANNY_TEMPLE01_SCENE_METADATA'
    );
    expect(remodel).toMatchObject({
      status: 'CONFIRMED_REMODEL_IDENTITY',
      canPromoteCanonicalGeometry: false,
      confidence: 'CONFIRMED'
    });
    expect(remodel?.facts.join(' ')).toContain('Fld_Temple01.bfres');
  });

  it('rejects Salmon Run low/mid/high stick images for normal-PvP Y reconstruction', () => {
    const stick = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
      (entry) => entry.id === 'LEANNY_TEMPLE_STICK_INDEX'
    );
    expect(stick).toMatchObject({
      status: 'REJECTED_WRONG_MODE',
      canPromoteCanonicalGeometry: false
    });
  });

  it('keeps the KiTrix Temple01 OBJ promising but non-promotable until LFS vertices are readable', () => {
    const kitrix = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
      (entry) => entry.id === 'KITRIX_TEMPLE01_OBJ'
    );
    expect(kitrix).toMatchObject({
      status: 'PROMISING_BODY_UNAVAILABLE',
      canPromoteCanonicalGeometry: false,
      confidence: 'HIGH'
    });
    expect(kitrix?.facts.join(' ')).toContain('43,263,289');
    expect(kitrix?.blocker).toContain('Git LFS object body');
  });

  it('does not trust the KiTrix display-name mapping as provenance', () => {
    const mapping = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
      (entry) => entry.id === 'KITRIX_STAGE_NAME_MAP'
    );
    expect(mapping?.status).toBe('REJECTED_NAME_MAP');
    expect(mapping?.canPromoteCanonicalGeometry).toBe(false);
  });
});
