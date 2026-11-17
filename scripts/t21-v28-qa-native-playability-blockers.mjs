#!/usr/bin/env node
/** T21 V28 / QA #18. One *genuine* native SOURCE session, causally useful
 * KCC/Crowd/Recast denial triage. This code NEVER chooses a goal, spawns
 * an actor, moves an actor, heals, paints, modifies geometry or awards score.
 * A refusal is evidence of a gate, not permission to bypass the gate. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const SOURCE='25/17/26/0';
const ACTORS=['B2','B4'];
const count=n=>Number.isSafeInteger(n)&&n>=0;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const foot=p=>Array.isArray(p)&&p.length===3&&p.every(finite);
const r6=x=>Math.round(x*1e6)/1e6;
function fail(code){throw Error('QA18_ORIGINAL_NATIVE_CAUSAL_PROVENANCE_'+code)}
function fullNativeFoot(rows,id){
 if(!Array.isArray(rows)||rows.length<600)fail('INSUFFICIENT_60HZ_'+id);
 let floor=0,still=0,start=null,longest=0;
 for(let i=0;i<rows.length;i++){
  const x=rows[i];
  if(x?.id!==id||!count(x.tick)||!foot(x.foot)||
     x.rejoined!==true||x.life!=='ACTIVE'||x.mode!=='GROUND'||
     typeof x.originalRapierSolidId!=='string'||
     !x.originalRapierSolidId.startsWith('UndertowT21D:')||
     typeof x.registeredOriginalHit!=='boolean')fail('INVALID_FOOT_'+id);
  if(i>0&&x.tick!==rows[i-1].tick+1)fail('GAP_IN_60HZ_'+id);
  if(x.registeredOriginalHit)floor++;
  if(i>0){
   const p=rows[i-1],delta=Math.hypot(...x.foot.map((v,j)=>v-p.foot[j]));
   if(x.registeredOriginalHit&&p.registeredOriginalHit&&delta<=.005){
    if(start===null)start=p.tick;
    still=x.tick-start;
    longest=Math.max(longest,still);
   }else start=null;
  }
 }
 return {firstTick:rows[0].tick,lastTick:rows.at(-1).tick,
  genuine60HzRows:rows.length,originalRapierSupportedRows:floor,
  allRegisteredOriginalFloorSupported:floor===rows.length,
  longestGroundedNearlyStationaryTicks:longest,
  longestGroundedNearlyStationarySeconds:r6(longest/60)};
}
function validateGate(row,id){
 if(!row||row.id!==id||
   ![row.originalFloorProposals,row.inspectedProposals,
     row.rejectedNativeRecastOrOriginalPath,
     row.rejectedNativeIntermediateOriginalSupport,
     row.strictlyApprovedGoals,row.runtimeChooseInvocations,
     row.runtimeNoOriginalFrontGoals,row.runtimeTrueOriginalGoalRequests]
      .every(count)||row.inspectedProposals>row.originalFloorProposals)
  fail('INVALID_TRUE_SOURCE_GOAL_GATE_'+id);
 return {
  originalFloorProposals:row.originalFloorProposals,
  inspectedProposals:row.inspectedProposals,
  actualStrictOriginalGoals:row.strictlyApprovedGoals,
  nativeRecastOrRapierRejections:row.rejectedNativeRecastOrOriginalPath,
  originalIntermediateSupportRejections:
   row.rejectedNativeIntermediateOriginalSupport,
  runtimeGoalChoices:row.runtimeChooseInvocations,
  runtimeNoOriginalGoal:row.runtimeNoOriginalFrontGoals,
  actualNativeSourceGoalRequests:row.runtimeTrueOriginalGoalRequests
 };
}
function validateDry(x,id){
 if(!x||x.id!==id||x.probeOnlyNoActorOrGoalWrites!==true||
    !count(x.nativeTick)||!foot(x.actualPhysicalFoot)||
    ![x.inspectedOriginalGoals,x.deniedRapierOrBoundary,
      x.nativeIntermediateSupport,x.passedAllOriginalChecks].every(count)||
    !Array.isArray(x.b450FailedOriginalGoals))fail('INVALID_DRY_ROUTE_'+id);
 const causes={};
 let min=null,max=null;
 for(const goal of x.b450FailedOriginalGoals){
  const d=goal?.firstDenied;
  if(!foot(goal?.originalGoal)||!count(goal?.nativePathPointCount)||
     typeof d?.cause!=='string'||!d.cause||
     !foot(d?.xyz)||!count(d.leg)||!count(d.sample)||
     !count(d.checked)||typeof d.hitSolidId!=='string'||
     !d.hitSolidId.startsWith('UndertowT21D:')||
     !finite(d.verticalGapMeters)||d.verticalGapMeters<0)
    fail('INVALID_REAL_ROUTE_DENIAL_'+id);
  causes[d.cause]=(causes[d.cause]??0)+1;
  min=min===null?d.verticalGapMeters:Math.min(min,d.verticalGapMeters);
  max=max===null?d.verticalGapMeters:Math.max(max,d.verticalGapMeters);
 }
 return {
  realProbeNativeTick:x.nativeTick,
  originalGoalCandidatesInspected:x.inspectedOriginalGoals,
  nativeIntermediateSupportRejected:x.nativeIntermediateSupport,
  allOriginalChecksPassed:x.passedAllOriginalChecks,
  firstDeniedCauses:causes,
  actuallyWitnessedMinVerticalGapMeters:min===null?null:r6(min),
  actuallyWitnessedMaxVerticalGapMeters:max===null?null:r6(max),
  dryProbeDidNotMoveOrAuthorizeNativeActors:true
 };
}
function sampleKcc(kcc,id){
 if(!kcc||kcc.source!=='REAL_SOURCE_RECAST_PROPOSAL_AND_RAPIER_KCC'||
    kcc.syntheticFootMoves!==0||kcc.syntheticGoals!==0||
    kcc.newSolids!==0||kcc.newNavLinks!==0||
    kcc.scoreablePromotions!==0)return {available:false,reason:'NO_SAME_RUN_TRUE_KCC_COUNTERS'};
 const a=kcc.byActor?.[id];
 if(!a)return {available:false,reason:'NO_NATIVE_COUNTER_FOR_'+id};
 const keys=['crowdNoStep','crowdProposals','rapierRejected',
  'rapierAcceptedMoving','rapierAcceptedStationary','rapierActualTeammateSlides',
  'offmeshDeferred','overspeedRejected','crowdReanchors'];
 if(!keys.every(k=>count(a[k]))||
    !foot(a.lastRealFoot)||!foot(a.lastCrowdCandidate))
  return {available:false,reason:'INVALID_NATIVE_KCC_COUNTERS'};
 return {available:true,
  counters:Object.fromEntries(keys.map(k=>[k,a[k]])),
  lastRejectCause:typeof a.lastRejectCause==='string'?a.lastRejectCause:null,
  rejectionCauses:Object.fromEntries(Object.entries(a.rejectionCauses??{})
   .filter(([key,value])=>typeof key==='string'&&count(value))),
  lastRejectOwners:Array.isArray(a.lastRejectOwners)?
   a.lastRejectOwners.filter(x=>typeof x==='string'):[],
  lastNativeRealFoot:[...a.lastRealFoot],
  lastRecastCandidate:[...a.lastCrowdCandidate],
  noSyntheticNativeFootMoves:true
 };
}


/** Actual same-session native counters, not a fabricated 60Hz route.
 * The beginning must come from the B441 real PLAYING snapshot and the
 * ending from the SAME real browser SOURCE window. A nonzero delta shows
 * true work attempted, never that the actor reached an original goal. */
