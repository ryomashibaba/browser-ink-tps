import { Vec3 } from 'playcanvas';
import { describe, expect, it, vi } from 'vitest';
import { GameplayInkSystem } from './GameplayInkSystem';
import { PaintSurface,sourceRegisteredPaintCellActive,sourceRegisteredPaintHitActive,
 sourceThrownSubPaintBeforeRegisteredSolid,sourceOriginalBlastPaintLineClear } from './PaintSurface';
import {ProjectileSystem} from '../projectile/ProjectileSystem';
import {CpuKitSystem} from '../ai/CpuKitSystem';
import {SubWeaponSystem} from '../subweapon/SubWeaponSystem';
import type {SurfaceRayHit} from './PaintSurface';
import {
  PaintEventType,
  PaintSource,
  SurfaceFlags,
  Team
} from './types';
import type { StageFootprint } from '../stage/StageFootprint';

const scoreableFloor =
  SurfaceFlags.Paintable |
  SurfaceFlags.Swimmable |
  SurfaceFlags.Scoreable |
  SurfaceFlags.Floor;

const footprint: StageFootprint = {
  outer: [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4]
  ],
  holes: [[
    [1, 1],
    [3, 1],
    [3, 3],
    [1, 3]
  ]],
  cellSizeMeters: 1
};

function surface(masked: boolean): PaintSurface {
  return new PaintSurface(
    masked ? 'masked' : 'rect',
    new Vec3(0, 0, 0),
    new Vec3(1, 0, 0),
    new Vec3(0, 0, 1),
    4,
    4,
    1,
    scoreableFloor,
    2,
    masked ? footprint : undefined
  );
}

describe('PaintSurface footprint authority', () => {
  it('uses the same footprint for ray projection, active cells and score area', () => {
    const value = surface(true);

    expect(value.projectWorldPoint(new Vec3(0, 0, 0)).inside).toBe(false);
    expect(value.projectWorldPoint(new Vec3(-1.5, 0, -1.5)).inside).toBe(true);
    expect(value.intersectRay(new Vec3(0, 2, 0), new Vec3(0, -1, 0))).toBeNull();
    expect(value.isCellActive(1, 1)).toBe(false);
    expect(value.flagsGrid[value.index(1, 1)]).toBe(0);
    expect(value.scoreableAreaMeters2).toBe(12);
    expect(value.activeFootprintRectangles).not.toBeNull();
  });

  it('prevents authoritative CPU paint from entering footprint holes', () => {
    const gameplay = new GameplayInkSystem();
    const value = surface(true);
    gameplay.registerSurface(value);

    const result = gameplay.apply({
      tick: 1,
      source: PaintSource.Debug,
      team: Team.A,
      surfaceId: value.id,
      centerU: 2,
      centerV: 2,
      radiusU: 5,
      radiusV: 5,
      angle: 0,
      type: PaintEventType.Debug,
      strength: 1
    });

    expect(result.changedCells).toBe(12);
    expect(value.ownerGrid[value.index(1, 1)]).toBe(Team.Neutral);
    expect(gameplay.snapshot()).toMatchObject({
      areaA: 12,
      totalScoreableArea: 12,
      percentA: 100
    });
  });

  it('preserves the frozen legacy rectangle behavior when no footprint exists', () => {
    const value = surface(false);
    expect(value.scoreableAreaMeters2).toBe(16);
    expect(value.activeFootprintRectangles).toBeNull();
    expect(value.projectWorldPoint(new Vec3(0, 0, 0)).inside).toBe(true);
    expect(value.isCellActive(1, 1)).toBe(true);
  });

  it('does not let an inactive footprint raster cell hide valid floor ink', () => {
    const gameplay = new GameplayInkSystem();
    const flags = SurfaceFlags.Paintable | SurfaceFlags.Swimmable | SurfaceFlags.Floor;
    const active = new PaintSurface('registered-floor',new Vec3(0,0,0),
      new Vec3(1,0,0),new Vec3(0,0,1),4,4,1,flags,2);
    // The point is inside this thin outline, but its 1m cell is inactive.
    const thin = new PaintSurface('inactive-raster-neighbor',new Vec3(0,.04,0),
      new Vec3(1,0,0),new Vec3(0,0,1),4,4,1,flags,2,{
        outer:[[1.05,1.05],[1.40,1.05],[1.05,1.40]],
        holes:[],cellSizeMeters:1
      });
    gameplay.registerSurface(thin);
    gameplay.registerSurface(active);
    const point=thin.localToWorld(1.15,1.15).add(new Vec3(0,.04,0));
    expect(thin.projectWorldPoint(point).inside).toBe(true);
    expect(thin.flagsGrid[thin.index(1,1)]).toBe(0);
    expect(gameplay.sampleWorld(point)?.surface.id).toBe('registered-floor');
    expect(gameplay.sampleWorld(point,.4,SurfaceFlags.Swimmable,SurfaceFlags.Wall)
      ?.surface.id).toBe('registered-floor');
    expect(gameplay.sampleWorld(point,.4,SurfaceFlags.Swimmable,SurfaceFlags.Wall,
      s=>s.id===thin.id)).toBeNull();
  });

  it('samples the actually supported original floor before neighboring closer ink',()=>{
    const gameplay=new GameplayInkSystem();
    const sourceFlags=SurfaceFlags.Paintable|SurfaceFlags.Swimmable|SurfaceFlags.Floor;
    const create=(id:string,y:number)=>new PaintSurface(
      id,new Vec3(0,y,0),new Vec3(1,0,0),new Vec3(0,0,1),
      4,4,1,sourceFlags,2
    );
    const supported=create('supported-original-floor',0);
    const adjacent=create('nearby-different-backing',.05);
    gameplay.registerSurface(supported);
    gameplay.registerSurface(adjacent);
    for(const [surfaceId,team] of [
      [supported.id,Team.A],[adjacent.id,Team.B]
    ] as const)gameplay.apply({
      tick:1,source:PaintSource.Debug,team,surfaceId,
      centerU:2,centerV:2,radiusU:1,radiusV:1,angle:0,
      type:PaintEventType.Debug,strength:1
    });
    const foot=new Vec3(0,.06,0);
    const nearest=gameplay.sampleWorld(foot,.4,SurfaceFlags.Swimmable,SurfaceFlags.Wall);
    expect(nearest?.surface.id).toBe(adjacent.id);
    expect(nearest?.owner).toBe(Team.B);
    const sameBacking=gameplay.sampleWorld(
      foot,.4,SurfaceFlags.Swimmable,SurfaceFlags.Wall,
      p=>p.id===supported.id
    );
    expect(sameBacking?.surface.id).toBe(supported.id);
    expect(sameBacking?.owner).toBe(Team.A);
    expect(gameplay.sampleWorld(foot,.4,SurfaceFlags.Swimmable,SurfaceFlags.Wall,
      p=>p.id==='not-a-registered-backing')).toBeNull();
    // The snapshot uses a nonzero denominator even with zero scoreable turf.
    expect(gameplay.snapshot().areaA).toBe(0);
    expect(gameplay.snapshot().areaB).toBe(0);
  });
});

