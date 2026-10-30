import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB355RealInkRecovery as run} from './t21-b355-real-ink-recovery-audit.mjs';
const fixture=()=>({schema:'B355_REAL_SOURCE_NATIVE_INK_RECOVERY',
 source:'25/17/26/0',actualNativeCDP:true,fakeShots:false,
 fakeTicks:false,fakeInk:false,originalScoreable:0,
 productionAuthorized:false,playerOnlyReadout:true,
 NintendoExactInkBalanceCertified:false,
 shotRelease:{tick:1160,ink:90.5,resourceState:'LOCKED',
  humanShots:10,nativePhysicalLaunches:10,genuineOriginalChangedCells:400},
 afterRealRecovery:{tick:1225,ink:97,resourceState:'HUMAN',
  humanShots:10,nativePhysicalLaunches:10,genuineOriginalChangedCells:449},
 truePlayerHud:{exists:true,hidden:false,text:'INK 97% · RECOVERING · SOURCE / NO SCORE',
  mode:'HUMAN_REFILL',authority:'REAL_B76_NATIVE_PLAYER_RESOURCE',
  nativeTick:1225,gameplayWrites:'0'}});
test('actual 60Hz no-shot refill + genuine unscored player HUD',()=>{
 const v=run(fixture());
 assert.equal(v.verdict,'PASS_NATIVE_CONSUMPTION_STOPPED_SHOOTER_REFILL_AND_HUD');
 assert.equal(v.observedInkAfterRecovery,97);
});
test('no fabricated ink, shots, HUD, or score accepted',()=>{
 for(const mutate of [
  s=>s.afterRealRecovery.ink=s.shotRelease.ink,
  s=>s.afterRealRecovery.humanShots=11,
  s=>s.afterRealRecovery.tick=1161,
  s=>s.afterRealRecovery.nativePhysicalLaunches=11,
  s=>s.truePlayerHud.mode='FAKE_AUTO_REFILL',
  s=>s.truePlayerHud.text='WINNER!',
  s=>s.originalScoreable=1,
  s=>s.fakeInk=true
 ]){const s=fixture();mutate(s);
  assert.throws(()=>run(s),/B355_NATIVE_INK_/);}
});
