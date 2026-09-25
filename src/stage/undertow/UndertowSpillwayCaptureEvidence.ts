export type UndertowUserCaptureEvidenceId =
  | 'user-underpass-capture-2026-09-25'
  | 'user-right-low-capture-2026-09-25';

export interface UndertowUserCaptureEvidence {
  id: UndertowUserCaptureEvidenceId;
  filename: string;
  durationSeconds: number;
  region: 'GLASS_UNDERPASS' | 'RIGHT_LOW';
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
    }
  ];

export function undertowCaptureEvidence(
  id: UndertowUserCaptureEvidenceId
): UndertowUserCaptureEvidence {
  const found = UNDERTOW_USER_CAPTURE_EVIDENCE.find((item) => item.id === id);
  if (!found) throw new Error(`missing Undertow capture evidence '${id}'`);
  return found;
}