function kccWindowDelta(before,after,id,firstTick,lastTick){
 if(!count(firstTick)||!count(lastTick)||lastTick<=firstTick)
  return {available:false,reason:'NO_SAME_NATIVE_OBSERVATION_INTERVAL'};
 const pre=sampleKcc(before,id),post=sampleKcc(after,id);
 if(!pre.available||!post.available)
  return {available:false,reason:!pre.available?
   'NO_AUTHENTIC_START_KCC_'+pre.reason:
   'NO_AUTHENTIC_END_KCC_'+post.reason};
 const diff={};
 for(const k of Object.keys(post.counters)){
  const v=post.counters[k]-pre.counters[k];
  if(!count(v))return {available:false,
   reason:'NONMONOTONIC_NATIVE_KCC_COUNTER_'+k};
  diff[k]=v;
 }
 return {
  available:true,firstNativeTick:firstTick,lastNativeTick:lastTick,
  intervalNativeTicks:lastTick-firstTick,
  genuineNativeCounterDeltas:diff,
  lastNativeRejectCause:post.lastRejectCause,
  rejectionCauseCounterSnapshot:post.rejectionCauses,
  lastNativeRecastCandidate:post.lastRecastCandidate,
  lastNativePhysicalFoot:post.lastNativeRealFoot,
  actualActorMovementFromCounterAloneCertified:false,
  noActorOrNavigationWrites:true
 };
}

