import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sampleRealSourceCombat,auditRealSourceCombatFrames,SOURCE_ACTORS}
 from './t21-v28-qa-native-combat-window.mjs';

function native(tick=1000){
 return {
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
  unrestricted4v4Certified:false,productionAuthorized:false,
  matchState:'PLAYING',paused:false,tick,
  cpu:{physicalRejoins:[...SOURCE_ACTORS],
   cpu:SOURCE_ACTORS.map(id=>({
    id,lifeState:'ACTIVE',hp:100,rejoined:true
   }))},
  humanCpuDirectHits:0,humanCpuDirectSplats:0,cpuSplats:0,cpuRespawns:0,
  b367RealCpuLifecycleEvidence:{
   source:'25/17/26/0',enabled:true,syntheticHits:0,
   actorRelocations:0,scoreable:0,physicalHumanCpuHpHits:0,events:[]
  }
 };
}
const hit=(tick=1060)=>({
 sequence:1,nativeFrame:tick,botId:'B2',weaponId:'pulse-sprayer',
 hpBefore:100,hpAfter:70,actualHpLoss:30,lethalHpZero:false
});
test('authentic seven-CPU native browser snapshot copied read-only',()=>{
 const a=sampleRealSourceCombat(native());
 assert.equal(a.tick,1000);assert.equal(a.actors.length,7);
 assert.equal(a.realDamageEvents.length,0);
 assert.equal(a.nativeWrites,0);
 assert.equal(a.originalSource,'25/17/26/0');
});
test('genuine sampled 720-tick SOURCE with zero HP is not a fake life PASS',()=>{
 const a=sampleRealSourceCombat(native(1068));
 const b=sampleRealSourceCombat(native(1788));
 const r=auditRealSourceCombatFrames([a,b]);
 assert.equal(r.verdict,'HOLD_NO_GENUINE_HUMAN_TO_CPU_HP_EVENTS');
 assert.equal(r.physicallyObservedHpLossEvents,0);
 assert.equal(r.sameActor150TickRespawnCertified,false);
 assert.equal(r.fullOriginal4v4Certified,false);
});
test('an actual B367 resolved HP-loss event can be retained despite later frames',()=>{
 const a=sampleRealSourceCombat(native(1000));
 const b=native(1100),c=native(1280);
 for(const f of [b,c]){
  f.humanCpuDirectHits=1;
  f.b367RealCpuLifecycleEvidence.physicalHumanCpuHpHits=1;
  f.b367RealCpuLifecycleEvidence.events=[hit(1060)];
  f.cpu.cpu.find(x=>x.id==='B2').hp=70;
 }
 const report=auditRealSourceCombatFrames([
  a,sampleRealSourceCombat(b),sampleRealSourceCombat(c)]);
 assert.equal(report.verdict,'PASS_LIMITED_GENUINE_HUMAN_PROJECTILE_HP_EVENTS');
 assert.equal(report.physicallyObservedHpLossEvents,1);
 assert.equal(report.authenticRealHpEvents[0].botId,'B2');
 assert.equal(report.sameActor150TickRespawnCertified,false);
});
test('lethal B367 HP0 plus observed SPLATTED and later ACTIVE are still not a certified same-actor respawn',()=>{
 const a=native(1050),b=native(1100),c=native(1300);
 const evt={...hit(1080),hpBefore:30,hpAfter:0,actualHpLoss:30,
  lethalHpZero:true};
 for(const n of [b,c]){
  n.humanCpuDirectHits=1;n.humanCpuDirectSplats=1;
  n.cpuSplats=1;n.b367RealCpuLifecycleEvidence.physicalHumanCpuHpHits=1;
  n.b367RealCpuLifecycleEvidence.events=[evt];
 }
 b.cpu.cpu.find(x=>x.id==='B2').lifeState='SPLATTED';
 b.cpu.cpu.find(x=>x.id==='B2').hp=0;
 c.cpuRespawns=1;c.cpu.cpu.find(x=>x.id==='B2').rejoined=false;
 const q=auditRealSourceCombatFrames([
  sampleRealSourceCombat(a),sampleRealSourceCombat(b),sampleRealSourceCombat(c)
 ]);
 assert.equal(q.actualLethalHpZeroEvents,1);
 assert.equal(q.actualSplatFramesObserved,1);
 assert.equal(q.observedActiveAfter150TicksFromLethal,1);
 assert.equal(q.sameActor150TickRespawnCertified,false);
});
test('non-original stage, forged native hits, score elevation or synthetic event never sampled',()=>{
 for(const mut of [
  n=>n.originalSourceSolids++,
  n=>n.sourceScoreablePromotions++,
  n=>n.b367RealCpuLifecycleEvidence.syntheticHits++,
  n=>n.b367RealCpuLifecycleEvidence.actorRelocations++,
  n=>n.cpu.physicalRejoins.pop(),
  n=>n.cpu.cpu[0].hp=Infinity,
  n=>n.paused=true
 ]){
  const n=native();mut(n);
  assert.throws(()=>sampleRealSourceCombat(n),/REAL_SOURCE_SNAPSHOT_REQUIRED/);
 }
});
test('missing or malformed resolved HP events cannot produce limited PASS',()=>{
 const a=sampleRealSourceCombat(native(1000));
 for(const bad of [
  {...hit(),botId:'A1'},
  {...hit(),actualHpLoss:99},
  {...hit(),hpAfter:100},
  {...hit(),nativeFrame:3000},
  {...hit(),lethalHpZero:true}
 ]){
  const b=native(1200);b.humanCpuDirectHits=1;
  b.b367RealCpuLifecycleEvidence.physicalHumanCpuHpHits=1;
  b.b367RealCpuLifecycleEvidence.events=[bad];
  const v=auditRealSourceCombatFrames([a,sampleRealSourceCombat(b)]);
  assert.equal(v.verdict,'HOLD_INVALID_NATIVE_COMBAT_PROVENANCE');
  assert.equal(v.physicallyObservedHpLossEvents,0);
 }
});
test('conflicting real event sequence and nonmonotonic cumulative counters fail closed',()=>{
 const a=native(1000),b=native(1100),c=native(1200);
 for(const n of [a,b,c]){
  n.humanCpuDirectHits=1;
  n.b367RealCpuLifecycleEvidence.physicalHumanCpuHpHits=1;
  n.b367RealCpuLifecycleEvidence.events=[hit(960)];
 }
 c.b367RealCpuLifecycleEvidence.events[0].actualHpLoss=20;
 c.b367RealCpuLifecycleEvidence.events[0].hpAfter=80;
 const q=auditRealSourceCombatFrames([a,b,c].map(sampleRealSourceCombat));
 assert.equal(q.verdict,'HOLD_INVALID_NATIVE_COMBAT_PROVENANCE');
 const d=native(1300),e=native(1400);
 d.cpuRespawns=3;e.cpuRespawns=2;
 const r=auditRealSourceCombatFrames([sampleRealSourceCombat(d),sampleRealSourceCombat(e)]);
 assert.equal(r.verdict,'HOLD_INVALID_NATIVE_COMBAT_PROVENANCE');
});
test('unknown source life state, duplicated CPU ID, or no B367 ledger cannot be mistaken for a valid frame',()=>{
 for(const change of [
  n=>n.cpu.cpu[0].lifeState='UNKNOWN',
  n=>n.cpu.cpu[1].id='A1',
  n=>n.b367RealCpuLifecycleEvidence.events=null
 ]){
  const n=native();change(n);
  assert.throws(()=>sampleRealSourceCombat(n),/REAL_SOURCE_SNAPSHOT_REQUIRED/);
 }
});
