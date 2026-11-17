import {describe,it,expect} from 'vitest';
import {chooseAuditedOriginalSourceCpuGoal,
 type OriginalSourceCpuPoint,type OriginalSourceNativePathEvidence}
 from './OriginalSourceGoalAdmission';

const foot:OriginalSourceCpuPoint={x:0,y:2,z:0};
const current:OriginalSourceCpuPoint={x:9,y:2,z:1};
const previous:OriginalSourceCpuPoint={x:3,y:2,z:5};
const allowed:OriginalSourceNativePathEvidence={
 querySuccess:true,reachedTarget:true,pointCount:3,
 startSnapDistanceMeters:.04,endSnapDistanceMeters:.15
};
const unreachable:OriginalSourceNativePathEvidence={
 ...allowed,reachedTarget:false
};

describe('T21 V28 source CPU native route admission (not physical permission)',()=>{
 it('uses the actual source foot and accepts a complete authentic Recast route',()=>{
  const calls:string[]=[];
  const result=chooseAuditedOriginalSourceCpuGoal(
   foot,current,previous,(from,to)=>{
    calls.push(JSON.stringify([from,to]));return allowed;
   });
  expect(result).toEqual({point:current,reusedPrevious:false});
  expect(calls).toEqual([JSON.stringify([foot,current])]);
 });
 it('re-audits a formerly authorized goal only after a disconnected new request',()=>{
  const tried:string[]=[];
  const result=chooseAuditedOriginalSourceCpuGoal(foot,current,previous,
    (_from,to)=>{tried.push(to===current?'new':'old');
     return to===current?unreachable:allowed;});
  expect(result).toEqual({point:previous,reusedPrevious:true});
  expect(tried).toEqual(['new','old']);
 });
 it('never substitutes an unverified destination or detached navmesh floor',()=>{
  const snapped={...allowed,endSnapDistanceMeters:.66};
  const footOffMesh={...allowed,startSnapDistanceMeters:.26};
  for(const evidence of [unreachable,snapped,footOffMesh,
   {...allowed,querySuccess:false},
   {...allowed,pointCount:0},
   {...allowed,endSnapDistanceMeters:Infinity}]){
   expect(chooseAuditedOriginalSourceCpuGoal(
    foot,current,null,()=>evidence)).toBeNull();
  }
 });
 it('does not return an old reached goal or duplicate failed current goal',()=>{
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,current,{x:.3,y:2,z:.2},
   (_from,to)=>to===current?unreachable:allowed)).toBeNull();
  let checks=0;
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,current,{...current},()=>{checks++;return unreachable;})).toBeNull();
  expect(checks).toBe(1);
 });
 it('rejects nonfinite real foot and goal before querying navigation',()=>{
  let calls=0;
  expect(chooseAuditedOriginalSourceCpuGoal(
   {x:NaN,y:2,z:0},current,previous,()=>{calls++;return allowed;}))
   .toBeNull();
  expect(chooseAuditedOriginalSourceCpuGoal(
   foot,{x:Infinity,y:2,z:0},previous,()=>{calls++;return allowed;}))
   .toBeNull();
  expect(calls).toBe(0);
 });
});
