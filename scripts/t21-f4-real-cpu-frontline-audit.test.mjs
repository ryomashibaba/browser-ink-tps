import test from 'node:test';
import assert from 'node:assert/strict';
import {auditNativeFrontlinePolls} from './t21-f4-real-cpu-frontline-audit.mjs';

/** Synthetic negative-test fixture, NOT a native Chromium artifact. */
function fixture(){
 const ids=['A1','A2','A3','B1','B2','B3','B4'];
 const sample=(tick,d)=>({tick,phase:tick===150?'TIME_UP':'PLAYING',
  player:[5,5,50],shots:10,cpuShotRequests:20,
  actors:ids.map((id,i)=>({id,lifeState:'ACTIVE',hp:100,rejoined:true,
   foot:[i,3.1,(id[0]==='A'?50:-50)+d]}))});
 return {schema:'B433_SOURCE_NATIVE_BROWSER_POLL_SAMPLES',
  source:'25/17/26/0',nativeObserverOnly:true,syntheticTicks:false,
  actorWrites:0,inkWrites:0,scoreWrites:0,nativeClockWrites:0,
  pointerOrInputWrites:0,originalScoreable:0,officialWinner:'NONE',
  browserWorldOrigin:1000,polls:[sample(50,0),sample(150,1)]};
}

test('F4: sampled CPU positions never grant physical routes',()=>{
 const r=auditNativeFrontlinePolls(fixture());
 assert.equal(r.verdict,
  'PASS_READ_ONLY_NATIVE_CPU_FRONTLINE_MEASUREMENT_NOT_ROUTE_CERTIFICATION');
 assert.equal(r.polls,2);
 assert.equal(r.firstNativeTick,50);
 assert.equal(r.lastNativeTick,150);
 assert.equal(r.largestUnobservedTickGap,99);
 assert.equal(r.cpu.A2.travelLowerBoundMeters,1);
 assert.equal(r.cpu.B4.mostForwardZ,-49);
 assert.equal(r.cpu.A1.mostForwardZ,50);
 assert.equal(r.nearestObservedHumanEnemy.id,'B3');
 assert.equal(r.officialWinner,'NONE');
 assert.equal(r.crossTeamPhysicalRouteCertified,false);
 assert.equal(r.endpointDoesNotProveCapsuleRoute,true);
 assert.equal(r.betweenPollMotionUnknown,true);
 assert.equal(r.formal4v4Certified,false);
});

test('F4: fabricated SOURCE, ticks, actor inventory and authority all HOLD',()=>{
 const alterations=[
  d=>d.source='FAKE_SOURCE',
  d=>d.nativeObserverOnly=false,
  d=>d.syntheticTicks=true,
  d=>d.actorWrites=1,
  d=>d.inkWrites=1,
  d=>d.scoreWrites=1,
  d=>d.nativeClockWrites=1,
  d=>d.pointerOrInputWrites=1,
  d=>d.originalScoreable=17,
  d=>d.officialWinner='A',
  d=>d.browserWorldOrigin=0,
  d=>d.polls.pop(),
  d=>d.polls[1].tick=50,
  d=>d.polls[0].player[0]=NaN,
  d=>d.polls[0].phase='FORGED_TIME_UP',
  d=>d.polls[0].actors.pop(),
  d=>d.polls[0].actors[1].id='A1',
  d=>d.polls[0].actors[1].foot[2]=Infinity,
  d=>d.polls[0].actors[1].hp=120,
  d=>d.polls[0].actors[1].lifeState='FAKE',
  d=>d.polls[0].actors[1].rejoined='TRUE',
  d=>d.polls[0].cpuShotRequests=-1,
  d=>d.polls[1].shots=NaN
 ];
 for(const mutation of alterations){
  const input=fixture();mutation(input);
  assert.throws(()=>auditNativeFrontlinePolls(input),
   /^Error: F4_REAL_FRONTLINE_HOLD_/);
 }
 assert.equal(alterations.length,23);
});

test('F4: CPU input order may vary, but seven unique real IDs are mandatory',()=>{
 const f=fixture();f.polls[0].actors.reverse();
 const r=auditNativeFrontlinePolls(f);
 assert.equal(r.cpu.A3.samples,2);
 assert.equal(r.cpu.B4.samples,2);
 assert.equal(r.observedCpuInsideAbsZ33,0);
});
