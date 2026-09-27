export type UndertowUserCaptureEvidenceId =
  | 'user-underpass-capture-2026-09-25'
  | 'user-right-low-capture-2026-09-25'
  | 'user-first-drop-height-stills-2026-09-26'
  | 'user-underpass-outside-zone-paint-stills-2026-09-27';

export interface UndertowUserCaptureEvidence {
  id: UndertowUserCaptureEvidenceId;
  filename?: string;
  filenames?: readonly string[];
  durationSeconds?: number;
  region:
    | 'GLASS_UNDERPASS'
    | 'RIGHT_LOW'
    | 'GUIDE_LINE_SIDE_HEIGHT_ORDER'
    | 'GLASS_UNDERPASS_PAINT_OUTSIDE_ZONES';
  confidence: 'CONFIRMED';
  facts: readonly string[];
}

export const UNDERTOW_USER_CAPTURE_EVIDENCE:
  readonly UndertowUserCaptureEvidence[] = [
    {
      id: 'user-underpass-capture-2026-09-25',
      filename:
        '20260925-01M3CC7J9A5C9AE8YTYYE6HSHM-4D9D9F84-E6A2-4AF9-8A4B-D2534454E0B1.mp4',
      durationSeconds: 29.633333,
      region: 'GLASS_UNDERPASS',
      confidence: 'CONFIRMED',
      facts: [
        'The covered lower passage is traversable in current normal-PvP geometry.',
        'The passage has solid support/wall geometry that must be separated from the walkable floor.',
        'The passage is traversably connected to the adjacent low/open route; the perspective clip does not establish an exact canonical floor-to-floor Y delta.'
      ]
    },
    {
      id: 'user-right-low-capture-2026-09-25',
      filename:
        '20260925-01M3CC7W69VA9ZBR9NJWR0KYYG-7AD89BB0-8510-46E3-8C98-A64A14F92CAE.mp4',
      durationSeconds: 29.5,
      region: 'RIGHT_LOW',
      confidence: 'CONFIRMED',
      facts: [
        'The right-low area is a traversable low/open floor with grass and hard-edge boundaries.',
        'The measured small drop descends into this low/open floor.',
        'At least one ramp rises out of the right-low floor.',
        'The right-low route connects into the covered underpass; the perspective clip establishes connectivity, not equal canonical floor Y.'
      ]
    },
    {
      id: 'user-first-drop-height-stills-2026-09-26',
      filenames: ['IMG_6112.jpeg', 'IMG_6111.jpeg'],
      region: 'GUIDE_LINE_SIDE_HEIGHT_ORDER',
      confidence: 'CONFIRMED',
      facts: [
        'The user identifies the floor referred to as below the red guide line as lower than the floor referred to as below the blue guide line.',
        'The guide-line-side comparison does not independently identify either observed floor as a canonical first-drop-landing, right-small-drop-upper, or right-low node.',
        'The still pair establishes only a qualitative guide-line-side ordering; it does not establish canonical floor identities or an exact metric delta.'
      ]
    },
    {
      id: 'user-underpass-outside-zone-paint-stills-2026-09-27',
      filenames: ['IMG_6137.jpeg', 'IMG_6136.jpeg', 'IMG_6135.jpeg', 'IMG_6134.jpeg'],
      region: 'GLASS_UNDERPASS_PAINT_OUTSIDE_ZONES',
      confidence: 'CONFIRMED',
      facts: [
        'The four stills were supplied as the two Pass 12B mirrored-side probe pairs, in before/after order: IMG_6137 to IMG_6136 and IMG_6135 to IMG_6134.',
        'Each before/after pair keeps the local underpass floor and surrounding geometry visible; the after frame shows persistent yellow ordinary-main-weapon ink on the previously bare floor patch.',
        'The submission fulfills both independently registered outside-Zone probes from the Pass 12B capture guide, so both whole-underpass floor solids are authorized PAINTABLE without inferring the second side from symmetry.',
        'This evidence establishes paint acceptance only. It does not authorize Turf Scoreable semantics or any player/projectile/camera/navigation inference.'
      ]
    }
  ];

export function undertowCaptureEvidence(
  id: UndertowUserCaptureEvidenceId
): UndertowUserCaptureEvidence {
  const found = UNDERTOW_USER_CAPTURE_EVIDENCE.find((item) => item.id === id);
  if (!found) throw new Error(`missing Undertow capture evidence '${id}'`);
  return found;
}
