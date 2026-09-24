import type {
  StageMeasurementEntry,
  StageMeasurementLedger,
  StageRuleFact
} from '../measurement/StageMeasurementLedger';
import {
  UNDERTOW_TURF_MAP_ORIGIN_PIXEL,
  UNDERTOW_TURF_RULE_MAP_SOURCE
} from './UndertowSpillwayMapCalibration';
import {
  UNDERTOW_VECTOR_BLUEPRINT_AUDIT,
  UNDERTOW_VECTOR_BLUEPRINT_SOURCE,
  UNDERTOW_VECTOR_TRACES
} from './UndertowSpillwayVectorBlueprint';

const ALL_RULES = ['TURF', 'ZONES', 'TOWER', 'RAINMAKER', 'CLAMS'] as const;
const handoff = ['handoff-t21-masterplan'] as const;
const maps = ['user-five-rule-maps', 'web-post-7-2-overhead'] as const;
const centerEvidence = ['user-center-stills', 'user-center-videos', 'web-post-7-2-gameplay'] as const;
const firstDropEvidence = [
  'user-first-drop-video',
  'user-turf-vector-blueprint',
  'handoff-t21-masterplan'
] as const;

const unresolvedXz = (notes: string) => ({
  kind: 'UNRESOLVED' as const,
  confidence: 'UNKNOWN' as const,
  evidenceIds: [] as const,
  notes
});

const unknownY = (notes: string) => ({
  confidence: 'UNKNOWN' as const,
  evidenceIds: [] as const,
  notes
});

const noTransition = {
  kind: 'NONE' as const,
  confidence: 'CONFIRMED' as const,
  evidenceIds: handoff
};

const commonSurfaceEntry = (
  entry: Omit<StageMeasurementEntry, 'appliesTo'>
): StageMeasurementEntry => ({
  ...entry,
  appliesTo: ALL_RULES
});

