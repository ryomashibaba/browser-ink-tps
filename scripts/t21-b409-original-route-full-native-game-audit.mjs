#!/usr/bin/env node
/** B409: independent intersection of ORIGINAL high->lower->ramp->upper human
 * route, THREE native ownerGrid paint surfaces, same real CPU7 and 180s clock.
 * Never promotes an invented floor/Scoreable, HP/kill or opponent route. */
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditB316RealMovement} from './t21-b316-native-human-ramp-walk.mjs';
import {verifyB315TrueThreeSourceHumanPaint}
 from './t21-b315-verify-native-three-surface-ink.mjs';
import {b322AuditNativeOriginalCrestExit}
 from './t21-b322-original-ramp-crest.mjs';
import {b324AuditGenuineUpperFloor}
 from './t21-b324-original-upper-floor-continuation.mjs';
import {b326AuditExtendedUpperFloor}
 from './t21-b326-extended-original-upper-floor.mjs';
const fail=why=>{throw Error('B409_REAL_ONE_GAME_SOURCE_ROUTE_HOLD_'+why);};
const requireTrue=(value,reason)=>{if(!value)fail(reason);};
const valid3=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const labels=['AFTER_ROUTE','150','120','90','60','30','0'];
const roster=['A1','A2','A3','B1','B2','B3','B4'];
const SOURCE='25/17/26/0';
const UPPER='UndertowT21D:right-low-team-a';
export function auditB409OneRealOriginalSourceRound(round,evidence,validators={}){
 const b316=(validators.b316||auditB316RealMovement)({
  first:evidence?.b316?.first,steps:evidence?.b316?.steps,
 });
 const b315=(validators.b315||verifyB315TrueThreeSourceHumanPaint)(evidence?.b312);
 const b322=(validators.b322||b322AuditNativeOriginalCrestExit)(evidence?.b322);
 const b324=(validators.b324||b324AuditGenuineUpperFloor)(
  evidence?.b322,evidence?.b324);
 const b326=(validators.b326||b326AuditExtendedUpperFloor)(
  evidence?.b322,evidence?.b324,evidence?.b326);
 requireTrue(
  b316.verdict==='GENUINE_ORIGINAL_RAMP_HUMAN_WALK_PASS'&&
  b316.reachedOriginalRampOnGenuineCharacterKcc===true&&
  b315.verdict==='PASS_AUTHENTIC_THREE_DISTINCT_HUMAN_SOURCE_PAINT_SURFACES'&&
  b322.verdict==='PASS_REAL_ORIGINAL_RAMP_TO_UPPER_FLOOR'&&
  b322.originalUpperFloorReached===true&&
  b324.verdict==='PASS_GENUINE_ORIGINAL_UPPER_FLOOR_CONTINUOUS_KCC'&&
  b324.continuousUpperFloor===true&&
  b326.verdict==='PASS_GENUINE_EXTENDED_ORIGINAL_UPPER_FLOOR_KCC'&&
  b326.extendedUpperFloorProven===true&&
  b326.combinedVerifiedUpperFloorMeters>=5,
  'GROUNDED_PHYSICAL_ROUTE_AND_THREE_NATIVE_PAINTS_NOT_PROVEN');
 requireTrue(round?.schema==='B409_GENUINE_B322_ROUTE_AND_FULL_180S_ONE_SOURCE_GAME'&&
  round.source===SOURCE&&round.nativeKeyboardMouse===true&&
  round.sameBrowserWorld===true&&round.syntheticTicks===false&&
  round.syntheticPlayerOrCpuMoves===false&&round.syntheticPaintOrScore===false&&
  round.originalSourceStageModified===false&&
  round.officialWinner==='NONE'&&
  Array.isArray(round.samples)&&round.samples.length===7&&
  round.samples.every((r,i)=>r.label===labels[i]),
  'SOURCE_SCOPE_AND_SEVEN_SAME_WORLD_MARKERS');
 let prev=null;
 for(let i=0;i<7;i++){
  const s=round.samples[i],last=i===6;
  requireTrue(integer(s.tick)&&s.tick>0&&valid3(s.player)&&
   Number.isFinite(s.secondsRemaining)&&s.secondsRemaining>=0&&
   s.secondsRemaining<=180&&
   Number.isFinite(s.browserWorldOrigin)&&s.browserWorldOrigin>0&&
   s.browserWorldOrigin===round.samples[0].browserWorldOrigin&&
   s.originalSourceSolids===25&&s.originalPaintSurfaces===17&&
   s.originalSourceNavigationLinks===26&&s.scoreable===0&&
   s.productionAuthorized===false&&s.unrestricted4v4Certified===false&&
   s.turfResult==='UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED'&&
   s.stopReason===null&&s.cpuRelocations===0&&
   s.cpuRejoined===7&&Array.isArray(s.cpu)&&s.cpu.length===7&&
   new Set(s.cpu.map(c=>c.id)).size===7&&
   roster.every(id=>s.cpu.some(c=>c.id===id))&&
   s.cpu.every(c=>valid3(c.foot)&&integer(c.hp)&&c.hp<=100&&
    ['ACTIVE','SPLATTED'].includes(c.lifeState))&&
   integer(s.humanShots)&&integer(s.humanPaintCells)&&
   integer(s.cpuSourceShots)&&integer(s.cpuPaintCells)&&
   integer(s.humanCpuDirectHits)&&integer(s.humanCpuDirectSplats),
   'REAL_NATIVE_SOURCE_SAMPLE_'+s.label);
  if(!last){
   requireTrue(s.matchState==='PLAYING'&&s.paused===false&&
    s.pointerLocked===true&&s.genuineOriginalFoot?.supported===true&&
    s.genuineOriginalFoot.solid===UPPER&&
    Number.isFinite(s.genuineOriginalFoot.gap)&&
    s.genuineOriginalFoot.gap>=0&&s.genuineOriginalFoot.gap<=.4,
    'SUPPORTED_ORIGINAL_UPPER_FLOOR_'+s.label);
  }else{
   requireTrue(s.matchState==='TIME_UP'&&s.paused===true&&
    s.pointerLocked===false&&s.secondsRemaining===0&&s.tick>=10800,
    'ACTUAL_SOURCE_180S_TIME_UP');
  }
  if(i===0)requireTrue(s.secondsRemaining>150&&s.secondsRemaining<180,
    'ROUTE_MUST_COMPLETE_BEFORE_150S_MARK');
  else{
   const target=Number(labels[i]);
   requireTrue(s.tick>prev.tick&&s.secondsRemaining<prev.secondsRemaining&&
    s.secondsRemaining<=target+.001&&
    s.humanShots>=prev.humanShots&&
    s.humanPaintCells>=prev.humanPaintCells&&
    s.cpuSourceShots>=prev.cpuSourceShots&&
    s.cpuPaintCells>=prev.cpuPaintCells&&
    s.humanCpuDirectHits>=prev.humanCpuDirectHits&&
    s.humanCpuDirectSplats>=prev.humanCpuDirectSplats,
    'SAME_WORLD_NATIVE_CLOCK_AND_COMBAT_MONOTONIC_'+s.label);
  }
  prev=s;
 }
 const first=round.samples[0],end=round.samples.at(-1);
 requireTrue(first.tick>evidence.b326.steps.at(-1).after.tick &&
  round.samples[0].humanPaintCells>0&&
  first.humanShots>0&&
  end.cpuPaintCells>0&&end.cpuSourceShots>0,
  'NO_TRUE_PLAYED_ORIGINAL_ROUTE_OR_CPU_INK');
 return {
  schema:'B409_INDEPENDENT_GENUINE_ONE_NATIVE_ROUTE_AND_180S',
  verdict:'PASS_ONE_REAL_180S_7CPU_WITH_ORIGINAL_RAMP_UPPER_ROUTE_AND_3_HUMAN_PAINT_SURFACES',
  source:SOURCE,route:{b316RealRamp:true,b322RealCrestToUpper:true,
    b324ContinuousUpper:true,b326ExtendedUpperMeters:
     b326.combinedVerifiedUpperFloorMeters,
    b315RealDistinctHumanPaintSurfaces:3},
  actualTimeUpTick:end.tick,actualHumanShots:end.humanShots,
  actualHumanChangedCells:end.humanPaintCells,
  actualCpuSourceShots:end.cpuSourceShots,
  actualCpuOriginalChangedCells:end.cpuPaintCells,
  actualHumanEnemyHitsObserved:end.humanCpuDirectHits,
  actualHumanEnemySplatsObserved:end.humanCpuDirectSplats,
  naturalCrossBankRouteCertified:false,
  actualHumanEnemyKillRespawnChainCertified:false,
  originalScoreable:0,officialWinner:'NONE',
  unrestricted4v4Certified:false,artAccepted:false,
  productionAuthorized:false
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const folder=process.argv[2];requireTrue(typeof folder==='string',
  'REAL_EVIDENCE_FOLDER_REQUIRED');
 const names={
  b316:'b316-genuine-original-human-ramp-walk.json',
  b312:'b312-real-original-lower-second-ink.json',
  b322:'b322-actual-original-ramp-crest.json',
  b324:'b324-real-original-upper-floor.json',
  b326:'b326-extended-original-upper-floor.json'
 };
 const evidence=Object.fromEntries(Object.entries(names).map(([k,p])=>[
  k,JSON.parse(readFileSync(join(folder,p),'utf8'))
 ]));
 const round=JSON.parse(readFileSync(join(folder,'b409-one-original-route-180s.json'),'utf8'));
 const result=auditB409OneRealOriginalSourceRound(round,evidence);
 for(const p of ['B409_REAL_ROUTE_MID.png','B409_REAL_ROUTE_TIME_UP.png']){
  const bytes=readFileSync(join(folder,p));
  requireTrue(bytes.length>20000&&bytes.readUInt32BE(16)===1600&&
   bytes.readUInt32BE(20)===900,'GENUINE_CHROMIUM_FRAME_'+p);
 }
 writeFileSync(join(folder,'b409-independent-one-original-route-and-180s.json'),
  JSON.stringify(result,null,2)+'\n');
 console.log('B409_INDEPENDENT_ONE_GENUINE_ORIGINAL_ROUTE_SOURCE_ROUND',
  JSON.stringify(result));
}
