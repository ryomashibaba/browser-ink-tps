import test from 'node:test';
import assert from 'node:assert/strict';
import {b433CaptureReadOnlySourcePoll,b433AuditOriginalOpponentPolls}
 from './t21-b433-native-opponent-poll-audit.mjs';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
const actor=(id,i)=>({id,physicalFoot:[i,4,i<3?46:-50],
 lifeState:'ACTIVE',hp:100,rejoined:true});
const raw=(tick,remaining,phase='PLAYING')=>({
 originalSourceSolids:25,originalPaintSurfaces:17,
 originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
 productionAuthorized:false,unrestricted4v4Certified:false,
 cpu:{physicalFootRelocations:0,physicalRejoins:ids.slice(),
  cpu:ids.map(actor)},
 tick,timeRemainingSeconds:remaining,matchState:phase,
 paused:phase==='TIME_UP',player:{position:[10,4,46]},
 shotsFired:65,cpuSourceTurfShots:110,
 humanCpuDirectHits:0,humanCpuDirectSplats:0
});
const fixture=()=>{
 const ticks=[2350,2860,4630,6450,8270,10030,11858];
 const remaining=[158.5,150,120,90,60,30,0];
 const polls=ticks.map((tick,i)=>b433CaptureReadOnlySourcePoll(
  raw(tick,remaining[i],i===6?'TIME_UP':'PLAYING')));
 return {schema:'B433_SOURCE_NATIVE_BROWSER_POLL_SAMPLES',
  source:'25/17/26/0',nativeObserverOnly:true,
  syntheticTicks:false,actorWrites:0,inkWrites:0,
  scoreWrites:0,nativeClockWrites:0,pointerOrInputWrites:0,
  originalScoreable:0,officialWinner:'NONE',
  browserWorldOrigin:5000,polls};
};
test('genuine SOURCE browser-poll sampler copies original actors and clock only',()=>{
 const n=raw(3000,145);
 const a=b433CaptureReadOnlySourcePoll(n);
 assert.equal(a.actors.length,7);
 assert.equal(a.tick,3000);
 assert.equal(a.paused,false);
 assert.equal(n.cpu.cpu[0].hp,100);
});
test('B433 independent audit does not claim unobserved 60Hz ticks or traversal',()=>{
 const v=b433AuditOriginalOpponentPolls(fixture());
 assert.equal(v.polls,7);
 assert.ok(v.closestSampledHumanEnemy.meters>90);
 assert.equal(v.allNativeTicksObserved,false);
 assert.equal(v.betweenPollsEnemyEncounterResolved,false);
 assert.equal(v.enemyRouteOrHitCertified,false);
 assert.equal(v.originalScoreable,0);
});
test('fake geometry, actor, game state, time and scores are rejected',()=>{
 for(const mutate of [
  x=>x.sourceScoreablePromotions=1,
  x=>x.cpu.physicalFootRelocations=1,
  x=>x.cpu.cpu[0].physicalFoot=[Infinity,1,1],
  x=>x.player.position=[NaN,2,3],
  x=>x.cpu.cpu[6].rejoined=false,
  x=>x.cpu.cpu.pop(),
  x=>x.matchState='STAGING'
 ]){
  const r=raw(3000,145);mutate(r);
  assert.throws(()=>b433CaptureReadOnlySourcePoll(r),/B433_TRUE_SOURCE_POLL_HOLD_/);
 }
 for(const mutate of [
  x=>x.actorWrites=1,
  x=>x.polls[3].tick=200,
  x=>x.polls[4].remaining=130,
  x=>x.polls[5].actors[0].lifeState='TELEPORTED',
  x=>x.polls[6].phase='PLAYING',
  x=>x.polls[6].remaining=1,
  x=>x.polls[6].paused=false,
  x=>x.polls[6].player=[Infinity,2,3],
  x=>x.polls[0].actors[0].foot=[NaN,2,3],
  x=>x.polls.pop(),
  x=>x.browserWorldOrigin=0,
  x=>x.originalScoreable=1
 ]){
  const d=fixture();mutate(d);
  assert.throws(()=>b433AuditOriginalOpponentPolls(d),/B433_TRUE_SOURCE_POLL_HOLD_/);
 }
});