const entries: readonly StageMeasurementEntry[] = [
  commonSurfaceEntry({
    id: 'center-lower-floor',
    feature: 'central lowest reference floor',
    region: 'Center',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('T21-B will derive the metric polygon from the Turf map.'),
    y: {
      floorId: 'CENTER_LOW_0',
      yMeters: 0,
      confidence: 'CONFIRMED',
      evidenceIds: handoff
    },
    transition: noTransition,
    surface: {
      semantics: ['PAINTABLE'],
      confidence: 'CONFIRMED',
      evidenceIds: handoff
    }
  }),
  commonSurfaceEntry({
    id: 'center-small-step',
    feature: 'central small step',
    region: 'Center',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Family summary only; exact A/B small-drop hard edges are recorded in dedicated entries below.'),
    y: {
      deltaMeters: 1.5,
      confidence: 'HIGH',
      evidenceIds: handoff
    },
    transition: {
      kind: 'STEP',
      deltaYMeters: 1.5,
      confidence: 'HIGH',
      evidenceIds: handoff
    },
    surface: {
      semantics: ['PAINTABLE'],
      confidence: 'HIGH',
      evidenceIds: centerEvidence
    }
  }),
  commonSurfaceEntry({
    id: 'right-small-drop',
    feature: 'right-side small drop',
    region: 'Center / Right',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Footprint remains for T21-B.'),
    y: {
      deltaMeters: -1.5,
      confidence: 'HIGH',
      evidenceIds: handoff
    },
    transition: {
      kind: 'DROP',
      deltaYMeters: -1.5,
      confidence: 'HIGH',
      evidenceIds: handoff
    },
    surface: {
      semantics: ['PAINTABLE'],
      confidence: 'HIGH',
      evidenceIds: centerEvidence
    }
  }),
  commonSurfaceEntry({
    id: 'team-a-right-small-drop',
    feature: 'Team A-side right small drop after first-drop open area',
    region: 'Team A Spawn / Right',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'web-post-7-2-gameplay', 'handoff-t21-masterplan'],
    xz: {
      kind: 'POLYLINE',
      polylineMeters: UNDERTOW_VECTOR_TRACES.teamARightSmallDropLip.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'web-post-7-2-gameplay'],
      notes: 'Exact L-shaped second drop edge following the first-drop open area.'
    },
    y: {
      deltaMeters: -1.5,
      confidence: 'HIGH',
      evidenceIds: handoff
    },
    transition: {
      kind: 'DROP',
      deltaYMeters: -1.5,
      confidence: 'HIGH',
      evidenceIds: handoff
    },
    surface: {
      semantics: ['PAINTABLE'],
      confidence: 'HIGH',
      evidenceIds: centerEvidence
    }
  }),
  commonSurfaceEntry({
    id: 'team-b-right-small-drop',
    feature: 'Team B-side right small drop after first-drop open area',
    region: 'Team B Spawn / Right',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'web-post-7-2-gameplay', 'handoff-t21-masterplan'],
    xz: {
      kind: 'POLYLINE',
      polylineMeters: UNDERTOW_VECTOR_TRACES.teamBRightSmallDropLip.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'web-post-7-2-gameplay'],
      notes: '180-degree counterpart of the Team A second drop edge.'
    },
    y: {
      deltaMeters: -1.5,
      confidence: 'HIGH',
      evidenceIds: handoff
    },
    transition: {
      kind: 'DROP',
      deltaYMeters: -1.5,
      confidence: 'HIGH',
      evidenceIds: handoff
    },
    surface: {
      semantics: ['PAINTABLE'],
      confidence: 'HIGH',
      evidenceIds: centerEvidence
    }
  }),
  commonSurfaceEntry({
    id: 'upper-glass-platform',
    feature: 'upper glass gameplay platform',
    region: 'Upper Glass',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Family summary only; exact A/B overhang polygons are recorded in dedicated entries below.'),
    y: {
      deltaMeters: 3,
      confidence: 'HIGH',
      evidenceIds: handoff,
      notes: 'Difference between the glass top and the major floor directly below.'
    },
    transition: noTransition,
    surface: {
      semantics: ['UNINKABLE', 'GLASS'],
      confidence: 'CONFIRMED',
      evidenceIds: handoff
    },
    notes: 'Render, collision, projectile blocking, passage underneath, and paintability must stay separable.'
  }),
  commonSurfaceEntry({
    id: 'team-a-upper-glass-overhang',
    feature: 'Team A-side central glass overhang',
    region: 'Upper Glass',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos', 'handoff-t21-masterplan'],
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.positiveZGlassOverhang.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos'],
      notes: 'Exact gray vector face matched to the current glass overhang. Its internal dash field proves that part of the overhang is slope-marked.'
    },
    y: {
      deltaMeters: 3,
      confidence: 'HIGH',
      evidenceIds: handoff,
      notes: 'Top-to-major-floor-below relationship only; do not assign a single flat Y to the entire slope-marked glass face.'
    },
    transition: {
      kind: 'SLOPE',
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint'],
      notes: 'Slope marker exists within the glass footprint; exact start/end Y still belongs to T21-C.'
    },
    surface: {
      semantics: ['UNINKABLE', 'GLASS'],
      confidence: 'CONFIRMED',
      evidenceIds: ['user-turf-vector-blueprint', 'handoff-t21-masterplan']
    },
    notes: 'Render/collision/projectile blocking/underpass remain separate runtime concerns.'
  }),
  commonSurfaceEntry({
    id: 'team-b-upper-glass-overhang',
    feature: 'Team B-side central glass overhang',
    region: 'Upper Glass',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos', 'handoff-t21-masterplan'],
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.negativeZGlassOverhang.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos'],
      notes: 'Exact 180-degree counterpart gray vector face matched to the current glass overhang.'
    },
    y: {
      deltaMeters: 3,
      confidence: 'HIGH',
      evidenceIds: handoff,
      notes: 'Top-to-major-floor-below relationship only; absolute and slope endpoint Y remain unresolved.'
    },
    transition: {
      kind: 'SLOPE',
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint'],
      notes: 'Slope marker exists within the glass footprint; exact start/end Y still belongs to T21-C.'
    },
    surface: {
      semantics: ['UNINKABLE', 'GLASS'],
      confidence: 'CONFIRMED',
      evidenceIds: ['user-turf-vector-blueprint', 'handoff-t21-masterplan']
    }
  }),
  commonSurfaceEntry({
    id: 'upper-glass-underpass',
    feature: 'passage underneath the glass platform',
    region: 'Lower Tunnels',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('T21-B must preserve the actual passage width and sightline.'),
    y: unknownY('Absolute floor height remains for T21-C.'),
    transition: noTransition,
    surface: {
      semantics: [],
      confidence: 'UNKNOWN',
      evidenceIds: [],
      notes: 'Do not infer paintability until the source footprint is bound.'
    }
  }),
  commonSurfaceEntry({
    id: 'center-left-slope',
    feature: 'left central slope',
    region: 'Center / Left',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Slope footprint and grade remain for T21-B/C.'),
    y: unknownY('Start/end Y remain unresolved.'),
    transition: {
      kind: 'SLOPE',
      confidence: 'CONFIRMED',
      evidenceIds: centerEvidence
    },
    surface: {
      semantics: [],
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  }),
  commonSurfaceEntry({
    id: 'center-right-slope',
    feature: 'right central slope',
    region: 'Center / Right',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Slope footprint and grade remain for T21-B/C.'),
    y: unknownY('Start/end Y remain unresolved.'),
    transition: {
      kind: 'SLOPE',
      confidence: 'CONFIRMED',
      evidenceIds: centerEvidence
    },
    surface: {
      semantics: [],
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  }),
  commonSurfaceEntry({
    id: 'right-low-floor',
    feature: 'right-side low area',
    region: 'Center / Right',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Metric polygon remains for T21-B.'),
    y: unknownY('Do not assume this floor is exactly Y=0 before T21-C.'),
    transition: noTransition,
    surface: {
      semantics: ['PAINTABLE'],
      confidence: 'HIGH',
      evidenceIds: centerEvidence
    }
  }),
  commonSurfaceEntry({
    id: 'team-a-first-drop',
    feature: 'Team A spawn-side first descent',
    region: 'Team A Spawn',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: firstDropEvidence,
    xz: {
      kind: 'POLYLINE',
      polylineMeters: UNDERTOW_VECTOR_TRACES.teamAFirstDropLip.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-first-drop-video'],
      notes: 'Vector-PDF hard edge measured exactly in plan; the video confirms one-way traversal semantics.'
    },
    y: {
      candidatesMeters: [1.5, 3],
      confidence: 'PROVISIONAL',
      evidenceIds: handoff,
      notes: 'Candidate drop magnitudes only; no exact value is frozen.'
    },
    transition: {
      kind: 'ONE_WAY_DROP',
      candidatesMeters: [1.5, 3],
      confidence: 'CONFIRMED',
      evidenceIds: firstDropEvidence,
      notes: 'No slope, stairs, bidirectional nav connection, or invisible CPU ramp.'
    },
    surface: {
      semantics: ['ONE_WAY_DROP'],
      confidence: 'CONFIRMED',
      evidenceIds: firstDropEvidence
    }
  }),
  commonSurfaceEntry({
    id: 'team-b-first-drop',
    feature: 'Team B spawn-side first descent',
    region: 'Team B Spawn',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: firstDropEvidence,
    xz: {
      kind: 'POLYLINE',
      polylineMeters: UNDERTOW_VECTOR_TRACES.teamBFirstDropLip.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-first-drop-video'],
      notes: 'Vector-PDF 180-degree counterpart of the Team A first-drop lip.'
    },
    y: {
      candidatesMeters: [1.5, 3],
      confidence: 'PROVISIONAL',
      evidenceIds: handoff,
      notes: 'Candidate drop magnitudes only; no exact value is frozen.'
    },
    transition: {
      kind: 'ONE_WAY_DROP',
      candidatesMeters: [1.5, 3],
      confidence: 'CONFIRMED',
      evidenceIds: firstDropEvidence,
      notes: 'Must be traversed by CPU using one-way traversal support rather than hidden geometry.'
    },
    surface: {
      semantics: ['ONE_WAY_DROP'],
      confidence: 'CONFIRMED',
      evidenceIds: firstDropEvidence
    }
  }),
  commonSurfaceEntry({
    id: 'raised-high-platform',
    feature: 'raised/high platform family',
    region: 'Upper Glass / side high ground',
    featureKind: 'SURFACE',
    confidence: 'HIGH',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Specific platform footprints remain for T21-B.'),
    y: {
      yMeters: 4.5,
      confidence: 'PROVISIONAL',
      evidenceIds: handoff,
      notes: 'Candidate relative to central low reference; not Freeze-safe yet.'
    },
    transition: noTransition,
    surface: {
      semantics: ['PAINTABLE'],
      confidence: 'HIGH',
      evidenceIds: centerEvidence
    }
  }),
  commonSurfaceEntry({
    id: 'team-a-spawn-floor',
    feature: 'Team A spawn absolute floor height',
    region: 'Team A Spawn',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: maps,
    xz: {
      kind: 'POINT',
      pointMeters: UNDERTOW_VECTOR_TRACES.positiveZSpawnCenter.metricPoints[0]!,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-five-rule-maps'],
      notes: 'Vector spawn-ring center only. Full spawn-floor polygon remains unresolved.'
    },
    y: unknownY('Historical 7.5m hypothesis is intentionally not promoted to canonical.'),
    transition: noTransition,
    surface: {
      semantics: [],
      confidence: 'UNKNOWN',
      evidenceIds: [],
      notes: 'Spawn paintability/protection semantics remain for source binding.'
    }
  }),
  commonSurfaceEntry({
    id: 'team-b-spawn-floor',
    feature: 'Team B spawn absolute floor height',
    region: 'Team B Spawn',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: maps,
    xz: {
      kind: 'POINT',
      pointMeters: UNDERTOW_VECTOR_TRACES.negativeZSpawnCenter.metricPoints[0]!,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-five-rule-maps'],
      notes: 'Vector spawn-ring center only. Full spawn-floor polygon remains unresolved.'
    },
    y: unknownY('Absolute Y remains unresolved.'),
    transition: noTransition,
    surface: {
      semantics: [],
      confidence: 'UNKNOWN',
      evidenceIds: [],
      notes: 'Spawn paintability/protection semantics remain for source binding.'
    }
  }),
  commonSurfaceEntry({
    id: 'center-pillars',
    feature: 'central pillar set',
    region: 'Center',
    featureKind: 'OBJECT',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Count and exact footprint binding remain for T21-B.'),
    y: unknownY('Object extents remain for T21-C/D.'),
    transition: noTransition,
    surface: {
      semantics: [],
      confidence: 'UNKNOWN',
      evidenceIds: [],
      notes: 'Do not classify the pillars as decoration-only; paintability is unresolved while collision/line-of-sight evidence is preserved.'
    }
  }),
  commonSurfaceEntry({
    id: 'center-sponge',
    feature: 'central sponge gameplay object',
    region: 'Center',
    featureKind: 'OBJECT',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Exact placement remains for T21-B.'),
    y: unknownY('Object extents remain for T21-C/D.'),
    transition: noTransition,
    surface: {
      semantics: [],
      confidence: 'UNKNOWN',
      evidenceIds: [],
      notes: 'Sponge gameplay behavior is an object concern, not inferred from static material.'
    }
  }),
  commonSurfaceEntry({
    id: 'negative-z-grate-mesh',
    feature: 'negative-Z traversable grate mesh',
    region: 'Center / Negative-Z side',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos', 'handoff-t21-masterplan'],
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.negativeZGrateMesh.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos'],
      notes: 'Exact white mesh-pattern plan footprint from the vector source.'
    },
    y: unknownY('Absolute grate elevation remains for T21-C.'),
    transition: noTransition,
    surface: {
      semantics: ['GRATE', 'UNINKABLE'],
      confidence: 'CONFIRMED',
      evidenceIds: ['user-turf-vector-blueprint', 'handoff-t21-masterplan']
    },
    notes: 'White source mesh carries no WATER semantic; water/submerge areas remain separate polygons.'
  }),
  commonSurfaceEntry({
    id: 'positive-z-grate-mesh',
    feature: 'positive-Z traversable grate mesh',
    region: 'Center / Positive-Z side',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos', 'handoff-t21-masterplan'],
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.positiveZGrateMesh.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos'],
      notes: 'Exact 180-degree counterpart grate footprint.'
    },
    y: unknownY('Absolute grate elevation remains for T21-C.'),
    transition: noTransition,
    surface: {
      semantics: ['GRATE', 'UNINKABLE'],
      confidence: 'CONFIRMED',
      evidenceIds: ['user-turf-vector-blueprint', 'handoff-t21-masterplan']
    }
  }),
  commonSurfaceEntry({
    id: 'center-grate',
    feature: 'central grate / mesh walkway',
    region: 'Center',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Family summary only; exact negative-Z / positive-Z grate polygons are recorded in dedicated entries.'),
    y: unknownY('Absolute Y remains for T21-C.'),
    transition: noTransition,
    surface: {
      semantics: ['GRATE', 'UNINKABLE'],
      confidence: 'CONFIRMED',
      evidenceIds: handoff
    }
  }),
  commonSurfaceEntry({
    id: 'team-a-water-region',
    feature: 'Team A-side mapped water hazard',
    region: 'Team A Spawn / Outer Environment',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint'],
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.teamAWaterRegion.metricPoints,
      confidence: 'CONFIRMED',
      evidenceIds: ['user-turf-vector-blueprint'],
      notes: 'Exact cyan-fill polygon extracted from the vector PDF.'
    },
    y: unknownY('Water visual plane and kill threshold remain for T21-C/D.'),
    transition: noTransition,
    surface: {
      semantics: ['WATER', 'KILL', 'UNINKABLE'],
      confidence: 'CONFIRMED',
      evidenceIds: ['user-turf-vector-blueprint']
    }
  }),
  commonSurfaceEntry({
    id: 'team-b-water-region',
    feature: 'Team B-side mapped water hazard',
    region: 'Team B Spawn / Outer Environment',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint'],
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.teamBWaterRegion.metricPoints,
      confidence: 'CONFIRMED',
      evidenceIds: ['user-turf-vector-blueprint'],
      notes: 'Exact 180-degree counterpart cyan-fill polygon extracted from the vector PDF.'
    },
    y: unknownY('Water visual plane and kill threshold remain for T21-C/D.'),
    transition: noTransition,
    surface: {
      semantics: ['WATER', 'KILL', 'UNINKABLE'],
      confidence: 'CONFIRMED',
      evidenceIds: ['user-turf-vector-blueprint']
    }
  }),
  commonSurfaceEntry({
    id: 'water-kill-regions',
    feature: 'water / fall-out regions',
    region: 'Outer Environment',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Mapped cyan water polygons are now exact; the broader fall-out/void kill boundary remains unresolved.'),
    y: unknownY('Water visual level and kill threshold remain for T21-C/D.'),
    transition: noTransition,
    surface: {
      semantics: ['WATER', 'KILL', 'UNINKABLE'],
      confidence: 'CONFIRMED',
      evidenceIds: handoff
    }
  })
];