describe('original SOURCE projectile physical hit ignores inactive paint cells',()=>{
 const from=new Vec3(0,3,0),to=new Vec3(0,-5,0);
 const make=(id:string,y:number)=>new PaintSurface(id,
  new Vec3(0,y,0),new Vec3(1,0,0),new Vec3(0,0,1),
  4,4,1,SurfaceFlags.Paintable|SurfaceFlags.Swimmable|SurfaceFlags.Floor,2);
 const hit=(sourceMode:boolean,surfaces:PaintSurface[])=>{
  // Exercise the real ProjectileSystem nearest-plane method. No fake
  // projectile damage, teleport, stage, score or actor is instantiated.
  const receiver=Object.create(ProjectileSystem.prototype) as {
    surfaces:PaintSurface[];
    nativeSourceHumanPhysicalMode:(()=>string)|null
  };
  receiver.surfaces=surfaces;
  receiver.nativeSourceHumanPhysicalMode=sourceMode?()=>'HUMAN':null;
  const pick=(ProjectileSystem.prototype as unknown as {
   findNearestSurfaceHit:(from:Vec3,to:Vec3)=>ReturnType<PaintSurface['intersectSegment']>;
  }).findNearestSurfaceHit;
  return pick.call(receiver as unknown as ProjectileSystem,from,to);
 };
 it('allows an actual SOURCE shot to pass inactive raster and hit the farther registered floor',()=>{
  const near=make('original-hole',0);
  const behind=make('registered-floor-below',-2);
  const index=near.index(2,2);
  near.flagsGrid[index]=0;
  expect(sourceRegisteredPaintHitActive(near,near.intersectSegment(from,to)!))
   .toBe(false);
  expect(hit(true,[near,behind])?.surface.id).toBe(behind.id);
  expect(hit(false,[near,behind])?.surface.id).toBe(near.id);
 });
 it('requires active paintable flags, keeps solid original cover independent',()=>{
  const near=make('original-raster',0);
  expect(hit(true,[near])?.surface.id).toBe(near.id);
  near.flagsGrid[near.index(2,2)]=SurfaceFlags.Swimmable|SurfaceFlags.Floor;
  expect(hit(true,[near])).toBeNull();
  expect(hit(false,[near])?.surface.id).toBe(near.id);
 });
});

