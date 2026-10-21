import {describe,it,expect} from 'vitest';
import {B75SourceInkActivity,type B75NativeInkFrame}
 from './UndertowF3LiveSourceInkActivity';
const frame=(tick=2000,shots=0,cells=0):B75NativeInkFrame=>({
 tick,cpuSourceTurfShots:shots,cpuImpactInkCellsChanged:cells,
 matchState:'PLAYING',paused:false,stopReason:null,
 originalSourceSolids:25,originalPaintSurfaces:17,
 originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
 productionAuthorized:false,unrestricted4v4Certified:false
});
describe('W10-B75 source-ink read-only real native activity feedback',()=>{
 it('shows paint ONLY from genuine increased CPU source-ink cells',()=>{
  const m=new B75SourceInkActivity();
  expect(m.observe(frame(2000,50,3500))).toMatchObject({
   status:'SOURCE_PATROL_NO_SHOTS',newSourceCells:0,realCpuShots:0});
  expect(m.observe(frame(2030,53,3710))).toMatchObject({
   status:'REAL_SOURCE_INK',newSourceCells:210,realCpuShots:3,
   totalChangedSourceCells:3710,originalScoreableCells:0});
  expect(m.observe(frame(2030,53,3710))).toMatchObject({
   newSourceCells:210,realCpuShots:3});
  expect(m.observe(frame(2031,54,3710))).toMatchObject({
   newSourceCells:210,realCpuShots:4,status:'REAL_SOURCE_INK'});
  expect(m.observe(frame(2212,55,3710))).toMatchObject({
   status:'SOURCE_SHOTS_NO_NEW_INK',newSourceCells:0,realCpuShots:1});
  expect(m.observe(frame(2400,55,3710))).toMatchObject({
   status:'SOURCE_PATROL_NO_SHOTS',newSourceCells:0,realCpuShots:0});
 });
 it('does not mistake shots, old full-round ink or idle time for new paint',()=>{
  const m=new B75SourceInkActivity();
  m.observe(frame(11800,105,3615));
  expect(m.observe(frame(11860,112,3615))).toMatchObject({
   status:'SOURCE_SHOTS_NO_NEW_INK',realCpuShots:7,newSourceCells:0,
   totalChangedSourceCells:3615});
 });
 it('distinguishes paused, end, staging and source-authority HOLD',()=>{
  const m=new B75SourceInkActivity();
  expect(m.observe({...frame(0),matchState:'STAGING'}))
   .toMatchObject({status:'STAGING'});
  expect(m.observe({...frame(20,3,400),paused:true}))
   .toMatchObject({status:'STOPPED',original4v4Certified:false});
  expect(m.observe({...frame(10800,100,5000),matchState:'TIME_UP'}))
   .toMatchObject({status:'STOPPED'});
  expect(m.observe({...frame(10900,101,5010),
   sourceScoreablePromotions:1})).toMatchObject({
   status:'UNVERIFIED',newSourceCells:0,totalRealCpuShots:0});
 });
 it('rejects forged or regressing native counters and never fabricates change',()=>{
  const m=new B75SourceInkActivity();
  m.observe(frame(400,12,380));
  for(const v of [frame(399,14,500),frame(401,11,500),
    frame(401,14,379),frame(401,-1,400)]){
   expect(m.observe(v)?.status).toBe('UNVERIFIED');
   m.observe(frame(400,12,380));
  }
 });
 it('does not activate when older detached B17 HUD fixtures lack native fields',()=>{
  const m=new B75SourceInkActivity();
  expect(m.observe({cpuSourceTurfShots:0,matchState:'STAGING',
   paused:false,stopReason:null,sourceScoreablePromotions:0,
   productionAuthorized:false})).toBeNull();
 });
});
