export type UndertowResolutionBlockerId =
  | 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING'
  | 'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING'
  | 'WATER_VISUAL_Y_PENDING'
  | 'WATER_KILL_THRESHOLD_PENDING'
  | 'UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING'
  | 'TURF_SCOREABLE_MASK_PENDING'
  | 'FULL_STAGE_CONNECTIVITY_QA_PENDING';

export type UndertowStageLayoutResolutionPotential =
  | 'DIRECT_IF_INSTANCE_PRESENT'
  | 'SUPPORTING_ONLY'
  | 'NOT_EXPECTED_TO_RESOLVE_ALONE';

export interface UndertowStageLayoutResolutionTarget {
  blockerId: UndertowResolutionBlockerId;
  potential: UndertowStageLayoutResolutionPotential;
  requiredEvidence: string;
  notes: string;
}

export const UNDERTOW_STAGE_LAYOUT_SOURCE_RECOVERY_AUDIT = Object.freeze({
  round: 1,
  targetStageRowId: 'Vss_Temple01',
  targetVersion: 'Ver.7.2.0+ remodeled Undertow',
  sourcePayloadRecovered: false,
  runtimePromotionAuthorized: false,
  publicSources: Object.freeze({
    leanny: Object.freeze({
      repository: 'Leanny/splat3',
      commit: '7280ff9cde8bb1c5dcef46c700c326471584d2e6',
      ver720SceneIdentityPresent: true,
      ver720ModelResource: 'Model/Fld_Temple01.bfres',
      ver720ModifiedTowerLayerReference:
        'Work/Banc/BinLayer/Vss_Temple01_Vlf-ModifiedTowerControl.bcett.json',
      referencedLayerPayloadPresentInRepository: false,
      notes:
        'LeagueTypeInfo proves that a Temple01 Vlf BinLayer filename exists in game metadata, but the referenced BCETT payload itself is not published in this repository.'
    }),
    octoSquiddy: Object.freeze({
      repository: 'OctoSquiddy/Splatoon-3-Map-Editor',
      commit: '0e3c66d28b58f7b43df7cdfb6c34514e0ebc1fd4',
      temple01ActorClasses: [
        'Lft_FldObj_Temple01_PntSet',
        'Lft_FldObj_Temple01_VarSet',
        'Lft_FldObj_Temple01_VclSet',
        'Lft_FldObj_Temple01_VglSet',
        'Lft_FldObj_Temple01_VlfSet'
      ] as const,
      temple01SetBindGuiFieldCountEach: 19,
      temple01SetIncludesPaintBancField: 'IsIncludeVArea',
      playerDeadClass: 'Mpt_PlayerDead',
      playerDeadIncludesPaintBancField: 'IsIncludeVArea',
      publishedBcettPayloadCount: 0,
      publishedBymlPayloadCount: 0,
      notes:
        'The editor publishes actor schemas and BYML deserialization support, not Nintendo stage-layout payloads. Schema presence does not establish any Temple01 instance transform or parameter value.'
    }),
    sp3ExtractedData: Object.freeze({
      repository: 'imink-app/SP3ExtractedData',
      commit: '8c53a1f1f785883271b754182c6c869bc2377413',
      locatorInfoHasMptPlayerDead: true,
      bancOrBinLayerPayloadPresent: false,
      temple01LayoutPayloadPresent: false,
      notes:
        'This independent extracted-data repository corroborates the generic Mpt_PlayerDead locator metadata but does not publish Banc/BinLayer stage layouts.'
    }),
    shakeMapper3: Object.freeze({
      repository: 'av5ja/shake_mapper_3',
      commit: '92b2a1686fc2a98761a645a9686d69aeb88a06c2',
      expectsLocalBcettYamlInput: true,
      localInputDirectory: 'yamls',
      publishedInputYamlPresent: false,
      notes:
        'The tool demonstrates that BCETT YAML exports contain actor Gyaml/Layer/Translate data, but its README explicitly states that copyrighted map data is not included.'
    }),
    kitrix: Object.freeze({
      repository: 'kirakira-dev/KiTrix',
      commit: '0611f51b35c9736ee986fb2218461e2585b7875e',
      temple01VisualModelPresent: true,
      stageLayoutPayloadPresent: false,
      notes:
        'KiTrix remains useful for exact visual geometry but does not expose the missing Temple01 Banc placement payload.'
    })
  }),
  editorInputContract: Object.freeze({
    acceptedStageLayoutExtension: '*.zs',
    compression: 'ZSTD',
    archive: 'SARC',
    bancEntryPrefix: 'Banc/',
    bancPayloadFormat: 'BYML',
    actorArrayKey: 'Actors',
    actorFieldsNeededForResolution: [
      'Gyaml',
      'Translate',
      'Rotate',
      'Scale',
      'Layer',
      'spl__PaintBancParam / IsIncludeVArea'
    ] as const,
    notes:
      'StageLayoutPlugin accepts .zs. StageDefinition decompresses ZSTD, opens the SARC, selects Banc/* entries, loads BYML, and deserializes Actors. Therefore the preferred evidence artifact is the user-owned stage-layout .zs archive itself; a faithful Banc BYML/YAML export is also sufficient for audit.'
  }),
  minimumNextArtifact: Object.freeze({
    preferred:
      'User-owned Ver.7.2.0+ Undertow stage-layout .zs archive that contains the Vss_Temple01 Banc data.',
    acceptable:
      'A decompressed/exported Banc BYML or YAML preserving Actors with Gyaml, Translate, Rotate, Scale, Layer, and actor parameter dictionaries.',
    insufficient: [
      'A filename reference without payload contents.',
      'A visual-model OBJ/MTL without actor instances.',
      'Screenshots without registered transforms.',
      'Actor class/schema files without instance values.'
    ] as const
  }),
  notes:
    'Resolution Pass 1 exhausted the currently identified public metadata/schema/model sources without recovering the Temple01 Banc actor-instance payload. No blocker is cleared and no runtime geometry, collision, kill volume, paint authority, scoreability, or navigation link is promoted.'
});

