import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleB140RealSourcePhysicalTrace as sample} from './t21-w10b140-real-physics-sample.mjs';
// Shape fixture checks only; these ARE NOT "real CPU" or gameplay evidence.
const f=()=>({
 tick:123,matchState:'PLAYING',player:{position:[2,4.2,45]},
 b112OriginalHumanGround:{genuineKccGrounded:true,lastOriginalSourceHitId:'original-fixture',
  lastOriginalSourceGapMeters:.02,canonicalHumanFootOffsetMeters:.87,
  lastOriginalFootprint:{classification:'INTERIOR'}},
 b146OriginalLowerFootprint:{
  actualNamedOriginalSolidId:'original-fixture',
  distanceToOriginalPolygonBoundaryMeters:1.17,
  insideRegisteredOriginalXZFootprint:true,
  originalFlatVerticalBandWithin22cm:true
 },
 cpu:{cpu:[{id:'A1',physicalFoot:[9,3.2,48],mobilityState:'GROUND'}],
  physicalRejoins:['A1','A2','A3','B1','B2','B3','B4'],physicalFootRelocations:0,
  sourcePatrol:{b137AllyRallyOptIn:true,b137RealCandidateChecks:5,
   b137ApprovedNativeRallies:2,b137UnsafeOrUnsupportedRallies:1,
   b137MissingSourceFloorProof:0}},
 shotsFired:4,b23HumanInkFeedback:{humanChangedCells:12},
 cpuSourceTurfShots:6,cpuImpactInkCellsChanged:9,
 sourceScoreablePromotions:0,unrestricted4v4Certified:false
});
test('B140 correctly serializes real KCC body and CPU A1 physical foot read-only',()=>{
 const n=f(),serialized=sample(n,'REAL_NATIVE');
 assert.deepEqual(serialized.actualHumanKccBody,[2,4.2,45]);
 assert.deepEqual(serialized.actualA1RapierFoot,[9,3.2,48]);
 assert.equal(serialized.realSeparationXZ,Math.hypot(7,3));
 assert.equal(serialized.realCpuRejoins,7);
 assert.equal(serialized.canonicalHumanFootOffsetMeters,.87);
 assert.equal(serialized.originalRapierSourceSupportGapMeters,.02);
 assert.equal(serialized.b146OriginalFlatEdgeClearanceMeters,1.17);
 assert.equal(serialized.b146OriginalFlatInside,true);
 assert.equal(serialized.b146OriginalFlatVerticalBandWithin22cm,true);
 assert.equal(serialized.b146OriginalFlatSourceId,'original-fixture');
 assert.equal(serialized.sourcePatrol.approved,2);
 assert.equal(serialized.officialScoreable,0);
 serialized.actualHumanKccBody[0]=33;
 assert.equal(n.player.position[0],2);
});
test('B140 fails closed instead of writing bogus live evidence',()=>{
 assert.throws(()=>sample({...f(),player:{position:undefined}},'x'),
  /MISSING_REAL_HUMAN_KCC/);
 assert.throws(()=>sample({...f(),cpu:{...f().cpu,cpu:[{id:'A1',physicalFoot:[NaN,0,0]}]}},'x'),
  /INVALID_REAL_A1/);
 assert.throws(()=>sample({...f(),cpu:{...f().cpu,sourcePatrol:null}},'x'),
  /MISSING_ACTUAL_SOURCE_PATROL/);
 const withoutA1=sample({...f(),cpu:{...f().cpu,cpu:[]}},'x');
 assert.equal(withoutA1.actualA1RapierFoot,null);
 assert.equal(withoutA1.realSeparationXZ,null);
});
