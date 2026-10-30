import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {b341CompareGenuineSourceExperiment} from './t21-b341-source-patch-ab-audit.mjs';
const baseline=JSON.parse(readFileSync(new URL(
 '../docs/qa/evidence/T21_B341_B340_FIXED_SOURCE_BASELINE.json',import.meta.url),'utf8'));
test('B341 baseline metadata, source SHA and six measured windows are immutable',()=>{
 assert.deepEqual(baseline.cpuSourceShotRequests,[86,6,8,1,1,6]);
 assert.deepEqual(baseline.cpuActualImpactChangedCells,[3147,35,19,0,0,11]);
 assert.deepEqual(baseline.cpuChangedCells,[10692,427,493,14,83,64]);
});
test('B341 explicitly rejects any unproven simulated browser witness',()=>{
 assert.throws(()=>b341CompareGenuineSourceExperiment({
  schema:'B335_REAL_CHROMIUM_SOURCE_ROUND',b341TelemetryVersion:1,
  sourceOriginalUnchanged:true,samples:[]},baseline),/B341_INDEPENDENT/);
});
test('B341 refuses corrupted baseline claims independently of any game run',()=>{
 for(const update of [
  b=>b.cpuSourceShotRequests[5]=42,
  b=>b.b64Enabled=true,
  b=>b.productionAuthorized=true,
  b=>b.originalRealRoundSha256='FAKE'
 ]){
  const copied=structuredClone(baseline);update(copied);
  assert.throws(()=>b341CompareGenuineSourceExperiment(null,copied),
   /B341_INDEPENDENT/);
 }
});
