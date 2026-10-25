import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verifyB174ActualSourceSweepRound as verify}
 from './t21-w10b174-active-source-sweep-gate.mjs';
const base=()=>({
 finalNativeSeconds:180,realHumanActivityPairs:7,
 genuineRejoinedCpu:7,realCpuShotCount:430,realCpuChangedCells:11000,
 actualLateralOriginalAimApprovals:1000,
 nativeSweepingEnabled:true,officialSourceScoreable:0,
 actualWinner:'NONE',
 perActorRealShots:{A1:62,A2:60,A3:58,B1:58,B2:64,B3:66,B4:62},
 samples:Array.from({length:9},(_,i)=>({
  nativeTick:1200+i*1200,realElapsedSeconds:i*20,
  actualOriginalCpuShots:i*45,
  actualOriginalCpuChangedInkCells:i*1000,
  trueNativeLateralOriginalAimApprovals:i*100,
  actualOriginalRejoinedCpu:7,noOriginalScoreable:true,
  exactNativeSourceAimEnabled:true
 }))
});
test('B174: real native 180s user + 7 CPU experiment pass remains not official turf',()=>{
 const out=verify(base());
 assert.equal(out.actualCpuRealProjectileShots,430);
 assert.equal(out.officialWinner,'NONE');
 assert.equal(out.certifiedOriginalNintendo4v4,false);
 assert.match(out.compareCaveat,/DIFFERENT_COMMIT/);
});
test('B174: never greenwash static CPU after 60 seconds or missing real projectiles',()=>{
 assert.throws(()=>verify({...base(),realCpuChangedCells:3615}),/NO_REAL_SOURCE/);
 assert.throws(()=>verify({...base(),realCpuShotCount:112}),/TRUE_SEVEN_ACTOR/);
 assert.throws(()=>verify({...base(),actualLateralOriginalAimApprovals:0}),/NO_REAL_SOURCE/);
});
test('B174: never authorize altered geometry, phantom CPU, early clock or fake winner',()=>{
 assert.throws(()=>verify({...base(),finalNativeSeconds:179.9}),/GAME_AUTHORITY/);
 assert.throws(()=>verify({...base(),genuineRejoinedCpu:6}),/GAME_AUTHORITY/);
 assert.throws(()=>verify({...base(),officialSourceScoreable:1}),/GAME_AUTHORITY/);
 assert.throws(()=>verify({...base(),actualWinner:'A'}),/GAME_AUTHORITY/);
 assert.throws(()=>verify({...base(),perActorRealShots:{A1:430}}),/TRUE_SEVEN_ACTOR/);
});
test('B174: native shot/ink sample counters must be monotonic and physically labeled',()=>{
 const x=base(),s=x.samples.map(v=>({...v}));
 s[4].actualOriginalCpuChangedInkCells=0;
 assert.throws(()=>verify({...x,samples:s}),/MONOTONIC/);
 const y=base(),v=y.samples.map(z=>({...z}));
 v[3].actualOriginalRejoinedCpu=6;
 assert.throws(()=>verify({...y,samples:v}),/MONOTONIC/);
});
