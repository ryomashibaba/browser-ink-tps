import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
 t21QaAuditK2LiveWindow,t21QaAuditHistoricalB440Proof,
 T21_K2_REQUIRED_NATIVE_TICKS
} from './t21-v28-qa-k2-source-window.mjs';

const originalBrowserOrigin=1794892763088.9;
const live=overrides=>t21QaAuditK2LiveWindow({
 firstTick:1068,lastTick:1308,configuredObservationTicks:240,
 expectedBrowserOrigin:originalBrowserOrigin,
 observedBrowserOrigin:originalBrowserOrigin,...overrides
});

test('Issue18 240 requested native ticks cannot satisfy K2 600-tick window',()=>{
 const v=live({});
 assert.equal(T21_K2_REQUIRED_NATIVE_TICKS,600);
 assert.equal(v.nativeTickDelta,240);
 assert.equal(v.configuredWindowShorterThanK2Minimum,true);
 assert.equal(v.verdict,'HOLD_K2_WINDOW');
 assert.deepEqual(v.reasons,['HOLD_K2_NATIVE_DELTA_BELOW_600']);
 assert.equal(v.eligibleForK2Counters,false);
});

test('599 fails, 600 passes timing only, not CPU impact or 4v4',()=>{
 assert.equal(live({lastTick:1667,configuredObservationTicks:600}).eligibleForK2Counters,false);
 const onThreshold=live({lastTick:1668,configuredObservationTicks:600});
 assert.equal(onThreshold.nativeTickDelta,600);
 assert.equal(onThreshold.verdict,'PASS_LIMITED_SAME_BROWSER_K2_TIME_WINDOW_ONLY');
 assert.equal(onThreshold.eligibleForK2Counters,true);
 assert.equal(onThreshold.allSevenCpuImpactInkCertified,false);
 assert.equal(onThreshold.actualHpZeroOr150TickRespawnCertified,false);
 assert.equal(onThreshold.formal4v4Certified,false);
});

test('actual >=600 can satisfy window despite shorter request, no fake shots',()=>{
 const v=live({lastTick:1669});
 assert.equal(v.configuredWindowShorterThanK2Minimum,true);
 assert.equal(v.eligibleForK2Counters,true);
 assert.equal(v.realCpuProjectilesCertified,false);
});

test('different browser document has distinct HOLD reason',()=>{
 const v=live({lastTick:1668,observedBrowserOrigin:originalBrowserOrigin+1});
 assert.deepEqual(v.reasons,['HOLD_K2_BROWSER_ORIGIN_CHANGED']);
 assert.equal(v.browserOriginEqual,false);
 const both=live({observedBrowserOrigin:originalBrowserOrigin+1});
 assert.deepEqual(both.reasons,[
  'HOLD_K2_NATIVE_DELTA_BELOW_600','HOLD_K2_BROWSER_ORIGIN_CHANGED'
 ]);
});

test('invalid or absent live provenance never passes timing',()=>{
 const x=live({firstTick:NaN,observedBrowserOrigin:undefined});
 assert.deepEqual(x.reasons,[
  'HOLD_K2_NATIVE_TICK_EVIDENCE_INVALID',
  'HOLD_K2_BROWSER_ORIGIN_UNAVAILABLE'
 ]);
 assert.equal(x.eligibleForK2Counters,false);
});

test('historical genuine RAW metadata cannot fabricate missing terminal K2 tick',()=>{
 // Exact metadata from genuine Actions run #44023186490, not game simulation.
 const historical={
  schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',
  source:'25/17/26/0',verdict:'HOLD',
  error:'Error: B440_SHORT_REAL_NATIVE_HOLD_K2_NOT_SAME_LIVE_NATIVE_OBSERVATION_WINDOW',
  after:{tick:1068,cpuRejoins:7},
  b441NativeEvidence:{intendedRealNativeTicks:240,
   realFrames:[{tick:1224},{tick:1248},{tick:1272},{tick:1296}]},
  b475RealMouseAccepted:{realHumanShots:6},
  nativePlayerShotPaintHud:{lastImpactChangedCells:90}
 };
 const v=t21QaAuditHistoricalB440Proof(historical);
 assert.equal(v.k2FirstTick,1068);
 assert.equal(v.latestRecordedSampleDelta,228);
 assert.equal(v.lastRecordedNativeFrameTick,1296);
 assert.equal(v.configuredWindowShorterThanK2Minimum,true);
 assert.equal(v.exactK2FinalTick,null);
 assert.equal(v.canIndependentlyDetermineSingleTriggeredClause,false);
 assert.equal(v.genuinePlayerShots,6);
 assert.equal(v.genuinePlayerImpactChangedCells,90);
 assert.equal(v.genuineSevenCpuRejoins,7);
 assert.equal(v.gameplayPassCertified,false);
});

test('historical RAW validation fails closed on wrong source and reversed frames',()=>{
 const d={schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',source:'25/17/26/0',
  after:{tick:1068},b441NativeEvidence:{intendedRealNativeTicks:240,
   realFrames:[{tick:1296},{tick:1248}]}};
 assert.throws(()=>t21QaAuditHistoricalB440Proof(d),/FRAMES_INVALID/);
 assert.throws(()=>t21QaAuditHistoricalB440Proof({...d,source:'26/17/26/0'}),/AUTHORITY_MISMATCH/);
});
