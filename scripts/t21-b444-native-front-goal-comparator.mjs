#!/usr/bin/env node
/** B444: independently compare TWO genuine 720-tick SOURCE Chromium artifacts.
 * Read-only; CPU reaching a Crowd goal never means cross-team certification. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const IDS=['A2','A3','B1','B2','B3','B4'];
const fail=s=>{throw Error('B444_NATIVE_SOURCE_HOLD_'+s);};
const finite3=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
export function inspectB444Trial(d){
 const e=d?.b441NativeEvidence;
 if(d?.schema!=='B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF'||
    d.source!=='25/17/26/0'||d.b441ResearchOnly!==true||
    d.officialWinner!=='NONE'||d.actorWrites!==0||
    d.scoreWrites!==0||d.nativeClockWrites!==0||
    d.sourceGeometryWrites!==0||d.syntheticInput!==false||
    d.formal4v4Certified!==false||d.realSourceRouteCertified!==false||
    d.genuineReplayClickCertified!==false||d.full180sCertified!==false||
    d.verdict!=='PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING'||
    !Number.isFinite(d.browserOrigin)||d.browserOrigin<=0||
    e?.source!=='25/17/26/0'||e.realSevenCpu!==true||
    e.naturalOpposingTeamRouteCertified!==false||
    e.b442Formal4v4Certified!==false||e.actorWrites!==0||
    e.scoreWrites!==0||e.nativeClockWrites!==0||
    e.proposedOnlyNotCapsuleProof!==true||
    !Number.isSafeInteger(e.realNativeTicks)||e.realNativeTicks<720||
    !Array.isArray(e.realFrames)||e.realFrames.length<20||
    e.realFrames.length>40)fail('AUTHORITY');
 const rows=Object.fromEntries(IDS.map(id=>[id,[]]));
 let tick=-1;
 for(const frame of e.realFrames){
  if(!Number.isSafeInteger(frame.tick)||frame.tick<=tick||
     !Array.isArray(frame.physicalFeet)||frame.physicalFeet.length!==7||
     !Array.isArray(frame.b442RealApprovedOriginalGoals)||
     frame.b442RealApprovedOriginalGoals.length>6)fail('NATIVE_FRAME');
  tick=frame.tick;
  const cpu=new Map();
  for(const x of frame.physicalFeet){
   if(!['A1',...IDS].includes(x?.id)||cpu.has(x.id)||
      x.rejoined!==true||!finite3(x.foot))fail('CPU_FOOT');
   cpu.set(x.id,x.foot);
  }
  if(cpu.size!==7)fail('CPU_INVENTORY');
  const per=new Set();
  for(const goal of frame.b442RealApprovedOriginalGoals){
   if(!IDS.includes(goal.id)||per.has(goal.id)||
      !finite3(goal.target)||!finite3(goal.physicalFoot)||
      goal.originalRegisteredSourceOnly!==true||
      !Number.isSafeInteger(goal.lastApprovedNativeTick)||
      goal.lastApprovedNativeTick>tick||goal.lastApprovedNativeTick<0||
      !Number.isFinite(goal.distanceXZ)||goal.distanceXZ<0||
      (goal.id[0]==='A'?goal.target[2]<33:goal.target[2]>-33)||
      goal.physicalFoot.some((x,i)=>Math.abs(x-cpu.get(goal.id)[i])>.001)||
      Math.abs(goal.distanceXZ-Math.hypot(
       goal.target[0]-goal.physicalFoot[0],
       goal.target[2]-goal.physicalFoot[2]))>.001)
    fail('GOAL_WITNESS');
   per.add(goal.id);
   rows[goal.id].push({tick,target:goal.target.join(','),
    meters:goal.distanceXZ,approvedTick:goal.lastApprovedNativeTick});
  }
 }
 if(tick>e.lastTick||e.lastTick<e.firstRead?.tick||
    e.realNativeTicks!==e.lastTick-e.firstRead.tick)fail('NATIVE_TICK');
 const cpu=Object.fromEntries(IDS.map(id=>{
  const reads=rows[id];let switches=0;
  for(let i=1;i<reads.length;i++)
   if(reads[i].target!==reads[i-1].target)switches++;
  const nearest=reads.reduce((n,r)=>Math.min(n,r.meters),Infinity);
  return [id,{goalSamples:reads.length,distinctObservedTargets:
   new Set(reads.map(r=>r.target)).size,observedGoalSwitches:switches,
   nearestApprovedGoalMeters:Number.isFinite(nearest)?nearest:null,
   observedWithin1p5m:Number.isFinite(nearest)&&nearest<=1.5}];
 }));
 return {schema:'B444_TRUE_NATIVE_SOURCE_GOAL_SWITCH_AUDIT_V1',
  browserWorldOrigin:d.browserOrigin,nativeTicks:e.realNativeTicks,
  sampleCount:e.realFrames.length,source:'25/17/26/0',cpu,
  observedGoalSwitches:IDS.reduce((sum,id)=>sum+cpu[id].observedGoalSwitches,0),
  countCpuWithin1p5m:IDS.filter(id=>cpu[id].observedWithin1p5m).length,
  cpuSourceCrossingCertified:false,formal4v4Certified:false,
  winner:'NONE',actorWrites:0,nativeClockWrites:0,scoreWrites:0};
}
export function compareB444RealTrials(before,after){
 const a=inspectB444Trial(before),b=inspectB444Trial(after);
 if(a.browserWorldOrigin===b.browserWorldOrigin)fail('SAME_BROWSER_WORLD');
 const tracked=['A2','B1','B3'];
 const arrivals=tracked.every(id=>a.cpu[id].observedWithin1p5m&&
  b.cpu[id].observedWithin1p5m);
 const oldSwitches=tracked.reduce((sum,id)=>sum+a.cpu[id].observedGoalSwitches,0);
 const newSwitches=tracked.reduce((sum,id)=>sum+b.cpu[id].observedGoalSwitches,0);
 const noRegress=tracked.every(id=>b.cpu[id].observedGoalSwitches<=
  a.cpu[id].observedGoalSwitches);
 return {schema:'B444_INDEPENDENT_NATIVE_SOURCE_GOAL_HYSTERESIS_COMPARISON_V1',
  verdict:arrivals&&noRegress&&newSwitches<oldSwitches&&
    b.countCpuWithin1p5m>=a.countCpuWithin1p5m?
   'PASS_REAL_ORIGINAL_FRONT_GOAL_SWITCH_REDUCTION_WITH_ARRIVALS':
   'HOLD_REDUCTION_OR_REAL_ARRIVAL_NOT_PROVEN',
  before:a,after:b,trackedCpu:tracked,trackedObservedSwitchesBefore:oldSwitches,
  trackedObservedSwitchesAfter:newSwitches,individuallyNonRegressing:noRegress,
  originalArrivalsRetained:arrivals,
  realEnemyEncounterCertified:false,formal4v4Certified:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==4||!process.argv[2].endsWith('.json')||
    !process.argv[3].endsWith('.json'))fail('INPUT_FILES');
 const inputs=process.argv.slice(2).map(p=>JSON.parse(readFileSync(resolve(p),'utf8')));
 console.log(JSON.stringify(compareB444RealTrials(...inputs),null,2));
}
