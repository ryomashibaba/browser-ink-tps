#!/usr/bin/env node
/** T21 V28 QA #18: validate actual, unmodified B484 PLAYER or F8 QA HUD.
 * No synthetic click, mode switch, actor writes, clock or geometry changes.
 * A text/DOM PASS is only proof that genuine native C-order information
 * is communicated to the user; never proof of route or opponent HP. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const validTick=x=>Number.isSafeInteger(x)&&x>=0;
const validPositiveFinite=x=>Number.isFinite(x)&&x>=0;
export function validateB484ModeSpecificHud(x){
 const reasons=[];
 const mode=x?.presentation??null;
 const text=typeof x?.text==='string'?x.text:'';
 const nativeOk=validTick(x?.nativeTick)&&x.matchState==='PLAYING'&&
  x.paused===false&&x.nativeCpuRejoins===7&&x.sourceScoreable===0&&
  x.originalRouteClaim==='false'&&x.genuineRequests===2&&
  x.currentOrderKeyRequest===2&&
  validPositiveFinite(x.currentOrderClosestPhysicalGoalDistanceXZ??0);
 if(!nativeOk)reasons.push('NATIVE_B484_7CPU_SOURCE_STATE_UNVERIFIED');
 if(x?.playerVisible!==true)reasons.push('B141_ACTUAL_HUD_NOT_VISIBLE');
 if(!['PLAYER','QA'].includes(mode))reasons.push('UNKNOWN_B245_PRESENTATION_MODE');
 // The live B471 count comes from the unchanged native actor pipeline.
 // A DOM dataset is supplementary, never a replacement for B484 foot proof.
 const arrivals=typeof x?.actualOriginalArrivals==='string'&&
  /^\d+$/.test(x.actualOriginalArrivals)?
  Number(x.actualOriginalArrivals):null;
 if(!validTick(arrivals)||!validTick(x?.nativeOriginalArrivals)||
    arrivals!==x.nativeOriginalArrivals)
  reasons.push('NATIVE_B471_ARRIVAL_COUNTER_NOT_SAME_WORLD');
 if(mode==='PLAYER'){
  // Actual normal player HUD is designed to fit the reticle/viewport:
  // b141PlayerAllyHudLine, not the verbose QA proof string.
  if(!text.includes('A1 ALLY ·')||
     !text.includes('ROUTE UNVERIFIED')||
     !text.includes('C ORDER ·'))
   reasons.push('PLAYER_COMPACT_ALLY_C_ORDER_MISSING');
  if(text.includes('A1 C ORDER 2 ·')||
     text.includes('verified arrivals total ')||
     text.includes('this order closest '))
   reasons.push('PLAYER_VERBOSE_QA_TEXT_LEAKED');
 }else if(mode==='QA'){
  if(!text.includes('A1 C ORDER 2 ·')||
     !text.includes('verified arrivals total ')||
     !(
       text.includes('this order closest ')||
       text.includes('original goal pending / HOLD')
     )||!text.includes('route not certified'))
   reasons.push('QA_VERBOSE_NATIVE_C_ORDER_MISSING');
 }
 return {
  schema:'T21_V28_QA18_B484_REAL_HUD_GATE_V2',
  source:'25/17/26/0',
  sampledPresentation:mode,
  nativeTick:validTick(x?.nativeTick)?x.nativeTick:null,
  actualOriginalArrivals:arrivals,
  nativeOriginalArrivals:validTick(x?.nativeOriginalArrivals)?
   x.nativeOriginalArrivals:null,
  observedRealB141Text:text,
  holdReasons:reasons,
  verdict:reasons.length?'HOLD_REAL_NATIVE_HUD':
   mode==='PLAYER'?'PASS_LIMITED_REAL_PLAYER_COMPACT_HUD':
   'PASS_LIMITED_REAL_QA_DETAILED_HUD',
  nativeCKeyCountVerifiedByThisDomGate:false,
  fullOriginalA1RouteCertified:false,
  actorOrClockWrites:0,
  scoreablePromotions:0,
  enemyHpHitSplatRespawnCertified:false,
  formal4v4Certified:false
 };
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const f=process.argv[2];
 if(!f){console.error('USAGE: node scripts/t21-v28-qa-b484-hud-gate.mjs <real-hud-raw.json>');process.exitCode=2;}
 else{
  try{
   const x=validateB484ModeSpecificHud(JSON.parse(readFileSync(resolve(f),'utf8')));
   console.log(JSON.stringify(x,null,2));if(x.holdReasons.length)process.exitCode=1;
  }catch(e){console.error(String(e));process.exitCode=2;}
 }
}
