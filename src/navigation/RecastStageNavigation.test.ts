import { describe, expect, it } from 'vitest';
import type { StageDefinition } from '../stage/StageDefinition';
import { stageNavigationOffMeshConnections } from './RecastStageNavigation';

function stage(
  navigationLinks?: StageDefinition['navigationLinks']
): StageDefinition {
  return {
    metadata: {
      id: 'nav-test',
      displayName: 'NAV TEST',
      worldBounds: { minX: -1, maxX: 1, minZ: -1, maxZ: 1 },
      teamASpawn: [0, 0, 0],
      teamBSpawn: [0, 0, 0],
      teamASpawnSlots: [],
      teamBSpawnSlots: [],
      tacticalNodes: [],
      splatZones: []
    },
    solids: [],
    paintSurfaces: [],
    navigationLinks
  };
}

describe('stage navigation off-mesh links', () => {
  it('preserves frozen stages as zero off-mesh links when omitted', () => {
    expect(stageNavigationOffMeshConnections(stage())).toEqual([]);
  });

  it('maps a one-way stage link to the recast-navigation generator contract', () => {
    expect(stageNavigationOffMeshConnections(stage([
      {
        id: 'first-drop-a',
        start: [2, 7.5, 10],
        end: [2, 3, 8],
        radiusMeters: 0.65,
        bidirectional: false,
        userId: 21
      }
    ]))).toEqual([
      {
        startPosition: { x: 2, y: 7.5, z: 10 },
        endPosition: { x: 2, y: 3, z: 8 },
        radius: 0.65,
        bidirectional: false,
        area: 0,
        flags: 1,
        userId: 21
      }
    ]);
  });
});
