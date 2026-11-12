import {describe,it,expect,vi} from 'vitest';
import {b371RealSourceMissionCue} from '../app/B371RealSourceMissionCue';
import {ProjectileSystem} from './ProjectileSystem';
import {SubWeaponSystem} from '../subweapon/SubWeaponSystem';
import {CpuKitSystem} from '../ai/CpuKitSystem';
import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {b343CanLaunchSourceVolley as allow,b343SourceShooterPracticeHref} from './B343OriginalSourceVolleyBudget';
describe('B343 real SOURCE volley capacity',()=>{
 it('rejects exhausted or partial physical pool without synthetic slots',()=>{
  expect(allow(0,1)).toBe(false);
  expect(allow(1,2)).toBe(false);
  expect(allow(2,2)).toBe(true);
  expect(allow(128,1)).toBe(true);
 });
 it('fails closed on invalid or fractional resource values',()=>{
  for(const n of [NaN,-1,0,1.5,Infinity])expect(allow(8,n)).toBe(false);
  for(const n of [NaN,-1,1.5,Infinity])expect(allow(n,1)).toBe(false);
 });
 it('real capacity conserves every 1 to 8 shot burst for 0 to 128 slots',()=>{
  for(let f=0;f<=128;f++)
   for(let n=1;n<=8;n++)expect(allow(f,n)).toBe(f>=n);
 });
});

describe('one-click genuine SOURCE shooter practice',()=>{
 const url='https://example.test/browser-ink-tps/?t21Play=preview&t21QaDrive=source&t21W10B348=sourceShooterAccuracyCandidate';
 it('boots a clean new 180s round with real physical pool protection and ink cues',()=>{
  const target=new URL(b343SourceShooterPracticeHref(url,true)!);
  expect(target.pathname).toBe('/browser-ink-tps/');
  for(const [k,v] of [
   ['t21Play','preview'],['t21QaDrive','source'],
   ['t21W10B183','firstDropPlay'],
   ['t21W10B192','humanCombat'],['t21W10B112','humanGround'],
   ['t21W10B203','fullRound'],
   ['t21W10B343','sourceVolleyAtomic'],
   ['t21W10B345','sourceShooterOpening'],
   ['t21W10B346','nativeShooterPhysicsWitness'],
   ['t21W10B348','sourceShooterAccuracyCandidate'],
   ['t21W10B351','realCpuHitCue'],
   ['t21W10B367','realCpuLifecycle'],
   ['t21W10B368','physicalEnemyFrontier'],
   ['t21W10B355','realInkHud'],
   ['t21W10B356','realImpactReticle']
  ] as [string,string][])expect(target.searchParams.get(k)).toBe(v);
  expect(target.searchParams.get('t21W10B348')).toBe('sourceShooterAccuracyCandidate');
  expect(target.searchParams.get('t21W10B351')).toBe('realCpuHitCue');
  expect(target.searchParams.has('t21W10B193')).toBe(false);
  expect(target.searchParams.has('t21QaInput')).toBe(false);
  expect(target.searchParams.has('cpuWarp')).toBe(false);
  expect(target.searchParams.has('t21W10B193')).toBe(false);
  expect(target.searchParams.has('t21QaInput')).toBe(false);
 });
 it('a true fresh-world circuit retry preserves every genuine shooter opt-in',()=>{
  const selected=b343SourceShooterPracticeHref(url,true)!;
  expect(b343SourceShooterPracticeHref(selected,true)).toBe(selected);
  const query=new URL(selected).searchParams;
  expect(query.get('t21W10B183')).toBe('firstDropPlay');
  expect(query.get('t21W10B192')).toBe('humanCombat');
  expect(query.get('t21W10B203')).toBe('fullRound');
  expect(query.get('t21W10B351')).toBe('realCpuHitCue');
  expect(query.has('t21W10B193')).toBe(false);
 });
 it('returns to baseline without retaining research flags',()=>{
  const target=b343SourceShooterPracticeHref(url,true)!;
  const reset=new URL(b343SourceShooterPracticeHref(target,false)!);
  expect(reset.searchParams.toString()).toBe('t21Play=preview&t21QaDrive=source');
 });
 it('rejects non-SOURCE or production pages',()=>{
  for(const x of ['https://example.test/',
   'https://example.test/?t21Play=preview',
   'https://example.test/?t21Play=preview&t21QaDrive=other'])
   expect(b343SourceShooterPracticeHref(x,true)).toBeNull();
 });
});

