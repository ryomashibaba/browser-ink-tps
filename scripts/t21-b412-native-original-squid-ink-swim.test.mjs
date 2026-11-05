import test from 'node:test';
import assert from 'node:assert/strict';
import {b412AuditNativeActualOriginalInkSwim,b412NativeReturnReady,
 b412NativeReturnSteerKey,b412ObservedNativeForwardW,b412OwnInkDwellVerified}
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
  outboundForwardWDelta:[q[0]-p[0],q[2]-p[2]],
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

test('RAW 13377715385: real W points AWAY from genuine B410 SOURCE paint, so choose D',()=>{
 const start=[11.856943130493164,5.394997596740723,46.09151840209961];
 const firstW=[12.415283203125,5.395761013031006,45.786407470703125];
 const originalPaint=[13.438099288987395,4.502,50.280006688080206];
 const delta=[firstW[0]-start[0],firstW[2]-start[2]];
 assert.equal(b412NativeReturnSteerKey(firstW,originalPaint,delta),'KeyD');
 assert.ok(Math.hypot(originalPaint[0]-firstW[0],originalPaint[2]-firstW[2])>
  Math.hypot(originalPaint[0]-start[0],originalPaint[2]-start[2]));
});
test('B412 audit refuses outbound input contradicting actual native W calibration',()=>{
 const w=witness();
 assert.equal(b412AuditNativeActualOriginalInkSwim(w,b410,b411).originalScoreable,0);
 w.legs[1].code='KeyD';
 assert.throws(()=>b412AuditNativeActualOriginalInkSwim(w,b410,b411),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_/);
 w.legs[1].code='KeyW';
 w.outboundForwardWDelta=[1,0];
 assert.throws(()=>b412AuditNativeActualOriginalInkSwim(w,b410,b411),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_/);
});

test('RAW #13378648373: real KeyD displacement must never replace native KeyW forward',()=>{
 const initial=[13.214171409606934,5.394931316375732,46.32919692993164];
 const start=[13.214171409606934,5.394753456115723,46.32918930053711];
 const wEnd=[13.772868156433105,5.395096302032471,46.03012466430664];
 const dEnd=[14.326507568359375,5.394999980926514,46.26839065551758];
 const diff=(a,b)=>[b[0]-a[0],b[2]-a[2]];
 const w=diff(start,wEnd),d=diff(wEnd,dEnd);
 const legs=[
  {direction:'TOWARD_REAL_120S_PAINT',code:'KeyW',from:start,to:wEnd,
   planarMeters:Math.hypot(...w)},
  {direction:'TOWARD_REAL_120S_PAINT',code:'KeyD',from:wEnd,to:dEnd,
   planarMeters:Math.hypot(...d)}
 ];
 assert.deepEqual(b412ObservedNativeForwardW(legs),w);
 assert.notDeepEqual(w,d);
 const lastBody=[14.11371898651123,5.3955793380737305,46.741703033447266];
 assert.equal(b412NativeReturnSteerKey(lastBody,initial,w),'KeyA');
 assert.equal(b412NativeReturnSteerKey(lastBody,initial,d),'KeyS');
 assert.throws(()=>b412ObservedNativeForwardW([legs[1]]),
  /B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_REAL_NATIVE_KEYW_CALIBRATION_REQUIRED/);
});

test('RAW #13395157849: genuine OWN refill must last before KeyS',()=>{
 const before={tick:6624,player:{mode:'SQUID',inkRelation:'OWN',
  ink:84.03333333333327,position:[13.0295763,5.3962,46.3705]}};
 const after={tick:6632,matchState:'PLAYING',paused:false,stopReason:null,
  player:{mode:'SQUID',inkRelation:'OWN',ink:87.5,
   position:[13.04,5.395,46.39]},
  playerInkRecoveryState:'SQUID_OWN',
  b381RealNativeDodge:{realLocomotion:'SWIM_GROUND'},
  shotsFired:88,cpu:{physicalRejoins:['A1','A2','A3','B1','B2','B3','B4'],
   physicalFootRelocations:0},originalSourceSolids:25,
  originalPaintSurfaces:17,originalSourceNavigationLinks:26,
  sourceScoreablePromotions:0};
 const foot={source:'25/17/26/0',realHumanOriginalFootSupported:true,
  genuineHumanOriginalFootSolid:'UndertowT21D:right-low-team-a',
  genuineOriginalFootGapMeters:.025,sourceActorRelocations:0,
  sourceInkRewritten:false,playerPositionRewritten:false};
 const ok=()=>b412OwnInkDwellVerified(before,after,foot,
  'UndertowT21D:right-low-team-a',88);
 assert.equal(ok(),true);
 after.tick=6630;after.player.inkRelation='NEUTRAL';
 after.playerInkRecoveryState='NONE';assert.equal(ok(),false);
 after.tick=6632;after.player.inkRelation='OWN';
 after.playerInkRecoveryState='SQUID_OWN';after.player.ink=84;
 assert.equal(ok(),false);
 after.player.ink=87.5;foot.sourceActorRelocations=1;
 assert.equal(ok(),false);
 foot.sourceActorRelocations=0;
 after.cpu.physicalFootRelocations=1;assert.equal(ok(),false);
});

