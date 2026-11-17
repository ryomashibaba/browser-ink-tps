import {describe,it,expect} from 'vitest';
import {chooseAuditedOriginalSourceCpuGoal,
 type OriginalSourceCpuPoint,type OriginalSourceNativePathEvidence}
 from './OriginalSourceGoalAdmission';

const foot:OriginalSourceCpuPoint={x:0,y:3,z:0};
const requested:OriginalSourceCpuPoint={x:9,y:3,z:1};
const previous:OriginalSourceCpuPoint={x:3,y:3,z:5};
const route=(from:OriginalSourceCpuPoint,to:OriginalSourceCpuPoint,
 overrides:Partial<OriginalSourceNativePathEvidence>={}
):OriginalSourceNativePathEvidence=>({
 querySuccess:true,reachedTarget:true,pointCount:3,
 startSnapDistanceMeters:.04,endSnapDistanceMeters:.15,
 endpointErrorMeters:.05,
 nativePathPoints:[from,{x:1,y:3,z:1},to],
 ...overrides
});

describe('T21 V28 actual-foot SOURCE route admission (Rapier KCC remains authority)',()=>{
 it('accepts a true current-foot to original-goal route without moving foot',()=>{
  const calls:string[]=[];
  const result=chooseAuditedOriginalSourceCpuGoal(foot,requested,previous,
   (from,to)=>{calls.push(JSON.stringify([from,to]));return route(from,to);});
  expect(result).toEqual({point:requested,reusedPrevious:false});
  expect(calls).toEqual([JSON.stringify([foot,requested])]);
  expect(foot).toEqual({x:0,y:3,z:0});
 });
 it('rechecks the only previously authorized fallback from the CURRENT real foot',()=>{
  const currentFoot={x:2,y:3,z:0};
  const seen:Array<[OriginalSourceCpuPoint,OriginalSourceCpuPoint]>=[];
  const picked=chooseAuditedOriginalSourceCpuGoal(
   currentFoot,requested,previous,(from,to)=>{
    seen.push([from,to]);
    return to===requested?route(from,to,{reachedTarget:false}):
      route(from,to);
   });
  expect(picked).toEqual({point:previous,reusedPrevious:true});
  expect(seen).toEqual([[currentFoot,requested],[currentFoot,previous]]);
 });
 it('HOLDs disconnected original goals with no valid historical route',()=>{
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,requested,null,(from,to)=>route(from,to,{reachedTarget:false})))
   .toBeNull();
 });
 it('rejects near-looking Recast projected other floor even when reachedTarget=true',()=>{
  const otherFloorTerminal={x:requested.x,y:requested.y+2.8,z:requested.z};
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,requested,null,(from,to)=>route(from,to,{
    endSnapDistanceMeters:.1,endpointErrorMeters:.01,
    nativePathPoints:[from,{x:2,y:3,z:1},otherFloorTerminal]
   }))).toBeNull();
 });
 it('rejects apparent high-spawn to low-floor route whose projected terminal is still on the upper floor',()=>{
  const upper={x:0,y:5.6,z:0};
  const lower={x:6,y:1.2,z:3};
  const terminal={x:lower.x,y:5.6,z:lower.z};
  expect(chooseAuditedOriginalSourceCpuGoal(
   upper,lower,null,(from,to)=>route(from,to,{
    startSnapDistanceMeters:.24,endSnapDistanceMeters:.1,
    endpointErrorMeters:.01,
    nativePathPoints:[from,{x:3,y:5.6,z:2},terminal]
   }),{allowOriginalFirstDropStartSnap:true})).toBeNull();
 });
 it('rejects current foot projected to a different floor regardless of a plausible terminal',()=>{
  const wrongStart={x:foot.x,y:foot.y-2.5,z:foot.z};
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,requested,null,(from,to)=>route(from,to,{
    startSnapDistanceMeters:.1,
    nativePathPoints:[wrongStart,{x:2,y:3,z:1},to]
   }))).toBeNull();
 });
 it('rechecks historical goal ENDPOINT, refusing old goal on a wrong original floor',()=>{
  const selected=chooseAuditedOriginalSourceCpuGoal(
   foot,requested,previous,(from,to)=>to===requested
    ?route(from,to,{reachedTarget:false})
    :route(from,to,{endSnapDistanceMeters:.1,
      nativePathPoints:[from,{x:2,y:3,z:1},
       {x:to.x,y:to.y+2.1,z:to.z}]}));
  expect(selected).toBeNull();
 });
 it('holds if either actual projection, terminal error or true endpoint alignment exceeds strict source bounds',()=>{
  for(const evidence of [
   {startSnapDistanceMeters:.201},
   {endSnapDistanceMeters:.221},
   {endpointErrorMeters:.201},
   {nativePathPoints:[foot,{x:2,y:3,z:1},
    {x:requested.x+.23,y:requested.y,z:requested.z}]},
   {querySuccess:false},{reachedTarget:false}
  ] as Partial<OriginalSourceNativePathEvidence>[]){
   expect(chooseAuditedOriginalSourceCpuGoal(
    foot,requested,null,(from,to)=>route(from,to,evidence))).toBeNull();
  }
 });
 it('allows .24m real first-drop start only under explicit high-spawn exception; holds >.25m',()=>{
  const projected={x:foot.x+.24,y:foot.y,z:foot.z};
  const firstDrop=(from:OriginalSourceCpuPoint,to:OriginalSourceCpuPoint)=>
    route(from,to,{startSnapDistanceMeters:.24,
      nativePathPoints:[projected,{x:1,y:3,z:1},to]});
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,requested,null,firstDrop)).toBeNull();
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,requested,null,firstDrop,
   {allowOriginalFirstDropStartSnap:true})).toEqual({
    point:requested,reusedPrevious:false
   });
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,requested,null,(from,to)=>route(from,to,{
    startSnapDistanceMeters:.26,
    nativePathPoints:[{...foot,x:.26},{x:1,y:3,z:1},to]
   }),{allowOriginalFirstDropStartSnap:true})).toBeNull();
 });
 it('does not reuse already reached or identical failed goal',()=>{
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,requested,{x:.3,y:3,z:.2},
   (from,to)=>to===requested?route(from,to,{reachedTarget:false}):route(from,to)))
   .toBeNull();
  let calls=0;
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,requested,{...requested},(from,to)=>{
    calls++;return route(from,to,{reachedTarget:false});
   })).toBeNull();
  expect(calls).toBe(1);
 });
 it('holds missing or nonfinite route evidence and malformed path vertices',()=>{
  for(const evidence of [
   {nativePathPoints:[],pointCount:0},
   {nativePathPoints:[foot,requested],pointCount:3},
   {endpointErrorMeters:Infinity},
   {endSnapDistanceMeters:-.1},
   {nativePathPoints:[foot,{x:NaN,y:3,z:1},requested]}
  ] as Partial<OriginalSourceNativePathEvidence>[]){
   expect(chooseAuditedOriginalSourceCpuGoal(
    foot,requested,null,(from,to)=>route(from,to,evidence))).toBeNull();
  }
  let calls=0;
  expect(chooseAuditedOriginalSourceCpuGoal(
   {...foot,x:NaN},requested,previous,()=>{calls++;return route(foot,requested);}))
   .toBeNull();
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,{...requested,z:Infinity},previous,()=>{calls++;return route(foot,requested);}))
   .toBeNull();
  expect(calls).toBe(0);
 });
});
