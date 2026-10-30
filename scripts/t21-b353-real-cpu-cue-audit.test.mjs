import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB353NativeRealCpuCue} from './t21-b353-real-cpu-cue-audit.mjs';
function sample(hits=0){
 const b=['B1','B2','B3','B4'].map((id,i)=>({
  id,foot:[i,0,-40],hp:100,lifeState:'ACTIVE'}));
 const exits=Array.from({length:10},(_,i)=>({kind:'EXIT',
  reason:i<hits?'REAL_CPU_HIT':'ORIGINAL_PAINTABLE'}));
 const p={source:'25/17/26/0',actualEndNativeTick:180,
  physicalWitness:{totalActualShooterLaunches:10,totalActualShooterExits:10,
   events:exits}};
 const w={schema:'B353_REAL_NATIVE_CPU_HIT_CUE_WITNESS',
  source:'25/17/26/0',nativeCdp:true,realActorsOnly:true,
  syntheticHits:false,syntheticInk:false,syntheticTicks:false,
  actorTeleports:0,startTick:100,endTick:180,
  humanStart:[0,0,40],humanEnd:[1,0,41],
  originalEnemiesBefore:b,originalEnemiesAfter:b.map(x=>({...x,foot:[...x.foot]})),
  humanCpuHpHitsBefore:0,humanCpuHpHitsAfter:hits,
  genuineCueBefore:0,genuineCueAfter:hits,
  physicalCpuHitExits:hits,physicalPaintableExits:10-hits,
  physicalLaunches:10,physicalExits:10,actualHumanPaintChangedCells:300,
  humanInkBefore:100,humanInkAfter:94,
  originalScoreable:0,originalNintendoCueArtCertified:false,
  officialWinnerCertified:false,productionAuthorized:false};
 return {w,p};
}
test('actual source shooting without real enemy damage must HOLD',()=>{
 const {w,p}=sample(),x=auditB353NativeRealCpuCue(w,p);
 assert.match(x.verdict,/^HOLD_/);assert.equal(x.realCueEvents,0);
});
test('true CPU hit plus authoritative cue count is tech-only PASS',()=>{
 const {w,p}=sample(1),x=auditB353NativeRealCpuCue(w,p);
 assert.equal(x.verdict,'PASS_REAL_CPU_HP_HIT_AND_CUE_COUNTER');
 assert.equal(x.NintendoArtAudioParityCertified,false);
});
test('reject fake HP, cue, actor, scoreable and physical contact',()=>{
 const mutations=[
  s=>s.w.humanCpuHpHitsAfter=1,
  s=>s.w.genuineCueAfter=1,
  s=>s.w.originalEnemiesBefore[0].foot[0]=Infinity,
  s=>s.w.realActorsOnly=false,
  s=>s.w.originalScoreable=1,
  s=>s.p.physicalWitness.events[0].reason='REAL_CPU_HIT',
  s=>s.w.physicalLaunches=11
 ];
 for(const change of mutations){const s=sample();change(s);
  assert.throws(()=>auditB353NativeRealCpuCue(s.w,s.p),/B353_NATIVE_CUE_/);}
});
