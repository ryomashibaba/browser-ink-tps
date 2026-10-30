import test from 'node:test';
import assert from 'node:assert/strict';
import {b346VerifyEventStream} from './t21-b346-native-projectile-audit.mjs';
const ids=Array.from({length:17},(_,i)=>'original-'+i);
const valid=()=>({
 schema:'B346_REAL_3D_NATIVE_SOURCE_SHOOTER_EVENTS',
 source:'25/17/26/0',injectedPhysicalShots:false,
 injectedInk:false,injectedTicks:false,sourceScoreable:0,
 productionAuthorized:false,actualEndNativeTick:120,
 realHumanShotsAtEnd:1,realOriginalChangedCells:20,
 physicalWitness:{enabled:true,source:'25/17/26/0',
  genuinePlayCanvasProjectileSlotsOnly:true,
  noSyntheticProjectilesOrCollision:true,noPaintOrActorInjection:true,
  scoreablePromotions:0,productionAuthorized:false,droppedOldestEvents:0,
  observedNativeTick:120,totalActualShooterLaunches:1,
  totalActualShooterExits:1,
  events:[
   {kind:'LAUNCH',launchId:1,nativeTick:100,slotName:'Projectile:7',
    weaponId:'pulse-sprayer',worldPosition:[0,8,67],
    worldVelocity:[0,0,-28],gravity:4,lifeSeconds:1.8,paintRadius:.6},
   {kind:'EXIT',launchId:1,nativeTick:120,reason:'ORIGINAL_PAINTABLE',
    worldPosition:[0,7,65],originalPaintSurfaceId:'original-0'}
  ]}
});
test('B346 synthetic schema fixture cannot certify game and validates actual shapes',()=>{
 const v=b346VerifyEventStream(valid(),ids,1,120);
 assert.equal(v.actualNativePhysicalLaunches,1);
 assert.equal(v.actualOriginalPaintableImpactCount,1);
 assert.equal(v.exactNintendoWeaponCertified,false);
});
test('B346 refuses forged bullet, map and native tick',()=>{
 for(const mutate of [
  x=>x.injectedPhysicalShots=true,
  x=>x.physicalWitness.totalActualShooterLaunches=2,
  x=>x.physicalWitness.events[0].worldVelocity=[0,0,0],
  x=>x.physicalWitness.events[1].originalPaintSurfaceId='FAKE_SURFACE',
  x=>x.physicalWitness.events[1].nativeTick=50,
  x=>x.physicalWitness.droppedOldestEvents=1,
  x=>x.physicalWitness.events[0].weaponId='fake-gun'
 ]){
  const x=valid();mutate(x);
  assert.throws(()=>b346VerifyEventStream(x,ids,1,120),
   /B346_PHYSICAL_SOURCE_/);
 }
});
