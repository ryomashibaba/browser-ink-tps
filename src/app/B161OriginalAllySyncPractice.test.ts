import {describe,it,expect} from 'vitest';
import {UndertowF3SourcePaintRun,B161_ALLY_REAL_IMPACT_CELLS,
 type B25PracticeFrame} from './UndertowF3SourcePaintRun';

const a1=(cells:number,events:number)=>({
 allyId:'A1' as const,qaOptIn:true,
 realOriginalSourceOnly:true,
 genuineOriginalA1AimChangedImpactCells:cells,
 genuineOriginalA1AimImpactEvents:events,
 scoreablePromotionCount:0 as const
});
const frame=(tick:number,cells:number,events:number,humanCells:number,
 patch:Partial<B25PracticeFrame>={}):B25PracticeFrame=>({
 tick,paused:false,stopReason:null,inputLocked:true,sessionEnded:false,
 sourceSolids:25,paintableSurfaces:17,originalNavLinks:26,
 scoreableSurfaces:0,
 foot:{x:(tick-1)*.2,y:1,z:0,
  grounded:true,alive:true,realPhysicalOriginalStage:true},
 ink:{changedHumanImpactCells:humanCells,
  changedHumanImpactEvents:humanCells?2:0,
  sourceOnly:true,scoreablePromotionCount:0},
 ally:a1(cells,events),...patch
});
describe('B161 optional ORIGINAL physical A1 cooperative source practice',()=>{
 it('requires fresh actual A1 impact ink AND real human ink and grounded travel',()=>{
  const run=new UndertowF3SourcePaintRun();
  expect(run.arm('ALLY_SYNC')).toBe(true);
  run.observe(frame(1,90,3,50));
  // Merely having A1 historical ink before arming must not count.
  for(let tick=2;tick<75;tick++)
   run.observe(frame(tick,90,3,240));
  expect(run.snapshot().status).toBe('RUNNING');
  expect(run.snapshot().realGroundedTravelMeters).toBeGreaterThan(12);
  expect(run.snapshot().actualOriginalA1ChangedImpactCells).toBe(0);
  run.observe(frame(75,90+B161_ALLY_REAL_IMPACT_CELLS,4,240));
  const result=run.snapshot();
  expect(result.status).toBe('CLEAR');
  expect(result.practiceVariant).toBe('ALLY_SYNC');
  expect(result.actualOriginalA1ChangedImpactCells)
   .toBe(B161_ALLY_REAL_IMPACT_CELLS);
  expect(result.actualOriginalA1TaggedImpactEvents).toBe(1);
  expect(result.originalA1CooperativeGoalSatisfied).toBe(true);
  expect(result.officialWinner).toBe('NONE');
  expect(result.sourceScoreablePromotions).toBe(0);
  expect(result.cpuPaintingCounted).toBe(false);
  expect(result.completedRealPracticeRuns).toBe(1);
 });
 it('won’t count exact A1 paint before human/ally co-op arming',()=>{
  const run=new UndertowF3SourcePaintRun();run.arm('ALLY_SYNC');
  run.observe(frame(1,500,20,0));
  for(let tick=2;tick<90;tick++)run.observe(frame(tick,500,20,250));
  expect(run.snapshot().status).toBe('RUNNING');
  expect(run.snapshot().actualOriginalA1ChangedImpactCells).toBe(0);
  expect(run.snapshot().originalA1CooperativeGoalSatisfied).toBe(false);
 });
 it('fails closed if opt-in missing, forged score, stale or reset A1 proof',()=>{
  for(const invalid of [
   {ally:undefined},
   {ally:{...a1(0,0),qaOptIn:false}},
   {ally:{...a1(0,0),realOriginalSourceOnly:false}},
   {ally:{...a1(0,0),scoreablePromotionCount:1 as 0}}
  ]){
   const run=new UndertowF3SourcePaintRun();run.arm('ALLY_SYNC');
   run.observe(frame(1,0,0,0,invalid as Partial<B25PracticeFrame>));
   expect(run.snapshot().status).toBe('ABORTED');
   expect(run.snapshot().completedRealPracticeRuns).toBe(0);
  }
  const reset=new UndertowF3SourcePaintRun();reset.arm('ALLY_SYNC');
  reset.observe(frame(1,80,4,0));
  reset.observe(frame(2,30,5,250));
  expect(reset.snapshot().status).toBe('ABORTED');
  expect(reset.snapshot().abortReason).toContain('COUNTER_RESET');
 });
 it('keeps conventional practice independent of opt-in and A1 ink',()=>{
  const r=new UndertowF3SourcePaintRun();r.arm('CLASSIC');
  r.observe(frame(1,0,0,0,{ally:undefined}));
  for(let tick=2;tick<90;tick++)r.observe(frame(tick,0,0,250,
   {ally:undefined}));
  expect(r.snapshot().status).toBe('CLEAR');
  expect(r.snapshot().practiceVariant).toBe('CLASSIC');
  expect(r.snapshot().originalA1CooperativeGoalSatisfied).toBe(false);
 });
});
