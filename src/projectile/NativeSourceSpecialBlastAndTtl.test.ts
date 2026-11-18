import {describe,expect,it,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {PlayerResources} from '../combat/PlayerResources';
import type {PerformanceStats} from '../core/PerformanceStats';
import {ProjectileSystem} from './ProjectileSystem';
import {SubWeaponSystem} from '../subweapon/SubWeaponSystem';
import {CpuKitSystem} from '../ai/CpuKitSystem';

/** Call production physical damage and source 60Hz projectile methods.
 * Isolated stage/CPU adapters are NOT an invented native gameplay round. */
function physicalCombat({
  source=true,guard=false,origin=new Vec3(0,0,-0.6),velocity=60,ttl=0.009
}:{
  source?:boolean;guard?:boolean;origin?:Vec3;velocity?:number;ttl?:number
}={}){
  const stats:Record<string,any>={
    playerDamageTaken:0,cpuPlayerHits:0,
    playerWeaponGuardBlocks:0,playerWeaponGuardHp:100,
    playerWeaponAction:'READY',playerGrounded:true,shotsFired:0,
    projectileImpacts:0,activeProjectiles:0
  };
  const resources=new PlayerResources(stats as PerformanceStats);
  const impacts=vi.fn(),cues=vi.fn();
  const slot={
    active:true,position:origin.clone(),previousPosition:origin.clone(),
    velocity:new Vec3(0,0,velocity),gravity:0,ttl,
    team:Team.B,sourceKind:'CPU',sourceId:'B1',
    weaponId:'pulse-sprayer',damage:34,paintRadius:0,
    blastRadius:0,blastDamage:0,
    delayedBurstSeconds:0,delayedBurstRadius:0,
    delayedBurstDamage:0,delayedBurstPaintRadius:0,
    trailPaintRadius:0,trailPaintCooldown:0,
    entity:{enabled:true,setPosition:vi.fn()}
  };
  const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const state=game as unknown as Record<string,any>;
  Object.assign(state,{
    nativeSourceHumanPhysicalMode:source?()=> 'HUMAN':null,
    stats,resources,slots:[slot],delta:new Vec3(),
    playerWeaponId:'canopy-guard',
    guardHp:100,guardBreakSeconds:0,
    b367NativeFrame:10,nativeHumanDamageCueFrame:-1,
    currentHumanPosition:new Vec3(),
    currentHumanAimDirection:new Vec3(0,0,-1),
    currentHumanTeam:Team.A,currentHumanDamageable:true,
    currentHumanGuarding:guard,
    fireCooldown:0,burstCooldown:0,rollPaintCooldown:0,
    meleeCooldown:0,dualiesFocusSeconds:0,
    chargeSeconds:0,wasFireHeld:false,queuedCpuShots:[],
    guardEntity:{enabled:false},
    feedback:{
      updateChargeVisual:vi.fn(),impact:impacts,
      confirmedNativeHumanDamage:cues
    },
    updateGuardVisual:vi.fn(),processDelayedBursts:vi.fn(),
    spawnQueuedCpuShots:vi.fn(),
    findNearestSurfaceHit:()=>null,
    physics:{castStageSegment:()=>null},
    combatTargets:{findNearestHit:()=>null,applyAreaDamage:vi.fn()},
    cpuAgents:{findNearestCombatHit:()=>null,applyAreaDamage:vi.fn()}
  });
  const shot=()=>game.fixedUpdate(
    1/60,false,guard,new Vec3(),new Vec3(0,0,-1),
    Team.A,new Vec3(),true,true);
  const blast=(point:Vec3,damage:number,radius=2)=>
    game.applyExternalAreaDamage(point,radius,damage,Team.B);
  return {game,state,slot,stats,resources,impacts,cues,shot,blast};
}

describe('native SOURCE final projectile lifetime and actual collision',()=>{
  it('resolves a real player capsule contact in the remaining TTL fraction',()=>{
    const f=physicalCombat();
    f.shot();
    expect(f.resources.currentHp).toBe(66);
    expect(f.stats.playerDamageTaken).toBe(34);
    expect(f.stats.cpuPlayerHits).toBe(1);
    expect(f.cues).toHaveBeenCalledOnce();
    expect(f.slot.active).toBe(false);
    expect(f.stats.projectileImpacts).toBe(1);
  });
  it('does not extend a terminal shot beyond its actual lifetime',()=>{
    const f=physicalCombat({origin:new Vec3(0,0,-2),ttl:.003});
    f.shot();
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.slot.active).toBe(false);
    expect(f.impacts).toHaveBeenCalledOnce();
    expect((f.impacts.mock.calls[0]![1] as Vec3).z).toBeCloseTo(-1.82,5);
  });
  it('keeps a registered nearer Rapier wall authoritative during the final fraction',()=>{
    const f=physicalCombat();
    f.state.physics.castStageSegment=()=>({
      distance:.10,point:new Vec3(0,0,-.5),solidId:'real-wall'
    });
    f.shot();
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.slot.active).toBe(false);
    expect((f.impacts.mock.calls[0]![1] as Vec3).z).toBeCloseTo(-.5,5);
  });
  it('does not change frozen T20 terminal-tick behavior',()=>{
    const f=physicalCombat({source:false});
    f.shot();
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect((f.impacts.mock.calls[0]![1] as Vec3).z).toBeCloseTo(-.6,5);
  });
});

