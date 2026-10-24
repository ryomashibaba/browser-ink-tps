import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB154ActualSevenCpuCoverage as audit}
 from './t21-w10b154-seven-cpu-source-coverage-audit.mjs';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
// Synthetic unit fixtures ONLY; never report these as browser data.
function fixture(variant,edits={}){
 const team=variant==='TEAM_COVERAGE';
 const ink=Object.fromEntries(ids.map(id=>[id,{
  stampEvents:2,changedCells:10,impactEvents:1,
  impactChangedCells:5,footChangedCells:2
 }]));
 const base={
  variant,
  originalSource:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalOppositeSideNaturalPaths:'0/12',cpuFootRelocations:0,
  originalPhysicalCpuRejoins:[...ids],
  formalOriginal4v4Certified:false,productionAuthorized:false,
  b149ActualNativeHumanA1Contact:{actualNativeKccA1Contacts:0},
  finalNativePatrol:{b150AllySupportInkOptIn:variant!=='FIXED_DEFAULT'},
  b154SourceInkSweepAuthority:{enabled:team},
  b154NativeSevenCpuInk:{
   coordinatedMode:team,
   byActor:ink,
   teamAChangedCells:30,teamBChangedCells:40,
   actualAcceptedSourceTurfShotRequests:
    Object.fromEntries(ids.map(id=>[id,2])),
   source:'REAL_PAINT_COORDINATOR_GAMEPLAY_INK_ACCEPTED_CHANGES',
   excludesUnexecutedCpuShotRequests:true,sourceOnly:true,
   originalScoreablePromotions:0,normalPreviewDefaultChanged:false,
   productionAuthorized:false
  },
  b152ExactOriginalAllyAimPaintProvenance:{
   acceptedSourceAimShotRequests:variant==='FIXED_DEFAULT'?0:2,
   changedImpactCells:variant==='FIXED_DEFAULT'?0:16
  }
 };
 return {...base,...edits};
}
const run=(f={},a={},t={})=>audit(
 fixture('FIXED_DEFAULT',f),fixture('ALLY_RALLY',a),
 fixture('TEAM_COVERAGE',t));
test('B154 only qualifies seven real accepted CPU paint contributors',()=>{
 const v=run();
 assert.equal(v.result,'SCOPED_REAL_SEVEN_CPU_INK_PARTICIPATION');
 assert.equal(v.teamCoverage.paintedActors,7);
 assert.equal(v.teamCoverage.changedCells,70);
 assert.equal(v.originalScoreablePromotions,0);
 assert.equal(v.noCrossRunCausalOrMatchWinClaim,true);
 assert.equal(v.unrestricted4v4Certified,false);
});
test('B154 no seven-cpu participation means HOLD not PASS',()=>{
 const x=fixture('TEAM_COVERAGE');
 x.b154NativeSevenCpuInk.byActor.A2={stampEvents:0,
  changedCells:0,impactEvents:0,impactChangedCells:0,
  footChangedCells:0};
 x.b154NativeSevenCpuInk.teamAChangedCells=20;
 const v=run({},{},x);
 assert.match(v.result,/^HOLD_/);
 assert.equal(v.teamCoverage.paintedActors,6);
});
test('B154 rejects default contamination, missing actor, invented cells',()=>{
 assert.throws(()=>run({b154SourceInkSweepAuthority:{enabled:true}}),
  /MODE_OR_AUTHORITY/);
 const wrong=fixture('TEAM_COVERAGE');
 delete wrong.b154NativeSevenCpuInk.byActor.B4;
 assert.throws(()=>run({},{},wrong),/SEVEN_REAL_CPU/);
 const fake=fixture('TEAM_COVERAGE');
 fake.b154NativeSevenCpuInk.byActor.A1.changedCells=-1;
 assert.throws(()=>run({},{},fake),/BAD_CPU_A1/);
 const spoof=fixture('TEAM_COVERAGE');
 spoof.b154NativeSevenCpuInk.byActor.A1.impactEvents=10;
 assert.throws(()=>run({},{},spoof),/BAD_CPU_A1/);
 assert.throws(()=>run({productionAuthorized:true}),/FALSE_ORIGINAL_NATIVE/);
 const totals=fixture('TEAM_COVERAGE');
 totals.b154NativeSevenCpuInk.teamAChangedCells=300;
 assert.throws(()=>run({},{},totals),/REAL_SOURCE_TEAM_SUMS/);
});
