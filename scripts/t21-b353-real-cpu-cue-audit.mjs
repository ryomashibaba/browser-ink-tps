#!/usr/bin/env node
/** Native B353: damage cue cannot exceed genuine CPU HP change. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const need=(p,msg)=>{if(!p)throw Error('B353_NATIVE_CUE_'+msg);};
const nat=n=>Number.isSafeInteger(n)&&n>=0;
const vec=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
const enemies=e=>Array.isArray(e)&&e.length===4&&
 e.map(c=>c.id).sort().join(',')==='B1,B2,B3,B4'&&
 e.every(c=>vec(c.foot)&&(c.hp===null||
  (Number.isFinite(c.hp)&&c.hp>=0)));
export function auditB353NativeRealCpuCue(w,p){
 need(w?.schema==='B353_REAL_NATIVE_CPU_HIT_CUE_WITNESS'&&
  w.source==='25/17/26/0'&&w.nativeCdp===true&&
  w.realActorsOnly===true&&w.syntheticHits===false&&
  w.syntheticInk===false&&w.syntheticTicks===false&&
  w.actorTeleports===0&&w.originalScoreable===0&&
  w.originalNintendoCueArtCertified===false&&
  w.officialWinnerCertified===false&&w.productionAuthorized===false,
  'UNMODIFIED_SOURCE');
 need(nat(w.startTick)&&nat(w.endTick)&&w.endTick>w.startTick&&
  vec(w.humanStart)&&vec(w.humanEnd)&&
  enemies(w.originalEnemiesBefore)&&enemies(w.originalEnemiesAfter),
  'GENUINE_EXISTING_ENEMIES');
 const a=w.humanCpuHpHitsBefore,b=w.humanCpuHpHitsAfter;
 const c=w.genuineCueBefore,d=w.genuineCueAfter;
 const shots=w.physicalLaunches,exits=w.physicalExits,real=w.physicalCpuHitExits;
 need([a,b,c,d,shots,exits,real,w.physicalPaintableExits,
   w.actualHumanPaintChangedCells].every(nat)&&
  b>=a&&d>=c&&shots>0&&exits<=shots&&real<=exits&&
  Number.isFinite(w.humanInkBefore)&&Number.isFinite(w.humanInkAfter),
  'REAL_PHYSICS_LEDGER');
 need(p?.source==='25/17/26/0'&&p.actualEndNativeTick===w.endTick&&
  p.physicalWitness?.totalActualShooterLaunches===shots&&
  p.physicalWitness?.totalActualShooterExits===exits,
  'INDEPENDENT_PHYSICAL_WITNESS');
 const x=p.physicalWitness.events;
 need(Array.isArray(x)&&x.filter(v=>v.kind==='EXIT'&&
  v.reason==='REAL_CPU_HIT').length===real&&
  x.filter(v=>v.kind==='EXIT'&&
  v.reason==='ORIGINAL_PAINTABLE').length===w.physicalPaintableExits,
  'HIT_AND_PAINT_PROVENANCE');
 const hits=b-a,cues=d-c;
 need(hits===cues&&hits<=real,'NO_FAKE_MISSING_HP_CUE');
 return {schema:'B353_NATIVE_REAL_SOURCE_SHOOTER_CUE_AUDIT',
  verdict:hits>0?'PASS_REAL_CPU_HP_HIT_AND_CUE_COUNTER':
   'HOLD_NO_GENUINE_CPU_HP_HIT_OBSERVED',
  genuinePhysicalLaunches:shots,actualEnemyCpuActors:4,
  actualCpuHpReductionEvents:hits,realCueEvents:cues,
  trueCpuProjectileCollisionExits:real,
  originalPaintableExits:w.physicalPaintableExits,
  actualOriginalInkChangedCells:w.actualHumanPaintChangedCells,
  NintendoArtAudioParityCertified:false,full4v4Certified:false,
  source:'25/17/26/0',productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];need(!!dir,'DIR_MISSING');
 const load=n=>JSON.parse(readFileSync(join(dir,n),'utf8'));
 const w=load('b353-native-real-cpu-hit-cue.json');
 const p=load('b346-genuine-physical-projectile-events.json');
 const v=auditB353NativeRealCpuCue(w,p);
 for(const name of [w.nativeScreenshotStart,w.nativeScreenshotEnd]){
  need(name==='B337_START.png'||name==='B337_END.png','SCREENSHOT_PATH');
  const png=readFileSync(join(dir,name));
  need(png.length>20000&&png.readUInt32BE(16)===1600&&
   png.readUInt32BE(20)===900,'REAL_1600X900_FRAMEBUFFER');
 }
 writeFileSync(join(dir,'b353-independent-real-cpu-cue-audit.json'),
  JSON.stringify(v,null,2)+'\n');
 console.log('B353_NATIVE_SOURCE_REAL_CPU_CUE_VERDICT',JSON.stringify(v));
}