describe('true SOURCE human/CPU thrown SUB follows registered paint cells',()=>{
 const make=(id:string,y:number)=>new PaintSurface(id,
   new Vec3(0,y,0),new Vec3(1,0,0),new Vec3(0,0,1),
   4,4,1,SurfaceFlags.Paintable|SurfaceFlags.Swimmable|SurfaceFlags.Floor,2);
 const from=new Vec3(0,3,0),to=new Vec3(0,-5,0);
 function cpuPick(native:boolean,planes:PaintSurface[]):SurfaceRayHit|null{
  const receiver=Object.create(CpuKitSystem.prototype) as {
   surfaces:PaintSurface[];
   nativeOriginalSourceCombatantSubContactEnabled:boolean;
  };
  receiver.surfaces=planes;
  receiver.nativeOriginalSourceCombatantSubContactEnabled=native;
  const f=(CpuKitSystem.prototype as unknown as {
   findNearestSurfaceHit:(a:Vec3,b:Vec3)=>SurfaceRayHit|null
  }).findNearestSurfaceHit;
  return f.call(receiver as unknown as CpuKitSystem,from,to);
 }
 function humanPick(native:boolean,planes:PaintSurface[]):SurfaceRayHit|null{
  const receiver=Object.create(SubWeaponSystem.prototype) as {
   surfaces:PaintSurface[];
   nativeSourceHumanSubBodyContactEnabled:boolean;
  };
  receiver.surfaces=planes;
  receiver.nativeSourceHumanSubBodyContactEnabled=native;
  const f=(SubWeaponSystem.prototype as unknown as {
   findNearestSurfaceHit:(a:Vec3,b:Vec3)=>SurfaceRayHit|null
  }).findNearestSurfaceHit;
  return f.call(receiver as unknown as SubWeaponSystem,from,to);
 }
 it('CPU bomb ignores nonpaintable nearby source raster and reaches real deeper paint',()=>{
  const near=make('unpaintable',0),far=make('paintable',-2);
  near.flagsGrid[near.index(2,2)]=0;
  expect(cpuPick(true,[near,far])?.surface.id).toBe(far.id);
  expect(cpuPick(false,[near,far])?.surface.id).toBe(near.id);
  expect(cpuPick(true,[near])?.surface.id).toBeUndefined();
  expect(cpuPick(true,[far])?.surface.id).toBe(far.id);
 });
 it('human bomb uses same SOURCE raster while preserving legacy T20 contact',()=>{
  const near=make('not-inkable',0),far=make('original-floor',-2);
  near.flagsGrid[near.index(2,2)]=SurfaceFlags.Swimmable;
  expect(humanPick(true,[near,far])?.surface.id).toBe(far.id);
  expect(humanPick(false,[near,far])?.surface.id).toBe(near.id);
  expect(humanPick(true,[near])?.surface.id).toBeUndefined();
  expect(humanPick(true,[far])?.surface.id).toBe(far.id);
 });
});

