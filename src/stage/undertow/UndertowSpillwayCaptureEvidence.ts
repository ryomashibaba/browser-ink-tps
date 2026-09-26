export type UndertowUserCaptureEvidenceId =
  | 'user-underpass-capture-2026-09-25'
  | 'user-right-low-capture-2026-09-25'
  | 'user-first-drop-height-stills-2026-09-26';

export interface UndertowUserCaptureEvidence {
  id: UndertowUserCaptureEvidenceId;
  filename?: string;
  filenames?: readonly string[];
  durationSeconds?: number;
  region: 'GLASS_UNDERPASS' | 'RIGHT_LOW' | 'GUIDE_LINE_SIDE_HEIGHT_ORDER';
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
        'The passage exits directly onto the adjacent low/open floor without a visible step or drop.'
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
        'The right-low floor connects directly into the covered underpass at the same walking elevation.'
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
    }
  ];

export function undertowCaptureEvidence(
  id: UndertowUserCaptureEvidenceId
): UndertowUserCaptureEvidence {
  const found = UNDERTOW_USER_CAPTURE_EVIDENCE.find((item) => item.id === id);
  if (!found) throw new Error(`missing Undertow capture evidence '${id}'`);
  return found;
}
