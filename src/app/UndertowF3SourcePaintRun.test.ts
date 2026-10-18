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
