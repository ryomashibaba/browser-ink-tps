import { Vec3 } from 'playcanvas';
import type { StageDefinition, StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  undertowFirstDropNavigationLinks,
  undertowRightSmallDropNavigationLinks
} from './UndertowSpillwayDropNavigation';
import { UNDERTOW_RIGHT_LOW_ROUTE_RAMPS } from './UndertowSpillwayRouteRampGeometry';
import { undertowTemple01ModelXZToProjectXZ } from './UndertowSpillwayModelXZGeometry';

export type UndertowConnectivityProbeId =
  | 'first-drop-positive-z'
  | 'right-small-drop-positive-z'
  | 'right-low-ramp-positive-z'
  | 'right-low-to-underpass-positive-z';

export interface UndertowConnectivityProbe {
  id: UndertowConnectivityProbeId;
  from: StageVector3;
  to: StageVector3;
  expectation: 'MUST_REACH' | 'DIAGNOSTIC_GAP';
  notes: string;
}

function midpoint(a: StageVector3, b: StageVector3): StageVector3 {
  return [
    (a[0] + b[0]) * 0.5,
    (a[1] + b[1]) * 0.5,
    (a[2] + b[2]) * 0.5
  ];
}

function modelPoint(x: number, y: number, z: number): StageVector3 {
  const [px, pz] = undertowTemple01ModelXZToProjectXZ([x, z]);
  return [px, y, pz];
}

const firstDrop = undertowFirstDropNavigationLinks()[2]!;
const rightDrop = undertowRightSmallDropNavigationLinks()[2]!;
const positiveRamp = UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.find(
  (record) => record.side === 'POSITIVE_Z'
)!;
const rampUpper = midpoint(
  positiveRamp.mesh.vertices[0]!,
  positiveRamp.mesh.vertices[1]!
);
const rampLower = midpoint(
  positiveRamp.mesh.vertices[2]!,
  positiveRamp.mesh.vertices[3]!
);

// Interior point of the independently audited positive-Z underpass polygon.
// Model XZ comes from the Temple01 source frame; project Y=0 is canonical.
const underpassInterior = modelPoint(-10, 0, 3);

export const UNDERTOW_T21D_CONNECTIVITY_PROBES:
  readonly UndertowConnectivityProbe[] = [
  {
    id: 'first-drop-positive-z',
    from: firstDrop.start,
    to: firstDrop.end,
    expectation: 'MUST_REACH',
    notes:
      'Audits the explicit one-way first-drop Detour link from spawn-high to the first-drop landing.'
  },
  {
    id: 'right-small-drop-positive-z',
    from: rightDrop.start,
    to: rightDrop.end,
    expectation: 'MUST_REACH',
    notes:
      'Audits the separate one-way right-small-drop link from spawn-high to right-low.'
  },
  {
    id: 'right-low-ramp-positive-z',
    from: rampLower,
    to: rampUpper,
    expectation: 'MUST_REACH',
    notes:
      'Audits the exact FloorConcrete03 physical ramp between first-drop landing and right-low.'
  },
  {
    id: 'right-low-to-underpass-positive-z',
    from: rampUpper,
    to: underpassInterior,
    expectation: 'DIAGNOSTIC_GAP',
    notes:
      'Diagnostic only: capture evidence says right-low connects into the underpass, but the intermediate source route has not yet been fully bound. This probe identifies whether the current partial geometry already reaches it.'
  }
] as const;

export function undertowT21dConnectivityQaStage(): StageDefinition {
  const package_ = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  return {
    metadata: {
      id: 'undertow-t21d-partial-connectivity-qa',
      displayName: 'Undertow T21-D Partial Connectivity QA',
      worldBounds: package_.worldBounds,
      teamASpawn: package_.teamASpawnFloorPoint,
      teamBSpawn: package_.teamBSpawnFloorPoint,
      teamASpawnSlots: [package_.teamASpawnFloorPoint],
      teamBSpawnSlots: [package_.teamBSpawnFloorPoint],
      tacticalNodes: [],
      splatZones: []
    },
    solids: package_.solids,
    paintSurfaces: package_.paintSurfaces,
    navigationLinks: package_.navigationLinks
  };
}

export function vec3([x, y, z]: StageVector3): Vec3 {
  return new Vec3(x, y, z);
}
