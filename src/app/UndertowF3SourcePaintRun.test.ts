import {describe,it,expect} from 'vitest';
import {UndertowF3SourcePaintRun,B25_SOURCE_PAINT_RUN_TICKS,
 B25_SOURCE_PAINT_RUN_REQUIRED_CELLS,
 B25_SOURCE_PAINT_RUN_REQUIRED_GROUNDED_METERS,
 type B25PracticeFrame} from './UndertowF3SourcePaintRun';

const tick=(t:number,patch:Partial<B25PracticeFrame>={}):B25PracticeFrame=>({
 tick:t,paused:false,stopReason:null,inputLocked:true,sessionEnded:false,
 sourceSolids:25,paintableSurfaces:17,originalNavLinks:26,scoreableSurfaces:0,
 foot:{x:t*.08,y:1,z:0,grounded:true,alive:true,
  realPhysicalOriginalStage:true},
 ink:{changedHumanImpactCells:0,changedHumanImpactEvents:0,
  sourceOnly:true,scoreablePromotionCount:0},...patch
});
describe('W10-B25 real human ink + real original grounded foot practice',()=>{
 it('requires actual human changed cells PLUS natural grounded movement and never awards Turf',()=>{
  const run=new UndertowF3SourcePaintRun();
  expect(run.arm()).toBe(true);
  run.observe(tick(10,{inputLocked:false}));
  expect(run.snapshot().status).toBe('ARMED');
  run.observe(tick(11));
  expect(run.snapshot().status).toBe('RUNNING');
  // First painted cell alone cannot satisfy the mobility gate.
  for(let i=12;i<120;i++){
   run.observe(tick(i,{ink:{changedHumanImpactCells:260,
    changedHumanImpactEvents:5,sourceOnly:true,scoreablePromotionCount:0},
    foot:{x:0,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true}}));
  }
  expect(run.snapshot().status).toBe('RUNNING');
  for(let i=120;i<295;i++){
   run.observe(tick(i,{foot:{x:(i-120)*.09,y:1,z:0,grounded:true,
    alive:true,realPhysicalOriginalStage:true},ink:{
     changedHumanImpactCells:260,changedHumanImpactEvents:5,
     sourceOnly:true,scoreablePromotionCount:0}}));
  }
  const s=run.snapshot();
  expect(s.status).toBe('CLEAR');
  expect(s.humanChangedImpactCells).toBeGreaterThanOrEqual(B25_SOURCE_PAINT_RUN_REQUIRED_CELLS);
  expect(s.realGroundedTravelMeters).toBeGreaterThanOrEqual(B25_SOURCE_PAINT_RUN_REQUIRED_GROUNDED_METERS);
  expect(s.officialWinner).toBe('NONE');
  expect(s.originalTurfScore).toBe('UNAVAILABLE');
  expect(s.cpuPaintingCounted).toBe(false);
  expect(s.physicalStageModifications).toBe(0);
 });
 it('never rewards 1-tick teleports, airborne movement or absent physical original ground',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm();r.observe(tick(1));
  r.observe(tick(2,{foot:{x:100,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true}}));
  r.observe(tick(3,{foot:{x:100.1,y:1,z:0,grounded:false,alive:true,realPhysicalOriginalStage:true}}));
  r.observe(tick(4,{foot:{x:100.2,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:false}}));
  expect(r.snapshot().realGroundedTravelMeters).toBe(0);
  expect(r.snapshot().status).toBe('RUNNING');
 });
 it('times out on physical simulation ticks, not paint requests or drawing frames',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm();r.observe(tick(1));
  r.observe(tick(1+B25_SOURCE_PAINT_RUN_TICKS,{foot:{x:0,y:1,z:0,
   grounded:true,alive:true,realPhysicalOriginalStage:true}}));
  const s=r.snapshot();
  expect(s.status).toBe('TIME_UP');
  expect(s.secondsRemaining).toBe(0);
  expect(s.officialWinner).toBe('NONE');
 });
 it('fails closed on scoreable drift, stale ticks, pointer unlock and pause',()=>{
  for(const patch of [{scoreableSurfaces:1},{sourceSolids:26},
    {paused:true},{stopReason:'STAGE_COLLISION_FAILED'}] as const){
   const r=new UndertowF3SourcePaintRun();r.arm();r.observe(tick(1));
   r.observe(tick(2,patch));
   expect(r.snapshot().status).toBe('ABORTED');
   expect(r.snapshot().officialWinner).toBe('NONE');
  }
  const r=new UndertowF3SourcePaintRun();r.arm();r.observe(tick(1));
  r.observe(tick(2,{inputLocked:false}));
  expect(r.snapshot().status).toBe('ABORTED');
  const stale=new UndertowF3SourcePaintRun();stale.arm();stale.observe(tick(10));
  stale.observe(tick(10));
  expect(stale.snapshot().status).toBe('ABORTED');
 });
});

