#!/usr/bin/env node
/** B419: actual first 180s + real UI replay + second native shot.
 * Read only evidence. Never upgrade Source-only play to Turf scoring. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const gate=(v,c)=>{if(!v)throw Error('B419_REAL_NATIVE_REPLAY_HOLD_'+c)};
const proper=(n,phase)=>n?.source==='25/17/26/0'&&
 n.phase===phase&&n.scoreable===0&&n.winner==='NONE'&&
 n.relocations===0&&n.prod===false&&n.fourvfour===false&&
 n.cpuCount===7&&Number.isSafeInteger(n.tick)&&n.tick>=0;
export function auditB419NativeReplay(d){
 gate(d?.schema==='B419_REAL_NATIVE_ENDSCREEN_TWO_WORLDS'&&
  d.clicked===true&&d.syntheticTicks===false&&
  d.actorWrites===0&&d.scoreWrites===0&&
  d.pointerLockReleased===true&&
  ['CDP_ESCAPE','BROWSER_EXIT_POINTER_LOCK','ALREADY_UNLOCKED'].includes(
   d.pointerExitMethod)&&
  (d.pointerExitMethod==='ALREADY_UNLOCKED'||d.realEscapeInputSent===true),
  'PROVENANCE');
 const {old,boot,armed,started,fired}=d;
 gate(proper(old,'TIME_UP')&&old.tick>=10800&&old.remaining===0&&
  old.rejoins===7&&old.shots>0&&
  ['CLEAR','TIME_UP'].includes(old.mission)&&
  old.replayVisible&&old.origin>0,'FIRST_REAL_180S');
 gate(proper(boot,'STAGING')&&boot.tick===0&&
  boot.origin>old.origin&&boot.rejoins===0&&boot.shots===0&&
  boot.mission==='IDLE'&&boot.hp===100&&boot.ink===100&&
  boot.remaining===180&&boot.pageReady&&
  boot.url==='?t21Play=preview&t21QaDrive=source&'+
   't21W10B183=firstDropPlay&t21W10B193=allyCoop&'+
   't21W10B203=fullRound','FRESH_NATIVE_SOURCE');
 gate(proper(armed,'STAGING')&&armed.origin===boot.origin&&
  armed.tick===0&&armed.mission==='ARMED'&&armed.shots===0,
  'REAL_MISSION_ARM');
 gate(proper(started,'PLAYING')&&started.origin===boot.origin&&
  started.tick>=30&&started.tick<old.tick&&
  started.remaining<180&&started.remaining>0&&
  started.paused===false&&started.mission==='RUNNING',
  'REAL_NEW_180S_RUNNING');
 gate(proper(fired,'PLAYING')&&fired.origin===boot.origin&&
  fired.tick>started.tick&&fired.paused===false&&
  fired.mission==='RUNNING'&&fired.shots>started.shots&&
  fired.ink<started.ink&&fired.ink>=0,'REAL_SECOND_SHOT_AND_INK');
 return {schema:'B419_INDEPENDENT_REAL_BROWSER_REPLAY',
  verdict:'PASS_REAL_180S_TO_NATIVE_FRESH_SECOND_ROUND_SHOT',
  originalTimeUpTick:old.tick,
  browserPointerExitMethod:d.pointerExitMethod,
  firstBrowserTimeOrigin:old.origin,
  secondBrowserTimeOrigin:boot.origin,
  secondMatchShotTick:fired.tick,
  secondRealShots:fired.shots-started.shots,
  secondActualInkConsumed:started.ink-fired.ink,
  nativeCpuCount:7,originalSource:'25/17/26/0',
  officialScoreable:0,officialWinner:'NONE',
  fullSecondMatch180s:false,
  naturalEnemyHitCertified:false,naturalEnemyRouteCertified:false,
  full4v4Certified:false,artAccepted:false,productionAuthorized:false,
  gameplayWrites:0};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const file=process.argv[2];gate(file?.endsWith('.json'),'FILE');
 const v=auditB419NativeReplay(JSON.parse(readFileSync(file,'utf8')));
 writeFileSync(resolve(file,'..','b419-independent-native-replay-verdict.json'),
  JSON.stringify(v,null,2)+'\n');
 console.log('B419_REAL_BROWSER_REPLAY_INDEPENDENT',JSON.stringify(v));
}
