#!/usr/bin/env node
/** B450: read-only independent raw TRUE native B2/B4 first-denial audit. */
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const fail=x=>{throw Error('B450_SOURCE_AUTHORITY_HOLD_'+x)};
const xyz=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const nat=x=>Number.isSafeInteger(x)&&x>=0;
export function auditRealB450(d){
 const e=d?.b441NativeEvidence;
 if(d?.schema!=='B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF'||
  d.source!=='25/17/26/0'||d.b441ResearchOnly!==true||
  d.syntheticInput!==false||d.actorWrites!==0||d.scoreWrites!==0||
  d.nativeClockWrites!==0||d.sourceGeometryWrites!==0||
  d.formal4v4Certified!==false||d.officialWinner!=='NONE'||
  !Number.isFinite(d.browserOrigin)||e?.source!=='25/17/26/0'||
  e.realSevenCpu!==true||!nat(e.realNativeTicks)||e.realNativeTicks<720||
  e.naturalOpposingTeamRouteCertified!==false||
  e.b442Formal4v4Certified!==false)fail('ORIGINAL_WORLD');
 const probes=e.b446LiveActualCpuFootDryRouteProbes;
 if(!Array.isArray(probes)||new Set(probes.map(p=>p.id)).size!==probes.length)
  fail('REAL_CPU_PROBES');
 const cpu={};
 for(const id of ['B2','B4']){
  const p=probes.find(x=>x.id===id);
  if(!p||!xyz(p.actualPhysicalFoot)||p.actualPhysicalFoot[2]>-33||
   p.probeOnlyNoActorOrGoalWrites!==true||!nat(p.nativeTick)||
   p.nativeTick>e.lastTick||!nat(p.inspectedOriginalGoals)||
   !nat(p.deniedRapierOrBoundary)||!nat(p.nativeUnreached)||
   !nat(p.nativeStartSnap)||!nat(p.nativeEndSnap)||
   !nat(p.nativeIntermediateSupport)||!nat(p.passedAllOriginalChecks)||
   p.inspectedOriginalGoals!==
    p.deniedRapierOrBoundary+p.nativeUnreached+p.nativeStartSnap+
    p.nativeEndSnap+p.nativeIntermediateSupport+p.passedAllOriginalChecks||
   !Array.isArray(p.b450FailedOriginalGoals)||
   p.b450FailedOriginalGoals.length!==p.nativeIntermediateSupport)
   fail('COUNT_OR_ACTUAL_NATIVE_CPU_'+id);
  const reasonCounts={};
  for(const w of p.b450FailedOriginalGoals){
   const f=w?.firstDenied;
   if(!xyz(w?.originalGoal)||w.originalGoal[2]>-33||
    typeof w.originalGoalSolidId!=='string'||!w.originalGoalSolidId||
    !nat(w.nativePathPointCount)||!f||!nat(f.checked)||
    !['EMPTY_NATIVE_PATH','INVALID_NATIVE_SEGMENT','OUTSIDE_ORIGINAL_REGION',
     'NO_RAPIER_HIT','NATIVE_PATH_RAPIER_HEIGHT_MISMATCH',
     'UNREGISTERED_OR_UNSUPPORTED_RAPIER_SOLID'].includes(f.cause)||
    (f.xyz!==null&&!xyz(f.xyz))||
    (f.xyz===null&&!['EMPTY_NATIVE_PATH','INVALID_NATIVE_SEGMENT'].includes(f.cause))||
    (f.leg!==null&&!nat(f.leg))||(f.sample!==null&&!nat(f.sample))||
    (f.hitSolidId!==null&&typeof f.hitSolidId!=='string')||
    (f.verticalGapMeters!==null&&!Number.isFinite(f.verticalGapMeters))||
    (f.cause==='NATIVE_PATH_RAPIER_HEIGHT_MISMATCH'&&
     (!f.hitSolidId||f.verticalGapMeters===null||
      f.verticalGapMeters<=.25))||
    (f.cause==='NO_RAPIER_HIT'&&f.hitSolidId!==null))
     fail('FORGED_OR_INCONSISTENT_ORIGINAL_DENIAL_'+id);
   reasonCounts[f.cause]=(reasonCounts[f.cause]??0)+1;
  }
  cpu[id]={nativeTick:p.nativeTick,actualPhysicalFoot:p.actualPhysicalFoot,
   inspectedOriginalGoals:p.inspectedOriginalGoals,
   deniedOriginalRapierOrBoundary:p.deniedRapierOrBoundary,
   deniedNativeUnreached:p.nativeUnreached,
   deniedNativeSnap:p.nativeStartSnap+p.nativeEndSnap,
   deniedIntermediateOriginalSupport:p.nativeIntermediateSupport,
   firstDenialReasonCounts:reasonCounts,
   rejectedOriginalRoutes:p.b450FailedOriginalGoals};
 }
 return {schema:'B451_REAL_B2_B4_ORIGINAL_CONTACT_GAP_CLASSIFICATION_V2',
  verdict:'PASS_REAL_FIRST_DENIAL_TELEMETRY_NOT_ROUTE_APPROVAL',
  browserOrigin:d.browserOrigin,originalSource:'25/17/26/0',
  realNativeTicks:e.realNativeTicks,perCpu:cpu,
  actorWrites:0,geometryWrites:0,clockWrites:0,scoreWrites:0,
  crossTeamPathCertified:false,formal4v4Certified:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==3)fail('REQUIRES_GENUINE_NATIVE_JSON');
 const path=resolve(process.argv[2]),d=JSON.parse(readFileSync(path,'utf8'));
 const result=auditRealB450(d);
 writeFileSync(join(dirname(path),'b450-first-original-gap-report.json'),
  JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({...result,perCpu:Object.fromEntries(
  Object.entries(result.perCpu).map(([id,c])=>[id,{
   inspected:c.inspectedOriginalGoals,
   denied:c.deniedIntermediateOriginalSupport,
   reasons:c.firstDenialReasonCounts,first:c.rejectedOriginalRoutes[0]??null}]))}));
}