const ruleFacts: readonly StageRuleFact[] = [
  {
    id: 'zones-two-objectives',
    rule: 'ZONES',
    statement: 'Undertow Spillway uses two Splat Zones.',
    values: { objectiveCount: 2 },
    confidence: 'CONFIRMED',
    evidenceIds: ['user-five-rule-maps', 'handoff-t21-masterplan']
  },
  {
    id: 'tower-route-shape',
    rule: 'TOWER',
    statement: 'Tower starts at center and follows the documented left -> straight -> right -> goal progression.',
    values: {
      cp1Start: 96,
      cp1End: 86,
      cp1Seconds: 5,
      cp2Start: 59,
      cp2End: 47,
      cp2Seconds: 6,
      cp3Start: 24,
      cp3End: 12,
      cp3Seconds: 6
    },
    confidence: 'HIGH',
    evidenceIds: ['user-five-rule-maps', 'handoff-t21-masterplan']
  },
  {
    id: 'tower-glass-variant',
    rule: 'TOWER',
    statement: 'A portion of the large central glass geometry is removed for Tower Control and must remain variant data.',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-five-rule-maps', 'handoff-t21-masterplan']
  },
  {
    id: 'rainmaker-two-routes',
    rule: 'RAINMAKER',
    statement: 'Rainmaker starts at center and has left/right routes; both documented checkpoints are at 60.',
    values: { leftCheckpoint: 60, rightCheckpoint: 60 },
    confidence: 'HIGH',
    evidenceIds: ['user-five-rule-maps', 'handoff-t21-masterplan']
  },
  {
    id: 'rainmaker-left-ramp',
    rule: 'RAINMAKER',
    statement: 'The left raised-area checkpoint has an access ramp specific to the Rainmaker route.',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-five-rule-maps', 'handoff-t21-masterplan']
  },
  {
    id: 'rainmaker-pedestal-first-drop',
    rule: 'RAINMAKER',
    statement: 'The Rainmaker pedestal/goal-side structure is associated with the first-drop area.',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-five-rule-maps', 'handoff-t21-masterplan']
  },
  {
    id: 'rainmaker-far-right-inkrail',
    rule: 'RAINMAKER',
    statement: 'The far-right route includes an Inkrail.',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-five-rule-maps', 'handoff-t21-masterplan']
  },
  {
    id: 'clams-basket-location',
    rule: 'CLAMS',
    statement: 'The basket is on the left side, two drops below spawn.',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-five-rule-maps', 'handoff-t21-masterplan']
  },
  {
    id: 'clams-return-ramp',
    rule: 'CLAMS',
    statement: 'An uninkable ramp behind the basket returns toward the platform.',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-five-rule-maps', 'handoff-t21-masterplan']
  }
];