describe('B372 actual SOURCE physical shooter HUD budget integration',()=>{
 it('reflects the same real B343 free-slot contract with zero score authority',()=>{
  const original={originalStage:[25,17,26,0] as [number,number,number,number],
   genuineSourceShooterSelected:true,nativeTick:1550,
   status:'PAINT_ON_RAISED' as const,originalSourceLocalClear:false,
   realGroundedTravelMeters:11.2,requiredGroundedTravelMeters:2,
   realFreshHumanImpactCells:0,requiredFreshHumanImpactCells:60,
   actualHumanImpactEvents:0,sourceInkOnly:true,realAcceptedShots:9,
   actualInkPercent:100,playerAlive:true,
   matchState:'PLAYING' as const,stopped:false,
   shooterResources:{inkUnits:100,shotInkCostUnits:8,
    freePhysicalSlots:0,physicalPoolSize:128,
    realDryFireAttempts:0,realPoolRejections:1}
  };
  expect(allow(original.shooterResources.freePhysicalSlots,1)).toBe(false);
  expect(b371RealSourceMissionCue(original)).toMatchObject({
   step:'PAINT',progress:2,resourceState:'PHYSICAL_POOL_FULL',
   observedPoolRejections:1,crossTeamRouteCertified:false,
   physicalEnemyHitCertified:false,scoreablePromotions:0,gameplayWrites:0});
  original.shooterResources.freePhysicalSlots=1;
  expect(allow(original.shooterResources.freePhysicalSlots,1)).toBe(true);
  expect(b371RealSourceMissionCue(original)?.resourceState).toBe('INK_AND_SLOT_AVAILABLE');
  original.shooterResources.inkUnits=4;
  expect(b371RealSourceMissionCue(original)?.resourceState).toBe('LOW_INK');
 });
});

describe('B384 actual SOURCE life witness alongside canonical B343 native volley',()=>{
 const stage={id:'undertow-t21d-partial-connectivity-qa',solids:25,
  paint:17,nav:26,scoreable:0};
 const subject=(budget:boolean,fair:boolean,surfaceCount=17)=>{
  // Isolated internal wiring test: no mock CPU damage, no physics/world
  // simulation and no Chromium. Invoke the ORIGINAL method on its class.
  const p=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  Object.assign(p,{surfaces:Array.from({length:surfaceCount},()=>({})),
   b343SourceVolleyAtomic:budget,sourceCpuFairVolleyDispatch:fair,
   b367Enabled:false,b367SelectedRealLoadout:false,
   b367RealHumanCpuHits:0,b367PhysicalEvents:[]});
  return p;
 };
 it('allows the real canonical B343 budget + fair CPU dispatch + B384 life observer',()=>{
  const x=subject(true,true);
  expect(()=>x.enableB384SelectedSourceCpuLifeWitness(stage)).not.toThrow();
  expect(x.b343OriginalSourceVolleyBudgetSnapshot).toBeDefined();
  expect(x.b367RealCpuLifecycleEvidenceSnapshot()).toMatchObject({
   enabled:true,physicalHumanCpuHpHits:0,syntheticHits:0,
   actorRelocations:0,scoreable:0,productionAuthorized:false
  });
 });
 it('still rejects standalone B343 researcher wiring without canonical dispatch',()=>{
  expect(()=>subject(true,false).enableB384SelectedSourceCpuLifeWitness(stage))
   .toThrow('B384_NATIVE_SOURCE_LIFECYCLE_AUTHORITY_HOLD');
 });
 it('preserves historical non-B343 B384 life witness',()=>{
  expect(()=>subject(false,false).enableB384SelectedSourceCpuLifeWitness(stage))
   .not.toThrow();
 });
 it('rejects unregistered stage size, score authority and missing source paint',()=>{
  for(const mutation of [
   {solids:24},{paint:16},{nav:27},{scoreable:1},{id:'other'}
  ]){
   expect(()=>subject(true,true).enableB384SelectedSourceCpuLifeWitness({
    ...stage,...mutation
   })).toThrow('B384_NATIVE_SOURCE_LIFECYCLE_AUTHORITY_HOLD');
  }
  expect(()=>subject(true,true,16).enableB384SelectedSourceCpuLifeWitness(stage))
   .toThrow('B384_NATIVE_SOURCE_LIFECYCLE_AUTHORITY_HOLD');
 });
});


