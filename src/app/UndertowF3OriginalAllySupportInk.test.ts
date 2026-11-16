import {describe,it,expect} from 'vitest';
import {Vec3} from 'playcanvas';
import {PaintSurface} from '../ink/PaintSurface';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {SurfaceFlags,Team,PaintEventType,PaintSource} from '../ink/types';
import {eligibleB150OriginalAllyInk as eligible,
 b150OriginalAllyInkCandidates as candidates,
 diversifyB153OriginalAllyInkCandidates as diversify,
 b150OriginalAllyNativeShotReachable as canShoot,
 b150ActualUnownedAllyPaintAim as liveAim,
 type B150Foot}
 from './UndertowF3OriginalAllySupportInk';
describe('B150 opt-in real station must precede any source ink aim',()=>{
 const base=()=>({
  nativeTick:1814,approvedTick:1800,
  cpu:{x:6,y:3,z:48},human:{x:8,y:3,z:48},
  approvedGoal:{x:6,y:3,z:48},approvedHuman:{x:8,y:3,z:48}
 });
 it('accepts only recent genuinely separated and stationary original feet',()=>{
  expect(eligible(base())).toBe(true);
  expect(eligible({...base(),nativeTick:1861})).toBe(false);
  expect(eligible({...base(),approvedTick:1815})).toBe(false);
  expect(eligible({...base(),cpu:{x:4,y:3,z:48}})).toBe(false);
  expect(eligible({...base(),cpu:{x:7.4,y:3,z:48}})).toBe(false);
  expect(eligible({...base(),human:{x:8.35,y:3,z:48}})).toBe(false);
  expect(eligible({...base(),cpu:{x:6,y:4,z:48}})).toBe(false);
  expect(eligible({...base(),cpu:{x:6,y:3,z:30}})).toBe(false);
 });
 it('samples only away from human without writing actor positions',()=>{
  const cpu=Object.freeze({x:6,y:3,z:48});
  const human=Object.freeze({x:8,y:3,z:48});
  const points=candidates(cpu,human);
  // B151 probes up to 6 source-local radii × 7 angles, filtering
  // the candidates inside the real human's exclusion area first.
  expect(points.length).toBeGreaterThan(20);
  expect(points.length).toBeLessThanOrEqual(42);
  expect(points.every(p=>p.x<=cpu.x+1e-8)).toBe(true);
  expect(points.every(p=>Math.hypot(p.x-human.x,p.z-human.z)>2.6)).toBe(true);
  expect(cpu.x).toBe(6);expect(human.x).toBe(8);
  expect(candidates(cpu,cpu)).toEqual([]);
 });
});

describe('B153 diversify only already source-proposed directions',()=>{
 const points:readonly B150Foot[]=Object.freeze([
  Object.freeze({x:1,y:3,z:38}),Object.freeze({x:2,y:3,z:38}),
  Object.freeze({x:3,y:3,z:38})
 ]);
 it('rotates immutable original candidates fairly with repeatable sequence',()=>{
  expect(diversify(points,0)).toEqual(points);
  expect(diversify(points,1)).toEqual([points[1],points[2],points[0]]);
  expect(diversify(points,2)).toEqual([points[2],points[0],points[1]]);
  expect(diversify(points,3)).toEqual(points);
  expect(points[0]?.x).toBe(1);
 });
 it('does not invent or mutate any foot and rejects invalid cursors',()=>{
  expect(diversify(points,-1)).toEqual([]);
  expect(diversify(points,Number.NaN)).toEqual([]);
  expect(diversify([],5)).toEqual([]);
  expect(diversify([points[0]!],5)).toEqual([points[0]]);
  expect(diversify(points,2).every(p=>points.includes(p))).toBe(true);
 });
});