export const UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER: StageMeasurementLedger = {
  stageId: 'undertow-spillway',
  displayName: 'Undertow Spillway / マテガイ放水路',
  sourceVersion: 'Splatoon 3 normal PvP, Ver.7.2.0+',
  commonTerrainId: 'UndertowCommon',
  coordinateSystem: {
    upAxis: 'Y',
    centerX: 0,
    centerZ: 0,
    centerLowestFloorY: 0,
    centerLowestFloorConfidence: 'CONFIRMED',
    symmetry: 'ROTATE_180',
    symmetryConfidence: 'HIGH'
  },
  evidence: [
    {
      id: 'handoff-t21-masterplan',
      kind: 'HANDOFF_CANONICAL',
      label: 'T21 canonical handoff / previous-chat research archive',
      sourceVersion: '2026-09-24'
    },
    {
      id: 'user-five-rule-maps',
      kind: 'USER_RULE_MAP',
      label: 'User-provided maps for Turf / Zones / Tower / Rainmaker / Clams',
      sourceVersion: 'Ver.7.2.0+ target'
    },
    {
      id: 'user-turf-vector-blueprint',
      kind: 'USER_RULE_MAP',
      label: 'User-provided Sunfish Undertow Spillway Turf vector PDF + matching 3508x2482 JPEG',
      sourceVersion: 'map updated 2024-05-06 / post-Ver.7.2.0 layout',
      notes: 'Primary T21-B planimetric source. PDF linework is vector CAD output; JPEG is used for visual cross-checking.'
    },
    {
      id: 'nintendo-7-2-changelog',
      kind: 'NINTENDO_CHANGELOG',
      label: 'Nintendo Ver.7.2.0 stage-change record for Undertow Spillway',
      sourceVersion: '7.2.0'
    },
    {
      id: 'web-post-7-2-overhead',
      kind: 'WEB_OVERHEAD',
      label: 'Post-Ver.7.2.0 normal-PvP overhead references',
      sourceVersion: 'Ver.7.2.0+'
    },
    {
      id: 'web-post-7-2-gameplay',
      kind: 'WEB_GAMEPLAY_REFERENCE',
      label: 'Post-Ver.7.2.0 gameplay/reference material',
      sourceVersion: 'Ver.7.2.0+'
    },
    {
      id: 'user-center-stills',
      kind: 'USER_CAPTURE',
      label: 'User in-game center-area stills (~14 images)',
      sourceVersion: 'current normal PvP'
    },
    {
      id: 'user-center-videos',
      kind: 'USER_CAPTURE',
      label: 'User in-game stage videos (six-video archive)',
      sourceVersion: 'current normal PvP'
    },
    {
      id: 'user-first-drop-video',
      kind: 'USER_CAPTURE',
      label: 'User first-drop confirmation video',
      sourceVersion: 'current normal PvP',
      notes: 'Confirms spawn-side first descent has no downhill route and is a one-way drop.'
    }
  ],
  assumptions: [
    {
      id: 'training-line-meters',
      value: 5,
      unit: 'm/line',
      confidence: 'HIGH',
      evidenceIds: handoff,
      notes: 'Project-meter normalization from the Splatoon 3 training-range distance lines.'
    },
    {
      id: 'map-pixels-per-meter',
      value: 20,
      unit: 'px/m',
      confidence: 'HIGH',
      evidenceIds: ['handoff-t21-masterplan', 'user-five-rule-maps'],
      notes: 'Working metric transform for T21-B; not an official Nintendo meter scale.'
    },
    {
      id: 'spawn-distance-meters',
      value: UNDERTOW_VECTOR_BLUEPRINT_AUDIT.spawnSeparationMeters,
      unit: 'm',
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-five-rule-maps'],
      notes: 'Refined from exact vector spawn-ring centers using the same HIGH project-meter calibration.'
    },
    {
      id: 'pdf-points-per-meter',
      value: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.pointsPerProjectMeter,
      unit: 'pt/m',
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint'],
      notes: '20 px/m at the 300-dpi horizontal JPEG export corresponds to 4.8 PDF points per project meter.'
    },
    {
      id: 'outer-span-x-meters',
      value: 87,
      unit: 'm',
      confidence: 'PROVISIONAL',
      evidenceIds: handoff,
      notes: 'Cross-stage span in the project X axis. Not Freeze-safe until T21-B polygon tracing.'
    },
    {
      id: 'outer-span-z-meters',
      value: 146,
      unit: 'm',
      confidence: 'PROVISIONAL',
      evidenceIds: handoff,
      notes: 'Spawn-axis span in the project Z axis. Not Freeze-safe until T21-B polygon tracing.'
    },
    {
      id: 'turf-rule-map-width-pixels',
      value: UNDERTOW_TURF_RULE_MAP_SOURCE.widthPixels,
      unit: 'px',
      confidence: 'HIGH',
      evidenceIds: ['user-five-rule-maps'],
      notes: 'Measured source image dimensions from the previous T21 map pass.'
    },
    {
      id: 'turf-rule-map-height-pixels',
      value: UNDERTOW_TURF_RULE_MAP_SOURCE.heightPixels,
      unit: 'px',
      confidence: 'HIGH',
      evidenceIds: ['user-five-rule-maps']
    },
    {
      id: 'turf-map-origin-pixel-x',
      value: UNDERTOW_TURF_MAP_ORIGIN_PIXEL[0],
      unit: 'px',
      confidence: 'HIGH',
      evidenceIds: ['user-five-rule-maps']
    },
    {
      id: 'turf-map-origin-pixel-y',
      value: UNDERTOW_TURF_MAP_ORIGIN_PIXEL[1],
      unit: 'px',
      confidence: 'HIGH',
      evidenceIds: ['user-five-rule-maps']
    },
    {
      id: 'vertical-grid-meters',
      value: 1.5,
      unit: 'm',
      confidence: 'HIGH',
      evidenceIds: handoff,
      notes: 'Primary-floor reconstruction grid; slopes remain continuous.'
    },
    {
      id: 'source-version-boundary',
      value: 'normal PvP Ver.7.2.0+',
      confidence: 'CONFIRMED',
      evidenceIds: ['nintendo-7-2-changelog', 'handoff-t21-masterplan'],
      notes: 'Pre-7.2, Big Run, and legacy Tricolor geometry must not enter UndertowCommon.'
    },
    {
      id: 'team-rotation-symmetry',
      value: 'ROTATE_180',
      confidence: 'HIGH',
      evidenceIds: ['user-five-rule-maps', 'web-post-7-2-overhead'],
      notes: 'T21-B must verify residuals numerically instead of assuming perfect symmetry.'
    }
  ],
  entries,
  ruleFacts
};
