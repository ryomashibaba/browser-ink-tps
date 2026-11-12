import { describe, expect, it, vi } from 'vitest';
import { Vec3 } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { SurfaceFlags, Team } from '../ink/types';
import { CpuAgentSystem, type CpuCombatHit } from './CpuAgentSystem';

/** No simulated gameplay actors are spawned: exercise the real production
 * methods with a controlled, isolated real-CpuBot-shaped unit fixture. */
function fixture(originalF3: boolean) {
  const foot = new Vec3(0, 0, 0);
  const bot: any = {
    id: 'B1', team: Team.B, position: foot,
    hp: 50, lifeState: 'ACTIVE', mobilityState: 'GROUND',
    agent: { id: 'actual-recast-agent' }, entity: { enabled: true },
    guardEntity: { enabled: false }, weaponGuarding: false,
    weaponId: 'splash-burst',
    specialPoints: 0, subCooldownSeconds: 0,
    specialDecisionCooldownSeconds: 0,
    lethalHumanDirect: false, b213ActualAttackerId: null,
    b213ActualHitTick: -1
  };
  const system: any = Object.create(CpuAgentSystem.prototype);
  system.bots = [bot];
  // The native class constructor normally initializes these two queues.
  // This isolated real-method fixture deliberately bypasses the constructor.
  system.pendingShots = [];
  system.pendingKitRequests = [];
  system.f3dSourceGoals = originalF3
    ? { chooseSourceGoal: () => false } : null;
  system.stage = {
    metadata: { id: 'undertow-t21d-partial-connectivity-qa' }
  };
  system.qaMotionGoals = new Map();
  system.phase14eFirstDrop = { cancel: vi.fn() };
  system.phase14qGroundCollision = {
    removeRealCpuFoot: vi.fn()
  };
  system.navigation = { removeAgent: vi.fn() };
  system.stats = {
    cpuCombatHits: 0, humanCpuDirectHits: 0,
    cpuSplats: 0, humanCpuDirectSplats: 0,
    cpuWeaponGuardBlocks: 0
  };
  system.b213SourceCounterfireEnabled = false;
  system.resetCpuWeaponRuntime = vi.fn();
  system.resetCpuJumpState = vi.fn();
  const shot: CpuCombatHit = {
    botId: bot.id, distance: 1, point: new Vec3(0, 0, 0),
    guarded: false
  };
  return { system, bot, shot };
}

