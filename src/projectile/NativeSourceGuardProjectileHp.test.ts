import {describe,expect,it,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {PlayerResources} from '../combat/PlayerResources';
import type {PerformanceStats} from '../core/PerformanceStats';
import {ProjectileSystem} from './ProjectileSystem';

/** Use the production 60 Hz projectile, real player-capsule lookup,
 * real PlayerResources HP and real impact retirement. Stage/CPU I/O is
 * absent; this is a unit regression, NOT a native Chromium match. */
function combatFixture({
  native=true,guard=true,velocities=[8],origin=new Vec3()
}:{
  native?:boolean;guard?:boolean;velocities?:number[];
  origin?:Vec3;
}={}){
  const stats:Record<string,any>={
    playerDamageTaken:0,cpuPlayerHits:0,
    playerWeaponGuardBlocks:0,playerWeaponGuardHp:100,
    playerWeaponAction:'READY',playerGrounded:true,
    shotsFired:0,projectileImpacts:0,activeProjectiles:0
  };
  const resources=new PlayerResources(stats as PerformanceStats);
  const hits=velocities.map((vz,i)=>({
    active:true,
    position:origin.clone(),previousPosition:origin.clone(),
    velocity:new Vec3(0,0,vz),gravity:0,ttl:3,
    team:Team.B,sourceKind:'CPU' as const,sourceId:'B'+i,
    entity:{enabled:true,setPosition:vi.fn()},
    weaponId:'pulse-sprayer',damage:40,
    paintRadius:0,blastRadius:0,blastDamage:0,
    delayedBurstSeconds:0,delayedBurstRadius:0,
    delayedBurstDamage:0,delayedBurstPaintRadius:0,
    trailPaintRadius:0,trailPaintCooldown:0
  }));
  const cues=vi.fn();
  const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const state=game as unknown as Record<string,any>;
  Object.assign(state,{
    slots:hits,delta:new Vec3(),
    nativeSourceHumanPhysicalMode:native?()=> 'HUMAN':null,
    playerWeaponId:'canopy-guard',
    guardHp:100,guardBreakSeconds:0,
    b367NativeFrame:0,nativeHumanDamageCueFrame:-1,
    fireCooldown:0,burstCooldown:0,rollPaintCooldown:0,
    meleeCooldown:0,dualiesFocusSeconds:0,
    chargeSeconds:0,wasFireHeld:false,
    stats,resources,
    queuedCpuShots:[],
    currentHumanPosition:new Vec3(),
    currentHumanAimDirection:new Vec3(0,0,-1),
    feedback:{
      updateChargeVisual:vi.fn(),impact:vi.fn(),
      confirmedNativeHumanDamage:cues
    },
    guardEntity:{enabled:false},
    updateGuardVisual:vi.fn(),
    processDelayedBursts:vi.fn(),
    spawnQueuedCpuShots:vi.fn(),
    findNearestSurfaceHit:()=>null,
    physics:{castStageSegment:()=>null},
    cpuAgents:{findNearestCombatHit:()=>null},
    combatTargets:{findNearestHit:()=>null}
  });
  const step=(guardHeld=guard)=>game.fixedUpdate(
    1/60,false,guardHeld,new Vec3(),new Vec3(0,0,-1),
    Team.A,new Vec3(),true,true);
  return {game,state,stats,resources,hits,cues,step};
}

describe('SOURCE real projectile, shield, HP and hit ledger',()=>{
  it('blocks a front-facing point-blank physical bullet without HP loss',()=>{
    // From -Z toward +Z: the actual impact begins at the KCC center.
    const f=combatFixture({velocities:[8]});
    f.step();
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.stats.playerWeaponGuardHp).toBe(60);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.playerDamageTaken).toBe(0);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.cues).not.toHaveBeenCalled();
    expect(f.hits[0]!.active).toBe(false);
    expect(f.stats.projectileImpacts).toBe(1);
  });

  it('does not award a shield block to a rear shot born inside the capsule',()=>{
    // From +Z toward -Z: true collision distance=0, but guard faces -Z.
    const f=combatFixture({velocities:[-8]});
    f.step();
    expect(f.stats.playerWeaponGuardBlocks).toBe(0);
    expect(f.resources.currentHp).toBe(60);
    expect(f.stats.playerDamageTaken).toBe(40);
    expect(f.stats.cpuPlayerHits).toBe(1);
    expect(f.cues).toHaveBeenCalledOnce();
    expect(f.cues).toHaveBeenCalledWith(Team.B,expect.any(Vec3),40);
    expect(f.stats.projectileImpacts).toBe(1);
  });

  it('retains frozen non-SOURCE guard rules and does not emit SOURCE cues',()=>{
    const f=combatFixture({native:false,velocities:[-8]});
    f.step();
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.cues).not.toHaveBeenCalled();
  });

  it('takes exactly one lethal HP hit and cannot register an extra post-splat hit',()=>{
    const f=combatFixture({guard:false,velocities:[8,8]});
    f.hits[0]!.damage=130;
    f.hits[1]!.damage=130;
    f.step();
    expect(f.resources.currentHp).toBe(0);
    expect(f.stats.playerHp).toBe(0);
    expect(f.stats.playerDamageTaken).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(1);
    expect(f.cues).toHaveBeenCalledOnce();
    expect(f.cues).toHaveBeenCalledWith(Team.B,expect.any(Vec3),100);
    expect(f.stats.projectileImpacts).toBe(1);
    expect(f.hits[0]!.active).toBe(false);
    // The second real projectile keeps its flight; it did NOT hit a dead actor.
    expect(f.hits[1]!.active).toBe(true);
    expect(f.stats.activeProjectiles).toBe(1);
  });

  it('rejects an almost-sideways source hit on the physical rear half',()=>{
    // From inside the registered capsule at x=.25 z=+.02: legacy -0.10
    // tolerance called this rear-quadrant ray a genuine FRONT shield hit.
    const f=combatFixture({
      origin:new Vec3(.25,0,.02),velocities:[-8]
    });
    f.step();
    expect(f.stats.playerWeaponGuardBlocks).toBe(0);
    expect(f.resources.currentHp).toBe(60);
    expect(f.stats.cpuPlayerHits).toBe(1);
    expect(f.cues).toHaveBeenCalledOnce();
  });

  it('still blocks a physically front-half grazing SOURCE projectile',()=>{
    const f=combatFixture({
      origin:new Vec3(.25,0,-.02),velocities:[8]
    });
    f.step();
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.cues).not.toHaveBeenCalled();
  });

  it('restores movement speed on SOURCE guard break without faking HP damage',()=>{
    const f=combatFixture({velocities:[8]});
    expect(f.game.getMovementMultiplier(false,true)).toBe(.74);
    f.hits[0]!.damage=130;
    f.step();
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.stats.playerWeaponGuardHp).toBe(0);
    expect(f.state.guardBreakSeconds).toBe(2.5);
    expect(f.game.getMovementMultiplier(false,true)).toBe(1);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(0);
  });

  it('retains frozen T20 shield movement penalty and centered-hit guard',()=>{
    const f=combatFixture({
      native:false,origin:new Vec3(.25,0,.02),velocities:[-8]
    });
    f.step();
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.resources.currentHp).toBe(100);
    // Frozen T20 still slows movement whenever secondary is held.
    f.state.guardBreakSeconds=2.5;
    expect(f.game.getMovementMultiplier(false,true)).toBe(.74);
  });

  it('starts a new SOURCE round with no stale live human damageable target',()=>{
    const f=combatFixture();
    Object.assign(f.state,{
      b346ShooterWitness:{reset:vi.fn()},
      sourceCpuLastPhysicalGrant:new Map<string,number>(),
      b367PhysicalEvents:[],
      delayedBursts:[],
      currentHumanDamageable:true,currentHumanGuarding:true,
      currentHumanTeam:Team.A,
      cpuAgents:{applyAreaDamage:vi.fn(),findNearestCombatHit:()=>null},
      combatTargets:{applyAreaDamage:vi.fn(),findNearestHit:()=>null}
    });
    f.game.reset();
    expect(f.state.currentHumanDamageable).toBe(false);
    expect(f.state.currentHumanGuarding).toBe(false);
    expect(f.stats.playerWeaponGuarding).toBe(false);
    // Pre-first-frame real enemy SUB / SPECIAL does not damage a stale
    // previous-match human collider. No fabricated invincibility after the
    // first real fixedUpdate writes the authoritative physical body.
    f.game.applyExternalAreaDamage(new Vec3(0,0,-1),2,35,Team.B);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.cues).not.toHaveBeenCalled();
    f.step(false);
    f.game.applyExternalAreaDamage(new Vec3(0,0,-1),2,35,Team.B);
    expect(f.resources.currentHp).toBe(65);
    expect(f.stats.cpuPlayerHits).toBe(1);
  });

  it('does not inflict damage through a closer original Rapier solid',()=>{
    const f=combatFixture({guard:false,origin:new Vec3(0,0,-0.6),velocities:[36]});
    f.state.physics.castStageSegment=()=>({
      distance:0.1,point:new Vec3(0,0,-0.5),solidId:'original-wall'
    });
    f.step();
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.playerDamageTaken).toBe(0);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.cues).not.toHaveBeenCalled();
    expect(f.hits[0]!.active).toBe(false);
    expect(f.stats.projectileImpacts).toBe(1);
  });
});
