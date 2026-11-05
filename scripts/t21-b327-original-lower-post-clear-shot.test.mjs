import test from 'node:test';
import assert from 'node:assert/strict';
import {b327CheckGenuinePostClearLowerShot as check}
 from './t21-b327-original-lower-post-clear-shot.mjs';
function evidence(status='RUNNING'){
 const snap={matchState:'PLAYING',
  b25SourcePaintRun:{status},player:{position:[.135,3.895,48.392]}};
 const ledger={source:'25/17/26/0',
  actualBodyMeters:[.135,3.895,48.392],
  realHumanOriginalFootSupported:true,
  genuineHumanOriginalFootSolid:'UndertowT21D:first-drop-landing-positive-z',
  sourceActorRelocations:0,sourceInkRewritten:false,
  playerPositionRewritten:false,
  humanLastPaintedSurface:'UndertowT21D:spawn-high-positive-z:paint',
  originalRows:Array.from({length:17},()=>({}))};
 return {snap,ledger};
}
test('running original lower KCC permits only genuine Human input attempt',()=>{
 const {snap,ledger}=evidence();
 const v=check(snap,ledger);assert.equal(v.eligible,true);
 assert.equal(v.noShootingOrPaintProofGranted,true);
 assert.equal(v.original4v4Certified,false);
});
test('A1 CLEAR allows separate B312 attempt while match remains PLAYING',()=>{
 const {snap,ledger}=evidence('CLEAR');
 assert.equal(check(snap,ledger).eligible,true);
});
test('finished match and aborted practice remain HOLD',()=>{
 const a=evidence('CLEAR');a.snap.matchState='TIME_UP';
 assert.equal(check(a.snap,a.ledger).eligible,false);
 const b=evidence('ABORTED');
 assert.equal(check(b.snap,b.ledger).eligible,false);
});
test('unsupported KCC, modified stage and actor relocation remain HOLD',()=>{
 const a=evidence('CLEAR');a.ledger.realHumanOriginalFootSupported=false;
 assert.equal(check(a.snap,a.ledger).eligible,false);
 const b=evidence('CLEAR');b.ledger.originalRows.pop();
 assert.equal(check(b.snap,b.ledger).eligible,false);
 const c=evidence();c.ledger.playerPositionRewritten=true;
 assert.equal(check(c.snap,c.ledger).eligible,false);
});
test('original lower world guard and mismatching real bodies remain HOLD',()=>{
 const a=evidence('CLEAR');a.snap.player.position[2]=55;
 assert.equal(check(a.snap,a.ledger).eligible,false);
 const b=evidence('CLEAR');b.ledger.actualBodyMeters[0]+=.2;
 assert.equal(check(b.snap,b.ledger).eligible,false);
});

test('B462 real lower motion rejects stale pose, accepts only fresh native KCC',()=>{
 const {snap,ledger}=evidence();
 const old=structuredClone(snap);
 snap.player.position=[.619898796081543,3.8949975967407227,48.981787109375];
 ledger.actualBodyMeters=[...snap.player.position];
 assert.equal(check(old,ledger).eligible,false);
 assert.equal(check(old,ledger).reason,'TRUE_CDP_AND_KCC_BODY_DIVERGED');
 const verified=check(snap,ledger);
 assert.equal(verified.eligible,true);
 assert.equal(verified.noShootingOrPaintProofGranted,true);
 ledger.sourceActorRelocations=1;
 assert.equal(check(snap,ledger).eligible,false);
});
