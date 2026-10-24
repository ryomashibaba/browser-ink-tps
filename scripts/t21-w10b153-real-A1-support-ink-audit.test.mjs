import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB153OriginalAllyAimInk as audit}
 from './t21-w10b153-real-A1-support-ink-audit.mjs';

// Synthetic UNIT fixtures only. Neither a game run nor a positive CI proof.
const fixture=(variant,overrides={})=>{
 const enabled=variant==='ALLY_RALLY';
 const witness={
  qaOptIn:enabled,
  acceptedSourceAimShotRequests:enabled?3:0,
  spawned:enabled?3:0,
  originalSourceSurfaceCollisions:enabled?2:0,
  impactEvents:enabled?2:0,
  changedImpactCells:enabled?37:0,
  zeroChangedInkImpacts:0,
  source:'A1_SOURCE_AIM_TO_PHYSICAL_PROJECTILE_TO_PAINT_EVENT',
  sourceTagDoesNotGrantInkOrMovementAuthority:true,
  scoreablePromotions:0,
  full4v4Certified:false
 };
 return {
  variant,originalSource:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalOppositeSideNaturalPaths:'0/12',
  cpuFootRelocations:0,originalPhysicalCpuRejoins:['A1','A2','A3','B1','B2','B3','B4'],
  productionAuthorized:false,formalOriginal4v4Certified:false,
  finalNativePatrol:{b150AllySupportInkOptIn:enabled,
   b137ApprovedNativeRallies:enabled?4:0},
  b149ActualNativeHumanA1Contact:{actualNativeKccA1Contacts:0},
  b151A1RealProjectileImpactInk:{
   impactEvents:enabled?5:0,changedImpactCells:enabled?75:0},
  b152ExactOriginalAllyAimPaintProvenance:{...witness,...overrides}
 };
};
const run=(a={},f={})=>audit(fixture('ALLY_RALLY',a),
 fixture('FIXED_DEFAULT',f));

test('B153 unit success never claims full 4v4 or scoreable territory',()=>{
 const p=run();
 assert.equal(p.result,'SCOPED_REAL_ALLY_AIM_CHANGED_ORIGINAL_SOURCE_CELLS');
 assert.equal(p.independentlyRasterizedChangedCells,37);
 assert.equal(p.realA1AllyAimProjectileSpawns,3);
 assert.equal(p.fullOriginal4v4Certified,false);
 assert.equal(p.scoreableSurfacePromotions,0);
});
test('B153 no actual real paint is HOLD, not misleading success',()=>{
 assert.match(run({changedImpactCells:0}).result,/^HOLD_/);
 assert.match(run({acceptedSourceAimShotRequests:0,spawned:0,
  originalSourceSurfaceCollisions:0,impactEvents:0,
  changedImpactCells:0}).result,/^HOLD_/);
});
test('B153 cannot count untagged B151 A1 impacts as source-aim proof',()=>{
 const p=run({acceptedSourceAimShotRequests:0,spawned:0,
  originalSourceSurfaceCollisions:0,impactEvents:0,changedImpactCells:0});
 assert.equal(p.independentlyRasterizedChangedCells,0);
});
test('B153 rejects contaminated fixed default and fabricated cell proof',()=>{
 assert.throws(()=>run({}, {changedImpactCells:1}),/FIXED_DEFAULT_PROVENANCE/);
 assert.throws(()=>run({impactEvents:0,changedImpactCells:4}),
  /CHANGED_CELLS_WITHOUT/);
 assert.throws(()=>run({spawned:1,originalSourceSurfaceCollisions:2}),
  /INCONSISTENT_NATIVE/);
 assert.throws(()=>run({impactEvents:8}),
  /TAGGED_PROVENANCE_EXCEEDS/);
 assert.throws(()=>run({scoreablePromotions:1}),/MISSING_REAL_ORIGINAL/);
 assert.throws(()=>run({qaOptIn:false}),/MISSING_REAL_ORIGINAL/);
});