export function auditSourceRealGameplayBlockers(proof,trace,groundMotion=null,priorGroundMotion=null){
 if(proof?.schema!=='B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF'||
    proof.source!==SOURCE||!proof.b441NativeEvidence||
    !trace||trace.schema!=='B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1'||
    trace.source!==SOURCE||trace.originalKccOrGameWrites!==0||
    trace.originalPathAuthorizationChanged!==false||
    trace.continuousCapsuleContactCertified!==false||
    trace.b2b4FrontlineGoalCertified!==false||
    trace.originalSourceGeometryWrites!==0||trace.actorWrites!==0||
    trace.nativeClockWrites!==0||trace.scoreWrites!==0||
    !finite(trace.browserWorldOrigin)||trace.browserWorldOrigin!==proof.browserOrigin||
    !ACTORS.every(id=>trace.dropped?.[id]===0)||
    proof.actorWrites!==0||proof.scoreWrites!==0||
    proof.nativeClockWrites!==0||proof.sourceGeometryWrites!==0||
    proof.k2WindowProvenance?.browserOriginEqual!==true)
  fail('SOURCE_WORLD_AND_NATIVE_ACTOR_MUTATION_HOLD');
 const e=proof.b441NativeEvidence,byActor={};
 for(const id of ACTORS){
  const footResult=fullNativeFoot(trace.rows?.[id],id);
  const gate=validateGate(e.b445LastOriginalGateByCpu?.find(x=>x.id===id),id);
  const dry=validateDry(e.b446LiveActualCpuFootDryRouteProbes?.find(x=>x.id===id),id);
  if(dry.realProbeNativeTick>footResult.lastTick||
     dry.realProbeNativeTick<footResult.firstTick-120)
   fail('DRY_ROUTE_NOT_SAME_NATIVE_TIMELINE_'+id);
  const actualGoalAdmissionBlocked=footResult.allRegisteredOriginalFloorSupported&&
   gate.actualStrictOriginalGoals===0&&
   gate.runtimeGoalChoices>0&&
   gate.runtimeGoalChoices===gate.runtimeNoOriginalGoal&&
   gate.actualNativeSourceGoalRequests===0&&
   dry.allOriginalChecksPassed===0&&
   gate.originalIntermediateSupportRejections>0;
  const kccWindow=kccWindowDelta(priorGroundMotion,groundMotion,id,
   proof.k2WindowProvenance?.firstTick,
   proof.k2WindowProvenance?.lastTick);
  const hasPhysicalKccVeto=kccWindow.available&&
   kccWindow.genuineNativeCounterDeltas.rapierRejected>0&&
   kccWindow.genuineNativeCounterDeltas.rapierAcceptedMoving===0;
  const hasNoCrowdProposals=kccWindow.available&&
   kccWindow.genuineNativeCounterDeltas.crowdProposals===0&&
   kccWindow.genuineNativeCounterDeltas.rapierAcceptedMoving===0;
  const hasActualApprovedGoal=gate.actualStrictOriginalGoals>0&&
   gate.actualNativeSourceGoalRequests>0;
  byActor[id]={
   nativeFoot:footResult,nativeGoalAdmission:gate,
   trueOriginalFootDryRoute:dry,
   sameRunKccMotion:sampleKcc(groundMotion,id),
   sameRunKccInterval:kccWindow,
   observedGate:actualGoalAdmissionBlocked?
    'HOLD_STRICT_ORIGINAL_GOALS_ALL_DENIED':
    hasActualApprovedGoal&&
     footResult.longestGroundedNearlyStationaryTicks>=300&&
     hasPhysicalKccVeto?
     'HOLD_ACTUAL_RAPIER_KCC_VETO_WITH_APPROVED_SOURCE_GOAL':
    hasActualApprovedGoal&&
     footResult.longestGroundedNearlyStationaryTicks>=300&&
     hasNoCrowdProposals?
     'HOLD_NO_TRUE_CROWD_PROPOSALS_WITH_APPROVED_SOURCE_GOAL':
    footResult.longestGroundedNearlyStationaryTicks>=300?
     'HOLD_GROUNDED_LONG_STALL_CAUSE_UNRESOLVED':
     'HOLD_NO_NATIVE_CAUSE_CERTIFIED',
   sourceHeightGapCauseSeen:(dry.firstDeniedCauses
    .NATIVE_PATH_RAPIER_HEIGHT_MISMATCH??0)>0,
   movementImprovedAfterNewCpuCodeCertified:false,
   artificialGoalFixAuthorized:false,
   nativeActorTeleports:0
  };
 }
 const route=proof.b487OriginalCrossTeamTopology;
 const hp=proof.qaIssue18RealNativeHpWitness;
 const originalCrossTeam=route?.source===SOURCE&&
  route.totalOriginalNativePathQueries===16&&
  count(route.nativePathReportedPairs)?
  route.nativePathReportedPairs:null;
 const hpCount=hp?.source===SOURCE&&
  count(hp.actualHumanCpuHitCount)?hp.actualHumanCpuHitCount:null;
 const reason=originalCrossTeam===0?
  'ORIGINAL_OPPOSING_RECAST_CONNECTIVITY_0_OF_16':
  originalCrossTeam===null?
   'OPPOSING_SOURCE_RECAST_ROUTE_NOT_RECORDED':
  'ORIGINAL_NATIVE_RECAST_PATHS_ARE_NOT_COMPLETE_CAPSULE_ROUTES';
 return {
  schema:'T21_V28_ISSUE18_REAL_CPU_ROUTE_AND_GAMEPLAY_BLOCKERS_V1',
  source:SOURCE,
  immutableSourceStage:{solids:25,paint:17,navLinks:26,scoreable:0},
  observedActorIds:ACTORS,byActor,
  actualCrossTeamNativePathPairs:originalCrossTeam,
  genuineHumanCpuHpHits:hpCount,
  actualCpuSplatCertified:false,actual150TickRespawnCertified:false,
  blockingNaturalEnemyEncounter:reason,
  primaryPlayable4v4Gate:reason,
  result:'HOLD_REAL_NATIVE_4V4_AND_HP_CHAIN',
  nativeSourceRecastAndRapierSafetyMustRemainEnforced:true,
  cannotInferCauseFromStationaryFootAlone:true,
  noStageNavActorHealthClockScoreWrites:0,
  full180sMatchCertified:false,
  formal4v4Certified:false,
  originalF4Certified:false
 };
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const [a,b,c]=process.argv.slice(2);
 if(!a||!b){console.error('USAGE: node scripts/t21-v28-qa-native-playability-blockers.mjs <genuine-B440-RAW.json> <genuine-B454-RAW.json> [out.json]');process.exitCode=2;}
 else{
  try{
   const report=auditSourceRealGameplayBlockers(
    JSON.parse(readFileSync(resolve(a),'utf8')),
    JSON.parse(readFileSync(resolve(b),'utf8')));
   if(c)writeFileSync(resolve(c),JSON.stringify(report,null,2)+'\n');
   console.log(JSON.stringify(report,null,2));
  }catch(error){console.error(String(error));process.exitCode=2;}
 }
}