describe('physical original Rapier precedence over near-coplanar paint',()=>{
 const direct=(nativeSource:boolean,paintDistance:number)=>{
  // The actual SOURCE ray function, with collision READS only.
  // No fake HP, game physics, navigation or paint writes are made.
  const subject=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const paint={distance:paintDistance,
   worldPoint:new Vec3(0,0,paintDistance),surface:{id:'original-paint'}};
  Object.assign(subject,{
   nativeSourceHumanPhysicalMode:nativeSource?()=> 'HUMAN':null,
   findNearestSurfaceHit:()=>paint,
   physics:{castStageSegment:()=>({
    distance:5,point:new Vec3(0,0,5),solidId:'registered-original-cover'
   })},
   combatTargets:{findNearestHit:()=>null},
   cpuAgents:{findNearestCombatHit:()=>null}
  });
  const ray=subject as unknown as {resolveDirectRay:(
   from:Vec3,direction:Vec3,range:number,team:Team,damage:number
  )=>{point:Vec3;paintHit:unknown;hitCombat:boolean}};
  return ray.resolveDirectRay(new Vec3(),new Vec3(0,0,1),15,Team.A,60);
 };
 it('SOURCE charger stops at nearest real wall, not paint 5cm behind',()=>{
  const impact=direct(true,5.05);
  expect(impact.point.z).toBeCloseTo(5,8);
  expect(impact.paintHit).toBeNull();
  expect(impact.hitCombat).toBe(false);
 });
 it('SOURCE can still paint a surface physically ahead of original cover',()=>{
  const impact=direct(true,4.95);
  expect(impact.point.z).toBeCloseTo(4.95,8);
  expect(impact.paintHit).not.toBeNull();
 });
 it('legacy non-SOURCE paint epsilon and play remains unchanged',()=>{
  const impact=direct(false,5.05);
  expect(impact.point.z).toBeCloseTo(5.05,8);
  expect(impact.paintHit).not.toBeNull();
 });
});


describe('SOURCE trail paint stops at original contact',()=>{
 const oneActualProjectile=(nativeSource:boolean,
   paintDistance:number|null,blockDistance:number|null)=>{
  // Execute the real 60Hz projectile method; intercept only I/O.
  // No fake CPU navigation, ownerGrid, score, clock or actor writes.
  const projectile=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const trail=vi.fn(),impact=vi.fn(),finish=vi.fn((slot:{active:boolean})=>{
   slot.active=false;
  });
  const slot={
   active:true,position:new Vec3(),previousPosition:new Vec3(),
   velocity:new Vec3(0,0,5),gravity:0,ttl:2,
   trailPaintRadius:.34,trailPaintCooldown:0,
   team:Team.B,sourceKind:'CPU',sourceId:'B2',paintRadius:.3,
   qaSourceAim:undefined,entity:{setPosition:vi.fn()}
  };
  const paint=paintDistance===null?null:{
   distance:paintDistance,worldPoint:new Vec3(0,0,paintDistance),
   surface:{id:'registered-original-paint'}
  };
  const blocker=blockDistance===null?null:{
   distance:blockDistance,point:new Vec3(0,0,blockDistance),
   solidId:'registered-original-wall'
  };
  Object.assign(projectile,{
   b367NativeFrame:0,playerWeaponId:'pulse-sprayer',
   fireCooldown:0,wasFireHeld:false,burstCooldown:0,
   rollPaintCooldown:0,meleeCooldown:0,
   dualiesFocusSeconds:0,guardBreakSeconds:0,guardHp:100,
   stats:{},feedback:{updateChargeVisual:vi.fn()},
   currentHumanPosition:new Vec3(),currentHumanAimDirection:new Vec3(),
   delta:new Vec3(),slots:[slot],queuedCpuShots:[],
   nativeSourceHumanPhysicalMode:nativeSource?()=> 'HUMAN':null,
   updateGuardVisual:vi.fn(),processDelayedBursts:vi.fn(),
   spawnQueuedCpuShots:vi.fn(),paintWorldStamp:trail,
   findNearestSurfaceHit:()=>paint,
   physics:{castStageSegment:()=>blocker},
   combatTargets:{findNearestHit:()=>null},
   cpuAgents:{findNearestCombatHit:()=>null},
   finishProjectile:finish,enqueueImpact:impact
  });
  projectile.fixedUpdate(.2,false,false,new Vec3(),new Vec3(0,0,1),
   Team.A,new Vec3(),false,false);
  return {trail,impact,finish,slot};
 };
 it('does NOT deposit behind a nearer registered wall when CPU SLOSHER ends',()=>{
  const out=oneActualProjectile(true,.55,.5);
  expect(out.trail).not.toHaveBeenCalled();
  expect(out.impact).not.toHaveBeenCalled();
  expect(out.finish).toHaveBeenCalledWith(
   expect.anything(),expect.anything(),null,'ORIGINAL_SOLID'
  );
  expect(out.slot.active).toBe(false);
 });
 it('uses only the real registered paint impact on a terminal paint tick',()=>{
  const out=oneActualProjectile(true,.45,.5);
  expect(out.trail).not.toHaveBeenCalled();
  expect(out.impact).toHaveBeenCalledTimes(1);
  expect(out.slot.active).toBe(false);
 });
 it('retains actual midair source trail in unobstructed flight',()=>{
  const out=oneActualProjectile(true,null,null);
  expect(out.trail).toHaveBeenCalledTimes(1);
  expect(out.finish).not.toHaveBeenCalled();
  expect(out.slot.active).toBe(true);
 });
 it('leaves frozen non-SOURCE midair trail on a terminal tick unchanged',()=>{
  const out=oneActualProjectile(false,.55,.5);
  expect(out.trail).toHaveBeenCalledTimes(1);
  expect(out.slot.active).toBe(false);
 });
});


