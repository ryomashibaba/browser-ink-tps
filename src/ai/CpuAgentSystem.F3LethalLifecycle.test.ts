import { describe, expect, it, vi } from 'vitest';
import { Vec3 } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import {subWeaponProfile,weaponKit} from '../weapons/WeaponKitCatalog';
import { SurfaceFlags, Team } from '../ink/types';
import { CpuAgentSystem, type CpuCombatHit, type CpuFireRequest } from './CpuAgentSystem';
import {ProjectileSystem} from '../projectile/ProjectileSystem';
import {SubWeaponSystem} from '../subweapon/SubWeaponSystem';
import {weaponProfile} from '../weapons/WeaponCatalog';
import {CpuKitSystem} from './CpuKitSystem';
import {nativeSourceCpuKitRuntimeAuthorized}
 from '../app/NativeSourceRoundActionWindow';

/** No simulated gameplay actors are spawned: exercise the real production
 * methods with a controlled, isolated real-CpuBot-shaped unit fixture. */
function fixture(originalF3: boolean) {
  const foot = new Vec3(0, 0, 0);
  const bot: any = {
    id: 'B1', team: Team.B, position: foot,
    hp: 50, lifeState: 'ACTIVE', mobilityState: 'GROUND',
    agent: { id: 'actual-recast-agent' }, entity: { enabled: true },
    guardEntity: { enabled: false }, weaponGuarding: false,
    weaponId: 'pulse-sprayer',
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
  it('activates genuine CPU SUB physics only for the selected 180s immutable original source',()=>{
    const original={
      fullRound:true,canonicalMode:'combat',stageId:
       'undertow-t21d-partial-connectivity-qa',
      solids:25,paint:17,links:26,scoreable:0
    };
    for(const mode of ['combat','circuit','coop','frontline'])
      expect(nativeSourceCpuKitRuntimeAuthorized({
       ...original,canonicalMode:mode})).toBe(true);
    for(const changed of [
      {fullRound:false},{canonicalMode:null},
      {canonicalMode:'preview'},{canonicalMode:'qa'},
      {stageId:'inkworks-junction'},{solids:26},
      {paint:18},{links:27},{scoreable:1}
    ])expect(nativeSourceCpuKitRuntimeAuthorized({
     ...original,...changed})).toBe(false);
  });

  it('refunds a live SOURCE CPU main shot if physical rejoin is lost before dispatch',()=>{
    const {system,bot}=fixture(true);
    system.phase14qF2RecoverableSteps=true;
    bot.ink=72;bot.inkRecoveryLockSeconds=.3;
    bot.fireRemaining=0;
    system.stats.cpuShots=0;
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=()=>false;
    expect(system.queueCpuWeaponRequest(bot,new Vec3(4,0,0),0))
      .toBe(true);
    expect(bot.ink).toBeLessThan(72);
    // Scheduler reserved cadence, but no actual round was launched.
    bot.fireRemaining=.27;
    const delivered=vi.fn();
    system.drainFireRequests(delivered);
    expect(delivered).not.toHaveBeenCalled();
    expect(system.pendingShots).toHaveLength(0);
    expect(bot.ink).toBeCloseTo(72);
    expect(bot.inkRecoveryLockSeconds).toBeCloseTo(.3);
    expect(bot.fireRemaining).toBe(0);
    expect(system.stats.cpuShots).toBe(0);
    // Only a subsequent genuine rejoin may release a paid new shot.
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=()=>true;
    expect(system.queueCpuWeaponRequest(bot,new Vec3(4,0,0),0))
      .toBe(true);
    bot.fireRemaining=.27;
    system.drainFireRequests(delivered);
    expect(delivered).toHaveBeenCalledOnce();
    expect(bot.fireRemaining).toBeCloseTo(.27);
    expect(system.stats.cpuShots).toBe(1);
    // A real projectile pool refusal also leaves no paid cooldown.
    bot.fireRemaining=0;
    expect(system.queueCpuWeaponRequest(bot,new Vec3(4,0,0),0))
      .toBe(true);
    bot.fireRemaining=.27;
    system.drainFireRequests((request:CpuFireRequest)=>{
      system.rollbackUndeliveredSourceCpuMainShot(request);
    });
    expect(bot.fireRemaining).toBe(0);
    expect(system.stats.cpuShots).toBe(1);
    // Another genuine ink payment after the request must keep its own
    // cooldown; the rejected projectile cannot erase later action timing.
    bot.fireRemaining=0;
    expect(system.queueCpuWeaponRequest(bot,new Vec3(4,0,0),0))
      .toBe(true);
    bot.ink-=1;
    bot.fireRemaining=.27;
    system.drainFireRequests((request:CpuFireRequest)=>{
      system.rollbackUndeliveredSourceCpuMainShot(request);
    });
    expect(bot.fireRemaining).toBeCloseTo(.27);
    expect(system.stats.cpuShots).toBe(1);
  });

  it('does not launch a paid real SOURCE CPU projectile after a same-tick genuine human HP-zero splat',()=>{
    const {system,bot,shot}=fixture(true);
    system.phase14qF2RecoverableSteps=true;
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=()=>true;
    bot.ink=80;
    bot.inkRecoveryLockSeconds=.22;
    bot.fireRemaining=0;
    system.stats.cpuShots=0;
    const launcher:any=Object.create(ProjectileSystem.prototype);
    launcher.queuedCpuShots=[];
    launcher.slots=[{active:false}];
    launcher.cpuAimDirection=new Vec3();
    launcher.sourceCpuFairVolleyDispatch=false;
    launcher.solveLaunchDirection=vi.fn((_:Vec3,__:Vec3,out:Vec3)=>
      out.set(1,0,0));
    launcher.cpuAgents=system;
    launcher.stats={projectilePoolDrops:0};
    launcher.spawnProjectile=vi.fn((slot:any)=>{slot.active=true});
    launcher.feedback={shot:vi.fn()};

    expect(system.queueCpuWeaponRequest(bot,new Vec3(4,0,0),0))
      .toBe(true);
    const chargedInk=bot.ink;
    system.drainFireRequests((request:CpuFireRequest)=>
      launcher.queueCpuShot(request));
    expect(launcher.queuedCpuShots).toHaveLength(1);
    expect(system.stats.cpuShots).toBe(1);

    // Human CHARGER ray can kill now, before queued CPU projectile spawns.
    const confirmed=system.applyProjectileHit(shot,80,'HUMAN');
    expect(confirmed?.lethalHpZero).toBe(true);
    expect(bot.lifeState).toBe('SPLATTED');
    expect(system.pendingShots).toHaveLength(0);
    expect(launcher.queuedCpuShots).toHaveLength(1);

    launcher.spawnQueuedCpuShots(
      Team.A,new Vec3(),true,false,new Vec3());
    expect(launcher.spawnProjectile).not.toHaveBeenCalled();
    expect(launcher.feedback.shot).not.toHaveBeenCalled();
    expect(launcher.queuedCpuShots).toHaveLength(0);
    expect(system.stats.cpuShots).toBe(0);
    expect(bot.ink).toBeCloseTo(chargedInk);
    expect(system.stats.cpuSplats).toBe(1);
    expect(system.stats.humanCpuDirectSplats).toBe(1);
  });

  it('refunds a last-moment SOURCE rejoin loss without stealing a live teammate volley',()=>{
    const {system,bot}=fixture(true);
    system.phase14qF2RecoverableSteps=true;
    let liveB1=true;
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=(id:string)=>
      id==='A1'||(id==='B1'&&liveB1);
    bot.ink=80;
    bot.inkRecoveryLockSeconds=.2;
    bot.fireRemaining=0;
    system.stats.cpuShots=0;
    const ally:any={
      id:'A1',team:Team.A,position:new Vec3(1,3,0),
      lifeState:'ACTIVE',hp:100,mobilityState:'GROUND',
      weaponId:'pulse-sprayer',ink:80,
      inkRecoveryLockSeconds:.1,fireRemaining:0
    };
    system.bots.push(ally);
    const launcher:any=Object.create(ProjectileSystem.prototype);
    launcher.queuedCpuShots=[];
    launcher.slots=[{active:false}];
    launcher.cpuAimDirection=new Vec3();
    launcher.sourceCpuFairVolleyDispatch=false;
    launcher.solveLaunchDirection=vi.fn((_:Vec3,__:Vec3,out:Vec3)=>
      out.set(1,0,0));
    launcher.cpuAgents=system;
    launcher.stats={projectilePoolDrops:0};
    launcher.spawnProjectile=vi.fn((slot:any)=>{slot.active=true});
    launcher.feedback={shot:vi.fn()};
    expect(system.queueCpuWeaponRequest(bot,new Vec3(4,0,0),0))
      .toBe(true);
    expect(system.queueCpuWeaponRequest(ally,new Vec3(4,3,0),0))
      .toBe(true);
    const allyCharged=ally.ink;
    bot.fireRemaining=.25;
    ally.fireRemaining=.25;
    system.drainFireRequests((request:CpuFireRequest)=>
      launcher.queueCpuShot(request));
    expect(launcher.queuedCpuShots).toHaveLength(2);

    // SOURCE rejoin invalidates after paid queue, before physical emit.
    liveB1=false;
    launcher.spawnQueuedCpuShots(
      Team.A,new Vec3(),true,false,new Vec3());
    expect(launcher.spawnProjectile).toHaveBeenCalledOnce();
    expect(launcher.feedback.shot).toHaveBeenCalledOnce();
    expect(bot.ink).toBeCloseTo(80);
    expect(bot.inkRecoveryLockSeconds).toBeCloseTo(.2);
    expect(bot.fireRemaining).toBe(0);
    expect(ally.ink).toBeCloseTo(allyCharged);
    expect(ally.fireRemaining).toBeCloseTo(.25);
    expect(system.stats.cpuShots).toBe(1);
    expect(launcher.queuedCpuShots).toHaveLength(0);
  });

  it('real SOURCE CPU CHARGER uses the same living physical player collider as SUB instead of an upper-body phantom',()=>{
    const projectile:any=Object.create(ProjectileSystem.prototype);
    projectile.currentHumanDamageable=true;
    projectile.currentHumanTeam=Team.A;
    projectile.currentHumanPosition=new Vec3(0,.87,0);
    projectile.resources={currentHp:100,applyDamage:vi.fn()};
    projectile.stats={cpuPlayerHits:0};
    projectile.cpuAgents={findNearestCombatHit:vi.fn(()=>null)};
    projectile.physics={castStageSegment:vi.fn(()=>null)};
    projectile.findNearestSurfaceHit=vi.fn(()=>null);
    projectile.feedback={beam:vi.fn()};
    projectile.enqueueChargerLine=vi.fn();
    let mode:'HUMAN'|'SQUID'='HUMAN';
    projectile.enableNativeSourceHumanPhysicalContact(()=>mode);
    const attack=(y:number)=>{
      const request:any={sourceId:'B1',team:Team.B,charge:1,
        origin:new Vec3(-3,y,0),target:new Vec3(0,y,0)};
      projectile.fireCpuChargerRay(
        request,weaponProfile('rail-charger'),Team.A,
        projectile.currentHumanPosition,true,false,new Vec3(1,0,0));
    };
    // Valid upper HUMAN capsule, missed by old single sphere centered
    // at body y=.87 with 0.42m radius.
    attack(1.56);
    expect(projectile.resources.applyDamage).toHaveBeenCalledOnce();
    expect(projectile.stats.cpuPlayerHits).toBe(1);
    expect(projectile.feedback.beam).toHaveBeenCalledOnce();
    // Same geometry must not hit an actual low SQUID player.
    mode='SQUID';
    attack(1.56);
    expect(projectile.resources.applyDamage).toHaveBeenCalledOnce();
    expect(projectile.stats.cpuPlayerHits).toBe(1);
    // A genuine SQUID near-floor shot can hit the true Rapier sphere.
    attack(.33);
    expect(projectile.resources.applyDamage).toHaveBeenCalledTimes(2);
    expect(projectile.stats.cpuPlayerHits).toBe(2);
    // A true splat within this native tick eliminates later CPU
    // hits even if the earlier fixedUpdate caller passed alive=true.
    projectile.resources.currentHp=0;
    attack(.33);
    expect(projectile.resources.applyDamage).toHaveBeenCalledTimes(2);
    expect(projectile.stats.cpuPlayerHits).toBe(2);
    // No fabricated friendly fire from another real A-team CPU.
    projectile.resources.currentHp=100;
    projectile.fireCpuChargerRay({
      sourceId:'A1',team:Team.A,charge:1,
      origin:new Vec3(-3,.33,0),target:new Vec3(0,.33,0)
    },weaponProfile('rail-charger'),Team.A,
      projectile.currentHumanPosition,true,false,new Vec3(1,0,0));
    expect(projectile.resources.applyDamage).toHaveBeenCalledTimes(2);
    expect(projectile.stats.cpuPlayerHits).toBe(2);
  });

  it('real SOURCE enemy SUB respects physical HUMAN capsule, SQUID sphere, living HP and native blast overlap',()=>{
    const projectile:any=Object.create(ProjectileSystem.prototype);
    projectile.currentHumanDamageable=true;
    projectile.currentHumanTeam=Team.A;
    projectile.currentHumanPosition=new Vec3(0,.87,0);
    projectile.resources={currentHp:100,applyDamage:vi.fn()};
    projectile.stats={cpuPlayerHits:0};
    projectile.currentHumanGuarding=false;
    projectile.cpuAgents={applyAreaDamage:vi.fn()};
    projectile.combatTargets={applyAreaDamage:vi.fn()};
    let mode:'HUMAN'|'SQUID'='HUMAN';
    projectile.enableNativeSourceHumanPhysicalContact(()=>mode);
    const flight=(height:number)=>projectile.findNativeSourceHumanPhysicalHit(
      new Vec3(-2,height,0),new Vec3(2,height,0),Team.B);
    // Lower/upper body are inside the original Rapier HUMAN capsule,
    // although an approximate central sphere would miss them.
    const footHit=flight(.12);
    expect(footHit).not.toBeNull();
    expect(footHit.distance).toBeGreaterThan(1);
    expect(footHit.distance).toBeLessThan(2);
    expect(flight(1.58)).not.toBeNull();
    expect(flight(1.85)).toBeNull();
    expect(projectile.findNativeSourceHumanPhysicalHit(
      new Vec3(-2,.87,0),new Vec3(2,.87,0),Team.A)).toBeNull();

    // Actual SQUID Rapier sphere is low: a waist-height HUMAN hit is
    // no longer a fictitious hit on a swimmer.
    mode='SQUID';
    expect(flight(1.14)).toBeNull();
    expect(flight(.34)).not.toBeNull();

    // Real floor-contact blast catches the HUMAN capsule; the previous
    // body-center +0.68 fake height would miss a .3m explosion.
    mode='HUMAN';
    projectile.applyExternalAreaDamage(new Vec3(0,0,0),.3,24,Team.B);
    expect(projectile.resources.applyDamage).toHaveBeenCalledOnce();
    expect(projectile.stats.cpuPlayerHits).toBe(1);
    // HP zero in this same tick cannot absorb another SUB explosion or
    // count a second attacker hit.
    projectile.resources.currentHp=0;
    expect(flight(.4)).toBeNull();
    projectile.applyExternalAreaDamage(new Vec3(0,0,0),.3,24,Team.B);
    expect(projectile.resources.applyDamage).toHaveBeenCalledOnce();
    expect(projectile.stats.cpuPlayerHits).toBe(1);
  });

  it('SOURCE thrown CPU SUB strikes only a real opponent ahead of the original stage blocker',()=>{
    const make=()=>{
      const slot:any={active:true,landed:false,actorId:'B1',
        subId:'pulse-bomb',team:Team.B,
        position:new Vec3(0,3,0),previousPosition:new Vec3(),
        velocity:new Vec3(12,0,0),ttl:10,fuseSeconds:3,
        entity:{setPosition:vi.fn()}};
      const kit:any=Object.create(CpuKitSystem.prototype);
      kit.bombs=[slot];
      kit.delta=new Vec3();
      kit.nativeOriginalSourceCombatantSubContactEnabled=true;
      const realCpu={distance:.07,point:new Vec3(.07,3,0),
        botId:'A1',guarded:false};
      const realHuman={distance:.10,point:new Vec3(.10,3,0)};
      kit.cpuAgents={findNearestCombatHit:vi.fn(()=>realCpu)};
      kit.projectiles={findNativeSourceHumanPhysicalHit:
        vi.fn(()=>realHuman)};
      kit.physics={castStageSegment:vi.fn(()=>({
        distance:.17,point:new Vec3(.17,3,0),solidId:'ORIGINAL'
      }))};
      kit.findNearestSurfaceHit=vi.fn(()=>null);
      kit.onBombContact=vi.fn();
      return {kit,slot,realCpu,realHuman};
    };
    const first=make();
    first.kit.updateBombs(1/60);
    expect(first.kit.onBombContact).toHaveBeenCalledOnce();
    expect(first.kit.onBombContact.mock.calls[0][2])
      .toEqual(first.realCpu.point);
    expect(first.kit.cpuAgents.findNearestCombatHit)
      .toHaveBeenCalledOnce();
    expect(first.kit.projectiles.findNativeSourceHumanPhysicalHit)
      .toHaveBeenCalledOnce();

    const humanFirst=make();
    humanFirst.kit.cpuAgents.findNearestCombatHit=vi.fn(()=>null);
    humanFirst.kit.updateBombs(1/60);
    expect(humanFirst.kit.onBombContact.mock.calls[0][2])
      .toEqual(humanFirst.realHuman.point);

    const wallFirst=make();
    wallFirst.kit.physics.castStageSegment=vi.fn(()=>({
      distance:.04,point:new Vec3(.04,3,0),solidId:'ORIGINAL'
    }));
    wallFirst.kit.updateBombs(1/60);
    expect(wallFirst.kit.onBombContact.mock.calls[0][2])
      .toEqual(new Vec3(.04,3,0));

    const historicalQa=make();
    historicalQa.kit.nativeOriginalSourceCombatantSubContactEnabled=false;
    historicalQa.kit.updateBombs(1/60);
    expect(historicalQa.kit.cpuAgents.findNearestCombatHit)
      .not.toHaveBeenCalled();
    expect(historicalQa.kit.projectiles.findNativeSourceHumanPhysicalHit)
      .not.toHaveBeenCalled();
    expect(historicalQa.kit.onBombContact.mock.calls[0][2])
      .toEqual(new Vec3(.17,3,0));
  });

  it('genuine SOURCE combat spends CPU SUB ink and launches an existing physical bomb, but refuses an exhausted kit pool',()=>{
    const {system,bot}=fixture(true);
    bot.position.set(0,3,42);
    bot.role='SKIRMISHER';
    bot.ink=95;
    bot.inkRecoveryLockSeconds=.18;
    bot.subCooldownSeconds=0;
    bot.weaponChargeSeconds=0;
    bot.weaponBurstShotsRemaining=0;
    bot.fireRemaining=0;
    system.phase14qF2RecoverableSteps=true;
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=()=>true;
    system.stats.cpuSubUses=0;
    system.syncStats=vi.fn();
    const target=new Vec3(1,3,48);
    system.chooseCombatTarget=vi.fn(()=>target.clone());
    const slot:any={active:false,landed:false,actorId:'-',subId:'pulse-bomb',
      team:Team.A,position:new Vec3(),previousPosition:new Vec3(),
      velocity:new Vec3(),ttl:0,fuseSeconds:0,
      entity:{render:null,enabled:false,setPosition:vi.fn(),
       setLocalScale:vi.fn()}};
    const kit:any=Object.create(CpuKitSystem.prototype);
    kit.bombs=[slot];
    kit.stats={cpuSubProjectilesLaunched:0,cpuKitPoolDrops:0};
    kit.feedback={subThrow:vi.fn()};
    kit.syncStats=vi.fn();
    kit.materialA={};kit.materialB={};

    // This is the actual existing CPU decision and SUB launch code,
    // not a manufactured projectile, Scoreable cell or enemy hit.
    system.updateCpuKit(bot,Team.A,target,true);
    expect(system.pendingKitRequests).toHaveLength(1);
    expect(system.pendingKitRequests[0].kind).toBe('SUB');
    expect(bot.ink).toBeLessThan(95);
    expect(system.stats.cpuSubUses).toBe(1);
    system.drainKitRequests((req:any)=>kit.queue(req));
    expect(system.pendingKitRequests).toHaveLength(0);
    expect(slot.active).toBe(true);
    expect(slot.actorId).toBe('B1');
    expect(slot.team).toBe(Team.B);
    expect(slot.position.y).toBeGreaterThan(bot.position.y);
    expect(slot.velocity.length()).toBeGreaterThan(0);
    expect(kit.stats.cpuSubProjectilesLaunched).toBe(1);
    expect(kit.feedback.subThrow).toHaveBeenCalledOnce();
    const afterFirst=bot.ink;
    expect(afterFirst).toBeLessThan(95);

    // The second SUB is a separate possible late-life action after
    // sufficient normal ink recovery/cooldown. Restore the resource
    // balance only in this isolated test fixture, never in game code.
    // Do not incorrectly demand two full-cost SUBs from 95 initial ink.
    bot.ink=GAME_CONFIG.inkEconomy.capacity;
    bot.inkRecoveryLockSeconds=0;
    bot.subCooldownSeconds=0;
    const beforeSecond=bot.ink;
    const oldLock=bot.inkRecoveryLockSeconds;
    // Never create a 17th/virtual slot: a real pool refusal returns only
    // the second unlaunched SUB's ink, preserving the first effect.
    system.updateCpuKit(bot,Team.A,target,true);
    expect(system.pendingKitRequests).toHaveLength(1);
    expect(bot.ink).toBeLessThan(beforeSecond);
    system.drainKitRequests((req:any)=>kit.queue(req));
    expect(kit.stats.cpuSubProjectilesLaunched).toBe(1);
    expect(kit.stats.cpuKitPoolDrops).toBe(1);
    expect(bot.ink).toBeCloseTo(beforeSecond);
    expect(bot.inkRecoveryLockSeconds).toBeCloseTo(oldLock);
    expect(system.stats.cpuSubUses).toBe(1);
    expect(slot.active).toBe(true);
  });

  it('refuses a queued original SOURCE SPECIAL after a true same-tick CPU splat, preserving death penalties',()=>{
    const {system,bot,shot}=fixture(true);
    system.phase14qF2RecoverableSteps=true;
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=()=>true;
    system.stats.cpuSpecialActivations=1;
    bot.specialPoints=35;
    const kit:any=Object.create(CpuKitSystem.prototype);
    kit.pendingSpecials=[];
    kit.cpuAgents=system;
    kit.activateSpecial=vi.fn();
    const request:any={kind:'SPECIAL',sourceId:'B1',team:Team.B,
      position:new Vec3(),target:new Vec3(3,0,0),
      direction:new Vec3(1,0,0),
      specialId:weaponKit(bot.weaponId).special,
      rollbackBefore:{
        specialPoints:90,specialDecisionCooldownSeconds:0,
        subCooldownSeconds:0
      }};
    expect(kit.queue(request)).toBe(true);
    expect(kit.pendingSpecials).toHaveLength(1);
    expect(kit.pendingSpecials[0].rollbackBefore).toEqual(request.rollbackBefore);
    const splat=system.applyProjectileHit(shot,80,'HUMAN');
    expect(splat?.lethalHpZero).toBe(true);
    const retained=bot.specialPoints;
    kit.activatePendingSpecials();
    expect(kit.activateSpecial).not.toHaveBeenCalled();
    expect(kit.pendingSpecials).toHaveLength(0);
    expect(system.stats.cpuSpecialActivations).toBe(0);
    expect(bot.specialPoints).toBe(retained);
    expect(bot.lifeState).toBe('SPLATTED');
    expect(system.stats.cpuSplats).toBe(1);
  });

  it('does not activate SOURCE SPECIAL without a current physical return, but keeps a real teammate effect',()=>{
    const {system,bot}=fixture(true);
    system.phase14qF2RecoverableSteps=true;
    bot.specialPoints=0;
    bot.subCooldownSeconds=5;
    bot.specialDecisionCooldownSeconds=12;
    system.stats.cpuSpecialActivations=2;
    system.syncStats=vi.fn();
    let b1Rejoined=false;
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=(id:string)=>
      id==='A1'||(id==='B1'&&b1Rejoined);
    const ally:any={id:'A1',team:Team.A,lifeState:'ACTIVE',
      hp:100,mobilityState:'GROUND',weaponId:'pulse-sprayer',specialPoints:0,
      specialDecisionCooldownSeconds:0,subCooldownSeconds:0};
    system.bots.push(ally);
    const kit:any=Object.create(CpuKitSystem.prototype);
    kit.pendingSpecials=[];
    kit.cpuAgents=system;
    kit.activateSpecial=vi.fn();
    const req=(id:string,team:Team.A|Team.B):any=>({
      kind:'SPECIAL',sourceId:id,team,
      position:new Vec3(),target:new Vec3(3,0,0),
      direction:new Vec3(1,0,0),
      specialId:weaponKit(bot.weaponId).special,
      rollbackBefore:{
        specialPoints:80,specialDecisionCooldownSeconds:0,
        subCooldownSeconds:0
      }
    });
    kit.queue(req('B1',Team.B));
    kit.queue(req('A1',Team.A));
    kit.activatePendingSpecials();
    expect(kit.activateSpecial).toHaveBeenCalledOnce();
    expect(kit.activateSpecial.mock.calls[0][0]).toBe('A1');
    expect(bot.specialPoints).toBe(80);
    expect(bot.specialDecisionCooldownSeconds).toBe(0);
    expect(bot.subCooldownSeconds).toBe(0);
    expect(system.stats.cpuSpecialActivations).toBe(1);
    b1Rejoined=true;
    kit.queue(req('B1',Team.B));
    kit.activatePendingSpecials();
    expect(kit.activateSpecial).toHaveBeenCalledTimes(2);
    expect(kit.activateSpecial.mock.calls[1][0]).toBe('B1');
    expect(system.stats.cpuSpecialActivations).toBe(1);
    // A queued request for an unequipped special cannot activate from
    // this genuine actor's current physical muzzle after a kit change.
    const wrong=['turf-pulse','triple-strike','drift-storm'].find(
      id=>id!==weaponKit(bot.weaponId).special)!;
    const invalid=req('B1',Team.B);
    invalid.specialId=wrong;
    system.stats.cpuSpecialActivations+=1;
    kit.queue(invalid);
    kit.activatePendingSpecials();
    expect(kit.activateSpecial).toHaveBeenCalledTimes(2);
    expect(system.stats.cpuSpecialActivations).toBe(1);
  });

  it('refunds a live SOURCE rejected SUB only, keeping original splat resource penalties',()=>{
    const {system,bot,shot}=fixture(true);
    system.phase14qF2RecoverableSteps=true;
    bot.ink=75;
    bot.inkRecoveryLockSeconds=.23;
    const subId=weaponKit(bot.weaponId).sub;
    const cost=subWeaponProfile(subId).inkCost;
    system.stats.cpuSubUses=1;
    bot.ink-=cost;
    bot.inkRecoveryLockSeconds=GAME_CONFIG.inkEconomy.recoveryLockSeconds;
    bot.subCooldownSeconds=8;
    const req={kind:'SUB',sourceId:'B1',team:Team.B,
      position:new Vec3(),target:new Vec3(4,0,0),
      direction:new Vec3(1,0,0),subId,
      sourceSubRecovery:{lockBefore:.23,expectedInkAfterCharge:bot.ink}} as const;
    system.pendingKitRequests.push(req);
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=()=>false;
    const delivered=vi.fn(()=>true);
    system.drainKitRequests(delivered);
    expect(delivered).not.toHaveBeenCalled();
    expect(bot.ink).toBeCloseTo(75);
    expect(bot.subCooldownSeconds).toBe(0);
    expect(bot.inkRecoveryLockSeconds).toBeCloseTo(.23);
    expect(system.stats.cpuSubUses).toBe(0);
    expect(system.stats.cpuKitLast).toContain('REJOIN_HOLD');
    // A real HP-zero splat removes queued effects without granting
    // the dead CPU a refunded shot, free ink or fake physical rejoin.
    system.stats.cpuShots=0;
    expect(system.queueCpuWeaponRequest(bot,new Vec3(4,0,0),0))
      .toBe(true);
    const charged=bot.ink;
    system.stats.cpuSubUses=1;
    system.pendingKitRequests.push(req);
    system.applyProjectileHit(shot,80,'HUMAN');
    expect(bot.lifeState).toBe('SPLATTED');
    expect(system.pendingShots).toHaveLength(0);
    expect(system.pendingKitRequests).toHaveLength(0);
    expect(system.stats.cpuShots).toBe(0);
    expect(system.stats.cpuSubUses).toBe(0);
    expect(bot.ink).toBeCloseTo(charged);
  });
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

  it('paid SOURCE STRINGER fires all three real arrows or refunds everything',()=>{
    const {system,bot}=fixture(true);
    system.phase14qF2RecoverableSteps=true;
    bot.weaponId='chord-stringer';
    bot.ink=88;
    bot.inkRecoveryLockSeconds=.12;
    system.stats.cpuShots=0;
    const launcher:any=Object.create(ProjectileSystem.prototype);
    launcher.queuedCpuShots=[];
    launcher.slots=[{active:false},{active:false}];
    launcher.cpuAimDirection=new Vec3();
    launcher.sourceCpuFairVolleyDispatch=false;
    launcher.solveLaunchDirection=vi.fn((_:any,__:any,out:Vec3)=>
      out.set(1,0,0));
    launcher.cpuAgents=system;
    launcher.stats={projectilePoolDrops:0};
    launcher.spawnProjectile=vi.fn((slot:any)=>{slot.active=true});
    launcher.feedback={shot:vi.fn()};
    const addPaidShot=()=>{
      expect(system.queueCpuWeaponRequest(
        bot,new Vec3(5,0,0),.7,'STRINGER_RELEASE')).toBe(true);
      const req=system.pendingShots.pop()!;
      launcher.queueCpuShot(req);
      return req;
    };
    addPaidShot();
    launcher.spawnQueuedCpuShots(
      Team.A,new Vec3(),true,false,new Vec3());
    expect(launcher.spawnProjectile).not.toHaveBeenCalled();
    expect(launcher.feedback.shot).not.toHaveBeenCalled();
    expect(launcher.stats.projectilePoolDrops).toBe(1);
    expect(bot.ink).toBeCloseTo(88);
    expect(bot.inkRecoveryLockSeconds).toBeCloseTo(.12);
    expect(system.stats.cpuShots).toBe(0);
    launcher.slots.push({active:false});
    addPaidShot();
    launcher.spawnQueuedCpuShots(
      Team.A,new Vec3(),true,false,new Vec3());
    expect(launcher.spawnProjectile).toHaveBeenCalledTimes(3);
    expect(launcher.feedback.shot).toHaveBeenCalledTimes(1);
    expect(bot.ink).toBeLessThan(88);
    expect(system.stats.cpuShots).toBe(1);
  });

  it('paid SOURCE CHARGER with coincident muzzle and target cannot lose ink without a ray',()=>{
    const {system,bot}=fixture(true);
    system.phase14qF2RecoverableSteps=true;
    bot.weaponId='rail-charger';
    bot.ink=74;
    bot.inkRecoveryLockSeconds=.2;
    system.stats.cpuShots=0;
    // The real CPU muzzle is not the body's foot.
    const target=new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0);
    expect(system.queueCpuWeaponRequest(bot,target,1)).toBe(true);
    const request=system.pendingShots.pop()!;
    expect(request.origin.distance(target)).toBe(0);
    const launcher:any=Object.create(ProjectileSystem.prototype);
    launcher.queuedCpuShots=[];
    launcher.sourceCpuFairVolleyDispatch=false;
    launcher.cpuAgents=system;
    launcher.queueCpuShot(request);
    launcher.spawnQueuedCpuShots(
      Team.A,new Vec3(),false,false,new Vec3());
    expect(launcher.queuedCpuShots).toHaveLength(0);
    expect(bot.ink).toBeCloseTo(74);
    expect(bot.inkRecoveryLockSeconds).toBeCloseTo(.2);
    expect(system.stats.cpuShots).toBe(0);
  });

  it('seven real SOURCE CPUs share a scarce physical slot rather than permanent roster priority',()=>{
    const launcher:any=Object.create(ProjectileSystem.prototype);
    launcher.queuedCpuShots=[];
    launcher.slots=[{active:false}];
    launcher.surfaces=new Array(17);
    launcher.b343SourceVolleyAtomic=true;
    launcher.sourceCpuVolleyRotation=0;
    launcher.sourceCpuFairVolleyDispatch=false;
    launcher.cpuAimDirection=new Vec3();
    launcher.solveLaunchDirection=vi.fn((_:any,__:any,out:Vec3)=>
      out.set(1,0,0));
    launcher.spawnProjectile=vi.fn((slot:any)=>{slot.active=true});
    launcher.cpuAgents={rollbackUndeliveredSourceCpuMainShot:vi.fn(),
      approveQueuedSourceCpuMainShotAtLaunch:vi.fn(()=>true)};
    launcher.stats={projectilePoolDrops:0};
    launcher.feedback={shot:vi.fn()};
    const req=(id:string):any=>({
      sourceId:id,team:id==='A1'?Team.A:Team.B,
      origin:new Vec3(),bodyPosition:new Vec3(),target:new Vec3(3,0,0),
      weaponId:'pulse-sprayer',charge:0,action:'PROJECTILE',
      sourceInkTransaction:{
        chargedInkCost:.95,expectedInkAfterCharge:79,
        originalRecoveryLockSeconds:0
      }
    });
    const fireBoth=()=>{
      launcher.slots[0].active=false;launcher.queueCpuShot(req('A1'));
      launcher.queueCpuShot(req('B1'));
      launcher.spawnQueuedCpuShots(
        Team.A,new Vec3(),true,false,new Vec3());
    };
    // The frozen source QA ordering is unchanged without the new opt-in.
    fireBoth();fireBoth();
    const ids=()=>launcher.spawnProjectile.mock.calls.map(
      (args:any[])=>args.find(x=>x==='A1'||x==='B1'));
    expect(ids()).toEqual(['A1','A1']);
    expect(launcher.cpuAgents.rollbackUndeliveredSourceCpuMainShot)
      .toHaveBeenCalledTimes(2);
    launcher.spawnProjectile.mockClear();
    launcher.cpuAgents.rollbackUndeliveredSourceCpuMainShot.mockClear();
    launcher.enableSourceCpuFairVolleyDispatch();
    fireBoth();fireBoth();
    expect(ids()).toEqual(['A1','B1']);
    expect(launcher.cpuAgents.rollbackUndeliveredSourceCpuMainShot)
      .toHaveBeenCalledTimes(2);
    expect(launcher.stats.projectilePoolDrops).toBe(4);
    expect(launcher.queuedCpuShots).toHaveLength(0);
    expect(launcher.slots).toHaveLength(1); // no forged capacity
  });

  it('actual SOURCE CPU pool exhaustion conserves ink and prevents partial dualies volleys',()=>{
    const {system,bot}=fixture(true);
    system.phase14qF2RecoverableSteps=true;
    bot.weaponId='twin-comets';
    bot.ink=83;
    bot.inkRecoveryLockSeconds=.25;
    system.stats.cpuShots=0;
    expect(system.queueCpuWeaponRequest(bot,new Vec3(4,0,0),0))
      .toBe(true);
    const paid=system.pendingShots[0]!;
    expect(bot.ink).toBeLessThan(83);
    expect(system.stats.cpuShots).toBe(1);
    expect(paid.sourceInkTransaction).toMatchObject({
      expectedInkAfterCharge:bot.ink,originalRecoveryLockSeconds:.25
    });
    const launcher:any=Object.create(ProjectileSystem.prototype);
    launcher.queuedCpuShots=[];
    launcher.slots=[{active:false}]; // One real slot, dualies requires two
    launcher.cpuAimDirection=new Vec3();
    launcher.solveLaunchDirection=vi.fn((_:any,__:any,out:Vec3)=>
      out.set(1,0,0));
    launcher.spawnProjectile=vi.fn();
    launcher.cpuAgents=system;
    launcher.stats={projectilePoolDrops:0};
    launcher.feedback={shot:vi.fn()};
    launcher.queueCpuShot(paid);
    launcher.spawnQueuedCpuShots(Team.A,new Vec3(),true,false,new Vec3());
    expect(launcher.spawnProjectile).not.toHaveBeenCalled();
    expect(launcher.queuedCpuShots).toHaveLength(0);
    expect(launcher.stats.projectilePoolDrops).toBe(1);
    expect(bot.ink).toBeCloseTo(83);
    expect(bot.inkRecoveryLockSeconds).toBeCloseTo(.25);
    expect(system.stats.cpuShots).toBe(0);
    // A new physical capacity (not a fabricated weapon/ink refill)
    // is needed before the real CPU can expend the next accepted shot.
    expect(system.queueCpuWeaponRequest(bot,new Vec3(4,0,0),0))
      .toBe(true);
    const second=system.pendingShots.at(-1)!;
    launcher.slots=[{active:false},{active:false}];
    launcher.spawnProjectile=vi.fn((slot:any)=>{slot.active=true});
    launcher.queueCpuShot(second);
    launcher.spawnQueuedCpuShots(Team.A,new Vec3(),true,false,new Vec3());
    expect(launcher.spawnProjectile).toHaveBeenCalledTimes(2);
    expect(bot.ink).toBeLessThan(83);
    expect(system.stats.cpuShots).toBe(1);
  });

  it('genuine SOURCE newborn upper-spawn CPU cannot spend weapons or dispatch attacks before its new lower rejoin',()=>{
    const {system,bot}=fixture(true);
    const ally:any={id:'A1',team:Team.A,lifeState:'ACTIVE',
      hp:100,mobilityState:'GROUND'};
    system.bots.push(ally);
    let physicalReturn=false;
    system.f3dSourceGoals.isLiveRejoinedSourceCpu=(id:string)=>
      id==='A1'||(id==='B1'&&physicalReturn);
    expect(system.sourceCpuMayStartActions(bot)).toBe(false);
    expect(system.sourceCpuMayStartActions(ally)).toBe(true);
    const shots:string[]=[],kits:string[]=[];
    system.pendingShots=[{sourceId:'B1'},{sourceId:'A1'}];
    system.pendingKitRequests=[{sourceId:'B1'},{sourceId:'A1'}];
    system.drainFireRequests((x:any)=>shots.push(x.sourceId));
    system.drainKitRequests((x:any)=>{kits.push(x.sourceId);return true});
    expect(shots).toEqual(['A1']);
    expect(kits).toEqual(['A1']);
    expect(system.pendingShots).toHaveLength(0);
    expect(system.pendingKitRequests).toHaveLength(0);
    // A new original F2 drop + physical Recast/Rapier return alone
    // unlocks paid weapon actions without granting an invented route.
    physicalReturn=true;
    expect(system.sourceCpuMayStartActions(bot)).toBe(true);
    system.pendingShots=[{sourceId:'B1'}];
    system.pendingKitRequests=[{sourceId:'B1'}];
    system.drainFireRequests((x:any)=>shots.push(x.sourceId));
    system.drainKitRequests((x:any)=>{kits.push(x.sourceId);return true});
    expect(shots).toEqual(['A1','B1']);
    expect(kits).toEqual(['A1','B1']);
    bot.hp=0;
    expect(system.sourceCpuMayStartActions(bot)).toBe(false);
    bot.hp=100;bot.lifeState='SPLATTED';
    expect(system.sourceCpuMayStartActions(bot)).toBe(false);
    // Original T20 does not acquire SOURCE rejoin restrictions.
    system.f3dSourceGoals=null;
    expect(system.sourceCpuMayStartActions(bot)).toBe(true);
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
    bot.weaponId='pulse-sprayer';
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

  it('native SOURCE respawn clears old-life rejoin before restoring actual HP and high spawn',()=>{
    const {system,bot}=fixture(true);
    bot.slot=0;
    bot.lifeState='SPLATTED';bot.hp=0;
    bot.previousPosition=new Vec3();
    bot.jumpStartPosition=new Vec3();
    bot.jumpTargetPosition=new Vec3();
    bot.weaponFacing=new Vec3(0,0,1);
    bot.jumpMarker={enabled:false};
    bot.entity.setLocalEulerAngles=vi.fn();
    bot.entity.setPosition=vi.fn();
    system.spawnPosition=vi.fn(()=>new Vec3(0,9,-40));
    system.navigation.addAgent=vi.fn(()=>({id:'new-real-native-agent'}));
    system.phase14qGroundCollision.syncRealCpuFoot=vi.fn();
    system.stats.cpuRespawns=0;
    const expireOldLife=vi.fn(()=>{
      expect(bot.lifeState).toBe('SPLATTED');
      expect(bot.hp).toBe(0);
    });
    system.f3dSourceGoals.onNativeSourceCpuRespawn=expireOldLife;
    system.respawnBot(bot);
    expect(expireOldLife).toHaveBeenCalledTimes(1);
    expect(expireOldLife).toHaveBeenCalledWith('B1');
    expect(expireOldLife.mock.invocationCallOrder[0]).toBeLessThan(
      system.phase14qGroundCollision.syncRealCpuFoot.mock.invocationCallOrder[0]);
    expect(bot.lifeState).toBe('ACTIVE');
    expect(bot.hp).toBe(GAME_CONFIG.combat.playerMaxHp);
    expect(bot.position.toArray()).toEqual([0,9,-40]);
    expect(system.stats.cpuRespawns).toBe(1);
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

  it('true SOURCE human SUB hits a living real CPU before original cover, but not through it or in T20',()=>{
    // Exercise the existing production 60Hz bomb flight method without
    // manufacturing stage surfaces, enemy actors or fake damage events.
    const bomb:any={
      active:true,landed:false,subId:'pulse-bomb',team:Team.A,
      position:new Vec3(0,2,0),previousPosition:new Vec3(),
      velocity:new Vec3(120,0,0),ttl:2,fuseSeconds:.5,
      entity:{setPosition:vi.fn()}
    };
    const stageHit={
      distance:1,point:new Vec3(1,2,0),solidId:'REGISTERED_SOURCE_WALL'
    };
    const enemyHit={
      botId:'B1',distance:.5,point:new Vec3(.5,2,0),guarded:false
    };
    const sub:any=Object.create(SubWeaponSystem.prototype);
    sub.bombs=[bomb];
    sub.delta=new Vec3();
    sub.physics={castStageSegment:vi.fn(()=>stageHit)};
    sub.cpuAgents={findNearestCombatHit:vi.fn(()=>enemyHit)};
    sub.findNearestSurfaceHit=vi.fn(()=>null);
    sub.onContact=vi.fn();
    const flight=()=>{
      bomb.active=true;bomb.landed=false;bomb.ttl=2;
      bomb.position.set(0,2,0);bomb.velocity.set(120,0,0);
      sub.onContact.mockClear();
      sub.fixedUpdate(1/60);
    };
    // Frozen T20 never acquires unapproved actor collision.
    flight();
    expect(sub.cpuAgents.findNearestCombatHit).not.toHaveBeenCalled();
    expect(sub.onContact).toHaveBeenCalledWith(
      bomb,subWeaponProfile('pulse-bomb'),stageHit.point,
      'RAPIER_STAGE_SOLID',stageHit.solidId);
    sub.enableNativeSourceHumanSubBodyContact();
    flight();
    expect(sub.onContact).toHaveBeenCalledWith(
      bomb,subWeaponProfile('pulse-bomb'),enemyHit.point,
      'NATIVE_SOURCE_CPU_BODY','B1');
    // The same genuine 25-solid cover still protects the opponent.
    sub.cpuAgents.findNearestCombatHit.mockReturnValue({
      ...enemyHit,distance:1.4,point:new Vec3(1.4,2,0)});
    flight();
    expect(sub.onContact).toHaveBeenCalledWith(
      bomb,subWeaponProfile('pulse-bomb'),stageHit.point,
      'RAPIER_STAGE_SOLID',stageHit.solidId);
    // Existing closer original paintable surface stays authoritative.
    sub.cpuAgents.findNearestCombatHit.mockReturnValue(enemyHit);
    const paintHit={distance:.2,worldPoint:new Vec3(.2,2,0),
      surface:{id:'REGISTERED_SOURCE_PAINT'}};
    sub.findNearestSurfaceHit.mockReturnValue(paintHit);
    flight();
    expect(sub.onContact).toHaveBeenCalledWith(
      bomb,subWeaponProfile('pulse-bomb'),paintHit.worldPoint,
      'PAINT_SURFACE_SEGMENT','REGISTERED_SOURCE_PAINT');
  });
  it('SOURCE HUMAN/CPU SUB body collision cannot pass a nearer original Rapier blocker',()=>{
    // A SOURCE paint plane 5cm beyond a real solid is within the old
    // paint-priority epsilon. Actor contact 1cm beyond that solid must
    // still NOT become HP damage through original cover.
    const stageHit={distance:.48,point:new Vec3(.48,2,0),solidId:'SOURCE_WALL'};
    const paintHit={distance:.53,worldPoint:new Vec3(.53,2,0),
      surface:{id:'SOURCE_PAINT'}};
    const actorHit={botId:'B1',distance:.49,
      point:new Vec3(.49,2,0),guarded:false};
    const makeBomb=()=>({
      active:true,landed:false,subId:'pulse-bomb',team:Team.A,
      actorId:'A1',position:new Vec3(0,2,0),previousPosition:new Vec3(),
      velocity:new Vec3(120,0,0),ttl:2,fuseSeconds:.5,
      entity:{setPosition:vi.fn()}
    });
    const human:any=Object.create(SubWeaponSystem.prototype);
    human.bombs=[makeBomb()];human.delta=new Vec3();
    human.physics={castStageSegment:vi.fn(()=>stageHit)};
    human.cpuAgents={findNearestCombatHit:vi.fn(()=>actorHit)};
    human.findNearestSurfaceHit=vi.fn(()=>paintHit);
    human.onContact=vi.fn();
    human.enableNativeSourceHumanSubBodyContact();
    human.fixedUpdate(1/60);
    expect(human.cpuAgents.findNearestCombatHit).toHaveBeenCalledOnce();
    expect(human.onContact).toHaveBeenCalledWith(
      human.bombs[0],subWeaponProfile('pulse-bomb'),paintHit.worldPoint,
      'PAINT_SURFACE_SEGMENT','SOURCE_PAINT');

    const cpu:any=Object.create(CpuKitSystem.prototype);
    cpu.bombs=[makeBomb()];cpu.delta=new Vec3();
    cpu.nativeOriginalSourceCombatantSubContactEnabled=true;
    cpu.physics={castStageSegment:vi.fn(()=>stageHit)};
    cpu.cpuAgents={findNearestCombatHit:vi.fn(()=>actorHit)};
    cpu.projectiles={findNativeSourceHumanPhysicalHit:vi.fn(()=>null)};
    cpu.findNearestSurfaceHit=vi.fn(()=>paintHit);
    cpu.onBombContact=vi.fn();
    cpu.updateBombs(1/60);
    expect(cpu.cpuAgents.findNearestCombatHit).toHaveBeenCalledOnce();
    expect(cpu.onBombContact).toHaveBeenCalledWith(
      cpu.bombs[0],subWeaponProfile('pulse-bomb'),paintHit.worldPoint);
  });

  it('SOURCE HUMAN and CPU CHARGER rays cannot damage an actor behind near-coplanar real cover',()=>{
    const stageHit={distance:.48,point:new Vec3(.48,2,0),solidId:'SOURCE_WALL'};
    const paintHit={distance:.53,worldPoint:new Vec3(.53,2,0),
      surface:{id:'SOURCE_PAINT'}};
    const actorHit={botId:'B1',distance:.49,
      point:new Vec3(.49,2,0),guarded:false};
    const ray:any=Object.create(ProjectileSystem.prototype);
    ray.nativeSourceHumanPhysicalMode=()=> 'HUMAN';
    ray.findNearestSurfaceHit=vi.fn(()=>paintHit);
    ray.physics={castStageSegment:vi.fn(()=>stageHit)};
    ray.combatTargets={findNearestHit:vi.fn(()=>null)};
    ray.cpuAgents={findNearestCombatHit:vi.fn(()=>actorHit),
      applyProjectileHit:vi.fn()};
    const result=ray.resolveDirectRay(new Vec3(0,2,0),
      new Vec3(1,0,0),2,Team.A,100);
    expect(result.hitCombat).toBe(false);
    expect(ray.cpuAgents.applyProjectileHit).not.toHaveBeenCalled();

    // The same source-ordering issue also affected CPU CHARGER->real HUMAN.
    const cpuRay:any=Object.create(ProjectileSystem.prototype);
    cpuRay.nativeSourceHumanPhysicalMode=()=> 'HUMAN';
    cpuRay.findNearestSurfaceHit=vi.fn(()=>paintHit);
    cpuRay.physics={castStageSegment:vi.fn(()=>stageHit)};
    cpuRay.cpuAgents={findNearestCombatHit:vi.fn(()=>null)};
    cpuRay.findNativeSourceHumanPhysicalHit=vi.fn(()=>
      ({distance:.49,point:new Vec3(.49,2,0)}));
    cpuRay.resources={currentHp:100,applyDamage:vi.fn()};
    cpuRay.feedback={beam:vi.fn()};
    cpuRay.enqueueChargerLine=vi.fn();
    cpuRay.stats={cpuPlayerHits:0};
    const cpuRequest:any={
      sourceId:'A1',team:Team.A,origin:new Vec3(0,2,0),
      target:new Vec3(3,2,0),charge:1
    };
    cpuRay.fireCpuChargerRay(cpuRequest,weaponProfile('rail-charger'),
      Team.B,new Vec3(.49,2,0),true,false,new Vec3(1,0,0));
    expect(cpuRay.resources.applyDamage).not.toHaveBeenCalled();
    expect(cpuRay.feedback.beam).toHaveBeenCalledOnce();
  });

});
