import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB148NativeAllyHold as audit}
 from './t21-w10b148-original-A1-station-audit.mjs';

// Fixtures are NOT browser observations; the real CI requires zipped source
// output from actual WebGL2 Chrome and independent B147 PASS evidence.
function fixture(optIn=true){
 const start=1950;
 const fixed=!optIn;
 const samples=Array.from({length:25},(_,i)=>{
  const human=[.18,3.895,48.77];
  const a1=[.75+(i%3)*.01,3.1,50.70+(i%4)*.005];
  return{
   actualTick:start+i*15,actualHumanKccBody:human,
   actualA1RapierFoot:a1,
   realSeparationXZ:Math.hypot(human[0]-a1[0],human[2]-a1[2]),
   canonicalHumanFootOffsetMeters:.87,
   realCpuRejoins:7,realCpuFootRelocations:0,
   actualHumanKccGrounded:true,realCpuA1Mobility:'GROUND',
   originalRapierSupportId:'UndertowT21D:first-drop-landing-positive-z',
   b146OriginalFlatInside:true,
   b146OriginalFlatVerticalBandWithin22cm:true,
   b146OriginalFlatEdgeClearanceMeters:1.21,
   officialScoreable:0,original4v4Certified:false,
   sourcePatrol:{optIn,approved:optIn?4:0,
    b143ReauthorizedStableStandoffGoals:optIn?11+i:0}
  };
 });
 return{
  variant:optIn?'ALLY_RALLY':'FIXED_DEFAULT',
  originalSource:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalOppositeSideNaturalPaths:'0/12',
  activationReady:false,productionAuthorized:false,
  formalOriginal4v4Certified:false,cpuFootRelocations:0,
  originalPhysicalCpuRejoins:['A1','A2','A3','B1','B2','B3','B4'],
  endNativeTick:samples.at(-1).actualTick,
  actualPhysicalSourceRouteProgram:[
   {name:'W200',keys:['KeyW'],ticks:200},
   {name:'D12',keys:['KeyD'],ticks:12},
   {name:'W18',keys:['KeyW'],ticks:18},
   {name:'B146_TRUE_ORIGINAL_INWARD_A12',keys:['KeyA'],ticks:12},
   {name:'B146_TRUE_ORIGINAL_COAST60',keys:[],ticks:60}],
  actualHumanAndA1RapierFootSamples:samples,
  finalNativePatrol:{b137ApprovedNativeRallies:fixed?0:4,
   b142OriginalStandoffGoalsApproved:fixed?0:4,
   b143ReauthorizedStableStandoffGoals:fixed?0:35}
 };
}
function proof(ally){
 return{
  schema:'W10_B147_REAL_NATIVE_PHYSICAL_ALLY_APPROACH_AUDIT_V1',
  result:'SCOPED_NATIVE_SOURCE_A1_APPROACH_OBSERVED',
  realSourceSevenCpuRejoins:7,realOriginalActorRelocations:0,
  physicalMeetingCertified:false,fullOriginal4v4Certified:false,
  finalApprovedNativeTick:ally.endNativeTick,
  finalHumanA1SeparationMeters:
   ally.actualHumanAndA1RapierFootSamples.at(-1).realSeparationXZ
 };
}
test('B148 bounded true-source 2m station is narrowly certified',()=>{
 const a=fixture(),f=fixture(false);
 const r=audit(a,f,proof(a));
 assert.equal(r.result,'REAL_ORIGINAL_A1_NEAR_PLAYER_STABLE_SAMPLED');
 assert.ok(r.observedNativeTickSpan>=300);
 assert.ok(r.minRealHumanA1SeparationMeters>=1.7);
 assert.ok(r.maxRealHumanA1SeparationMeters<=2.3);
 assert.ok(r.actualStableGoalReauthorizations>=8);
 assert.equal(r.nativeCapsuleToCapsuleContactCertified,false);
 assert.equal(r.continuousBetweenSampleCollisionCertification,false);
 assert.equal(r.fullOriginal4v4Certified,false);
});
test('B148 refuses original source authority corruption and nonoptin goals',()=>{
 for(const change of [
  ([a])=>{a.originalSource='ADDED_FLOOR';},
  ([,f])=>{f.finalNativePatrol.b142OriginalStandoffGoalsApproved=1;},
  ([a])=>{a.cpuFootRelocations=1;},
  ([a,,p])=>{p.result='CERTIFIED_ALL_COLLISIONS';},
  ([a,,p])=>{p.finalApprovedNativeTick=-1;},
 ]){
  const t=[fixture(),fixture(false),null];t[2]=proof(t[0]);
  change(t);
  assert.throws(()=>audit(...t),/B148_ACTUAL_NATIVE_STANDOFF_/);
 }
});
test('B148 refuses unsafe source floor, human drift and CPU-human crowding',()=>{
 for(const change of [
  a=>{a.actualHumanAndA1RapierFootSamples[12].b146OriginalFlatEdgeClearanceMeters=.1;},
  a=>{a.actualHumanAndA1RapierFootSamples[12].actualHumanKccGrounded=false;},
  a=>{a.actualHumanAndA1RapierFootSamples[12].realCpuA1Mobility='AIR';},
  a=>{a.actualHumanAndA1RapierFootSamples[12].actualA1RapierFoot=[.18,3.1,49];},
  a=>{a.actualHumanAndA1RapierFootSamples[12].actualHumanKccBody=[5,3.895,48.77];},
  a=>{a.actualHumanAndA1RapierFootSamples[12].sourcePatrol.optIn=false;}
 ]){
  const a=fixture(),f=fixture(false);change(a);
  assert.throws(()=>audit(a,f,proof(a)),/B148_ACTUAL_NATIVE_STANDOFF_/);
 }
});
test('B148 refuses artificial static / discontinuous sampled timeline',()=>{
 const a=fixture(),f=fixture(false);
 a.actualHumanAndA1RapierFootSamples[12].actualTick=
  a.actualHumanAndA1RapierFootSamples[11].actualTick-2;
 assert.throws(()=>audit(a,f,proof(a)),/CORRUPT_ACTUAL_BODY_OR_RAPIER_FOOT/);
 const short=fixture();
 short.actualHumanAndA1RapierFootSamples=
  short.actualHumanAndA1RapierFootSamples.slice(-8);
 assert.throws(()=>audit(short,f,proof(short)),/B148_ACTUAL_NATIVE_STANDOFF_/);
});
