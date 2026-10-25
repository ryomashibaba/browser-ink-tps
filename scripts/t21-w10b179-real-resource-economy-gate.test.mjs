import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyB179RealNativeResourceProof as verify}
 from './t21-w10b179-real-resource-economy-gate.mjs';
const sample=()=>({trueNativeSeconds:21,originalStage:[25,17,26,0],
 authenticSevenCpuRejoined:7,genuineCpuSourceWeaponShots:88,
 genuineSourceInkChangedCells:5000,
 actualNativeEconomy:{enabled:true,zeroSourceScoreable:true,
 productionAuthorized:false,actualOwnPaintFootTicks:120,
 actualEnemyPaintFootTicks:0,actualNeutralFootTicks:400,
 b179OwnInkNativeRecoveryTicks:40,b179ActuallyRecoveredOwnSourceInk:8.1,
 b179ActuallyLostHpOnEnemySourceInk:0}});
test('B179 requires real ink gained on native source CPU-owned foot',()=>{
 const p=verify(sample());assert.equal(p.scoredOriginalSurfaces,0);
 assert.equal(p.certifiedOriginal4v4,false);
 assert.ok(p.actuallyRecoveredOwnSourceInk>0);
});
test('B179 cannot turn paint ownership ticks or shots alone into recovery proof',()=>{
 for(const change of [{b179ActuallyRecoveredOwnSourceInk:0},
  {b179OwnInkNativeRecoveryTicks:0},{actualOwnPaintFootTicks:0},
  {enabled:false},{zeroSourceScoreable:false}]){
   const s=sample();s.actualNativeEconomy={...s.actualNativeEconomy,...change};
   assert.throws(()=>verify(s),/B179_REAL_SOURCE_/);
 }
});
test('B179 cannot certify source route, altered scoreable or missing real CPU',()=>{
 for(const change of [{originalStage:[25,17,26,1]},
  {authenticSevenCpuRejoined:6},{trueNativeSeconds:2},
  {genuineCpuSourceWeaponShots:0}]){
   assert.throws(()=>verify({...sample(),...change}),/B179_REAL_SOURCE_/);
 }
});