describe('B55 real in-page source-local practice records',()=>{
 const complete=(r:UndertowF3SourcePaintRun,end:number)=>{
  expect(r.arm()).toBe(true);r.observe(tick(1));
  for(let n=2;n<=end;n++)r.observe(tick(n,{
   foot:{x:Math.max(0,n-(end-32))*.375,y:1,z:0,
    grounded:true,alive:true,realPhysicalOriginalStage:true},
   ink:{changedHumanImpactCells:190,changedHumanImpactEvents:4,
    sourceOnly:true,scoreablePromotionCount:0}}));
  expect(r.snapshot().status).toBe('CLEAR');return r.snapshot();
 };
 it('saves genuine first clear, slower retry cannot beat it, faster does',()=>{
  const r=new UndertowF3SourcePaintRun();
  const first=complete(r,120);
  expect(first.completedRealPracticeRuns).toBe(1);
  expect(first.bestClearElapsedTicks).toBe(first.elapsedTicks);
  expect(first.newBestOnMostRecentClear).toBe(true);
  const slow=complete(r,160);
  expect(slow.completedRealPracticeRuns).toBe(2);
  expect(slow.bestClearElapsedTicks).toBe(first.elapsedTicks);
  expect(slow.newBestOnMostRecentClear).toBe(false);
  const fast=complete(r,100);
  expect(fast.completedRealPracticeRuns).toBe(3);
  expect(fast.bestClearElapsedTicks).toBe(fast.elapsedTicks);
  expect(fast.newBestOnMostRecentClear).toBe(true);
  expect(fast.practiceRecordScope).toBe('CURRENT_BROWSER_SESSION_ONLY');
  expect(fast.officialRanking).toBe('NONE');
  expect(fast.officialWinner).toBe('NONE');
  expect(r.arm()).toBe(true);
  expect(r.snapshot().bestClearElapsedTicks).toBe(fast.elapsedTicks);
  expect(r.snapshot().newBestOnMostRecentClear).toBe(false);
  expect(r.arm()).toBe(false);
 });
 it('one goal alone and player abort must never establish a best',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm();r.observe(tick(1));
  for(let n=2;n<=180;n++)r.observe(tick(n,{
   foot:{x:0,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true},
   ink:{changedHumanImpactCells:200,changedHumanImpactEvents:5,
    sourceOnly:true,scoreablePromotionCount:0}}));
  expect(r.snapshot().bestClearElapsedTicks).toBeNull();
  r.abort('PLAYER_POINTER_UNLOCKED');
  expect(r.snapshot().completedRealPracticeRuns).toBe(0);
  r.arm();r.observe(tick(1));r.observe(tick(2,{paused:true}));
  expect(r.snapshot().status).toBe('ABORTED');
  expect(r.snapshot().bestClearElapsedTicks).toBeNull();
 });
});

