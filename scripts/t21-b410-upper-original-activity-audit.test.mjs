import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB410OneTrueUpperFloorActiveGame}
 from './t21-b410-upper-original-activity-audit.mjs';
const ORIGINAL='UndertowT21D:right-low-team-a';
const S=ORIGINAL+':paint';
const markers=[120,60,30];
const key=['KeyW','KeyA','KeyS','KeyD'];
function fixture(){
 const labels=['AFTER_ROUTE','150','120','90','60','30','0'];
 const round={samples:labels.map((label,i)=>({
  label,tick:2500+i*1800,humanShots:60+i*10,
  humanPaintCells:900+i*30
 }))};
 const makeWave=(m,i)=>{
  const start=round.samples.find(r=>r.label===String(m)).tick+1;
  const sample=round.samples.find(r=>r.label===String(m));
  const before={tick:start,seconds:m-.04,body:[9,5.4,47],
   originalFootSolid:ORIGINAL,originalFootSupported:true,
   pointerLocked:true,sevenCpuRejoined:7,
   humanShots:sample.humanShots,humanChangedCells:sample.humanPaintCells};
  const legs=key.map((code,j)=>({
   code,fromTick:start+j*9,toTick:start+j*9+9,
   from:[9+j*.3,5.4,47],to:[9+(j+1)*.3,5.4,47],
   planarMeters:.3,originalFootSolid:ORIGINAL,
   originalSupport:true,noActorTeleport:true
  }));
  const after={tick:start+65,seconds:m-1.1,body:[10.2,5.4,47],
   originalFootSolid:ORIGINAL,originalFootSupported:true,
   pointerLocked:true,sevenCpuRejoined:7,
   humanShots:before.humanShots+8,humanChangedCells:before.humanChangedCells+12};
  const plan={schema:'B408_NATIVE_REAL_ORIGINAL_ACTIVE_GRID_AIM',
   source:'25/17/26/0',surfaceId:S,ownerBefore:0,
   simulatedInput:false,paintWrites:0,actorRelocations:0,scoreable:0,
   actualPaintChangedCellsGuaranteed:false,opponentHitCertified:false,
   nativeTick:start+37,grid:[13,15],world:[11,5.2,49],
   cdp:[820,480],yaw:22,pitch:-12};
  return {remaining:m,source:'25/17/26/0',sameOriginalNativeGame:true,
   injectedTime:false,injectedInk:false,injectedActorPositions:false,
   before,after,legs,totalRealKccPlanarMeters:1.2,actualCdpMouse:[820,480],
   b408Aim:{plan,nativeMouseDispatched:true,
    realObservedCamera:{yawDegrees:22,pitchDegrees:-12},
    realLastPaintSurface:S,impactTick:start+60,additionalShots:8,
    realAddedCells:12}};
 };
 const extra={schema:'B410_GENUINE_NATIVE_LATE_UPPER_FLOOR_ACTIVE_PLAYER',
  source:'25/17/26/0',sameB409BrowserWorld:true,
  syntheticTickWrites:0,syntheticPositionWrites:0,
  syntheticPaintWrites:0,officialWinner:'NONE',
  waves:markers.map(makeWave)};
 const route={b316:{},b312:{},b322:{},b324:{},b326:{}};
 return {round,extra,route};
}
const deps={b409:()=>({
 verdict:'PASS_ONE_REAL_180S_7CPU_WITH_ORIGINAL_RAMP_UPPER_ROUTE_AND_3_HUMAN_PAINT_SURFACES',
 route:{b326ExtendedUpperMeters:5.2,b315RealDistinctHumanPaintSurfaces:3},
 actualTimeUpTick:13300
})};
test('genuine fourth SOURCE paint surface in 3 late 180s activity windows',()=>{
 const f=fixture();
 f.round.samples[6].tick=13300;
 const v=auditB410OneTrueUpperFloorActiveGame(f.round,f.route,f.extra,deps);
 assert.equal(v.genuineDistinctOriginalHumanPaintSurfaces,4);
 assert.equal(v.additionalRealUpperNativeShots,24);
 assert.equal(v.additionalObservedHumanChangedCells,36);
 assert.ok(v.additionalNativeUpperKccMeters>3);
 assert.equal(v.formal4v4Certified,false);
});
test('reject missing original support, synthetic data and unaimed impact',()=>{
 for(const edit of [
  f=>{f.extra.syntheticPositionWrites=1;},
  f=>{f.extra.waves.pop();},
  f=>{f.extra.waves[0].before.originalFootSolid='FAKE';},
  f=>{f.extra.waves[0].after.pointerLocked=false;},
  f=>{f.extra.waves[0].legs[0].originalSupport=false;},
  f=>{f.extra.waves[0].legs[1].code='KeyS';},
  f=>{f.extra.waves[0].legs[0].planarMeters=8;},
  f=>{f.extra.waves[0].b408Aim.plan.surfaceId='OTHER';},
  f=>{f.extra.waves[0].b408Aim.plan.ownerBefore=5;},
  f=>{f.extra.waves[0].b408Aim.plan.scoreable=1;},
  f=>{f.extra.waves[0].b408Aim.realObservedCamera.yawDegrees=100;},
  f=>{f.extra.waves[0].b408Aim.impactTick=0;},
  f=>{f.extra.waves[0].b408Aim.realLastPaintSurface='OTHER';},
  f=>{f.extra.waves[0].b408Aim.realAddedCells=-1;},
  f=>{f.extra.waves[0].after.humanShots=0;}
 ]){
  const f=fixture();f.round.samples[6].tick=13300;edit(f);
  assert.throws(()=>auditB410OneTrueUpperFloorActiveGame(f.round,f.route,f.extra,deps),
   /B410_GENUINE_SAME_180S_UPPER_ACTIVE_PLAY_HOLD_/);
 }
});
