import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {b336AuditRealGameplay} from './t21-b336-real-gameplay-frontier.mjs';
import {b339AuditHistoricFrontier,b339AuditNativeEarlyCpu} from './t21-b339-native-cpu-activity-audit.mjs';
const dir=new URL('../docs/qa/evidence/',import.meta.url);
const file=new URL('T21_B335_40878994476_real_round.json.gz.b64',dir);
const w=JSON.parse(gunzipSync(Buffer.from(readFileSync(file,'utf8').trim(),'base64')));
const legacy=b336AuditRealGameplay(w);
const ids=['A1','A2','A3','B1','B2','B3','B4'];
function native(){
 const labels=['START','AIM','FIRE','W','A','S','D'];
 return {schema:'B337_REAL_CHROMIUM_NATIVE_SOURCE_INPUT_INK',
  source:'25/17/26/0',realFullRound:true,nativeCdpInput:true,
  injectedTicks:false,injectedInk:false,injectedActorPositions:false,
  officialWinner:'NONE',actions:['MOUSE_MOVED','FIRE','KeyW','KeyA','KeyS','KeyD'],
  samples:labels.map((label,i)=>({
   label,source:'25/17/26/0',tick:1050+i*12,
   remainingSeconds:178-i,
   matchState:'PLAYING',paused:false,stopReason:null,
   body:[0,8,67-(i>=3?.5:0)],cameraYawDegrees:i>0?4.4:0,
   originalSolids:25,originalPaint:17,originalNavLinks:26,scoreable:0,
   productionAuthorized:false,unrestricted4v4Certified:false,
   turfResult:'UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED',
   cpuCount:7,cpuRejoined:7,cpuRelocations:0,
   humanShots:i>=2?9:0,humanInk:i>=2?91:0,
   lastHumanImpactTick:i>=2?1080:null,
   lastHumanPaintedSurface:i>=2?'original-0':null,
   footSolid:'UndertowT21D:spawn-high-positive-z',
   footGap:0.02,footSupported:true,
   originalRows:Array.from({length:17},(_,j)=>({
    surfaceId:'original-'+j,a:i>=2&&j===0?91:0,
    b:0,neutral:i>=2&&j===0?9:100,active:100
   })),
   b339CpuSnapshot:{source:'25/17/26/0',
    acceptedCpuSourceShots:100+i*7,
    actualCpuImpactChangedCells:200+i*13,
    cpuShotsByActor:Object.fromEntries(ids.map((id,j)=>[id,10+i])),
    sourceInk:{source:'REAL_PAINT_COORDINATOR_GAMEPLAY_INK_ACCEPTED_CHANGES',
     excludesUnexecutedCpuShotRequests:true,
     byActor:Object.fromEntries(ids.map((id,j)=>[id,{
      changedCells:20+i+2*j,impactChangedCells:10+i,
      footChangedCells:2,stampEvents:10+i,impactEvents:6+i}]))}}
  }))};
}
test('real saved 180s decline is observed, but not its cause',()=>{
 const q=b339AuditHistoricFrontier(legacy);
 assert.deepEqual(q.real30SecondCpuChangedCellWindows,[10692,427,493,14,83,64]);
 assert.equal(q.totalCpuChangedCells,11773);
 assert.equal(q.causeIdentified,false);
 assert.equal(q.gameplayCertified,false);
});
test('genuine native early actor counts remain distinct from late cause',()=>{
 const r=b339AuditNativeEarlyCpu(native());
 assert.equal(r.actualNativeTicks,72);
 assert.equal(r.perCpuNativeActor.length,7);
 assert.equal(r.cpuWithSourceShots,7);
 assert.equal(r.late180sCpuShotEvidenceAvailable,false);
});
test('no fabricated source actor or changed owner counter can certify',()=>{
 for(const mutate of [
  x=>{x.samples[3].b339CpuSnapshot.sourceInk.byActor.A1.changedCells=-1;},
  x=>{x.samples[4].b339CpuSnapshot.cpuShotsByActor.A2=-3;},
  x=>{x.samples[2].b339CpuSnapshot.cpuShotsByActor.A3=1;},
  x=>{x.samples[6].b339CpuSnapshot.sourceInk.source='FAKE_SOURCE';},
  x=>{x.samples[5].b339CpuSnapshot.cpuShotsByActor.C1=1;},
  x=>{x.samples[3].originalSolids=30;}
 ]){const q=native();mutate(q);
  assert.throws(()=>b339AuditNativeEarlyCpu(q),/B339_SOURCE_CPU|B337_SOURCE_GAMEPLAY/);}
});
test('historical tampering cannot become a gameplay or art PASS',()=>{
 let q=structuredClone(legacy);q.authority.gameplayCertified=true;
 assert.throws(()=>b339AuditHistoricFrontier(q),/B339_SOURCE_CPU/);
 q=structuredClone(legacy);q.activityWindows[4].cpuChangedCellsDelta=123;
 assert.throws(()=>b339AuditHistoricFrontier(q),/B339_SOURCE_CPU/);
});
