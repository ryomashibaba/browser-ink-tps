import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { PerformanceStats } from '../core/PerformanceStats';
import { PlayerResources } from './PlayerResources';

describe('physical ink resource and HP behavior', () => {
  it('keeps the enemy-ink HP floor stable until genuine enemy contact ends', () => {
    const stats = new PerformanceStats();
    const resources = new PlayerResources(stats);
    const floor = GAME_CONFIG.combat.enemyInkMinimumHp;
    resources.applyDamage(GAME_CONFIG.combat.playerMaxHp - floor);
    expect(resources.currentHp).toBe(floor);

    // Longer than the normal HP recovery delay: previously every time
    // the delay expired, HP briefly recovered while still in ENEMY ink.
    for (let tick = 0; tick < 180; tick += 1) {
      resources.fixedUpdate(1 / 60, 'HUMAN', 'ENEMY');
      expect(resources.currentHp).toBeCloseTo(floor, 8);
      expect(stats.playerHpRecoveryState).toBe('ENEMY_INK');
    }

    resources.fixedUpdate(1 / 60, 'HUMAN', 'NEUTRAL');
    expect(resources.currentHp).toBeGreaterThan(floor);
  });

  it('preserves real shot ink spending, OWN squid refilling and HUMAN re-shoot', () => {
    const stats = new PerformanceStats();
    const resources = new PlayerResources(stats);
    for (let shot = 0; shot < 8; shot += 1) {
      expect(resources.tryConsumeShotInk()).toBe(true);
    }
    const spentInk = stats.playerInk;
    expect(spentInk).toBeLessThan(GAME_CONFIG.inkEconomy.capacity);

    for (let tick = 0; tick < 50; tick += 1) {
      resources.fixedUpdate(1 / 60, 'SQUID', 'OWN');
    }
    expect(stats.playerInkRecoveryState).toBe('SQUID_OWN');
    expect(stats.playerInk).toBeGreaterThan(spentInk);

    const beforeReshoot = stats.playerInk;
    expect(resources.tryConsumeShotInk()).toBe(true);
    expect(stats.shotsFired).toBe(9);
    expect(stats.playerInk).toBeLessThan(beforeReshoot);
  });
});
