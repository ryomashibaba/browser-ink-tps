import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareRealOriginalB2B4CpuMobility} from './t21-v28-qa-real-b2b4-diff.mjs';

function make(){
 const makeRows=(id,stationaryAfter=20)=>Array.from({length:630},(_,i)=>({
  tick:1000+i,id,foot:[Math.min(i,stationaryAfter)*.2,3,id==='B2'?-50:-51],
  mode:'GROUND',life:'ACTIVE',rejoined:true,
  originalRapierSolidId:'UndertowT21D:first-drop-landing-negative-z',
  originalRapierHitY:3,registeredOriginalHit:true
 }));
 return {
  schema:'B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1',
  source:'25/17/26/0',originalWinner:'NONE',
  originalPathAuthorizationChanged:false,
  originalKccOrGameWrites:0,
  continuousCapsuleContactCertified:false,
  b2b4FrontlineGoalCertified:false,
  originalSourceGeometryWrites:0,actorWrites:0,
  nativeClockWrites:0,scoreWrites:0,
  browserWorldOrigin:1794898813966.9,
  rows:{B2:makeRows('B2'),B4:makeRows('B4')},dropped:{B2:0,B4:0}
 };
}
const clone=x=>JSON.parse(JSON.stringify(x));
test('two genuinely identical B2/B4 Rapier 60Hz streams cannot claim CPU fix',()=>{
 const old=make(),next=clone(old);next.browserWorldOrigin+=100;
 const r=compareRealOriginalB2B4CpuMobility(old,next);
 assert.equal(r.overallVerdict,'HOLD_NO_OBSERVED_B2_B4_PHYSICAL_MOBILITY_CHANGE');
 assert.equal(r.byCpu.B2.commonNativeTickCount,630);
 assert.equal(r.byCpu.B2.exactlyEqualThreeDimensionalFootTicks,630);
 assert.equal(r.byCpu.B4.exactlyEqualThreeDimensionalFootTicks,630);
 assert.equal(r.byCpu.B4.maximumThreeDimensionalFootDeviationMeters,0);
 assert.equal(r.byCpu.B2.stationaryReductionObservedInThisWindow,false);
 assert.equal(r.byCpu.B2.fullGameplayMovementImprovementCertified,false);
 assert.equal(r.formal4v4Certified,false);
});
test('different native paths can register reduced stillness but not overall game PASS',()=>{
 const a=make(),b=clone(a);
 b.rows.B2=b.rows.B2.map((v,i)=>({...v,foot:[
  Math.min(i,40)*.2,3,-50]}));
 const r=compareRealOriginalB2B4CpuMobility(a,b);
 assert.equal(r.overallVerdict,'OBSERVED_REAL_FOOT_DIFFERENCE_REQUIRE_GAMEPLAY_CONFIRMATION');
 assert.equal(r.byCpu.B2.firstChangedTick,1021);
 assert.equal(r.byCpu.B2.stationaryReductionObservedInThisWindow,true);
 assert.equal(r.byCpu.B2.fullGameplayMovementImprovementCertified,false);
 assert.equal(r.byCpu.B4.movementIdenticalThisObservedWindow,true);
});
test('new actor, KCC or original physical authority writes invalidate all comparisons',()=>{
 for(const [name,value] of [
  ['actorWrites',1],['originalKccOrGameWrites',1],
  ['originalSourceGeometryWrites',1],['scoreWrites',1],
  ['nativeClockWrites',1],['originalPathAuthorizationChanged',true],
  ['b2b4FrontlineGoalCertified',true],['continuousCapsuleContactCertified',true]
 ]){
  const a=make(),b=make();b[name]=value;
  assert.throws(()=>compareRealOriginalB2B4CpuMobility(a,b),
   /REAL_SOURCE_NATIVE_PROVENANCE_REQUIRED/);
 }
});
test('unsupported floor, rejoin missing or noncontiguous 60Hz are HOLD not fake mobility',()=>{
 for(const kind of ['support','rejoined','gap','duplicate']){
  const a=make(),b=make();
  if(kind==='support')b.rows.B2[80].registeredOriginalHit=false;
  if(kind==='rejoined')b.rows.B2[80].rejoined=false;
  if(kind==='gap')b.rows.B2[80].tick+=3;
  if(kind==='duplicate')b.rows.B2[80].tick=b.rows.B2[79].tick;
  assert.throws(()=>compareRealOriginalB2B4CpuMobility(a,b),
   /QA18_/);
 }
});
test('less than 600 matching native ticks cannot prove comparable 8-10s stalls',()=>{
 const a=make(),b=make();b.rows.B2=b.rows.B2.slice(100);
 assert.throws(()=>compareRealOriginalB2B4CpuMobility(a,b),/NOT_ENOUGH_SHARED/);
});
test('wrong original geometry or SOURCE profile may not count as original mobility',()=>{
 const a=make(),b=make();b.source='26/17/26/0';
 assert.throws(()=>compareRealOriginalB2B4CpuMobility(a,b),/PROVENANCE/);
});
