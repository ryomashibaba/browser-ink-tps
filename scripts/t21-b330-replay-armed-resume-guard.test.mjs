import test from 'node:test';
import assert from 'node:assert/strict';
import {b330AuditArmedReplayResume as check}
 from './t21-b330-replay-armed-resume-guard.mjs';
function frame(coopAttempt=1){
 return {coopAttempt,matchState:'PLAYING',practiceStatus:'ARMED',
  practiceVariant:'ALLY_SYNC',paused:true,stopReason:null,
  sourceAuthority:'25/17/26/0',originalCpuFootRelocations:0,
  overlayState:'NATIVE_PAUSED',overlayVisible:true,
  productionAuthorized:false,officialWinner:'NONE'};
}
test('both first and SECOND authentic full-round starts require visible Resume',()=>{
 for(const attempt of [1,2]){
  const v=check(frame(attempt));
  assert.equal(v.allowRealButtonClick,true);
  assert.equal(v.requiresVisibleResumeButton,true);
  assert.equal(v.realCDPInputNotYetProven,true);
 }
});
test('no visible pause overlay must reject second replay',()=>{
 const f=frame(2);f.overlayVisible=false;
 assert.equal(check(f).allowRealButtonClick,false);
});
test('STAGING or unarmed cannot bypass real user start',()=>{
 const f=frame(2);f.matchState='STAGING';
 assert.equal(check(f).allowRealButtonClick,false);
 const g=frame(2);g.practiceStatus='CLEAR';
 assert.equal(check(g).allowRealButtonClick,false);
});
test('source mutation, relocation, stop and direct winner fail closed',()=>{
 const f=frame(2);f.sourceAuthority='26/17/26/0';
 assert.equal(check(f).allowRealButtonClick,false);
 const g=frame(2);g.originalCpuFootRelocations=1;
 assert.equal(check(g).allowRealButtonClick,false);
 const h=frame(2);h.stopReason='TEST';
 assert.equal(check(h).allowRealButtonClick,false);
 const i=frame(2);i.officialWinner='A';
 assert.equal(check(i).allowRealButtonClick,false);
});
test('unauthorized attempt numbers do not start a round',()=>{
 assert.equal(check(frame(3)).allowRealButtonClick,false);
 assert.equal(check({}).allowRealButtonClick,false);
});

test('B331 regression: native match is PLAYING but paused during real ARMED A1 replay',()=>{
 const f=frame(1);
 f.matchState='PLAYING';
 f.practiceStatus='ARMED';
 f.paused=true;
 assert.equal(check(f).allowRealButtonClick,true);
 f.paused=false;
 assert.equal(check(f).allowRealButtonClick,false);
});
test('B331 does not grant a genuine button click for 2nd round when not armed',()=>{
 const f=frame(2);
 f.matchState='PLAYING';
 f.practiceStatus='CLEAR';
 assert.equal(check(f).allowRealButtonClick,false);
});
