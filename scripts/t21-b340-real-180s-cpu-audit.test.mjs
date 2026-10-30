import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {b340AuditRealSourceCpuRound} from './t21-b340-real-180s-cpu-audit.mjs';
// Synthetic fields below are strictly verifier NEGATIVE/fixture tests.
// They are NOT collected from any real B340 native 180-second run.
const encoded=readFileSync(new URL('../docs/qa/evidence/T21_B335_40878994476_real_round.json.gz.b64',import.meta.url),'utf8');
const original=JSON.parse(gunzipSync(Buffer.from(encoded.trim(),'base64')));
const ids=['A1','A2','A3','B1','B2','B3','B4'];
const build=()=>{
 const q=structuredClone(original);
 q.b340TelemetryVersion=1;q.sourceOriginalUnchanged=true;
 for(let i=0;i<q.samples.length;i++){
  const s=q.samples[i];
  s.b340CpuSource={
   originalBoundary:'25/17/26/0',
   acceptedShotRequests:i*42,
   shotRequestsByActor:Object.fromEntries(ids.map(id=>[id,i*6])),
   actualImpactChangedCells:i*150,
   actualTotalCpuChangedCells:s.cpuInk,
   acceptedSourcePaint:{
    source:'REAL_PAINT_COORDINATOR_GAMEPLAY_INK_ACCEPTED_CHANGES',
    sourceOnly:true,originalScoreablePromotions:0,
    excludesUnexecutedCpuShotRequests:true,productionAuthorized:false,
    byActor:Object.fromEntries(ids.map(id=>[id,{
     stampEvents:i*7,impactEvents:i*3,
     changedCells:i*27,impactChangedCells:i*15,footChangedCells:i*5
    }]))},
   realSourceResourceRecovery:{productionAuthorized:false,zeroSourceScoreable:true},
   realSourceAimCandidates:{originalSourceOnly:true,newPhysicalSolids:0,
    newNavLinks:0,newScoreable:0},
   realOriginalPaintOpportunity:{sourceScoreable:0},
   sourceRealBackfill:{actorFootWrites:0,newNavLinks:0,
    fakeShots:0,scoreableSourcePaint:0},
   sourceNativeBattlePacing:{playerAmmoOrCpuShotInjection:0}
  };
 }
 return q;
};
test('B340 verifier accepts clean fixture without promoting artificial tests to game evidence',()=>{
 const r=b340AuditRealSourceCpuRound(build());
 assert.equal(r.windows.length,6);
 assert.equal(r.windows[0].sourceCpuWithShotRequests,7);
 assert.equal(r.rootCauseCertified,false);
 assert.equal(r.gameplayCertified,false);
 assert.equal(r.noRealFullPathCertification,true);
});
test('B340 exact 180s and native CPU source authority cannot be bypassed',()=>{
 for(const modify of [
  q=>q.samples.splice(3,1),
  q=>q.samples[4].cpuRelocations++,
  q=>q.samples[6].b340CpuSource.originalBoundary='30/17/26/0',
  q=>q.samples[0].b340CpuSource.acceptedSourcePaint.source='FAKE',
  q=>q.samples[3].b340CpuSource.acceptedSourcePaint.byActor.B1.changedCells=-1,
  q=>q.samples[4].b340CpuSource.shotRequestsByActor.A1=0,
  q=>q.samples[6].b340CpuSource.sourceNativeBattlePacing.playerAmmoOrCpuShotInjection=1,
  q=>q.samples[5].actualCpuFootPositions[0].foot=[NaN,0,0],
  q=>q.samples[4].b340CpuSource.acceptedSourcePaint.byActor.A2.impactEvents=999
 ]){
  const q=build();modify(q);
  assert.throws(()=>b340AuditRealSourceCpuRound(q),/B340_INDEPENDENT|B335_REAL_180S/);
 }
});
test('B340 measures low yield without claiming cause',()=>{
 const q=build();
 for(let i=3;i<q.samples.length;i++)
  q.samples[i].b340CpuSource.actualImpactChangedCells=300;
 const result=b340AuditRealSourceCpuRound(q);
 assert.equal(result.windows[2].classification,
  'SHOTS_WITH_ZERO_CHANGED_CPU_IMPACT_CELLS');
 assert.equal(result.rootCauseCertified,false);
});
