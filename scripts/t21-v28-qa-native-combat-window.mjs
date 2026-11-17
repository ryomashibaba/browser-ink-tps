#!/usr/bin/env node
/** QA #18 native SOURCE witness: collect only actual already-advanced
 * browser snapshot state. No simulated HP, shot, actor, respawn or tick. */
export const SOURCE_ACTORS=Object.freeze(['A1','A2','A3','B1','B2','B3','B4']);
const count=x=>Number.isSafeInteger(x)&&x>=0;
const hp=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=100;
function requireReal(x){if(!x)throw Error('QA18_NATIVE_COMBAT_REAL_SOURCE_SNAPSHOT_REQUIRED');}

export function sampleRealSourceCombat(n){
 requireReal(n?.originalSourceSolids===25&&n.originalPaintSurfaces===17&&
  n.originalSourceNavigationLinks===26&&n.sourceScoreablePromotions===0&&
  n.unrestricted4v4Certified===false&&n.productionAuthorized===false&&
  n.matchState==='PLAYING'&&n.paused===false&&count(n.tick)&&
  n.cpu?.cpu?.length===7&&n.cpu?.physicalRejoins?.length===7&&
  [n.humanCpuDirectHits,n.humanCpuDirectSplats,n.cpuSplats,n.cpuRespawns]
   .every(count));
 const src=n.b367RealCpuLifecycleEvidence;
 requireReal(src?.source==='25/17/26/0'&&src.syntheticHits===0&&
  src.actorRelocations===0&&src.scoreable===0&&
  count(src.physicalHumanCpuHpHits)&&
  Array.isArray(src.events)&&src.events.length<=32);
 const actors=SOURCE_ACTORS.map(id=>{
  const rows=n.cpu.cpu.filter(c=>c.id===id);
  requireReal(rows.length===1&&
   ['ACTIVE','SPLATTED','RESPAWNING'].includes(rows[0].lifeState)&&
   hp(rows[0].hp)&&typeof rows[0].rejoined==='boolean');
  return {id,lifeState:rows[0].lifeState,hp:rows[0].hp,
   rejoined:rows[0].rejoined};
 });
 return {tick:n.tick,actors,
  counters:{physicalHumanCpuHpHits:src.physicalHumanCpuHpHits,
   humanCpuDirectHits:n.humanCpuDirectHits,
   humanCpuDirectSplats:n.humanCpuDirectSplats,
   cpuSplats:n.cpuSplats,cpuRespawns:n.cpuRespawns},
  b367Enabled:src.enabled===true,
  realDamageEvents:src.events.map(e=>({...e})),
  originalSource:'25/17/26/0',nativeWrites:0};
}

export function auditRealSourceCombatFrames(frames){
 if(!Array.isArray(frames)||frames.length<2)
  return {verdict:'HOLD_REAL_NATIVE_COMBAT_FRAMES_INSUFFICIENT',
   physicallyObservedHpLossEvents:0,sameActor150TickRespawnCertified:false,
   fullOriginal4v4Certified:false,source:'25/17/26/0'};
 const seen=new Map();
 let prior=null,lethalWitnesses=0,observedSplatFrames=0,
  observedActiveAfterLethal=0;
 const errors=[];
 for(const f of frames){
  if(!count(f?.tick)||f.originalSource!=='25/17/26/0'||
    f.nativeWrites!==0||!Array.isArray(f.actors)||
    f.actors.length!==7||f.b367Enabled!==true||
    !Array.isArray(f.realDamageEvents)||f.realDamageEvents.length>32||
    !SOURCE_ACTORS.every(id=>f.actors.filter(c=>c.id===id&&
     hp(c.hp)&&typeof c.rejoined==='boolean'&&
     ['ACTIVE','SPLATTED','RESPAWNING'].includes(c.lifeState)).length===1)||
    !f.counters||!['physicalHumanCpuHpHits','humanCpuDirectHits',
      'humanCpuDirectSplats','cpuSplats','cpuRespawns']
       .every(k=>count(f.counters[k]))||
    prior&&(f.tick<=prior.tick||
      Object.keys(f.counters).some(k=>f.counters[k]<prior.counters[k]))){
    errors.push('NON_AUTHENTIC_OR_NON_MONOTONIC_NATIVE_FRAME');break;
  }
  for(const e of f.realDamageEvents){
   if(!count(e.sequence)||e.sequence<1||!count(e.nativeFrame)||
      e.nativeFrame>f.tick||
      !['B1','B2','B3','B4'].includes(e.botId)||
      typeof e.weaponId!=='string'||!e.weaponId||
      !hp(e.hpBefore)||!hp(e.hpAfter)||
      e.hpBefore<=e.hpAfter||!Number.isFinite(e.actualHpLoss)||
      e.actualHpLoss<=0||
      Math.abs(e.hpBefore-e.hpAfter-e.actualHpLoss)>1e-5||
      e.lethalHpZero!==(e.hpAfter===0)){
    errors.push('INVALID_REAL_HP_EVENT');break;
   }
   const same=seen.get(e.sequence);
   if(same&&JSON.stringify(same)!==JSON.stringify(e))
    errors.push('REAL_HP_SEQUENCE_CHANGED_WITHIN_WINDOW');
   seen.set(e.sequence,e);
  }
  if(errors.length)break;
  lethalWitnesses=[...seen.values()].filter(e=>e.lethalHpZero).length;
  if([...f.actors].some(a=>a.lifeState==='SPLATTED'&&a.hp===0&&
     [...seen.values()].some(e=>e.botId===a.id&&e.lethalHpZero&&
      e.nativeFrame<=f.tick)))observedSplatFrames++;
  if([...f.actors].some(a=>a.lifeState==='ACTIVE'&&a.hp===100&&
     [...seen.values()].some(e=>e.botId===a.id&&e.lethalHpZero&&
      f.tick-e.nativeFrame>=150)))observedActiveAfterLethal++;
  prior=f;
 }
 const verified=errors.length===0;
 const events=verified?[...seen.values()].sort((a,b)=>a.sequence-b.sequence):[];
 return {
  schema:'T21_V28_QA18_TRUE_NATIVE_COMBAT_WINDOW_V1',
  source:'25/17/26/0',
  verdict:!verified?'HOLD_INVALID_NATIVE_COMBAT_PROVENANCE':
   events.length?'PASS_LIMITED_GENUINE_HUMAN_PROJECTILE_HP_EVENTS':
   'HOLD_NO_GENUINE_HUMAN_TO_CPU_HP_EVENTS',
  firstObservedTick:verified?frames[0].tick:null,
  lastObservedTick:verified?frames.at(-1).tick:null,
  authenticRealHpEvents:verified?events:[],
  physicallyObservedHpLossEvents:verified?events.length:0,
  actualLethalHpZeroEvents:verified?lethalWitnesses:0,
  actualSplatFramesObserved:verified?observedSplatFrames:0,
  observedActiveAfter150TicksFromLethal:verified?observedActiveAfterLethal:0,
  sameActorSplatCertified:false,
  sameActor150TickRespawnCertified:false,
  fullOriginal4v4Certified:false,
  originalF4Authorized:false,scoreable:0,
  errors,noGameStateWrites:true
 };
}
