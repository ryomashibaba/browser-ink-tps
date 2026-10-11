import { describe, expect, it } from 'vitest';
import {
  stageSolidCollisionEnabled,
  stageSolidNavigationEnabled,
  type StageSolidDefinition
} from './StageDefinition';

function solid(overrides: Partial<StageSolidDefinition> = {}): StageSolidDefinition {
  return {
    id: 'solid',
    center: [0, 0, 0],
    size: [1, 1, 1],
    material: 'medium',
    render: true,
    projectileBlocker: true,
    cameraBlocker: true,
    ...overrides
  };
}

describe('StageSolid runtime participation', () => {
  it('preserves frozen collision/navigation defaults', () => {
    const value = solid();
    expect(stageSolidCollisionEnabled(value)).toBe(true);
    expect(stageSolidNavigationEnabled(value)).toBe(true);
  });

  it('makes a visual-only solid non-colliding and non-navigable by default', () => {
    const value = solid({ collisionEnabled: false });
    expect(stageSolidCollisionEnabled(value)).toBe(false);
    expect(stageSolidNavigationEnabled(value)).toBe(false);
  });

  it('allows navigation participation to be explicitly overridden', () => {
    const value = solid({
      collisionEnabled: false,
      navigationEnabled: true
    });
    expect(stageSolidCollisionEnabled(value)).toBe(false);
    expect(stageSolidNavigationEnabled(value)).toBe(true);
  });
});
