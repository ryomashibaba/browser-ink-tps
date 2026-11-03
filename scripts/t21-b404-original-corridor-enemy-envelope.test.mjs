import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB404IndependentSourceEnvelope,B404_B322_PROOFS} from './t21-b404-original-corridor-enemy-envelope.mjs';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
function make(){
 let time=100;
 const human=B404_B322_PROOFS.map(([file,,count],i)=>{
  const source='25/17/26/0';
  const frame=(j)=>{
   const tick=time++;
   return {source,tick,actualBodyMeters:[0,4.5,48-j],
    realHumanOriginalFootSupported:true,
    genuineHumanOriginalFootSolid:
     'UndertowT21D:right-low-route-ramp-positive-z',
    genuineOriginalFootGapMeters:.03,
    sourceActorRelocations:0,sourceInkRewritten:false,
    playerPositionRewritten:false,scoreable:0,
    originalRows:Array.from({length:17},(_,k)=>({surfaceId:String(k)})),
    original4v4Certified:false,productionAuthorized:false};
  };
  const first=frame(0);
  const steps=Array.from({length:count},(_,j)=>({
   realKey:'KeyW',nativeInputTicks:4,actualNativeTickDelta:6,
   after:frame(j+1)
  }));
  return {schema:'B3_CORRIDOR_ORIGINAL_READONLY',
   source,first,steps,
   productionAuthorized:false,original4v4Certified:false};
 });
 const cpu={schema:'B335_REAL_CHROMIUM_SOURCE_ROUND',
  source:'25/17/26/0',b340TelemetryVersion:1,
  sourceOriginalUnchanged:true,actualCdpUserClick:true,
  injectedTicks:false,injectedInk:false,
  injectedActorPositions:false,officialWinner:'NONE',
  samples:[180,150,120,90,60,30,0].map((s,i)=>({
   thresholdSeconds:s,tick:1056+i*1800,
   originalSolids:25,originalPaint:17,originalNavLinks:26,
   scoreable:0,productionAuthorized:false,unrestricted4v4Certified:false,
   cpuActors:7,actualCpuRejoined:7,cpuRelocations:0,officialWinner:'NONE',
   matchState:i===6?'TIME_UP':'PLAYING',
   actualCpuFootPositions:ids.map((id,j)=>({
    id,foot:id.startsWith('B')?[j,4.5,-55]:[j,3,40]
   }))
  }))
 };
 return {human,cpu};
}
test('two different original real source runs never become a simultaneous encounter',()=>{
 const {human,cpu}=make();
 const x=auditB404IndependentSourceEnvelope(human,cpu);
 assert.equal(x.humanOriginalObservedFootRecords,32);
 assert.equal(x.enemyOriginalObservedFootRecords,28);
 assert.equal(x.crossSessionCombinations,896);
 assert.ok(x.mostOptimisticSampledCrossSessionHorizontalMeters>90);
 assert.equal(x.allCrossSessionSamplePairsOutsideB18132m,true);
 assert.equal(x.realConcurrentOpponentProximityCertified,false);
 assert.equal(x.nativeHumanEnemyHitOrHpLossCertified,false);
 assert.equal(x.opponentNaturalRouteCertified,false);
});
test('geometrically close cross-session evidence still cannot certify a hit',()=>{
 const {human,cpu}=make();
 for(const s of cpu.samples)
  for(const c of s.actualCpuFootPositions)
   if(c.id.startsWith('B'))c.foot[2]=48;
 const x=auditB404IndependentSourceEnvelope(human,cpu);
 assert.equal(x.allCrossSessionSamplePairsOutsideB18132m,false);
 assert.equal(x.sameNativeSessionOrTick,false);
 assert.equal(x.originalStageRayLineClearCertified,false);
 assert.equal(x.realConcurrentOpponentProximityCertified,false);
});
test('source spoofing, unsupported Rapier foot, invented KeyW and CPU relocation fail closed',()=>{
 const changes=[
  x=>{x.human[0].first.realHumanOriginalFootSupported=false;},
  x=>{x.human[1].steps[0].realKey='QA_TELEPORT';},
  x=>{x.human[2].steps[1].after.sourceActorRelocations=1;},
  x=>{x.human[3].steps[1].after.actualBodyMeters=[NaN,4,40];},
  x=>{x.human[4].first.genuineHumanOriginalFootSolid='fabricated';},
  x=>{x.human[5].steps[0].after.scoreable=1;},
  x=>{x.cpu.injectedActorPositions=true;},
  x=>{x.cpu.samples[3].cpuRelocations=1;},
  x=>{x.cpu.samples[4].actualCpuFootPositions.pop();}
 ];
 for(const change of changes){
  const x=make();change(x);
  assert.throws(()=>auditB404IndependentSourceEnvelope(x.human,x.cpu),
   /B404_SOURCE_EVIDENCE_HOLD_/);
 }
});
