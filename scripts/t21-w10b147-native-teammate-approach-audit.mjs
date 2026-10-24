import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

/**
 * B147: compare TWO completed genuine Chromium/PlayCanvas runs.
 * This authorizes only observed A1 physical teammate approach in source QA.
 * No simulation, actor motion, official Turf score or stage authority writes.
 */
const fail=(why)=>{throw Error('B147_NATIVE_PHYSICAL_PROOF_'+why);};
const finite=(x)=>typeof x==='number'&&Number.isFinite(x);
const point=(p)=>Array.isArray(p)&&p.length===3&&p.every(finite);
const xz=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
function inspectTrial(n,variant){
 if(n?.variant!==variant||
    n.schema!=='W10_B139_TRUE_ORIGINAL_REAL_CHROME_SOURCE_DESCENT_ALLY_V1'||
    n.originalSource!=='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
    n.originalOppositeSideNaturalPaths!=='0/12'||
    n.nativeGameStartedOnlyAfterSevenPhysicalCpuRejoins!==true||
    n.activationReady!==false||n.productionAuthorized!==false||
    n.original4v4Certified!==false||n.formalOriginal4v4Certified!==false||
    n.cpuFootRelocations!==0||
    !Array.isArray(n.originalPhysicalCpuRejoins)||
    n.originalPhysicalCpuRejoins.length!==7||
    !Array.isArray(n.actualPhysicalSourceRouteProgram)||
    !Array.isArray(n.actualHumanAndA1RapierFootSamples))
  fail('UNVERIFIED_OR_MODIFIED_ORIGINAL_SOURCE_'+variant);
 const s=n.actualHumanAndA1RapierFootSamples;
 if(s.length<10||!finite(n.nativePlayingTick)||!finite(n.endNativeTick))
  fail('NOT_ENOUGH_REAL_NATIVE_SAMPLES_'+variant);
 let previousTick=-1,first=null,last=null;
 for(const row of s){
  if(!Number.isSafeInteger(row.actualTick)||row.actualTick<previousTick||
     !point(row.actualHumanKccBody)||!point(row.actualA1RapierFoot)||
     !finite(row.canonicalHumanFootOffsetMeters)||
     row.canonicalHumanFootOffsetMeters<=0||
     !finite(row.realSeparationXZ)||
     Math.abs(row.realSeparationXZ-
      xz(row.actualHumanKccBody,row.actualA1RapierFoot))>.025||
     row.realCpuRejoins!==7||row.realCpuFootRelocations!==0||
     row.officialScoreable!==0||row.original4v4Certified!==false||
     !row.sourcePatrol||row.sourcePatrol.optIn!==(variant==='ALLY_RALLY')||
     !Number.isSafeInteger(row.sourcePatrol.approved)||
     row.sourcePatrol.approved<0)
    fail('PHYSICAL_SAMPLE_OR_AUTHORITY_INVALID_'+variant);
  previousTick=row.actualTick;
  if(!first)first=row;
  last=row;
 }
 if(last.actualTick!==n.endNativeTick||
    !point(n.b146ActualNativeSourceInward?.bodyAfterRealKeyAAndCoast)||
    n.b146ActualNativeSourceInward?.originalFlatInsetSafeAtSettle!==true)
  fail('NATIVE_END_OR_SAFE_ORIGINAL_FOOT_MISSING_'+variant);
 return {samples:s,first,last};
}
export function auditB147NativeTeammateApproach(ally,fixed){
 const a=inspectTrial(ally,'ALLY_RALLY');
 const f=inspectTrial(fixed,'FIXED_DEFAULT');
 if(JSON.stringify(ally.actualPhysicalSourceRouteProgram)!==
    JSON.stringify(fixed.actualPhysicalSourceRouteProgram)||
    !ally.actualPhysicalSourceRouteProgram.some(s=>
     s.name==='B146_TRUE_ORIGINAL_INWARD_A12')||
    xz(a.first.actualHumanKccBody,f.first.actualHumanKccBody)>.20||
    xz(a.first.actualA1RapierFoot,f.first.actualA1RapierFoot)>.20)
  fail('NOT_MATCHING_NATIVE_TRIAL_START_AND_REAL_INPUT');
 if(ally.finalNativePatrol?.b142OriginalStandoffGoalsApproved!==5&&
    !(ally.finalNativePatrol?.b142OriginalStandoffGoalsApproved>0))
  fail('NO_REAL_ORIGINAL_STANDOFF_APPROVAL');
 if(!(ally.finalNativePatrol?.b143ReauthorizedStableStandoffGoals>0)||
    fixed.finalNativePatrol?.b142OriginalStandoffGoalsApproved!==0||
    fixed.finalNativePatrol?.b143ReauthorizedStableStandoffGoals!==0)
  fail('ALLY_NOT_OPT_IN_ISOLATED');
 const i=a.samples.findIndex(r=>r.sourcePatrol.approved>0);
 if(i<1||a.samples[i-1].sourcePatrol.approved!==0)
  fail('NO_FIRST_REAL_NATIVE_APPROVAL_TRANSITION');
 const from=a.samples[i],after=a.samples.slice(i);
 const end=a.last;
 if(!(from.realSeparationXZ>=3&&from.realSeparationXZ<=18)||
    end.sourcePatrol.approved<=0||
    end.sourcePatrol.approved!==ally.finalNativePatrol.b137ApprovedNativeRallies)
  fail('SOURCE_APPROVAL_AND_ACTUAL_FOOT_MISMATCH');
 for(const row of after){
  const body=row.actualHumanKccBody,foot=row.actualA1RapierFoot;
  if(row.actualHumanKccGrounded!==true||
     row.originalRapierSupportId!=='UndertowT21D:first-drop-landing-positive-z'||
     row.b146OriginalFlatInside!==true||
     row.b146OriginalFlatVerticalBandWithin22cm!==true||
     !finite(row.b146OriginalFlatEdgeClearanceMeters)||
     row.b146OriginalFlatEdgeClearanceMeters<.75||
     row.realCpuA1Mobility!=='GROUND'||
     foot[1]<2.7||foot[1]>5.25||foot[2]<33||
     Math.abs(body[1]-row.canonicalHumanFootOffsetMeters-foot[1])>.30||
     xz(body,from.actualHumanKccBody)>.20)
   fail('ACTUAL_HUMAN_MOVED_OR_UNSAFE_ORIGINAL_SOURCE_AFTER_APPROVAL');
 }
 const approach=from.realSeparationXZ-end.realSeparationXZ;
 const directA1Travel=xz(from.actualA1RapierFoot,end.actualA1RapierFoot);
 const sameLevelGap=end.actualHumanKccBody[1]-
  end.canonicalHumanFootOffsetMeters-end.actualA1RapierFoot[1];
 const fixedEnd=f.last.realSeparationXZ;
 if(approach<3||directA1Travel<2||
    end.realSeparationXZ<1.7||end.realSeparationXZ>3||
    Math.abs(sameLevelGap)>.30||
    fixedEnd-end.realSeparationXZ<2)
  fail('NO_GENUINE_CONVERGENT_NATIVE_A1_LOCOMOTION');
 return {
  schema:'W10_B147_REAL_NATIVE_PHYSICAL_ALLY_APPROACH_AUDIT_V1',
  result:'SCOPED_NATIVE_SOURCE_A1_APPROACH_OBSERVED',
  sameVerifiedKeyPhasesButIndependentNativeTimelines:true,
  baselineNotAnIdenticalDeterministicReplay:true,
  realSourceSevenCpuRejoins:7,
  firstApprovedNativeTick:from.actualTick,
  finalApprovedNativeTick:end.actualTick,
  firstApprovedHumanA1SeparationMeters:from.realSeparationXZ,
  finalHumanA1SeparationMeters:end.realSeparationXZ,
  physicalSeparationClosedMeters:approach,
  physicalA1NetDisplacementAfterApprovalMeters:directA1Travel,
  actualHumanXZDriftAfterApprovalMeters:
   xz(from.actualHumanKccBody,end.actualHumanKccBody),
  originalHumanFloorMinimumMarginMeters:
   Math.min(...after.map(s=>s.b146OriginalFlatEdgeClearanceMeters)),
  finalSameLowerFloorFootGapMeters:sameLevelGap,
  originalStandoffNativeGoalApprovals:
   ally.finalNativePatrol.b142OriginalStandoffGoalsApproved,
  originalNativeStandoffRetentions:
   ally.finalNativePatrol.b143ReauthorizedStableStandoffGoals,
  fixedOriginalAllyApprovals:fixed.finalNativePatrol.b137ApprovedNativeRallies,
  independentFixedFinalA1HumanSeparationMeters:fixedEnd,
  crossRunFinalSeparationDifferenceMeters:fixedEnd-end.realSeparationXZ,
  realOriginalActorRelocations:0,
  originalScoreableSurfaces:0,originalCrossTeamRoutes:'0/12',
  originalCpuHumanCollisionFullyCertified:false,
  physicalMeetingCertified:false,
  fullOriginal4v4Certified:false,productionAuthorized:false,
  stageGeometryModified:false
 };
}
if(process.argv[1]&&
   pathToFileURL(process.argv[1]).href===import.meta.url){
 if(process.argv.length!==5)fail('USAGE_ALLY_JSON_FIXED_JSON_OUTPUT_JSON');
 const ally=JSON.parse(readFileSync(process.argv[2],'utf8'));
 const fixed=JSON.parse(readFileSync(process.argv[3],'utf8'));
 const evidence=auditB147NativeTeammateApproach(ally,fixed);
 writeFileSync(process.argv[4],JSON.stringify(evidence,null,2));
 console.log('B147_NATIVE_PHYSICAL_A1_EVIDENCE',JSON.stringify(evidence));
}
