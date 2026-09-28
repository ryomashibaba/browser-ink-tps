import { UNDERTOW_CAPTURE_REQUEST_POLICY } from './UndertowSpillwayEvidenceCapturePlan';

export const UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN = Object.freeze({
  resolutionPass: '14D' as const,
  id: 'WATER_VISUAL_Y_SIDE_PROFILE' as const,
  status: 'REQUEST_READY' as const,
  priority: 1 as const,
  purpose:
    'Determine the exact visible-water world Y by registering the in-game waterline against fixed Temple01 geometry with exact source Y.' as const,
  userActionCount: 1 as const,
  symmetricCounterpartAllowed: true,
  eitherMappedWaterHazardSufficient: true,
  guidePath: 'docs/T21_UNDERTOW_PASS14D_WATER_VISUAL_Y_CAPTURE_GUIDE.svg' as const,
  blocks: ['WATER_VISUAL_Y_PENDING'] as const,
  minimumCapture: [
    'One 5–8 second clip at either mapped internal water hazard.',
    'Stand on a safe solid ledge immediately beside the water boundary.',
    'Keep the visible waterline and a fixed vertical Temple01 wall/ledge in the same frame.',
    'Lower the camera toward a side profile and slowly pan while retaining nearby horizontal seams.'
  ] as const,
  acceptance: [
    'At least one frame shows the waterline crossing a fixed wall/ledge that can be source-registered.',
    'The waterline is not hidden entirely by a grate, character, UI element, or foreground frame.',
    'Enough nearby fixed geometry remains visible to distinguish among the candidate source-Y ledges.'
  ] as const,
  avoid: [
    'Do not infer water Y from the global PDF-to-OBJ transform alone.',
    'Do not record a steep top-down view with no visible side waterline.',
    'Do not jump into the hazard; death timing is not the purpose of this pass.',
    'Do not require both mirrored sides when one registered side resolves the shared visual Y.'
  ] as const
});

export function undertowWaterControlledCapturePlanErrors(): readonly string[] {
  const p = UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN;
  const errors: string[] = [];

  if (
    !UNDERTOW_CAPTURE_REQUEST_POLICY.purposeStatementRequired ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.mapAnnotationRequired ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.fullTerrainContextRequired ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.detailInsetRequiredWhenTargetIsSmall
  ) {
    errors.push('Pass 14D capture request policy drifted');
  }
  if (
    p.status !== 'REQUEST_READY' ||
    p.userActionCount !== 1 ||
    !p.symmetricCounterpartAllowed ||
    !p.eitherMappedWaterHazardSufficient
  ) {
    errors.push('Pass 14D must request one clip from either mirrored water hazard');
  }
  if (
    !p.purpose.includes('exact visible-water world Y') ||
    !p.blocks.includes('WATER_VISUAL_Y_PENDING') ||
    !p.guidePath.includes('PASS14D_WATER_VISUAL_Y_CAPTURE_GUIDE.svg')
  ) {
    errors.push('Pass 14D purpose/blocker/guide binding drifted');
  }
  return errors;
}
