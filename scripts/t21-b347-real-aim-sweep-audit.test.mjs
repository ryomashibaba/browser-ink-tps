import test from 'node:test';
import assert from 'node:assert/strict';
import {b347AuditRealPointerSweep} from './t21-b347-real-aim-sweep-audit.mjs';
const make=()=>({
 s:{schema:'B347_TRUE_POINTER_LOCKED_SOURCE_SWEEP',
  source:'25/17/26/0',artificialCameraYaw:false,
  artificialShots:false,artificialPaint:false,sourceScoreable:0,
  productionAuthorized:false,nativeYawBeforeFire:4,
  nativeYawAfterSweep:27,nativeOriginalCellsAfter12:91,
  nativeOriginalCellsAfter60:175,actualShooterShots:10,
  realCdpMoves:[12,24,36].map((offset,i)=>({
   x:890+70*i,y:450,nativeTick:100+offset,
   trueYawDegrees:12+8*i,actualCdpMouseInput:true}))},
 w:{physicalWitness:{totalActualShooterLaunches:10,
  events:Array.from({length:10},(_,i)=>({
   kind:'EXIT',reason:'ORIGINAL_PAINTABLE',
   worldPosition:[i*.14,7,65]}))}}
});
test('source 3D schema negative fixture does not certify Nintendo spread',()=>{
 const {s,w}=make(),x=b347AuditRealPointerSweep(s,w);
 assert(x.maximumOriginalImpactDisplacementMeters>.5);
 assert.equal(x.exactNintendoAutomaticSpreadCertified,false);
});
test('rejects fake camera, repeated identical hit and no owner growth',()=>{
 for(const bad of [
  x=>x.s.artificialCameraYaw=true,
  x=>x.s.nativeYawAfterSweep=4,
  x=>x.s.nativeOriginalCellsAfter60=91,
  x=>x.w.physicalWitness.events.forEach(e=>e.worldPosition=[0,7,65]),
  x=>x.s.realCdpMoves[0].actualCdpMouseInput=false,
  x=>x.s.actualShooterShots=11
 ]){
  const x=make();bad(x);
  assert.throws(()=>b347AuditRealPointerSweep(x.s,x.w),/B347_REAL_NATIVE_/);
 }
});