describe('native SOURCE thrown bombs respect exact registered original Rapier backing',()=>{
 const solidId='UndertowT21D:original-solid';
 const registered=(id:string)=>new PaintSurface(
  id,new Vec3(0,0,0),new Vec3(1,0,0),new Vec3(0,0,1),
  4,4,1,SurfaceFlags.Paintable|SurfaceFlags.Floor,2);
 const physicalHit=(paintId:string,distance:number):SurfaceRayHit=>({
  surface:registered(paintId),distance,
  worldPoint:new Vec3(0,0,distance),u:2,v:2
 });
 const blocker={distance:.5,point:new Vec3(0,0,.5),solidId};
 const tolerance=.06;
 const allowed=(id:string,distance:number,native:boolean)=>
  sourceThrownSubPaintBeforeRegisteredSolid(
   physicalHit(id,distance),blocker,native,tolerance);
 it('retains 6cm on the SAME original Rapier backing; denies another wall behind it',()=>{
  expect(allowed(solidId+':paint',.54,true)).toBe(true);
  expect(allowed(solidId+':paint',.56,true)).toBe(true);
  expect(allowed(solidId+':paint',.57,true)).toBe(false);
  expect(allowed('other-original-floor:paint',.54,true)).toBe(false);
  expect(allowed('other-original-floor:paint',.54,false)).toBe(true);
  expect(allowed('other-original-floor:paint',.40,true)).toBe(true);
  expect(sourceThrownSubPaintBeforeRegisteredSolid(
   physicalHit(solidId+':paint',.54),null,true,tolerance)).toBe(true);
  expect(sourceThrownSubPaintBeforeRegisteredSolid(
   physicalHit(solidId+':paint',.54),
   {distance:.5},true,tolerance)).toBe(false);
 });
 // Execute the REAL native CPU/HUMAN bomb movement and real on-contact
 // ordering. Only the collider-return adapters are isolated; no fake
 // actors, paint, stage writes, original path or Chrome pass is claimed.
 for(const kind of ['HUMAN','CPU'] as const){
  const execute=(native:boolean,paintId:string,distance:number)=>{
   const hit=physicalHit(paintId,distance);
   const slot={active:true,landed:false,subId:'pulse-bomb',
    team:kind==='HUMAN'?Team.A:Team.B,
    position:new Vec3(),previousPosition:new Vec3(),
    velocity:new Vec3(0,0,60),ttl:2,fuseSeconds:1,
    entity:{setPosition:vi.fn()}
   };
   const contact=vi.fn();
   const backing={castStageSegment:vi.fn(()=>blocker)};
   if(kind==='HUMAN'){
    const obj=Object.create(SubWeaponSystem.prototype) as
     SubWeaponSystem;
    Object.assign(obj,{
     bombs:[slot],delta:new Vec3(),physics:backing,
     nativeSourceHumanSubBodyContactEnabled:native,
     cpuAgents:{findNearestCombatHit:vi.fn(()=>null)},
     findNearestSurfaceHit:vi.fn(()=>hit),
     onContact:contact
    });
    obj.fixedUpdate(1/60);
    return {contact,backing};
   }
   const obj=Object.create(CpuKitSystem.prototype) as CpuKitSystem;
   Object.assign(obj,{
    bombs:[slot],delta:new Vec3(),physics:backing,
    nativeOriginalSourceCombatantSubContactEnabled:native,
    cpuAgents:{findNearestCombatHit:vi.fn(()=>null)},
    projectiles:{findNativeSourceHumanPhysicalHit:vi.fn(()=>null)},
    findNearestSurfaceHit:vi.fn(()=>hit),
    onBombContact:contact
   });
   (CpuKitSystem.prototype as unknown as {
    updateBombs:(this:CpuKitSystem,dt:number)=>void
   }).updateBombs.call(obj,1/60);
   return {contact,backing};
  };
  it(kind+' real bomb hits Rapier first when a DIFFERENT registered paint plane is 4cm behind',()=>{
   const {contact,backing}=execute(true,'other-original-floor:paint',.54);
   expect(backing.castStageSegment).toHaveBeenCalledOnce();
   expect(contact).toHaveBeenCalledOnce();
   if(kind==='HUMAN')expect(contact.mock.calls[0]![3]).toBe('RAPIER_STAGE_SOLID');
   expect((contact.mock.calls[0]![kind==='HUMAN'?2:2] as Vec3).z)
    .toBeCloseTo(.5);
  });
  it(kind+' keeps genuine same-backing near-coplanar floor impact and T20 behavior',()=>{
   for(const [native,id] of [[true,solidId+':paint'],[false,'other-original-floor:paint']] as const){
    const {contact}=execute(native,id,.54);
    expect(contact).toHaveBeenCalledOnce();
    if(kind==='HUMAN')expect(contact.mock.calls[0]![3]).toBe('PAINT_SURFACE_SEGMENT');
    expect((contact.mock.calls[0]![2] as Vec3).z).toBeCloseTo(.54);
   }
  });
 }
});

