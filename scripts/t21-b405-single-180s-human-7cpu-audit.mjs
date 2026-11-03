#!/usr/bin/env node
/** Same genuine Chromium session: B337 real human W/A/S/D and ownerGrid
 * paint then 180 second SOURCE game. No CPU hit, route or 4v4 forgery. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b337AuditNative} from './t21-b337-real-input-ink-audit.mjs';
const expected=['AFTER_INPUT','150','120','90','60','30','0'];
const roster=['A1','A2','A3','B1','B2','B3','B4'];
const valid3=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const need=(x,label)=>{if(!x)throw Error('B405_ORIGINAL_180S_SOURCE_HOLD_'+label);};
export function b405AuditReal180SourceSession(data){
 const input=data?.b337ActualNativeInputVerdict;
 need(data?.schema==='B405_SINGLE_GENUINE_180S_HUMAN_7CPU_SOURCE'&&
  data.source==='25/17/26/0'&&data.originalStageUntouched===true&&
  data.injectedTime===false&&data.injectedInk===false&&
  data.injectedActors===false&&data.officialWinner==='NONE'&&
  input?.schema==='B337_INDEPENDENT_SHORT_SOURCE_INPUT_RESULT'&&
  input.verdict==='PASS_SAMPLED_NATIVE_INPUT_MOUSE_AIM_HUMAN_INK_ORIGINAL_FOOT'&&
  input.actualHumanNewShots>0&&input.actualHumanChangedCells>0&&
  input.actualSourceAimSurface==='UndertowT21D:spawn-high-positive-z:paint'&&
  input.gameplayCertified===false&&
  input.unrestricted4v4Certified===false&&
  input.productionAuthorized===false,'SOURCE_PLUS_PRIOR_REAL_HUMAN_INPUT');
 need(Array.isArray(data.samples)&&data.samples.length===7&&
  data.samples.every((s,i)=>s.label===expected[i]),'SEVEN_REAL_NATIVE_SAMPLES');
 let prev=null;
 for(let i=0;i<7;i++){
  const s=data.samples[i];
  need(integer(s.tick)&&s.tick>0&&
   Number.isFinite(s.remainingSeconds)&&s.remainingSeconds>=0&&
   s.remainingSeconds<=180&&
   s.originalSourceSolids===25&&s.originalPaintSurfaces===17&&
   s.originalSourceNavigationLinks===26&&
   s.sourceScoreablePromotions===0&&
   s.turfResult==='UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED'&&
   s.productionAuthorized===false&&
   s.unrestricted4v4Certified===false&&
   s.stopReason===null&&
   valid3(s.player)&&
   integer(s.humanShots)&&integer(s.humanChangedCells)&&
   integer(s.cpuActualChangedCells)&&integer(s.realCpuSourceShots)&&
   integer(s.humanCpuDirectHits)&&integer(s.humanCpuDirectSplats)&&
   integer(s.cpuSplats)&&integer(s.cpuRespawns)&&
   s.cpuPhysicalRelocations===0&&
   Number.isSafeInteger(s.cpuPhysicalRejoinedCount)&&
   s.cpuPhysicalRejoinedCount>=0&&s.cpuPhysicalRejoinedCount<=7&&
   Array.isArray(s.cpuActors)&&s.cpuActors.length===7&&
   new Set(s.cpuActors.map(c=>c.id)).size===7&&
   roster.every(id=>s.cpuActors.some(c=>c.id===id))&&
   s.cpuActors.every(c=>valid3(c.foot)&&
    ['ACTIVE','SPLATTED'].includes(c.lifeState)&&
    integer(c.hp)&&c.hp<=100&&
    typeof c.rejoined==='boolean')&&
   s.actualPointerLocked===true,
   'REAL_STAGE_SOURCE_SAMPLE_'+s.label);
  if(i<6){
   need(s.matchState==='PLAYING'&&s.paused===false&&
    s.originalHumanFoot?.supported===true&&
    s.originalHumanFoot.id?.startsWith('UndertowT21D:')&&
    Number.isFinite(s.originalHumanFoot.gap)&&
    s.originalHumanFoot.gap<=.4,
    'REAL_ACTIVE_NATIVE_ORIGINAL_FOOT_'+s.label);
  }else need(s.matchState==='TIME_UP'&&s.paused===true&&
    s.remainingSeconds===0,'FULL_NATIVE_180S_TIME_UP');
  if(i===0){
   need(s.remainingSeconds>150&&s.remainingSeconds<180&&
    s.cpuPhysicalRejoinedCount===7&&
    s.humanShots>=input.actualHumanNewShots&&
    s.humanChangedCells>=input.actualHumanChangedCells,
    'ACTUAL_B337_INPUT_BEFORE_NATIVE_150S');
  }else{
   const target=Number(expected[i]);
   need(s.remainingSeconds<=target+.001&&s.tick>prev.tick&&
    s.remainingSeconds<prev.remainingSeconds&&
    s.humanShots>=prev.humanShots&&
    s.humanChangedCells>=prev.humanChangedCells&&
    s.cpuActualChangedCells>=prev.cpuActualChangedCells&&
    s.realCpuSourceShots>=prev.realCpuSourceShots&&
    s.humanCpuDirectHits>=prev.humanCpuDirectHits&&
    s.humanCpuDirectSplats>=prev.humanCpuDirectSplats&&
    s.cpuSplats>=prev.cpuSplats&&
    s.cpuRespawns>=prev.cpuRespawns,
    'MONOTONIC_REAL_CLOCK_INPUT_INK_COMBAT_'+s.label);
  }
  prev=s;
 }
 const first=data.samples[0],last=data.samples.at(-1);
 need(last.tick>=10800&&last.tick>first.tick&&
  last.humanShots>=first.humanShots&&
  last.humanChangedCells>=first.humanChangedCells,
  'NATIVE_180S_END_WITH_HUMAN_EVIDENCE');
 return {schema:'B405_ONE_GENUINE_180S_REAL_HUMAN_7_CPU_SOURCE',
  verdict:'PASS_ONE_REAL_NATIVE_180S_7CPU_HUMAN_INPUT_SHOT_INK',
  actualStartTick:first.tick,actualEndTick:last.tick,
  genuineHumanShotsInSameRound:last.humanShots,
  genuineHumanPaintChangedCellsInSameRound:last.humanChangedCells,
  genuineCpuPaintChangedCellsInSameRound:last.cpuActualChangedCells,
  genuineCpuShotRequestsInSameRound:last.realCpuSourceShots,
  nativeHumanEnemyHpHitEventsObserved:last.humanCpuDirectHits,
  nativeHumanCpuSplatEventsObserved:last.humanCpuDirectSplats,
  sourceCpuSplatEventsObserved:last.cpuSplats,
  sourceCpuRespawnEventsObserved:last.cpuRespawns,
  // A cumulative count in this window is not an actor-linked B367 timeline
  // and no opposing route, weapon hit or complete natural 4v4 is certified.
  actualOpponentHpDamageCertified:false,
  actualOpponentKillRespawnChainCertified:false,
  originalOpponentNaturalRouteCertified:false,
  originalScoreableSurfaces:0,
  officialWinner:'NONE',gameplayCertified:false,
  unrestricted4v4Certified:false,productionAuthorized:false,
  sameNativeCdpGameFromHumanShotUntilTimeUp:true,
  artificialWorldOrActorWrites:0};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const folder=process.argv[2];need(typeof folder==='string','EVIDENCE_DIR');
 const data=JSON.parse(readFileSync(join(folder,'b405-same-original-180s-round.json'),'utf8'));
 const b337=JSON.parse(readFileSync(join(folder,'b337-real-input-ink.json'),'utf8'));
 const independent=b337AuditNative(b337);
 need(JSON.stringify(independent)===JSON.stringify(data.b337ActualNativeInputVerdict),
  'INDEPENDENT_ORIGINAL_B337_SOURCE_MATCH');
 const result=b405AuditReal180SourceSession(data);
 for(const file of ['B337_START.png','B337_END.png','B405_MID.png','B405_TIME_UP.png']){
  const bytes=readFileSync(join(folder,file));
  need(bytes.length>20000&&bytes.readUInt32BE(16)===1600&&
   bytes.readUInt32BE(20)===900,'REAL_CHROMIUM_FRAME_'+file);
 }
 writeFileSync(join(folder,'b405-independent-verdict.json'),
  JSON.stringify(result,null,2)+'\n');
 console.log('B405_INDEPENDENT_SAME_REAL_180S_SOURCE_GAME_VERDICT',
  JSON.stringify(result));
}
