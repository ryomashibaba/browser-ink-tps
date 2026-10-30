#!/usr/bin/env node
/** Read-only independent genuine Chromium SOURCE reticle event timeline. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const req=(ok,why)=>{if(!ok)throw Error('B357_NATIVE_RETICLE_'+why);};
const nat=n=>Number.isSafeInteger(n)&&n>=0;
const labels=['PRE_FIRE','HOLD_12','HOLD_24','HOLD_36','HOLD_48','HOLD_60'];
export function auditB357NativeReticleTimeline(w,physics){
 req(w?.schema==='B357_GENUINE_NATIVE_RETICLE_TIMELINE'&&
  w.source==='25/17/26/0'&&w.nativeChromium===true&&
  w.passiveSameCdpAsB344===true&&w.extraScreenshotDuringShooter===false&&
  w.syntheticPaint===false&&w.syntheticShots===false&&
  w.syntheticNativeTicks===false&&w.originalScoreable===0&&
  w.productionAuthorized===false&&w.officialEnemyHitCertified===false&&
  w.NintendoVisualParityCertified===false,'FROZEN_SOURCE');
 const p=physics?.physicalWitness;
 req(nat(w.finalNativeTick)&&w.finalNativeShots===10&&
  nat(w.finalNativeChangedCells)&&w.finalNativeChangedCells>0&&
  w.physicalLaunches===10&&w.physicalPaintableExits>=7&&
  physics?.source==='25/17/26/0'&&
  p?.totalActualShooterLaunches===10&&
  p.events?.filter(e=>e.kind==='EXIT'&&
   e.reason==='ORIGINAL_PAINTABLE').length===w.physicalPaintableExits,
  'GENUINE_PHYSICAL_SOURCE_PAINT');
 const rows=w.evidence;
 req(Array.isArray(rows)&&rows.length===6&&
  rows.map(r=>r.label).join(',')===labels.join(','),
  'B344_SAME_PHYSICAL_FRAME_SAMPLE_COUNT');
 let prevTick=-1,prevShots=-1,prevPaint=-1,prevCells=-1;
 const verified=[];
 for(const row of rows){
  req(nat(row.tick)&&row.tick>prevTick&&
   nat(row.nativeShots)&&row.nativeShots>=prevShots&&
   nat(row.nativePaintEvents)&&row.nativePaintEvents>=prevPaint&&
   nat(row.nativeChangedCells)&&row.nativeChangedCells>=prevCells&&
   nat(row.nativeLastImpactChangedCells)&&
   (row.nativeLastImpactTick===null||
    (nat(row.nativeLastImpactTick)&&row.nativeLastImpactTick<=row.tick)),
   'MONOTONIC_NATIVE_SOURCE');
  prevTick=row.tick;prevShots=row.nativeShots;
  prevPaint=row.nativePaintEvents;prevCells=row.nativeChangedCells;
  const v=row.reticle;
  req(v?.exists===true&&v.scoreable==='0'&&
   v.enemyHitCertified==='false'&&v.gameplayWrites==='0'&&
   typeof v.text==='string'&&nat(v.actualImpactCount)&&
   v.actualImpactCount<=row.nativePaintEvents&&
   nat(v.nativeTick)&&v.nativeTick<=row.tick&&
   (v.actualImpactTick===-1||
    (nat(v.actualImpactTick)&&v.actualImpactTick<=v.nativeTick)),
   'NATIVE_PAINT_DOM_AUTHORITY');
  if(v.hidden===false){
   req(v.mode==='REAL_PAINT'||v.mode==='ACTUAL_SHOT_ONLY',
    'NO_UNVERIFIED_VISIBLE_MODE');
   if(v.mode==='ACTUAL_SHOT_ONLY'){
    req(row.nativeShots>0&&v.text.includes('PAINT UNCONFIRMED')&&
     !v.text.includes('CPU HIT'),'SHOT_IS_NOT_A_PAINT_HIT');
   }else{
    req(v.actualImpactTick>=0&&v.actualImpactCount>0&&
     row.nativeChangedCells>0&&
     row.nativeLastImpactTick!==null&&
     v.actualImpactTick<=row.nativeLastImpactTick&&
     row.tick-v.actualImpactTick<=42&&
     v.text.includes('REAL SOURCE INK +')&&
     v.text.includes('NOT CPU HIT'),
     'REAL_SOURCE_PAINT_CUE_TIMING');
    if(v.actualImpactTick===row.nativeLastImpactTick&&
       v.actualImpactCount===row.nativePaintEvents&&
       row.nativeLastImpactChangedCells>0&&
       v.text.includes('+'+row.nativeLastImpactChangedCells+' ·'))
      verified.push({checkpoint:row.label,nativeTick:row.tick,
       changedCells:row.nativeLastImpactChangedCells,
       impactTick:v.actualImpactTick});
   }
  }else req(['OFF','REAL_PAINT','ACTUAL_SHOT_ONLY'].includes(v.mode),
   'HIDDEN_CUE_AUTHORITY');
 }
 req(prevTick<=w.finalNativeTick&&prevShots<=w.finalNativeShots&&
  prevShots>0&&prevCells>0&&prevCells<=w.finalNativeChangedCells,
  'TRUE_SAMPLE_TO_PHYSICAL_SHOOTER');
 return {schema:'B357_INDEPENDENT_NATIVE_SOURCE_RETICLE',
  verdict:verified.length?
   'PASS_SAME_REAL_PAINT_EVENT_AND_VISIBLE_RETICLE':
   'HOLD_REAL_SHOOTER_AND_PAINT_BUT_NO_MATCHED_LIVE_RETICLE_CAPTURE',
  genuineMatchedSourceImpactFrames:verified,
  sourcePhysicalBullets:w.physicalLaunches,
  physicalPaintableExits:w.physicalPaintableExits,
  trueOriginalHumanOwnerCells:w.finalNativeChangedCells,
  sampledNativeFrames:rows.length,scoreable:0,
  cpuDamageNotInferred:true,NintendoExactVfxCertified:false,
  productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];req(!!dir,'DIRECTORY');
 const read=n=>JSON.parse(readFileSync(join(dir,n),'utf8'));
 const result=auditB357NativeReticleTimeline(
  read('b357-genuine-native-reticle-timeline.json'),
  read('b346-genuine-physical-projectile-events.json'));
 writeFileSync(join(dir,'b357-independent-native-reticle-verdict.json'),
  JSON.stringify(result,null,2)+'\n');
 console.log('B357_INDEPENDENT_NATIVE_SOURCE_RETICLE_VERDICT',
  JSON.stringify(result));
}
