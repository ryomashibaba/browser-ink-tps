import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB147NativeTeammateApproach as audit}
 from './t21-w10b147-native-teammate-approach-audit.mjs';
const mk=(variant)=>{
 const ally=variant==='ALLY_RALLY',human=[0,3.87,48.8];
 const program=[
  {name:'TRUE_SOURCE_FIRST_DROP_W200',keys:['KeyW'],ticks:200},
  {name:'TRUE_SOURCE_LOWER_LANDING_D12',keys:['KeyD'],ticks:12},
  {name:'TRUE_SOURCE_LOWER_FORWARD_W18',keys:['KeyW'],ticks:18},
  {name:'B146_TRUE_ORIGINAL_INWARD_A12',keys:['KeyA'],ticks:12},
  {name:'B146_TRUE_ORIGINAL_COAST60',keys:[],ticks:60}
 ];
 const pts=ally?
  [[4,3.1,54],[2.3,3.1,54.8],[.5,3.1,50.8]]:
  [[4,3.1,54],[7,3.1,51],[7,3.1,52]];
 const stamps=[{t:1400,a:0},{t:1745,a:ally?1:0},{t:2337,a:ally?5:0}];
 const samples=Array.from({length:12},(_,i)=>{
  const stage=i<4?0:i<8?1:2,foot=pts[stage];
  return{
   phase:'REAL_NATIVE_CPU_A1_FOLLOWUP',actualTick:1400+i*85,
   actualHumanKccBody:[...human],
   actualA1RapierFoot:[...foot],realSeparationXZ:
    Math.hypot(human[0]-foot[0],human[2]-foot[2]),
   canonicalHumanFootOffsetMeters:.87,
   actualHumanKccGrounded:true,
   originalRapierSupportId:'UndertowT21D:first-drop-landing-positive-z',
   b146OriginalFlatInside:true,b146OriginalFlatVerticalBandWithin22cm:true,
   b146OriginalFlatEdgeClearanceMeters:1.4,realCpuA1Mobility:'GROUND',
   realCpuRejoins:7,realCpuFootRelocations:0,
   officialScoreable:0,original4v4Certified:false,
   sourcePatrol:{optIn:ally,approved:ally&&i>=4?(i>=8?5:1):0}
  };
 });
 const end=samples.at(-1);
 return{
  variant,schema:'W10_B139_TRUE_ORIGINAL_REAL_CHROME_SOURCE_DESCENT_ALLY_V1',
  originalSource:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalOppositeSideNaturalPaths:'0/12',
  nativeGameStartedOnlyAfterSevenPhysicalCpuRejoins:true,
  activationReady:false,productionAuthorized:false,
  original4v4Certified:false,formalOriginal4v4Certified:false,
  cpuFootRelocations:0,
  originalPhysicalCpuRejoins:['A1','A2','A3','B1','B2','B3','B4'],
  nativePlayingTick:1000,endNativeTick:end.actualTick,
  actualPhysicalSourceRouteProgram:program,
  actualHumanAndA1RapierFootSamples:samples,
  b146ActualNativeSourceInward:{
   bodyAfterRealKeyAAndCoast:[...human],
   originalFlatInsetSafeAtSettle:true
  },
  finalNativePatrol:{b142OriginalStandoffGoalsApproved:ally?5:0,
   b143ReauthorizedStableStandoffGoals:ally?31:0,
   b137ApprovedNativeRallies:ally?5:0}
 };
};
test('B147 real physical approach evidence is narrow and never official Turf certification',()=>{
 const a=mk('ALLY_RALLY'),f=mk('FIXED_DEFAULT');
 const e=audit(a,f);
 assert.equal(e.result,'SCOPED_NATIVE_SOURCE_A1_APPROACH_OBSERVED');
 assert.ok(e.physicalSeparationClosedMeters>3);
 assert.ok(e.physicalA1NetDisplacementAfterApprovalMeters>2);
 assert.equal(e.physicalMeetingCertified,false);
 assert.equal(e.fullOriginal4v4Certified,false);
 assert.equal(e.realOriginalActorRelocations,0);
});
test('B147 refuses fake teleports, missing original interior or unapproved aim',()=>{
 const f=mk('FIXED_DEFAULT');
 for(const mutate of [
  a=>{a.cpuFootRelocations=1;},
  a=>{a.actualHumanAndA1RapierFootSamples[7].b146OriginalFlatEdgeClearanceMeters=.2;},
  a=>{a.finalNativePatrol.b142OriginalStandoffGoalsApproved=0;},
  a=>{a.actualHumanAndA1RapierFootSamples[9].actualHumanKccBody[0]=2;},
  a=>{a.actualHumanAndA1RapierFootSamples[10].actualA1RapierFoot=[NaN,3,4];}
 ]){
  const a=mk('ALLY_RALLY');mutate(a);
  assert.throws(()=>audit(a,f),/B147_NATIVE_PHYSICAL_PROOF_/);
 }
});
test('B147 rejects false baseline authority and unmatched input phases',()=>{
 const a=mk('ALLY_RALLY'),f=mk('FIXED_DEFAULT');
 f.actualPhysicalSourceRouteProgram[3].ticks=20;
 assert.throws(()=>audit(a,f),/NOT_MATCHING_NATIVE_TRIAL/);
 const f2=mk('FIXED_DEFAULT');f2.finalNativePatrol.b142OriginalStandoffGoalsApproved=1;
 assert.throws(()=>audit(a,f2),/ALLY_NOT_OPT_IN_ISOLATED/);
});
