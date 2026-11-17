import {describe,expect,it,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {PlayerResources} from '../combat/PlayerResources';
import type {PerformanceStats} from '../core/PerformanceStats';
import {ProjectileSystem} from './ProjectileSystem';
import {weaponProfile} from '../weapons/WeaponCatalog';

/** Exercise real CPU CHARGER ray, real player capsule, real PlayerResources.
 * No synthetic match, false CPU actor, source geometry or score authority. */
function charger({
  source=true,guard=true,origin=new Vec3(),
  target=new Vec3(0,0,-10),blocked=false
}:{
  source?:boolean;guard?:boolean;origin?:Vec3;target?:Vec3;blocked?:boolean
}={}){
  const stats:Record<string,any>={
    cpuPlayerHits:0,playerDamageTaken:0,
    playerWeaponGuardBlocks:0,playerWeaponGuardHp:100,
    playerWeaponAction:'READY',playerGrounded:true
  };
  const resources=new PlayerResources(stats as PerformanceStats);
  const beam=vi.fn(),cue=vi.fn();
  const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const s=game as unknown as Record<string,any>;
  Object.assign(s,{
    nativeSourceHumanPhysicalMode:source?()=> 'HUMAN':null,
    currentHumanDamageable:true,currentHumanTeam:Team.A,
    currentHumanPosition:new Vec3(),
    currentHumanAimDirection:new Vec3(0,0,-1),
    nativeHumanDamageCueFrame:-1,b367NativeFrame:3,
    stats,resources,guardHp:100,guardBreakSeconds:0,
    guardEntity:{enabled:false},
    physics:{castStageSegment:blocked
      ?()=>({distance:.10,point:new Vec3(0,0,-.9)}) :()=>null},
    findNearestSurfaceHit:()=>null,
    cpuAgents:{findNearestCombatHit:()=>null},
    feedback:{beam,confirmedNativeHumanDamage:cue}
  });
  const request={
    sourceId:'B1',team:Team.B,
    origin,bodyPosition:origin.clone(),target,
    weaponId:'rail-charger',charge:1,action:'CHARGER_RELEASE'
  };
  const fire=()=> (game as any).fireCpuChargerRay(
    request,weaponProfile('rail-charger'),Team.A,
    new Vec3(),true,guard,new Vec3(0,0,-1)
  );
  return {game,s,stats,resources,beam,cue,fire};
}

describe('genuine SOURCE CPU charger ray hits and shield HP authority',()=>{
  it('does not grant a free guard to a ray starting at body center and travelling toward the back',()=>{
    const f=charger();
    f.fire();
    expect(f.stats.playerWeaponGuardBlocks).toBe(0);
    expect(f.resources.currentHp).toBeLessThan(100);
    expect(f.stats.playerDamageTaken).toBeCloseTo(100-f.resources.currentHp,8);
    expect(f.stats.cpuPlayerHits).toBe(1);
    expect(f.cue).toHaveBeenCalledOnce();
    expect(f.cue).toHaveBeenCalledWith(
      Team.B,expect.any(Vec3),100-f.resources.currentHp);
    expect(f.beam).toHaveBeenCalledOnce();
  });
  it('blocks a genuine front-side physical charger hit without HP reduction',()=>{
    const f=charger({
      origin:new Vec3(0,0,-1),
      target:new Vec3(0,0,10)
    });
    f.fire();
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.cue).not.toHaveBeenCalled();
  });
  it('damages HP on a rear-side physical charger hit, not a fictional shield hit',()=>{
    const f=charger({
      origin:new Vec3(0,0,1),
      target:new Vec3(0,0,-10)
    });
    f.fire();
    expect(f.stats.playerWeaponGuardBlocks).toBe(0);
    expect(f.resources.currentHp).toBeLessThan(100);
    expect(f.stats.cpuPlayerHits).toBe(1);
  });
  it('keeps original Rapier cover ahead of the actor as a no-damage gate',()=>{
    const f=charger({
      origin:new Vec3(0,0,-1),
      target:new Vec3(0,0,10),blocked:true
    });
    f.fire();
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.stats.playerWeaponGuardBlocks).toBe(0);
    expect(f.cue).not.toHaveBeenCalled();
    expect(f.beam).toHaveBeenCalledOnce();
  });
  it('preserves frozen T20 centered-ray guard behavior',()=>{
    const f=charger({source:false});
    f.fire();
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.cue).not.toHaveBeenCalled();
  });
});

