export function verifyB179RealNativeResourceProof(s){
 const fail=m=>{throw Error('B179_REAL_SOURCE_'+m)};
 if(!Number.isFinite(s.trueNativeSeconds)||s.trueNativeSeconds<13||
  s.originalStage?.join(',')!=='25,17,26,0'||
  s.authenticSevenCpuRejoined!==7||
  !Number.isSafeInteger(s.genuineCpuSourceWeaponShots)||
  s.genuineCpuSourceWeaponShots<=0||
  !Number.isSafeInteger(s.genuineSourceInkChangedCells)||
  s.genuineSourceInkChangedCells<=0)fail('AUTHORITY_OR_NATIVE_CPU_MISSING');
 const e=s.actualNativeEconomy;
 if(e?.enabled!==true||e?.zeroSourceScoreable!==true||
  e.productionAuthorized!==false||
  ![e.actualOwnPaintFootTicks,e.actualEnemyPaintFootTicks,
    e.actualNeutralFootTicks,e.b179OwnInkNativeRecoveryTicks]
    .every(x=>Number.isSafeInteger(x)&&x>=0)||
  !Number.isFinite(e.b179ActuallyRecoveredOwnSourceInk)||
  e.b179ActuallyRecoveredOwnSourceInk<=0||
  !Number.isFinite(e.b179ActuallyLostHpOnEnemySourceInk)||
  e.b179ActuallyLostHpOnEnemySourceInk<0||
  e.b179OwnInkNativeRecoveryTicks<1||
  e.actualOwnPaintFootTicks<e.b179OwnInkNativeRecoveryTicks)
  fail('NO_ACTUAL_CPU_SOURCE_OWN_INK_GAIN');
 return {verdict:'B179_GENUINE_NATIVE_ORIGINAL_CPU_INK_RECOVERED',
  trueNativeSeconds:Number(s.trueNativeSeconds.toFixed(2)),
  sevenCpuRejoined:7,
  genuineCpuWeaponShots:s.genuineCpuSourceWeaponShots,
  genuineCpuSourceInkChanges:s.genuineSourceInkChangedCells,
  realOwnedFootTicks:e.actualOwnPaintFootTicks,
  realEnemyFootTicks:e.actualEnemyPaintFootTicks,
  realNeutralFootTicks:e.actualNeutralFootTicks,
  actualNativeOwnRecoverTicks:e.b179OwnInkNativeRecoveryTicks,
  actuallyRecoveredOwnSourceInk:e.b179ActuallyRecoveredOwnSourceInk,
  actualEnemySourceHpLoss:e.b179ActuallyLostHpOnEnemySourceInk,
  scoredOriginalSurfaces:0,certifiedOriginal4v4:false,
  productionAuthorized:false,syntheticCpuInk:false};
}