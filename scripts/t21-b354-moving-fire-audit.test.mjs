import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditB354MovingFire} from './t21-b354-moving-fire-audit.mjs';
function sample(){
 const stages=['PRE_FIRE','HOLD_12','HOLD_24','HOLD_36','HOLD_48','HOLD_60'];
 const q=stages.map((label,i)=>({
  label,tick:100+i*12,body:[0,i===3?9:8,68-i*.2],
  grounded:i!==3,physicalShooterLaunches:i*2,
  changedInk:i*40,playerInk:100-i}));
 const w={schema:'B354_REAL_SOURCE_MOVING_AIR_SHOOTER',
  source:'25/17/26/0',realCdpKeyW:true,realSpace:true,
  realMouseHeldFire:true,noTeleport:true,noFakeTicks:true,
  noFakeShots:true,noInkInjection:true,originalScoreable:0,
  productionAuthorized:false,NintendoExactWeaponCertified:false,
  artAccepted:false,unrestricted4v4Certified:false,
  movement:[{kind:'realKeyWDown',tick:112,body:[0,8,68],grounded:true},
   {kind:'realKeyWUp',tick:148,body:[0,9,66.8],grounded:false}],
  checkpoints:q,originalHumanPaintChangedCells:200,
  trueNativeShooterLaunches:10,nativeFinalTick:200,
  truePhysicalCpuHitExits:0,trueEnemyHpDamage:0};
 const physics={source:'25/17/26/0',actualEndNativeTick:200,
  physicalWitness:{totalActualShooterLaunches:10,
   events:Array.from({length:10},(_,i)=>({
    kind:'LAUNCH',nativeTick:105+i*6,
    worldPosition:[0,i<5?8:9,68-i*.24],
    worldVelocity:[0,0,-28],nativeGroundedAtLaunch:i<5}))}};
 const b353={source:'25/17/26/0',physicalCpuHitExits:0,
  humanCpuHpHitsAfter:0,humanCpuHpHitsBefore:0};
 return {w,physics,b353};
}
test('true movement while firing on real CPU/source authority is bounded',()=>{
 const s=sample(),v=auditB354MovingFire(s.w,s.physics,s.b353);
 assert.equal(v.verdict,'PASS_ACTUAL_SIMULTANEOUS_KEYW_SPACE_SHOOT_AND_SOURCE_PAINT');
 assert.ok(v.groundedWhileMovingShots>0&&v.airborneWhileMovingShots>0);
});
test('fake movement, fixed muzzle, fake ink, actor teleport fail closed',()=>{
 for(const mutate of [
  s=>s.w.movement[1].body[2]=68,
  s=>s.w.checkpoints[3].grounded=true,
  s=>s.physics.physicalWitness.events.forEach(e=>e.worldPosition=[0,8,68]),
  s=>s.w.trueNativeShooterLaunches=9,
  s=>s.w.originalHumanPaintChangedCells=0,
  s=>s.w.trueEnemyHpDamage=1,
  s=>s.w.noTeleport=false
 ]){const s=sample();mutate(s);
  assert.throws(()=>auditB354MovingFire(s.w,s.physics,s.b353),
  /B354_REAL_SOURCE_MOVE_FIRE_/);
 }
});

test('B354: slow Chromium screenshot must never interrupt Space key release in active held-fire loop',()=>{
 const source=readFileSync('scripts/t21-b349-source-jump-round.mjs','utf8');
 const start=source.indexOf('for(const tickOffset of [12,24,36,48,60])');
 const end=source.indexOf('}finally{',start);
 assert.ok(start>=0&&end>start);
 const active=source.slice(start,end);
 assert.ok(!active.includes('await picture('),
  'CDP screenshot blocks real-time native Space keyUp and invalidates KCC evidence');
 assert.ok(source.includes("await picture('B354_POST_MOVING_FIRE');"));
});
