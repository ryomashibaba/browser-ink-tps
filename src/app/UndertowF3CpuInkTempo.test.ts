import {describe,it,expect} from 'vitest';
import {sourceCpuInkTempo} from './UndertowF3CpuInkTempo';
import type {B62EvidencePoint} from './UndertowF3NativeSessionEvidence';
const point=(second:number,shots:number,ink:number):B62EvidencePoint=>({
 nativeTick:1057+second*60,elapsedNativeSeconds:second,
 humanShots:7,humanChangedSourceCells:281,
 cpuSourceShots:shots,cpuChangedSourceCells:ink,
 cpuOriginalPhysicalRejoins:7,cpuSplatCount:0,humanSplatCount:0,
 humanRespawnCount:0,cpuSuspectedStalls:0,longestCpuStallSeconds:0,
 renderFrameCallbackP95Ms:900,nativeSimulationDroppedSeconds:0
});
describe('W10-B63 native 30s source-local activity report',()=>{
 it('detects real shoot-with-no-new-ink windows; never invents Turf result or causal explanation',()=>{
  const vals=[point(0,0,0),point(30,90,3500),point(60,100,3600),
   point(90,103,3615),point(120,105,3615),point(150,109,3615),
   point(180,112,3615)];
  const x=sourceCpuInkTempo(vals);
  expect(x.windows).toHaveLength(6);
  expect(x.windows[0]).toMatchObject({cpuShots:90,newlyChangedCpuCells:3500});
  expect(x.windows[3]).toMatchObject({cpuShots:2,newlyChangedCpuCells:0});
  expect(x.cpuShotWithoutNewInkWindows).toBe(3);
  expect(x).toMatchObject({status:'REAL_SOURCE_ACTIVITY_ONLY',
   causeOfPaintSlowdown:'UNDETERMINED',officialTurfResult:'NONE',
   sourceScoreableCells:0,inferredOriginal4v4:false});
 });
 it('does not infer missing zero increments when fewer observations exist',()=>{
  const x=sourceCpuInkTempo([point(0,0,0),point(20,2,30),
   point(29,3,60)]);
  expect(x.windows).toHaveLength(1);
  expect(x.windows[0]).toMatchObject({throughNativeSecond:29,cpuShots:3,
   newlyChangedCpuCells:60});
 });
 it('rejects impossible negative native paint, backwards clock and count rollbacks',()=>{
  const one=point(0,3,20);
  expect(()=>sourceCpuInkTempo([one,point(30,2,30)])).toThrow('NONMONOTONIC');
  expect(()=>sourceCpuInkTempo([one,point(30,5,19)])).toThrow('NONMONOTONIC');
  expect(()=>sourceCpuInkTempo([one,{...point(30,5,50),
   elapsedNativeSeconds:-3}])).toThrow('NONMONOTONIC');
  expect(sourceCpuInkTempo([]).status).toBe('NO_OBSERVATIONS');
 });
});