describe('W10-B56 source-physical SWITCHBACK practice, no original-route promotion',()=>{
 const real=(t:number,x:number,ink=190)=>tick(t,{
  foot:{x,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true},
  ink:{changedHumanImpactCells:ink,changedHumanImpactEvents:4,
   sourceOnly:true,scoreablePromotionCount:0}
 });
 it('never promotes accumulated pacing without leaving the authentic start',()=>{
  const r=new UndertowF3SourcePaintRun();
  expect(r.arm('SWITCHBACK')).toBe(true);r.observe(real(1,0,0));
  for(let i=2;i<180;i++){
   const phase=(i-2)%16;
   const x=phase<=8?phase*.19:(16-phase)*.19;
   r.observe(real(i,x));
  }
  expect(r.snapshot().realGroundedTravelMeters).toBeGreaterThan(12);
  expect(r.snapshot().status).toBe('RUNNING');
  expect(r.snapshot().routeTurnReached).toBe(false);
  expect(r.snapshot().completedRealPracticeRuns).toBe(0);
 });
 it('requires real outbound, return, impact ink and 12m, with separate bests',()=>{
  const r=new UndertowF3SourcePaintRun();
  r.arm('SWITCHBACK');r.observe(real(1,0,0));
  let time=1,x=0;
  const walk=(target:number)=>{
   while(Math.abs(target-x)>.00001){
    x+=Math.sign(target-x)*Math.min(.2,Math.abs(target-x));
    r.observe(real(++time,x));
   }
  };
  walk(2.2);
  expect(r.snapshot().routeTurnReached).toBe(true);
  expect(r.snapshot().routeReturned).toBe(false);
  walk(.2);
  expect(r.snapshot().routeReturned).toBe(true);
  expect(r.snapshot().status).toBe('RUNNING');
  for(let j=0;j<3;j++){walk(2);walk(.2);}
  const s=r.snapshot();
  expect(s.status).toBe('CLEAR');
  expect(s.practiceVariant).toBe('SWITCHBACK');
  expect(s.realGroundedTravelMeters).toBeGreaterThanOrEqual(12);
  expect(s.officialWinner).toBe('NONE');
  expect(s.sourceScoreablePromotions).toBe(0);
  expect(s.bestClearElapsedTicks).toBe(s.elapsedTicks);
  expect(r.arm('CLASSIC')).toBe(true);
  expect(r.snapshot().bestClearElapsedTicks).toBeNull();
  expect(r.snapshot().completedRealPracticeRuns).toBe(0);
  r.abort('USER_STOP');
  expect(r.arm('SWITCHBACK')).toBe(true);
  expect(r.snapshot().bestClearElapsedTicks).toBe(s.elapsedTicks);
  expect(r.snapshot().completedRealPracticeRuns).toBe(1);
 });
 it('rejects non-source ground start or large displacement',()=>{
  const r=new UndertowF3SourcePaintRun();
  r.arm('SWITCHBACK');
  r.observe(tick(1,{foot:{x:0,y:1,z:0,grounded:false,
   alive:true,realPhysicalOriginalStage:true}}));
  expect(r.snapshot().status).toBe('ABORTED');
  r.arm('SWITCHBACK');r.observe(real(1,0,0));
  r.observe(real(2,99));
  expect(r.snapshot().status).toBe('ABORTED');
  expect(r.snapshot().routeTurnReached).toBe(false);
  expect(r.snapshot().bestClearElapsedTicks).toBeNull();
 });
});

