#!/usr/bin/env node
/** B356 genuine browser / original changed cells / bullet physical witness. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const need=(x,n)=>{if(!x)throw Error('B356_NATIVE_RETICLE_'+n);};
const natural=n=>Number.isSafeInteger(n)&&n>=0;
export function auditB356Reticle(w,physical){
 need(w?.schema==='B356_REAL_SOURCE_HUMAN_RETICLE_FEEDBACK'&&
  w.source==='25/17/26/0'&&w.nativeChromium===true&&
  w.noAimCorrection===true&&w.noSyntheticPaint===true&&
  w.noSyntheticHit===true&&w.scoreable===0&&
  w.productionAuthorized===false&&
  w.NintendoReticleParityCertified===false,'ORIGINAL_PROVENANCE');
 const p=w.nativeHumanPaint,v=w.browserReticle;
 need(natural(w.actualNativeTick)&&natural(w.humanActualShotRequests)&&
  w.humanActualShotRequests===10&&p?.originalSourceOnly===true&&
  p.scoreablePromotionCount===0&&
  natural(p.humanChangedImpactCount)&&
  p.humanChangedImpactCount>0&&natural(p.humanChangedCells)&&
  p.humanChangedCells>0&&natural(p.lastImpactTick)&&
  natural(p.lastImpactChangedCells)&&p.lastImpactChangedCells>0&&
  p.lastImpactTick<=w.actualNativeTick,'ACTUAL_SOURCE_CHANGES');
 need(physical?.source==='25/17/26/0'&&
  physical.physicalWitness?.totalActualShooterLaunches===10&&
  physical.physicalWitness?.events?.filter(e=>e.kind==='EXIT'&&
  e.reason==='ORIGINAL_PAINTABLE').length>=7,
  'REAL_PHYSICAL_PAINT_EXITS');
 need(v?.exists===true&&v.scoreable==='0'&&
  v.enemyHitCertified==='false'&&v.gameplayWrites==='0'&&
  typeof v.text==='string'&&
  v.actualImpactCount<=p.humanChangedImpactCount&&
  v.nativeTick<=w.actualNativeTick&&v.nativeTick>=0,
  'NO_FAKE_VIEWPORT_PAINT_OR_CPU_HIT');
 if(!v.hidden&&v.mode==='REAL_PAINT'){
  need(v.actualImpactTick===p.lastImpactTick&&
   v.text.includes('NOT CPU HIT')&&
   v.text.includes('REAL SOURCE INK +'),
   'VISIBLE_TRUE_PAINT_MARKER');
 }
 return {schema:'B356_TRUE_SOURCE_RETICLE_CAUSALITY',
  verdict:!v.hidden&&v.mode==='REAL_PAINT'?
   'PASS_VISIBLE_REAL_SOURCE_PAINT_RETICLE':
   'HOLD_REAL_PAINT_OBSERVED_BUT_VIEWPORT_PULSE_NOT_CAPTURED',
  actualHumanShotRequests:w.humanActualShotRequests,
  observedHumanChangedOwnerCells:p.humanChangedCells,
  actualSourcePaintImpactTick:p.lastImpactTick,
  viewportCueMode:v.mode??'OFF',viewportCueVisible:!v.hidden,
  noFakeCpuHit:true,scoreable:0,originalSource:'25/17/26/0',
  NintendoArtAccepted:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];need(!!dir,'DIR_REQUIRED');
 const read=n=>JSON.parse(readFileSync(join(dir,n),'utf8'));
 const result=auditB356Reticle(
  read('b356-real-native-reticle-ink.json'),
  read('b346-genuine-physical-projectile-events.json'));
 writeFileSync(join(dir,'b356-independent-reticle-verdict.json'),
  JSON.stringify(result,null,2)+'\n');
 console.log('B356_ACTUAL_RETICLE_VERDICT',JSON.stringify(result));
}