describe('native original SOURCE SUB collision precedence (real 60Hz methods)',()=>{
 const contact=(kind:'human'|'cpu',native:boolean,paintDist:number,solidDist:number)=>{
  const human=kind==='human';
  const subject=Object.create(
   human?SubWeaponSystem.prototype:CpuKitSystem.prototype
  ) as SubWeaponSystem|CpuKitSystem;
  const observe=vi.fn();
  const bomb={
   active:true,landed:false,launchId:1,
   subId:'pulse-bomb',team:Team.A,actorId:'A2',
   position:new Vec3(),previousPosition:new Vec3(),
   velocity:new Vec3(0,0,20),ttl:3,fuseSeconds:1,
   entity:{setPosition:vi.fn()},
   flightQueryTicks:0,paintCandidateTicks:0,
   rapierCandidateTicks:0,dualCandidateTicks:0,
   contactCandidates:null
  };
  Object.assign(subject,{
   bombs:[bomb],delta:new Vec3(),
   nativeSourceHumanSubBodyContactEnabled:human&&native,
   nativeOriginalSourceCombatantSubContactEnabled:!human&&native,
   onNativeExplosion:null,
   physics:{castStageSegment:()=>({
    solidId:'registered-original-cover',distance:solidDist,
    point:new Vec3(0,0,solidDist)
   })},
   findNearestSurfaceHit:()=>({
    distance:paintDist,worldPoint:new Vec3(0,0,paintDist),
    surface:{id:'original-paint'}
   }),
   cpuAgents:{findNearestCombatHit:()=>null},
   projectiles:{findNativeSourceHumanPhysicalHit:()=>null},
   onContact:observe,onBombContact:observe
  });
  if(human)(subject as SubWeaponSystem).fixedUpdate(.05);
  else (subject as unknown as {updateBombs:(dt:number)=>void})
   .updateBombs(.05);
  return observe.mock.calls[0] as unknown[]|undefined;
 };
 for(const kind of ['human','cpu'] as const){
  it(kind+' SOURCE SUB stops on nearer registered original Rapier wall',()=>{
   const args=contact(kind,true,.55,.5);
   expect(args).toBeDefined();
   expect((args![2] as Vec3).z).toBeCloseTo(.5,8);
   if(kind==='human')expect(args![3]).toBe('RAPIER_STAGE_SOLID');
  });
  it(kind+' SOURCE SUB still contacts legitimate paint in front of wall',()=>{
   const args=contact(kind,true,.45,.5);
   expect(args).toBeDefined();
   expect((args![2] as Vec3).z).toBeCloseTo(.45,8);
   if(kind==='human')expect(args![3]).toBe('PAINT_SURFACE_SEGMENT');
  });
  it(kind+' legacy non-SOURCE retains historic 6cm paint priority',()=>{
   const args=contact(kind,false,.55,.5);
   expect(args).toBeDefined();
   expect((args![2] as Vec3).z).toBeCloseTo(.55,8);
  });
 }
});