describe('true SOURCE blast paint obeys original Rapier cover on BOTH kits',()=>{
 const origin=new Vec3(0,.06,0);
 const solidId='UndertowT21D:source-floor';
 const paint=()=>new PaintSurface(solidId+':paint',
  new Vec3(0,0,0),new Vec3(1,0,0),new Vec3(0,0,1),
  5,5,1,SurfaceFlags.Paintable|SurfaceFlags.Floor,2);
 it('allows the exact registered backing within 6cm, not unrelated cover',()=>{
  const surface=paint(),to=surface.localToWorld(2.5,2.5);
  const span=origin.distance(to);
  expect(sourceOriginalBlastPaintLineClear(
   origin,to,surface,{distance:Math.max(0,span-.04),solidId})).toBe(true);
  expect(sourceOriginalBlastPaintLineClear(
   origin,to,surface,{distance:Math.max(0,span-.04),
    solidId:'UndertowT21D:other-wall'})).toBe(false);
  expect(sourceOriginalBlastPaintLineClear(
   origin,to,surface,null)).toBe(true);
 });
 for(const kind of ['HUMAN','CPU'] as const){
  const run=(native:boolean,cover:'NONE'|'OTHER_WALL'|'OWN_BACKING',
  coverInsetMeters=.04)=>{
   const surface=paint(),stamps:{surfaceId:string}[]=[];
   const cast=vi.fn((from:Vec3,to:Vec3)=>{
    if(cover==='NONE')return null;
    const span=from.distance(to);
    return {distance:Math.max(0,span-coverInsetMeters),
     solidId:cover==='OWN_BACKING'?solidId:'UndertowT21D:other-wall'};
   });
   const receiver:any=Object.create(kind==='HUMAN'
    ?SubWeaponSystem.prototype:CpuKitSystem.prototype);
   receiver.surfaces=[surface];
   receiver.physics={castStageSegment:cast};
   receiver.coordinator={enqueue:(r:{surfaceId:string})=>stamps.push(r)};
   receiver.currentEnqueuedStampSurfaceIds=null;
   receiver.nativeSourceHumanSubBodyContactEnabled=kind==='HUMAN'&&native;
   receiver.nativeOriginalSourceCombatantSubContactEnabled=kind==='CPU'&&native;
   receiver.stats={cpuSpecialPaintRequestsEnqueued:0};
   if(kind==='HUMAN'){
    const f=(SubWeaponSystem.prototype as unknown as {
     paintExplosion:(this:SubWeaponSystem,team:Team.A|Team.B,
      center:Vec3,radius:number)=>void
    }).paintExplosion;
    f.call(receiver,Team.A,origin,2.25);
   }else{
    const f=(CpuKitSystem.prototype as unknown as {
     paintRadial:(this:CpuKitSystem,actorId:string,
      team:Team.A|Team.B,center:Vec3,paintRadius:number,
      ringRadius:number,count:number,type:PaintEventType,
      gaugeEligible:boolean,ringPaintScale:number,
      ringPlaneDistance:number)=>void
    }).paintRadial;
    f.call(receiver,'B1',Team.B,origin,1.17,1.30,8,
     PaintEventType.Bomb,false,.78,2.2);
   }
   return {stamps,cast};
  };
  it(kind+' rejects authentic SOURCE blast rings occluded by DIFFERENT original solid',()=>{
   const denied=run(true,'OTHER_WALL');
   expect(denied.cast).toHaveBeenCalledTimes(9);
   expect(denied.stamps).toHaveLength(0);
   const own=run(true,'OWN_BACKING');
   expect(own.stamps).toHaveLength(9);
   expect(own.cast).toHaveBeenCalledTimes(9);
  });
  it(kind+' never paints behind a DIFFERENT original wall just 1cm before the plane',()=>{
   const denied=run(true,'OTHER_WALL',.01);
   expect(denied.cast).toHaveBeenCalledTimes(9);
   expect(denied.stamps).toHaveLength(0);
   expect(run(true,'OWN_BACKING',.01).stamps).toHaveLength(9);
  });
  it(kind+' keeps registered clear paint and frozen T20 stamping unchanged',()=>{
   const clear=run(true,'NONE');
   expect(clear.stamps).toHaveLength(9);
   const historical=run(false,'OTHER_WALL');
   expect(historical.stamps).toHaveLength(9);
   expect(historical.cast).not.toHaveBeenCalled();
  });
 }
});

