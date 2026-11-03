import test from 'node:test';
import assert from 'node:assert/strict';
import {b412AuditNativeActualOriginalInkSwim}
 from './t21-b412-native-original-squid-ink-swim.mjs';
const b410={
 verdict:'PASS_ACTUAL_ORIGINAL_RAMP_UPPER_KCC_AND_THREE_LATE_NATIVE_SHOOT_WAVES',
 originalRoundTimeUpTick:11855,genuineDistinctOriginalHumanPaintSurfaces:4
};
const b411={
 verdict:'PASS_UNOBSTRUCTED_REAL_ORIGINAL_180S_GAMEPLAY_AND_POST_TIME_UP_REPLAY',
 realGameTimeUpTick:11855
};
function witness(){
 const mk=(direction,code,from,to,inkRelation,locomotion,fromTick)=>({
  direction,code,from,to,inkRelation,locomotion,fromTick,toTick:fromTick+8,
  planarMeters:Math.hypot(to[0]-from[0],to[2]-from[2]),
  mode:'SQUID',originalFoot:'UndertowT21D:right-low-team-a',
  originalSupport:true,genuineGap:.04,humanShots:50,cpuRejoined:7
 });
 const p=[11,5.39,46],q=[11,5.39,46.4],r=[11,5.39,46.8],
 t=[11,5.39,46.2];
 const legs=[
  mk('TOWARD_REAL_120S_PAINT','KeyW',p,q,'NEUTRAL','SQUID_DRY',95),
  mk('TOWARD_REAL_120S_PAINT','KeyW',q,r,'OWN','SWIM_GROUND',103),
  mk('RETURN_TO_ACTUAL_UPPER_BODY','KeyS',r,t,'NEUTRAL','SQUID_DRY',111)
 ];
 return {schema:'B412_TRUE_NATIVE_SQUID_OWN_INK_ON_ORIGINAL_UPPER',
  source:'25/17/26/0',nativeCDP:true,syntheticPlayerMoves:false,
  syntheticTickWrites:false,syntheticInkWrites:false,sourceScoreable:0,
  officialWinner:'NONE',remaining:90,
  originalFoot:'UndertowT21D:right-low-team-a',target:[11,4.5,47],
  initial:{tick:90,body:p,mode:'HUMAN',ink:'NEUTRAL',humanShots:50,cpuRejoined:7},
  actualSqModeTick:95,swimObserved:true,legs,
  totalRealKccMeters:1.4,
  final:{tick:125,body:t,mode:'HUMAN',locomotion:'HUMAN',
   humanShots:50,cpuRejoined:7,
   originalFoot:'UndertowT21D:right-low-team-a',netReturnMeters:.2}
 };
}
test('true original OWN ink > Squid SWIM_GROUND > original HUMAN return',()=>{
 const a=b412AuditNativeActualOriginalInkSwim(witness(),b410,b411);
 assert.equal(a.verdict,'PASS_REAL_OWN_INK_SWIM_AND_HUMAN_REENTRY_IN_180S_SOURCE_MATCH');
 assert.equal(a.actualOwnInkSwimLegs,1);
 assert.equal(a.originalScoreable,0);
 assert.equal(a.formal4v4Certified,false);
});
test('reject unproven ink, physical foot, virtual time or fabricated shots',()=>{
 const edits=[
  w=>{w.swimObserved=false;},
  w=>{w.legs[1].inkRelation='NEUTRAL';},
  w=>{w.legs[1].locomotion='SQUID_DRY';},
  w=>{w.legs[1].originalSupport=false;},
  w=>{w.legs[0].genuineGap=.5;},
  w=>{w.legs[1].humanShots=51;},
  w=>{w.legs[2].mode='HUMAN';},
  w=>{w.legs[0].fromTick=20;},
  w=>{w.legs[2].planarMeters=9;},
  w=>{w.legs[2].originalFoot='FAKE';},
  w=>{w.initial.mode='SQUID';},
  w=>{w.final.mode='SQUID';},
  w=>{w.final.netReturnMeters=3;},
  w=>{w.syntheticPlayerMoves=true;},
  w=>{w.sourceScoreable=1;},
  w=>{w.officialWinner='TEAM_A';}
 ];
 for(const edit of edits){
  const w=witness();edit(w);
  assert.throws(()=>b412AuditNativeActualOriginalInkSwim(w,b410,b411),
   /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_/);
 }
});
test('B410 and B411 must be from same genuinely ended native game',()=>{
 assert.throws(()=>b412AuditNativeActualOriginalInkSwim(witness(),
  {...b410,originalRoundTimeUpTick:11856},b411),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_/);
});
