import {describe,it,expect} from 'vitest';
import {UndertowF3SourcePaintRun} from './UndertowF3SourcePaintRun';
import {sourcePracticeObjectiveView as view} from './UndertowF3PracticeObjectiveView';
describe('B53 player-visible real source practice dual objective',()=>{
 const sample=()=>new UndertowF3SourcePaintRun().snapshot();
 it('shows separate real paint and ground progress, no fake Turf',()=>{
  expect(view(sample())).toMatchObject({paint:0,ground:0,next:'PAINT',
   officialWinner:'NONE',scoring:'UNSCORED'});
  expect(view({...sample(),status:'RUNNING',humanChangedImpactCells:90,
   realGroundedTravelMeters:9,secondsRemaining:32})).toMatchObject({
    paint:50,ground:75,next:'PAINT',headline:'32s · SOURCE PRACTICE'});
  expect(view({...sample(),status:'RUNNING',humanChangedImpactCells:180,
   realGroundedTravelMeters:3})).toMatchObject({
    paint:100,ground:25,next:'GROUND'});
 });
 it('clamps real counter overflows and distinguishes completed and failed practice',()=>{
  expect(view({...sample(),status:'CLEAR',humanChangedImpactCells:220,
   realGroundedTravelMeters:14})).toMatchObject({
    paint:100,ground:100,next:'DONE',headline:'PRACTICE CLEAR · NOT TURF'});
  expect(view({...sample(),status:'TIME_UP'}).headline).toContain('NO WINNER');
  expect(view({...sample(),status:'ABORTED'}).hint).toContain('RETRY');
 });
 it('fails closed on source scoring drift and nonfinite physical counters',()=>{
  expect(()=>view({...sample(),sourceScoreablePromotions:1 as 0})).toThrow();
  expect(()=>view({...sample(),humanChangedImpactCells:NaN})).toThrow();
  expect(()=>view({...sample(),realGroundedTravelMeters:-1})).toThrow();
 });
});
