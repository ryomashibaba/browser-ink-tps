export type UndertowCapturedRegionId =
  | 'FIRST_DROP_OPEN_AREA'
  | 'RIGHT_SMALL_DROP_UPPER'
  | 'RIGHT_LOW'
  | 'GLASS_UNDERPASS'
  | 'RIGHT_LOW_RAMP_EXIT';

export type UndertowCapturedConnectionKind =
  | 'TRAVERSABLE_CONNECTION'
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
      deltaYMeters: -3,
      confidence: 'HIGH',
      evidenceIds: [
        'user-right-low-capture-2026-09-25',
        'extracted-temple01-geometry'
      ],
      notes:
        'The targeted capture binds the blue/right drop to the right-low destination. Locally registered remodeled Temple01 geometry resolves the upper/lower model-Y surfaces to 10.5/7.5m, a 3.0m descent.'
    },
    {
      from: 'RIGHT_LOW',
      to: 'GLASS_UNDERPASS',
      kind: 'TRAVERSABLE_CONNECTION',
      confidence: 'HIGH',
      evidenceIds: [
        'user-right-low-capture-2026-09-25',
        'user-underpass-capture-2026-09-25'
      ],
      notes:
        'Both captures establish traversable route continuity between the right-low area and the covered lower passage. Perspective traversal does not measure equal canonical floor Y; Temple01 local geometry resolves those elevations separately.'
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