describe('F3 real CPU HP-zero is a single immediate source-native splat', () => {
  it('keeps a live CPU at the enemy-ink HP floor until it leaves enemy paint', () => {
    const { system, bot } = fixture(true);
    const minimum = GAME_CONFIG.combat.enemyInkMinimumHp;
    bot.hp = minimum;
    bot.ink = 50;
    bot.inkRecoveryLockSeconds = 0;
    bot.hpRecoveryDelaySeconds = 0;
    system.samplePoint = new Vec3();
    system.b178RealSourceInkRecovery = true;
    system.b178OwnNativeTicks = 0;
    system.b178EnemyNativeTicks = 0;
    system.b178NeutralNativeTicks = 0;
    system.b179ActualOwnInkRecovered = 0;
    system.b179ActualOwnRecoverTicks = 0;
    system.b179ActualEnemyHpLost = 0;

    const floor = {
      isScoreable: false,
      baseFlags: SurfaceFlags.Paintable | SurfaceFlags.Floor
    };
    let owner = Team.A;
    // Use the same sampled original-ink relation consumed by the actual
    // CPU updateResources method. No position, paint or HP is injected
    // between consecutive 60 Hz recovery ticks.
    system.sampleRegisteredSourceFoot = () => ({ owner, surface: floor });
    for (let tick = 0; tick < 180; tick += 1) {
      system.updateResources(bot, 1 / 60);
      expect(bot.hp).toBe(minimum);
    }
    expect(system.b178EnemyNativeTicks).toBe(180);
    expect(system.b179ActualEnemyHpLost).toBe(0);

    owner = Team.B;
    system.updateResources(bot, 1 / 60);
    expect(system.b178OwnNativeTicks).toBe(1);
    expect(bot.hp).toBeGreaterThan(minimum);
  });

  it('splats after actual human direct HP damage and rejects duplicate impacts', () => {
    const { system, bot, shot } = fixture(true);
    const hit = system.applyProjectileHit(shot, 80, 'HUMAN');
    expect(hit).toMatchObject({
      botId: 'B1', hpBefore: 50, hpAfter: 0, realHpLoss: 50,
      shieldAbsorbed: false, lethalHpZero: true
    });
    expect(bot.lifeState).toBe('SPLATTED');
    expect(bot.hp).toBe(0);
    expect(bot.entity.enabled).toBe(false);
    expect(bot.agent).toBeNull();
    expect(bot.respawnRemainingSeconds)
      .toBe(GAME_CONFIG.match.respawnSeconds);
    expect(system.stats.cpuCombatHits).toBe(1);
    expect(system.stats.humanCpuDirectHits).toBe(1);
    expect(system.stats.cpuSplats).toBe(1);
    expect(system.stats.humanCpuDirectSplats).toBe(1);
    expect(system.phase14qGroundCollision.removeRealCpuFoot)
      .toHaveBeenCalledOnce();
    expect(system.navigation.removeAgent).toHaveBeenCalledOnce();
    expect(system.findNearestCombatHit(
      new Vec3(0, 1, -2), new Vec3(0, 1, 2), Team.A
    )).toBeNull();
    expect(system.applyProjectileHit(shot, 40, 'HUMAN')).toBeNull();
    expect(system.stats.cpuSplats).toBe(1);
  });

  it('removes pre-dispatch fire and kit requests of a truly splatted SOURCE CPU, not its ally', () => {
    const { system, bot, shot } = fixture(true);
    system.bots.push({
      id: 'A1', team: Team.A, lifeState: 'ACTIVE', hp: 100,
      mobilityState: 'GROUND'
    });
    system.pendingShots = [{ sourceId: 'B1' }, { sourceId: 'A1' }];
    system.pendingKitRequests = [{ sourceId: 'B1' }, { sourceId: 'A1' }];
    system.applyProjectileHit(shot, 80, 'HUMAN');
    expect(system.pendingShots.map((x: any) => x.sourceId)).toEqual(['A1']);
    expect(system.pendingKitRequests.map((x: any) => x.sourceId)).toEqual(['A1']);
    const shots: string[] = [];
    const kits: string[] = [];
    system.drainFireRequests((x: any) => shots.push(x.sourceId));
    system.drainKitRequests((x: any) => { kits.push(x.sourceId); return true; });
    expect(shots).toEqual(['A1']);
    expect(kits).toEqual(['A1']);
    // Neither a delayed stale action nor a false respawn shot is emitted.
    system.pendingShots.push({ sourceId: 'B1' });
    system.drainFireRequests((x: any) => shots.push(x.sourceId));
    expect(shots).toEqual(['A1']);
    bot.lifeState = 'ACTIVE';
    bot.hp = 100;
    bot.mobilityState = 'GROUND';
    system.pendingShots.push({ sourceId: 'B1' });
    system.drainFireRequests((x: any) => shots.push(x.sourceId));
    expect(shots).toEqual(['A1', 'B1']);
  });

  it('keeps the frozen T20 late splat path and does not touch source feet', () => {
    const { system, bot, shot } = fixture(false);
    expect(system.applyProjectileHit(shot, 80, 'HUMAN')?.lethalHpZero)
      .toBe(true);
    expect(bot.hp).toBe(0);
    expect(bot.lifeState).toBe('ACTIVE');
    expect(system.stats.cpuSplats).toBe(0);
    expect(system.phase14qGroundCollision.removeRealCpuFoot)
      .not.toHaveBeenCalled();
  });

  it('does not splat on a nonlethal real shot', () => {
    const { system, bot, shot } = fixture(true);
    const hit = system.applyProjectileHit(shot, 18, 'HUMAN');
    expect(hit?.hpAfter).toBe(32);
    expect(hit?.lethalHpZero).toBe(false);
    expect(bot.lifeState).toBe('ACTIVE');
    expect(system.stats.cpuSplats).toBe(0);
  });

  it('native CPU projectile splats but cannot earn human direct splat credit', () => {
    const { system, bot, shot } = fixture(true);
    const hit = system.applyProjectileHit(shot, 90, 'CPU', 'A1');
    expect(hit?.lethalHpZero).toBe(true);
    expect(bot.lifeState).toBe('SPLATTED');
    expect(system.stats.cpuSplats).toBe(1);
    expect(system.stats.humanCpuDirectHits).toBe(0);
    expect(system.stats.humanCpuDirectSplats).toBe(0);
  });

  it('native area damage independently removes a lethally struck CPU once', () => {
    const { system, bot } = fixture(true);
    const hits = system.applyAreaDamage(new Vec3(0, .68, 0), 3, 90, Team.A);
    expect(hits).toBe(1);
    expect(bot.lifeState).toBe('SPLATTED');
    expect(system.stats.cpuSplats).toBe(1);
    expect(system.stats.humanCpuDirectSplats).toBe(0);
    expect(system.applyAreaDamage(new Vec3(0, .68, 0), 3, 90, Team.A))
      .toBe(0);
    expect(system.stats.cpuSplats).toBe(1);
  });

  it('a real canopy guard absorbs the shot without HP loss or splat', () => {
    const { system, bot, shot } = fixture(true);
    bot.weaponId = 'canopy-guard';
    bot.weaponGuarding = true;
    bot.weaponGuardHp = 100;
    bot.weaponGuardBreakSeconds = 0;
    const guardHit = system.applyProjectileHit(
      { ...shot, guarded: true }, 40, 'HUMAN'
    );
    expect(guardHit?.shieldAbsorbed).toBe(true);
    expect(guardHit?.realHpLoss).toBe(0);
    expect(bot.hp).toBe(50);
    expect(bot.lifeState).toBe('ACTIVE');
    expect(system.stats.cpuSplats).toBe(0);
    expect(system.stats.cpuWeaponGuardBlocks).toBe(1);
  });
});
