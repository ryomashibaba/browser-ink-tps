import test from 'node:test';
import assert from 'node:assert/strict';
import {b408ChooseActiveOriginalCell,b408NativeMouseAligned}
 from './t21-b408-native-original-active-aim.mjs';
const foot='UndertowT21D:spawn-high-positive-z';
const cell=(x,owner)=>({grid:[x,7],world:[x/5,3,4],originalOwner:owner,
 realCellProvenance:'B337_NATIVE_LOCAL_ACTIVE_GRID'});
function f(){
 return {foot,
 ledger:{source:'25/17/26/0',realHumanOriginalFootSupported:true,
  genuineHumanOriginalFootSolid:foot,genuineOriginalFootGapMeters:.05,
  sourceActorRelocations:0,sourceInkRewritten:false,
  playerPositionRewritten:false,actualBodyMeters:[0,4,0],
  actualCameraMeters:[0,5,0],originalRows:[
   {surfaceId:foot+':paint',
    originalB337NearbyActiveCells:[cell(0,1),cell(1,0),cell(2,-1)]},
   ...Array.from({length:16},(_,i)=>({surfaceId:'other'+i}))]},
 frame:{originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
  productionAuthorized:false,unrestricted4v4Certified:false,
  cpu:{physicalFootRelocations:0},tick:3100,matchState:'PLAYING',paused:false,
  cameraSourcePractice:{yawDegrees:0,pitchDegrees:0,
   sourceAimSensitivityMultiplier:1}}};
}
test('re-aim using real neutral/enemy active grid instead of stale source target',()=>{
 const q=f(),p=b408ChooseActiveOriginalCell(q.ledger,q.frame,q.foot);
 assert.notEqual(p.ownerBefore,1);
 assert.equal(p.nonOwnCandidateCount,2);
 assert.equal(p.actualPaintChangedCellsGuaranteed,false);
 assert.equal(p.opponentHitCertified,false);
 assert.equal(b408NativeMouseAligned(p,{yawDegrees:p.yaw,pitchDegrees:p.pitch}),true);
 assert.equal(b408NativeMouseAligned(p,{yawDegrees:135,pitchDegrees:20}),false);
});
test('source, ground, native camera and active grid all fail closed',()=>{
 for(const change of [
  x=>{x.frame.sourceScoreablePromotions=1;},
  x=>{x.frame.cameraSourcePractice.sourceAimSensitivityMultiplier=1.2;},
  x=>{x.ledger.genuineOriginalFootGapMeters=.8;},
  x=>{x.ledger.playerPositionRewritten=true;},
  x=>{x.frame.cpu.physicalFootRelocations=1;},
  x=>{x.ledger.originalRows[0].originalB337NearbyActiveCells[0].originalOwner=8;},
  x=>{x.frame.matchState='TIME_UP';}
 ]){
  const x=f();change(x);
  assert.throws(()=>b408ChooseActiveOriginalCell(x.ledger,x.frame,x.foot),
   /B408_NATIVE_ORIGINAL_AIM_HOLD_/);
 }
});
