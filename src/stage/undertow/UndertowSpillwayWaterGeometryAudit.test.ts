import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_WATER_VISUAL_PLANE_AUDIT,
  undertowWaterVisualPlaneAuditErrors
} from './UndertowSpillwayWaterGeometryAudit';

describe('T21-D water geometry audit', () => {
  it('records the zero-coverage Temple01 result instead of inventing a water Y', () => {
    expect(undertowWaterVisualPlaneAuditErrors()).toEqual([]);
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.teamA).toMatchObject({
      vectorPolygonRasterCells: 1954,
      temple01WaterSurfaceCells: 0,
      coverage: 0
    });
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.teamB).toMatchObject({
      vectorPolygonRasterCells: 1953,
      temple01WaterSurfaceCells: 0,
      coverage: 0
    });
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.resolutionPass).toBe('9B');
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.sourceTarget)
      .toBe('CURRENT_POST_VER_7_2_NORMAL_PVP');
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneResolved).toBe(false);
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneMeters).toBeNull();
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.killThresholdResolved).toBe(false);
  });

  it('does not over-promote the named OBJ scan into proof that no visual effect exists', () => {
    expect(UNDERTOW_WATER_VISUAL_PLANE_AUDIT.sourceMeshAudit).toMatchObject({
      exactMappedWaterPolygonCoverage: 0,
      establishesVisualWaterAbsence: false
    });
  });

  it('localizes the missing public placement/environment authority', () => {
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicLayoutSchemaFollowup
        .temple01SpecificActorClasses
    ).toEqual([
      'Fld_Temple01',
      'Lft_FldObj_Temple01_PntSet',
      'Lft_FldObj_Temple01_VarSet',
      'Lft_FldObj_Temple01_VclSet',
      'Lft_FldObj_Temple01_VglSet',
      'Lft_FldObj_Temple01_VlfSet'
    ]);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicLayoutSchemaFollowup
        .temple01SpecificWaterActorClassPresent
    ).toBe(false);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicLayoutSchemaFollowup
        .oceanSimulationSchemaPresent
    ).toBe(true);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicLayoutSchemaFollowup
        .placementDataForTemple01PresentInPublishedSchemaRepository
    ).toBe(false);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicLayoutSchemaFollowup
        .temple01LiftVariantClasses
    ).toEqual([
      'Lft_FldObj_Temple01_PntSet',
      'Lft_FldObj_Temple01_VarSet',
      'Lft_FldObj_Temple01_VclSet',
      'Lft_FldObj_Temple01_VglSet',
      'Lft_FldObj_Temple01_VlfSet'
    ]);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicLayoutSchemaFollowup
        .actorPlacementTransformFields
    ).toEqual(['Translate', 'Rotate', 'Scale']);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicLayoutSchemaFollowup
        .referencedTemple01RuleBinLayer
    ).toBe('Work/Banc/BinLayer/Vss_Temple01_Vlf-ModifiedTowerControl.bcett.json');
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicLayoutSchemaFollowup
        .referencedTemple01RuleBinLayerScope
    ).toBe('TOWER_CONTROL_MODIFIER_REFERENCE_ONLY');
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicLayoutSchemaFollowup
        .referencedTemple01RuleBinLayerContentsPublished
    ).toBe(false);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.leannySceneMetadataFollowup
        .preloadResources
    ).toEqual(['Model/Fld_Temple01.bfres']);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.leannySceneMetadataFollowup
        .preloadContainsExplicitWaterResource
    ).toBe(false);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.leannySceneMetadataFollowup
        .exposesWaterVisualY
    ).toBe(false);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.leannySceneMetadataFollowup
        .exposesTemple01PlacementTransforms
    ).toBe(false);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicPlacementRecoverySucceeded
    ).toBe(false);
    expect(
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.missingAuthoritativeEvidence.length
    ).toBeGreaterThan(0);
  });
});