describe('SOURCE original cover at thin walls and genuine MID-DROPLET raster',()=>{
 const solidId='UndertowT21D:original-floor';
 const ownPaintId=solidId+':paint';
 const make=(id=ownPaintId,y=0)=>new PaintSurface(
  id,new Vec3(0,y,0),new Vec3(1,0,0),new Vec3(0,0,1),
  5,5,1,SurfaceFlags.Paintable|SurfaceFlags.Floor,2);
 const origin=new Vec3(0,.06,0);
 it('rejects a separate real registered wall even 1cm behind the target plane',()=>{
  const surface=make(),at=surface.localToWorld(2.5,2.5),
   distance=origin.distance(at);
  expect(sourceOriginalBlastPaintLineClear(origin,at,surface,{
   distance:distance-.01,solidId:'UndertowT21D:other-original-wall'
  })).toBe(false);
  expect(sourceOriginalBlastPaintLineClear(origin,at,surface,{
   distance:distance-.01,solidId
  })).toBe(true);
  expect(sourceOriginalBlastPaintLineClear(origin,at,surface,{
   distance:distance,solidId:'UndertowT21D:other-original-wall'
  })).toBe(true);
  expect(sourceOriginalBlastPaintLineClear(origin,at,surface,{
   distance:Number.NaN,solidId
  })).toBe(false);
 });
 const fire=(native:boolean,cover:'WALL'|'BACKING'|'CLEAR',
  surfaces:PaintSurface[]= [make()])=>{
  const stamped:{surfaceId:string}[]=[];
  const cast=vi.fn((from:Vec3,to:Vec3)=>{
   if(cover==='CLEAR')return null;
   return {distance:Math.max(0,from.distance(to)-.01),
    solidId:cover==='BACKING'?solidId:'UndertowT21D:other-original-wall'};
  });
  const receiver:any=Object.create(ProjectileSystem.prototype);
  receiver.surfaces=surfaces;
  receiver.nativeSourceHumanPhysicalMode=native?()=> 'HUMAN':null;
  receiver.physics={castStageSegment:cast};
  receiver.coordinator={enqueue:(entry:{surfaceId:string})=>stamped.push(entry)};
  const fn=(ProjectileSystem.prototype as unknown as {
   paintWorldStamp:(this:ProjectileSystem,team:Team.A|Team.B,
    point:Vec3,radiusU:number,radiusV:number,direction:Vec3,
    maxPlaneDistance:number,type:PaintEventType,source:PaintSource)=>boolean
  }).paintWorldStamp;
  const accepted=fn.call(receiver,Team.A,origin,1,.5,
   new Vec3(1,0,0),.25,PaintEventType.MidDroplet,PaintSource.Human);
  return {accepted,cast,stamped};
 };
 it('SOURCE human/CPU in-flight stamp refuses a real 1cm-thick intervening wall',()=>{
  const wall=fire(true,'WALL');
  expect(wall.accepted).toBe(false);
  expect(wall.stamped).toHaveLength(0);
  expect(wall.cast).toHaveBeenCalledOnce();
  const own=fire(true,'BACKING');
  expect(own.accepted).toBe(true);
  expect(own.stamped.map(x=>x.surfaceId)).toEqual([ownPaintId]);
  const old=fire(false,'WALL');
  expect(old.accepted).toBe(true);
  expect(old.cast).not.toHaveBeenCalled();
 });
 it('SOURCE MID-DROPLET ignores inactive original ink-cell and uses active surface',()=>{
  const near=make('inactive-registered-plane',.04);
  const far=make(ownPaintId);
  near.flagsGrid[near.index(2,2)]=0;
  const native=fire(true,'CLEAR',[near,far]);
  expect(native.accepted).toBe(true);
  expect(native.stamped.map(x=>x.surfaceId)).toEqual([ownPaintId]);
  const legacy=fire(false,'CLEAR',[near,far]);
  expect(legacy.accepted).toBe(true);
  expect(legacy.stamped.map(x=>x.surfaceId)).toEqual(['inactive-registered-plane']);
  expect(legacy.cast).not.toHaveBeenCalled();
 });
});

describe('genuine SOURCE bomb stamps use a real paintable grid center',()=>{
 const make=(id:string,height:number)=>new PaintSurface(
  id,new Vec3(0,height,0),new Vec3(1,0,0),new Vec3(0,0,1),
  4,4,1,SurfaceFlags.Paintable|SurfaceFlags.Floor,2);
 const point=new Vec3(0,.06,0);
 it('CPU explosion selects a farther active floor rather than the near inactive raster',()=>{
  const near=make('near-inactive',.05),far=make('real-original-ink',0);
  near.flagsGrid[near.index(2,2)]=0;
  expect(sourceRegisteredPaintCellActive(near,2,2)).toBe(false);
  expect(sourceRegisteredPaintCellActive(far,2,2)).toBe(true);
  expect(sourceRegisteredPaintCellActive(far,NaN,2)).toBe(false);
  const stamps:{surfaceId:string}[]=[];
  const receiver=Object.create(CpuKitSystem.prototype) as {
   surfaces:PaintSurface[];nativeOriginalSourceCombatantSubContactEnabled:boolean;
   coordinator:{enqueue:(v:{surfaceId:string})=>void};
   stats:{cpuSpecialPaintRequestsEnqueued:number}
  };
  receiver.surfaces=[near,far];receiver.nativeOriginalSourceCombatantSubContactEnabled=true;
  receiver.coordinator={enqueue:v=>stamps.push(v)};
  receiver.stats={cpuSpecialPaintRequestsEnqueued:0};
  const fn=(CpuKitSystem.prototype as unknown as {
   paintWorldStamp:(actorId:string,team:Team.A|Team.B,worldPoint:Vec3,
    radius:number,maxPlaneDistance:number,type:PaintEventType,
    gaugeEligible:boolean)=>boolean
  }).paintWorldStamp;
  const fire=()=>fn.call(receiver as unknown as CpuKitSystem,'B1',Team.B,
   point,1,.3,PaintEventType.Bomb,true);
  expect(fire()).toBe(true);
  expect(stamps.map(s=>s.surfaceId)).toEqual(['real-original-ink']);
  receiver.nativeOriginalSourceCombatantSubContactEnabled=false;
  expect(fire()).toBe(true);
  expect(stamps.at(-1)?.surfaceId).toBe('near-inactive');
 });
 it('HUMAN bomb chooses an active raster, preserving frozen legacy behavior',()=>{
  const near=make('near-empty-cell',.05),far=make('real-human-floor',0);
  near.flagsGrid[near.index(2,2)]=0;
  const stamps:{surfaceId:string}[]=[];
  const receiver=Object.create(SubWeaponSystem.prototype) as {
   surfaces:PaintSurface[];nativeSourceHumanSubBodyContactEnabled:boolean;
   coordinator:{enqueue:(v:{surfaceId:string})=>void};
   currentEnqueuedStampSurfaceIds:string[]|null
  };
  receiver.surfaces=[near,far];receiver.nativeSourceHumanSubBodyContactEnabled=true;
  receiver.coordinator={enqueue:v=>stamps.push(v)};
  receiver.currentEnqueuedStampSurfaceIds=[];
  const fn=(SubWeaponSystem.prototype as unknown as {
   paintWorldStamp:(team:Team.A|Team.B,worldPoint:Vec3,
    radius:number,maxPlaneDistance:number)=>boolean
  }).paintWorldStamp;
  const fire=()=>fn.call(receiver as unknown as SubWeaponSystem,Team.A,point,1,.3);
  expect(fire()).toBe(true);
  expect(stamps.map(s=>s.surfaceId)).toEqual(['real-human-floor']);
  expect(receiver.currentEnqueuedStampSurfaceIds).toEqual(['real-human-floor']);
  receiver.nativeSourceHumanSubBodyContactEnabled=false;
  expect(fire()).toBe(true);
  expect(stamps.at(-1)?.surfaceId).toBe('near-empty-cell');
 });
});

