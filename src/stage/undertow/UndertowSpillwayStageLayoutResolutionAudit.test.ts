import { describe, expect, it } from 'vitest';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_STAGE_LAYOUT_RESOLUTION_TARGETS,
  UNDERTOW_STAGE_LAYOUT_SOURCE_RECOVERY_AUDIT,
  undertowStageLayoutSourceRecoveryAuditErrors
} from './UndertowSpillwayStageLayoutResolutionAudit';

describe('T21 Undertow stage-layout source recovery resolution pass', () => {
  it('records the public-source gap without promoting any runtime authority', () => {
    expect(undertowStageLayoutSourceRecoveryAuditErrors()).toEqual([]);
    expect(UNDERTOW_STAGE_LAYOUT_SOURCE_RECOVERY_AUDIT).toMatchObject({
      round: 1,
      targetStageRowId: 'Vss_Temple01',
      sourcePayloadRecovered: false,
      runtimePromotionAuthorized: false
    });
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers).toHaveLength(7);
  });

  it('records the actual editor input contract instead of guessing a BCETT filename', () => {
    expect(UNDERTOW_STAGE_LAYOUT_SOURCE_RECOVERY_AUDIT.editorInputContract)
      .toMatchObject({
        acceptedStageLayoutExtension: '*.zs',
        compression: 'ZSTD',
        archive: 'SARC',
        bancEntryPrefix: 'Banc/',
        bancPayloadFormat: 'BYML',
        actorArrayKey: 'Actors'
      });
  });

  it('keeps schema references separate from Temple01 actor-instance evidence', () => {
    expect(UNDERTOW_STAGE_LAYOUT_SOURCE_RECOVERY_AUDIT.publicSources.leanny)
      .toMatchObject({
        ver720SceneIdentityPresent: true,
        ver720ModelResource: 'Model/Fld_Temple01.bfres',
        ver720ModifiedTowerLayerReference:
          'Work/Banc/BinLayer/Vss_Temple01_Vlf-ModifiedTowerControl.bcett.json',
        referencedLayerPayloadPresentInRepository: false
      });
    expect(UNDERTOW_STAGE_LAYOUT_SOURCE_RECOVERY_AUDIT.publicSources.octoSquiddy)
      .toMatchObject({
        temple01SetBindGuiFieldCountEach: 19,
        temple01SetIncludesPaintBancField: 'IsIncludeVArea',
        playerDeadClass: 'Mpt_PlayerDead',
        playerDeadIncludesPaintBancField: 'IsIncludeVArea',
        publishedBcettPayloadCount: 0,
        publishedBymlPayloadCount: 0
      });
  });

  it('localizes which blockers could be directly helped by a recovered layout', () => {
    const direct = UNDERTOW_STAGE_LAYOUT_RESOLUTION_TARGETS
      .filter((target) => target.potential === 'DIRECT_IF_INSTANCE_PRESENT')
      .map((target) => target.blockerId)
      .sort();
    expect(direct).toEqual([
      'WATER_KILL_THRESHOLD_PENDING',
      'WATER_VISUAL_Y_PENDING'
    ]);
    expect(UNDERTOW_STAGE_LAYOUT_RESOLUTION_TARGETS).toHaveLength(7);
  });
});
