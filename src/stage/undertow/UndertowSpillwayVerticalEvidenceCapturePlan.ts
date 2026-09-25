export type UndertowVerticalCaptureId =
  | 'FIRST_DROP_MAGNITUDE_SIDE_PROFILE';

export interface UndertowVerticalCaptureRequest {
  id: UndertowVerticalCaptureId;
  priority: 1;
  status: 'REQUEST_READY';
  blocks: readonly string[];
  mapGuideRequired: true;
  symmetricCounterpartAllowed: true;
  purpose: string;
  startRegion: string;
  lookDirection: string;
  capture: readonly string[];
  acceptance: readonly string[];
  avoid: readonly string[];
}

/**
 * Vertical capture requests are separate from the earlier XZ plan-registration
 * captures. A request may become user-facing only after a marked map guide is
 * prepared.
 */
export const UNDERTOW_VERTICAL_CAPTURE_REQUESTS:
  readonly UndertowVerticalCaptureRequest[] = [
    {
      id: 'FIRST_DROP_MAGNITUDE_SIDE_PROFILE',
      priority: 1,
      status: 'REQUEST_READY',
      blocks: [
        'team-a-spawn-floor->team-a-first-drop-landing',
        'team-b-spawn-floor->team-b-first-drop-landing'
      ],
      mapGuideRequired: true,
      symmetricCounterpartAllowed: true,
      purpose:
        'Distinguish the CONFIRMED one-way first drop between the remaining 1.5m and 3.0m candidates by comparing it directly with the adjacent right-small drop, whose vertical delta is already HIGH at 1.5m.',
      startRegion:
        'Stand on the right-low floor near the shared corner between the first-drop landing/open floor and the measured right-small-drop lip.',
      lookDirection:
        'Use Recon Photo Mode from the side so the spawn-side upper floor, first-drop landing/middle floor, and right-low/lower floor are visible in one frame.',
      capture: [
        'Take one wide side-profile still containing all three floor levels and both vertical faces at once.',
        'Take one closer still from the same side with the first-drop face and the known 1.5m right-small-drop face both unobstructed.',
        'If a single still cannot show both faces clearly, record a slow 5-10 second horizontal pan without changing vertical camera height or zoom.'
      ],
      acceptance: [
        'The upper spawn floor, middle first-drop landing/right-small-drop upper, and lower right-low floor are simultaneously identifiable.',
        'Both drop faces are visible enough to compare their vertical extents directly.',
        'The camera is approximately side-on rather than a steep top-down view.',
        'No additional right-low perimeter or underpass traversal is required.'
      ],
      avoid: [
        'Do not re-record the already received right-low perimeter or underpass route.',
        'Do not use a steep overhead angle that foreshortens the drop height.',
        'Do not hide either vertical face behind the player, a wall, or the cylindrical pillar.'
      ]
    }
  ];

export function undertowRequestReadyVerticalCaptureIds(): readonly UndertowVerticalCaptureId[] {
  return UNDERTOW_VERTICAL_CAPTURE_REQUESTS
    .filter((request) => request.status === 'REQUEST_READY' && request.mapGuideRequired)
    .map((request) => request.id);
}
