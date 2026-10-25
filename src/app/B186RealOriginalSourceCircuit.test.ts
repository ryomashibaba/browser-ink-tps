import {describe,it,expect} from 'vitest';
import {B186RealOriginalSourceCircuit,type B186CircuitFrame} from
 './B186RealOriginalSourceCircuit';
const LOWER='UndertowT21D:first-drop-landing-positive-z';
const RAISED='UndertowT21D:right-low-team-a';
function source(t:number,x=0,y=3.87,id:string=LOWER):B186CircuitFrame{
 return {
  nativeTick:t,livePlaying:true,alive:true,mode:'HUMAN',
  frozenStage:[25,17,26,0],
  originalDropVerified:true,dropLowerColliderId:LOWER,
  body:[x,y,55],nativeKccGrounded:true,
  actualRapierSupportId:id,actualFootSupportGapMeters:.02,
  humanSourceOriginalOnly:true,actualHumanImpactChangedCells:12,
  actualHumanImpactEvents:1,lastActualHumanImpactTick:0
 };
}
function genuineRamp(d:B186RealOriginalSourceCircuit){
 d.observe(source(1));
 for(let i=1;i<=30;i++)
  d.observe(source(i+1,i*.1,3.87+Math.min(1.5,i*.05),
   i===30?RAISED:'UndertowT21D:right-low-route-ramp-positive-z'));
}
describe('B186 real human original source-local ramp-and-paint circuit',()=>{
 it('requires actual first drop, real continuous original grounded travel, real raised support and fresh changed impact ink',()=>{
  const d=new B186RealOriginalSourceCircuit();genuineRamp(d);
  expect(d.snapshot()).toMatchObject({
   status:'PAINT_ON_RAISED',firstActualRaisedGroundedTick:31,
   sourceLocalPlayClear:false
  });
  d.observe({...source(32,3,5.37,RAISED),
   actualHumanImpactChangedCells:74,actualHumanImpactEvents:4,
   lastActualHumanImpactTick:32});
  expect(d.snapshot()).toMatchObject({
   status:'REAL_LOCAL_CIRCUIT_CLEAR',
   sourceLocalPlayClear:true,realPostDropHumanImpactChangedCells:62,
   naturalCrossTeamRouteProven:false,sourceScoreablePromotions:0,
   officialWinner:'NONE'
  });
 });
 it('will not accept painted cells accumulated before original drop',()=>{
  const d=new B186RealOriginalSourceCircuit();
  d.observe({...source(1),actualHumanImpactChangedCells:100});
  for(let i=1;i<=30;i++)d.observe({
   ...source(i+1,i*.1,3.87+Math.min(1.5,i*.05),
    i===30?RAISED:'UndertowT21D:right-low-route-ramp-positive-z'),
   actualHumanImpactChangedCells:100});
  expect(d.snapshot()).toMatchObject({
   status:'PAINT_ON_RAISED',realPostDropHumanImpactChangedCells:0
  });
 });
 it('rejects staged/no-lower-land and source ID mismatch',()=>{
  const d=new B186RealOriginalSourceCircuit();
  d.observe({...source(1),originalDropVerified:false});
  d.observe({...source(2),dropLowerColliderId:'wrong'});
  d.observe({...source(3),actualRapierSupportId:null});
  expect(d.snapshot()).toMatchObject({
   status:'WAIT_FIRST_DROP',sourceLocalPlayClear:false
  });
 });
 it('rejects bogus native transport and invalid source manifest',()=>{
  const a=new B186RealOriginalSourceCircuit();
  a.observe(source(1));
  a.observe(source(2,10));
  expect(a.snapshot().status).toBe('INVALID_SOURCE_WITNESS');
  const b=new B186RealOriginalSourceCircuit();
  b.observe({...source(1),frozenStage:[25,17,26,1]});
  expect(b.snapshot().status).toBe('INVALID_SOURCE_WITNESS');
 });
 it('does not award a raised-floor arrival without 2m native walking',()=>{
  const d=new B186RealOriginalSourceCircuit();
  d.observe(source(1));d.observe(source(2,.1,5.37,RAISED));
  expect(d.snapshot().sourceLocalPlayClear).toBe(false);
 });
 it('death/respawn resets the attempt without counting spawn reposition',()=>{
  const d=new B186RealOriginalSourceCircuit();d.observe(source(1));
  d.observe({...source(2),alive:false});
  d.observe({...source(3),originalDropVerified:false,body:[200,30,200]});
  expect(d.snapshot()).toMatchObject({
   status:'WAIT_FIRST_DROP',genuineGroundedTravelMeters:0,
   originalDropStartNativeTick:null
  });
 });
 it('requires a real POST-drop new impact event with native timestamp',()=>{
  const d=new B186RealOriginalSourceCircuit();genuineRamp(d);
  d.observe({...source(32,3,5.37,RAISED),
   actualHumanImpactChangedCells:74,actualHumanImpactEvents:5,
   lastActualHumanImpactTick:0});
  expect(d.snapshot().sourceLocalPlayClear).toBe(false);
 });
});

describe('B186 registered original ramp mandatory',()=>{
 it('does not claim original physical ramp ascent from arbitrary other original floor',()=>{
  const d=new B186RealOriginalSourceCircuit();
  d.observe(source(1));
  for(let i=1;i<=30;i++)d.observe({
   ...source(i+1,i*.1,3.87+Math.min(1.5,i*.05),
    i===30?RAISED:'UndertowT21D:center-low-team-a'),
   actualHumanImpactChangedCells:100,
   actualHumanImpactEvents:5,lastActualHumanImpactTick:i+1
  });
  expect(d.snapshot()).toMatchObject({
   actualOriginalRampTouched:false,sourceLocalPlayClear:false
  });
 });
 it('keeps already completed true lower drop during real squid swimming',()=>{
  const d=new B186RealOriginalSourceCircuit();
  d.observe(source(1));
  d.observe({...source(2),mode:'SQUID',nativeKccGrounded:false,
   actualRapierSupportId:null,actualFootSupportGapMeters:null});
  expect(d.snapshot().status).toBe('MOVE_TO_ORIGINAL_RAISED');
  expect(d.snapshot().originalDropStartNativeTick).toBe(1);
 });
});
