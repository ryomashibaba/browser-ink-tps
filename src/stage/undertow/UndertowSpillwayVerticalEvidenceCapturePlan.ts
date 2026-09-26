export type UndertowVerticalCaptureId =
  | 'FIRST_DROP_MAGNITUDE_SIDE_PROFILE';

export type UndertowVerticalCaptureStatus =
  | 'SUPERSEDED_BY_TEMPLE01_GEOMETRY';

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
 * The original side-profile request used a false three-terrace interpretation.
 * The corrective stills exposed that mistake; the later Temple01 local
 * registration then resolved the actual drop surfaces directly. This request
 * remains only as an audit record and must never be shown to the user again.
 */
export const UNDERTOW_VERTICAL_CAPTURE_REQUESTS:
  readonly UndertowVerticalCaptureRequest[] = [
    {
      id: 'FIRST_DROP_MAGNITUDE_SIDE_PROFILE',
      priority: 1,
      status: 'SUPERSEDED_BY_TEMPLE01_GEOMETRY',
      blocks: [
        'team-a-spawn-floor->team-a-first-drop-landing',
        'team-b-spawn-floor->team-b-first-drop-landing'
      ],
      mapGuideRequired: true,
      symmetricCounterpartAllowed: true,
      purpose:
        'Former plan: estimate first-drop magnitude from a side-profile comparison.',
      invalidatedBecause:
        'The locally registered remodeled Temple01 OBJ now resolves the first-drop upper/lower surfaces to model Y=10.5/6.0m (4.5m descent) and the separate blue/right drop to 10.5/7.5m (3.0m descent). No replacement user capture is needed for these magnitudes.'
    }
  ];

export function undertowRequestReadyVerticalCaptureIds(): readonly UndertowVerticalCaptureId[] {
  return [];
}
