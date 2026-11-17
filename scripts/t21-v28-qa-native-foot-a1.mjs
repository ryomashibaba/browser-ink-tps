#!/usr/bin/env node
/** Issue #18 read-only second-phase QA. Checks real 60Hz Rapier CPU feet and
 * genuine second C-order native A1 samples. Original geometry 25/17/26/0;
 * NEVER writes Actor, path, clock, health, paint, score or HUD. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const ids=['B2','B4'];
const validInt=n=>Number.isSafeInteger(n)&&n>=0;
const validFoot=foot=>Array.isArray(foot)&&foot.length===3&&foot.every(Number.isFinite);
const rounded=n=>Math.round(n*1000)/1000;
const SOURCE='25/17/26/0';
const threshold=.005,holdTicks=300;
const check=v=>{if(!v)throw Error('QA18_INVALID_NATIVE_FOOT_EVIDENCE');};
export function auditRealCpuFootAndAlly(raw,footTrace,allyTrace){
 check(raw?.schema==='B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF'&&
   raw.source===SOURCE&&footTrace?.source===SOURCE&&allyTrace?.source===SOURCE);
 check(footTrace.schema==='B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1'&&
  allyTrace.schema==='B484_TRUE_NATIVE_A1_FOLLOW_THROUGH_V1'&&
  footTrace.browserWorldOrigin===raw.browserOrigin);
 check(footTrace.actorWrites===0&&footTrace.originalSourceGeometryWrites===0&&
  footTrace.scoreWrites===0&&footTrace.nativeClockWrites===0&&
  footTrace.originalPathAuthorizationChanged===false&&
  allyTrace.actorInkPhysicsClockWrites===0&&
  footTrace.originalWinner==='NONE'&&
  allyTrace.officialWinner==='NONE'&&allyTrace.scoreable===0);
 const bots={};
 for(const id of ids){
  const rows=footTrace?.rows?.[id];
  check(Array.isArray(rows)&&rows.length>=2&&
   (footTrace.dropped?.[id]??-1)===0);
  for(let i=0;i<rows.length;i++){
   const r=rows[i];
   check(r.id===id&&validInt(r.tick)&&validFoot(r.foot)&&
    r.mode==='GROUND'&&r.life==='ACTIVE'&&r.rejoined===true&&
    typeof r.originalRapierSolidId==='string'&&
    r.originalRapierSolidId.startsWith('UndertowT21D:')&&
    typeof r.registeredOriginalHit==='boolean');
   if(i>0)check(r.tick===rows[i-1].tick+1);
  }
  let max=0,start=null,bestStart=null,bestLast=null;
  let registered=0;
  for(let i=0;i<rows.length;i++){
   const current=rows[i];
   if(current.registeredOriginalHit)registered++;
   if(i===0)continue;
   const prev=rows[i-1];
   const step=Math.hypot(
    current.foot[0]-prev.foot[0],
    current.foot[1]-prev.foot[1],
    current.foot[2]-prev.foot[2]);
   const groundedPair=current.registeredOriginalHit&&
    prev.registeredOriginalHit;
   if(step<=threshold&&groundedPair){
    if(start===null)start=prev.tick;
    const ticks=current.tick-start;
    if(ticks>max){max=ticks;bestStart=start;bestLast=current.tick;}
   }else start=null;
  }
  const first=rows[0],last=rows.at(-1);
  bots[id]={
   firstNativeTick:first.tick,lastNativeTick:last.tick,
   exactPerTickRows:rows.length,
   allNativeTicksContiguous:true,
   nativeOriginalRapierSupportSamples:registered,
   allSamplesRegisteredOriginalGround:registered===rows.length,
   netPlanarDisplacementMeters:rounded(Math.hypot(
    last.foot[0]-first.foot[0],last.foot[2]-first.foot[2])),
   longestRegisteredNearStationaryNativeTicks:max,
   longestRegisteredNearStationaryWindow:
    bestStart===null?null:{firstTick:bestStart,lastTick:bestLast},
   observedGroundedStationaryOver5Seconds:max>=holdTicks,
   navigationOrKccStallRootCauseCertified:false,
   continuousCapsuleRouteCertified:false
  };
 }
 const a=allyTrace,rows=a.rows;
 check(Array.isArray(rows)&&rows.length===a.nativeRows&&
  a.nativeRows>=100&&a.genuineKeyRequests===2&&
  a.currentOrderKeyRequest===2&&
  a.currentOrderArrivalOnlyFromOriginalB471===true&&
  a.trueArrivalOnlyFromB471===true&&
  a.crossTeamRouteCertified===false&&
  a.originalCapsuleRouteCertified===false);
 let supported=0;
 for(let i=0;i<rows.length;i++){
  const v=rows[i];check(validInt(v.tick)&&validFoot(v.foot));
  if(i)check(v.tick===rows[i-1].tick+1);
  if(typeof v.sourceSolidId==='string'&&
    v.sourceSolidId.startsWith('UndertowT21D:'))supported++;
 }
 check(supported===a.originalFloorHitSamples);
 const knownHudFailure=String(raw.error||'').includes(
  'B484_GENUINE_SECOND_C_ORDER_PLAYER_HUD_NOT_VERIFIED');
 const anyLongHold=ids.some(id=>
  bots[id].observedGroundedStationaryOver5Seconds&&
  bots[id].allSamplesRegisteredOriginalGround);
 return {
  schema:'T21_V28_ISSUE18_REAL_60HZ_CPU_PHYSICAL_FOOT_AND_A1_ORDER_QA_V1',
  source:SOURCE,
  unchangedNativeBrowserWorld:true,
  realSourceB2B4:bots,
  sameNativeA1OriginalOrder:{
   observedNativeRows:a.nativeRows,
   registeredOriginalFloorSamples:supported,
   everyObservedFrameOnOriginalFloor:supported===rows.length,
   genuineCKeyRequests:a.genuineKeyRequests,
   originalB471VerifiedArrivals:a.originalB471VerifiedArrivals,
   secondOrderObservedFootTravelMeters:
    rounded(a.currentOrderObservedFootTravelMeters),
   secondOrderClosestRealGoalMeters:
    rounded(a.currentOrderClosestPhysicalGoalDistanceXZ),
   completeCommandCausalityCertified:false,
   sourceRouteCertified:false
  },
  subsequentHudFailure:{
   originalB440RunFailedAtB484PlayerHud:knownHudFailure,
   // Code review: PLAYER uses compact b141PlayerAllyHudLine while old
   // B440 asserts verbose "A1 C ORDER 2 ..." expected only in QA view.
   playerCompactVsQaVerboseMismatchCodeIdentified:knownHudFailure,
   realDomTextOfFailingFrameSaved:false,
   actualHudRootCauseFullyCertified:false
  },
  firstActionableQualityRisk:anyLongHold?
   'ORIGINAL_GROUNDED_CPU_LONG_STATIONARY_WINDOW':
   'NO_LONG_REGISTERED_CPU_STATIONARY_WINDOW_PROVEN',
  originalF4CrossTeamRouteCertified:false,
  officialScoreable:0,
  formal4v4Certified:false,
  sameActor150TickRespawnCertified:false,
  geometryActorClockPaintScoreWrites:0
 };
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const [a,b,c,d]=process.argv.slice(2);
 if(!a||!b||!c){console.error('USAGE: node scripts/t21-v28-qa-native-foot-a1.mjs <B440-RAW.json> <B454-RAW.json> <B484-RAW.json> [out.json]');process.exitCode=2;}
 else{
  try{
   const report=auditRealCpuFootAndAlly(
    JSON.parse(readFileSync(resolve(a),'utf8')),
    JSON.parse(readFileSync(resolve(b),'utf8')),
    JSON.parse(readFileSync(resolve(c),'utf8')));
   if(d)writeFileSync(resolve(d),JSON.stringify(report,null,2)+'\n');
   console.log(JSON.stringify(report,null,2));
  }catch(e){console.error(String(e));process.exitCode=2;}
 }
}
