import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB432ObservedOriginalOpponentFrontier}
 from './t21-b432-observed-opponent-frontier.mjs';

const ids=['A1','A2','A3','B1','B2','B3','B4'];
const labels=['AFTER_ROUTE','150','120','90','60','30','0'];
const fixture=()=>{
 const samples=labels.map((label,i)=>({
  label,tick:[2351,2860,4655,6463,8260,10057,11858][i],
  matchState:i===6?'TIME_UP':'PLAYING',
  secondsRemaining:i===6?0:180-i*30,paused:i===6,
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,scoreable:0,
  productionAuthorized:false,unrestricted4v4Certified:false,
  turfResult:'UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED',
  browserWorldOrigin:1500,cpuRelocations:0,cpuRejoined:7,
  player:[10,5,46],humanShots:5+i*6,cpuSourceShots:8+i*11,
  humanCpuDirectHits:0,humanCpuDirectSplats:0,
  cpu:ids.map((id,j)=>({id,foot:[j,4,j<3?46:-50],
   lifeState:'ACTIVE',rejoined:true,hp:100}))
 }));
 return {schema:'B409_GENUINE_B322_ROUTE_AND_FULL_180S_ONE_SOURCE_GAME',
  source:'25/17/26/0',nativeKeyboardMouse:true,
  sameBrowserWorld:true,syntheticTicks:false,
  syntheticPlayerOrCpuMoves:false,syntheticPaintOrScore:false,
  originalSourceStageModified:false,officialWinner:'NONE',samples};
};
test('read-only seven native snapshots show sampled XZ distance, not inferred contacts',()=>{
 const got=auditB432ObservedOriginalOpponentFrontier(fixture());
 assert.equal(got.observedNativeSamples,7);
 assert.equal(got.finalActualHumanCpuHits,0);
 assert.equal(got.betweenSamplesEncounterResolved,false);
 assert.equal(got.originalNaturalCrossTeamPathCertified,false);
 assert.equal(got.trueFull4v4Certified,false);
 assert.equal(got.officialWinner,'NONE');
 assert.ok(got.minimumSampledHumanEnemyHorizontalMeters>90);
});
test('invalid original source evidence or fabricated score/actor status is rejected',()=>{
 const corrupt=[
  d=>d.syntheticTicks=true,
  d=>d.samples[0].originalSourceSolids=26,
  d=>d.samples[0].scoreable=1,
  d=>d.samples[1].cpuRelocations=1,
  d=>d.samples[2].cpu[0].rejoined=false,
  d=>d.samples[3].cpu.pop(),
  d=>d.samples[4].browserWorldOrigin=2000,
  d=>d.samples[5].tick=200,
  d=>d.samples[6].matchState='PLAYING',
  d=>d.samples[6].secondsRemaining=1,
  d=>d.samples[6].player=[Infinity,3,4],
  d=>d.samples[6].cpu[6].foot=[NaN,0,0],
  d=>d.samples[6].turfResult='A_WINS'
 ];
 for(const mutate of corrupt){
  const d=fixture();mutate(d);
  assert.throws(()=>auditB432ObservedOriginalOpponentFrontier(d),
   /B432_ORIGINAL_OPPONENT_FRONTIER_HOLD_/);
 }
});
