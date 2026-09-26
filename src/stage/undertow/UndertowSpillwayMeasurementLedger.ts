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
import { UNDERTOW_CENTRAL_SLOPE_MARKERS } from './UndertowSpillwaySlopeMarkers';

const ALL_RULES = ['TURF', 'ZONES', 'TOWER', 'RAINMAKER', 'CLAMS'] as const;
const handoff = ['handoff-t21-masterplan'] as const;
const maps = ['user-five-rule-maps', 'web-post-7-2-overhead'] as const;
const centerEvidence = ['user-center-stills', 'user-center-videos', 'web-post-7-2-gameplay'] as const;
const firstDropEvidence = [
  'user-first-drop-video',
  'user-turf-vector-blueprint',
  'handoff-t21-masterplan'
] as const;
const remodelGeometryEvidence = [
  'extracted-temple01-geometry',
  'user-turf-vector-blueprint'
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
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.centerOriginFace.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos'],
      notes: 'Exact closed vector face containing project origin. Bound to the canonical central-low reference by current gameplay evidence.'
    },
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
    xz: unresolvedXz('Family summary only; exact negative-Z / positive-Z step strips are recorded in dedicated entries below.'),
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
    id: 'negative-z-center-small-step',
    feature: 'negative-Z central small-step strip',
    region: 'Center',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos', 'handoff-t21-masterplan'],
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.negativeZCenterStepStrip.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos'],
      notes: 'Exact 0.75m-deep source strip directly adjacent to the central-low face.'
    },
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
    id: 'positive-z-center-small-step',
    feature: 'positive-Z central small-step strip',
    region: 'Center',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos', 'handoff-t21-masterplan'],
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.positiveZCenterStepStrip.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos'],
      notes: '180-degree counterpart central small-step strip.'
    },
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
    feature: 'right-side small drop family',
    region: 'Spawn-side right route',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: centerEvidence,
    xz: unresolvedXz('Family summary only; exact A/B small-drop hard edges are recorded in dedicated entries below.'),
    y: {
      deltaMeters: -3,
      confidence: 'HIGH',
      evidenceIds: remodelGeometryEvidence
    },
    transition: {
      kind: 'DROP',
      deltaYMeters: -3,
      confidence: 'HIGH',
      evidenceIds: remodelGeometryEvidence
    },
    surface: {
      semantics: ['PAINTABLE'],
      confidence: 'HIGH',
      evidenceIds: centerEvidence
    }
  }),
  commonSurfaceEntry({
    id: 'team-a-right-small-drop',
    feature: 'Team A-side separate right small drop',
    region: 'Team A Spawn / Right',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'web-post-7-2-gameplay', 'handoff-t21-masterplan'],
    xz: {
      kind: 'POLYLINE',
      polylineMeters: UNDERTOW_VECTOR_TRACES.teamARightSmallDropLip.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'web-post-7-2-gameplay'],
      notes: 'Exact L-shaped right-side drop edge. Temple01 local registration proves it is a separate 10.5->7.5m model-Y discontinuity rather than the continuation of the red first-drop landing.'
    },
    y: {
      deltaMeters: -3,
      confidence: 'HIGH',
      evidenceIds: remodelGeometryEvidence
    },
    transition: {
      kind: 'DROP',
      deltaYMeters: -3,
      confidence: 'HIGH',
      evidenceIds: remodelGeometryEvidence
    },
    surface: {
      semantics: ['PAINTABLE'],
      confidence: 'HIGH',
      evidenceIds: centerEvidence
    }
  }),
  commonSurfaceEntry({
    id: 'team-b-right-small-drop',
    feature: 'Team B-side separate right small drop',
    region: 'Team B Spawn / Right',
    featureKind: 'TRANSITION',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'web-post-7-2-gameplay', 'handoff-t21-masterplan'],
    xz: {
      kind: 'POLYLINE',
      polylineMeters: UNDERTOW_VECTOR_TRACES.teamBRightSmallDropLip.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'web-post-7-2-gameplay'],
      notes: '180-degree counterpart of the Team A separate right-side drop edge.'
    },
    y: {
      deltaMeters: -3,
      confidence: 'HIGH',
      evidenceIds: remodelGeometryEvidence
    },
    transition: {
      kind: 'DROP',
      deltaYMeters: -3,
      confidence: 'HIGH',
      evidenceIds: remodelGeometryEvidence
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
    evidenceIds: [
      ...centerEvidence,
      'user-underpass-capture-2026-09-25',
      'user-right-low-capture-2026-09-25'
    ],
    xz: unresolvedXz('The 2026-09-25 capture confirms the passage and support/wall exclusions, but perspective video still does not define a map-registered simple walkable polygon.'),
    y: unknownY('Same-height relation to right-low is HIGH in the vertical constraint graph; absolute floor height remains unresolved.'),
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
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_CENTRAL_SLOPE_MARKERS.left.metricPolygon,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos'],
      notes: 'Exact dashed-hatch slope semantic footprint. This is a continuous slope region, not a hard-wall boundary.'
    },
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
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_CENTRAL_SLOPE_MARKERS.right.metricPolygon,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint', 'user-center-videos'],
      notes: 'Near-180-degree counterpart dashed-hatch slope semantic footprint. Start/end Y remain unresolved.'
    },
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
    evidenceIds: [
      ...centerEvidence,
      'user-right-low-capture-2026-09-25',
      'user-underpass-capture-2026-09-25'
    ],
    xz: unresolvedXz('The 2026-09-25 perimeter capture classifies the low/open floor and exits, but the constant-height partition still does not close uniquely in the top-down source.'),
    y: {
      floorId: 'RIGHT_LOW',
      yMeters: 3,
      confidence: 'HIGH',
      evidenceIds: ['extracted-temple01-geometry', 'user-right-low-capture-2026-09-25'],
      notes: 'Temple01 local registration resolves this lower-side floor to project Y=3.0m; the user capture independently binds the blue-lip destination to the right-low area.'
    },
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
      deltaMeters: -4.5,
      confidence: 'HIGH',
      evidenceIds: ['extracted-temple01-geometry', 'user-first-drop-video'],
      notes: 'Locally registered Temple01 geometry resolves the first-drop upper/lower surfaces to model Y=10.5/6.0m, a 4.5m descent.'
    },
    transition: {
      kind: 'ONE_WAY_DROP',
      deltaYMeters: -4.5,
      confidence: 'CONFIRMED',
      evidenceIds: ['extracted-temple01-geometry', ...firstDropEvidence],
      notes: 'One-way semantics come from gameplay; the exact 4.5m magnitude is supplied by locally verified remodeled geometry. No slope, stairs, bidirectional nav connection, or invisible CPU ramp.'
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
      deltaMeters: -4.5,
      confidence: 'HIGH',
      evidenceIds: ['extracted-temple01-geometry', 'user-first-drop-video'],
      notes: '180-degree counterpart resolves to the same 10.5->6.0m model-Y descent.'
    },
    transition: {
      kind: 'ONE_WAY_DROP',
      deltaYMeters: -4.5,
      confidence: 'CONFIRMED',
      evidenceIds: ['extracted-temple01-geometry', ...firstDropEvidence],
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
      notes: 'Vector spawn-ring center for the absolute-Y node. The surrounding connected spawn terrain is recorded separately and must not be flattened.'
    },
    y: {
      floorId: 'TEAM_A_SPAWN',
      yMeters: 6,
      confidence: 'HIGH',
      evidenceIds: ['extracted-temple01-geometry'],
      notes: 'Temple01 spawn-center sample is model Y=10.5m; normalized against the registered center reference model Y=4.5m -> canonical center Y=0.'
    },
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
      notes: 'Vector spawn-ring center for the absolute-Y node. The surrounding connected spawn terrain is recorded separately and must not be flattened.'
    },
    y: {
      floorId: 'TEAM_B_SPAWN',
      yMeters: 6,
      confidence: 'HIGH',
      evidenceIds: ['extracted-temple01-geometry'],
      notes: '180-degree counterpart spawn center resolves to the same normalized Y=6.0m.'
    },
    transition: noTransition,
    surface: {
      semantics: [],
      confidence: 'UNKNOWN',
      evidenceIds: [],
      notes: 'Spawn paintability/protection semantics remain for source binding.'
    }
  }),
  commonSurfaceEntry({
    id: 'team-a-spawn-terrain-region',
    feature: 'Team A spawn-side connected terrain region',
    region: 'Team A Spawn',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'web-post-7-2-gameplay', 'user-five-rule-maps'],
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.positiveZSpawnSideWhiteFace.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint'],
      notes: 'Exact connected white source face containing the Team A spawn ring. It contains multiple elevations/transitions and MUST NOT be flattened to one Y.'
    },
    y: unknownY('This connected terrain region spans multiple elevations; spawn-ring absolute Y remains a separate T21-C node.'),
    transition: noTransition,
    surface: {
      semantics: [],
      confidence: 'UNKNOWN',
      evidenceIds: [],
      notes: 'Per-subregion paintability/transition semantics remain attached to dedicated entries.'
    },
    notes: 'Used as the spawn-side XZ terrain envelope, not as one flat floor.'
  }),
  commonSurfaceEntry({
    id: 'team-b-spawn-terrain-region',
    feature: 'Team B spawn-side connected terrain region',
    region: 'Team B Spawn',
    featureKind: 'SURFACE',
    confidence: 'CONFIRMED',
    evidenceIds: ['user-turf-vector-blueprint', 'web-post-7-2-gameplay', 'user-five-rule-maps'],
    xz: {
      kind: 'POLYGON',
      polygonMeters: UNDERTOW_VECTOR_TRACES.negativeZSpawnSideWhiteFace.metricPoints,
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint'],
      notes: 'Exact 180-degree counterpart connected white source face containing the Team B spawn ring. It is not a single-elevation floor.'
    },
    y: unknownY('This connected terrain region spans multiple elevations; spawn-ring absolute Y remains unresolved separately.'),
    transition: noTransition,
    surface: {
      semantics: [],
      confidence: 'UNKNOWN',
      evidenceIds: [],
      notes: 'Per-subregion paintability/transition semantics remain attached to dedicated entries.'
    },
    notes: 'Used as the spawn-side XZ terrain envelope, not as one flat floor.'
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
      id: 'extracted-temple01-geometry',
      kind: 'EXTRACTED_GAME_GEOMETRY',
      label: 'KiTrix BFRES-derived Vss_Temple01 OBJ audited against the user vector blueprint',
      sourceVersion: 'Fld_Temple01 / remodeled Ver.7.2.0+ model family',
      notes: 'Git LFS object sha256:a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046, 43,263,289 bytes. Only locally verified drop-lip registration and normalized Y relationships are promoted at HIGH confidence.'
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
    },
    {
      id: 'user-underpass-capture-2026-09-25',
      kind: 'USER_CAPTURE',
      label: 'User targeted underpass traversal capture, 2026-09-25',
      sourceVersion: 'current normal PvP',
      notes: '29.63s continuous traversal. Confirms walkable covered passage, solid support/wall exclusions, and a step-free connection to the adjacent low/open floor.'
    },
    {
      id: 'user-right-low-capture-2026-09-25',
      kind: 'USER_CAPTURE',
      label: 'User targeted right-low perimeter capture, 2026-09-25',
      sourceVersion: 'current normal PvP',
      notes: '29.50s perimeter traversal. Confirms the small drop enters the right-low open floor, at least one ramp exits it, and the underpass connection is same-height.'
    },
    {
      id: 'user-first-drop-height-stills-2026-09-26',
      kind: 'USER_CAPTURE',
      label: 'User corrective first-drop / right-small-drop height still pair, 2026-09-26',
      sourceVersion: 'current normal PvP',
      notes: 'IMG_6112.jpeg + IMG_6111.jpeg. Direct user observation establishes that the floor referred to as below the red guide line is lower than the floor referred to as below the blue guide line. The guide did not independently register those visible floors to canonical floor nodes, so this evidence is line-side ordering only and promotes no floor identity or exact delta.'
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
      value: UNDERTOW_VECTOR_BLUEPRINT_AUDIT.outerSpanXMeters,
      unit: 'm',
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint'],
      notes: 'Full outer hard-silhouette span in project X from the recovered vector source; still not an official Nintendo real-world meter dimension.'
    },
    {
      id: 'outer-span-z-meters',
      value: UNDERTOW_VECTOR_BLUEPRINT_AUDIT.outerSpanZMeters,
      unit: 'm',
      confidence: 'HIGH',
      evidenceIds: ['user-turf-vector-blueprint'],
      notes: 'Full outer hard-silhouette span in project Z from the recovered vector source; still not an official Nintendo real-world meter dimension.'
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
