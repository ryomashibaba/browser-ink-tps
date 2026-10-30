#!/usr/bin/env node
/** B349 independent genuine CDP Space + real KCC and original projectile gate.
 * The project hypothesis for airborne accuracy is NOT Nintendo source code.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b346AuditNativeFull} from './t21-b346-native-projectile-audit.mjs';
const need=(v,k)=>{if(!v)throw Error('B349_SOURCE_JUMP_'+k);};
export function b349AuditRealAirborneShooter(w){
 need(w?.schema==='B349_GENUINE_NATIVE_SOURCE_AIR_SHOOTER'&&
  w.originalSource==='25/17/26/0'&&
  w.actualNativeSpaceKeyDown===true&&
  w.actualNativeSpaceKeyUp===true&&
  w.fakeTicks===0&&w.teleports===0&&w.fakeShots===0&&
  w.sourceScoreable===0&&w.productionAuthorized===false,
  'REAL_POINTER_LOCKED_KEYBOARD_AND_STAGE');
 const a=w.actualJumpCheckpoints;
 need(Array.isArray(a)&&a.length===5&&
  [12,24,36,48,60].every((t,i)=>a[i]?.offset===t)&&
  a.every((x,i)=>Number.isSafeInteger(x.tick)&&
   Number.isFinite(x.bodyY)&&
   Number.isSafeInteger(x.realGroundShots)&&x.realGroundShots>=0&&
   Number.isSafeInteger(x.realAirShots)&&x.realAirShots>=0&&
   (i===0||x.tick>=a[i-1].tick+1)),
  'FIVE_TRUE_NATIVE_JUMP_STANCE_CHECKPOINTS');
 need(Number.isFinite(w.realOriginalHumanYBeforeJump)&&
  Math.max(...a.map(x=>x.bodyY))-w.realOriginalHumanYBeforeJump>=.14,
  'REAL_RAPIER_HUMAN_NEVER_LEFT_FLOOR');
 need(a.every((x,i)=>i===0||
  (x.realGroundShots>=a[i-1].realGroundShots&&
   x.realAirShots>=a[i-1].realAirShots)),
  'GROUND_AIR_COUNTS_NOT_MONOTONIC');
 need(Number.isSafeInteger(w.groundedShots)&&w.groundedShots>=2&&
  Number.isSafeInteger(w.airborneShots)&&w.airborneShots>=2&&
  w.groundedShots+w.airborneShots===w.realShooterShots&&
  w.realShooterShots===w.nativePhysicsProjectiles&&
  w.realShooterShots===a.at(-1).realGroundShots+a.at(-1).realAirShots,
  'ACTUAL_RAPIER_AIR_SHOOTS_OR_PHYSICAL_BULLET_MISSING');
 need(Number.isSafeInteger(w.originalPaintableImpacts)&&
  w.originalPaintableImpacts>=1&&
  Number.isSafeInteger(w.originalPaintChangedCells)&&
  w.originalPaintChangedCells>0,'ORIGINAL_SOURCE_PHYSICAL_PAINT_MISSING');
 return {schema:'B349_TRUE_KCC_GROUND_AND_AIR_SHOOTER_VERDICT',
  verdict:'PASS_REAL_HUMAN_SPACE_KCC_JUMP_AND_AIRBORNE_PHYSICAL_SHOTS',
  source:'25/17/26/0',
  actualNativeKeyboardSpacePressedAndReleased:true,
  measuredHumanBodyRiseMeters:Number(
   (Math.max(...a.map(x=>x.bodyY))-w.realOriginalHumanYBeforeJump).toFixed(6)),
  realGroundedHumanShooterProjectiles:w.groundedShots,
  realAirborneHumanShooterProjectiles:w.airborneShots,
  totalNativeShooterPhysicsProjectiles:w.nativePhysicsProjectiles,
  realOriginalPaintablePhysicalExits:w.originalPaintableImpacts,
  realOriginalChangedCellEvents:w.originalPaintChangedCells,
  realSourceScoreable:0,realOriginalCrossTeamRoutes:'0/12',
  exactOriginalNintendoInAirProbabilityCertified:false,
  original3dWeaponArtAccepted:false,formal4v4Certified:false,
  productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];need(!!dir,'ACTUAL_EVIDENCE_DIR');
 const read=n=>JSON.parse(readFileSync(join(dir,n),'utf8'));
 const original=b346AuditNativeFull(
  read('b346-genuine-physical-projectile-events.json'),
  read('b337-real-input-ink.json'),
  read('b344-native-human-shooter-ticks.json'));
 need(original.verdict==='PASS_GENUINE_NATIVE_PLAYCANVAS_SHOOTER_SPAWN_AND_EXIT',
  'B346_REAL_PHYSICS_REGRESSION');
 const w=read('b349-real-physical-jump-evidence.json');
 need(w.nativePhysicsProjectiles===original.actualNativePhysicalLaunches,
  'INDEPENDENT_REAL_SHOT_LEDGER_NOT_MATCHED');
 const v=b349AuditRealAirborneShooter(w);
 writeFileSync(join(dir,'b349-independent-true-air-shooter-verdict.json'),
  JSON.stringify(v,null,2)+'\n');
 console.log('B349_GENUINE_SOURCE_AIR_SHOOTER_VERDICT',JSON.stringify(v));
}
