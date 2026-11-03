import test from 'node:test';
import assert from 'node:assert/strict';
import {b413AuditFullOriginalShotRefillReshot,b413ObserveNativeRefill}
 from './t21-b413-native-source-fire-refill-reshoot.mjs';
const good=(tick,shots,ink,mode='HUMAN',relation='NEUTRAL',recovery='LOCKED')=>({
 tick,time:88-(tick-6460)/60,phase:'PLAYING',paused:false,stopReason:null,
 body:[11.7,5.395,46.2],mode,relation,ink,inkRecovery:recovery,
 shots,original:'25/17/26/0',cpuRejoined:7,cpuPhysicalRelocations:0,
 sourceOfficialWinner:'NONE'
});
const v=(phase,before,after)=>({
 phase,before,after,liveCdP:true,source:'25/17/26/0',
 actualOriginalImpactSurface:'UndertowT21D:right-low-team-a:paint',
 actualOriginalImpactTick:after.tick-3,
 sourceInkDifference:before.ink-after.ink,
 actualShotsPaid:after.shots-before.shots,
 syntheticShotWrites:false,syntheticInkWrites:false,syntheticClockWrites:false,
 physicalPlayerRelocation:false,actualOriginalUpperSupported:true
});
const route={
 verdict:'PASS_ACTUAL_ORIGINAL_RAMP_UPPER_KCC_AND_THREE_LATE_NATIVE_SHOOT_WAVES',
 originalRoundTimeUpTick:11856
};
const ui={
 verdict:'PASS_UNOBSTRUCTED_REAL_ORIGINAL_180S_GAMEPLAY_AND_POST_TIME_UP_REPLAY',
 realGameTimeUpTick:11856
};
const squid={
 verdict:'PASS_REAL_OWN_INK_SWIM_AND_HUMAN_REENTRY_IN_180S_SOURCE_MATCH',
 actualNativeTimeUpTick:11856
};
const round={samples:[{label:'90',tick:6450,humanShots:60},
 {label:'60',tick:8250,humanShots:100},
 {label:'0',tick:11856,matchState:'TIME_UP',humanShots:120}]};
function fixture(){
 const pre=v('BEFORE_SQUID',good(6460,60,100),good(6545,72,88));
 const post=v('AFTER_SQUID',good(6640,72,92,'HUMAN','NEUTRAL','HUMAN'),
  good(6700,80,84));
 return {schema:'B413_AUTHENTIC_ORIGINAL_INK_SPEND_OWN_REFILL_RESUME',
  source:'25/17/26/0',originalScoreable:0,officialWinner:'NONE',
  syntheticResourceWrites:false,syntheticShotWrites:false,
  syntheticTimeWrites:false,syntheticActorWrites:false,
  pre,swimInitialShots:72,swimFinalShots:72,
  samples:[good(6546,72,88,'SQUID','NEUTRAL','NONE'),
   good(6560,72,88.2,'SQUID','OWN','SQUID_OWN'),
   good(6563,72,90.3,'SQUID','OWN','SQUID_OWN'),
   good(6580,72,92,'SQUID','NEUTRAL','NONE'),
   good(6620,72,92,'HUMAN','NEUTRAL','HUMAN')],
  post};
}
test('a real same-world original ink expenditure -> squid OWN recovery -> re-shot',()=>{
 const proof=b413AuditFullOriginalShotRefillReshot(fixture(),route,squid,ui,round);
 assert.equal(proof.verdict,
  'PASS_REAL_ORIGINAL_SOURCE_SHOT_INK_CONSUMPTION_SQUID_OWN_RECOVERY_AND_RESHOT');
 assert.ok(Math.abs(proof.genuineObservedSquidOwnInkGain-2.1)<1e-8);
 assert.equal(proof.sourceScoreable,0);
});
test('reject pretend ink refills, native time injection, unsupported nonoriginal paint',()=>{
 const edits=[
  x=>x.samples[2].ink=88.0,
  x=>x.samples[2].inkRecovery='HUMAN',
  x=>x.samples[1].relation='NEUTRAL',
  x=>x.pre.after.shots=x.pre.before.shots,
  x=>x.pre.after.ink=99,
  x=>x.post.after.ink=x.post.before.ink,
  x=>x.post.actualOriginalImpactSurface='FAKE',
  x=>x.post.before.shots+=1,
  x=>x.pre.before.shots+=1,
  x=>x.samples[2].original='26/17/26/0',
  x=>x.samples[3].cpuRejoined=6,
  x=>x.samples[3].tick=6559,
  x=>x.samples[2].phase='PAUSED',
  x=>x.syntheticTimeWrites=true,
  x=>x.originalScoreable=1
 ];
 for(const edit of edits){
  const data=fixture();edit(data);
  assert.throws(()=>b413AuditFullOriginalShotRefillReshot(data,route,squid,ui,round),
   /B413_NATIVE_ORIGINAL_INK_ECONOMY_HOLD_/);
 }
});
test('native recovery samples never invent ticks and preserve observation values',()=>{
 const trace={samples:[]};
 const mock=(tick,ink)=>({tick,timeRemainingSeconds:85,matchState:'PLAYING',
  paused:false,stopReason:null,player:{position:[0,5,40],mode:'SQUID',
   inkRelation:'OWN',ink},playerInkRecoveryState:'SQUID_OWN',
  shotsFired:72,originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
  b25SourcePaintRun:{officialWinner:'NONE'},
  cpu:{physicalRejoins:Array.from({length:7}),physicalFootRelocations:0}});
 b413ObserveNativeRefill(trace,mock(6520,85));
 b413ObserveNativeRefill(trace,mock(6520,99));
 b413ObserveNativeRefill(trace,mock(6523,86));
 assert.equal(trace.samples.length,2);
 assert.equal(trace.samples[0].ink,85);
 assert.equal(trace.samples[1].ink,86);
 assert.throws(()=>b413ObserveNativeRefill(trace,mock(6521,88)),
  /B413_NATIVE_ORIGINAL_INK_ECONOMY_HOLD_/);
});
