import { UNDERTOW_CAPTURE_REQUEST_POLICY } from './UndertowSpillwayEvidenceCapturePlan';

export const UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN = Object.freeze({
  resolutionPass: '14D' as const,
  id: 'WATER_VISUAL_Y_SIDE_PROFILE' as const,
  status: 'CANCELLED_PREMISE_INVALIDATED' as const,
  supersededBy: '14E' as const,
  priority: 1 as const,
  purpose:
    'Do not request the former internal-water side-profile clip: current gameplay evidence shows the marked target is dry, invalidating the internal-water premise.' as const,
  userActionCount: 0 as const,
  symmetricCounterpartAllowed: false,
  eitherMappedWaterHazardSufficient: false,
  guidePath: 'docs/T21_UNDERTOW_PASS14D_WATER_VISUAL_Y_CAPTURE_GUIDE.svg' as const,
  guideStatus: 'DEPRECATED_DO_NOT_USE' as const,
  blocks: [] as const,
  minimumCapture: [] as const,
  acceptance: [] as const,
  avoid: [
    'Do not ask the user to capture an internal waterline at the former Pass 14D target.',
    'Do not infer that the Sunfish cyan source annotation is a rendered current-gameplay water surface.',
    'Do not infer the broader exterior water layout from the single dry-location still.'
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
    errors.push('capture-request evidence policy drifted');
  }
  if (
    p.status !== 'CANCELLED_PREMISE_INVALIDATED' ||
    p.supersededBy !== '14E' ||
    p.userActionCount !== 0 ||
    p.symmetricCounterpartAllowed ||
    p.eitherMappedWaterHazardSufficient
  ) {
    errors.push('Pass 14D must remain cancelled after the internal-water premise correction');
  }
  if (
    p.blocks.length !== 0 ||
    p.minimumCapture.length !== 0 ||
    p.acceptance.length !== 0 ||
    p.guideStatus !== 'DEPRECATED_DO_NOT_USE'
  ) {
    errors.push('cancelled Pass 14D must request no evidence and block no current authority');
  }
  if (!p.purpose.includes('marked target is dry')) {
    errors.push('Pass 14D cancellation must preserve the reason for supersession');
  }
  return errors;
}
