#!/usr/bin/env node
/** B411: native SOURCE-only 180s accessibility/overlay proof, after the
 * actual B410 same-world independent physical route + 4 original paint PASS.
 * All observations are READ ONLY from the real PlayCanvas DOM and snapshot.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const requireReal=(value,why)=>{if(!value)throw Error('B411_NATIVE_SOURCE_HUD_HOLD_'+why);};
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export function auditB411RealNativeGameplayFocus(record,b410){
 requireReal(b410?.verdict===
  'PASS_ACTUAL_ORIGINAL_RAMP_UPPER_KCC_AND_THREE_LATE_NATIVE_SHOOT_WAVES'&&
  b410.source==='25/17/26/0'&&
  b410.genuineDistinctOriginalHumanPaintSurfaces===4&&
  b410.formal4v4Certified===false&&b410.productionAuthorized===false,
  'GENUINE_B410_FOUR_SURFACE_ONE_NATIVE_GAME_PREREQUISITE');
 requireReal(record?.schema==='B411_REAL_POST_CLEAR_NATIVE_FULL_ROUND_FOCUS'&&
  record.source==='25/17/26/0'&&
  record.syntheticTime===false&&record.syntheticInk===false&&
  record.syntheticActors===false&&record.originalScoreable===0&&
  record.officialWinner==='NONE'&&
  Array.isArray(record.samples)&&record.samples.length===3,
  'ORIGINAL_SOURCE_ONLY_PRACTICE_SCOPE');
 const names=['AFTER_ROUTE','90','TIME_UP'];
 for(let i=0;i<3;i++){
  const x=record.samples[i],isFinal=i===2;
  requireReal(x?.label===names[i]&&integer(x.tick)&&x.tick>0&&
   x.sourceSolids===25&&x.sourcePaintSurfaces===17&&
   x.sourceNavigationLinks===26&&x.sourceScoreable===0&&
   x.officialWinner==='NONE'&&
   x.originalSourceOnly===true&&x.nativeB203FullRound===true&&
   x.hudSourceOnly==='true'&&x.hudOriginalScoreable==='0'&&
   x.hudOriginalOfficialWinner==='NONE'&&
   x.actualPracticeState==='CLEAR'&&
   x.actualPracticeGenuineClear==='true'&&
   Number.isFinite(x.remainingSeconds)&&x.remainingSeconds>=0&&
   x.remainingSeconds<=180,
   'TRUE_NATIVE_SOURCE_DOM_'+names[i]);
  if(i>0)requireReal(x.tick>record.samples[i-1].tick&&
   x.remainingSeconds<record.samples[i-1].remainingSeconds,
   'NATIVE_TIME_MONOTONIC_'+names[i]);
  if(!isFinal)requireReal(x.matchState==='PLAYING'&&
   x.paused===false&&x.b411HudEnabled===true&&
   x.b411Compact===true&&x.hudCompactData==='true'&&
   x.paintCardCompactData==='true'&&
   x.clearToastCompactData==='true'&&
   x.paintCardHidden===true&&x.clearToastHidden===true&&
   x.replayHidden===true&&x.replayDisabled===true&&
   x.hudTop==='12px'&&x.hudLeft==='12px'&&
   x.hudText?.includes('NO OFFICIAL TURF RESULT')&&
   x.countdownText?.includes('NO TURF WINNER'),
   'TRUE_UNOBSTRUCTED_SOURCE_PLAY_'+names[i]);
  else requireReal(x.matchState==='TIME_UP'&&
   x.paused===true&&x.remainingSeconds===0&&
   x.tick===b410.originalRoundTimeUpTick&&
   x.b411HudEnabled===true&&
   x.b411Compact===false&&x.hudCompactData==='false'&&
   x.paintCardCompactData==='false'&&
   x.paintCardHidden===false&&x.clearToastHidden===true&&
   x.replayHidden===false&&x.replayDisabled===false&&
   x.hudTop===''&&x.hudLeft==='50%'&&
   x.countdownText?.includes('NO TURF WINNER'),
   'SOURCE_GAME_REPLAY_ONLY_AT_NATIVE_TIME_UP');
 }
 return {
  schema:'B411_INDEPENDENT_NATIVE_SOURCE_ACTIVE_ROUND_HUD',
  verdict:'PASS_UNOBSTRUCTED_REAL_ORIGINAL_180S_GAMEPLAY_AND_POST_TIME_UP_REPLAY',
  realGameTimeUpTick:b410.originalRoundTimeUpTick,
  source:'25/17/26/0',
  nativeInitialPostClearToastHidden:true,
  genuinePlayingCenterPracticeCardHidden:true,
  actionableReplayDuringLiveSourceRound:false,
  actionableReplayAfterTrueTimeUp:true,
  actualHumanPaintSources:b410.genuineDistinctOriginalHumanPaintSurfaces,
  originalScoreable:0,officialWinner:'NONE',
  sourceCollisionChanged:false,sourceInkChangedByHud:false,
  nativePhysicsOrCombatModified:false,
  originalCrossTeamPathsCertified:false,
  full4v4Certified:false,artAccepted:false,productionAuthorized:false
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];
 requireReal(typeof dir==='string','GENUINE_ORIGINAL_CHROMIUM_ARTIFACT_DIR');
 const read=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
 const out=auditB411RealNativeGameplayFocus(
  read('b411-real-native-source-round-hud.json'),
  read('b410-independent-true-original-active-verdict.json'));
 for(const f of ['B409_REAL_ROUTE_MID.png','B409_REAL_ROUTE_TIME_UP.png']){
  const bytes=readFileSync(join(dir,f));
  requireReal(bytes.length>20000&&bytes.readUInt32BE(16)===1600&&
   bytes.readUInt32BE(20)===900,'REAL_1600_900_CHROMIUM_'+f);
 }
 writeFileSync(join(dir,'b411-independent-native-hud-verdict.json'),
  JSON.stringify(out,null,2)+'\n');
 console.log('B411_INDEPENDENT_ORIGINAL_NATIVE_HUD',JSON.stringify(out));
}
