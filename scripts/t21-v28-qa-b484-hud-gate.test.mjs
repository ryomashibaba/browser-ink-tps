import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateB484ModeSpecificHud} from './t21-v28-qa-b484-hud-gate.mjs';

const base=()=>({
 presentation:'PLAYER',nativeTick:1793,matchState:'PLAYING',paused:false,
 playerVisible:true,originalRouteClaim:'false',
 nativeCpuRejoins:7,sourceScoreable:0,
 genuineRequests:2,currentOrderKeyRequest:2,
 currentOrderClosestPhysicalGoalDistanceXZ:.675,
 actualOriginalArrivals:'2',nativeOriginalArrivals:2,
 text:'A1 ALLY · 4.5m · SAME HEIGHT · ROUTE UNVERIFIED\nC ORDER · MOVING · WAIT'
});
test('real PLAYER compact A1 C-order is truthfully accepted without verbose F8 text',()=>{
 const x=validateB484ModeSpecificHud(base());
 assert.equal(x.verdict,'PASS_LIMITED_REAL_PLAYER_COMPACT_HUD');
 assert.deepEqual(x.holdReasons,[]);
 assert.equal(x.nativeCKeyCountVerifiedByThisDomGate,false);
 assert.equal(x.fullOriginalA1RouteCertified,false);
 assert.equal(x.enemyHpHitSplatRespawnCertified,false);
});
test('F8 QA view still requires actual second C-order distance and B471 proof text',()=>{
 const b=base();b.presentation='QA';
 b.text='A1 existing raw\nA1 C ORDER 2 · MOVING · this order closest 0.67m · verified arrivals total 2 · route not certified';
 const x=validateB484ModeSpecificHud(b);
 assert.equal(x.verdict,'PASS_LIMITED_REAL_QA_DETAILED_HUD');
 assert.deepEqual(x.holdReasons,[]);
});
test('normal PLAYER must never be forced to render verbose QA text',()=>{
 const b=base();b.text='A1 C ORDER 2 · verified arrivals total 2 · this order closest 0.67m';
 const x=validateB484ModeSpecificHud(b);
 assert.equal(x.verdict,'HOLD_REAL_NATIVE_HUD');
 assert.ok(x.holdReasons.includes('PLAYER_COMPACT_ALLY_C_ORDER_MISSING'));
 assert.ok(x.holdReasons.includes('PLAYER_VERBOSE_QA_TEXT_LEAKED'));
});
test('actual QA without native order proof cannot pass merely by looking impressive',()=>{
 const b=base();b.presentation='QA';
 b.text='A1 C ORDER 2 · original goal pending / HOLD · verified arrivals total 2 · route not certified';
 const x=validateB484ModeSpecificHud(b);
 assert.equal(x.verdict,'PASS_LIMITED_REAL_QA_DETAILED_HUD');
 b.genuineRequests=1;
 const invalid=validateB484ModeSpecificHud(b);
 assert.ok(invalid.holdReasons.includes('NATIVE_B484_7CPU_SOURCE_STATE_UNVERIFIED'));
});
test('wrong original score, rejoin, time, route certification and invisible HUD never pass',()=>{
 for(const bad of [
  {sourceScoreable:1},{nativeCpuRejoins:6},{paused:true},
  {matchState:'TIME_UP'},{nativeTick:-1},
  {originalRouteClaim:'true'},{playerVisible:false}
 ]){
  const x=validateB484ModeSpecificHud({...base(),...bad});
  assert.equal(x.verdict,'HOLD_REAL_NATIVE_HUD');
 }
});
test('actual DOM arrival must equal native B471 from the same JS task',()=>{
 const bad=validateB484ModeSpecificHud({...base(),actualOriginalArrivals:'1'});
 assert.equal(bad.verdict,'HOLD_REAL_NATIVE_HUD');
 assert.ok(bad.holdReasons.includes('NATIVE_B471_ARRIVAL_COUNTER_NOT_SAME_WORLD'));
 for(const text of [null,'NaN','-1','2.0','9999999999999999999999']){
  const result=validateB484ModeSpecificHud({...base(),actualOriginalArrivals:text});
  assert.equal(result.verdict,'HOLD_REAL_NATIVE_HUD');
 }
});
test('unknown presentation and missing DOM fail closed',()=>{
 const x=validateB484ModeSpecificHud({...base(),presentation:'DEMO'});
 assert.ok(x.holdReasons.includes('UNKNOWN_B245_PRESENTATION_MODE'));
 const y=validateB484ModeSpecificHud(null);
 assert.equal(y.verdict,'HOLD_REAL_NATIVE_HUD');
 assert.equal(y.fullOriginalA1RouteCertified,false);
});
