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
const underpassCapture = [
  'user-right-low-capture-2026-09-25',
  'user-underpass-capture-2026-09-25'
] as const;

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
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'glass-overhang-high-reference',
    absolute: {
      floorId: 'GLASS_HIGH_REFERENCE',
      confidence: 'UNKNOWN',
      evidenceIds: [],
      notes: 'Reference elevation only. The vector source contains slope markers inside the glass footprint, so this is not a single flat platform Y.'
    }
  },
  {
    id: 'center-left-slope-low',
    absolute: {
      floorId: 'CENTER_LEFT_SLOPE_LOW',
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'center-left-slope-high',
    absolute: {
      floorId: 'CENTER_LEFT_SLOPE_HIGH',
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'center-right-slope-low',
    absolute: {
      floorId: 'CENTER_RIGHT_SLOPE_LOW',
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'center-right-slope-high',
    absolute: {
      floorId: 'CENTER_RIGHT_SLOPE_HIGH',
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'negative-z-grate-floor',
    absolute: {
      floorId: 'NEGATIVE_Z_GRATE',
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'positive-z-grate-floor',
    absolute: {
      floorId: 'POSITIVE_Z_GRATE',
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'team-a-spawn-floor',
    absolute: {
      floorId: 'TEAM_A_SPAWN',
      yMeters: UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY.spawnFloor,
      confidence: 'HIGH',
      evidenceIds: remodelGeometry,
      notes: 'Temple01 spawn-center model Y=10.5m normalized to project Y=6.0m. Historical 7.5m hypothesis is superseded.'
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
      notes: 'Registered red-drop lower side: model Y=6.0m -> project Y=1.5m.'
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
    0,
    'HIGH',
    underpassCapture,
    'The 2026-09-25 right-low and underpass captures show a continuous same-height walking connection with no intervening step/drop.'
  ),
  exactRelation(
    'glass-lower-major-floor',
    'glass-overhang-high-reference',
    3,
    'HIGH',
    handoff,
    'Glass overhang high reference is about 3m above the major floor directly below; do not flatten the slope-marked glass footprint.'
  ),
  exactRelation(
    'center-small-step-top',
    'center-left-slope-low',
    0,
    'HIGH',
    ['user-turf-vector-blueprint', 'user-center-videos', 'handoff-t21-masterplan'],
    'The central-left slope footprint touches the outer edge of the +1.5m center-step strip exactly in plan.'
  ),
  exactRelation(
    'center-small-step-top',
    'center-right-slope-low',
    0,
    'HIGH',
    ['user-turf-vector-blueprint', 'user-center-videos', 'handoff-t21-masterplan'],
    'The central-right slope footprint touches the counterpart +1.5m center-step strip exactly in plan.'
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
