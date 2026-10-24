import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB149ActualNativePair as audit}
 from './t21-w10b149-native-A1-KCC-contact-audit.mjs';
// Synthetic shape fixtures are negative tests ONLY, never actual evidence.
const trial=(variant)=>{
 const enabled=true,ally=variant==='ALLY_RALLY';
 return {
  variant,originalSource:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalOppositeSideNaturalPaths:'0/12',
  cpuFootRelocations:0,productionAuthorized:false,
  formalOriginal4v4Certified:false,
  endNativeTick:2337,
  originalPhysicalCpuRejoins:['A1','A2','A3','B1','B2','B3','B4'],
  finalNativePatrol:{b137ApprovedNativeRallies:ally?5:0},
  b149ActualNativeHumanA1Contact:{
   enabled,source:'ACTUAL_PLAYER_KCC_AND_REAL_A1_SHARED_RAPIER_COLLIDER',
   actualNearNativeFrames:ally?350:0,
   actualNativeKccA1Contacts:0,observedCapsuleOverlapFrames:0,
   originalGroundedNearFrames:ally?350:0,
   originalSourceSupportFailuresNear:0,
   sharedActorPoseDesyncNear:0,
   minimumRealPairDistanceMeters:ally?1.84:null,
   minimumPositiveRadialCapsuleClearanceMeters:ally?1.2:null,
   firstNearNativeTick:ally?1930:null,
   lastNearNativeTick:ally?2337:null,
   nearFramesSourceOnly:true,actorPositionWritten:false,
   continuousBetweenFrameContactCertified:false,
   fullOriginal4v4Certified:false
  }
 };
};
const b147=()=>({schema:'W10_B147_REAL_NATIVE_PHYSICAL_ALLY_APPROACH_AUDIT_V1',
 result:'SCOPED_NATIVE_SOURCE_A1_APPROACH_OBSERVED',realOriginalActorRelocations:0});
const b148=()=>({schema:'W10_B148_NATIVE_2M_TEAMMATE_STATION_V1',
 result:'REAL_ORIGINAL_A1_NEAR_PLAYER_STABLE_SAMPLED',
 minRealHumanA1SeparationMeters:1.85,maxRealHumanA1SeparationMeters:1.99,
 fullOriginal4v4Certified:false});
test('B149 exact real contact evidence schema never promotes gameplay authority',()=>{
 const e=audit(trial('ALLY_RALLY'),trial('FIXED_DEFAULT'),b147(),b148());
 assert.equal(e.result,'SCOPED_NATIVE_SOURCE_A1_60HZ_SEPARATION_OBSERVED');
 assert.equal(e.realNativeCapsuleOverlapFrames,0);
 assert.equal(e.exactPlayerKccContactsWithActualA1RapierCollider,0);
 assert.equal(e.framewiseReadOnlyContactObservation,true);
 assert.equal(e.betweenSampleSweptContactCertified,false);
 assert.equal(e.complete4v4TurfCertified,false);
});
test('B149 rejects actual KCC contacts, body desync, false grounding and invented floor',()=>{
 const edits=[
  t=>{t.b149ActualNativeHumanA1Contact.actualNativeKccA1Contacts=1;},
  t=>{t.b149ActualNativeHumanA1Contact.observedCapsuleOverlapFrames=1;},
  t=>{t.b149ActualNativeHumanA1Contact.sharedActorPoseDesyncNear=1;},
  t=>{t.b149ActualNativeHumanA1Contact.originalSourceSupportFailuresNear=1;},
  t=>{t.b149ActualNativeHumanA1Contact.minimumPositiveRadialCapsuleClearanceMeters=.2;},
  t=>{t.b149ActualNativeHumanA1Contact.actualNearNativeFrames=15;},
  t=>{t.originalSource='26_SOLIDS';}
 ];
 for(const edit of edits){
  const a=trial('ALLY_RALLY');edit(a);
  assert.throws(()=>audit(a,trial('FIXED_DEFAULT'),b147(),b148()),
   /B149_EXACT_NATIVE_RAPIER_KCC_/);
 }
});
test('B149 FIXED must remain unchanged and upstream physical source proofs must exist',()=>{
 const a=trial('ALLY_RALLY'),f=trial('FIXED_DEFAULT');
 f.finalNativePatrol.b137ApprovedNativeRallies=1;
 assert.throws(()=>audit(a,f,b147(),b148()),/B149_EXACT_NATIVE/);
 assert.throws(()=>audit(a,trial('FIXED_DEFAULT'),{},b148()),/B149_EXACT_NATIVE/);
});
