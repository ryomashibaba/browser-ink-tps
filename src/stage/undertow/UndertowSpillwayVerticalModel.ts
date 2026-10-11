import type {
  VerticalNode,
  VerticalRelation
} from '../measurement/VerticalConstraintGraph';
import { exactRelation } from '../measurement/VerticalConstraintGraph';
import { UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT } from './UndertowSpillwayRemodelGeometryAudit';

const handoff = ['handoff-t21-masterplan'] as const;
const center = ['user-center-stills', 'user-center-videos', 'web-post-7-2-gameplay'] as const;
const firstDrop = ['user-first-drop-video', 'handoff-t21-masterplan'] as const;
const remodelGeometry = ['extracted-temple01-geometry', 'user-turf-vector-blueprint'] as const;
export const UNDERTOW_VERTICAL_NODES: readonly VerticalNode[] = [
  {
    id: 'center-low-floor',
    absolute: {
      floorId: 'CENTER_LOW_0',
      yMeters: 0,
      confidence: 'CONFIRMED',
      evidenceIds: handoff
    }
  },
  {
    id: 'center-small-step-top',
    absolute: {
      floorId: 'CENTER_STEP_1',
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'right-low-floor',
    absolute: {
      floorId: 'RIGHT_LOW',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.rightLow,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: 'Locally registered remodeled Temple01 blue-drop lower side.'
    }
  },
  {
    id: 'right-small-drop-upper',
    absolute: {
      floorId: 'RIGHT_DROP_UPPER',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.rightSmallDropUpper,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: 'Registered blue-drop upper side shares model Y=10.5m with the spawn-side upper floor.'
    }
  },
  {
    id: 'glass-lower-major-floor',
    absolute: {
      floorId: 'GLASS_LOWER',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.glassUnderpassFloor,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: 'Temple01 local glass-underpass extraction resolves the roofed walkable floor to model Y=3.0m / project Y=0. Capture footage confirms traversal but is not used as a metric Y measurement.'
    }
  },
  {
    id: 'glass-overhang-high-reference',
    absolute: {
      floorId: 'GLASS_HIGH_REFERENCE',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.glassOverhangHighReference,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: 'Temple01 Glass01/BridgeMetal reaches model Y=10.5m / project Y=7.5m. This is a reference endpoint only: the vector source contains slope markers inside the glass footprint, so it is not a single flat platform Y.'
    }
  },
  {
    id: 'center-left-slope-low',
    absolute: {
      floorId: 'CENTER_LEFT_SLOPE_LOW',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.centerSlopeLow,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: 'Temple01 common FloorSlope00 lower endpoint: model Y=1.5m -> project Y=-1.5m.'
    }
  },
  {
    id: 'center-left-slope-high',
    absolute: {
      floorId: 'CENTER_LEFT_SLOPE_HIGH',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.centerSlopeHigh,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: 'Temple01 common FloorSlope00 high endpoint: model Y=3.0m -> project Y=0.'
    }
  },
  {
    id: 'center-right-slope-low',
    absolute: {
      floorId: 'CENTER_RIGHT_SLOPE_LOW',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.centerSlopeLow,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry
    }
  },
  {
    id: 'center-right-slope-high',
    absolute: {
      floorId: 'CENTER_RIGHT_SLOPE_HIGH',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.centerSlopeHigh,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry
    }
  },
  {
    id: 'negative-z-grate-floor',
    absolute: {
      floorId: 'NEGATIVE_Z_GRATE',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.grateVisualTop,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: 'Registered Temple01 FloorFence00 visual top is model Y=10.4m -> project Y=7.4m. This is BLOCKOUT geometry evidence, not a Stable-Freeze collision-plane claim.'
    }
  },
  {
    id: 'positive-z-grate-floor',
    absolute: {
      floorId: 'POSITIVE_Z_GRATE',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.grateVisualTop,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: '180-degree counterpart visual grate top; same HIGH-only caveat as negative-Z grate.'
    }
  },
  {
    id: 'team-a-spawn-floor',
    absolute: {
      floorId: 'TEAM_A_SPAWN',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.spawnFloor,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: 'Temple01 spawn-center model Y=10.5m normalized against model center-low Y=3.0m -> project Y=7.5m. The former 7.5m hypothesis is now supported at HIGH confidence by the remodel mesh.'
    }
  },
  {
    id: 'team-b-spawn-floor',
    absolute: {
      floorId: 'TEAM_B_SPAWN',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.spawnFloor,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry
    }
  },
  {
    id: 'team-a-first-drop-landing',
    absolute: {
      floorId: 'TEAM_A_FIRST_DROP',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.firstDropLanding,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: 'Registered red-drop lower side: model Y=6.0m -> project Y=3.0m after the corrected center-low normalization.'
    }
  },
  {
    id: 'team-b-first-drop-landing',
    absolute: {
      floorId: 'TEAM_B_FIRST_DROP',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.firstDropLanding,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry
    }
  }
];

export const UNDERTOW_VERTICAL_RELATIONS: readonly VerticalRelation[] = [
  exactRelation(
    'center-low-floor',
    'center-small-step-top',
    1.5,
    'HIGH',
    handoff,
    'Central small-step delta from the center-low reference.'
  ),
  exactRelation(
    'right-low-floor',
    'right-small-drop-upper',
    3,
    'HIGH',
    remodelGeometry,
    'Locally registered Temple01 geometry resolves the blue/right small drop as 7.5->10.5m model Y, i.e. +3.0m from lower to upper.'
  ),
  exactRelation(
    'right-low-floor',
    'glass-lower-major-floor',
    UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.deltas.rightLowToGlassUnderpassMeters,
    'HIGH',
    remodelGeometry,
    'Temple01 local geometry resolves right-low model Y=7.5m and the roofed glass-underpass floor model Y=3.0m. The captures establish traversable route continuity only, not equal physical Y.'
  ),
  exactRelation(
    'glass-lower-major-floor',
    'glass-overhang-high-reference',
    UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.deltas.glassUnderpassToHighReferenceMeters,
    'HIGH',
    remodelGeometry,
    'Temple01 local geometry resolves the underpass floor at model Y=3.0m and the Glass01/BridgeMetal high reference at model Y=10.5m. The high reference remains an endpoint, not a flat glass-plane Y.'
  ),
  exactRelation(
    'center-left-slope-low',
    'center-left-slope-high',
    1.5,
    'HIGH',
    remodelGeometry,
    'Temple01 common FloorSlope00 spans model Y=1.5->3.0m inside the registered left slope footprint.'
  ),
  exactRelation(
    'center-right-slope-low',
    'center-right-slope-high',
    1.5,
    'HIGH',
    remodelGeometry,
    '180-degree counterpart Temple01 slope span.'
  ),
  exactRelation(
    'center-low-floor',
    'center-left-slope-high',
    0,
    'HIGH',
    remodelGeometry,
    'Corrected center datum: the high end of the registered left central slope is model Y=3.0m, the same model elevation as canonical center-low.'
  ),
  exactRelation(
    'center-low-floor',
    'center-right-slope-high',
    0,
    'HIGH',
    remodelGeometry,
    'Corrected counterpart center datum relation.'
  ),
  exactRelation(
    'center-left-slope-low',
    'center-right-slope-low',
    0,
    'HIGH',
    center,
    '180-degree counterpart slope low endpoints share elevation once either side is resolved.'
  ),
  exactRelation(
    'center-left-slope-high',
    'center-right-slope-high',
    0,
    'HIGH',
    center,
    '180-degree counterpart slope high endpoints share elevation once either side is resolved.'
  ),
  exactRelation(
    'negative-z-grate-floor',
    'positive-z-grate-floor',
    0,
    'HIGH',
    center,
    'Counterpart grate surfaces are symmetry-linked in Y.'
  ),
  exactRelation(
    'team-a-spawn-floor',
    'team-b-spawn-floor',
    0,
    'HIGH',
    center,
    '180-degree stage symmetry implies equal spawn-floor Y once one side is resolved.'
  ),
  exactRelation(
    'team-a-first-drop-landing',
    'team-b-first-drop-landing',
    0,
    'HIGH',
    center,
    'Counterpart first-drop landing floors are symmetry-linked.'
  ),
  exactRelation(
    'team-a-spawn-floor',
    'team-a-first-drop-landing',
    -4.5,
    'HIGH',
    ['extracted-temple01-geometry', ...firstDrop],
    'One-way semantics are user-confirmed; locally registered Temple01 geometry resolves the exact upper/lower model-Y levels 10.5->6.0m.'
  ),
  exactRelation(
    'team-b-spawn-floor',
    'team-b-first-drop-landing',
    -4.5,
    'HIGH',
    ['extracted-temple01-geometry', ...firstDrop],
    '180-degree counterpart exact first-drop relation.'
  ),
  exactRelation(
    'team-a-first-drop-landing',
    'right-low-floor',
    1.5,
    'HIGH',
    ['extracted-temple01-geometry', 'user-first-drop-height-stills-2026-09-26'],
    'Corrected red-vs-blue lower-side relation: first-drop landing model Y=6.0m and right-low/blue-lower model Y=7.5m.'
  )
];

export const UNDERTOW_VERTICAL_BANDS = Object.freeze({
  verticalGridMeters: {
    value: 1.5,
    confidence: 'HIGH' as const
  },
  centerUpperRelativeToLow: {
    minMeters: 4.5,
    maxMeters: 6,
    confidence: 'PROVISIONAL' as const
  },
  raisedHighPlatformCandidate: {
    yMeters: 4.5,
    confidence: 'PROVISIONAL' as const
  }
});
