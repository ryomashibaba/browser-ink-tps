import test from 'node:test';
import assert from 'node:assert/strict';
import {b390NativeRadarSampleConsistent as ok}
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
