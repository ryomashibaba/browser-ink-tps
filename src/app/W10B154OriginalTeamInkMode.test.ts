import {describe,it,expect} from 'vitest';
import {b154OriginalTeamInkOptIn as enabled}
 from './W10B154OriginalTeamInkMode';
const full='?t21Play=preview&t21QaDrive=source&t21W10B137=allyRally'+
 '&t21W10B150=allyInk&t21W10B154=teamCoverage';
describe('B154 combined seven-CPU original ink is strictly source QA opt-in',()=>{
 it('enables only with all exact original-source QA flags',()=>{
  expect(enabled(new URLSearchParams(full))).toBe(true);
 });
 it('cannot alter ordinary preview, stable T20, ally-only or fixed default',()=>{
  for(const query of [
   '?t21Play=preview&t21W10B154=teamCoverage',
   '?t21Play=preview&t21QaDrive=source&t21W10B154=teamCoverage',
   '?t21Play=preview&t21QaDrive=source&t21W10B137=allyRally&t21W10B150=allyInk',
   '?t21Play=preview&t21QaDrive=source&t21W10B137=allyRally',
   '?t21Play=production&t21QaDrive=source&t21W10B137=allyRally&t21W10B150=allyInk&t21W10B154=teamCoverage',
   full.replace('teamCoverage','auto'),
   full.replace('t21QaDrive=source','t21QaDrive=fake'),
   full.replace('t21W10B150=allyInk','t21W10B150=none')
  ])expect(enabled(new URLSearchParams(query))).toBe(false);
 });
});


// Real original ink raster, not a synthetic enemy, shot or damage outcome.
import {Vec3} from 'playcanvas';
import {PaintSurface} from '../ink/PaintSurface';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {PaintEventType,PaintSource,SurfaceFlags,Team,type PaintEvent}
 from '../ink/types';
import {b154OriginalCpuImpactRasterOutcome as classify}
 from './W10B154OriginalTeamInkMode';
describe('original-source CPU impact zero-change reason',()=>{
 it('distinguishes actual changed, already team-owned and off-floor raster',()=>{
  const ink=new GameplayInkSystem();
  const floor=new PaintSurface('UndertowT21D:original-active-floor',
   new Vec3(),new Vec3(1,0,0),new Vec3(0,0,1),
   4,4,.2,SurfaceFlags.Paintable|SurfaceFlags.Floor,4);
  ink.registerSurface(floor);
  const stamp=(u:number,tick:number):PaintEvent=>({
   tick,source:PaintSource.Cpu,actorId:'B2',team:Team.B,
   surfaceId:floor.id,centerU:u,centerV:2,radiusU:.32,
   radiusV:.32,angle:0,strength:1,type:PaintEventType.Impact
  });
  const first=stamp(2,1);
  const changed=ink.apply(first);
  expect(changed.changedCells).toBeGreaterThan(0);
  expect(classify(first,changed)).toBe('CHANGED');
  const owned=ink.apply(stamp(2,2));
  expect(owned.changedCells).toBe(0);
  expect(owned.rasterEligibleCells).toBeGreaterThan(0);
  expect(owned.rasterAlreadyTeamOwnedCells).toBe(owned.rasterEligibleCells);
  expect(classify(first,owned)).toBe('ALREADY_TEAM_OWNED');
  const outside=ink.apply(stamp(40,3));
  expect(outside.rasterEligibleCells).toBe(0);
  expect(classify(first,outside)).toBe('NO_ELIGIBLE_CELLS');
  expect(ink.snapshot().totalScoreableArea).toBeLessThan(1e-8);
 });
 it('denies foot, human, non-original surfaces and untrusted actors',()=>{
  const raster={changedCells:0,rasterEligibleCells:9,
   rasterAlreadyTeamOwnedCells:9};
  const input={actorId:'A1',source:PaintSource.Cpu,
   surfaceId:'UndertowT21D:real-floor',type:PaintEventType.Impact};
  expect(classify(input,raster)).toBe('ALREADY_TEAM_OWNED');
  expect(classify({...input,actorId:'UNKNOWN'},raster)).toBeNull();
  expect(classify({...input,source:PaintSource.Human},raster)).toBeNull();
  expect(classify({...input,type:PaintEventType.Foot},raster)).toBeNull();
  expect(classify({...input,surfaceId:'LEGACY-TEST'},raster)).toBeNull();
  expect(classify(input,{...raster,rasterAlreadyTeamOwnedCells:2}))
   .toBe('OTHER_ZERO_CHANGE');
 });
});
