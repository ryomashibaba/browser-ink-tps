import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB356Reticle} from './t21-b356-reticle-ink-audit.mjs';
function sample(){
 const paint={originalSourceOnly:true,scoreablePromotionCount:0,
  humanChangedImpactCount:6,humanChangedCells:449,lastImpactTick:110,
  lastImpactChangedCells:45};
 return {w:{schema:'B356_REAL_SOURCE_HUMAN_RETICLE_FEEDBACK',
  source:'25/17/26/0',nativeChromium:true,actualNativeTick:116,
  humanActualShotRequests:10,nativeHumanPaint:paint,
  browserReticle:{exists:true,hidden:false,mode:'REAL_PAINT',
   nativeTick:115,actualImpactTick:110,actualImpactCount:6,
   text:'REAL SOURCE INK +45 · NOT CPU HIT',scoreable:'0',
   enemyHitCertified:'false',gameplayWrites:'0'},
  noAimCorrection:true,noSyntheticPaint:true,noSyntheticHit:true,
  scoreable:0,productionAuthorized:false,
  NintendoReticleParityCertified:false},
  physical:{source:'25/17/26/0',physicalWitness:{
   totalActualShooterLaunches:10,events:Array.from({length:10},()=>
    ({kind:'EXIT',reason:'ORIGINAL_PAINTABLE'}))}}};
}
test('actual source original ink paint can produce real reticle, never CPU hit',()=>{
 const {w,physical}=sample(),v=auditB356Reticle(w,physical);
 assert.equal(v.verdict,'PASS_VISIBLE_REAL_SOURCE_PAINT_RETICLE');
 assert.equal(v.noFakeCpuHit,true);
});
test('valid real paint without visible pulse reports HOLD, not false PASS',()=>{
 const {w,physical}=sample();w.browserReticle.hidden=true;
 w.browserReticle.mode='OFF';const v=auditB356Reticle(w,physical);
 assert.match(v.verdict,/^HOLD_/);
});
test('fake camera success and unsupported source/paint evidence fail',()=>{
 for(const change of [
  s=>s.w.browserReticle.enemyHitCertified='true',
  s=>s.w.browserReticle.text='CPU HIT +45',
  s=>s.w.nativeHumanPaint.humanChangedCells=0,
  s=>s.w.source='25/18/26/0',
  s=>s.w.actualNativeTick=90,
  s=>s.w.browserReticle.gameplayWrites='1',
  s=>s.physical.physicalWitness.totalActualShooterLaunches=9
 ]){const s=sample();change(s);assert.throws(()=>
  auditB356Reticle(s.w,s.physical),/B356_NATIVE_RETICLE_/);}
});

test('rendered genuine paint may precede latest native impact by six ticks',()=>{
 const {w,physical}=sample();
 w.nativeHumanPaint.lastImpactTick=116;
 w.nativeHumanPaint.humanChangedImpactCount=9;
 w.browserReticle.nativeTick=110;
 w.browserReticle.actualImpactCount=6;
 const v=auditB356Reticle(w,physical);
 assert.equal(v.verdict,'PASS_VISIBLE_REAL_SOURCE_PAINT_RETICLE');
 assert.equal(v.viewportRenderLagTicks,6);
});
test('reject future, out-of-order, counterfeit, or stale paint cue',()=>{
 for(const change of [
  s=>{s.w.nativeHumanPaint.lastImpactTick=109;},
  s=>{s.w.browserReticle.actualImpactTick=120;},
  s=>{s.w.browserReticle.actualImpactCount=7;},
  s=>{s.w.browserReticle.text='REAL SOURCE INK +9999 · NOT CPU HIT';},
  s=>{s.w.browserReticle.text='REAL SOURCE INK +45 · CPU HIT';},
  s=>{s.w.browserReticle.nativeTick=82;},
  s=>{s.w.actualNativeTick=145;},
 ]){const s=sample();change(s);assert.throws(()=>
  auditB356Reticle(s.w,s.physical),/B356_NATIVE_RETICLE_/);}
});
