import type {
  VerticalNode,
  VerticalRelation
} from '../measurement/VerticalConstraintGraph';
import { exactRelation } from '../measurement/VerticalConstraintGraph';

const handoff = ['handoff-t21-masterplan'] as const;
const center = ['user-center-stills', 'user-center-videos', 'web-post-7-2-gameplay'] as const;
const firstDrop = ['user-first-drop-video', 'handoff-t21-masterplan'] as const;

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
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'right-small-drop-upper',
    absolute: {
      floorId: 'RIGHT_DROP_UPPER',
      confidence: 'UNKNOWN',
      evidenceIds: []
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
    id: 'team-a-spawn-floor',
    absolute: {
      floorId: 'TEAM_A_SPAWN',
      confidence: 'UNKNOWN',
      evidenceIds: [],
      notes: 'Historical 7.5m hypothesis is deliberately excluded.'
    }
  },
  {
    id: 'team-b-spawn-floor',
    absolute: {
      floorId: 'TEAM_B_SPAWN',
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'team-a-first-drop-landing',
    absolute: {
      floorId: 'TEAM_A_FIRST_DROP',
      confidence: 'UNKNOWN',
      evidenceIds: []
    }
  },
  {
    id: 'team-b-first-drop-landing',
    absolute: {
      floorId: 'TEAM_B_FIRST_DROP',
      confidence: 'UNKNOWN',
      evidenceIds: []
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
    1.5,
    'HIGH',
    handoff,
    'Right-side small drop magnitude; neither absolute floor is frozen yet.'
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
  {
    fromId: 'team-a-spawn-floor',
    toId: 'team-a-first-drop-landing',
    candidatesMeters: [-1.5, -3],
    confidence: 'PROVISIONAL',
    evidenceIds: firstDrop,
    notes: 'ONE_WAY_DROP is confirmed, exact fall magnitude is not.'
  },
  {
    fromId: 'team-b-spawn-floor',
    toId: 'team-b-first-drop-landing',
    candidatesMeters: [-1.5, -3],
    confidence: 'PROVISIONAL',
    evidenceIds: firstDrop,
    notes: 'ONE_WAY_DROP is confirmed, exact fall magnitude is not.'
  }
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
