#!/usr/bin/env node
/** B447: original SOURCE gate evidence comparator, read-only.
 * This never grants CPU goals, modified collision, enemy travel or 4v4. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const IDS=['A2','A3','B1','B2','B3','B4'];
const bad=s=>{throw Error('B447_SOURCE_GATE_HOLD_'+s)};
const xyz=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const nat=x=>Number.isSafeInteger(x)&&x>=0;
const byId=a=>Object.fromEntries(a.map(x=>[x.id,x]));
function inspect(d,newVersion){
 const e=d?.b441NativeEvidence;
 if(d?.schema!=='B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF'||
  d.source!=='25/17/26/0'||d.b441ResearchOnly!==true||
  d.verdict!=='PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING'||
  d.officialWinner!=='NONE'||d.syntheticInput!==false||
  d.actorWrites!==0||d.scoreWrites!==0||d.nativeClockWrites!==0||
  d.sourceGeometryWrites!==0||d.formal4v4Certified!==false||
  !Number.isFinite(d.browserOrigin)||d.browserOrigin<=0||
  e?.source!=='25/17/26/0'||e.realSevenCpu!==true||
  e.naturalOpposingTeamRouteCertified!==false||
  e.b442Formal4v4Certified!==false||!nat(e.realNativeTicks)||
  e.realNativeTicks<720)bad('ORIGINAL_WORLD');
 const list=e.b445LastOriginalGateByCpu;
 if(!Array.isArray(list)||list.length!==6||
   new Set(list.map(x=>x?.id)).size!==6)bad('CPU_INVENTORY');
 for(const r of list){
  if(!IDS.includes(r.id)||!xyz(r.actualOriginalLanding)||
    !nat(r.originalFloorProposals)||r.originalFloorProposals>32||
    !nat(r.inspectedProposals)||r.inspectedProposals>r.originalFloorProposals||
    !nat(r.rejectedOriginalRapierOrBoundary)||
    !nat(r.rejectedNativeRecastOrOriginalPath)||
    !nat(r.strictlyApprovedGoals)||
    r.inspectedProposals!==r.rejectedOriginalRapierOrBoundary+
     r.rejectedNativeRecastOrOriginalPath+r.strictlyApprovedGoals||
    !Array.isArray(r.approvedOriginalGoals)||
    r.approvedOriginalGoals.length!==r.strictlyApprovedGoals||
    !r.approvedOriginalGoals.every(x=>xyz(x)&&
     (r.id[0]==='A'?x[2]>=33:x[2]<=-33)))
    bad('CPU_ORIGINAL_GATE');
  if(newVersion){
   const reasons=['rejectedNativeUnreached','rejectedNativeStartSnap',
    'rejectedNativeEndSnap','rejectedNativeIntermediateOriginalSupport'];
   if(reasons.some(k=>!nat(r[k]))||
      reasons.reduce((n,k)=>n+r[k],0)!==r.rejectedNativeRecastOrOriginalPath)
    bad('NATIVE_REJECT_ACCOUNTING');
  }
 }
 return {source:d,e,gates:byId(list)};
}
export function compareB447SourceGates(before,after){
 const old=inspect(before,false),next=inspect(after,true);
 if(old.source.browserOrigin===next.source.browserOrigin)bad('SAME_BROWSER_WORLD');
 const probes=next.e.b446LiveActualCpuFootDryRouteProbes;
 if(!Array.isArray(probes)||probes.length!==3||
    new Set(probes.map(p=>p?.id)).size!==3||
    ['A3','B2','B4'].some(id=>!probes.some(p=>p.id===id)))
  bad('MISSING_TRUE_CPU_FOOT_PROBES');
 const result={};
 for(const p of probes){
  const r=next.gates[p.id],prev=old.gates[p.id];
  const keys=['inspectedOriginalGoals','deniedRapierOrBoundary',
   'nativeUnreached','nativeStartSnap','nativeEndSnap',
   'nativeIntermediateSupport','passedAllOriginalChecks'];
  if(!nat(p.nativeTick)||p.nativeTick>next.e.lastTick||
    !xyz(p.actualPhysicalFoot)||p.probeOnlyNoActorOrGoalWrites!==true||
    keys.some(k=>!nat(p[k]))||
    p.inspectedOriginalGoals!==keys.slice(1).reduce((n,k)=>n+p[k],0)||
    p.inspectedOriginalGoals!==r.originalFloorProposals||
    (p.passedAllOriginalChecks>0&&!xyz(p.firstPassingExistingGoal))||
    (p.passedAllOriginalChecks===0&&p.firstPassingExistingGoal!==null)||
    !prev.actualOriginalLanding.every((x,i)=>
     Math.abs(x-r.actualOriginalLanding[i])<.00001)||
    (p.id[0]==='A'?p.actualPhysicalFoot[2]<33:
      p.actualPhysicalFoot[2]>-33))bad('LIVE_CPU_NATIVE_GATE');
  result[p.id]={
   initialLanding:[...prev.actualOriginalLanding],
   originalLandingDenial:{
    unreached:r.rejectedNativeUnreached,
    startSnap:r.rejectedNativeStartSnap,
    endSnap:r.rejectedNativeEndSnap,
    unsupportedIntermediate:r.rejectedNativeIntermediateOriginalSupport},
   actualCpuFoot:[...p.actualPhysicalFoot],
   liveDenial:{unreached:p.nativeUnreached,startSnap:p.nativeStartSnap,
    endSnap:p.nativeEndSnap,
    unsupportedIntermediate:p.nativeIntermediateSupport},
   rapierBoundaryDenied:p.deniedRapierOrBoundary,
   existingOriginalGoalDryPasses:p.passedAllOriginalChecks,
   interpretation:p.passedAllOriginalChecks>0?
    'DRY_PATH_EXISTS_NOT_GRANTED_AS_CPU_GOAL':
    'LIVE_CPU_SOURCE_ROUTE_STILL_HELD'
  };
 }
 return {schema:'B447_NATIVE_ORIGINAL_FRONTLINE_REJECT_COMPARISON_V1',
  verdict:'PASS_AUTHENTIC_SOURCE_DENIAL_ACCOUNTING_NOT_4V4',
  previousWorld:old.source.browserOrigin,
  afterWorld:next.source.browserOrigin,
  frozenSource:'25/17/26/0',realNativeTicks:next.e.realNativeTicks,
  perRealCpu:result,originalCollisionModified:false,
  actorWrites:0,scoreWrites:0,nativeClockWrites:0,
  crossTeamRouteCertified:false,formal4v4Certified:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==4)bad('REQUIRES_TWO_NATIVE_JSON_FILES');
 const [a,b]=process.argv.slice(2).map(x=>JSON.parse(readFileSync(resolve(x),'utf8')));
 console.log(JSON.stringify(compareB447SourceGates(a,b),null,2));
}