export const UNDERTOW_STAGE_LAYOUT_RESOLUTION_TARGETS:
  readonly UndertowStageLayoutResolutionTarget[] = [
  {
    blockerId: 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
    potential: 'SUPPORTING_ONLY',
    requiredEvidence:
      'Actor instances/parameters can identify which Temple01 set is active and where it is placed, but original player/projectile collision semantics still require collision/query authority beyond visual/Banc placement alone.',
    notes:
      'A recovered layout can narrow the active Glass/BridgeMetal instance set but must not convert render geometry directly into collision.'
  },
  {
    blockerId: 'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING',
    potential: 'NOT_EXPECTED_TO_RESOLVE_ALONE',
    requiredEvidence:
      'Camera-specific query/collision metadata or controlled registered in-game camera evidence.',
    notes:
      'Banc placement alone does not prove camera push-in, occlusion, or line-of-sight behavior.'
  },
  {
    blockerId: 'WATER_VISUAL_Y_PENDING',
    potential: 'DIRECT_IF_INSTANCE_PRESENT',
    requiredEvidence:
      'A Temple01 water/ocean/effect actor instance whose transform or parameter directly defines the rendered water/abyss plane.',
    notes:
      'If the water visual is represented by a Banc actor, its registered transform can directly resolve visual Y.'
  },
  {
    blockerId: 'WATER_KILL_THRESHOLD_PENDING',
    potential: 'DIRECT_IF_INSTANCE_PRESENT',
    requiredEvidence:
      'Temple01 Mpt_PlayerDead or equivalent player-death locator instances with transform/scale/layer data.',
    notes:
      'The generic Mpt_PlayerDead schema is already known; the missing information is the actual Temple01 instance placement.'
  },
  {
    blockerId: 'UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING',
    potential: 'SUPPORTING_ONLY',
    requiredEvidence:
      'Temple01 set instances and spl__PaintBancParam values, plus any required face/collider binding that maps those actor-level values to the exact runtime source faces.',
    notes:
      'IsIncludeVArea is actor-level metadata and is not automatically per-face PAINTABLE authority.'
  },
  {
    blockerId: 'TURF_SCOREABLE_MASK_PENDING',
    potential: 'NOT_EXPECTED_TO_RESOLVE_ALONE',
    requiredEvidence:
      'A Turf victory-score mask/per-face score classification or controlled scoring evidence.',
    notes:
      'Stage actor placement may constrain candidates, but no public schema evidence shows that IsIncludeVArea is the Turf victory-score mask.'
  },
  {
    blockerId: 'FULL_STAGE_CONNECTIVITY_QA_PENDING',
    potential: 'SUPPORTING_ONLY',
    requiredEvidence:
      'Recovered actor placement may bind missing traversable components, but final readiness still requires all authoritative walkability plus a final production-candidate Recast pass.',
    notes:
      'No off-mesh traversal semantics may be inferred solely from actor placement.'
  }
];

