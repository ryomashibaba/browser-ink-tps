import {describe,it,expect} from 'vitest';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {pointInStageFootprint} from '../stage/StageFootprint';
import {SurfaceFlags} from '../ink/types';
import {proposeB441OriginalFrontline,b467MayRetryOriginalBFrontFromRealFoot}
 from './B441OriginalSourceFrontline';
describe('B441 SOURCE-only frontline proposals / never invented crossing',()=>{
 const make=()=>undertowT21dConnectivityQaStage();
 it('samples both original registered low floors inside all actual holes',()=>{
  const stage=make();
  for(const side of ['A','B'] as const){
   const paint=stage.paintSurfaces.find(p=>p.id==='UndertowT21D:right-low-team-'+(side==='A'?'a':'b')+':paint')!;
   const backing=stage.solids.find(s=>s.id===paint.backingSolidId)!;
   // Original paint definitions inherit the exact geometric mask.
   expect(paint.footprint).toBeUndefined();
   expect(backing.footprint).toBeDefined();
   const points=proposeB441OriginalFrontline(stage,side);
   expect(points.length).toBeGreaterThan(0);
   expect(points.length).toBeLessThanOrEqual(32);
   const sign=side==='A'?1:-1;
   const minZ=Math.min(...points.map(x=>Math.abs(x.point[2])));
   expect(minZ).toBeLessThan(49);
   for(const candidate of points){
    expect(candidate.sourceSolidId).toBe(
     'UndertowT21D:right-low-team-'+(side==='A'?'a':'b'));
    expect(candidate.navigationAndCapsuleCertified).toBe(false);
    expect(candidate.sourceFootprintOnly).toBe(true);
    expect(candidate.point[2]*sign).toBeGreaterThanOrEqual(33);
    const solid=stage.solids.find(x=>x.id===candidate.sourceSolidId)!;
    const u=candidate.point[0]-(solid.center[0]-solid.size[0]/2);
    const v=candidate.point[2]-(solid.center[2]-solid.size[2]/2);
    expect(pointInStageFootprint(u,v,solid.footprint!)).toBe(true);
   }
  }
  expect(frozen.solids).toHaveLength(25);
  expect(frozen.paintSurfaces).toHaveLength(17);
  expect(frozen.navigationLinks).toHaveLength(26);
 });
 it('refuses invented floor, promoted turf, missing nav/solid authority',()=>{
  const base=make();
  const noSolids={...base,solids:base.solids.slice(1)};
  expect(proposeB441OriginalFrontline(noSolids,'A')).toEqual([]);
  expect(proposeB441OriginalFrontline({...base,navigationLinks:[]},'B')).toEqual([]);
  const changed=base.paintSurfaces.map((v,i)=>
   i===0?{...v,flags:v.flags|SurfaceFlags.Scoreable}:v);
  expect(proposeB441OriginalFrontline({...base,paintSurfaces:changed},'A'))
   .toEqual([]);
  const blocked=base.solids.map(s=>s.id==='UndertowT21D:right-low-team-a'?
   {...s,collisionEnabled:false}:s);
  expect(proposeB441OriginalFrontline({...base,solids:blocked},'A'))
   .toEqual([]);
  const fake={...base,metadata:{...base.metadata,id:'invented-stage'}};
  expect(proposeB441OriginalFrontline(fake,'B')).toEqual([]);
 });
});


describe('B467 only rechecks real B2/B4 after native arrival on existing B low floor',()=>{
 const realFoot={id:'B2',nativeTick:1244,firstDeniedNativeTick:1066,
  lastRetryNativeTick:null,actualOriginalSolidId:
   'UndertowT21D:right-low-team-b',
  foot:[-6.387130260467529,4.676661491394043,-48.87943649291992] as const,
  rejoined:true,active:true,grounded:true};
 const eligible=(x:typeof realFoot,stage=undertowT21dConnectivityQaStage())=>
  b467MayRetryOriginalBFrontFromRealFoot(stage,x);
 it('accepts ONLY another strict path audit from native original B-side foot',()=>{
  expect(eligible(realFoot)).toBe(true);
  expect(eligible({...realFoot,id:'B4',nativeTick:1205,
   firstDeniedNativeTick:1067,
   foot:[-6.501399040222168,4.674306392669678,-49.08374786376953]}))
   .toBe(true);
 });
 it('cannot grant a late retry from first-drop, wrong team, early tick, or stale interval',()=>{
  for(const change of [
   {id:'A3'},{id:'HUMAN'},{actualOriginalSolidId:
    'UndertowT21D:first-drop-landing-negative-z'},
   {actualOriginalSolidId:'FAKE_BRIDGE'},
   {nativeTick:1100},{lastRetryNativeTick:1230},
   {rejoined:false},{active:false},{grounded:false},
   {foot:[0,4.6,-32] as const},
   {foot:[0,4.6,32] as const},
   {foot:[0,NaN,-49] as const},
   {firstDeniedNativeTick:null}
  ])expect(eligible({...realFoot,...change})).toBe(false);
 });
 it('rejects any source/score/geometry drift before Recast/Rapier checks',()=>{
  const stage=undertowT21dConnectivityQaStage();
  expect(eligible(realFoot,{...stage,solids:stage.solids.slice(1)})).toBe(false);
  const changed=stage.paintSurfaces.map((s,i)=>i===0?
   {...s,flags:s.flags|SurfaceFlags.Scoreable}:s);
  expect(eligible(realFoot,{...stage,paintSurfaces:changed})).toBe(false);
  expect(eligible(realFoot,{...stage,metadata:{...stage.metadata,
   id:'FAKE_SOURCE'}})).toBe(false);
 });
});
