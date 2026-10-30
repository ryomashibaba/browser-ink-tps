import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB357NativeReticleTimeline as audit} from './t21-b357-reticle-timeline-audit.mjs';
function sample(){
 const times=[100,112,124,136,148,160];
 const events=[0,0,2,3,5,6],cells=[0,0,40,70,100,130];
 const w={schema:'B357_GENUINE_NATIVE_RETICLE_TIMELINE',
  source:'25/17/26/0',nativeChromium:true,
  passiveSameCdpAsB344:true,extraScreenshotDuringShooter:false,
  syntheticPaint:false,syntheticShots:false,syntheticNativeTicks:false,
  originalScoreable:0,productionAuthorized:false,
  officialEnemyHitCertified:false,NintendoVisualParityCertified:false,
  finalNativeTick:220,finalNativeShots:10,finalNativeChangedCells:130,
  physicalLaunches:10,physicalPaintableExits:10,
  evidence:times.map((tick,i)=>({
   label:['PRE_FIRE','HOLD_12','HOLD_24','HOLD_36','HOLD_48','HOLD_60'][i],
   tick,nativeShots:i*2,nativePaintEvents:events[i],
   nativeChangedCells:cells[i],
   nativeLastImpactTick:i<2?null:tick-2,
   nativeLastImpactChangedCells:i<2?0:12,
   reticle:{exists:true,hidden:i!==2,mode:i===2?'REAL_PAINT':'OFF',
    nativeTick:tick,actualImpactTick:i===2?tick-2:-1,
    actualImpactCount:i===2?events[i]:0,
    text:i===2?'REAL SOURCE INK +12 · NOT CPU HIT':'',
    scoreable:'0',enemyHitCertified:'false',gameplayWrites:'0'}
  }))};
 const physics={source:'25/17/26/0',physicalWitness:{
  totalActualShooterLaunches:10,
  events:Array.from({length:10},()=>({kind:'EXIT',reason:'ORIGINAL_PAINTABLE'}))}};
 return {w,physics};
}
test('true same native impact and visible source reticle',()=>{
 const {w,physics}=sample(),v=audit(w,physics);
 assert.equal(v.verdict,'PASS_SAME_REAL_PAINT_EVENT_AND_VISIBLE_RETICLE');
 assert.equal(v.genuineMatchedSourceImpactFrames.length,1);
});
test('genuine ink without visible matching pulse must remain HOLD',()=>{
 const {w,physics}=sample();
 w.evidence[2].reticle.hidden=true;w.evidence[2].reticle.mode='OFF';
 assert.match(audit(w,physics).verdict,/^HOLD_/);
});
test('refuse counterfeit original stage, fake ticks and inferred CPU hit',()=>{
 const attempts=[
  s=>s.w.source='25/17/25/0',
  s=>s.w.originalScoreable=1,
  s=>s.w.evidence[2].reticle.enemyHitCertified='true',
  s=>s.w.evidence[2].reticle.text='CPU HIT',
  s=>s.w.evidence[2].nativeChangedCells=0,
  s=>s.w.evidence[2].reticle.actualImpactCount=10,
  s=>s.w.evidence[2].reticle.nativeTick=150,
  s=>s.w.evidence[2].reticle.actualImpactTick=150,
  s=>s.w.evidence[2].nativePaintEvents=0,
  s=>s.w.extraScreenshotDuringShooter=true,
  s=>s.physics.physicalWitness.events[0].reason='REAL_CPU_HIT'
 ];
 for(const op of attempts){const s=sample();op(s);
  assert.throws(()=>audit(s.w,s.physics),/B357_NATIVE_RETICLE_/);}
});
