import { describe, expect, it } from 'vitest';
import { SurfaceFlags } from '../../ink/types';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_TURF_SCOREABLE_MASK_AUDIT,
  undertowTurfScoreableMaskAuditErrors
} from './UndertowSpillwayTurfScoreableMaskAudit';

describe('T21 Pass 17A Undertow Turf scoreable-mask authority audit', () => {
  it('keeps scoreability unresolved and authorizes no Scoreable promotion', () => {
    expect(undertowTurfScoreableMaskAuditErrors()).toEqual([]);
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT).toMatchObject({
      resolutionPass: '17A',
      currentConfirmedPaintableRuntimeSolidCount: 17,
      currentUnknownPaintRuntimeSolidCount: 0,
      currentScoreablePromotionsAuthorized: 0,
      scoreMaskResolved: false,
      paintAuthorityUpstreamComplete: true,
      candidateStatus: 'GROUND_OR_RAMP_SCORE_AUTHORITY_PENDING',
      blockerRetained: 'TURF_SCOREABLE_MASK_PENDING',
      blockerCleared: false,
      runtimeScoreablePromotionAuthorized: false,
      userCaptureRequiredNow: false,
      confidence: 'HIGH'
    });
  });

  it('classifies every current paintable candidate as eleven floors or six ramps, never a wall', () => {
    const c = UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.candidateClassification;
    expect(c).toMatchObject({
      totalPaintableCandidates: 17,
      floorCandidateCount: 11,
      rampCandidateCount: 6,
      verticalCandidateCount: 0,
      allCurrentCandidatesAreGroundOrRamp: true,
      genericVerticalNonScoringRuleEliminatesCandidateCount: 0
    });
    expect(c.floorRuntimeSolidIds).toHaveLength(11);
    expect(c.rampRuntimeSolidIds).toHaveLength(6);

    const floorIds = new Set(c.floorRuntimeSolidIds);
    const rampIds = new Set(c.rampRuntimeSolidIds);
    for (const id of floorIds) expect(rampIds.has(id)).toBe(false);
  });

  it('matches the actual inert paint-surface package and keeps every Scoreable bit off', () => {
    const surfaces = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces;
    expect(surfaces).toHaveLength(17);

    const floors = surfaces.filter(
      (surface) => (surface.flags & SurfaceFlags.Floor) !== 0
    );
    const ramps = surfaces.filter(
      (surface) => (surface.flags & SurfaceFlags.Ramp) !== 0
    );
    const walls = surfaces.filter(
      (surface) => (surface.flags & SurfaceFlags.Wall) !== 0
    );

    expect(floors).toHaveLength(11);
    expect(ramps).toHaveLength(6);
    expect(walls).toHaveLength(0);
    expect(
      surfaces.filter(
        (surface) => (surface.flags & SurfaceFlags.Scoreable) !== 0
      )
    ).toHaveLength(0);
  });

  it('records the current engine representation boundary', () => {
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.engineRepresentation)
      .toMatchObject({
        stagePaintSurfaceHasWholeSurfaceFlags: true,
        scoreableIsBaseSurfaceFlag: true,
        activeFootprintMasksInactiveCells: true,
        scoreWeightGridUsesActiveFootprintAndEdgeFractionsOnly: true,
        independentPerCellScoreMaskFieldPresent: false,
        currentSchemaCanRepresentOnlyWholeActivePaintSurfaceScoreability: true
      });
  });

  it('does not convert generic Turf rules or vector colors into Temple01 score authority', () => {
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.genericTurfRuleEvidence)
      .toMatchObject({
        splatoon3GroundCoverageRuleConfirmed: true,
        verticalSurfacesDoNotCountRuleCorroborated: true,
        authorityScope: 'RULE_LEVEL_ONLY',
        canPromoteTemple01FacesByItself: false
      });
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.vectorSourceEvidence)
      .toMatchObject({
        hasExplicitScoreableClass: false,
        whiteSourceFaceMeansScoreable: false,
        paintableMeansScoreableByDefinition: false
      });
  });

  it('localizes IsIncludeVArea as an unresolved PaintBanc lead without assigning meaning from its name', () => {
    const s = UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.publicSchemaFollowup;
    expect(s).toMatchObject({
      paintBancFieldObserved: 'IsIncludeVArea',
      paintBancFieldDefaultValue: false,
      paintBancFieldSerializedWhenTrue: true,
      temple01SpecificActorClassCount: 5,
      temple01SpecificClassesExposeField: true,
      fieldSemanticMeaningAsTurfScoreAuthorityResolved: false,
      fieldNameAloneAcceptedAsScoreAuthority: false,
      currentTemple01NormalPvpInstanceValuesRecovered: false,
      currentTemple01PerFaceBindingRecovered: false,
      normalModePlacementBodyRecovered: false,
      exposesTurfVictoryScoreMask: false,
      exposesTemple01PerFaceScoreability: false,
      exposesTemple01ScoreMaskPlacement: false
    });
    expect(s.temple01SpecificActorClasses).toEqual([
      'Lft_FldObj_Temple01_PntSet',
      'Lft_FldObj_Temple01_VarSet',
      'Lft_FldObj_Temple01_VclSet',
      'Lft_FldObj_Temple01_VglSet',
      'Lft_FldObj_Temple01_VlfSet'
    ]);
  });

  it('retains the blocker and the frozen production stage', () => {
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.candidateRuntimeSolidIds)
      .toHaveLength(17);
    expect(UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.missingAuthoritativeEvidence)
      .toHaveLength(3);
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).toContain('TURF_SCOREABLE_MASK_PENDING');
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });
});
