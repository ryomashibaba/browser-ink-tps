import test from 'node:test';
import assert from 'node:assert/strict';
import {b408AuditLiveOriginalAim} from './t21-b408-native-original-aim-audit.mjs';
const foot='UndertowT21D:spawn-high-positive-z';
function f(){
 const waves=[150,120,90,60,30].map((remaining,i)=>{
  const tick=2900+i*1800;
  return {remaining,before:{tick,originalFootSolid:foot,
   humanShots:10+i*10,humanChangedCells:90+i*20},
   after:{tick:tick+100,humanShots:20+i*10,humanChangedCells:110+i*20},
   actualCdpMouse:[840,600],b408Aim:{
    plan:{schema:'B408_NATIVE_REAL_ORIGINAL_ACTIVE_GRID_AIM',
     source:'25/17/26/0',scoreable:0,simulatedInput:false,paintWrites:0,
     actorRelocations:0,actualPaintChangedCellsGuaranteed:false,
     opponentHitCertified:false,ownerBefore:0,nativeTick:tick+10,
     surfaceId:foot+':paint',grid:[10,10],world:[1,3,4],
     cdp:[840,600],yaw:10,pitch:-20},
    nativeMouseDispatched:true,
    realObservedCamera:{yawDegrees:10,pitchDegrees:-20},
    impactTick:tick+60,realLastPaintSurface:foot+':paint',
    additionalShots:9,realAddedCells:20
   }};
 });
 return {raw:{waves},round:{}};
}
const injected={auditB407:()=>({
 verdict:'PASS_FIVE_REAL_HUMAN_KCC_AND_FIRE_WAVES_IN_ONE_180S_SOURCE_GAME'})};
test('five actual native CDP-aimed original impacts produce source-only PASS',()=>{
 const {raw,round}=f(),r=b408AuditLiveOriginalAim(raw,round,injected);
 assert.equal(r.genuineNewOriginalGridCells,100);
 assert.equal(r.actualNativeHumanShots,45);
 assert.equal(r.actualOpponentHpDamageCertified,false);
});
test('fake camera, pointer, paint cells, source, impact and score HOLD',()=>{
 for(const change of [
  x=>{x.raw.waves[0].b408Aim.plan.scoreable=1;},
  x=>{x.raw.waves[0].b408Aim.plan.simulatedInput=true;},
  x=>{x.raw.waves[0].b408Aim.plan.ownerBefore=9;},
  x=>{x.raw.waves[0].b408Aim.plan.source='FAKE';},
  x=>{x.raw.waves[0].b408Aim.plan.surfaceId='OTHER';},
  x=>{x.raw.waves[0].b408Aim.impactTick=0;},
  x=>{x.raw.waves[0].b408Aim.realLastPaintSurface='OTHER';},
  x=>{x.raw.waves[0].b408Aim.nativeMouseDispatched=false;},
  x=>{x.raw.waves[0].b408Aim.realObservedCamera.yawDegrees=160;},
  x=>{x.raw.waves[0].b408Aim.realAddedCells=-1;},
  x=>{x.raw.waves[0].b408Aim.additionalShots=0;},
  x=>{x.raw.waves[0].actualCdpMouse=[1,1];}
 ]){
  const x=f();change(x);
  assert.throws(()=>b408AuditLiveOriginalAim(x.raw,x.round,injected),
   /B408_REAL_NATIVE_TARGET_HOLD_/);
 }
});
