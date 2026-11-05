import {describe,it,expect} from 'vitest';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {pointInStageFootprint} from '../stage/StageFootprint';
import {SurfaceFlags} from '../ink/types';
import {proposeB441OriginalFrontline,b467MayRetryOriginalBFrontFromRealFoot,
 b468MayRetryDifferentOriginalBGoalAfterRealDwell,
 b470MayAuditRealInkRankedSameSideFront,
 b471MayRequestActualA1SourceOrder}
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
 const realFoot:Parameters<typeof b467MayRetryOriginalBFrontFromRealFoot>[1]=
  {id:'B2',nativeTick:1244,firstDeniedNativeTick:1066,
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

describe('B468 genuine dwell schedules a second SOURCE audit, never a goal grant',()=>{
 const live:Parameters<typeof b468MayRetryDifferentOriginalBGoalAfterRealDwell>[0]={
  id:'B2',nativeTick:1700,approvedOriginalGoals:1,
  originallyAuthorized:true,arrivedSinceTick:1580,
  heldGoal:[-6.185263365,4.502,-37.321323812],
  realFoot:[-6.22,4.6,-37.40]
 };
 it('permits a NEW strict native audit only after 120 actual dwell ticks',()=>{
  expect(b468MayRetryDifferentOriginalBGoalAfterRealDwell(live)).toBe(true);
  expect(b468MayRetryDifferentOriginalBGoalAfterRealDwell({...live,id:'B4'})).toBe(true);
  expect(b468MayRetryDifferentOriginalBGoalAfterRealDwell({...live,approvedOriginalGoals:2})).toBe(true);
  expect(b468MayRetryDifferentOriginalBGoalAfterRealDwell({...live,approvedOriginalGoals:3})).toBe(true);
  expect(b468MayRetryDifferentOriginalBGoalAfterRealDwell({...live,nativeTick:1699})).toBe(false);
 });
 it('holds unapproved, wrong-side, stale, forged and more-than-one goals',()=>{
  for(const change of [
   {id:'A2'},{id:'B1'},{originallyAuthorized:false},
   {approvedOriginalGoals:0},{approvedOriginalGoals:4},
   {approvedOriginalGoals:NaN},
   {arrivedSinceTick:null},{arrivedSinceTick:1701},
   {heldGoal:null},{heldGoal:[0,4.5,37] as const},
   {realFoot:[0,4.6,-31] as const},
   {realFoot:[0,4.6,31] as const},
   {realFoot:[-6,Number.NaN,-37] as const},
   {realFoot:[-12,4.6,-48] as const}
  ])expect(b468MayRetryDifferentOriginalBGoalAfterRealDwell(
   {...live,...change})).toBe(false);
 });
});

describe('B470 true 120-tick original SAME-SIDE dwell is only a route audit trigger',()=>{
 const stage=undertowT21dConnectivityQaStage();
 const a:Parameters<typeof b470MayAuditRealInkRankedSameSideFront>[1]={
  id:'A3',team:'A',nativeTick:1800,lastRetryNativeTick:1600,
  approvedOriginalGoals:1,arrivedSinceTick:1680,
  realOriginalSolidId:'UndertowT21D:right-low-team-a',
  heldGoal:[3.375599289,4.502,37.992506688],
  realFoot:[3.38,4.6,38.01]
 };
 const gate=(p:typeof a,s=stage)=>b470MayAuditRealInkRankedSameSideFront(s,p);
 it('opens A2/A3/B1/B3 another REAL audit only, up to four actual goals',()=>{
  expect(gate(a)).toBe(true);
  expect(gate({...a,id:'A2',approvedOriginalGoals:3})).toBe(true);
  const b={...a,id:'B3',team:'B' as const,
   realOriginalSolidId:'UndertowT21D:right-low-team-b',
   heldGoal:[-6.185263365,4.502,-37.321323812] as const,
   realFoot:[-6.18,4.6,-37.33] as const};
  expect(gate(b)).toBe(true);
  expect(gate({...b,id:'B1'})).toBe(true);
 });
 it('refuses early dwell, stale physical foot and unauthorized actors and floor',()=>{
  for(const change of [
   {id:'A1'},{id:'B2'},{id:'B4'},{id:'HUMAN'},
   {team:'B' as const},{approvedOriginalGoals:0},
   {approvedOriginalGoals:4},{approvedOriginalGoals:NaN},
   {nativeTick:1799},{arrivedSinceTick:1681},
   {lastRetryNativeTick:1750},{realOriginalSolidId:'FAKE_BRIDGE'},
   {heldGoal:null},{heldGoal:[0,4.5,-38] as const},
   {realFoot:[3.38,4.6,-38] as const},
   {realFoot:[3.38,NaN,38] as const},
   {realFoot:[9,4.6,38] as const},
   {realFoot:[3.38,5.2,38] as const}
  ])expect(gate({...a,...change})).toBe(false);
 });
 it('refuses any source stage/score authority drift',()=>{
  expect(gate(a,{...stage,solids:stage.solids.slice(1)})).toBe(false);
  expect(gate(a,{...stage,navigationLinks:[]})).toBe(false);
  expect(gate(a,{...stage,paintSurfaces:stage.paintSurfaces.map((p,i)=>
   i===0?{...p,flags:p.flags|SurfaceFlags.Scoreable}:p)})).toBe(false);
 });
});

describe('B471 true C-key A1 SOURCE co-op command input is fail closed',()=>{
 const stage=undertowT21dConnectivityQaStage();
 const truth:Parameters<typeof b471MayRequestActualA1SourceOrder>[1]={
  id:'A1',team:'A',nativeTick:1550,coOpActuallyRunning:true,
  actualAllyRejoined:true,actualAllyActiveGrounded:true,
  trueHumanAliveGrounded:true,actualAllyFoot:[3.4,4.6,43],
  actualHumanFoot:[4.2,7.5,46]
 };
 const gate=(p:typeof truth,s=stage)=>b471MayRequestActualA1SourceOrder(s,p);
 it('accepts actual same-side A1 and grounded human on original floor',()=>{
  expect(gate(truth)).toBe(true);
  expect(gate({...truth,actualHumanFoot:[4,4.6,47]})).toBe(true);
 });
 it('rejects wrong actor, wrong mode, stale contact, forged positions',()=>{
  for(const changed of [
   {id:'A2'},{id:'B1'},{id:'HUMAN'},{team:'B' as const},
   {coOpActuallyRunning:false},{actualAllyRejoined:false},
   {actualAllyActiveGrounded:false},{trueHumanAliveGrounded:false},
   {nativeTick:-1},{nativeTick:NaN},
   {actualAllyFoot:[2,4.6,-43] as const},
   {actualAllyFoot:[2,NaN,43] as const},
   {actualHumanFoot:[4,7.5,-45] as const},
   {actualHumanFoot:[4,NaN,45] as const},
   {actualHumanFoot:[4,10.5,45] as const}
  ])expect(gate({...truth,...changed})).toBe(false);
 });
 it('refuses source collision/nav/score drift',()=>{
  expect(gate(truth,{...stage,solids:stage.solids.slice(1)})).toBe(false);
  expect(gate(truth,{...stage,navigationLinks:[]})).toBe(false);
  expect(gate(truth,{...stage,paintSurfaces:stage.paintSurfaces.map((p,i)=>
   i===0?{...p,flags:p.flags|SurfaceFlags.Scoreable}:p)})).toBe(false);
 });
});
