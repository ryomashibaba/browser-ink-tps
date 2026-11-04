import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB430TrueSecond180s} from './t21-b430-full-second-source-round.mjs';
const base={source:'25/17/26/0',scoreable:0,winner:'NONE',
 relocations:0,prod:false,fourvfour:false,cpuCount:7};
const f=()=>{
 const replay={schema:'B419_REAL_NATIVE_ENDSCREEN_TWO_WORLDS',
  clicked:true,syntheticTicks:false,actorWrites:0,scoreWrites:0,
  realEscapeInputSent:false,pointerExitMethod:'ALREADY_UNLOCKED',
  pointerLockReleased:true,
  old:{...base,phase:'TIME_UP',tick:11858,remaining:0,rejoins:7,shots:115,
   mission:'CLEAR',replayVisible:true,origin:1000},
  boot:{...base,phase:'STAGING',tick:0,remaining:180,rejoins:0,shots:0,
   mission:'IDLE',hp:100,ink:100,origin:5000,pageReady:true,
   url:'?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&'+
    't21W10B193=allyCoop&t21W10B203=fullRound'},
  armed:{...base,phase:'STAGING',tick:0,remaining:180,rejoins:0,shots:0,
   mission:'ARMED',origin:5000},
  started:{...base,phase:'PLAYING',tick:1056,remaining:179.98,rejoins:7,
   shots:0,mission:'RUNNING',origin:5000,paused:false,ink:100},
  fired:{...base,phase:'PLAYING',tick:1074,remaining:179.68,rejoins:7,
   shots:7,mission:'RUNNING',origin:5000,paused:false,ink:93.35}
 };
 const sample={...base,origin:5000,rejoins:7,paused:false,
  mission:'CLEAR',shots:7,ink:93.35,cpuSourceShots:35,
  cpuPaintCells:400,humanPaintCells:12,pointerLocked:true};
 return {schema:'B430_TRUE_SECOND_SOURCE_180S',base:replay,secondOrigin:5000,
  syntheticTicks:false,actorWrites:0,scoreWrites:0,nativeClockWrites:0,
  samples:[
   {...sample,label:'120',phase:'PLAYING',tick:4700,remaining:119.98},
   {...sample,label:'60',phase:'PLAYING',tick:8300,remaining:59.98,
    cpuSourceShots:70,cpuPaintCells:800},
   {...sample,label:'TIME_UP',phase:'TIME_UP',tick:11859,remaining:0,
    cpuSourceShots:100,cpuPaintCells:1200,paused:true,pointerLocked:false}],
  secondEndUi:{visible:true,realModalFinished:true,buttonVisible:true,
   buttonDisabled:false}};
};
test('two real 180s rounds preserve original source and no turf authority',()=>{
 const result=auditB430TrueSecond180s(f());
 assert.equal(result.fullSecondMatch180s,true);
 assert.equal(result.full4v4Certified,false);
 assert.equal(result.officialScoreable,0);
});
test('fake second source, premature clock, broken CPU and forged score fail',()=>{
 const corrupt=[
  d=>d.secondOrigin=1000,
  d=>d.base.fired.shots=0,
  d=>d.samples[2].remaining=1,
  d=>d.samples[2].tick=11000,
  d=>d.samples[1].rejoins=6,
  d=>d.samples[1].scoreable=1,
  d=>d.samples[1].origin=1000,
  d=>d.samples[0].pointerLocked=false,
  d=>d.samples[2].cpuPaintCells=0,
  d=>d.samples[2].phase='PLAYING',
  d=>d.secondEndUi.visible=false,
  d=>d.nativeClockWrites=1,
  d=>d.base.actorWrites=1
 ];
 for(const mut of corrupt){
  const d=f();mut(d);
  assert.throws(()=>auditB430TrueSecond180s(d),/B4(19|30)_/);
 }
});
