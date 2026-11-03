import test from 'node:test';
import assert from 'node:assert/strict';
import {b405AuditReal180SourceSession as audit} from './t21-b405-single-180s-human-7cpu-audit.mjs';
const ROSTER=['A1','A2','A3','B1','B2','B3','B4'];
function fixture(){
 const input={schema:'B337_INDEPENDENT_SHORT_SOURCE_INPUT_RESULT',
  verdict:'PASS_SAMPLED_NATIVE_INPUT_MOUSE_AIM_HUMAN_INK_ORIGINAL_FOOT',
  actualHumanNewShots:9,actualHumanChangedCells:92,
  actualSourceAimSurface:'UndertowT21D:spawn-high-positive-z:paint',
  gameplayCertified:false,unrestricted4v4Certified:false,
  productionAuthorized:false};
 return {schema:'B405_SINGLE_GENUINE_180S_HUMAN_7CPU_SOURCE',
  source:'25/17/26/0',originalStageUntouched:true,
  injectedTime:false,injectedInk:false,injectedActors:false,
  officialWinner:'NONE',b337ActualNativeInputVerdict:input,
  samples:['AFTER_INPUT','150','120','90','60','30','0'].map((label,i)=>({
   label,tick:i===0?1200:1200+i*1650,
   remainingSeconds:i===0?160:[-1,150,120,90,60,30,0][i],
   matchState:i===6?'TIME_UP':'PLAYING',
   paused:i===6,stopReason:null,
   originalSourceSolids:25,originalPaintSurfaces:17,
   originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
   turfResult:'UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED',
   productionAuthorized:false,unrestricted4v4Certified:false,
   player:[0,8.4,68],humanShots:9,humanChangedCells:92,
   cpuActualChangedCells:200+i*50,realCpuSourceShots:80+i,
   humanCpuDirectHits:0,humanCpuDirectSplats:0,
   cpuSplats:0,cpuRespawns:0,cpuPhysicalRelocations:0,
   cpuPhysicalRejoinedCount:7,
   cpuActors:ROSTER.map(id=>({
    id,lifeState:'ACTIVE',hp:100,rejoined:true,
    foot:[0,4,id.startsWith('B')?-55:50]})),
   originalHumanFoot:i===6?null:{
    id:'UndertowT21D:spawn-high-positive-z',supported:true,gap:0.03},
   actualPointerLocked:i!==6
  }))};
}
test('one real full time-up source session only passes exact seven frame authority',()=>{
 const r=audit(fixture());
 assert.equal(r.verdict,'PASS_ONE_REAL_NATIVE_180S_7CPU_HUMAN_INPUT_SHOT_INK');
 assert.equal(r.actualOpponentHpDamageCertified,false);
 assert.equal(r.actualOpponentKillRespawnChainCertified,false);
 assert.equal(r.originalOpponentNaturalRouteCertified,false);
 assert.equal(r.genuineHumanShotsInSameRound,9);
});
test('true direct CPU hit counters alone cannot certify actor-linked splat chain',()=>{
 const f=fixture();f.samples.forEach((x,i)=>{
  x.humanCpuDirectHits=i>2?1:0;
  x.humanCpuDirectSplats=i>4?1:0;
  x.cpuSplats=i>4?1:0;x.cpuRespawns=i===6?1:0;
 });
 const r=audit(f);
 assert.equal(r.nativeHumanEnemyHpHitEventsObserved,1);
 assert.equal(r.actualOpponentHpDamageCertified,false);
 assert.equal(r.actualOpponentKillRespawnChainCertified,false);
});
test('fake time, ink, CPU, original ground, source and win fail closed',()=>{
 for(const change of [
  x=>{x.injectedTime=true;},
  x=>{x.samples[0].humanShots=0;},
  x=>{x.samples[1].humanChangedCells=0;},
  x=>{x.samples[2].cpuActualChangedCells=0;},
  x=>{x.samples[3].cpuActors.pop();},
  x=>{x.samples[4].originalHumanFoot.supported=false;},
  x=>{x.samples[4].sourceScoreablePromotions=1;},
  x=>{x.samples[5].cpuPhysicalRelocations=1;},
  x=>{x.samples[6].matchState='PLAYING';},
  x=>{x.samples[6].actualPointerLocked=true;},
  x=>{x.samples[3].actualPointerLocked=false;},
  x=>{x.samples[6].remainingSeconds=.01;},
  x=>{x.samples[6].tick=x.samples[5].tick;}
 ]){
  const f=fixture();change(f);
  assert.throws(()=>audit(f),/B405_ORIGINAL_180S_SOURCE_HOLD_/);
 }
});
