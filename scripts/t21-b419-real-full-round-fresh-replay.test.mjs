import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB419NativeReplay} from './t21-b419-real-full-round-fresh-replay.mjs';
const base={source:'25/17/26/0',scoreable:0,winner:'NONE',
 relocations:0,prod:false,fourvfour:false,cpuCount:7};
const f=()=>({schema:'B419_REAL_NATIVE_ENDSCREEN_TWO_WORLDS',
 clicked:true,syntheticTicks:false,actorWrites:0,scoreWrites:0,
 realEscapeInputSent:true,pointerExitMethod:'BROWSER_EXIT_POINTER_LOCK',pointerLockReleased:true,
 old:{...base,phase:'TIME_UP',tick:11860,remaining:0,rejoins:7,shots:119,
  mission:'CLEAR',replayVisible:true,origin:1000},
 boot:{...base,phase:'STAGING',tick:0,remaining:180,rejoins:0,shots:0,
  mission:'IDLE',hp:100,ink:100,origin:5000,pageReady:true,
  url:'?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&'+
   't21W10B193=allyCoop&t21W10B203=fullRound'},
 armed:{...base,phase:'STAGING',tick:0,origin:5000,mission:'ARMED',shots:0},
 started:{...base,phase:'PLAYING',tick:50,origin:5000,
  mission:'RUNNING',shots:0,ink:100,remaining:179,paused:false},
 fired:{...base,phase:'PLAYING',tick:75,origin:5000,
  mission:'RUNNING',shots:1,ink:99,remaining:178,paused:false}
});
test('real native second round fired and paid ink, no official winner',()=>{
 const x=auditB419NativeReplay(f());
 assert.equal(x.secondRealShots,1);
 assert.equal(x.full4v4Certified,false);
});
test('fake restart, stale world, fake shots and illicit source authority fail',()=>{
 for(const alter of [
  d=>d.boot.origin=1000,d=>d.boot.tick=2,
  d=>d.boot.relocations=1,d=>d.boot.shots=1,
  d=>d.old.remaining=10,d=>d.old.replayVisible=false,
  d=>d.armed.mission='IDLE',d=>d.started.paused=true,
  d=>d.fired.shots=0,d=>d.fired.ink=100,
  d=>d.boot.scoreable=1,d=>d.boot.cpuCount=6,
  d=>d.syntheticTicks=true,d=>d.clicked=false,
  d=>d.pointerLockReleased=false,d=>d.pointerExitMethod='FAKE',
  d=>d.realEscapeInputSent=false
 ]){const d=f();alter(d);assert.throws(()=>auditB419NativeReplay(d),
  /B419_REAL_NATIVE_REPLAY_HOLD_/);}
});

test('B419 accepts native ESC or browser standard unlock and rejects fake',()=>{
 const direct=f();direct.pointerExitMethod='CDP_ESCAPE';
 assert.equal(auditB419NativeReplay(direct).browserPointerExitMethod,'CDP_ESCAPE');
 const already=f();already.pointerExitMethod='ALREADY_UNLOCKED';
 already.realEscapeInputSent=false;
 assert.equal(auditB419NativeReplay(already).browserPointerExitMethod,
  'ALREADY_UNLOCKED');
});
