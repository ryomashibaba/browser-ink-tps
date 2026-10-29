#!/usr/bin/env node
/** B332: independent read-only proof for two real 180s A1 cooperative
 * clears, actual 2nd resume, and THREE fresh-world replay interactions.
 * No game mutation, synthetic input, source stage authorization or 4v4.
 */
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const gate=(ok,reason)=>{if(!ok)throw Error('B332_INDEPENDENT_'+reason);};
const realNum=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const realInt=v=>Number.isSafeInteger(v)&&v>=0;
const clear=(p,index)=>{
 gate(p?.schema==='B162_REAL_ORIGINAL_HUMAN_A1_NATIVE_COOP_V1'&&
  p.coopAttempt===index&&p.realCDPMouseAndKeyboard===true&&
  p.virtualTickInjection===false&&p.syntheticInkOrFloor===false&&
  p.productionAuthorized===false&&p.unrestricted4v4Certified===false&&
  p.officialWinner==='NONE'&&
  p.originalSource==='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'&&
  p.originalOpponentNaturalRoutes==='0/12'&&
  p.finalPractice?.status==='CLEAR'&&
  p.finalPractice?.practiceVariant==='ALLY_SYNC'&&
  realInt(p.finalPractice.humanChangedImpactCells)&&
  p.finalPractice.humanChangedImpactCells>=180&&
  realNum(p.finalPractice.realGroundedTravelMeters)&&
  p.finalPractice.realGroundedTravelMeters>=12&&
  realInt(p.finalPractice.actualOriginalA1ChangedImpactCells)&&
  p.finalPractice.actualOriginalA1ChangedImpactCells>=30&&
  realInt(p.finalPractice.actualOriginalA1TaggedImpactEvents)&&
  p.finalPractice.actualOriginalA1TaggedImpactEvents>=1&&
  realInt(p.nativeTick)&&p.nativeTick>0&&
  Array.isArray(p.realObservedSegments)&&p.realObservedSegments.length>0,
  'REAL_COOPERATIVE_CLEAR_'+index);
 return {
  tick:p.nativeTick,
  human:p.finalPractice.humanChangedImpactCells,
  grounded:p.finalPractice.realGroundedTravelMeters,
  a1:p.finalPractice.actualOriginalA1ChangedImpactCells,
  impacts:p.finalPractice.actualOriginalA1TaggedImpactEvents
 };
};
const reset=(v,via)=>{
 gate(v?.via===via&&realNum(v.previousTimeOrigin)&&
  realNum(v.newTimeOrigin)&&
  v.newTimeOrigin>v.previousTimeOrigin&&
  realInt(v.newWorldTick)&&
  v.staging==='STAGING'&&v.practiceStatus==='IDLE'&&
  v.cpuRejoinsAtBoot===0&&v.actorTeleports===0,
  'FRESH_WORLD_'+via);
 return {via,previousTimeOrigin:v.previousTimeOrigin,
  newTimeOrigin:v.newTimeOrigin,
  bootTick:v.newWorldTick};
};
export function b332AuditTwoRealA1ClearAndReplay(
 first,second,replay,arm1,arm2
){
 const a=clear(first,1),b=clear(second,2);
 gate(replay?.schema==='B200_REAL_CDP_FRESH_REPLAY_V1'&&
  replay.sourceAuthority==='25/17/26/0'&&
  replay.naturalOpponentPaths==='0/12'&&
  replay.officialWinner==='NONE'&&
  replay.syntheticInput===false&&replay.teleportedActors===false,
  'UNMODIFIED_ORIGINAL_B200_AUTHORITY');
 gate(realInt(replay.firstClear?.tick)&&
  replay.firstClear.tick>=a.tick&&
  replay.firstClear.human===a.human&&
  replay.firstClear.a1===a.a1&&
  replay.firstClear.grounded===a.grounded,
  'FIRST_REAL_CLEAR_MATCH');
 gate(realInt(replay.secondClear?.tick)&&
  replay.secondClear.tick>=b.tick&&
  replay.secondClear.human===b.human&&
  replay.secondClear.a1===b.a1&&
  replay.secondClear.grounded===b.grounded&&
  replay.secondClear.impacts===b.impacts,
  'SECOND_REAL_CLEAR_MATCH');
 const steps=[
  reset(replay.cardReplay,'REAL_CDP_MISSION_CARD_CLICK'),
  reset(replay.hudReplay,'REAL_CDP_TERMINAL_HUD_CLICK'),
  reset(replay.keyboardReplay,'REAL_CDP_KEY_R')
 ];
 for(let i=1;i<steps.length;i++)
  gate(steps[i].previousTimeOrigin>=steps[i-1].newTimeOrigin,
    'FRESH_WORLD_ORIGIN_MONOTONIC_'+i);
 const arm=(p,index)=>gate(
  p?.schema==='B206_REAL_PAUSED_ARMED_RESUME'&&
  p.coopAttempt===index&&
  p.actualUserResumeButtonClick===true&&
  realInt(p.originalNativePauseTick)&&realInt(p.actualResumedTick)&&
  p.actualResumedTick>p.originalNativePauseTick&&
  p.nativeTicksFabricated===false&&p.actorTeleports===0&&
  p.sourceAuthority==='25/17/26/0'&&
  p.officialWinner==='NONE','REAL_NATIVE_RESUME_BUTTON_'+index);
 arm(arm1,1);arm(arm2,2);
 return {schema:'B332_INDEPENDENT_TWO_REAL_A1_CLEARS_AND_THREE_REPLAYS',
  verdict:'PASS_TWO_TRUE_NATIVE_A1_CLEARS_THREE_FRESH_REPLAY_WORLDS',
  source:'25/17/26/0',firstClear:a,secondClear:b,
  nativeReplayWorlds:steps,
  realSecondResumeButtonVerified:true,
  actualNativeFreshWorlds:3,
  sourceOriginalFloorOrNavPromoted:false,
  nativeCrossTeamRoutesCertified:'0/12',
  officialWinner:'NONE',original4v4Certified:false,
  artAccepted:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];
 gate(typeof dir==='string'&&dir.length>0,'EVIDENCE_DIRECTORY_REQUIRED');
 const read=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
 const r=b332AuditTwoRealA1ClearAndReplay(
  read('w10b162-real-ally-sync-practice.json'),
  read('w10b200-second-real-ally-sync-practice.json'),
  read('w10b200-real-replay.json'),
  read('w10b206-real-armed-resume.json'),
  read('w10b330-second-real-armed-resume.json'));
 for(const name of ['W10B162_GENUINE_ORIGINAL_COOPERATIVE_CLEAR.png',
  'W10B200_SECOND_GENUINE_ORIGINAL_COOPERATIVE_CLEAR.png']){
  gate(statSync(join(dir,name)).size>=20000,
   'ORIGINAL_CHROMIUM_SCREENSHOT_'+name);
 }
 writeFileSync(join(dir,'b332-independent-real-replay-verdict.json'),
  JSON.stringify(r,null,2));
 console.log('B332_TWO_REAL_A1_CLEAR_AND_REPLAYS',JSON.stringify({
  verdict:r.verdict,worlds:r.actualNativeFreshWorlds,
  secondResume:r.realSecondResumeButtonVerified}));
}
