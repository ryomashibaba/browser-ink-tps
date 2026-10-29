import test from 'node:test';
import assert from 'node:assert/strict';
import {b335VerifyNativeRound as audit} from './t21-b335-real-180s-guard.mjs';
function f(){
 const times=[180,150,120,90,60,30,0];
 return {schema:'B335_REAL_CHROMIUM_SOURCE_ROUND',source:'25/17/26/0',
  actualCdpUserClick:true, injectedTicks:false, injectedInk:false,
  injectedActorPositions:false,
  samples:times.map((time,i)=>({
   thresholdSeconds:time,remainingSeconds:i===0?179.98:time,
   tick:1000+i*1800,wallMs:i*30000,
   matchState:i===6?'TIME_UP':'PLAYING',paused:false,stopReason:null,
   originalSolids:25,originalPaint:17,originalNavLinks:26,scoreable:0,
   unrestricted4v4Certified:false,productionAuthorized:false,
   officialWinner:'NONE',turfResult:'UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED',
   cpuActors:7,actualCpuRejoined:7,cpuRelocations:0,
   humanInk:i*4,cpuInk:i*8,humanShots:i,actualHumanBody:[0,5,45],
   originalHumanFootSupport:'UndertowT21D:spawn-high-positive-z'
  }))};
}
test('a full genuine 180-second 7CPU round can be certified from witnesses',()=>{
 const x=audit(f());assert.equal(x.verdict,'PASS_GENUINE_CHROMIUM_180S_TIME_UP');
 assert.equal(x.winner,'NONE');assert.equal(x.realNativeTicks,10800);
});
test('A1 practice clear does not count as complete round',()=>{
 const w=f();w.samples[6].matchState='PLAYING';
 assert.throws(()=>audit(w),/NATIVE_TIME_UP/);
});
test('no fabricated clock or positions',()=>{
 for(const field of ['injectedTicks','injectedInk','injectedActorPositions']){
  const w=f();w[field]=true;assert.throws(()=>audit(w),/ORIGINAL_SOURCE_ONLY/);
 }
 const w=f();w.samples[6].wallMs=2000;
 assert.throws(()=>audit(w),/TRUE_WALL_CLOCK_ELAPSED/);
});
test('source solids and route authorization immutable',()=>{
 let w=f();w.samples[4].originalSolids=30;
 assert.throws(()=>audit(w),/SOURCE_SAMPLE_4/);
 w=f();w.samples[2].scoreable=1;assert.throws(()=>audit(w),/SOURCE_SAMPLE_2/);
 w=f();w.samples[5].unrestricted4v4Certified=true;
 assert.throws(()=>audit(w),/SOURCE_SAMPLE_5/);
});
test('native CPU actual disappearance and relocation are rejected',()=>{
 let w=f();w.samples[3].cpuActors=6;
 assert.throws(()=>audit(w),/SOURCE_SAMPLE_3/);
 w=f();w.samples[3].cpuRelocations=1;
 assert.throws(()=>audit(w),/SOURCE_SAMPLE_3/);
});
test('nonmonotonic clock, ink or missing original foot witness is HOLD',()=>{
 let w=f();w.samples[4].tick=w.samples[3].tick;
 assert.throws(()=>audit(w),/NATIVE_MONOTONIC_4/);
 w=f();w.samples[4].cpuInk=0;assert.throws(()=>audit(w),/NATIVE_MONOTONIC_4/);
 w=f();delete w.samples[4].originalHumanFootSupport;
 assert.throws(()=>audit(w),/SOURCE_SAMPLE_4/);
});
