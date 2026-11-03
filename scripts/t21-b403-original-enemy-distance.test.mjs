import test from 'node:test';
import assert from 'node:assert/strict';
import {b403AuditOriginalEnemyDistance as audit} from './t21-b403-original-enemy-distance.mjs';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
function fixture(m=120){
 return {schema:'B335_REAL_CHROMIUM_SOURCE_ROUND',source:'25/17/26/0',
  b340TelemetryVersion:1,sourceOriginalUnchanged:true,actualCdpUserClick:true,
  injectedTicks:false,injectedInk:false,injectedActorPositions:false,
  officialWinner:'NONE',
  samples:[180,150,120,90,60,30,0].map((t,i)=>({
   thresholdSeconds:t,tick:1056+i*1800,matchState:i===6?'TIME_UP':'PLAYING',
   originalSolids:25,originalPaint:17,originalNavLinks:26,scoreable:0,
   productionAuthorized:false,unrestricted4v4Certified:false,
   cpuActors:7,actualCpuRejoined:7,cpuRelocations:0,
   turfResult:'UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED',
   officialWinner:'NONE',actualHumanBody:[0,8.4,68],
   originalHumanFootSupport:i===6?null:{
    supported:true,id:'UndertowT21D:spawn-high-positive-z',gap:.025},
   actualCpuFootPositions:ids.map((id,j)=>({
    id,foot:id.startsWith('B')?[j*.2,4.6,68-m]:[j*.2,3.1,50]
   }))
  }))
 };
}
test('source-only far enemy observations are not a weapon or route PASS',()=>{
 const x=audit(fixture());
 assert.equal(x.allSevenSamplesOutsideB18132m,true);
 assert.ok(x.sampledMinimumNearestMeters>=120);
 assert.equal(x.realHumanProjectileCpuHitCertified,false);
 assert.equal(x.naturalOpponentRouteCertified,false);
 assert.equal(x.continuous180sCombatRangeCertified,false);
});
test('closer opponent still never proves actual physical projectile hit',()=>{
 const x=audit(fixture(20));
 assert.equal(x.allSevenSamplesOutsideB18132m,false);
 assert.equal(x.originalCollisionRayCertified,false);
 assert.equal(x.realCpuHpLossSplatRespawnCertified,false);
});
test('fabricated or corrupted original physical evidence rejected',()=>{
 for(const edit of [
  x=>{x.injectedActorPositions=true;},
  x=>{x.samples[0].originalSolids=26;},
  x=>{x.samples[1].actualCpuFootPositions.pop();},
  x=>{x.samples[2].actualCpuRejoined=6;},
  x=>{x.samples[3].originalHumanFootSupport.supported=false;},
  x=>{x.samples[4].scoreable=1;},
  x=>{x.samples[5].actualCpuFootPositions[3].foot=[NaN,3,-50];},
  x=>{x.samples[3].tick=x.samples[2].tick;},
  x=>{x.samples[6].matchState='PLAYING';}
 ]){
  const p=fixture();edit(p);
  assert.throws(()=>audit(p),/B403_NATIVE_SOURCE_HOLD_/);
 }
});
