import {describe,expect,it} from 'vitest';
import {B394OriginalBombPaintNotice,type B394BombFrame}
 from './B394OriginalBombPaintNotice';
import type {F3BombOutcome} from './UndertowF3SourceInkFeedback';
const frame=():B394BombFrame=>({
 trustedSource:true,playerView:true,subEnabled:true,tick:100,
 phase:'PLAYING',paused:false,stopReason:null,hp:100,humanExplosions:0,
 ink:{source:'REAL_HUMAN_ORIGINAL_PAINT_EVENT',
  originalSourceOnly:true,scoreablePromotionCount:0,
  humanBombExplosionsObserved:0,lastBombOutcome:null,
  lastBombOutcomeTick:null,lastBombOutcomeStamps:0,
  lastBombOutcomeChangedCells:0}
});
function set(f:B394BombFrame,kind:F3BombOutcome,stamps:number,cells:number,n=1){
 f.tick+=6;f.humanExplosions+=n;
 Object.assign(f.ink!,{
  humanBombExplosionsObserved:f.humanExplosions,
  lastBombOutcomeTick:f.tick,lastBombOutcome:kind,
  lastBombOutcomeStamps:stamps,lastBombOutcomeChangedCells:cells
 });
}
describe('B394 real authoritative B41 bomb ink results, not Turf',()=>{
 it('real changed source cells show actual count without score',()=>{
  const m=new B394OriginalBombPaintNotice(),f=frame();
  expect(m.observe(f)).toBeNull();
  set(f,'NEW_CELLS',8,21);
  expect(m.observe(f)).toMatchObject({kind:'NEW_CELLS',changedCells:21,
   stamps:8,scoreable:0,cpuHitCertified:false,gameplayWrites:0,
   text:'BOMB PAINT · +21 REAL SOURCE CELLS · NOT TURF SCORE'});
  f.tick+=120;expect(m.observe(f)?.kind).toBe('NEW_CELLS');
  f.tick++;expect(m.observe(f)).toBeNull();
 });
 it('stamped unchanged source is not fake miss',()=>{
  const m=new B394OriginalBombPaintNotice(),f=frame();m.observe(f);
  set(f,'STAMP_ZERO_CHANGE',2,0);
  expect(m.observe(f)?.text).toBe(
   'BOMB SOURCE STAMP · 0 NEW CELLS · NOT A MISS');
 });
 it('unregistered source stamp never implies paint',()=>{
  const m=new B394OriginalBombPaintNotice(),f=frame();m.observe(f);
  set(f,'NO_CERTIFIED_STAMP',0,0);
  expect(m.observe(f)?.text).toBe(
   'BOMB BURST · NO REGISTERED SOURCE STAMP');
 });
 it('simultaneous bombs do not attribute ink to an individual',()=>{
  const m=new B394OriginalBombPaintNotice(),f=frame();m.observe(f);
  set(f,'MULTIPLE_UNRESOLVED',5,25,2);
  expect(m.observe(f)?.text).toBe(
   'BOMBS BURST · INDIVIDUAL PAINT UNKNOWN');
 });
 it('rejected source, mismatched tick and corrupt counters never display',()=>{
  const mutations:Array<(f:B394BombFrame)=>void>=[
   f=>{f.ink!.scoreablePromotionCount=1},
   f=>{f.ink!.originalSourceOnly=false},
   f=>{f.ink!.source=undefined},
   f=>{f.ink!.humanBombExplosionsObserved=5},
   f=>{f.ink!.lastBombOutcomeTick=99},
   f=>{f.ink!.lastBombOutcomeStamps=-1},
   f=>{f.ink!.lastBombOutcomeChangedCells=-3},
   f=>{f.ink!.lastBombOutcomeChangedCells=0},
   f=>{f.humanExplosions=NaN}
  ];
  for(const mutate of mutations){
   const m=new B394OriginalBombPaintNotice(),f=frame();m.observe(f);
   set(f,'NEW_CELLS',3,18);mutate(f);
   expect(m.observe(f)).toBeNull();
  }
 });
 it('QA, pause, HP0, TIME_UP, stop and round reset hide old result',()=>{
  const changes:Array<(f:B394BombFrame)=>void>=[
   f=>{f.playerView=false},f=>{f.trustedSource=false},
   f=>{f.subEnabled=false},f=>{f.paused=true},
   f=>{f.phase='TIME_UP'},f=>{f.stopReason='SAFE_STOP'},
   f=>{f.hp=0},f=>{f.tick=-1}
  ];
  for(const change of changes){
   const m=new B394OriginalBombPaintNotice(),f=frame();m.observe(f);
   set(f,'NEW_CELLS',3,18);
   expect(m.observe(f)?.kind).toBe('NEW_CELLS');
   change(f);expect(m.observe(f)).toBeNull();
  }
  const m=new B394OriginalBombPaintNotice(),f=frame();
  m.observe(f);set(f,'NEW_CELLS',3,18);
  expect(m.observe(f)).not.toBeNull();
  f.tick=0;f.humanExplosions=0;f.ink!.humanBombExplosionsObserved=0;
  expect(m.observe(f)).toBeNull();
 });
});
