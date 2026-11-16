import { Vec3 } from 'playcanvas';
import { describe, expect, it } from 'vitest';
import { GameplayInkSystem } from './GameplayInkSystem';
import { PaintSurface,sourceRegisteredPaintHitActive } from './PaintSurface';
import {ProjectileSystem} from '../projectile/ProjectileSystem';
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