describe('SOURCE ink projection and hit authority, allocation-aware real contact', () => {
  const registered = (id: string, flags = SurfaceFlags.Paintable | SurfaceFlags.Floor) =>
    new PaintSurface(id, new Vec3(0, 0, 0),
      new Vec3(1, 0, 0), new Vec3(0, 0, 1),
      4, 4, 1, flags, 2);

  it('does not let inconsistent individual cell flags authorize a nonpaintable registered plane', () => {
    const unpaintable = registered('physical-solid-no-paint', SurfaceFlags.Floor);
    const cellIndex = unpaintable.index(2, 2);
    unpaintable.flagsGrid[cellIndex] = (unpaintable.flagsGrid[cellIndex] ?? 0) | SurfaceFlags.Paintable;
    expect(sourceRegisteredPaintCellActive(unpaintable, 2.5, 2.5)).toBe(false);
    const hit = unpaintable.intersectRay(new Vec3(.5, 3, .5), new Vec3(0, -1, 0));
    expect(hit).not.toBeNull();
    expect(sourceRegisteredPaintHitActive(unpaintable, hit!)).toBe(false);
    const game = new GameplayInkSystem();
    game.registerSurface(unpaintable);
    const attempt = game.apply({
      tick: 1, team: Team.A, surfaceId: unpaintable.id,
      centerU: 2.5, centerV: 2.5, radiusU: .5, radiusV: .5,
      angle: 0, source: PaintSource.Human, type: PaintEventType.Impact, strength: 1
    });
    expect(attempt.rasterEligibleCells).toBe(0);
    expect(attempt.changedCells).toBe(0);
    expect(unpaintable.ownerGrid[unpaintable.index(2, 2)]).toBe(Team.Neutral);
  });

  it('accepts only the actual registered ray surface, not another plane with coincident UVs', () => {
    const first = registered('original-hit');
    const other = registered('unrelated-overlay');
    const hit = first.intersectRay(new Vec3(.5, 3, .5), new Vec3(0, -1, 0));
    expect(hit).not.toBeNull();
    expect(sourceRegisteredPaintHitActive(first, hit!)).toBe(true);
    expect(sourceRegisteredPaintHitActive(other, hit!)).toBe(false);
    expect(sourceRegisteredPaintHitActive(first, { ...hit!, distance: -1 })).toBe(false);
  });

  it('retains rotated original-plane geometry and exact ray contact without transient Vec3 clones', () => {
    const target = new PaintSurface(
      'rotated-original-registered-plane',
      new Vec3(9, 2, -4), new Vec3(1, 0, 1), new Vec3(-1, 0, 1),
      6, 5, .25, SurfaceFlags.Paintable | SurfaceFlags.Floor, 4
    );
    const realWorld = target.localToWorld(2.25, 1.75);
    const from = realWorld.clone().add(new Vec3(0, 4, 0));
    const downward = new Vec3(0, -1, 0);
    const cloneSpy = vi.spyOn(Vec3.prototype, 'clone');
    try {
      const projected = target.projectWorldPoint(realWorld);
      const intersection = target.intersectRay(from, downward);
      expect(projected.inside).toBe(true);
      expect(projected.u).toBeCloseTo(2.25, 7);
      expect(projected.v).toBeCloseTo(1.75, 7);
      expect(intersection?.distance).toBeCloseTo(4, 7);
      expect(intersection?.u).toBeCloseTo(2.25, 7);
      expect(intersection?.v).toBeCloseTo(1.75, 7);
      expect(intersection?.worldPoint.distance(realWorld)).toBeLessThan(1e-6);
      expect(cloneSpy).not.toHaveBeenCalled();
    } finally {
      cloneSpy.mockRestore();
    }
  });
});

