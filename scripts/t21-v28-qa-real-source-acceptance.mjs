#!/usr/bin/env node
// Issue #18, lot 2: evaluate immutable REAL Chromium SOURCE B440 evidence.
// Never changes native game state, stages, goals, hits, clocks, paint or scores.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const ACTORS=Object.freeze(['A1','A2','A3','B1','B2','B3','B4']);
const LIMIT=600;
const validCount=v=>Number.isSafeInteger(v)&&v>=0;
const validFoot=f=>Array.isArray(f)&&f.length===3&&f.every(Number.isFinite);
const round=v=>Math.round(v*1000)/1000;

export function auditRealSourceB440(proof){
 if(!proof||proof.schema!=='B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF'||
    proof.source!=='25/17/26/0')throw Error('QA18_REAL_SOURCE_AUTHORITY_REQUIRED');
 const forbiddenWrites=['actorWrites','nativeClockWrites','scoreWrites','sourceGeometryWrites'];
 const noObserverWrites=forbiddenWrites.every(k=>proof[k]===0);
 const native=proof.b441NativeEvidence;
 const started=proof.after?.phase==='PLAYING'&&
  proof.after?.cpuRejoins===7&&validCount(proof.after?.tick);
 const human=proof.b475RealMouseAccepted;
 const paint=proof.nativePlayerShotPaintHud;
 const humanShots=validCount(human?.realHumanShots)&&human.genuineChromeMouse===true&&
  human.realHumanShots>0?human.realHumanShots:0;
 const humanPaintCells=paint?.lastMode==='ACTUAL_SHOT_ONLY'&&
  validCount(paint.lastImpactChangedCells)&&
  paint.lastImpactChangedCells>0&&paint.originalScoreable===0?
  paint.lastImpactChangedCells:0;

 // Native positions are sampled physical Rapier feet, NOT path completion.
 const inputFrames=Array.isArray(native?.realFrames)?native.realFrames:[];
 const frames=[];
 for(const frame of inputFrames){
  const feet=frame?.physicalFeet;
  if(!validCount(frame?.tick)||!Array.isArray(feet)||feet.length!==ACTORS.length||
     frames.length>0&&frame.tick<=frames.at(-1).tick||
     !ACTORS.every(id=>feet.filter(x=>x?.id===id&&validFoot(x.foot)&&
      x.rejoined===true).length===1))continue;
  frames.push(frame);
 }
 const motion={};
 for(const id of ACTORS){
  const samples=frames.map(f=>({tick:f.tick,
   foot:f.physicalFeet.find(x=>x.id===id).foot}));
  const first=samples[0],last=samples.at(-1);
  let sampledPlanarStepSum=0,largestConsecutiveSampleGapTicks=0;
  let maxNoNetMoveTicks=0,flatStart=null;
  for(let i=1;i<samples.length;i++){
   const a=samples[i-1],b=samples[i];
   const step=Math.hypot(b.foot[0]-a.foot[0],b.foot[2]-a.foot[2]);
   sampledPlanarStepSum+=step;
   largestConsecutiveSampleGapTicks=Math.max(
    largestConsecutiveSampleGapTicks,b.tick-a.tick);
   if(step<.01){
    if(flatStart===null)flatStart=a.tick;
    maxNoNetMoveTicks=Math.max(maxNoNetMoveTicks,b.tick-flatStart);
   }else flatStart=null;
  }
  motion[id]={
   sampleCount:samples.length,
   firstSampleTick:first?.tick??null,
   lastSampleTick:last?.tick??null,
   firstToLastPlanarDisplacementMeters:first&&last?
    round(Math.hypot(last.foot[0]-first.foot[0],
     last.foot[2]-first.foot[2])):null,
   sampledPlanarStepSumMeters:samples.length>=2?
    round(sampledPlanarStepSum):null,
   observedNearStationaryConsecutiveTicks:maxNoNetMoveTicks,
   maxSampleIntervalTicks:largestConsecutiveSampleGapTicks,
   fullNativeKccTrajectoryCertified:false
  };
 }
 const k2=proof.k2PerActorNativeShotAndInk;
 const window=proof.k2WindowProvenance;
 const k2MeasuredDelta=validCount(window?.nativeTickDelta)?
  window.nativeTickDelta:
  validCount(k2?.nativeTicksObserved)?k2.nativeTicksObserved:null;
 const sameBrowser=window?.browserOriginEqual===true;
 // Legacy genuine RAW might have no terminal origin: NEVER infer PASS.
 const k2Verified=!!started&&noObserverWrites&&
  k2MeasuredDelta!==null&&k2MeasuredDelta>=LIMIT&&sameBrowser&&
  k2?.source==='25/17/26/0'&&
  k2?.sameUnmodifiedSourceWorld===true&&
  k2?.originalActorOrColliderWrites===0;
 const byActor={};
 for(const id of ACTORS){
  const x=k2?.byActor?.[id];
  byActor[id]={
   actualTurfShotRequests:validCount(x?.sourceTurfShotRequests)?
    x.sourceTurfShotRequests:null,
   realImpactChangedCells:validCount(x?.impactChangedCells)?
    x.impactChangedCells:null,
   realAcceptedPaintChangedCells:validCount(x?.changedCells)?
    x.changedCells:null,
   actualImpactObserved:k2Verified&&validCount(x?.impactChangedCells)&&
    x.impactChangedCells>0,
   realProjectileHitOnOpponentCertified:false,
   actualHpDamageCertified:false
  };
 }
 const actorsWithImpact=k2Verified?
  ACTORS.filter(id=>byActor[id].actualImpactObserved):[];
 const actorsWithRequests=k2Verified?
  ACTORS.filter(id=>byActor[id].actualTurfShotRequests>0):[];
 // A source-owner ink stamp or projectile paint does NOT prove enemy HP hit.
 let primaryBlocker,explanation;
 if(!started){primaryBlocker='NATIVE_SOURCE_7CPU_PLAYING_NOT_PROVEN';
  explanation='Native PLAYING plus physical rejoin of all seven is absent';}
 else if(!noObserverWrites){primaryBlocker='PROTECTED_NATIVE_STATE_WRITES';
  explanation='Observer-owned gameplay writes violate provenance';}
 else if(!k2Verified){primaryBlocker='K2_REAL_600_TICK_SAME_ORIGIN_NOT_PROVEN';
  explanation='Need measured >=600 native ticks, unchanged browser origin, and actual per-CPU counters';}
 else if(actorsWithImpact.length!==7){
  primaryBlocker='REAL_SEVEN_CPU_PROJECTILE_IMPACT_NOT_PROVEN';
  explanation='At least one physical CPU has no proven owner-grid projectile impact in this one round';
 }else{
  primaryBlocker='NATURAL_OPPONENT_HP_SPLAT_RESPAWN_NOT_PROVEN';
  explanation='Real CPU projectile paint does not certify opponent hit, HP0, 150-tick respawn or original rejoin';
 }
 const priorityMovementStalls=ACTORS.filter(id=>
  motion[id].sampleCount>=2&&
  motion[id].observedNearStationaryConsecutiveTicks>=48);
 return {
  schema:'T21_V28_ISSUE18_REAL_SOURCE_GAMEPLAY_ACCEPTANCE_V1',
  source:'25/17/26/0',
  proofStage:proof.stage??null,
  originalRunVerdict:proof.verdict??null,
  originalRunError:proof.error??null,
  actual7CpuPlayingRejoined:!!started,
  noObserverGameWrites:noObserverWrites,
  human:{
   realChromeMouseShots:humanShots,
   realSourceImpactChangedCells:humanPaintCells,
   actualOpponentHpDamageCertified:false,
   officialScoreCertified:false
  },
  nativeCpu:{
   actorIds:ACTORS,
   validReadOnlyFootFrames:frames.length,
   firstFrameTick:frames[0]?.tick??null,
   lastFrameTick:frames.at(-1)?.tick??null,
   sampledMotionByActor:motion,
   nearStationarySampledActors:priorityMovementStalls,
   full60HzPathCertified:false,
   naturalCrossTeamRouteCertified:false
  },
  combat:{
   k2MeasuredNativeDelta:k2MeasuredDelta,
   sameBrowserOriginProven:sameBrowser,
   k2NativeCounterWindowVerified:k2Verified,
   perActor:byActor,
   actorsWithActualSourceTurfShotRequests:actorsWithRequests,
   actorsWithRealProjectileImpactPaint:actorsWithImpact,
   allSevenProjectileImpactPaintCertified:actorsWithImpact.length===7,
   actualOpponentHpDamageCertified:false,
   actualCpuSplatCertified:false,
   sameActor150NativeTickRespawnCertified:false,
   naturalCrossTeamBattleCertified:false
  },
  primaryBlocker,
  explanation,
  evidenceLimits:{
   futureAction:'Resolve earliest primaryBlocker, then gather a NEW genuine same-world physical witness; do not promote missing results',
   sourceScoreable:0,formal4v4Certified:false,full180SecondsCertified:false,
   noSyntheticShotsOrActors:true,sourceFloorAndF4GeometryUnchanged:true
  }
 };
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const input=process.argv[2],output=process.argv[3];
 if(!input){console.error('USAGE: node scripts/t21-v28-qa-real-source-acceptance.mjs <B440-RAW.json> [output.json]');process.exitCode=2;}
 else{
  try{
   const evidence=auditRealSourceB440(JSON.parse(readFileSync(resolve(input),'utf8')));
   if(output)writeFileSync(resolve(output),JSON.stringify(evidence,null,2)+'\n');
   console.log(JSON.stringify(evidence,null,2));
  }catch(e){console.error(String(e));process.exitCode=2;}
 }
}