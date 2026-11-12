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
  system.sourceCommittedPaintAims = new Map();
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


  it('continues only source-authorized REAL splatling burst shots after the painted aim becomes unavailable for fresh selection',()=>{
    const {system,bot}=fixture(true);
    bot.weaponId='rotor-splatling';
    bot.position.set(0,3,0);
    bot.weaponFacing=new Vec3(0,0,1);
    bot.hp=100;bot.ink=100;bot.fireRemaining=0;
    bot.weaponBurstShotsRemaining=2;bot.weaponBurstCooldown=0;
    bot.weaponChargeSeconds=0;bot.weaponRollPaintCooldown=0;
    bot.weaponGuardHp=100;bot.weaponGuardBreakSeconds=0;
    system.sourceCommittedPaintAims=new Map([['B1',{
      weaponId:'rotor-splatling',target:new Vec3(2,3,0)
    }]]);
    system.phase14qF2RecoverableSteps=true;
    system.b216SourceStageAimValidated=vi.fn(()=>true);
    system.sampleRegisteredSourceFoot=vi.fn(()=>({owner:Team.B,
      surface:{isScoreable:false}}));
    system.gameplayInk={sampleWorld:vi.fn(()=>({
      surface:{isScoreable:false}
    }))};
    system.qaTurfShotCooldown=new Map([['B1',.85]]);
    system.qaTurfShotsByActor=new Map();
    system.b215SelectedBattlePaintPacing=true;
    system.b64InkAngleSweepEnabled=false;
    system.chooseOriginalSourceTurfTarget=vi.fn(()=>null);
    system.chooseCombatTarget=vi.fn(()=>null);
    system.b216OriginalTurfSightChecks=0;
    system.b216OriginalTurfCoverVetoes=0;
    system.stats.cpuSourceTurfShots=0;system.stats.cpuShots=0;

    system.updateCpuWeapon(bot,1/60,Team.A,new Vec3(),true);
    expect(system.pendingShots).toHaveLength(1);
    expect(system.pendingShots[0].sourceId).toBe('B1');
    expect(system.pendingShots[0].sourceFloorPaint).toBe(true);
    expect(bot.ink).toBeLessThan(100);
    expect(bot.weaponBurstShotsRemaining).toBe(1);
    const inkAfterFirst=bot.ink;
    bot.weaponBurstCooldown=0;

    // A real blocking Rapier source solid vetoes the next shot despite
    // the remembered aim. No invented impact, projectile or ink spend.
    system.b216SourceStageAimValidated=vi.fn(()=>false);
    system.updateCpuWeapon(bot,1/60,Team.A,new Vec3(),true);
    expect(system.pendingShots).toHaveLength(1);
    expect(bot.ink).toBe(inkAfterFirst);
    expect(bot.weaponBurstShotsRemaining).toBe(0);
    expect(system.sourceCommittedPaintAims.has('B1')).toBe(false);
  });

  it('keeps a real SOURCE charger charging at an independently reverified floor aim, then clears it on splat',()=>{
    const {system,bot}=fixture(true);
    bot.weaponId='rail-charger';bot.hp=100;bot.ink=100;
    bot.position.set(0,3,0);bot.weaponFacing=new Vec3(0,0,1);
    bot.weaponChargeSeconds=.01;bot.weaponBurstShotsRemaining=0;
    bot.weaponBurstCooldown=0;bot.weaponRollPaintCooldown=0;
    bot.weaponGuardHp=100;bot.weaponGuardBreakSeconds=0;
    bot.fireRemaining=0;
    system.sourceCommittedPaintAims=new Map([['B1',{
      weaponId:'rail-charger',target:new Vec3(2,3,0)
    }]]);
    system.phase14qF2RecoverableSteps=true;
    system.b216SourceStageAimValidated=vi.fn(()=>true);
    system.sampleRegisteredSourceFoot=vi.fn(()=>({owner:Team.B,
      surface:{isScoreable:false}}));
    system.gameplayInk={sampleWorld:vi.fn(()=>({
      surface:{isScoreable:false}
    }))};
    system.qaTurfShotCooldown=new Map([['B1',.85]]);
    system.qaTurfShotsByActor=new Map();
    system.b215SelectedBattlePaintPacing=true;
    system.b64InkAngleSweepEnabled=false;
    system.chooseOriginalSourceTurfTarget=vi.fn(()=>null);
    system.chooseCombatTarget=vi.fn(()=>null);
    system.b216OriginalTurfSightChecks=0;
    system.b216OriginalTurfCoverVetoes=0;
    system.stats.cpuSourceTurfShots=0;system.stats.cpuShots=0;

    system.updateCpuWeapon(bot,1/60,Team.A,new Vec3(),true);
    expect(bot.weaponChargeSeconds).toBeGreaterThan(.01);
    expect(system.pendingShots).toHaveLength(0);
    expect(bot.ink).toBe(100);

    system.applyProjectileHit({
      botId:'B1',distance:1,point:new Vec3(),guarded:false
    },120,'HUMAN');
    expect(bot.lifeState).toBe('SPLATTED');
    expect(system.sourceCommittedPaintAims.has('B1')).toBe(false);
  });
  it('source main and kit sight reject non-rejoined or dead native CPU opponents',()=>{
    const {system,bot}=fixture(true);
    bot.role='PAINTER';bot.position.set(0,3,0);
    bot.weaponId='splash-burst';
    const enemy:any={
      id:'A1',team:Team.A,position:new Vec3(3,3,0),
      hp:100,lifeState:'ACTIVE',mobilityState:'GROUND'
    };
    system.bots.push(enemy);
    system.b181OriginalCombatStageRay=vi.fn(()=>false);
    system.b181CachedCombat=new Map();
    system.b181NativeFrame=30;
    system.b212NativeLeadEnabled=false;
    system.b213SourceCounterfireEnabled=false;
    system.b181ActualStageRays=0;
    system.b181ActualSourceOcclusions=0;
    system.b181VisibleSelections=0;
    let rejoined=false;
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=(id:string)=>
      id==='A1'&&rejoined;
    const aim=()=>system.chooseCombatTarget(
      bot,Team.B,new Vec3(),false,1/60,true);
    expect(aim()).toBeNull();
    rejoined=true;expect(aim()).not.toBeNull();
    enemy.hp=0;expect(aim()).toBeNull();
    enemy.hp=100;enemy.lifeState='SPLATTED';
    expect(aim()).toBeNull();
    enemy.lifeState='ACTIVE';enemy.mobilityState='FIRST_DROP_FALL';
    expect(aim()).toBeNull();
    enemy.mobilityState='GROUND';rejoined=false;
    expect(aim()).toBeNull();
    rejoined=true;expect(aim()).not.toBeNull();
  });

  it('ordinary SOURCE aim without optional stage sight never attacks a stale respawn foot',()=>{
    const {system,bot}=fixture(true);
    bot.position.set(0,3,0);
    bot.role='PAINTER';
    system.targetPoint=new Vec3();
    system.b181OriginalCombatStageRay=null;
    const opponent:any={
      id:'A1',team:Team.A,lifeState:'ACTIVE',hp:100,
      mobilityState:'GROUND',position:new Vec3(3,3,0)
    };
    system.bots.push(opponent);
    let sourceRejoined=false;
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=(id:string)=>
      id==='A1'&&sourceRejoined;
    const target=()=>system.chooseCombatTarget(
      bot,Team.B,new Vec3(),false,1/60,true);
    expect(target()).toBeNull(); // respawn awaiting real first drop
    sourceRejoined=true;expect(target()?.x).toBe(3);
    opponent.hp=0;expect(target()).toBeNull();
    opponent.hp=100;opponent.mobilityState='FIRST_DROP_REJOIN';
    expect(target()).toBeNull();
    opponent.mobilityState='GROUND';sourceRejoined=false;
    expect(target()).toBeNull();
    sourceRejoined=true;expect(target()?.x).toBe(3);
    // Without SOURCE opt-in, retain the frozen legacy closest-actor aim.
    system.f3dSourceGoals=null;
    opponent.hp=0;
    expect(target()?.x).toBe(3);
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
