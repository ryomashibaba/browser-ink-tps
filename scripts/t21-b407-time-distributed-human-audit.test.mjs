import test from 'node:test';
import assert from 'node:assert/strict';
import { b407AuditRealHumanWaves as audit } from './t21-b407-time-distributed-human-audit.mjs';
const P = 'UndertowT21D:spawn-high-positive-z';
function fixture() {
  const markers = [150,120,90,60,30];
  const source = {schema:'B405_SINGLE_GENUINE_180S_HUMAN_7CPU_SOURCE',
    samples: ['AFTER_INPUT',...markers.map(String),'0'].map((label,i)=>({
      label,tick:1100+i*1700,remainingSeconds:i===0?160:i===6?0:markers[i-1],
      originalHumanFoot:{id:P},humanShots:9+i*5,humanChangedCells:92,
      matchState:i===6?'TIME_UP':'PLAYING',paused:i===6,
      actualPointerLocked:i!==6,sourceScoreablePromotions:0,cpuPhysicalRelocations:0
    }))};
  const waves=markers.map((m,i)=>{
    const frame=source.samples[i+1], tick=frame.tick;
    const legs=['KeyW','KeyA','KeyS','KeyD'].map((code,j)=>({
      code,fromTick:tick+1+j*12,toTick:tick+12+j*12,
      from:[j*.1,4,0],to:[j*.1+.12,4,0],
      planarMeters:.12,originalFootSolid:P,originalSupport:true,
      noActorTeleport:true
    }));
    return {remaining:m,source:'25/17/26/0',sameOriginalNativeGame:true,
      injectedTime:false,injectedInk:false,injectedActorPositions:false,
      before:{tick,seconds:m,body:[0,4,0],humanShots:frame.humanShots,
        humanChangedCells:92,sevenCpuRejoined:7,originalFootSolid:P,
        originalFootSupported:true,pointerLocked:true},
      legs,actualCdpMouse:[800,450],totalRealKccPlanarMeters:.48,
      after:{tick:tick+60,seconds:m-2,body:[.12,4,0],
        humanShots:frame.humanShots+2,humanChangedCells:92,
        sevenCpuRejoined:7,originalFootSolid:P,
        originalFootSupported:true,pointerLocked:true}};
  });
  source.samples[6].humanShots=60;source.samples[6].tick=11300;
  return {data:{schema:'B407_SAME_REAL_180S_TIME_DISTRIBUTED_HUMAN_INPUT',
     source:'25/17/26/0',enabled:true,injectedTime:false,injectedInk:false,
     injectedActorPositions:false,officialWinner:'NONE',
     sameB405NativeGame:true,waves},source};
}
const gate={auditB405:()=>({
 verdict:'PASS_ONE_REAL_NATIVE_180S_7CPU_HUMAN_INPUT_SHOT_INK',
 sameNativeCdpGameFromHumanShotUntilTimeUp:true
})};
test('five time-spread native key/fire windows retain strict SOURCE-only verdict',()=>{
 const {data,source}=fixture();
 const v=audit(data,source,gate);
 assert.equal(v.recordedWaves,5);assert.equal(v.realHumanKeys,20);
 assert.equal(v.formal4v4Certified,false);
 assert.equal(v.actualHumanEnemyKillAnd150TickRespawnCertified,false);
 assert.ok(v.additionalRealNativeHumanShots>0);
});
test('no synthetic movement, pointer, source foot, tick, actor or shot passes',()=>{
 for(const change of [
   f=>{f.data.waves.pop();},
   f=>{f.data.waves[0].after.humanShots=f.data.waves[0].before.humanShots;},
   f=>{f.data.waves[0].legs[1].originalSupport=false;},
   f=>{f.data.waves[0].legs[1].planarMeters=2;},
   f=>{f.data.waves[0].before.pointerLocked=false;},
   f=>{f.data.waves[0].after.sevenCpuRejoined=6;},
   f=>{f.data.waves[0].legs[0].toTick=f.data.waves[0].legs[0].fromTick;},
   f=>{f.data.waves[0].after.tick=f.source.samples[2].tick+1;},
   f=>{f.data.waves[1].after.originalFootSolid='FAKE_FLOOR';},
   f=>{f.data.waves[2].injectedActorPositions=true;},
   f=>{f.data.waves[2].totalRealKccPlanarMeters=0;},
   f=>{f.source.samples[6].actualPointerLocked=true;},
   f=>{f.source.samples[6].sourceScoreablePromotions=1;}
 ]){const f=fixture();change(f);
   assert.throws(()=>audit(f.data,f.source,gate),/B407_TIME_DISTRIBUTED_REAL_SOURCE_HOLD_/);
 }
});
