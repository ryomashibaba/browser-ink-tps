#!/usr/bin/env node
/**
 * W10-B148: independently require a durable 2m station from RECORDED actual
 * B147 PlayCanvas + Rapier native 60Hz source evidence. A sampled minimum
 * separation does not prove continuous framewise actor-capsule clearance.
 * This script NEVER writes actors, time, original geometry, or score.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const reject=(code)=>{throw Error('B148_ACTUAL_NATIVE_STANDOFF_'+code);};
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const vec3=a=>Array.isArray(a)&&a.length===3&&a.every(finite);
const xz=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const holdWindowTicks=360;
export function auditB148NativeAllyHold(ally,fixed,b147){
 if(b147?.schema!=='W10_B147_REAL_NATIVE_PHYSICAL_ALLY_APPROACH_AUDIT_V1'||
    b147.result!=='SCOPED_NATIVE_SOURCE_A1_APPROACH_OBSERVED'||
    b147.realSourceSevenCpuRejoins!==7||
    b147.realOriginalActorRelocations!==0||
    b147.fullOriginal4v4Certified!==false||
    b147.physicalMeetingCertified!==false||
    ally?.variant!=='ALLY_RALLY'||fixed?.variant!=='FIXED_DEFAULT'||
    ally.originalSource!=='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
    fixed.originalSource!==ally.originalSource||
    ally.originalOppositeSideNaturalPaths!=='0/12'||
    fixed.originalOppositeSideNaturalPaths!=='0/12'||
    ally.activationReady!==false||ally.productionAuthorized!==false||
    ally.formalOriginal4v4Certified!==false||
    fixed.activationReady!==false||fixed.productionAuthorized!==false||
    fixed.formalOriginal4v4Certified!==false||
    ally.cpuFootRelocations!==0||fixed.cpuFootRelocations!==0||
    ally.originalPhysicalCpuRejoins?.length!==7||
    fixed.originalPhysicalCpuRejoins?.length!==7||
    JSON.stringify(ally.actualPhysicalSourceRouteProgram)!==
     JSON.stringify(fixed.actualPhysicalSourceRouteProgram)||
    fixed.finalNativePatrol?.b137ApprovedNativeRallies!==0||
    fixed.finalNativePatrol?.b142OriginalStandoffGoalsApproved!==0||
    fixed.finalNativePatrol?.b143ReauthorizedStableStandoffGoals!==0)
  reject('B147_ORIGINAL_SOURCE_AND_FIXED_COMPARISON_INVALID');
 const samples=ally.actualHumanAndA1RapierFootSamples;
 if(!Array.isArray(samples)||samples.length<18||!Number.isSafeInteger(ally.endNativeTick)||
    b147.finalApprovedNativeTick!==ally.endNativeTick||
    !finite(b147.finalHumanA1SeparationMeters)||
    !(ally.finalNativePatrol?.b142OriginalStandoffGoalsApproved>0)||
    !(ally.finalNativePatrol?.b143ReauthorizedStableStandoffGoals>0))
  reject('MISSING_GENUINE_NATIVE_FOOT_TIMELINE');
 let previous=-1;
 for(const s of samples){
  if(!Number.isSafeInteger(s.actualTick)||s.actualTick<previous||
     !vec3(s.actualHumanKccBody)||!vec3(s.actualA1RapierFoot)||
     !finite(s.realSeparationXZ)||!finite(s.canonicalHumanFootOffsetMeters)||
     Math.abs(s.realSeparationXZ-
      xz(s.actualHumanKccBody,s.actualA1RapierFoot))>.025)
   reject('CORRUPT_ACTUAL_BODY_OR_RAPIER_FOOT');
  previous=s.actualTick;
 }
 const last=samples.at(-1);
 if(last.actualTick!==ally.endNativeTick||
    Math.abs(last.realSeparationXZ-b147.finalHumanA1SeparationMeters)>.025||
    last.sourcePatrol?.approved!==ally.finalNativePatrol.b137ApprovedNativeRallies||
    last.sourcePatrol?.b143ReauthorizedStableStandoffGoals!==
     ally.finalNativePatrol.b143ReauthorizedStableStandoffGoals)
  reject('STALE_OR_CONFLICTING_B147_PROOF');
 // Observe a FIXED native time window at the end, not an arbitrary hand-
 // selected slice containing only passing moments.
 const steady=samples.filter(s=>s.actualTick>=ally.endNativeTick-holdWindowTicks);
 const ticks=new Set(steady.map(s=>s.actualTick));
 if(steady.length<18||ticks.size<18||
    steady.at(-1).actualTick-steady[0].actualTick<300)
  reject('NO_DURABLE_NATIVE_TIME_WINDOW');
 const first=steady[0],lastStable=steady.at(-1);
 const ranges=[],margins=[],footWander=[];
 let cumulativeDistance=0,previousGoal=-1,previousRetentions=-1;
 for(let i=0;i<steady.length;i++){
  const s=steady[i],p=i?steady[i-1]:null;
  if(!s.sourcePatrol||s.sourcePatrol.optIn!==true||
     !Number.isSafeInteger(s.sourcePatrol.approved)||
     !Number.isSafeInteger(s.sourcePatrol.b143ReauthorizedStableStandoffGoals)||
     s.sourcePatrol.approved<4||
     s.sourcePatrol.approved<previousGoal||
     s.sourcePatrol.b143ReauthorizedStableStandoffGoals<previousRetentions||
     s.realCpuFootRelocations!==0||
     s.realCpuRejoins!==7||
     s.officialScoreable!==0||s.original4v4Certified!==false||
     s.actualHumanKccGrounded!==true||
     s.realCpuA1Mobility!=='GROUND'||
     s.originalRapierSupportId!=='UndertowT21D:first-drop-landing-positive-z'||
     s.b146OriginalFlatInside!==true||
     s.b146OriginalFlatVerticalBandWithin22cm!==true||
     !finite(s.b146OriginalFlatEdgeClearanceMeters)||
     s.b146OriginalFlatEdgeClearanceMeters<.75||
     s.actualA1RapierFoot[2]<33||
     s.actualA1RapierFoot[1]<2.7||s.actualA1RapierFoot[1]>5.25||
     Math.abs(s.actualHumanKccBody[1]-
      s.canonicalHumanFootOffsetMeters-s.actualA1RapierFoot[1])>.30||
     xz(s.actualHumanKccBody,first.actualHumanKccBody)>.15||
     Math.abs(s.actualHumanKccBody[1]-first.actualHumanKccBody[1])>.10||
     s.realSeparationXZ<1.7||s.realSeparationXZ>2.3)
   reject('UNSAFE_ACTUAL_ORIGINAL_SOURCE_DWELL');
  previousGoal=s.sourcePatrol.approved;
  previousRetentions=s.sourcePatrol.b143ReauthorizedStableStandoffGoals;
  ranges.push(s.realSeparationXZ);
  margins.push(s.b146OriginalFlatEdgeClearanceMeters);
  footWander.push(xz(s.actualA1RapierFoot,first.actualA1RapierFoot));
  if(p&&s.actualTick!==p.actualTick){
   const move=xz(s.actualA1RapierFoot,p.actualA1RapierFoot);
   if(move>.4)reject('ABRUPT_NATIVE_FOOT_JUMP');
   cumulativeDistance+=move;
  }
 }
 const min=Math.min(...ranges),max=Math.max(...ranges),
  wander=Math.max(...footWander);
 const resumed=lastStable.sourcePatrol.b143ReauthorizedStableStandoffGoals-
  first.sourcePatrol.b143ReauthorizedStableStandoffGoals;
 if(max-min>.25||wander>.35||cumulativeDistance>1.2||
    resumed<8)
  reject('SOURCE_A1_STANDOFF_JITTER_OR_INSUFFICIENT_RETAIN');
 return {
  schema:'W10_B148_NATIVE_2M_TEAMMATE_STATION_V1',
  result:'REAL_ORIGINAL_A1_NEAR_PLAYER_STABLE_SAMPLED',
  scopedToOriginalTeamAPositiveZLowerSource:true,
  latestNativeTick:lastStable.actualTick,
  firstStableNativeTick:first.actualTick,
  observedNativeTickSpan:lastStable.actualTick-first.actualTick,
  actualUniquePhysicalSamples:ticks.size,
  minRealHumanA1SeparationMeters:min,
  maxRealHumanA1SeparationMeters:max,
  radialDistanceOscillationMeters:max-min,
  maxA1FootWanderFromFirstStableSampleMeters:wander,
  totalSampledA1GroundDisplacementMeters:cumulativeDistance,
  originalHumanMinimumBoundaryClearanceMeters:Math.min(...margins),
  actualStableGoalReauthorizations:resumed,
  physicalCpuFootRelocations:0,
  independentDefaultFixedHadNoTeammateGoals:true,
  falseOriginalFloorOrNavigationAdded:0,
  continuousBetweenSampleCollisionCertification:false,
  nativeCapsuleToCapsuleContactCertified:false,
  officialTurfScoreable:0,fullOriginal4v4Certified:false,
  productionAuthorized:false
 };
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 if(process.argv.length!==6)reject('USAGE_ALLY_FIXED_B147_PROOF_OUTPUT');
 const ally=JSON.parse(readFileSync(process.argv[2],'utf8'));
 const fixed=JSON.parse(readFileSync(process.argv[3],'utf8'));
 const proof=JSON.parse(readFileSync(process.argv[4],'utf8'));
 const evidence=auditB148NativeAllyHold(ally,fixed,proof);
 writeFileSync(process.argv[5],JSON.stringify(evidence,null,2));
 console.log('B148_NATIVE_ORIGINAL_A1_STATION',JSON.stringify(evidence));
}
