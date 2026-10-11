import { describe, expect, it } from 'vitest';
import type { StageSolidDefinition } from '../stage/StageDefinition';
import {
  stageSolidAllowsCharacterMode,
  stageSolidBlocksQuery
} from './RapierStagePhysics';

function solid(
  collisionBehavior?: StageSolidDefinition['collisionBehavior']
): StageSolidDefinition {
  return {
    id: collisionBehavior === 'GRATE' ? 'grate' : 'solid',
    center: [0, 0, 0],
    size: [4, 0.2, 4],
    material: 'medium',
    render: true,
    projectileBlocker: true,
    cameraBlocker: true,
    collisionBehavior
  };
}

describe('Rapier stage collision semantics', () => {
  it('preserves the frozen default SOLID behavior', () => {
    const value = solid();
    expect(stageSolidBlocksQuery(value, 'ink-projectile')).toBe(true);
    expect(stageSolidBlocksQuery(value, 'thrown-sub')).toBe(true);
    expect(stageSolidBlocksQuery(value, 'camera')).toBe(true);
    expect(stageSolidAllowsCharacterMode(value, 'HUMAN')).toBe(true);
    expect(stageSolidAllowsCharacterMode(value, 'SQUID')).toBe(true);
  });

  it('models grate traversal without making all projectiles equivalent', () => {
    const value = solid('GRATE');
    expect(stageSolidBlocksQuery(value, 'ink-projectile')).toBe(false);
    expect(stageSolidBlocksQuery(value, 'thrown-sub')).toBe(true);
    expect(stageSolidBlocksQuery(value, 'camera')).toBe(true);
    expect(stageSolidAllowsCharacterMode(value, 'HUMAN')).toBe(true);
    expect(stageSolidAllowsCharacterMode(value, 'SQUID')).toBe(false);
  });

  it('still honors cameraBlocker independently on grate geometry', () => {
    const value = { ...solid('GRATE'), cameraBlocker: false };
    expect(stageSolidBlocksQuery(value, 'camera')).toBe(false);
    expect(stageSolidBlocksQuery(value, 'thrown-sub')).toBe(true);
  });
});
