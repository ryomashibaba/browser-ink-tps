import {describe,it,expect} from 'vitest';
import {nativeSourceCpuCanStartActionsBeforeTickEnd,
 nativeSourceRoundActionWindow,nativeSourceHumanRespawnElapsedTicks,
 nativeSourceReviewRestoredPaused}
 from './NativeSourceRoundActionWindow';

describe('T21 V28 native 180s action authority and 150-tick human return',()=>{
 it('does not spend CPU ink during real 7/7 STAGING or on final clock tick',()=>{
  const state={matchState:'STAGING',remainingSeconds:180,
   nativeDtSeconds:1/60,stopReason:null,nativeHumanPrestartLocked:true};
  expect(nativeSourceCpuCanStartActionsBeforeTickEnd(state)).toBe(false);
  expect(nativeSourceCpuCanStartActionsBeforeTickEnd({
   ...state,matchState:'PLAYING'})).toBe(true);
  expect(nativeSourceCpuCanStartActionsBeforeTickEnd({
   ...state,matchState:'PLAYING',remainingSeconds:1/60})).toBe(false);
  expect(nativeSourceCpuCanStartActionsBeforeTickEnd({
   ...state,matchState:'PLAYING',remainingSeconds:1/60+4e-13}))
   .toBe(false);
  expect(nativeSourceCpuCanStartActionsBeforeTickEnd({
   ...state,matchState:'PLAYING',remainingSeconds:2/60}))
   .toBe(true);
  expect(nativeSourceCpuCanStartActionsBeforeTickEnd({
   ...state,matchState:'TIME_UP'})).toBe(false);
  expect(nativeSourceCpuCanStartActionsBeforeTickEnd({
   ...state,matchState:'PLAYING',stopReason:'SAFE_STOP'})).toBe(false);
 });
 it('opens only physically playing live actors and never recreates an ended attack',()=>{
  const inRound={matchState:'PLAYING',actualHumanHp:100,
   stopReason:null,nativeHumanPrestartLocked:true};
  expect(nativeSourceRoundActionWindow(inRound)).toEqual({
   cpuCanStartNewActions:true,humanCanStartNewActions:true});
  expect(nativeSourceRoundActionWindow({...inRound,actualHumanHp:0}))
   .toEqual({cpuCanStartNewActions:true,humanCanStartNewActions:false});
  for(const phase of ['STAGING','TIME_UP']){
   expect(nativeSourceRoundActionWindow({...inRound,matchState:phase}))
    .toEqual({cpuCanStartNewActions:false,humanCanStartNewActions:false});
  }
  expect(nativeSourceRoundActionWindow({...inRound,stopReason:'SAFE_STOP'}))
   .toEqual({cpuCanStartNewActions:false,humanCanStartNewActions:false});
 });
 it('requires 150 genuine native ticks after the fatal frame, not wall time',()=>{
  expect(nativeSourceHumanRespawnElapsedTicks(600,600)).toBe(0);
  expect(nativeSourceHumanRespawnElapsedTicks(600,749)).toBe(149);
  expect(nativeSourceHumanRespawnElapsedTicks(600,750)).toBe(150);
  // Paused frames do not advance the native tick counter.
  expect(nativeSourceHumanRespawnElapsedTicks(600,749)).toBe(149);
  for(const [death,now] of [[-1,0],[5,4],[4,4.5],[4,NaN]] as const){
   expect(()=>nativeSourceHumanRespawnElapsedTicks(death,now))
    .toThrow('T21_SOURCE_HUMAN_RESPAWN_INVALID_NATIVE_TICK');
  }
 });
});


describe('native SOURCE review cameras never restart the 180s clock without real mouse lock',()=>{
 const base={previouslyPaused:false,canonicalNativeSourceRound:true,
  everLockedRealPointer:true,pointerLocked:false,
  matchState:'PLAYING',stopped:false};
 it('keeps genuine native 180s physics stopped after an unlocked survey/gallery exit',()=>{
  expect(nativeSourceReviewRestoredPaused(base)).toBe(true);
  expect(nativeSourceReviewRestoredPaused({...base,matchState:'STAGING'}))
   .toBe(true);
  expect(nativeSourceReviewRestoredPaused({...base,matchState:'TIME_UP'}))
   .toBe(true);
  expect(nativeSourceReviewRestoredPaused({...base,stopped:true,
   pointerLocked:true})).toBe(true);
 });
 it('permits play only with real lock and an actual active phase',()=>{
  expect(nativeSourceReviewRestoredPaused({...base,pointerLocked:true}))
   .toBe(false);
  expect(nativeSourceReviewRestoredPaused({...base,
   pointerLocked:true,matchState:'STAGING'})).toBe(false);
  expect(nativeSourceReviewRestoredPaused({...base,
   previouslyPaused:true,pointerLocked:true})).toBe(true);
 });
 it('leaves first READY and T20/QA review-pause behavior intact',()=>{
  expect(nativeSourceReviewRestoredPaused({...base,
   everLockedRealPointer:false})).toBe(false);
  expect(nativeSourceReviewRestoredPaused({...base,
   canonicalNativeSourceRound:false})).toBe(false);
  expect(nativeSourceReviewRestoredPaused({...base,
   canonicalNativeSourceRound:false,previouslyPaused:true})).toBe(true);
 });
});