export function undertowStageLayoutSourceRecoveryAuditErrors(): readonly string[] {
  const audit = UNDERTOW_STAGE_LAYOUT_SOURCE_RECOVERY_AUDIT;
  const errors: string[] = [];

  if (audit.sourcePayloadRecovered || audit.runtimePromotionAuthorized) {
    errors.push('source-recovery audit must not claim a recovered Temple01 layout or runtime promotion');
  }
  if (
    audit.publicSources.octoSquiddy.publishedBcettPayloadCount !== 0 ||
    audit.publicSources.octoSquiddy.publishedBymlPayloadCount !== 0
  ) {
    errors.push('OctoSquiddy public repository unexpectedly claims Nintendo layout payloads');
  }
  if (
    audit.publicSources.sp3ExtractedData.bancOrBinLayerPayloadPresent ||
    audit.publicSources.sp3ExtractedData.temple01LayoutPayloadPresent
  ) {
    errors.push('SP3ExtractedData unexpectedly claims Temple01 Banc/BinLayer payloads');
  }
  if (audit.publicSources.shakeMapper3.publishedInputYamlPresent) {
    errors.push('ShakeMapper3 must not claim its local copyrighted YAML inputs are published');
  }
  if (
    audit.editorInputContract.acceptedStageLayoutExtension !== '*.zs' ||
    audit.editorInputContract.compression !== 'ZSTD' ||
    audit.editorInputContract.archive !== 'SARC' ||
    audit.editorInputContract.bancEntryPrefix !== 'Banc/' ||
    audit.editorInputContract.bancPayloadFormat !== 'BYML'
  ) {
    errors.push('stage-layout editor input contract drifted');
  }
  if (UNDERTOW_STAGE_LAYOUT_RESOLUTION_TARGETS.length !== 7) {
    errors.push('resolution target inventory must cover all seven activation blockers exactly once');
  }
  const blockerIds = new Set(
    UNDERTOW_STAGE_LAYOUT_RESOLUTION_TARGETS.map((target) => target.blockerId)
  );
  if (blockerIds.size !== 7) {
    errors.push('resolution target inventory contains duplicate blocker ids');
  }
  const directTargets = UNDERTOW_STAGE_LAYOUT_RESOLUTION_TARGETS.filter(
    (target) => target.potential === 'DIRECT_IF_INSTANCE_PRESENT'
  ).map((target) => target.blockerId);
  if (
    directTargets.length !== 2 ||
    !directTargets.includes('WATER_VISUAL_Y_PENDING') ||
    !directTargets.includes('WATER_KILL_THRESHOLD_PENDING')
  ) {
    errors.push('only water visual-Y and kill-threshold may be direct stage-layout resolution candidates');
  }
  return errors;
}
