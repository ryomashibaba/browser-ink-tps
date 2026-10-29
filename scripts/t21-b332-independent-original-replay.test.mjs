import test from 'node:test';
import assert from 'node:assert/strict';
import {b332AuditTwoRealA1ClearAndReplay as audit}
 from './t21-b332-independent-original-replay.mjs';
function fixture(){
 function clear(n){
  return {schema:'B162_REAL_ORIGINAL_HUMAN_A1_NATIVE_COOP_V1',
   coopAttempt:n,realCDPMouseAndKeyboard:true,virtualTickInjection:false,
   syntheticInkOrFloor:false,productionAuthorized:false,
   unrestricted4v4Certified:false,officialWinner:'NONE',
   originalSource:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
   originalOpponentNaturalRoutes:'0/12',
   finalPractice:{status:'CLEAR',practiceVariant:'ALLY_SYNC',
    humanChangedImpactCells:821,realGroundedTravelMeters:35.5,
    actualOriginalA1ChangedImpactCells:44,
    actualOriginalA1TaggedImpactEvents:2},
   nativeTick:1750,realObservedSegments:[{real:true}]};
 }
 const first=clear(1),second=clear(2);
 const world=(via,previous,newTimeOrigin)=>({
  via,previousTimeOrigin:previous,newTimeOrigin,newWorldTick:0,
  staging:'STAGING',practiceStatus:'IDLE',cpuRejoinsAtBoot:0,
  actorTeleports:0
 });
 const replay={schema:'B200_REAL_CDP_FRESH_REPLAY_V1',
  sourceAuthority:'25/17/26/0',naturalOpponentPaths:'0/12',
  officialWinner:'NONE',syntheticInput:false,teleportedActors:false,
  firstClear:{tick:1800,human:821,grounded:35.5,a1:44},
  secondClear:{tick:1800,human:821,grounded:35.5,a1:44,impacts:2},
  cardReplay:world('REAL_CDP_MISSION_CARD_CLICK',100,200),
  hudReplay:world('REAL_CDP_TERMINAL_HUD_CLICK',200,300),
  keyboardReplay:world('REAL_CDP_KEY_R',300,400)};
 const arm=n=>({schema:'B206_REAL_PAUSED_ARMED_RESUME',
  coopAttempt:n,actualUserResumeButtonClick:true,
  originalNativePauseTick:1056,actualResumedTick:1062,
  nativeTicksFabricated:false,actorTeleports:0,
  sourceAuthority:'25/17/26/0',officialWinner:'NONE'});
 return {first,second,replay,arm1:arm(1),arm2:arm(2)};
}
const run=f=>audit(f.first,f.second,f.replay,f.arm1,f.arm2);
test('two genuine 180s A1 CLEARs plus 3 real world reloads',()=>{
 const r=run(fixture());
 assert.equal(r.actualNativeFreshWorlds,3);
 assert.equal(r.verdict,'PASS_TWO_TRUE_NATIVE_A1_CLEARS_THREE_FRESH_REPLAY_WORLDS');
 assert.equal(r.original4v4Certified,false);
});
test('second practice with no A1 impact stays HOLD',()=>{
 const f=fixture();f.second.finalPractice.actualOriginalA1TaggedImpactEvents=0;
 assert.throws(()=>run(f),/REAL_COOPERATIVE_CLEAR_2/);
});
test('replay report cannot invent second player/CPU ink',()=>{
 const f=fixture();f.replay.secondClear.a1+=1;
 assert.throws(()=>run(f),/SECOND_REAL_CLEAR_MATCH/);
});
test('button click must have actual tick advance for second round',()=>{
 const f=fixture();f.arm2.actualResumedTick=f.arm2.originalNativePauseTick;
 assert.throws(()=>run(f),/REAL_NATIVE_RESUME_BUTTON_2/);
});
test('not a new actual Chromium world: fake equal origin fails',()=>{
 const f=fixture();f.replay.hudReplay.newTimeOrigin=
  f.replay.hudReplay.previousTimeOrigin;
 assert.throws(()=>run(f),/FRESH_WORLD_REAL_CDP_TERMINAL_HUD_CLICK/);
});
test('world origin must increase across independent three reloads',()=>{
 const f=fixture();f.replay.keyboardReplay.previousTimeOrigin=1;
 assert.throws(()=>run(f),/FRESH_WORLD_ORIGIN_MONOTONIC_2/);
});
test('source authority and actor movement never promoted',()=>{
 const f=fixture();f.replay.naturalOpponentPaths='12/12';
 assert.throws(()=>run(f),/UNMODIFIED_ORIGINAL_B200_AUTHORITY/);
 const g=fixture();g.second.virtualTickInjection=true;
 assert.throws(()=>run(g),/REAL_COOPERATIVE_CLEAR_2/);
});
