import {test} from 'node:test';
import assert from 'node:assert/strict';
import {B190_SOURCE_IDS,b190NativeCpuStartProgress} from './t21-w10b190-native-start-evidence.mjs';
const make=()=>({
 tick:3600,matchState:'STAGING',paused:false,stopReason:null,
 originalSourceSolids:25,originalPaintSurfaces:17,
 originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
 productionAuthorized:false,unrestricted4v4Certified:false,
 cpu:{freeCombatEnabled:false,productionAuthorized:false,
  physicalFootRelocations:0,
  physicalRejoins:['A1','B4'],
  cpu:B190_SOURCE_IDS.map((id,i)=>({id,mobilityState:'GROUND',
   released:true,rejoined:id==='A1'||id==='B4',
   physicalFoot:[i,3.87,44+i]}))}
});
test('actual source early startup records all seven actor states without implying READY',()=>{
 const x=b190NativeCpuStartProgress(make());
 assert.equal(x.outcome,'WAIT_REAL_ORIGINAL_CPU_REJOIN');
 assert.equal(x.actualPhysicallyRejoinedCpuIds.length,2);
 assert.equal(x.sevenSourceCpuParticipants.length,7);
 assert.equal(x.nativeSourceStartReady,false);
 assert.equal(x.realNativeTick,3600);
});
test('only seven real unique IDs + native playing + original source flags authorize ready',()=>{
 const s=make();
 s.matchState='PLAYING';
 s.cpu.freeCombatEnabled=true;
 s.cpu.physicalRejoins=[...B190_SOURCE_IDS];
 s.cpu.cpu.forEach(a=>{a.rejoined=true;});
 const p=b190NativeCpuStartProgress(s);
 assert.equal(p.nativeSourceStartReady,true);
 assert.equal(p.outcome,'PHYSICAL_CPU_SOURCE_RELEASE_READY');
 assert.equal(p.uniqueExpectedPhysicalRejoins,7);
});
test('TIME_UP is explicitly terminal even with physically rejoined seven',()=>{
 const s=make();s.matchState='TIME_UP';
 assert.equal(b190NativeCpuStartProgress(s).outcome,
  'GAME_TIMEOUT_NO_CIRCUIT_PROOF');
 assert.equal(b190NativeCpuStartProgress(s).nativeSourceStartReady,false);
});
test('duplicates/nonfinite physical feet never count',()=>{
 const s=make();s.matchState='PLAYING';
 s.cpu.freeCombatEnabled=true;
 s.cpu.physicalRejoins=[...B190_SOURCE_IDS];
 s.cpu.cpu.forEach(a=>{a.rejoined=true;});
 s.cpu.cpu[0].physicalFoot=[NaN,3,44];
 assert.equal(b190NativeCpuStartProgress(s).nativeSourceStartReady,false);
 s.cpu.cpu[0].physicalFoot=[0,3,44];
 s.cpu.physicalRejoins[1]='A1';
 assert.equal(b190NativeCpuStartProgress(s).nativeSourceStartReady,false);
});
test('mutated stage or production flag never yields genuine source release',()=>{
 const s=make();s.matchState='PLAYING';s.cpu.freeCombatEnabled=true;
 s.cpu.physicalRejoins=[...B190_SOURCE_IDS];
 s.cpu.cpu.forEach(a=>{a.rejoined=true;});
 s.originalSourceNavigationLinks=27;
 assert.equal(b190NativeCpuStartProgress(s).nativeSourceStartReady,false);
});
