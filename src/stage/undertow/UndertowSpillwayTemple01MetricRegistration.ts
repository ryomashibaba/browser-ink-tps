export type UndertowTemple01MetricFeatureId =
  | 'CENTER_LOW'
  | 'TEAM_A_SPAWN'
  | 'TEAM_B_SPAWN'
  | 'TEAM_A_FIRST_DROP_LANDING'
  | 'TEAM_B_FIRST_DROP_LANDING'
  | 'RIGHT_SMALL_DROP_UPPER'
  | 'RIGHT_LOW';

export interface UndertowTemple01MetricFeature {
  id: UndertowTemple01MetricFeatureId;
  modelY: number;
  canonicalY: number;
  confidence: 'HIGH';
  evidenceIds: readonly string[];
  notes: string;
}

export const UNDERTOW_TEMPLE01_METRIC_REGISTRATION = Object.freeze({
  source: 'KiTrix Vss_Temple01.obj / Fld_Temple01 remodel mesh',
  sourceBytes: 43_263_289,
  modelCenterLowY: 4.5,
  canonicalCenterLowY: 0,
  canonicalYOffset: -4.5,
  pdfToModelXZ: {
    scale: 0.964211,
    rotationDegrees: 26.1160,
    translateX: -0.0580,
    translateZ: -0.1329,
    trimmedOuterRmsMeters: 0.9570,
    outerP95Meters: 10.2420
  },
  localDropRegistration: {
    maxNearestExpectedDiscontinuityMeters: 0.163,
    teamAFirstDropPair: [6.0, 10.5] as const,
    teamBFirstDropPair: [6.0, 10.5] as const,
    teamARightDropPair: [7.5, 10.5] as const,
    teamBRightDropPair: [7.5, 10.5] as const
  },
  confidence: 'HIGH' as const,
  notes:
    'The global outer-boundary registration has larger nonlocal residuals, so XZ is not Freeze-promoted from this transform. The four local drop lips independently coincide with the expected Temple01 height-discontinuity pairs within 0.163m nearest-edge residual, and A/B symmetry reproduces the same model Y levels.'
});

const evidence = ['kitrix-temple01-obj-registered-2026-09-26'] as const;

export const UNDERTOW_TEMPLE01_METRIC_FEATURES:
  readonly UndertowTemple01MetricFeature[] = [
    {
      id: 'CENTER_LOW',
      modelY: 4.5,
      canonicalY: 0,
      confidence: 'HIGH',
      evidenceIds: evidence,
      notes:
        'The registered PDF center-low face lands on the Temple01 Turf FloorConcrete00 surface at model Y=4.5. Canonical center-low remains the existing Y=0 datum.'
    },
    {
      id: 'TEAM_A_SPAWN',
      modelY: 10.5,
      canonicalY: 6.0,
      confidence: 'HIGH',
      evidenceIds: evidence,
      notes:
        'Registered Team A spawn center and the upper side of both Team A drop lips resolve to the same 10.5m model terrace.'
    },
    {
      id: 'TEAM_B_SPAWN',
      modelY: 10.5,
      canonicalY: 6.0,
      confidence: 'HIGH',
      evidenceIds: evidence,
      notes:
        'Registered Team B spawn center and the counterpart upper drop sides resolve to the same 10.5m model terrace.'
    },
    {
      id: 'TEAM_A_FIRST_DROP_LANDING',
      modelY: 6.0,
      canonicalY: 1.5,
      confidence: 'HIGH',
      evidenceIds: evidence,
      notes:
        'The Team A first-drop polyline locally coincides with a 10.5->6.0m height discontinuity; the lower side is the one-way first-drop landing.'
    },
    {
      id: 'TEAM_B_FIRST_DROP_LANDING',
      modelY: 6.0,
      canonicalY: 1.5,
      confidence: 'HIGH',
      evidenceIds: evidence,
      notes:
        'The Team B counterpart locally reproduces the same 10.5->6.0m first-drop discontinuity.'
    },
    {
      id: 'RIGHT_SMALL_DROP_UPPER',
      modelY: 10.5,
      canonicalY: 6.0,
      confidence: 'HIGH',
      evidenceIds: evidence,
      notes:
        'The upper side of the registered right-small-drop lip is on the same 10.5m model terrace as spawn.'
    },
    {
      id: 'RIGHT_LOW',
      modelY: 7.5,
      canonicalY: 3.0,
      confidence: 'HIGH',
      evidenceIds: evidence,
      notes:
        'The lower side of the registered right-small-drop lip resolves to model Y=7.5, matching the user observation that the blue-line lower floor sits above the red-line lower floor.'
    }
  ];

export const UNDERTOW_TEMPLE01_DROP_RELATIONS = Object.freeze({
  firstDropMeters: -4.5,
  rightSmallDropMeters: -3.0,
  firstDropLandingToRightLowMeters: 1.5,
  spawnToRightSmallDropUpperMeters: 0
});

export function undertowTemple01MetricFeature(
  id: UndertowTemple01MetricFeatureId
): UndertowTemple01MetricFeature {
  const found = UNDERTOW_TEMPLE01_METRIC_FEATURES.find((item) => item.id === id);
  if (!found) throw new Error(`Missing Temple01 metric feature: ${id}`);
  return found;
}

export function undertowTemple01MetricAuditErrors(): readonly string[] {
  const errors: string[] = [];
  const byId = new Map(
    UNDERTOW_TEMPLE01_METRIC_FEATURES.map((item) => [item.id, item])
  );

  const center = byId.get('CENTER_LOW');
  if (center?.modelY + UNDERTOW_TEMPLE01_METRIC_REGISTRATION.canonicalYOffset !== 0) {
    errors.push('Temple01 center-low datum must resolve to canonical Y=0');
  }

  for (const id of ['TEAM_A_SPAWN','TEAM_B_SPAWN'] as const) {
    if (byId.get(id)?.canonicalY !== 6) {
      errors.push(`${id} must resolve to canonical Y=6 at HIGH confidence`);
    }
  }
  for (const id of ['TEAM_A_FIRST_DROP_LANDING','TEAM_B_FIRST_DROP_LANDING'] as const) {
    if (byId.get(id)?.canonicalY !== 1.5) {
      errors.push(`${id} must resolve to canonical Y=1.5 at HIGH confidence`);
    }
  }

  if (byId.get('RIGHT_LOW')?.canonicalY !== 3) {
    errors.push('RIGHT_LOW must resolve to canonical Y=3 at HIGH confidence');
  }
  if (UNDERTOW_TEMPLE01_DROP_RELATIONS.firstDropMeters !== -4.5) {
    errors.push('Temple01 first-drop delta must remain -4.5m');
  }
  if (UNDERTOW_TEMPLE01_DROP_RELATIONS.rightSmallDropMeters !== -3) {
    errors.push('Temple01 right-small-drop delta must remain -3m');
  }
  if (
    UNDERTOW_TEMPLE01_METRIC_REGISTRATION.localDropRegistration
      .maxNearestExpectedDiscontinuityMeters > 0.2
  ) {
    errors.push('local drop registration residual exceeded 0.2m audit limit');
  }

  return errors;
}
