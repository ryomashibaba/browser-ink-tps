export type UndertowCapturedRegionId =
  | 'FIRST_DROP_OPEN_AREA'
  | 'RIGHT_SMALL_DROP_UPPER'
  | 'RIGHT_LOW'
  | 'GLASS_UNDERPASS'
  | 'RIGHT_LOW_RAMP_EXIT';

export type UndertowCapturedConnectionKind =
  | 'SAME_LEVEL'
  | 'DROP'
  | 'SLOPE';

export interface UndertowCapturedConnection {
  from: UndertowCapturedRegionId;
  to: UndertowCapturedRegionId;
  kind: UndertowCapturedConnectionKind;
  deltaYMeters?: number;
  confidence: 'CONFIRMED' | 'HIGH';
  evidenceIds: readonly string[];
  notes: string;
}

export interface UndertowCapturedObstructionFact {
  region: UndertowCapturedRegionId;
  kind: 'SOLID_SUPPORT_OR_WALL';
  confidence: 'CONFIRMED';
  evidenceIds: readonly string[];
  notes: string;
}

export const UNDERTOW_CAPTURED_CONNECTIONS:
  readonly UndertowCapturedConnection[] = [
    {
      from: 'RIGHT_SMALL_DROP_UPPER',
      to: 'RIGHT_LOW',
      kind: 'DROP',
      deltaYMeters: -1.5,
      confidence: 'HIGH',
      evidenceIds: [
        'user-right-low-capture-2026-09-25',
        'handoff-t21-masterplan'
      ],
      notes:
        'The targeted capture begins on the upper floor and descends into the right-low open/grass floor; the existing vertical measurement is 1.5m.'
    },
    {
      from: 'RIGHT_LOW',
      to: 'GLASS_UNDERPASS',
      kind: 'SAME_LEVEL',
      deltaYMeters: 0,
      confidence: 'HIGH',
      evidenceIds: [
        'user-right-low-capture-2026-09-25',
        'user-underpass-capture-2026-09-25'
      ],
      notes:
        'Both captures show a continuous walking connection with no visible step/drop between the right-low floor and the covered lower passage.'
    },
    {
      from: 'RIGHT_LOW',
      to: 'RIGHT_LOW_RAMP_EXIT',
      kind: 'SLOPE',
      confidence: 'CONFIRMED',
      evidenceIds: ['user-right-low-capture-2026-09-25'],
      notes:
        'The right-low perimeter capture visibly contains a traversable ramp rising out of the low/open floor. The ramp high-end elevation remains unresolved.'
    }
  ];

export const UNDERTOW_CAPTURED_OBSTRUCTIONS:
  readonly UndertowCapturedObstructionFact[] = [
    {
      region: 'GLASS_UNDERPASS',
      kind: 'SOLID_SUPPORT_OR_WALL',
      confidence: 'CONFIRMED',
      evidenceIds: ['user-underpass-capture-2026-09-25'],
      notes:
        'Solid vertical support/wall geometry is present inside/along the covered passage; navigation must use explicit exclusions rather than treating the full projected upper footprint as one open polygon.'
    }
  ];
