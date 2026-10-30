#!/usr/bin/env node
/** B347 independently correlate real CDP mouse aim movement with genuine
 * physical projectile impact displacement and original ownerGrid writes.
 * Does not claim automatic Nintendo shooter dispersion. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b346AuditNativeFull} from './t21-b346-native-projectile-audit.mjs';
const need=(v,k)=>{if(!v)throw Error('B347_REAL_NATIVE_'+k);};
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export function b347AuditRealPointerSweep(sweep,witness){
 need(sweep?.schema==='B347_TRUE_POINTER_LOCKED_SOURCE_SWEEP'&&
  sweep.source==='25/17/26/0'&&sweep.artificialCameraYaw===false&&
  sweep.artificialShots===false&&sweep.artificialPaint===false&&
  sweep.sourceScoreable===0&&sweep.productionAuthorized===false,
  'TRUE_SOURCE_NO_INJECTION');
 const moves=sweep.realCdpMoves;
 need(Array.isArray(moves)&&moves.length===3&&
  moves.every(x=>x.actualCdpMouseInput===true&&
   Number.isSafeInteger(x.nativeTick)&&Number.isFinite(x.x)&&
   Number.isFinite(x.trueYawDegrees)),
  'THREE_ACTUAL_CDP_POINTER_MOVES');
 need(Number.isFinite(sweep.nativeYawBeforeFire)&&
  Number.isFinite(sweep.nativeYawAfterSweep)&&
  Math.abs(sweep.nativeYawAfterSweep-sweep.nativeYawBeforeFire)>=10,
  'ACTUAL_CAMERA_YAW_NOT_CHANGED');
 const events=witness?.physicalWitness?.events;
 need(Array.isArray(events)&&events.length>0,'NO_NATIVE_PHYSICAL_EVENTS');
 const impacts=events.filter(e=>e.kind==='EXIT'&&
  e.reason==='ORIGINAL_PAINTABLE').map(e=>e.worldPosition);
 need(impacts.length>=5&&impacts.every(x=>Array.isArray(x)&&
  x.length===3&&x.every(Number.isFinite)),
  'NO_GENUINE_ORIGINAL_PAINT_COLLISIONS');
 const maxDistance=Math.max(...impacts.map(x=>distance(x,impacts[0])));
 need(maxDistance>=.4,'IMPACTS_STILL_AT_ONE_FIXED_POINT');
 need(Number.isSafeInteger(sweep.nativeOriginalCellsAfter12)&&
  Number.isSafeInteger(sweep.nativeOriginalCellsAfter60)&&
  sweep.nativeOriginalCellsAfter12>=1&&
  sweep.nativeOriginalCellsAfter60>sweep.nativeOriginalCellsAfter12,
  'ORIGINAL_OWNER_CELL_GROWTH_NOT_OBSERVED');
 need(sweep.actualShooterShots===
  witness.physicalWitness.totalActualShooterLaunches,
  'REAL_HUMAN_SHOTS_AND_PHYSICS_MISMATCH');
 return {schema:'B347_GENUINE_CDP_SHOOTER_NATIVE_PHYSICS_PAINT_VERDICT',
  verdict:'PASS_REAL_MOUSE_SWEEP_MOVES_PROJECTILE_IMPACT_AND_OWNER',
  trueCdpPointerMovements:moves.length,
  actualCameraYawDeltaDegrees:
   sweep.nativeYawAfterSweep-sweep.nativeYawBeforeFire,
  originalPaintablePhysicalImpacts:impacts.length,
  maximumOriginalImpactDisplacementMeters:Number(maxDistance.toFixed(5)),
  originalChangedCellsAt12:sweep.nativeOriginalCellsAfter12,
  originalChangedCellsAt60:sweep.nativeOriginalCellsAfter60,
  additionalOriginalChangedCellEvents:
   sweep.nativeOriginalCellsAfter60-sweep.nativeOriginalCellsAfter12,
  actualNativeShooterPhysicsLaunches:
   witness.physicalWitness.totalActualShooterLaunches,
  originalSource:'25/17/26/0',syntheticShotsOrCamera:false,
  exactNintendoAutomaticSpreadCertified:false,
  exactHitToChangedCellAttributionCertified:false,
  gameCertified:false,artAccepted:false,full4v4Certified:false,
  productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];need(!!dir,'Genuine_EVIDENCE_REQUIRED');
 const read=n=>JSON.parse(readFileSync(join(dir,n),'utf8'));
 const physical=read('b346-genuine-physical-projectile-events.json');
 const b346=b346AuditNativeFull(physical,
  read('b337-real-input-ink.json'),
  read('b344-native-human-shooter-ticks.json'));
 need(b346.verdict==='PASS_GENUINE_NATIVE_PLAYCANVAS_SHOOTER_SPAWN_AND_EXIT',
  'B346_INDEPENDENT_SOURCE_GATE_FAILED');
 const verdict=b347AuditRealPointerSweep(
  read('b347-real-mouse-aim-sweep.json'),physical);
 writeFileSync(join(dir,'b347-independent-native-aim-verdict.json'),
  JSON.stringify(verdict,null,2)+'\n');
 console.log('B347_GENUINE_SOURCE_MOUSE_SWEEP_VERDICT',JSON.stringify(verdict));
}