describe('original SOURCE sampling hot-path conservative culling',()=>{
 it('omits distant surface projections without changing actual cell ownership',()=>{
  const ink=new GameplayInkSystem();
  const near=new PaintSurface('UndertowT21D:near-floor',
   new Vec3(0,3,0),new Vec3(1,0,0),new Vec3(0,0,1),
   4,4,.25,SurfaceFlags.Paintable|SurfaceFlags.Floor,8);
  const far=new PaintSurface('UndertowT21D:far-floor',
   new Vec3(175,3,0),new Vec3(1,0,0),new Vec3(0,0,1),
   4,4,.25,SurfaceFlags.Paintable|SurfaceFlags.Floor,8);
  ink.registerSurface(near);ink.registerSurface(far);
  const nearProbe=vi.spyOn(near,'projectWorldPoint');
  const farProbe=vi.spyOn(far,'projectWorldPoint');
  const center=new Vec3(0,3,0);
  const a=ink.sampleWorld(center,.4,SurfaceFlags.Paintable);
  expect(a?.surface).toBe(near);
  expect(a?.owner).toBe(Team.Neutral);
  expect(nearProbe).toHaveBeenCalledOnce();
  expect(farProbe).not.toHaveBeenCalled();
  const b=ink.sampleWorld(new Vec3(175,3,0),.4,SurfaceFlags.Paintable);
  expect(b?.surface).toBe(far);
  expect(nearProbe).toHaveBeenCalledOnce();
  expect(farProbe).toHaveBeenCalledOnce();
  // Old edge/QA tolerance semantics are retained. Do not reinterpret
  // missing/NaN plane tolerance as authorization for physical movement.
  const unusual=ink.sampleWorld(center,Number.NaN,SurfaceFlags.Paintable);
  expect(unusual?.surface).toBe(near);
  expect(farProbe).toHaveBeenCalledTimes(2);
  expect(ink.snapshot().areaA).toBe(0);
 });
 it('matches exhaustive original registered-floor sampling, including slopes and masks',()=>{
  const ink=new GameplayInkSystem();
  const regular=new PaintSurface('UndertowT21D:regular',
   new Vec3(0,3,0),new Vec3(1,0,0),new Vec3(0,0,1),
   8,7,.25,SurfaceFlags.Paintable|SurfaceFlags.Floor,8);
  const slope=new PaintSurface('UndertowT21D:slope',
   new Vec3(15,4,7),new Vec3(1,0,0),
   new Vec3(0,.6,.8),8,6,.25,
   SurfaceFlags.Paintable|SurfaceFlags.Floor,8);
  const other=new PaintSurface('UndertowT21D:remote',
   new Vec3(140,10,-70),new Vec3(1,0,0),
   new Vec3(0,0,1),10,10,.25,
   SurfaceFlags.Paintable|SurfaceFlags.Floor,8);
  ink.registerSurface(regular);ink.registerSurface(slope);ink.registerSurface(other);
  const exhaustive=(point:Vec3,distance:number)=>{
   let best:ReturnType<GameplayInkSystem['sampleWorld']>=null;
   for(const surface of ink.getSurfaces()){
    const p=surface.projectWorldPoint(point);
    if(p.planeDistance>distance||!p.inside)continue;
    const u=Math.min(surface.widthMeters,Math.max(0,p.u));
    const v=Math.min(surface.heightMeters,Math.max(0,p.v));
    const x=Math.min(surface.widthCells-1,Math.max(0,Math.floor(u/surface.cellSize)));
    const y=Math.min(surface.heightCells-1,Math.max(0,Math.floor(v/surface.cellSize)));
    const idx=surface.index(x,y),flags=surface.flagsGrid[idx]??0;
    if(!flags||(flags&SurfaceFlags.Paintable)===0)continue;
    const sample={surface,owner:surface.ownerGrid[idx] as Team,flags,u,v,
     planeDistance:p.planeDistance};
    if(!best||sample.planeDistance<best.planeDistance)best=sample;
   }
   return best;
  };
  for(const dist of [0,.1,.4,1.0,Number.NaN]){
   for(let n=0;n<160;n++){
    const px=-10+(n*73%181)*.95;
    const pz=-83+(n*47%131)*.96;
    const point=new Vec3(px,2+(n*19%14)*.8,pz);
    const expected=exhaustive(point,dist);
    const actual=ink.sampleWorld(point,dist,SurfaceFlags.Paintable);
    expect(actual).toEqual(expected);
   }
  }
 });
});
