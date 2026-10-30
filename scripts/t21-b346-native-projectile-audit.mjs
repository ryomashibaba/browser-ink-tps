#!/usr/bin/env node
/** B346 true physical PlayCanvas launch/impact evidence, separately
 * rechecked against B337 native human, B344 native shot/owner,
 * and B345 exact frozen-source first press proof.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b337AuditNative} from './t21-b337-real-input-ink-audit.mjs';
import {verifyB344RealShooter} from './t21-b344-native-shooter-audit.mjs';
import {b345AuditRealSourceOpening} from './t21-b345-native-shooter-audit.mjs';
const need=(v,k)=>{if(!v)throw Error('B346_PHYSICAL_SOURCE_'+k);};
const validNumber=x=>typeof x==='number'&&Number.isFinite(x);
const vec=x=>Array.isArray(x)&&x.length===3&&x.every(validNumber);
const types=['TTL','ORIGINAL_PAINTABLE','ORIGINAL_SOLID',
 'REAL_CPU_HIT','REAL_PLAYER_HIT','QA_TARGET_HIT'];
export function b346VerifyEventStream(w,originalIds,actualShots,actualFinalTick){
 const q=w?.physicalWitness,events=q?.events;
 need(w?.schema==='B346_REAL_3D_NATIVE_SOURCE_SHOOTER_EVENTS'&&
  w.source==='25/17/26/0'&&w.injectedPhysicalShots===false&&
  w.injectedInk===false&&w.injectedTicks===false&&
  w.sourceScoreable===0&&w.productionAuthorized===false&&
  q?.enabled===true&&q.source==='25/17/26/0'&&
  q.noSyntheticProjectilesOrCollision===true&&
  q.noPaintOrActorInjection===true&&
  q.genuinePlayCanvasProjectileSlotsOnly===true&&
  q.scoreablePromotions===0&&q.productionAuthorized===false&&
  q.droppedOldestEvents===0,'REAL_SOURCE_AND_NO_INJECTION');
 need(Array.isArray(originalIds)&&originalIds.length===17&&
  new Set(originalIds).size===17,'SEVENTEEN_REAL_SOURCE_PAINTABLE_IDS');
 need(Number.isSafeInteger(actualFinalTick)&&
  actualFinalTick===w.actualEndNativeTick&&
  q.observedNativeTick===actualFinalTick&&
  Number.isSafeInteger(actualShots)&&actualShots>0&&
  w.realHumanShotsAtEnd===actualShots&&
  q.totalActualShooterLaunches===actualShots&&
  Number.isSafeInteger(q.totalActualShooterExits)&&
  q.totalActualShooterExits>=1&&
  q.totalActualShooterExits<=actualShots&&
  Array.isArray(events)&&
  events.length===q.totalActualShooterLaunches+q.totalActualShooterExits,
  'GENUINE_PHYSICAL_LAUNCH_VS_TRUE_HUMAN_SHOTS');
 const launches=new Map(),exits=new Set(),reasons={};
 let prevTick=-1;
 for(const e of events){
  need(Number.isSafeInteger(e.nativeTick)&&e.nativeTick>=prevTick&&
   e.nativeTick<=actualFinalTick&&
   Number.isSafeInteger(e.launchId)&&e.launchId>=1,
   'PHYSICAL_NATIVE_EVENT_CLOCK');
  prevTick=e.nativeTick;
  if(e.kind==='LAUNCH'){
   need(!launches.has(e.launchId)&&e.weaponId==='pulse-sprayer'&&
    typeof e.slotName==='string'&&e.slotName.startsWith('Projectile:')&&
    vec(e.worldPosition)&&vec(e.worldVelocity)&&
    Math.hypot(...e.worldVelocity)>0&&
    validNumber(e.gravity)&&e.gravity>=0&&
    validNumber(e.lifeSeconds)&&e.lifeSeconds>0&&
    validNumber(e.paintRadius)&&e.paintRadius>0,
    'ACTUAL_HUMAN_3D_LAUNCH_'+e.launchId);
   launches.set(e.launchId,e);
  }else{
   need(e.kind==='EXIT'&&!exits.has(e.launchId)&&
    launches.has(e.launchId)&&types.includes(e.reason)&&
    vec(e.worldPosition)&&
    e.nativeTick>=launches.get(e.launchId).nativeTick,
    'ACTUAL_NATIVE_BULLET_EXIT_'+e.launchId);
   need(e.reason==='ORIGINAL_PAINTABLE'
    ?typeof e.originalPaintSurfaceId==='string'&&
      originalIds.includes(e.originalPaintSurfaceId)
    :e.originalPaintSurfaceId===null,
    'EXACT_ORIGINAL_IMPACT_SURFACE_ID_'+e.launchId);
   exits.add(e.launchId);reasons[e.reason]=(reasons[e.reason]||0)+1;
  }
 }
 need(launches.size===actualShots&&exits.size===q.totalActualShooterExits&&
  [...launches.keys()].every((id,i)=>id===i+1),
  'ONE_PHYSICAL_ID_PER_ACCEPTED_NATIVE_SHOT');
 return {schema:'B346_REAL_ORIGINAL_SHOOTER_PHYSICS_VERDICT',
  verdict:'PASS_GENUINE_NATIVE_PLAYCANVAS_SHOOTER_SPAWN_AND_EXIT',
  originalSource:'25/17/26/0',actualNativePhysicalLaunches:launches.size,
  actualNativePhysicalExits:exits.size,
  actualOriginalPaintableImpactCount:reasons.ORIGINAL_PAINTABLE||0,
  actualNativePhysicsExitReasons:reasons,
  firstRealSpawnTick:events.find(x=>x.kind==='LAUNCH').nativeTick,
  lastRealSpawnTick:[...launches.values()].at(-1).nativeTick,
  trueOriginalOwnerGridWritesIndependentlyRequired:true,
  originalWeaponAccuracyCertified:false,exactNintendoWeaponCertified:false,
  artAccepted:false,full4v4Certified:false,productionAuthorized:false};
}
export function b346AuditNativeFull(w,human,held){
 const source=b337AuditNative(human);
 const shooter=verifyB344RealShooter(held);
 const opening=b345AuditRealSourceOpening(held);
 need(shooter.actualHumanShotRequests===source.actualHumanNewShots&&
  opening.realExperiment60TickShots===shooter.actualHumanShotRequests,
  'Genuine_B337_B344_B345_INTERLOCK');
 const originalIds=human.samples[0].originalRows.map(r=>r.surfaceId);
 const result=b346VerifyEventStream(w,originalIds,
  shooter.actualHumanShotRequests,w.actualEndNativeTick);
 need(shooter.actualOriginalChangedCells>0&&
  w.realOriginalChangedCells>=shooter.actualOriginalChangedCells,
  'TRUE_SOURCE_OWNER_INK_CHANGE');
 return {...result,actualHumanShots:shooter.actualHumanShotRequests,
  actuallyObservedHumanOriginalChangedCells:shooter.actualOriginalChangedCells,
  realMouseWASDFootSource:source.verdict,
  nativeB345OpeningShots:opening.realExperimentFirst12TickShots,
  realHumanPhysicsNoFabrication:true};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];need(!!dir,'REAL_NATIVE_EVIDENCE_DIR');
 const read=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
 const v=b346AuditNativeFull(
  read('b346-genuine-physical-projectile-events.json'),
  read('b337-real-input-ink.json'),
  read('b344-native-human-shooter-ticks.json'));
 writeFileSync(join(dir,'b346-verified-native-physics-verdict.json'),
  JSON.stringify(v,null,2)+'\n');
 console.log('B346_ACTUAL_NATIVE_3D_SHOOTER_VERDICT',JSON.stringify(v));
}
