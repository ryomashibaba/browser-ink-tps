import {describe,expect,it,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team,PaintSource} from '../ink/types';
import {PlayerResources} from '../combat/PlayerResources';
import type {PerformanceStats} from '../core/PerformanceStats';
import {CpuAgentSystem} from '../ai/CpuAgentSystem';
import {ProjectileSystem} from './ProjectileSystem';

/** Production ProjectileSystem + production CpuAgentSystem.applyAreaDamage
 * mutate an actual CPU object's HP and stats; stage cover remains a strict
 * registered-Rapier query adapter. NOT a full native world/4v4 proof. */
function fixture(source=true){
  const stats:Record<string,any>={
    cpuCombatHits:0,cpuWeaponGuardBlocks:0,
    cpuPlayerHits:0,playerDamageTaken:0,
    stringerBursts:0,stringerFuses:0,projectileImpacts:0,
    playerWeaponGuardHp:100
  };
  const bot:Record<string,any>={
    id:'B1',team:Team.B,lifeState:'ACTIVE',
    mobilityState:'GROUND',hp:100,
    position:new Vec3(0,0,0),weaponId:'pulse-sprayer',
    weaponGuarding:false,weaponGuardBreakSeconds:0,
    weaponGuardHp:100,weaponFacing:new Vec3(0,0,-1),
    guardEntity:{enabled:true},hpRecoveryDelaySeconds:0
  };
  const cpu=Object.create(CpuAgentSystem.prototype) as CpuAgentSystem;
  Object.assign(cpu,{bots:[bot],stats,f3dSourceGoals:null});
  const resources=new PlayerResources(stats as PerformanceStats);
  const fx=vi.fn(),paint=vi.fn(),fuse=vi.fn(),impact=vi.fn();
  const projectile=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const state=projectile as unknown as Record<string,any>;
  Object.assign(state,{
    nativeSourceHumanPhysicalMode:source?()=> 'HUMAN':null,
    currentHumanTeam:Team.A,currentHumanDamageable:false,
    currentHumanPosition:new Vec3(),
    resources,cpuAgents:cpu,stats,
    b367NativeFrame:44,
    nativeSourceHumanSplashCueFrame:-1,
    nativeHumanDamageCueFrame:-1,
    feedback:{
      confirmedHumanCpuDamage:fx,
      stringerBurst:fuse,stringerFuse:vi.fn(),impact
    },
    combatTargets:{applyAreaDamage:vi.fn()},
    physics:{castStageSegment:()=>null},
    paintWorldStamp:paint,
    delayedBursts:[]
  });
  const explode=(team=Team.A,hpDamage=25,weapon='arc-blaster')=>
    (projectile as any).applyAreaDamage(
      new Vec3(0,.68,-.3),1.6,hpDamage,
      team,undefined,false,weapon);
  const finish=(kind:'HUMAN'|'CPU'='HUMAN')=>{
    const slot={
      active:true,b346LaunchId:undefined,
      sourceKind:kind,sourceId:kind==='HUMAN'?'human':'A1',
      team:Team.A,weaponId:'arc-blaster',velocity:new Vec3(0,0,-1),
      paintRadius:0,blastRadius:1.6,blastDamage:25,
      delayedBurstSeconds:0,entity:{enabled:true}
    };
    (projectile as any).finishProjectile(
      slot,new Vec3(0,.68,-.3),null,'REAL_CPU_HIT');
    return slot;
  };
  const fuseBurst=(kind:PaintSource=PaintSource.Human)=>{
    state.delayedBursts.push({
      source:kind,actorId:kind===PaintSource.Cpu?'A1':undefined,
      team:Team.A,point:new Vec3(0,.68,-.3),seconds:.01,
      radius:1.6,damage:25,paintRadius:.5,weaponId:'chord-stringer'
    });
    (projectile as any).processDelayedBursts(.02);
  };
  return {stats,bot,cpu,resources,projectile,state,fx,paint,fuse,impact,
    explode,finish,fuseBurst};
}

