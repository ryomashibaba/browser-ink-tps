import {describe,it,expect} from 'vitest';
import {UndertowF3SourcePaintRun,type B25PracticeFrame}
 from './UndertowF3SourcePaintRun';
import {summarizeB165OriginalAllyPractice as view}
 from './B165OriginalAllyPracticeProgress';
const frame=(tick:number,human:number,a1cells:number,a1events:number):
 B25PracticeFrame=>({
 tick,paused:false,stopReason:null,inputLocked:true,sessionEnded:false,
 sourceSolids:25,paintableSurfaces:17,originalNavLinks:26,
 scoreableSurfaces:0,
 foot:{x:(tick-1)*.2,y:4,z:45,grounded:true,alive:true,
  realPhysicalOriginalStage:true},
 ink:{changedHumanImpactCells:human,changedHumanImpactEvents:human?4:0,
  sourceOnly:true,scoreablePromotionCount:0},
 ally:{allyId:'A1',qaOptIn:true,realOriginalSourceOnly:true,
  genuineOriginalA1AimChangedImpactCells:a1cells,
  genuineOriginalA1AimImpactEvents:a1events,
  scoreablePromotionCount:0}
});
describe('B165 read-only genuine cooperative practice progress',()=>{
 it('shows clear only for real source-human + A1 tagged impacts',()=>{
  const run=new UndertowF3SourcePaintRun();
  expect(run.arm('ALLY_SYNC')).toBe(true);
  run.observe(frame(1,0,100,3));
  for(let t=2;t<=69;t++)run.observe(frame(t,230,100,3));
  const waiting=view(run.snapshot())!;
  expect(waiting.phase).toBe('A1_REAL_ORIGINAL_IMPACT');
  expect(waiting.humanPaintPct).toBe(100);
  expect(waiting.groundedPct).toBe(100);
  expect(waiting.realA1ImpactPct).toBe(0);
  expect(waiting.genuinePracticeClear).toBe(false);
  run.observe(frame(70,230,136,4));
  const result=view(run.snapshot())!;
  expect(result.phase).toBe('REAL_COOPERATIVE_CLEAR');
  expect(result.realA1ImpactPct).toBe(100);
  expect(result.realTaggedA1ImpactChangedCells).toBe(36);
  expect(result.realTaggedA1ImpactEvents).toBe(1);
  expect(result.genuinePracticeClear).toBe(true);
  expect(result.officialWinner).toBe('NONE');
  expect(result.scoreableCells).toBe(0);
  expect(result.unrestrictedOriginal4v4Certified).toBe(false);
 });
 it('does not change CLASSIC source practice visibility or scores',()=>{
  const run=new UndertowF3SourcePaintRun();
  expect(view(run.snapshot())).toBe(null);
  run.arm('CLASSIC');
  expect(view(run.snapshot())).toBe(null);
 });
 it('rejects forged winner or synthetic CLEAR without real A1 impacts',()=>{
  const run=new UndertowF3SourcePaintRun();
  run.arm('ALLY_SYNC');
  run.observe(frame(1,0,0,0));
  const snapshot=run.snapshot();
  const forgedWinner={...snapshot,officialWinner:'TEAM_A'} as unknown as typeof snapshot;
  expect(()=>view(forgedWinner)).toThrow(/SOURCE_ONLY_NONSCORING/);
  expect(()=>view({...snapshot,status:'CLEAR'}))
   .toThrow(/GENUINE_CLEAR_GATE_INCONSISTENT/);
  expect(()=>view({...snapshot,originalA1CooperativeGoalSatisfied:true}))
   .toThrow(/SOURCE_A1_IMPACT_PROVENANCE_CONFLICT/);
  const forgedScore={...snapshot,sourceScoreablePromotions:1} as unknown as typeof snapshot;
  expect(()=>view(forgedScore)).toThrow(/SOURCE_ONLY_NONSCORING/);
 });
});
