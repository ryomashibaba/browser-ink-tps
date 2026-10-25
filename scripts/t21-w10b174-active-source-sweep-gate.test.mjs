import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verifyB174ActualSourceSweepRound as verify}
 from './t21-w10b174-active-source-sweep-gate.mjs';
import {readFileSync} from 'node:fs';
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
 assert.ok(out.native60To120SourceCells>18);
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

test('B175: reject frontloaded real ink that stalls after 60s despite high final totals',()=>{
 const p=base(),a=p.samples.map(x=>({...x}));
 for(let i=3;i<a.length;i++)
  a[i].actualOriginalCpuChangedInkCells=
   5000+(i-3)*3; // only 9 cells from true 60s to 120s
 assert.throws(()=>verify({...p,samples:a}),
  /NO_TRUE_SOURCE_LATE_60_TO_120_PAINT_PROGRESS/);
});
test('B175: real 20s browser fields use declared values and persist BEFORE completion',()=>{
 const source=readFileSync(new URL('./t21-f3-browser-smoke.mjs',import.meta.url),'utf8');
 assert.ok(source.includes('realElapsedSeconds:row.elapsedMatchSeconds'));
 assert.ok(!source.includes('realElapsedSeconds:elapsed,'));
 assert.ok(source.includes('w10b174-native-source-progress.json'));
 assert.ok(source.includes('actualMeasuredNativeSamples:b174NativeCpuSampleHistory'));
 assert.ok(source.includes('B175_NATIVE_SOURCE_SWEEP_TELEMETRY_BOOT_NOT_AUTHENTIC'));
});
