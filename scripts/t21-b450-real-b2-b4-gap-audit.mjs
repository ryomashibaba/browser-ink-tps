#!/usr/bin/env node
/** B450: read-only independent raw TRUE native B2/B4 first-denial audit. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const fail=x=>{throw Error('B450_SOURCE_AUTHORITY_HOLD_'+x)};
const xyz=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const nat=x=>Number.isSafeInteger(x)&&x>=0;

/** Current native source world may have NO rejected-goal dry probe precisely
 * because real Rapier KCC reached original approved SOURCE goals.
 * When that happens, the old first-denial schema must NOT be faked.
 * Prove movement separately from the same-browser every-tick immutable B454
 * RAW, retaining opponent route/HP/F4/complete capsule HOLD. */
function auditMovingB2B4(d,trace){
 const e=d.b441NativeEvidence;
 if(!trace||trace.schema!=='B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1'||
    trace.source!=='25/17/26/0'||
    trace.browserWorldOrigin!==d.browserOrigin||
    trace.originalKccOrGameWrites!==0||
    trace.originalPathAuthorizationChanged!==false||
    trace.originalSourceGeometryWrites!==0||
    trace.actorWrites!==0||trace.scoreWrites!==0||
    trace.nativeClockWrites!==0||
    trace.continuousCapsuleContactCertified!==false||
    trace.b2b4FrontlineGoalCertified!==false||
    !nat(e.lastTick)||e.lastTick-e.firstRead?.tick!==e.realNativeTicks||
    !Array.isArray(e.b445LastOriginalGateByCpu)||
    !Array.isArray(e.b442ActualApprovedNativeTargetsAtFinish))
  fail('MOBILE_REQUIRES_TRUE_SAME_BROWSER_60HZ_ORIGINAL_FOOT');
 const cpu={};
 for(const id of ['B2','B4']){
  const rows=trace.rows?.[id];
  const gate=e.b445LastOriginalGateByCpu.find(x=>x.id===id);
  const last=e.b442ActualApprovedNativeTargetsAtFinish.find(x=>x.id===id);
  if(!Array.isArray(rows)||rows.length<e.realNativeTicks||
     trace.dropped?.[id]!==0||!gate||!last||
     !nat(gate.strictlyApprovedGoals)||gate.strictlyApprovedGoals<1||
     !nat(gate.runtimeTrueOriginalGoalRequests)||
     gate.runtimeTrueOriginalGoalRequests<1||
     gate.runtimeNoOriginalFrontGoals!==0||
     last.originalRegisteredSourceOnly!==true||
     !xyz(last.physicalFoot)||!xyz(last.target))
   fail('UNVERIFIED_MOBILE_NATIVE_GOAL_'+id);
  let cumulativeXZ=0,acceptedMoving=0;
  const solids=new Set();
  for(let i=0;i<rows.length;i++){
   const p=rows[i],prev=i?rows[i-1]:null;
   if(p.id!==id||!nat(p.tick)||!xyz(p.foot)||
      p.rejoined!==true||p.life!=='ACTIVE'||p.mode!=='GROUND'||
      p.registeredOriginalHit!==true||p.withinUnchanged025m!==true||
      !Number.isFinite(p.absFootToRapierY)||
      p.absFootToRapierY>.25||
      typeof p.originalRapierSolidId!=='string'||
      !p.originalRapierSolidId.startsWith('UndertowT21D:')||
      (prev&&p.tick!==prev.tick+1))fail('NONCONTIGUOUS_OR_UNSUPPORTED_SOURCE_FOOT_'+id);
   solids.add(p.originalRapierSolidId);
   if(prev){
    const dx=Math.hypot(p.foot[0]-prev.foot[0],
     p.foot[2]-prev.foot[2]);
    if(!Number.isFinite(dx)||dx>.5)fail('UNTRUSTED_NATIVE_DISPLACEMENT_'+id);
    cumulativeXZ+=dx;
    if(dx>.02)acceptedMoving++;
   }
  }
  const first=rows[0],final=rows.at(-1);
  if(first.tick>e.firstRead.tick||final.tick!==e.lastTick||
     Math.hypot(...final.foot.map((v,i)=>v-last.physicalFoot[i]))>.15)
   fail('MOBILE_NATIVE_CLOCK_OR_END_FOOT_MISMATCH_'+id);
  const displacement=Math.hypot(final.foot[0]-first.foot[0],
   final.foot[2]-first.foot[2]);
  if(!Number.isFinite(displacement)||displacement<=1||
     cumulativeXZ<=displacement||acceptedMoving<60||
     solids.size<2)fail('REAL_MOBILE_EVIDENCE_NOT_PROVEN_'+id);
  cpu[id]={
   actualNativeGoalRequests:gate.runtimeTrueOriginalGoalRequests,
   strictlyApprovedOriginalGoals:gate.strictlyApprovedGoals,
   genuine60HzFootRows:rows.length,firstTick:first.tick,lastTick:final.tick,
   allRegisteredOriginalRapierFootRows:rows.length,
   cumulativePhysicalXZTravelMeters:Number(cumulativeXZ.toFixed(6)),
   firstLastPhysicalXZDisplacementMeters:Number(displacement.toFixed(6)),
   movingIntervalsAbove2cm:acceptedMoving,
   actualOriginalSolidIdsTouched:[...solids],
   noDryDenialProbeBecauseMoving:true,
   rejectedOriginalRoutes:[],
   physicalFullCapsuleTraversalCertified:false,
   opposingCrossTeamRouteCertified:false
  };
 }
 return {schema:'B451_REAL_B2_B4_SOURCE_MOBILE_OBSERVATION_V3',
  verdict:'PASS_LIMITED_TRUE_ORIGINAL_RAPIER_FOOT_MOVEMENT_NOT_4V4',
  browserOrigin:d.browserOrigin,originalSource:'25/17/26/0',
  realNativeTicks:e.realNativeTicks,perCpu:cpu,
  oldB450DryDenialCountsNotApplicable:true,
  actorWrites:0,geometryWrites:0,clockWrites:0,scoreWrites:0,
  crossTeamPathCertified:false,formal4v4Certified:false,
  naturalEnemyHpLossCertified:false,real150TickRespawnCertified:false};
}

export function auditRealB450(d,fullRate=null){
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
 if(probes.length===0)return auditMovingB2B4(d,fullRate);
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
 const sameRunTrace=join(dirname(path),
  'b454-native-b2-b4-physical-60hz.json');
 const result=auditRealB450(d,existsSync(sameRunTrace)?
  JSON.parse(readFileSync(sameRunTrace,'utf8')):null);
 writeFileSync(join(dirname(path),'b450-first-original-gap-report.json'),
  JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({...result,perCpu:Object.fromEntries(
  Object.entries(result.perCpu).map(([id,c])=>[id,
   result.schema==='B451_REAL_B2_B4_SOURCE_MOBILE_OBSERVATION_V3'?
    {actualNativeGoalRequests:c.actualNativeGoalRequests,
     realTravelMeters:c.cumulativePhysicalXZTravelMeters,
     registeredFootRows:c.allRegisteredOriginalRapierFootRows,
     originalSolids:c.actualOriginalSolidIdsTouched}:
    {inspected:c.inspectedOriginalGoals,
     denied:c.deniedIntermediateOriginalSupport,
     reasons:c.firstDenialReasonCounts,
     first:c.rejectedOriginalRoutes[0]??null}]))}));
}
