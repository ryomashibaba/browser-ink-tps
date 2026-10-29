import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {b336AuditRealGameplay,b336ReadAndAudit} from './t21-b336-real-gameplay-frontier.mjs';
const dir=new URL('../docs/qa/evidence/',import.meta.url);
const source=new URL('T21_B335_40878994476_real_round.json.gz.b64',dir);
const manifest=JSON.parse(readFileSync(new URL('T21_B335_40878994476_manifest.json',dir)));
const fixture=JSON.parse(gunzipSync(Buffer.from(readFileSync(source,'utf8').trim(),'base64')).toString('utf8'));
const copy=()=>structuredClone(fixture);
test('stored actual B335 native witness has fixed provenance and 180s technical PASS',()=>{
 const r=b336ReadAndAudit(source,manifest.realRoundJsonSha256);
 assert.equal(r.technical180sVerdict,'PASS_GENUINE_CHROMIUM_180S_TIME_UP');
 assert.equal(r.source,'25/17/26/0');
 assert.equal(r.cpu.actorCount,7);
 assert.equal(r.human.changedCellsAtExpiry,92);
 assert.equal(r.cpu.changedCellsAtExpiry,11773);
 assert.equal(r.human.sampledTravelLowerBoundMeters,0);
 assert.equal(r.activityWindows[0].cpuChangedCellsDelta,10692);
 assert.equal(r.activityWindows.at(-1).cpuChangedCellsDelta,64);
 assert.equal(r.diagnostics.noObservedHumanTravel,true);
 assert.equal(r.authority.unrestricted4v4Certified,false);
 assert.equal(r.authority.gameplayCertified,false);
 assert.equal(r.authority.artCertified,false);
 assert.equal(r.authority.productionAuthorized,false);
});
test('tampered authority or fake finished game never becomes gameplay PASS',()=>{
 for(const corrupt of [
  w=>{w.samples[3].originalSolids=30;},
  w=>{w.samples[6].paused=false;},
  w=>{w.samples[6].actualCpuFootPositions[0].foot=null;},
  w=>{w.samples[2].actualHumanBody[0]=NaN;}
 ]){
  const w=copy();corrupt(w);
  assert.throws(()=>b336AuditRealGameplay(w),/B335_REAL_180S|B336_EVIDENCE/);
 }
});
test('hash mismatch rejects evidence replacement',()=>{
 assert.throws(()=>b336ReadAndAudit(source,'0'.repeat(64)),/SHA256_MISMATCH/);
});
test('snapshots report physical lower bounds but not natural routes or turf score',()=>{
 const r=b336AuditRealGameplay(copy());
 assert.equal(r.cpu.snapshotMotion.length,7);
 assert.ok(r.cpu.snapshotMotion.every(x=>x.sampledTravelLowerBoundMeters>=x.startToEndDistanceMeters-0.001));
 assert.equal(r.authority.crossTeamRoutesCertified,'0/12');
 assert.equal(r.sourceWinner,'NONE');
 assert.equal(r.evidenceType,'SAVED_CHROMIUM_CHECKPOINTS_NOT_A_CONTINUOUS_TRAJECTORY');
});
