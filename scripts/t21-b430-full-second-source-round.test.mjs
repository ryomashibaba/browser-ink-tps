import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB430TrueSecond180s,auditB438SecondRoundWalk}
 from './t21-b430-full-second-source-round.mjs';
const base={source:'25/17/26/0',scoreable:0,winner:'NONE',
 relocations:0,prod:false,fourvfour:false,cpuCount:7};
const f=()=>{
 const replay={schema:'B419_REAL_NATIVE_ENDSCREEN_TWO_WORLDS',
  clicked:true,syntheticTicks:false,actorWrites:0,scoreWrites:0,
  realEscapeInputSent:false,pointerExitMethod:'ALREADY_UNLOCKED',
  pointerLockReleased:true,
  old:{...base,phase:'TIME_UP',tick:11858,remaining:0,rejoins:7,shots:115,
   mission:'CLEAR',replayVisible:true,origin:1000},
  boot:{...base,phase:'STAGING',tick:0,remaining:180,rejoins:0,shots:0,
   mission:'IDLE',hp:100,ink:100,origin:5000,pageReady:true,
   url:'?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&'+
    't21W10B193=allyCoop&t21W10B203=fullRound'},
  armed:{...base,phase:'STAGING',tick:0,remaining:180,rejoins:0,shots:0,
   mission:'ARMED',origin:5000},
  started:{...base,phase:'PLAYING',tick:1056,remaining:179.98,rejoins:7,
   shots:0,mission:'RUNNING',origin:5000,paused:false,ink:100},
  fired:{...base,phase:'PLAYING',tick:1074,remaining:179.68,rejoins:7,
   shots:7,mission:'RUNNING',origin:5000,paused:false,ink:93.35}
 };
 const sample={...base,origin:5000,rejoins:7,paused:false,
  mission:'CLEAR',shots:7,ink:93.35,cpuSourceShots:35,
  cpuPaintCells:400,humanPaintCells:12,pointerLocked:true};
 return {schema:'B430_TRUE_SECOND_SOURCE_180S',base:replay,secondOrigin:5000,
  syntheticTicks:false,actorWrites:0,scoreWrites:0,nativeClockWrites:0,
  samples:[
   {...sample,label:'120',phase:'PLAYING',tick:4700,remaining:119.98},
   {...sample,label:'60',phase:'PLAYING',tick:8300,remaining:59.98,
    shots:12,cpuSourceShots:70,cpuPaintCells:800},
   {...sample,label:'TIME_UP',phase:'TIME_UP',tick:11859,remaining:0,
    shots:17,cpuSourceShots:100,cpuPaintCells:1200,paused:true,pointerLocked:false}],
  humanActivity:[
   {label:'120',origin:5000,beforeTick:4700,afterTick:4730,
    beforeShots:7,afterShots:12,beforeInk:100,afterInk:95.25,
    nativeCpuCount:7,syntheticInput:false,actorWrites:0,
    scoreWrites:0,nativeClockWrites:0},
   {label:'60',origin:5000,beforeTick:8300,afterTick:8330,
    beforeShots:12,afterShots:17,beforeInk:100,afterInk:95.25,
    nativeCpuCount:7,syntheticInput:false,actorWrites:0,
    scoreWrites:0,nativeClockWrites:0}],
  secondEndUi:{visible:true,realModalFinished:true,buttonVisible:true,
   buttonDisabled:false}};
};
test('two real 180s rounds preserve original source and no turf authority',()=>{
 const result=auditB430TrueSecond180s(f());
 assert.equal(result.fullSecondMatch180s,true);
 assert.equal(result.full4v4Certified,false);
 assert.equal(result.officialScoreable,0);
 assert.equal(result.secondRealLateHumanFireBursts,2);
 assert.equal(result.secondRealLateHumanShots,10);
});
test('B438 real replay uses genuine original HUMAN KCC, never a synthetic walkway',()=>{
 const t=f();
 const m=(label,beforeTick,afterTick,from,to,shots)=>({
  label,origin:5000,nativeKey:'KeyW',beforeTick,afterTick,from,to,
  originalPlanarMeters:Math.hypot(to[0]-from[0],to[2]-from[2]),
  shotsBefore:shots,shotsAfter:shots,
  originalFootBefore:'UndertowT21D:spawn-high-positive-z',
  originalFootAfter:'UndertowT21D:spawn-high-positive-z',
  supportedBefore:true,supportedAfter:true,
  originalSourceOnlyBefore:true,originalSourceOnlyAfter:true,
  originalWitnessSchemaBefore:'W10_B130_REGISTERED_ORIGINAL_FLAT_EDGE_HUD_V1',
  originalWitnessSchemaAfter:'W10_B130_REGISTERED_ORIGINAL_FLAT_EDGE_HUD_V1',
  sourceBoundaryClearanceBefore:2.5,sourceBoundaryClearanceAfter:2.1,
  beforeMode:'HUMAN',afterMode:'HUMAN',
  cpuBefore:7,cpuAfter:7,syntheticInput:false,
  actorWrites:0,scoreWrites:0,nativeClockWrites:0
 });
 t.humanMovement=[
  m('120',4730,4739,[1,3,45],[1.4,3,45.15],12),
  m('60',8330,8339,[1.4,3,45.15],[1.8,3,45.3],17)];
 const pass=auditB438SecondRoundWalk(t);
 assert.ok(pass.realPlanarMeters>.8);
 assert.equal(pass.full4v4Certified,false);
 for(const mutate of [
  x=>x.humanMovement.pop(),
  x=>x.humanMovement[0].nativeKey='FAKE',
  x=>x.humanMovement[0].originalFootAfter='FAKE_BRIDGE',
  x=>x.humanMovement[0].supportedAfter=false,
  x=>x.humanMovement[0].sourceBoundaryClearanceAfter=.4,
  x=>x.humanMovement[0].originalWitnessSchemaAfter='FAKE',
  x=>x.humanMovement[0].originalSourceOnlyAfter=false,
  x=>x.humanMovement[0].shotsAfter=999,
  x=>x.humanMovement[1].origin=9000,
  x=>x.humanMovement[1].cpuAfter=6,
  x=>x.humanMovement[1].beforeMode='SQUID',
  x=>x.humanMovement[1].actorWrites=1,
  x=>x.humanMovement[1].to=[900,3,45],
  x=>x.humanMovement[1].afterTick=11890
 ]){
  const wrong=structuredClone(t);mutate(wrong);
  assert.throws(()=>auditB438SecondRoundWalk(wrong),
   /B430_TRUE_SECOND_180S_HOLD_B438_/);
 }
 // The prior already certified B430 file remains fully valid.
 assert.equal(auditB430TrueSecond180s(f()).fullSecondMatch180s,true);
 assert.throws(()=>auditB438SecondRoundWalk(f()),
  /B430_TRUE_SECOND_180S_HOLD_B438_SECOND_ROUND_WALK_COUNT/);
});
test('fake second source, premature clock, broken CPU and forged score fail',()=>{
 const corrupt=[
  d=>d.secondOrigin=1000,
  d=>d.base.fired.shots=0,
  d=>d.samples[2].remaining=1,
  d=>d.samples[2].tick=11000,
  d=>d.samples[1].rejoins=6,
  d=>d.samples[1].scoreable=1,
  d=>d.samples[1].origin=1000,
  d=>d.samples[0].pointerLocked=false,
  d=>d.samples[2].cpuPaintCells=0,
  d=>d.samples[2].phase='PLAYING',
  d=>d.secondEndUi.visible=false,
  d=>d.nativeClockWrites=1,
  d=>d.base.actorWrites=1,
  d=>d.humanActivity.pop(),
  d=>d.humanActivity[0].origin=1000,
  d=>d.humanActivity[0].afterTick=8500,
  d=>d.humanActivity[0].afterShots=7,
  d=>d.humanActivity[1].beforeInk=1,
  d=>d.humanActivity[1].syntheticInput=true
 ];
 for(const mut of corrupt){
  const d=f();mut(d);
  assert.throws(()=>auditB430TrueSecond180s(d),/B4(19|30)_/);
 }
});
