import test from 'node:test';
import assert from 'node:assert/strict';
import {b337AuditNative as audit} from './t21-b337-real-input-ink-audit.mjs';
function fixture(){
 const labels=['START','AIM','FIRE','W','A','S','D'];
 return {schema:'B337_REAL_CHROMIUM_NATIVE_SOURCE_INPUT_INK',
  source:'25/17/26/0',realFullRound:true,nativeCdpInput:true,
  injectedTicks:false,injectedInk:false,injectedActorPositions:false,
  officialWinner:'NONE',
  actions:['MOUSE_MOVED','FIRE','KeyW','KeyA','KeyS','KeyD'],
  samples:labels.map((label,i)=>({
   label,source:'25/17/26/0',tick:100+i*12,remainingSeconds:178-i,
   matchState:'PLAYING',paused:false,stopReason:null,
   body:[0,6,40+(i>=3?.3:0)],cameraYawDegrees:i>0?4.4:0,
   originalSolids:25,originalPaint:17,originalNavLinks:26,scoreable:0,
   productionAuthorized:false,unrestricted4v4Certified:false,
   turfResult:'UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED',
   cpuCount:7,cpuRejoined:7,cpuRelocations:0,
   humanShots:i>=2?4:0,humanInk:i>=2?17:0,
   lastHumanImpactTick:i>=2?125:null,
   lastHumanPaintedSurface:i>=2?'original-1':null,
   footSolid:'UndertowT21D:spawn-high-positive-z',
   footGap:0.02,footSupported:true,
   originalRows:Array.from({length:17},(_,j)=>({
    surfaceId:'original-'+j,a:i>=2&&j===1?17:0,
    b:0,neutral:i>=2&&j===1?83:100,active:100
   }))
  }))};
}
test('genuine sampled human aim, ink, supported KeyW and seven CPUs',()=>{
 const r=audit(fixture());
 assert.equal(r.verdict,'PASS_SAMPLED_NATIVE_INPUT_MOUSE_AIM_HUMAN_INK_ORIGINAL_FOOT');
 assert.equal(r.observedOriginalSupportedWMeters,0.3);
 assert.equal(r.fullyContinuousRouteCertified,false);
 assert.equal(r.gameplayCertified,false);
});
test('fake mouse aim, shots or painted cells fail closed',()=>{
 for(const change of [
  w=>{w.samples[1].cameraYawDegrees=0;},
  w=>{w.samples[2].humanShots=0;},
  w=>{w.samples[2].humanInk=0;},
  w=>{w.samples[2].lastHumanPaintedSurface=null;},
  w=>{w.actions[0]='QA_CAMERA_SET';}
 ]){
  const w=fixture();change(w);
  assert.throws(()=>audit(w),/B337_SOURCE_GAMEPLAY_/);
 }
});
test('unverified original foot, missing actual movement and stale ticks are HOLD',()=>{
 for(const change of [
  w=>{w.samples[3].footSupported=false;},
  w=>{w.samples[3].body=w.samples[2].body;},
  w=>{w.samples[3].tick=w.samples[2].tick;},
  w=>{w.samples[5].cpuRejoined=6;},
  w=>{w.samples[4].cpuRelocations=1;}
 ]){
  const w=fixture();change(w);
  assert.throws(()=>audit(w),/B337_SOURCE_GAMEPLAY_/);
 }
});
test('no extra original solids, scoreable paint, route or release authority',()=>{
 for(const change of [
  w=>{w.samples[2].originalSolids=30;},
  w=>{w.samples[3].originalPaint=18;},
  w=>{w.samples[4].originalNavLinks=27;},
  w=>{w.samples[5].scoreable=1;},
  w=>{w.samples[6].unrestricted4v4Certified=true;},
  w=>{w.samples[6].productionAuthorized=true;},
  w=>{w.injectedTicks=true;}
 ]){
  const w=fixture();change(w);
  assert.throws(()=>audit(w),/B337_SOURCE_GAMEPLAY_/);
 }
});
test('original active cell counts and 17 exact IDs cannot drift',()=>{
 for(const change of [
  w=>{w.samples[4].originalRows[0].surfaceId='new';},
  w=>{w.samples[6].originalRows[1].neutral=82;}
 ]){
  const w=fixture();change(w);
  assert.throws(()=>audit(w),/B337_SOURCE_GAMEPLAY_/);
 }
});
