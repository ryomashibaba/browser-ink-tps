#!/usr/bin/env node
/** B354: native CDP key-driven movement concurrently with Space + physical shooter. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const need=(ok,name)=>{if(!ok)throw Error('B354_REAL_SOURCE_MOVE_FIRE_'+name);};
const num=n=>Number.isSafeInteger(n)&&n>=0;
const vec=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
const horizontal=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
export function auditB354MovingFire(w,physics,b353){
 need(w?.schema==='B354_REAL_SOURCE_MOVING_AIR_SHOOTER'&&
 w.source==='25/17/26/0'&&w.realCdpKeyW===true&&w.realSpace===true&&
 w.realMouseHeldFire===true&&w.noTeleport===true&&w.noFakeTicks===true&&
 w.noFakeShots===true&&w.noInkInjection===true&&w.originalScoreable===0&&
 w.productionAuthorized===false&&w.NintendoExactWeaponCertified===false&&
 w.artAccepted===false&&w.unrestricted4v4Certified===false,
 'SOURCE_AUTHORITY');
 const e=w.movement,q=w.checkpoints;
 need(Array.isArray(e)&&e.length===2&&
 e[0].kind==='realKeyWDown'&&e[1].kind==='realKeyWUp'&&
 e.every(x=>num(x.tick)&&vec(x.body)&&typeof x.grounded==='boolean')&&
 e[0].tick<e[1].tick&&e[0].grounded===true,'CDP_W_KEYS');
 need(Array.isArray(q)&&q.length===6&&
 q.map(x=>x.label).join(',')==='PRE_FIRE,HOLD_12,HOLD_24,HOLD_36,HOLD_48,HOLD_60'&&
 q.every((x,i)=>num(x.tick)&&vec(x.body)&&
 typeof x.grounded==='boolean'&&num(x.physicalShooterLaunches)&&
 num(x.changedInk)&&Number.isFinite(x.playerInk)&&
 (i===0||x.tick>=q[i-1].tick))&&
 q[0].grounded===true&&q[3].grounded===false,
 'REAL_W_PLUS_AIR_SHOT_CHECKPOINTS');
 const move=horizontal(e[0].body,e[1].body);
 need(move>=.25&&move<10,'REAL_NATIVE_MOVEMENT');
 const actual=physics?.physicalWitness;
 need(physics?.source==='25/17/26/0'&&
 actual?.totalActualShooterLaunches===10&&
 actual?.totalActualShooterLaunches===w.trueNativeShooterLaunches&&
 physics.actualEndNativeTick===w.nativeFinalTick,'PHYSICAL_SHOT_LINK');
 const moving=actual.events.filter(s=>s.kind==='LAUNCH'&&
 s.nativeTick>e[0].tick&&s.nativeTick<e[1].tick);
 need(moving.length>=3&&
 moving.some(s=>s.nativeGroundedAtLaunch===true)&&
 moving.some(s=>s.nativeGroundedAtLaunch===false)&&
 moving.every(s=>vec(s.worldPosition)&&vec(s.worldVelocity)),
 'MOVING_GROUND_AND_AIR_NATIVE_PROJECTILES');
 const muzzleTravel=Math.max(...moving.map(s=>
 horizontal(s.worldPosition,moving[0].worldPosition)));
 need(muzzleTravel>=.12&&muzzleTravel<10,'REAL_MOVING_MUZZLE');
 need(q.at(-1).physicalShooterLaunches===10&&
 q.at(-1).changedInk>q[0].changedInk&&
 w.originalHumanPaintChangedCells>=q.at(-1).changedInk,
 'ACTUAL_ORIGINAL_INK');
 need(b353?.source==='25/17/26/0'&&
 w.truePhysicalCpuHitExits===b353.physicalCpuHitExits&&
 w.trueEnemyHpDamage===
 b353.humanCpuHpHitsAfter-b353.humanCpuHpHitsBefore,
 'REAL_CPU_HIT_BOUNDARY');
 return {schema:'B354_SOURCE_NATIVE_REAL_MOVING_SHOOTER_VERDICT',
  verdict:'PASS_ACTUAL_SIMULTANEOUS_KEYW_SPACE_SHOOT_AND_SOURCE_PAINT',
  measuredHumanHorizontalMovementMeters:Number(move.toFixed(4)),
  genuineMovingShooterBullets:moving.length,
  groundedWhileMovingShots:moving.filter(s=>s.nativeGroundedAtLaunch).length,
  airborneWhileMovingShots:moving.filter(s=>!s.nativeGroundedAtLaunch).length,
  measuredMuzzleHorizontalTravelMeters:Number(muzzleTravel.toFixed(4)),
  realHumanSourcePaintChangedCells:w.originalHumanPaintChangedCells,
  realCpuDamage:w.trueEnemyHpDamage,realCpuEncounterCertified:w.trueEnemyHpDamage>0,
  source:'25/17/26/0',full4v4Certified:false,
  NintendoOriginalMovementWeaponCertified:false,
  artAccepted:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];need(!!dir,'DIRECTORY_REQUIRED');
 const read=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
 const w=read('b354-real-moving-air-fire.json');
 const result=auditB354MovingFire(w,
 read('b346-genuine-physical-projectile-events.json'),
 read('b353-native-real-cpu-hit-cue.json'));
 need(w.screenshot==='B354_POST_MOVING_FIRE.png','SCREENSHOT_NAME');
 const png=readFileSync(join(dir,w.screenshot));
 need(png.length>20000&&png.readUInt32BE(16)===1600&&
 png.readUInt32BE(20)===900,'TRUE_3D_CHROMIUM_FRAME');
 writeFileSync(join(dir,'b354-independent-native-moving-fire-verdict.json'),
 JSON.stringify(result,null,2)+'\n');
 console.log('B354_INDEPENDENT_GENUINE_MOVE_FIRE_VERDICT',JSON.stringify(result));
}
