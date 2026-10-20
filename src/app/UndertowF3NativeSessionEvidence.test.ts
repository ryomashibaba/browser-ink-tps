import {describe,it,expect} from 'vitest';
import {W10B62NativeSessionEvidence,type B62NativeFrame}
 from './UndertowF3NativeSessionEvidence';
const state=(elapsed:number):B62NativeFrame=>({
 tick:900+Math.round(elapsed*60),
 matchState:elapsed===180?'TIME_UP':'PLAYING',
 timeRemainingSeconds:180-elapsed,
 paused:elapsed===180,
 stopReason:null,
 originalSourceSolids:25,originalPaintSurfaces:17,originalSourceNavigationLinks:26,
 sourceScoreablePromotions:0,productionAuthorized:false,
 unrestricted4v4Certified:false,
 shotsFired:elapsed,
 b23HumanInkFeedback:{humanChangedCells:elapsed*2},
 cpuSourceTurfShots:elapsed*3,cpuImpactInkCellsChanged:elapsed*4,
 cpuSplats:0,humanSplats:0,humanRespawns:0,
 cpu:{physicalRejoins:['A1','A2','A3','B1','B2','B3','B4']},
 cpuContinuity:{suspectedStallCount:0,longestStallSeconds:0},
 sourceFrameQuality:{
  liveUpdateFrames:100+elapsed,p95Ms:72,
  accumulatedDroppedSimulationSeconds:0
 }
});
describe('W10-B62 owner-only actual 180s source activity report',()=>{
 it('reports 10-second native timeline, real deltas, no scored Turf',()=>{
  const r=new W10B62NativeSessionEvidence();
  r.observe({...state(0),matchState:'STAGING',tick:0});
  for(let s=0;s<=180;s++)r.observe(state(s));
  const report=r.report();
  expect(r.snapshot()).toMatchObject({
   status:'COMPLETE',genuineNativeCompletion:true,officialWinner:'NONE'});
  expect(report).not.toBeNull();
  expect(report?.elapsedNativeMatchSeconds).toBe(180);
  expect(report?.lastNativeFrame).toMatchObject({
   nativeTick:11700,humanShots:180,cpuOriginalPhysicalRejoins:7});
  expect(report?.timeline.length).toBe(19);
  expect(report?.timeline[1]).toMatchObject({
   elapsedNativeSeconds:10,cpuShotsSincePreviousSample:30,
   changedCpuInkSincePreviousSample:40});
  expect(report).toMatchObject({
   privateOriginalSourceIncluded:false,telemetryUploaded:false,
   officialScoreableSurfaces:0,activationReady:false,officialWinner:'NONE'});
  expect(JSON.stringify(report)).not.toContain('Translate');
 });
 it('never exports an in-progress, incomplete or stopped round',()=>{
  const a=new W10B62NativeSessionEvidence();
  a.observe(state(15));expect(a.report()).toBeNull();
  a.observe({...state(60),stopReason:'GROUNDED_UNSUPPORTED'});
  expect(a.report()).toBeNull();
  expect(a.snapshot().status).toBe('SAFE_STOP');
  const b=new W10B62NativeSessionEvidence();
  b.observe(state(0));
  expect(()=>b.observe({...state(180),tick:10600})).toThrow('FALSE_180S_TICK_COUNT');
  expect(b.report()).toBeNull();
 });
 it('rejects false source score, inflated layers, fake clocks and source drift',()=>{
  const r=new W10B62NativeSessionEvidence();
  expect(()=>r.observe({...state(1),sourceScoreablePromotions:1})).toThrow('SOURCE_AUTHORITY_GATE');
  expect(()=>r.observe({...state(1),originalSourceNavigationLinks:undefined})).toThrow('SOURCE_AUTHORITY_GATE');
  expect(()=>r.observe({...state(1),timeRemainingSeconds:190})).toThrow('INVALID_NATIVE_METRICS');
  r.observe(state(10));
  expect(()=>r.observe({...state(12),tick:20})).toThrow('TICK_WENT_BACKWARD');
  expect(()=>r.observe({...state(20),shotsFired:0})).toThrow('COUNTER_ROLLBACK');
 });
 it('staging frames or paused snapshots never count as native playing time',()=>{
  const r=new W10B62NativeSessionEvidence();
  r.observe({...state(0),matchState:'STAGING'});
  r.observe({...state(20),paused:true});
  expect(r.snapshot().sampleCount).toBe(0);
  expect(r.report()).toBeNull();
  r.observe(state(21));
  expect(r.snapshot().sampleCount).toBe(1);
 });
});