describe('native SOURCE real SUB/SPECIAL area damage and guard direction',()=>{
  it('does not grant a front shield for a genuine body-centered explosion',()=>{
    const f=physicalCombat({guard:true});
    f.blast(new Vec3(),35);
    expect(f.stats.playerWeaponGuardBlocks).toBe(0);
    expect(f.resources.currentHp).toBe(65);
    expect(f.stats.playerDamageTaken).toBe(35);
    expect(f.stats.cpuPlayerHits).toBe(1);
    expect(f.cues).toHaveBeenCalledWith(Team.B,expect.any(Vec3),35);
  });
  it('blocks an actual front-side blast but not a rear-side blast',()=>{
    const f=physicalCombat({guard:true});
    f.blast(new Vec3(0,0,-1),25);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.stats.playerWeaponGuardHp).toBe(75);
    expect(f.stats.cpuPlayerHits).toBe(0);
    f.blast(new Vec3(0,0,1),25);
    expect(f.resources.currentHp).toBe(75);
    expect(f.stats.playerDamageTaken).toBe(25);
    expect(f.stats.cpuPlayerHits).toBe(1);
  });
  it('does not shield a SOURCE explosion contacting the true rear hemisphere',()=>{
    // The authentic damage path previously reused T20's -0.10
    // tolerance: lateral x=.25, rear z=+.02 incorrectly blocked.
    const f=physicalCombat({guard:true});
    f.blast(new Vec3(.25,0,.02),24,1);
    expect(f.resources.currentHp).toBe(76);
    expect(f.stats.playerWeaponGuardBlocks).toBe(0);
    expect(f.stats.playerDamageTaken).toBe(24);
    expect(f.stats.cpuPlayerHits).toBe(1);
    expect(f.cues).toHaveBeenCalledOnce();
  });
  it('still shields the corresponding real front-half SOURCE blast',()=>{
    const f=physicalCombat({guard:true});
    f.blast(new Vec3(.25,0,-.02),24,1);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.stats.playerWeaponGuardHp).toBe(76);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.cues).not.toHaveBeenCalled();
  });
  it('retains the T20 slightly-rear guard tolerance outside SOURCE',()=>{
    const f=physicalCombat({source:false,guard:true});
    f.blast(new Vec3(.25,0,.02),24,1);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.stats.cpuPlayerHits).toBe(0);
  });
  it('preserves actual SOURCE HP when CPU blast has no human aim snapshot',()=>{
    // Integration #44075590121 exposed a missing headless native aim
    // vector even though genuine SOURCE human guard was inactive.
    // Never attempt shield-dot math or invent a shield block here.
    for(const guard of [false,true]){
      const f=physicalCombat({guard});
      f.state.currentHumanAimDirection=undefined;
      f.blast(new Vec3(.1,0,-1),25,2);
      expect(f.resources.currentHp).toBe(75);
      expect(f.stats.playerDamageTaken).toBe(25);
      expect(f.stats.cpuPlayerHits).toBe(1);
      expect(f.stats.playerWeaponGuardBlocks).toBe(0);
      expect(f.cues).toHaveBeenCalledOnce();
    }
  });
  it('retains the old T20 body-centered explosion shield contract',()=>{
    const f=physicalCombat({source:false,guard:true});
    f.blast(new Vec3(),30);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.playerWeaponGuardBlocks).toBe(1);
    expect(f.stats.cpuPlayerHits).toBe(0);
  });
  it('rejects blocked SOURCE explosive HP through registered stage cover',()=>{
    const f=physicalCombat({guard:false});
    f.state.physics.castStageSegment=()=>({distance:.2});
    f.blast(new Vec3(0,0,-1),70);
    expect(f.resources.currentHp).toBe(100);
    expect(f.stats.playerDamageTaken).toBe(0);
    expect(f.stats.cpuPlayerHits).toBe(0);
    expect(f.cues).not.toHaveBeenCalled();
  });
  it('blocks true SOURCE blast HP when real original wall is just 1cm before human body',()=>{
    const near=physicalCombat({guard:false});
    near.state.physics.castStageSegment=vi.fn(()=>({
      distance:.99,solidId:'UndertowT21D:other-original-wall'
    }));
    near.blast(new Vec3(0,0,-1),30,2);
    expect(near.resources.currentHp).toBe(100);
    expect(near.stats.playerDamageTaken).toBe(0);
    expect(near.stats.cpuPlayerHits).toBe(0);
    expect(near.cues).not.toHaveBeenCalled();
    const clear=physicalCombat({guard:false});
    clear.blast(new Vec3(0,0,-1),30,2);
    expect(clear.resources.currentHp).toBe(70);
    expect(clear.stats.playerDamageTaken).toBe(30);
    expect(clear.stats.cpuPlayerHits).toBe(1);
    // Frozen T20 never adopted this SOURCE-only collision veto.
    const t20=physicalCombat({source:false,guard:false});
    t20.state.physics.castStageSegment=vi.fn(()=>({distance:.99}));
    t20.blast(new Vec3(0,0,-1),30,2);
    expect(t20.resources.currentHp).toBe(70);
  });
  it('retains actual layered SUB damage and never counts damage beyond HP zero',()=>{
    const f=physicalCombat({guard:false});
    const center=new Vec3(0,0,-1);
    f.blast(center,35,2.4);
    f.blast(center,85,1);
    expect(f.resources.currentHp).toBe(0);
    expect(f.stats.playerDamageTaken).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(2);
    expect(f.cues).toHaveBeenCalledOnce();
    f.blast(center,50,2.4);
    expect(f.stats.playerDamageTaken).toBe(100);
    expect(f.stats.cpuPlayerHits).toBe(2);
  });
});

