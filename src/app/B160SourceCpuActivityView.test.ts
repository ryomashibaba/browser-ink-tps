import {describe,it,expect} from 'vitest';
import {summarizeB160CpuActivity,type B160OriginalCpuInkSource}
 from './B160SourceCpuActivityView';
const ids=['A1','A2','A3','B1','B2','B3','B4'] as const;
function sample():B160OriginalCpuInkSource{
 return {
  source:'REAL_PAINT_COORDINATOR_GAMEPLAY_INK_ACCEPTED_CHANGES',
  sourceOnly:true,excludesUnexecutedCpuShotRequests:true,
  originalScoreablePromotions:0,productionAuthorized:false,
  normalPreviewDefaultChanged:false,
  teamAChangedCells:60,teamBChangedCells:80,
  byActor:Object.fromEntries(ids.map(id=>[id,{
   stampEvents:2,changedCells:20,impactEvents:1,
   impactChangedCells:12,footChangedCells:5
  }])) as B160OriginalCpuInkSource['byActor']
 };
}
describe('B160 source-only genuine seven-CPU ink activity, not Turf score',()=>{
 it('shows seven actual native accepted paint contributors and no winner',()=>{
  const v=summarizeB160CpuActivity(sample());
  expect(v.total).toBe(140);
  expect(v.paintingActors).toBe(7);
  expect(v.teamA).toBe(60);
  expect(v.teamB).toBe(80);
  expect(v.actors).toHaveLength(7);
  expect(v.realSource).toBe('ACCEPTED_NATIVE_PAINT_COORDINATOR_CHANGES');
  expect(v.teamWinner).toBe('NONE');
  expect(v.uniqueTurfArea).toBe(false);
  expect(v.officialScoreableCells).toBe(0);
  expect(v.original4v4Certified).toBe(false);
 });
 it('preserves no-winner if an actual actor paints zero changed cells',()=>{
  const x=sample();x.byActor.A2={stampEvents:0,changedCells:0,
   impactEvents:0,impactChangedCells:0,footChangedCells:0};
  x.teamAChangedCells=40;
  const v=summarizeB160CpuActivity(x);
  expect(v.paintingActors).toBe(6);
  expect(v.actors.find(x=>x.id==='A2')?.cells).toBe(0);
  expect(v.teamWinner).toBe('NONE');
 });
 it('rejects fabricated production authority, actor counts and team totals',()=>{
  const authority=sample();authority.originalScoreablePromotions=1;
  expect(()=>summarizeB160CpuActivity(authority))
   .toThrow(/NATIVE_SOURCE_UNSCORABLE/);
  const missing=sample();delete (missing.byActor as
   Partial<B160OriginalCpuInkSource['byActor']>).B4;
  expect(()=>summarizeB160CpuActivity(missing))
   .toThrow(/NATIVE_SOURCE_UNSCORABLE/);
  const fake=sample();fake.byActor.B1.changedCells=-3;
  expect(()=>summarizeB160CpuActivity(fake))
   .toThrow(/INVALID_ACTOR_RASTER/);
  const inflated=sample();inflated.teamBChangedCells=999;
  expect(()=>summarizeB160CpuActivity(inflated))
   .toThrow(/TEAM_TOTALS_INCONSISTENT/);
 });
});
