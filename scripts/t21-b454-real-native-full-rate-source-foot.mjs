#!/usr/bin/env node
/** B454: independently read B440 actual native frames and full-rate B2/B4
 * trace from SAME Chromium world. No path authorization or body writes. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const fail=s=>{throw Error('B454_ORIGINAL_NATIVE_60HZ_SOURCE_HOLD_'+s)};
const xyz=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const nat=x=>Number.isSafeInteger(x)&&x>=0;
const xzd=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
export function auditRealB454(raw,source){
 const e=raw?.b441NativeEvidence;
 if(raw?.schema!=='B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF'||
  raw.source!=='25/17/26/0'||raw.syntheticInput!==false||
  raw.officialWinner!=='NONE'||raw.actorWrites!==0||
  raw.scoreWrites!==0||raw.nativeClockWrites!==0||
  raw.sourceGeometryWrites!==0||raw.formal4v4Certified!==false||
  !Number.isFinite(raw.browserOrigin)||e?.realSevenCpu!==true||
  e.source!=='25/17/26/0'||e.b442Formal4v4Certified!==false||
  e.naturalOpposingTeamRouteCertified!==false||
  !nat(e.realNativeTicks)||e.realNativeTicks<720||
  !Array.isArray(e.realFrames)||e.realFrames.length<10||
  source?.schema!=='B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1'||
  source.source!=='25/17/26/0'||
  source.browserWorldOrigin!==raw.browserOrigin||
  source.nativePhysicsFootSource!==true||
  source.originalKccOrGameWrites!==0||
  source.originalSourceGeometryWrites!==0||
  source.actorWrites!==0||source.scoreWrites!==0||
  source.nativeClockWrites!==0||
  source.originalPathAuthorizationChanged!==false||
  source.continuousCapsuleContactCertified!==false||
  source.b2b4FrontlineGoalCertified!==false||
  source.originalWinner!=='NONE'||
  source.dropped?.B2!==0||source.dropped?.B4!==0)
  fail('REAL_ORIGINAL_WORLD_AND_NO_GAME_WRITES');
 const probes=e.b446LiveActualCpuFootDryRouteProbes;
 if(!Array.isArray(probes)||!['B2','B4'].every(id=>
  probes.some(p=>p.id===id&&Array.isArray(p.b450FailedOriginalGoals)&&
   p.b450FailedOriginalGoals.length===p.nativeIntermediateSupport&&
   p.nativeIntermediateSupport>=1)))
  fail('MISSING_ORIGINAL_DENIED_RECAST_PATHS');
 const byId={};
 for(const id of ['B2','B4']){
  const rows=source.rows?.[id],probe=probes.find(p=>p.id===id);
  if(!Array.isArray(rows)||rows.length<700||rows.length>1200||
   !nat(e.lastTick)||rows[0]?.tick>e.realFrames[0]?.tick||
   rows.at(-1)?.tick<e.realFrames.at(-1)?.tick||
   rows.at(-1)?.tick>e.lastTick+120)
   fail('UNBOUNDED_OR_MISSING_NATIVE_FULL_RATE_'+id);
  let nRegistered=0,nWithin025=0,unregistered=0,nonGrounded=0;
  let maxNativeStep=0,totalNativeMeters=0,closest=null;
  const byTick=new Map();
  for(let k=0;k<rows.length;k++){
   const v=rows[k];
   if(!nat(v?.tick)||v.id!==id||!xyz(v.foot)||
    typeof v.mode!=='string'||typeof v.life!=='string'||
    typeof v.rejoined!=='boolean'||
    (v.originalRapierSolidId!==null&&
      (typeof v.originalRapierSolidId!=='string'||!v.originalRapierSolidId))||
    (v.originalRapierHitY!==null&&!Number.isFinite(v.originalRapierHitY))||
    (v.absFootToRapierY!==null&&!Number.isFinite(v.absFootToRapierY))||
    (v.originalRapierHitY===null)!==(v.originalRapierSolidId===null)||
    (v.originalRapierHitY===null)!==(v.absFootToRapierY===null)||
    v.registeredOriginalHit===true&&v.originalRapierSolidId===null||
    v.withinUnchanged025m!==(v.registeredOriginalHit===true&&
      v.absFootToRapierY!==null&&v.absFootToRapierY<=.25)||
    v.sourceBRegion!==(v.foot[2]<=-33)||
    v.absFootToRapierY!==null&&
      Math.abs(v.absFootToRapierY-Math.abs(v.foot[1]-v.originalRapierHitY))>1e-5||
    k>0&&v.tick!==rows[k-1].tick+1)
     fail('NONCONTINUOUS_OR_INVALID_NATIVE_ACTUAL_SAMPLE_'+id);
   byTick.set(v.tick,v);
   if(v.registeredOriginalHit)nRegistered++;else unregistered++;
   if(v.withinUnchanged025m)nWithin025++;
   if(v.life!=='ACTIVE'||v.mode!=='GROUND'||!v.rejoined)nonGrounded++;
   if(k>0){
    const d=xzd(rows[k-1].foot,v.foot);
    maxNativeStep=Math.max(maxNativeStep,d);totalNativeMeters+=d;
   }
   for(const g of probe.b450FailedOriginalGoals){
    const t=g.firstDenied;
    if(!xyz(t.xyz)||t.cause!=='NATIVE_PATH_RAPIER_HEIGHT_MISMATCH'||
      !Number.isFinite(t.verticalGapMeters)||t.verticalGapMeters<=.25)
      fail('DENIAL_NOT_ORIGINAL_RAPIER_HEIGHT_MISMATCH_'+id);
    const distance=xzd(v.foot,t.xyz);
    if(!closest||distance<closest.horizontalMeters)
     closest={nativeTick:v.tick,physicalFoot:[...v.foot],
      rejectedNativePathXYZ:[...t.xyz],
      horizontalMeters:distance,
      physicalStaticSolidId:v.originalRapierSolidId,
      physicalStaticFootGapMeters:v.absFootToRapierY,
      rejectedRecastPointGapMeters:t.verticalGapMeters};
   }
  }
  let polledMatches=0;
  for(const frame of e.realFrames){
   const observed=frame.physicalFeet?.find(x=>x.id===id)?.foot;
   if(!nat(frame.tick)||!xyz(observed))fail('UNTRUSTED_REAL_POLLS_'+id);
   const exact=byTick.get(frame.tick);
   if(!exact||Math.hypot(...exact.foot.map((v,k)=>v-observed[k]))>.005)
    fail('REAL_FULL_RATE_AND_POLLED_CDP_DISAGREE_'+id);
   polledMatches++;
  }
  byId[id]={nativeTickCount:rows.length,firstNativeTick:rows[0].tick,
   lastNativeTick:rows.at(-1).tick,missingNativeTicks:0,
   originalRapierRegisteredSamples:nRegistered,
   atMostUnchanged025mStaticGapSamples:nWithin025,
   noRegisteredStaticHitSamples:unregistered,
   nongroundedOrNonActiveSamples:nonGrounded,
   witnessedNativeXZPolylineMeters:totalNativeMeters,
   maximumConsecutiveNativeTickXZStepMeters:maxNativeStep,
   independentlyMatchedSparseChromePolls:polledMatches,
   closestSameWorldActualFootToDeniedNativeRecast:closest,
   originalGoalReachabilityGranted:false,
   fullyContinuousCapsuleContactCertified:false};
 }
 return {schema:'B454_INDEPENDENT_REAL_B2_B4_60HZ_SOURCE_FOOT_V1',
  verdict:'PASS_REAL_EVERY_TICK_PHYSICAL_FOOT_OBSERVATION_NOT_A_KCC_ROUTE_CERT',
  browserWorldOrigin:raw.browserOrigin,source:'25/17/26/0',
  realSevenCpu:true,realNativeTicks:e.realNativeTicks,
  B2B4:byId,unrestricted4v4Certified:false,
  naturalCrossTeamRouteCertified:false,
  originalCollisionSafetyGateChanged:false,
  actorWrites:0,originalGeometryWrites:0,scoreWrites:0,
  gameplayClockWrites:0,originalWinner:'NONE'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==3)fail('TRUE_ORIGINAL_EVIDENCE_FOLDER_REQUIRED');
 const folder=resolve(process.argv[2]);
 const raw=JSON.parse(readFileSync(join(folder,
  'b440-short-real-original-human-foot.json'),'utf8'));
 const source=JSON.parse(readFileSync(join(folder,
  'b454-native-b2-b4-physical-60hz.json'),'utf8'));
 const report=auditRealB454(raw,source);
 writeFileSync(join(folder,'b454-independent-real-original-60hz-foot.json'),
  JSON.stringify(report,null,2)+'\n');
 console.log('B454_TRUE_ORIGINAL_NATIVE_60HZ_CPU_FOOT',JSON.stringify(report));
}
