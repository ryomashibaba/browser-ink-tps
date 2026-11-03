import test from 'node:test';
import assert from 'node:assert/strict';
import {b390NativeRadarSampleConsistent as ok,
 b390NativeLiveGridConsistent as liveOk,
 b390NativeCpuLifeAndOriginalReturnConsistent as cpuLifeOk}
 from './t21-b390-real-source-timeup.mjs';
const radar=(patch={},dotPatch={})=>({
 pageNativeTick:8270,status:'SOURCE_PAINT_SAMPLES',tick:8270,
 a:155,b:0,notScore:'true',originalSolids:'25',originalLinks:'26',
 d:{status:'SOURCE_PAINT_SAMPLES',nativeTick:8270,
  measuredOriginalSurfaces:17,realTeamADots:155,realTeamBDots:0,
  sourceScoreable:0,productionAuthorized:false,
  officialWinner:'NONE',paintWrites:0,fullCoverageInferred:false,
  ...dotPatch},...patch
});
test('accepts a genuine later same-evaluation sample (8264 to 8270)',()=>{
 assert.equal(ok(8264,radar()),true);
});
test('accepts an honest previous 180-tick sampling interval',()=>{
 assert.equal(ok(8264,radar({tick:8130}, {nativeTick:8130})),true);
});
test('rejects future sample even when older checkpoint permits it',()=>{
 assert.equal(ok(8264,radar({tick:8271},{nativeTick:8271})),false);
});
test('rejects page rollback, invalid times, and stale radar render',()=>{
 assert.equal(ok(8264,radar({pageNativeTick:8263})),false);
 assert.equal(ok(8264,radar({tick:8089},{nativeTick:8089})),false);
 assert.equal(ok(8264,radar({pageNativeTick:NaN})),false);
});
test('rejects fabricated paint/official Turf authority',()=>{
 assert.equal(ok(8264,radar({}, {sourceScoreable:1})),false);
 assert.equal(ok(8264,radar({}, {paintWrites:1})),false);
 assert.equal(ok(8264,radar({}, {productionAuthorized:true})),false);
 assert.equal(ok(8264,radar({notScore:'false'})),false);
});
test('requires real original source and identical DOM readbacks',()=>{
 assert.equal(ok(8264,radar({a:154})),false);
 assert.equal(ok(8264,radar({originalLinks:'27'})),false);
 assert.equal(ok(8264,radar({}, {measuredOriginalSurfaces:16})),false);
 assert.equal(ok(8264,radar({b:1})),false);
 assert.equal(ok(8264,radar({status:'HOLD'})),false);
});

const realLive=(patch={},sourcePatch={})=>({
 pageNativeTick:8271,text:'LIVE SOURCE GRID · NOT TURF SCORE',
 hudStatus:'LIVE_REGISTERED_SOURCE_ONLY',hudTick:8271,
 hudTotal:169742,hudA:14845,hudB:15217,hudN:139680,
 winner:'NONE',v:{status:'LIVE_REGISTERED_SOURCE_ONLY',
  sampleNativeTick:8271,registeredSurfaces:17,totalActiveCells:169742,
  teamA:14845,teamB:15217,neutral:139680,
  originalSourceOnly:true,officialTurfScore:false,
  winner:'NONE',gameplayWrites:0,productionAuthorized:false,
  ...sourcePatch},...patch
});
test('B401 accepts true 6-tick CDP sampling advance within the same source match',()=>{
 assert.equal(liveOk(8265,realLive()),true);
 assert.equal(liveOk(8265,realLive({pageNativeTick:8271},
  {sampleNativeTick:8265})),false); // DOM still 8271: genuine mismatch
 assert.equal(liveOk(8265,realLive({pageNativeTick:8271,hudTick:8160},
  {sampleNativeTick:8160})),true); // genuine bounded older HUD sample
});
test('B401 rejects future, stale or non-monotonic native samples',()=>{
 assert.equal(liveOk(8272,realLive()),false);
 assert.equal(liveOk(8265,realLive({pageNativeTick:8270})),false);
 assert.equal(liveOk(8265,realLive({pageNativeTick:8452})),false);
 assert.equal(liveOk(8265,realLive({pageNativeTick:NaN})),false);
 assert.equal(liveOk(8265,realLive({hudTick:8270})),false);
});
test('B401 rejects false scores, forged readbacks or incoherent SOURCE cells',()=>{
 assert.equal(liveOk(8265,realLive({}, {officialTurfScore:true})),false);
 assert.equal(liveOk(8265,realLive({}, {productionAuthorized:true})),false);
 assert.equal(liveOk(8265,realLive({}, {registeredSurfaces:16})),false);
 assert.equal(liveOk(8265,realLive({}, {teamA:15000})),false);
 assert.equal(liveOk(8265,realLive({hudB:15100})),false);
});