function impact({source=true,ttlFuse=0,paintRadius=.4}:{
 source?:boolean;ttlFuse?:number;paintRadius?:number
}={}){
  const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const state=game as unknown as Record<string,any>;
  const paint=vi.fn(),fuse=vi.fn(),fx=vi.fn();
  const stats:Record<string,any>={stringerFuses:0,projectileImpacts:0};
  const slot={
    b346LaunchId:undefined,active:true,
    team:Team.A,sourceKind:'HUMAN',sourceId:'human',
    weaponId:'chord-stringer',
    delayedBurstSeconds:ttlFuse,
    delayedBurstRadius:1,delayedBurstDamage:30,
    delayedBurstPaintRadius:.7,
    blastRadius:0,blastDamage:0,
    paintRadius,velocity:new Vec3(0,0,-1),
    position:new Vec3(),entity:{enabled:true}
  };
  Object.assign(state,{
    nativeSourceHumanPhysicalMode:source?()=> 'HUMAN':null,
    delayedBursts:[],stats,
    paintWorldStamp:paint,
    feedback:{stringerFuse:fuse,impact:fx}
  });
  const finish=(reason:string,point=new Vec3(0,1,-2))=>
    (game as any).finishProjectile(slot,point,null,reason);
  return {game,state,slot,paint,fuse,fx,finish,stats};
}

describe('real SOURCE impact authority (no TTL ghost ink or phantom STRINGER fuse)',()=>{
  it('does not project unsupported SOURCE HUMAN TTL ink onto nearby unhit surfaces',()=>{
    const f=impact({source:true,ttlFuse:0});
    f.finish('TTL');
    expect(f.paint).not.toHaveBeenCalled();
    expect(f.stats.projectileImpacts).toBe(1);
    expect(f.slot.active).toBe(false);
    expect(f.fx).toHaveBeenCalledOnce();
  });
  it('does not create a STRINGER damage fuse in open air after genuine SOURCE TTL',()=>{
    const f=impact({source:true,ttlFuse:.75});
    f.finish('TTL');
    expect(f.state.delayedBursts).toHaveLength(0);
    expect(f.stats.stringerFuses).toBe(0);
    expect(f.fuse).not.toHaveBeenCalled();
    expect(f.paint).not.toHaveBeenCalled();
  });
  it('preserves real contact-triggered SOURCE STRINGER fuse and delayed damage',()=>{
    const f=impact({source:true,ttlFuse:.75});
    f.finish('ORIGINAL_SOLID',new Vec3(0,1,-2));
    expect(f.state.delayedBursts).toHaveLength(1);
    expect(f.state.delayedBursts[0].damage).toBe(30);
    expect(f.stats.stringerFuses).toBe(1);
    expect(f.fuse).toHaveBeenCalledOnce();
    expect(f.paint).not.toHaveBeenCalled();
  });
  it('does not fabricate ink at a SOURCE actor contact without an original paint hit',()=>{
    const f=impact({source:true,ttlFuse:0});
    f.finish('REAL_CPU_HIT');
    expect(f.paint).not.toHaveBeenCalled();
    expect(f.stats.projectileImpacts).toBe(1);
  });
  it('preserves frozen T20 TTL projected paint and legacy charged fuse',()=>{
    const f=impact({source:false,ttlFuse:.75});
    f.finish('TTL');
    expect(f.paint).toHaveBeenCalledOnce();
    expect(f.state.delayedBursts).toHaveLength(1);
    expect(f.stats.stringerFuses).toBe(1);
    expect(f.fuse).toHaveBeenCalledOnce();
  });
});