describe('W10-B57 PAINT RELAY — distinct real impact ink in each physical leg',()=>{
 const f=(tickNo:number,x:number,cells:number)=>tick(tickNo,{
  foot:{x,y:1,z:0,grounded:true,alive:true,realPhysicalOriginalStage:true},
  ink:{changedHumanImpactCells:cells,changedHumanImpactEvents:cells?4:0,
   sourceOnly:true,scoreablePromotionCount:0}
 });
 it('rejects an outbound-and-return when all 180 cells came before the turn',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('PAINT_RELAY');
  let n=1,x=0;r.observe(f(n,x,0));
  for(let i=0;i<12;i++){x+=.2;r.observe(f(++n,x,200));}
  expect(r.snapshot().routeTurnReached).toBe(true);
  expect(r.snapshot().relayTurnPaintCells).toBe(200);
  for(let i=0;i<11;i++){x-=.2;r.observe(f(++n,x,200));}
  expect(r.snapshot().routeReturned).toBe(false);
  expect(r.snapshot().status).toBe('RUNNING');
  expect(r.snapshot().officialWinner).toBe('NONE');
 });
 it('must paint ≥60 new cells on each of three ordered legs, then cover 12m',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('PAINT_RELAY');
  let n=1,x=0,c=0;r.observe(f(n,x,c));
  const move=(dest:number,paint:number)=>{
   while(Math.abs(x-dest)>1e-7){
    x+=Math.sign(dest-x)*Math.min(.2,Math.abs(dest-x));
    c+=paint;r.observe(f(++n,x,c));
   }
  };
  move(2.2,6);
  expect(r.snapshot().relayStage).toBe('RETURN_PAINT');
  expect(r.snapshot().relayTurnPaintCells).toBeGreaterThanOrEqual(60);
  const turn=r.snapshot().relayTurnPaintCells;
  move(.2,7);
  expect(r.snapshot().relayStage).toBe('FINISH_PAINT');
  const returned=r.snapshot().relayReturnPaintCells;
  expect(returned-turn).toBeGreaterThanOrEqual(60);
  move(2.2,0);
  expect(r.snapshot().status).toBe('RUNNING');
  // Movement after crossing the return radius can already count as
  // physically valid FINISH-leg ink. It cannot yet satisfy the 60-cell leg.
  expect(r.snapshot().relayStagePaintCells).toBeLessThan(60);
  move(.2,6);
  expect(r.snapshot().relayStagePaintCells).toBeGreaterThanOrEqual(60);
  expect(r.snapshot().status).toBe('RUNNING'); // still <12 real metres
  for(let i=0;i<2;i++){move(2.2,0);move(.2,0);}
  const fin=r.snapshot();
  expect(fin.status).toBe('CLEAR');
  expect(fin.relayStage).toBe('COMPLETE');
  expect(fin.humanChangedImpactCells).toBeGreaterThanOrEqual(180);
  expect(fin.realGroundedTravelMeters).toBeGreaterThanOrEqual(12);
  expect(fin.bestClearElapsedTicks).toBe(fin.elapsedTicks);
  expect(fin.originalTurfScore).toBe('UNAVAILABLE');
  expect(fin.officialWinner).toBe('NONE');
  expect(r.arm('CLASSIC')).toBe(true);
  expect(r.snapshot().bestClearElapsedTicks).toBeNull();
  r.abort('USER_STOP');
  expect(r.arm('PAINT_RELAY')).toBe(true);
  expect(r.snapshot().bestClearElapsedTicks).toBe(fin.elapsedTicks);
 });
 it('old cumulative ink cannot bypass either leg or avoid physical ground',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('PAINT_RELAY');
  let n=1,x=0;r.observe(f(n,x,0));
  for(let i=0;i<11;i++){x+=.2;r.observe(f(++n,x,40));}
  expect(r.snapshot().routeTurnReached).toBe(false);
  // The player is still physically grounded at the threshold and
  // legitimately paints enough new cells without another movement key.
  r.observe(f(++n,x,70));
  expect(r.snapshot().routeTurnReached).toBe(true);
  r.observe(tick(++n,{foot:{x,y:1,z:0,grounded:false,
   alive:true,realPhysicalOriginalStage:true},
   ink:{changedHumanImpactCells:200,changedHumanImpactEvents:5,
    sourceOnly:true,scoreablePromotionCount:0}}));
  expect(r.snapshot().status).toBe('ABORTED');
  expect(r.snapshot().completedRealPracticeRuns).toBe(0);
 });
});
