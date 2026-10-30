#!/usr/bin/env node
/** B349 actual CDP Space + native Rapier KCC stance on real PlayCanvas
 * projectiles. Reuse B337/344/345/346/348 independent native gates.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b346AuditNativeFull} from './t21-b346-native-projectile-audit.mjs';
import {verifyB348OriginalPhysicalAccuracy} from './t21-b348-physical-shooter-accuracy-audit.mjs';
const need=(ok,why)=>{if(!ok)throw Error('B349_NATIVE_KCC_'+why);};
export function auditB349TrueGroundAir(w,realPhysical){
 need(w?.schema==='B349_TRUE_NATIVE_SPACE_SHOOTER_KCC'&&
  w.source==='25/17/26/0'&&w.realSpaceKey===true&&
  w.syntheticShots===false&&w.syntheticInk===false&&
  w.artificialActorMovement===false&&
  w.originalScoreable===0&&w.productionAuthorized===false,
  'REAL_SOURCE_NO_FORGED_JUMP');
 const j=w.realSpaceEvents;
 need(Array.isArray(j)&&j.length===3&&
  j[0].kind==='realSpaceDown'&&j[1].kind==='realSpaceUp'&&
  j[2].kind==='realKccLanding'&&
  j[0].kccGrounded===true&&j[1].kccGrounded===false&&
  j[2].kccGrounded===true&&
  j.every(e=>Number.isSafeInteger(e.tick)&&Number.isFinite(e.bodyY))&&
  j[0].tick<j[1].tick&&j[1].tick<j[2].tick&&
  j[1].bodyY>j[0].bodyY+.1,
  'TRUE_NATIVE_SPACE_GROUNDED_AIRBORNE_LANDING');
 const actual=w.nativeShooterLaunches,physical=realPhysical?.truePhysicalEvidence;
 const launches=physical?.events?.filter(x=>x.kind==='LAUNCH');
 need(Array.isArray(actual)&&Array.isArray(launches)&&
  actual.length===10&&launches.length===10&&
  actual.length===physical.totalActualShooterLaunches,
  'TEN_GENUINE_NATIVE_BULLETS');
 let ground=0,air=0;
 for(let i=0;i<actual.length;i++){
  const e=actual[i],f=launches[i];
  need(e.id===f.launchId&&e.tick===f.nativeTick&&
    typeof e.kccGrounded==='boolean'&&
    e.kccGrounded===f.nativeGroundedAtLaunch&&
    Array.isArray(e.worldVelocity)&&e.worldVelocity.length===3&&
    e.worldVelocity.every((x,k)=>Number.isFinite(x)&&
     Math.abs(x-f.worldVelocity[k])<1e-8)&&
    Array.isArray(e.worldPosition)&&e.worldPosition.length===3,
    'TRUE_SOURCE_SHOOTER_KCC_SPAWN_'+i);
  if(e.kccGrounded)ground++;else air++;
 }
 need(ground>=2&&air>=1&&ground===w.realGroundShots&&
  air===w.realAirShots,
  'AIR_GROUND_REAL_KCC_SHOT_MISMATCH');
 need(w.originalNativeTick===realPhysical.realNativeFinalTick,
  'TRUE_NATIVE_CLOCK_MISMATCH');
 return {schema:'B349_ACTUAL_NATIVE_KCC_GROUND_AIR_SHOOTER_VERDICT',
  verdict:'PASS_REAL_SPACE_JUMP_NATIVE_GROUND_AND_AIR_PROJECTILE_SPAWNS',
  originalSource:'25/17/26/0',
  nativeGroundedShooterShots:ground,nativeAirborneShooterShots:air,
  actualJumpBodyRiseMeters:Number((j[1].bodyY-j[0].bodyY).toFixed(4)),
  actualRealSpaceKeyPresses:1,
  genuinePhysicsLaunchIds:actual.map(x=>x.id),
  originalGameGroundAirAccuracyCertified:false,
  NintendoExactAirSpreadCertified:false,
  syntheticJumpOrActorMotion:false,scoreable:0,
  artAccepted:false,full4v4Certified:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];need(!!dir,'GenuineNativeProofDir');
 const read=n=>JSON.parse(readFileSync(join(dir,n),'utf8'));
 const full=read('b348-native-shooter-accuracy-candidate.json');
 const basic=b346AuditNativeFull(read('b346-genuine-physical-projectile-events.json'),
  read('b337-real-input-ink.json'),read('b344-native-human-shooter-ticks.json'));
 need(basic.verdict==='PASS_GENUINE_NATIVE_PLAYCANVAS_SHOOTER_SPAWN_AND_EXIT',
  'B346_PHYSICAL_GATE');
 const b348=verifyB348OriginalPhysicalAccuracy(full);
 need(b348.realHumanShots===10,'B348_PHYSICAL_SOURCE_GATE');
 const v=auditB349TrueGroundAir(read('b349-actual-space-kcc-physical-shots.json'),full);
 writeFileSync(join(dir,'b349-independent-physical-kcc-verdict.json'),
  JSON.stringify(v,null,2)+'\n');
 console.log('B349_TRUE_NATIVE_KCC_PHYSICAL_JUMP_VERDICT',JSON.stringify(v));
}
