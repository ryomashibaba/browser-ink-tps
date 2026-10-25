import {test} from 'node:test';
import assert from 'node:assert/strict';
import {b189RealSevenCpuSourceRelease,EXPECTED_ORIGINAL_SOURCE_CPU_IDS as ids}
 from './t21-w10b189-real-cpu-release-gate.mjs';
const make=()=>({
 matchState:'PLAYING',paused:false,stopReason:null,
 cpu:{
  cpu:ids.map((id,i)=>({
   id,rejoined:true,released:true,mobilityState:'GROUND',
   physicalFoot:[i,3.87,i+35]
  })),
  physicalRejoins:[...ids],freeCombatEnabled:true,
  physicalFootRelocations:0,productionAuthorized:false
 }
});
test('genuine existing progress fields certify seven physical CPU rejoins only',()=>{
 const a=b189RealSevenCpuSourceRelease(make());
 assert.equal(a?.actualNativeCpuRejoined,7);
 assert.equal(a?.notCrossTeamRouteCertificate,true);
 assert.deepEqual([...a.physicallyRejoinedCpuIds].sort(),[...ids].sort());
});
test('never trust previous B187 invented nativeSourceCpuRejoined keys',()=>{
 assert.equal(b189RealSevenCpuSourceRelease({
  matchState:'PLAYING',nativeSourceCpuRejoined:7,
  nativeSourceCpuFreeCombat:true
 }),null);
});
test('native match start and actual seven CPU source rejoin required together',()=>{
 const a=make();
 a.matchState='STAGING';
 assert.equal(b189RealSevenCpuSourceRelease(a),null);
 a.matchState='PLAYING';
 a.cpu.freeCombatEnabled=false;
 assert.equal(b189RealSevenCpuSourceRelease(a),null);
 a.cpu.freeCombatEnabled=true;
 a.cpu.physicalRejoins.pop();
 assert.equal(b189RealSevenCpuSourceRelease(a),null);
});
test('duplicates, synthetic CPU feet or unreleased CPU cannot authorize start',()=>{
 const a=make();
 a.cpu.cpu[6].id='B3';
 assert.equal(b189RealSevenCpuSourceRelease(a),null);
 a.cpu.cpu[6].id='B4';
 a.cpu.cpu[6].physicalFoot=[NaN,1,30];
 assert.equal(b189RealSevenCpuSourceRelease(a),null);
 a.cpu.cpu[6].physicalFoot=[7,4,-35];
 a.cpu.cpu[6].released=false;
 assert.equal(b189RealSevenCpuSourceRelease(a),null);
});
test('stage teleport or production authority always blocks source-only release',()=>{
 const a=make();
 a.cpu.physicalFootRelocations=1;
 assert.equal(b189RealSevenCpuSourceRelease(a),null);
 a.cpu.physicalFootRelocations=0;
 a.cpu.productionAuthorized=true;
 assert.equal(b189RealSevenCpuSourceRelease(a),null);
});
