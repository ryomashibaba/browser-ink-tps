import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyB348OriginalPhysicalAccuracy} from './t21-b348-physical-shooter-accuracy-audit.mjs';
function sample(){
 const launches=Array.from({length:10},(_,i)=>({
  kind:'LAUNCH',launchId:i+1,weaponId:'pulse-sprayer',
  nativeTick:100+i*6,worldPosition:[0,7,67],
  worldVelocity:i===0?[0,-10,-28]:
   [i*.09,-10,-28]}));
 const exits=Array.from({length:10},(_,i)=>({
  kind:'EXIT',launchId:i+1,reason:'ORIGINAL_PAINTABLE',
  worldPosition:[i*.012,6,65],
  originalPaintSurfaceId:'real-original-surface'}));
 return {schema:'B348_NATIVE_SOURCE_SHOOTER_ACCURACY_CANDIDATE',
 source:'25/17/26/0',noSyntheticInput:true,noInjectedInk:true,
 noFakeProjectiles:true,nativeCameraMouseMoveDuringHeldFire:false,
 scoreable:0,productionAuthorized:false,
 baselineB346RealFixedAimRun:40999824961,
 baselineRealFixedAimChangedCells:91,realNativeFinalTick:200,
 realHumanShots:10,originalOwnerChangedCells:95,
 actualCandidate:{enabled:true,originalReferenceModelCertified:false,
  candidateResearchOnly:true,syntheticShots:0,syntheticInk:0,
  productionAuthorized:false,actualAcceptedCandidateShots:10,
  actualGroundedCandidateShots:10,actualAirborneCandidateShots:0},
 truePhysicalEvidence:{enabled:true,source:'25/17/26/0',
  droppedOldestEvents:0,productionAuthorized:false,
  noSyntheticProjectilesOrCollision:true,scoreablePromotions:0,
  observedNativeTick:200,totalActualShooterLaunches:10,
  totalActualShooterExits:10,events:[...launches,...exits]}
 };
}
test('B348 synthetic fixture proves ONLY audit shape not original equivalence',()=>{
 const r=verifyB348OriginalPhysicalAccuracy(sample());
 assert.equal(r.realHumanShots,10);
 assert.equal(r.exactlyCorrectNintendoSpreadCertified,false);
});
test('B348 fail-closed on synthetic/fake/unchanged native source trajectories',()=>{
 for(const alter of [
  x=>x.noFakeProjectiles=false,
  x=>x.actualCandidate.actualAcceptedCandidateShots=11,
  x=>x.truePhysicalEvidence.droppedOldestEvents=1,
  x=>x.truePhysicalEvidence.events.forEach(e=>{
   if(e.kind==='LAUNCH')e.worldVelocity=[0,-10,-28]}),
  x=>x.truePhysicalEvidence.events[1].worldVelocity=[55,-10,-28],
  x=>x.originalOwnerChangedCells=-1,
  x=>x.truePhysicalEvidence.totalActualShooterExits=11
 ]){
  const x=sample();alter(x);
  assert.throws(()=>verifyB348OriginalPhysicalAccuracy(x),
   /B348_REAL_SOURCE_/);
 }
});