describe('native SOURCE thrown human/CPU bombs resolve REAL final TTL fraction',()=>{
 const dt=1/60,ttl=.004,speed=12;
 type Kind='HUMAN'|'CPU';
 const make=(kind:Kind,source:boolean,solidAt:number|null)=>{
  const bomb:any={
   active:true,landed:false,subId:'pulse-bomb',
   team:kind==='HUMAN'?Team.A:Team.B,actorId:'B1',
   ttl,fuseSeconds:1,position:new Vec3(),previousPosition:new Vec3(),
   velocity:new Vec3(0,0,speed),
   contactKind:'NONE',contactSourceId:null,contactPoint:null,
   entity:{setPosition:vi.fn()}
  };
  const physical=vi.fn((_a:Vec3,to:Vec3)=>solidAt!==null&&
    to.z>=solidAt?{distance:solidAt,
     point:new Vec3(0,0,solidAt),solidId:'ORIGINAL_WALL'}:null);
  const receiver:any=Object.create(
   kind==='HUMAN'?SubWeaponSystem.prototype:CpuKitSystem.prototype);
  receiver.bombs=[bomb];receiver.delta=new Vec3();
  receiver.physics={castStageSegment:physical};
  receiver.findNearestSurfaceHit=vi.fn(()=>null);
  receiver.cpuAgents={findNearestCombatHit:vi.fn(()=>null)};
  receiver.nativeSourceHumanSubBodyContactEnabled=kind==='HUMAN'&&source;
  receiver.nativeOriginalSourceCombatantSubContactEnabled=
    kind==='CPU'&&source;
  receiver.projectiles={findNativeSourceHumanPhysicalHit:vi.fn(()=>null)};
  const burst=vi.fn();
  receiver.explode=burst;receiver.explodeBomb=burst;
  receiver.feedback={subFuse:vi.fn()};
  const tick=()=>kind==='HUMAN'?
    (SubWeaponSystem.prototype.fixedUpdate.call(receiver,dt)):
    (CpuKitSystem.prototype as unknown as {
      updateBombs:(this:CpuKitSystem,dt:number)=>void
    }).updateBombs.call(receiver,dt);
  return {bomb,receiver,physical,burst,tick};
 };
 for(const kind of ['HUMAN','CPU'] as const){
  it(kind+' reaches only remaining TTL flight distance and bursts at real endpoint',()=>{
   const x=make(kind,true,null);
   x.tick();
   expect(x.physical).toHaveBeenCalledOnce();
   expect(x.bomb.position.z).toBeCloseTo(speed*ttl,6);
   expect(x.bomb.position.z).toBeLessThan(speed*dt);
   expect(x.burst).toHaveBeenCalledOnce();
   if(kind==='HUMAN')expect(x.burst.mock.calls[0]![2]).toBe('FLIGHT_TTL');
  });
  it(kind+' hits the original wall inside the last TTL fraction and bursts THERE',()=>{
   const x=make(kind,true,.035);
   x.tick();
   expect(x.physical).toHaveBeenCalledOnce();
   expect(x.bomb.position.z).toBeCloseTo(.035,6);
   expect(x.bomb.landed).toBe(false);
   expect(x.burst).toHaveBeenCalledOnce();
   if(kind==='HUMAN'){
    expect(x.bomb.contactKind).toBe('RAPIER_STAGE_SOLID');
    expect(x.bomb.contactSourceId).toBe('ORIGINAL_WALL');
    expect(x.burst.mock.calls[0]![2]).toBe('FLIGHT_TTL');
   }
  });
  it(kind+' does not reach a physical wall beyond remaining TTL; legacy T20 unchanged',()=>{
   const native=make(kind,true,.06);native.tick();
   expect(native.bomb.position.z).toBeCloseTo(.048,6);
   expect(native.burst).toHaveBeenCalledOnce();
   const legacy=make(kind,false,.035);legacy.tick();
   expect(legacy.bomb.position.z).toBe(0);
   expect(legacy.physical).not.toHaveBeenCalled();
   expect(legacy.burst).toHaveBeenCalledOnce();
  });
 }
});
