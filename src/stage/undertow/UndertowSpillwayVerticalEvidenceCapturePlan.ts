export type UndertowVerticalCaptureId =
  | 'FIRST_DROP_MAGNITUDE_SIDE_PROFILE';

export type UndertowVerticalCaptureStatus =
  | 'INVALIDATED_BY_HEIGHT_ORDER_CORRECTION';

export interface UndertowVerticalCaptureRequest {
  id: UndertowVerticalCaptureId;
  priority: 1;
  status: UndertowVerticalCaptureStatus;
  blocks: readonly string[];
  mapGuideRequired: true;
  symmetricCounterpartAllowed: true;
  purpose: string;
  invalidatedBecause: string;
}

/**
 * The original side-profile request assumed that first-drop landing and
 * right-small-drop upper shared one elevation. The user's 2026-09-26 stills
 * disprove that assumption, so the request is retained only as an audit record
 * and must not be shown as request-ready.
 */
export const UNDERTOW_VERTICAL_CAPTURE_REQUESTS:
  readonly UndertowVerticalCaptureRequest[] = [
    {
      id: 'FIRST_DROP_MAGNITUDE_SIDE_PROFILE',
      priority: 1,
      status: 'INVALIDATED_BY_HEIGHT_ORDER_CORRECTION',
      blocks: [
        'team-a-spawn-floor->team-a-first-drop-landing',
        'team-b-spawn-floor->team-b-first-drop-landing'
      ],
      mapGuideRequired: true,
      symmetricCounterpartAllowed: true,
      purpose:
        'Former plan: compare the first drop against the adjacent known 1.5m right-small drop.',
      invalidatedBecause:
        'The 2026-09-26 corrective stills and direct user observation show that the floor below the red first-drop lip is lower than the floor below the blue right-small-drop lip. The two lips do not form the assumed consecutive three-terrace chain, so the blue 1.5m drop cannot be used as a direct first-drop magnitude reference.'
    }
  ];

export function undertowRequestReadyVerticalCaptureIds(): readonly UndertowVerticalCaptureId[] {
  return [];
}
