import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB411RealNativeGameplayFocus as audit}
 from './t21-b411-native-active-round-hud-audit.mjs';
const b410={
 verdict:'PASS_ACTUAL_ORIGINAL_RAMP_UPPER_KCC_AND_THREE_LATE_NATIVE_SHOOT_WAVES',
 source:'25/17/26/0',genuineDistinctOriginalHumanPaintSurfaces:4,
 originalRoundTimeUpTick:11858,formal4v4Certified:false,productionAuthorized:false
};
function fixture(){
 const make=(label,tick,time,last=false)=>({
  label,tick,remainingSeconds:time,matchState:last?'TIME_UP':'PLAYING',
  paused:last,sourceSolids:25,sourcePaintSurfaces:17,sourceNavigationLinks:26,
  sourceScoreable:0,officialWinner:'NONE',originalSourceOnly:true,
  nativeB203FullRound:true,hudSourceOnly:'true',
  hudOriginalScoreable:'0',hudOriginalOfficialWinner:'NONE',
  actualPracticeState:'CLEAR',actualPracticeGenuineClear:'true',
  b411HudEnabled:true,b411Compact:!last,hudCompactData:String(!last),
  paintCardCompactData:String(!last),clearToastCompactData:String(!last),
  paintCardHidden:!last,clearToastHidden:true,
  replayHidden:!last,replayDisabled:!last,
  hudTop:last?'':'12px',hudLeft:last?'50%':'12px',
  hudText:last?'REPLAY REAL SOURCE WORLD':'180s MATCH CONTINUES · NO OFFICIAL TURF RESULT',
  countdownText:time+'s LEFT · REAL 180s ROUND · NO TURF WINNER'
 });
 return {schema:'B411_REAL_POST_CLEAR_NATIVE_FULL_ROUND_FOCUS',
  source:'25/17/26/0',syntheticTime:false,syntheticInk:false,
  syntheticActors:false,originalScoreable:0,officialWinner:'NONE',
  samples:[make('AFTER_ROUTE',2300,160),make('90',6500,90),
   make('TIME_UP',11858,0,true)]};
}
test('true 180s SOURCE live compact -> genuine TIME_UP restores replay',()=>{
 const x=audit(fixture(),b410);
 assert.equal(x.verdict,'PASS_UNOBSTRUCTED_REAL_ORIGINAL_180S_GAMEPLAY_AND_POST_TIME_UP_REPLAY');
 assert.equal(x.actionableReplayDuringLiveSourceRound,false);
 assert.equal(x.actionableReplayAfterTrueTimeUp,true);
 assert.equal(x.full4v4Certified,false);
});
test('must not hide serious failures or fake SOURCE and replay',()=>{
 for(const change of [
  x=>x.samples[0].replayHidden=false,
  x=>x.samples[0].clearToastHidden=false,
  x=>x.samples[0].paintCardHidden=false,
  x=>x.samples[0].hudTop='',
  x=>x.samples[0].matchState='PAUSED',
  x=>x.samples[1].hudText='YOU WIN',
  x=>x.samples[1].sourceScoreable=1,
  x=>x.samples[2].replayDisabled=true,
  x=>x.samples[2].hudLeft='12px',
  x=>x.samples[2].tick=11859,
  x=>x.samples[2].clearToastHidden=false,
  x=>x.syntheticInk=true
 ]){
  const sample=fixture();change(sample);
  assert.throws(()=>audit(sample,b410),/B411_NATIVE_SOURCE_HUD_HOLD_/);
 }
});
test('B410 full original physical source proof remains prerequisite',()=>{
 for(const b of [{...b410,verdict:'HOLD'},
  {...b410,genuineDistinctOriginalHumanPaintSurfaces:3},
  {...b410,formal4v4Certified:true}]){
  assert.throws(()=>audit(fixture(),b),/B411_NATIVE_SOURCE_HUD_HOLD_/);
 }
});