describe('original A1 ally shot opportunity is real native reach, not just a paint pixel',()=>{
 const cpu={x:1,y:3.1,z:48};
 const target={x:4,y:3.1,z:48};
 const solid='UndertowT21D:right-low-team-a';
 it('accepts genuine in-range unblocked original-floor aim',()=>{
  expect(canShoot(cpu,target,3.2,solid,null)).toBe(true);
  expect(canShoot(cpu,target,3.2,solid,{
   solidId:solid,point:{x:4,y:3.07,z:48}
  })).toBe(true);
 });
 it('rejects out-of-range aim so another real source pixel can be considered',()=>{
  expect(canShoot(cpu,target,2.5,solid,null)).toBe(false);
  expect(canShoot(cpu,target,3.2,'UNREGISTERED',null)).toBe(false);
  expect(canShoot(cpu,target,NaN,solid,null)).toBe(false);
  expect(canShoot(cpu,{...target,z:Infinity},3.2,solid,null)).toBe(false);
 });
 it('rejects original cover, including an earlier blocker on same source slab',()=>{
  expect(canShoot(cpu,target,4,solid,{
   solidId:'UndertowT21D:original-cover',
   point:{x:2,y:3.8,z:48}
  })).toBe(false);
  expect(canShoot(cpu,target,4,solid,{
   solidId:solid,point:{x:2.5,y:3.1,z:48}
  })).toBe(false);
  expect(canShoot(cpu,target,4,solid,{
   solidId:solid,point:{x:NaN,y:3,z:48}
  })).toBe(false);
 });
});

describe('real A1 co-op continues painting true unowned cells after first impact',()=>{
 const source=()=>{
  const floor=new PaintSurface('UndertowT21D:right-low-team-a-ally',
   new Vec3(0,3,48),new Vec3(1,0,0),new Vec3(0,0,1),
   4,4,.2,SurfaceFlags.Paintable|SurfaceFlags.Floor,4);
  const ink=new GameplayInkSystem();
  ink.registerSurface(floor);
  floor.ownerGrid.fill(Team.A);
  floor.ownerGrid[floor.index(12,12)]=Team.Neutral;
  const position=floor.localToWorld(2.1,2.1);
  const sample=ink.sampleWorld(position.clone().add(new Vec3(0,.06,0)),
   .28,SurfaceFlags.Paintable,SurfaceFlags.Wall);
  return {floor,ink,sample};
 };
 it('re-aims only to an existing, non-scoreable, unpainted ORIGINAL ownerGrid cell',()=>{
  const {floor,ink,sample}=source();
  expect(sample?.owner).toBe(Team.A);
  const before=Array.from(floor.ownerGrid);
  const aim=liveAim(sample!,Team.A);
  expect(aim).not.toBeNull();
  const projection=floor.projectWorldPoint(aim!);
  expect(projection.inside).toBe(true);
  expect(projection.u).toBeCloseTo(2.5);
  expect(projection.v).toBeCloseTo(2.5);
  expect(Array.from(floor.ownerGrid)).toEqual(before);
  // The unchanged real PaintCoordinator / owner grid still owns impact.
  const impact=(u:number,v:number)=>ink.apply({
   tick:1,source:PaintSource.Cpu,team:Team.A,
   surfaceId:floor.id,centerU:u,centerV:v,
   radiusU:.38,radiusV:.34,angle:0,type:PaintEventType.Impact,strength:1
  });
  expect(impact(2.1,2.1).changedCells).toBe(0);
  expect(impact(projection.u,projection.v).changedCells).toBeGreaterThan(0);
  expect(floor.ownerGrid[floor.index(12,12)]).toBe(Team.A);
  expect(ink.snapshot().percentA).toBe(0);
 });
 it('does not re-fire into wholly OWN, inactive or unregistered source',()=>{
  const {floor,sample}=source();
  // A REAL enemy-owned center is legitimately paintable for Team.B.
  // A1/Team.A must instead seek a genuinely unpainted neighboring cell.
  const enemyAim=liveAim(sample!,Team.B);
  expect(enemyAim).not.toBeNull();
  expect(floor.projectWorldPoint(enemyAim!).u).toBeCloseTo(2.1);
  floor.ownerGrid[floor.index(12,12)]=Team.A;
  expect(liveAim(sample!,Team.A)).toBeNull();
  floor.ownerGrid[floor.index(12,12)]=Team.Neutral;
  floor.flagsGrid[floor.index(12,12)]=0;
  expect(liveAim(sample!,Team.A)).toBeNull();
  floor.flagsGrid[floor.index(12,12)]=floor.baseFlags;
  const ignored=new PaintSurface('not-an-original-floor',new Vec3(),
   new Vec3(1,0,0),new Vec3(0,0,1),4,4,.2,
   SurfaceFlags.Paintable|SurfaceFlags.Floor,4);
  expect(liveAim({...sample!,surface:ignored},Team.A)).toBeNull();
  const score=new PaintSurface('UndertowT21D:original-score',
   new Vec3(),new Vec3(1,0,0),new Vec3(0,0,1),4,4,.2,
   SurfaceFlags.Paintable|SurfaceFlags.Scoreable,4);
  expect(liveAim({...sample!,surface:score},Team.A)).toBeNull();
 });
});
