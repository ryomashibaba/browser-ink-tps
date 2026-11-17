import { Vec3 } from 'playcanvas';
import { describe, expect, it, vi } from 'vitest';
import { GameplayInkSystem } from './GameplayInkSystem';
import { PaintSurface,sourceRegisteredPaintCellActive,sourceRegisteredPaintHitActive } from './PaintSurface';
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
    unpaintable.flagsGrid[unpaintable.index(2, 2)] |= SurfaceFlags.Paintable;
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
