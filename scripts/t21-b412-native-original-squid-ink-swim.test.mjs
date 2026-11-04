import test from 'node:test';
import assert from 'node:assert/strict';
import {b412AuditNativeActualOriginalInkSwim,b412NativeReturnReady,
 b412NativeReturnSteerKey}
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
  returnForwardWDelta:[q[0]-p[0],q[2]-p[2]],
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
  w=>{w.returnForwardWDelta=[1,0];},
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
test('RAW #41798862838 missed the same original floor by lateral drift: choose native KeyA',()=>{
 const original=[11.212295532226562,5.394896507263184,46.485633850097656];
 const closest=[11.645665168762207,5.394955158233643,47.38397216796875];
 const secondW=[1.178714752197266,-.399860382080078];
 assert.equal(b412NativeReturnReady(closest,original),false);
 assert.ok(Math.hypot(closest[0]-original[0],closest[2]-original[2])>.95);
 assert.equal(b412NativeReturnSteerKey(closest,original,secondW),'KeyA');
 assert.throws(()=>b412NativeReturnSteerKey(closest,original,[0,0]),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_/);
});
test('independent audit accepts only genuine KCC source-supported perpendicular return correction',()=>{
 const w=witness();
 const last=w.legs.at(-1);
 last.to=[11.3,5.39,46.2];
 last.planarMeters=Math.hypot(last.to[0]-last.from[0],last.to[2]-last.from[2]);
 w.legs.push({...last,direction:'REAL_NATIVE_RETURN_STEER',
  code:'KeyD',from:last.to,to:[11,5.39,46.2],
  fromTick:last.toTick,toTick:last.toTick+3,planarMeters:.3});
 w.totalRealKccMeters=w.legs.reduce((sum,x)=>sum+x.planarMeters,0);
 w.final.body=[11,5.39,46.2];
 w.final.tick=w.legs.at(-1).toTick+6;
 assert.equal(b412NativeReturnSteerKey(last.to,w.initial.body,
  w.returnForwardWDelta),'KeyD');
 assert.equal(b412AuditNativeActualOriginalInkSwim(w,b410,b411).
  originalScoreable,0);
 w.legs.at(-1).code='KeyA';
 assert.throws(()=>b412AuditNativeActualOriginalInkSwim(w,b410,b411),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_/);
});
test('B410 and B411 must be from same genuinely ended native game',()=>{
 assert.throws(()=>b412AuditNativeActualOriginalInkSwim(witness(),
  {...b410,originalRoundTimeUpTick:11856},b411),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_/);
});

test('real RETURN uses smaller native KCC input WITHOUT weakening original support',()=>{
 const w=witness();
 const last=w.legs[2];
 last.toTick=last.fromTick+3;
 w.final.tick=last.toTick+6;
 const passed=b412AuditNativeActualOriginalInkSwim(w,b410,b411);
 assert.equal(passed.actualOwnInkSwimLegs,1);
 last.toTick=last.fromTick+2;
 assert.throws(()=>b412AuditNativeActualOriginalInkSwim(w,b410,b411),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_/);
 last.toTick=last.fromTick+3;
 last.originalSupport=false;
 assert.throws(()=>b412AuditNativeActualOriginalInkSwim(w,b410,b411),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_/);
});

test('B414 RAW return reaches a true 0.85m CDP stop window without loosening the 0.95m final source gate',()=>{
 const initial=[11.62026596069336,5.395100116729736,46.45663070678711];
 // Genuine failed run #41721892162, artifact 13272948512:
 // continued KeyS after ~0.780m until net distance rose to ~1.144m.
 const stillOutside=[12.31708812713623,5.395096778869629,46.95549774169922];
 const reached=[12.03475570678711,5.395033359527588,47.117610931396484];
 const overshot=[11.383871078491211,5.3951826095581055,47.57565689086914];
 assert.equal(b412NativeReturnReady(stillOutside,initial),false);
 assert.equal(b412NativeReturnReady(reached,initial),true);
 assert.equal(b412NativeReturnReady(overshot,initial),false);
 assert.throws(()=>b412NativeReturnReady(null,initial),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_ACTUAL_RETURN_COORDINATES_REQUIRED/);
 // Independent post-return SOURCE audit still requires netReturnMeters <=0.95.
 const bad=witness();bad.final.netReturnMeters=1.1437;
 assert.throws(()=>b412AuditNativeActualOriginalInkSwim(bad,b410,b411),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_/);
});
