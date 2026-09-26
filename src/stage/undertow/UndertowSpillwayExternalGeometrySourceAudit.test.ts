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

  it('allows only locally verified Temple01 geometry promotion after the LFS body audit', () => {
    const kitrix = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
      (entry) => entry.id === 'KITRIX_TEMPLE01_OBJ'
    );
    expect(kitrix).toMatchObject({
      status: 'BODY_AUDITED_LOCAL_PROMOTION',
      canPromoteCanonicalGeometry: true,
      confidence: 'HIGH'
    });
    expect(kitrix?.facts.join(' ')).toContain('375,948 vertices');
    expect(kitrix?.facts.join(' ')).toContain('0.163m');
    expect(kitrix?.blocker).toContain('full exterior registration');
  });

  it('does not trust the KiTrix display-name mapping as provenance', () => {
    const mapping = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
      (entry) => entry.id === 'KITRIX_STAGE_NAME_MAP'
    );
    expect(mapping?.status).toBe('REJECTED_NAME_MAP');
    expect(mapping?.canPromoteCanonicalGeometry).toBe(false);
  });

  it('keeps PntSet as a HIGH Turf extraction hypothesis rather than canonical geometry', () => {
    const filter = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
      (entry) => entry.id === 'KITRIX_TEMPLE01_RULE_SET_FILTER'
    );
    expect(filter).toMatchObject({
      status: 'HIGH_FILTER_HYPOTHESIS',
      canPromoteCanonicalGeometry: false,
      confidence: 'HIGH'
    });
    expect(filter?.facts.join(' ')).toContain('PntSet');
    expect(filter?.facts.join(' ')).toContain('Turf War');
  });

});
