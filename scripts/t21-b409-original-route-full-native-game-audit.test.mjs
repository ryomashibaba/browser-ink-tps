import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB409OneRealOriginalSourceRound as audit} from './t21-b409-original-route-full-native-game-audit.mjs';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
function fixture(){
 const labels=['AFTER_ROUTE','150','120','90','60','30','0'];
 const samples=labels.map((label,i)=>({
  label,tick:1000+i*1800,
  secondsRemaining:i===0?160:[-1,150,120,90,60,30,0][i],
  matchState:i===6?'TIME_UP':'PLAYING',paused:i===6,stopReason:null,
  browserWorldOrigin:1730000000000,player:[11.6,5.395,46.8],
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,scoreable:0,
  productionAuthorized:false,unrestricted4v4Certified:false,
  turfResult:'UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED',
  cpuRelocations:0,cpuRejoined:7,
  cpu:ids.map(id=>({id,foot:[0,4,id[0]==='B'?-60:54],
   lifeState:'ACTIVE',hp:100,rejoined:true})),
  humanShots:30+i,humanPaintCells:200+i,
  cpuSourceShots:20+i,cpuPaintCells:100+i*20,
  humanCpuDirectHits:0,humanCpuDirectSplats:0,
  genuineOriginalFoot:i===6?null:{
   solid:'UndertowT21D:right-low-team-a',supported:true,gap:.04},
  pointerLocked:i!==6
 }));
 return {round:{
  schema:'B409_GENUINE_B322_ROUTE_AND_FULL_180S_ONE_SOURCE_GAME',
  source:'25/17/26/0',nativeKeyboardMouse:true,sameBrowserWorld:true,
  syntheticTicks:false,syntheticPlayerOrCpuMoves:false,
  syntheticPaintOrScore:false,originalSourceStageModified:false,
  officialWinner:'NONE',samples
 },evidence:{b316:{},b312:{},b322:{},b324:{},
  b326:{steps:[{after:{tick:500}}]}}};
}
const gates={
 b316:()=>({verdict:'GENUINE_ORIGINAL_RAMP_HUMAN_WALK_PASS',reachedOriginalRampOnGenuineCharacterKcc:true}),
 b315:()=>({verdict:'PASS_AUTHENTIC_THREE_DISTINCT_HUMAN_SOURCE_PAINT_SURFACES'}),
 b322:()=>({verdict:'PASS_REAL_ORIGINAL_RAMP_TO_UPPER_FLOOR',originalUpperFloorReached:true}),
 b324:()=>({verdict:'PASS_GENUINE_ORIGINAL_UPPER_FLOOR_CONTINUOUS_KCC',continuousUpperFloor:true}),
 b326:()=>({verdict:'PASS_GENUINE_EXTENDED_ORIGINAL_UPPER_FLOOR_KCC',extendedUpperFloorProven:true,combinedVerifiedUpperFloorMeters:5.2})
};
test('true original route plus original 3 paint surfaces and native 180s',()=>{
 const f=fixture(),r=audit(f.round,f.evidence,gates);
 assert.equal(r.actualTimeUpTick,11800);
 assert.equal(r.route.b326ExtendedUpperMeters,5.2);
 assert.equal(r.actualHumanEnemyKillRespawnChainCertified,false);
 assert.equal(r.naturalCrossBankRouteCertified,false);
});
test('wrong world/foot/tick/CPU/score fails closed',()=>{
 for(const edit of [
  x=>{x.round.syntheticTicks=true;},
  x=>{x.round.samples[0].secondsRemaining=145;},
  x=>{x.round.samples[1].genuineOriginalFoot.solid='FAKE_FLOOR';},
  x=>{x.round.samples[2].genuineOriginalFoot.gap=.8;},
  x=>{x.round.samples[3].browserWorldOrigin+=100;},
  x=>{x.round.samples[4].cpuRelocations=1;},
  x=>{x.round.samples[5].scoreable=1;},
  x=>{x.round.samples[5].humanShots=0;},
  x=>{x.round.samples[6].pointerLocked=true;},
  x=>{x.round.samples[6].matchState='PLAYING';},
  x=>{x.round.samples[6].cpu.pop();},
  x=>{x.round.samples[6].secondsRemaining=.02;},
  x=>{x.round.samples[6].tick=x.round.samples[5].tick;},
  x=>{x.evidence.b326.steps[0].after.tick=1200;}
 ]){
  const f=fixture();edit(f);
  assert.throws(()=>audit(f.round,f.evidence,gates),
   /B409_REAL_ONE_GAME_SOURCE_ROUTE_HOLD_/);
 }
});
test('missing independent original route/ink contract fails closed',()=>{
 for(const field of ['b316','b315','b322','b324','b326']){
  const f=fixture(),v={...gates,[field]:()=>({verdict:'HOLD'})};
  assert.throws(()=>audit(f.round,f.evidence,v),
   /B409_REAL_ONE_GAME_SOURCE_ROUTE_HOLD_/);
 }
});