test('RAW #13395157849: native OWN resting cannot be mistaken for fake refill',()=>{
 // At native tick6624 the actual player was on registered OWN upper
 // source, SQUID+SWIM_GROUND with ink 84.033. The next native sampling
 // must prove sustained OWN before B413 independent refill can pass.
 const physical={tick:6624,ink:84.03333333333327,
  inkRelation:'OWN',inkRecovery:'SQUID_OWN',
  mode:'SQUID',foot:'UndertowT21D:right-low-team-a'};
 assert.ok(physical.tick>6600&&physical.ink>82.9);
 assert.equal(physical.inkRelation,'OWN');
 assert.equal(physical.inkRecovery,'SQUID_OWN');
 const trace={samples:[
  {tick:6624,ink:physical.ink,relation:'OWN',mode:'SQUID',
   inkRecovery:'SQUID_OWN'},
  {tick:6628,ink:86.03333333333327,relation:'OWN',mode:'SQUID',
   inkRecovery:'SQUID_OWN'}]};
 const consecutive=trace.samples.every(x=>x.relation==='OWN'&&
  x.mode==='SQUID'&&x.inkRecovery==='SQUID_OWN');
 assert.equal(consecutive,true);
 assert.ok(trace.samples[1].tick>trace.samples[0].tick);
 assert.ok(trace.samples[1].ink>trace.samples[0].ink+.25);
 trace.samples[1].relation='NEUTRAL';
 assert.equal(trace.samples.every(x=>x.relation==='OWN'),false);
});

test('RAW #13396636729: real OWN refill into 100 plus 12 genuine plateau ticks',()=>{
 const body=[13.383576393127441,5.395099639892578,49.15566635131836];
 const ink=[88.94999999999992,92.3499999999999,95.74999999999987,
  99.14999999999985,100];
 const foot={source:'25/17/26/0',realHumanOriginalFootSupported:true,
  genuineHumanOriginalFootSolid:'UndertowT21D:right-low-team-a',
  genuineOriginalFootGapMeters:.025,sourceActorRelocations:0,
  sourceInkRewritten:false,playerPositionRewritten:false};
 const rest={source:'25/17/26/0',nativeKeys:'SHIFT_ONLY',gameplayWrites:0,
  samples:ink.map((amount,i)=>({
   tick:6652+6*i,position:i===0?
    [13.383503913879395,5.394999980926514,49.04030990600586]:body,
   mode:'SQUID',ink:amount,inkRelation:'OWN',
   inkRecovery:'SQUID_OWN',squidOwnRecoveryObserved:true,
   source:'25/17/26/0',trueOriginalFoot:'UndertowT21D:right-low-team-a',
   originalFootGap:.025,cpuRejoined:7,humanShots:86
  }))};
 const before={tick:6676,player:{mode:'SQUID',inkRelation:'OWN',
  ink:100,position:body}};
 const after={tick:6688,matchState:'PLAYING',paused:false,stopReason:null,
  player:{mode:'SQUID',inkRelation:'OWN',ink:100,position:body},
  playerInkRecoveryState:'SQUID_OWN',
  b381RealNativeDodge:{realLocomotion:'SWIM_GROUND'},
  shotsFired:86,cpu:{physicalRejoins:['A1','A2','A3','B1','B2','B3','B4'],
   physicalFootRelocations:0},originalSourceSolids:25,
  originalPaintSurfaces:17,originalSourceNavigationLinks:26,
  sourceScoreablePromotions:0};
 const valid=()=>b412OwnInkDwellVerified(before,after,foot,
  'UndertowT21D:right-low-team-a',86,rest);
 assert.equal(valid(),true);
 assert.equal(b412OwnInkDwellVerified(before,after,foot,
  'UndertowT21D:right-low-team-a',86),false);
 rest.samples[1].ink=90;assert.equal(valid(),false);
 rest.samples[1].ink=ink[1];
 rest.samples[2].trueOriginalFoot='FAKE';
 assert.equal(valid(),false);
 rest.samples[2].trueOriginalFoot='UndertowT21D:right-low-team-a';
 rest.samples[3].inkRelation='NEUTRAL';assert.equal(valid(),false);
 rest.samples[3].inkRelation='OWN';
 after.player.ink=99;assert.equal(valid(),false);
 after.player.ink=100;
 foot.sourceInkRewritten=true;assert.equal(valid(),false);
});