const cpuLife=(life={},patrol={})=>{
 const ids=['A1','A2','A3','B1','B2','B3','B4'];
 const returning=life.returning??[];
 const splatted=life.splatted??[];
 const absent=[...returning,...splatted];
 return {
  physicalFootRelocations:0,
  physicalRejoins:ids.filter(id=>!absent.includes(id)),
  cpu:ids.map(id=>({id,rejoined:!absent.includes(id),
   lifeState:splatted.includes(id)?'SPLATTED':'ACTIVE',
   hp:splatted.includes(id)?0:100})),
  sourcePatrol:{respawnPendingCpuIds:returning,
   respawnOriginalDetected:returning.length,
   respawnOriginalGoalRequests:0,respawnOriginalRejoins:0,
   respawnUnsafeReturnHolds:0,...patrol},
  ...life
 };
};
test('B390 validates all seven genuine first-drop rejoins with no respawn',()=>{
 assert.equal(cpuLifeOk(cpuLife(),0,0),true);
});
test('B390 permits a genuine native CPU to be alive at its original upper spawn',()=>{
 assert.equal(cpuLifeOk(cpuLife({returning:['B1']}),1,1),true);
 assert.equal(cpuLifeOk(cpuLife({returning:['B1','B2']},
  {respawnOriginalDetected:2}),2,2),true);
});
test('B390 refuses unexplained missing original CPU rejoin or fake respawn',()=>{
 assert.equal(cpuLifeOk(cpuLife({returning:['B1']}),0,0),false);
 assert.equal(cpuLifeOk(cpuLife({
  physicalRejoins:['A1','A2','A3','B2','B3','B4']}),0,0),false);
 assert.equal(cpuLifeOk(cpuLife({returning:['B1']},{
  respawnOriginalDetected:0}),1,1),false);
 assert.equal(cpuLifeOk(cpuLife({returning:['B1']},{
  respawnOriginalRejoins:2}),1,1),false);
 assert.equal(cpuLifeOk(cpuLife({returning:['B1']},{
  respawnOriginalDetected:2}),1,1),false);
 assert.equal(cpuLifeOk(cpuLife({returning:['B1'],physicalFootRelocations:1}),1,1),false);
});
test('B390 rejects stolen original spawn return identities and duplicate actors',()=>{
 assert.equal(cpuLifeOk(cpuLife({returning:['X1']}),1,1),false);
 assert.equal(cpuLifeOk(cpuLife({
  cpu:cpuLife().cpu.map((a,i)=>i===6?{...a,id:'B1'}:a)}),0,0),false);
 assert.equal(cpuLifeOk(cpuLife({
  sourcePatrol:{...cpuLife().sourcePatrol,
   respawnPendingCpuIds:['B1']}}),0,0),false);
});

test('B390 accounts for a genuinely SPLATTED native CPU before its 150-tick return',()=>{
 assert.equal(cpuLifeOk(cpuLife({splatted:['B1']}),0,1),true);
 assert.equal(cpuLifeOk(cpuLife({splatted:['B1','B2']}),0,2),true);
 assert.equal(cpuLifeOk(cpuLife({splatted:['B1'],returning:['B2']},
  {respawnOriginalDetected:1}),1,2),true);
});
test('B390 rejects dead bots with retained prior-life landing or fabricated counters',()=>{
 const dead=cpuLife({splatted:['B1']});
 assert.equal(cpuLifeOk(dead,0,0),false);
 assert.equal(cpuLifeOk(dead,1,1),false);
 assert.equal(cpuLifeOk({...dead,physicalRejoins:[
  ...dead.physicalRejoins,'B1']},0,1),false);
 assert.equal(cpuLifeOk({...dead,cpu:dead.cpu.map(b=>b.id==='B1'?
  {...b,rejoined:true}:b)},0,1),false);
 assert.equal(cpuLifeOk({...dead,cpu:dead.cpu.map(b=>b.id==='B1'?
  {...b,hp:100}:b)},0,1),false);
 assert.equal(cpuLifeOk({...dead,sourcePatrol:{
  ...dead.sourcePatrol,respawnPendingCpuIds:['B1']}},0,1),false);
});
test('B390 rejects an unaccounted missing active CPU or an early fake rejoin',()=>{
 assert.equal(cpuLifeOk(cpuLife({returning:['B1']}),0,0),false);
 assert.equal(cpuLifeOk(cpuLife({returning:['B1']},{respawnOriginalDetected:1}),0,1),false);
 assert.equal(cpuLifeOk(cpuLife({splatted:['B1']},{
  respawnOriginalDetected:1}),0,1),false);
});
