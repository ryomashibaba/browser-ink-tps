import test from 'node:test';
import assert from 'node:assert/strict';
import {b349AuditRealAirborneShooter} from './t21-b349-source-real-air-shooter-audit.mjs';
const good=()=>({
 schema:'B349_GENUINE_NATIVE_SOURCE_AIR_SHOOTER',
 originalSource:'25/17/26/0',
 actualNativeSpaceKeyDown:true,actualNativeSpaceKeyUp:true,
 fakeTicks:0,teleports:0,fakeShots:0,sourceScoreable:0,
 productionAuthorized:false,
 realOriginalHumanYBeforeJump:8,
 realShooterShots:10,groundedShots:4,airborneShots:6,
 nativePhysicsProjectiles:10,originalPaintableImpacts:8,
 originalPaintChangedCells:110,
 actualJumpCheckpoints:[12,24,36,48,60].map((offset,i)=>({
  offset,tick:1080+offset,bodyY:[8,8.5,8.9,8.55,8.05][i],
  realGroundShots:[2,2,3,4,4][i],
  realAirShots:[0,2,4,4,6][i]
 }))
});
test('B349 schema sample never certifies Nintendo original air accuracy',()=>{
 const r=b349AuditRealAirborneShooter(good());
 assert(r.measuredHumanBodyRiseMeters>=.8);
 assert.equal(r.exactOriginalNintendoInAirProbabilityCertified,false);
});
test('B349 negative gates reject artificial movement/shots/missing air',()=>{
 for(const bad of [
  x=>x.actualNativeSpaceKeyDown=false,
  x=>x.fakeTicks=1,
  x=>x.actualJumpCheckpoints.forEach(a=>a.bodyY=8),
  x=>x.airborneShots=0,
  x=>x.groundedShots=9,
  x=>x.nativePhysicsProjectiles=11,
  x=>x.actualJumpCheckpoints[2].realAirShots=-1,
  x=>x.originalPaintChangedCells=0,
  x=>x.sourceScoreable=1
 ]){
  const x=good();bad(x);
  assert.throws(()=>b349AuditRealAirborneShooter(x),/B349_SOURCE_JUMP_/);
 }
});