describe('SOURCE: hit confirmation requires true CPU HP reduction',()=>{
  it('confirms a real human BLASTER blast after CPU capsule HP decreases',()=>{
    const f=fixture();
    const projectile=f.finish();
    expect(f.bot.hp).toBe(75);
    expect(f.stats.cpuCombatHits).toBe(1);
    expect(f.fx).toHaveBeenCalledOnce();
    expect(f.fx).toHaveBeenCalledWith(Team.A,expect.any(Vec3),
      expect.objectContaining({id:'arc-blaster'}));
    expect(projectile.active).toBe(false);
    expect(f.stats.projectileImpacts).toBe(1);
  });
  it('emits no fake confirmation for an actual CPU brella guard absorption',()=>{
    const f=fixture();
    f.bot.weaponId='canopy-guard';
    f.bot.weaponGuarding=true;
    f.explode();
    expect(f.bot.hp).toBe(100);
    expect(f.stats.cpuWeaponGuardBlocks).toBe(1);
    expect(f.stats.cpuCombatHits).toBe(0);
    expect(f.fx).not.toHaveBeenCalled();
  });
  it('does not confirm through an earlier registered original Rapier wall',()=>{
    const f=fixture();
    f.state.physics.castStageSegment=()=>({distance:.05});
    f.finish();
    expect(f.bot.hp).toBe(100);
    expect(f.stats.cpuCombatHits).toBe(0);
    expect(f.fx).not.toHaveBeenCalled();
  });
  it('emits no cue after the CPU has already reached real HP zero',()=>{
    const f=fixture();
    f.bot.hp=0;
    f.finish();
    expect(f.bot.hp).toBe(0);
    expect(f.stats.cpuCombatHits).toBe(0);
    expect(f.fx).not.toHaveBeenCalled();
  });
  it('never attributes an allied CPU BLASTER effect to a human',()=>{
    const f=fixture();
    f.finish('CPU');
    expect(f.bot.hp).toBe(75);
    expect(f.stats.cpuCombatHits).toBe(1);
    expect(f.fx).not.toHaveBeenCalled();
  });
  it('confirms a real human STRINGER delayed fuse only when CPU HP falls',()=>{
    const f=fixture();
    f.fuseBurst();
    expect(f.bot.hp).toBe(75);
    expect(f.stats.cpuCombatHits).toBe(1);
    expect(f.stats.stringerBursts).toBe(1);
    expect(f.state.delayedBursts).toHaveLength(0);
    expect(f.fx).toHaveBeenCalledWith(Team.A,expect.any(Vec3),
      expect.objectContaining({id:'chord-stringer'}));
  });
  it('does not claim a human STRINGER hit for a real CPU-owned fuse',()=>{
    const f=fixture();
    f.fuseBurst(PaintSource.Cpu);
    expect(f.bot.hp).toBe(75);
    expect(f.stats.cpuCombatHits).toBe(1);
    expect(f.fx).not.toHaveBeenCalled();
  });
  it('caps splash FX at one per 60Hz tick without suppressing any true HP loss',()=>{
    const f=fixture();
    f.explode(Team.A,20);
    f.explode(Team.A,20);
    expect(f.bot.hp).toBe(60);
    expect(f.stats.cpuCombatHits).toBe(2);
    expect(f.fx).toHaveBeenCalledOnce();
    f.state.b367NativeFrame=45;
    f.explode(Team.A,20);
    expect(f.bot.hp).toBe(40);
    expect(f.stats.cpuCombatHits).toBe(3);
    expect(f.fx).toHaveBeenCalledTimes(2);
  });
  it('preserves non-SOURCE T20 blast HP without emitting new SOURCE feedback',()=>{
    const f=fixture(false);
    f.finish();
    expect(f.bot.hp).toBe(75);
    expect(f.stats.cpuCombatHits).toBe(1);
    expect(f.fx).not.toHaveBeenCalled();
  });
  it('keeps CPU-versus-CPU splash outside human confirmation even when HP falls',()=>{
    const f=fixture();
    f.bot.team=Team.A;
    f.explode(Team.B,30);
    expect(f.bot.hp).toBe(70);
    expect(f.stats.cpuCombatHits).toBe(1);
    expect(f.fx).not.toHaveBeenCalled();
  });
});
