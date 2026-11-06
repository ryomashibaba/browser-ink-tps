import {describe,it,expect} from 'vitest';
import {b483RealFrontlineTeammateCommandSelected as selected,
 b483MayRequestTrueFrontlineA1Order as may,
 b483ClassicPracticeAllowsLiveA1Order as practiceAllowsA1,
 b483OriginalAllyCommandFeedback as feedback}
 from './B483RealFrontlineTeammateCommand';
import {sourcePlayPortalDestinations,sourcePlayFrontlineResearchUrl}
 from './SourcePlayPortal';
const portal='https://example.org/browser-ink-tps/play-source.html';
const q=()=>new URL(sourcePlayFrontlineResearchUrl(portal)).searchParams;
const frame=()=>({
 selected:true,stage:[25,17,26,0] as readonly number[],
 nativeTick:1133,matchState:'PLAYING',paused:false,
 stopReason:null as string|null,pointerLocked:true,playerHp:100,
 originalCpuRejoins:7,practiceVariant:'CLASSIC',practiceStatus:'RUNNING'
});
describe('B483 verified native C feedback in playable real-source HUD',()=>{
 const base={status:'HOLD' as const,
  sourceDecision:'NO_VERIFIED_ORIGINAL_PATH' as const,
  repeatReady:false,nativeTick:104,lastRealKeyTick:100,genuineKeyRequests:2};
 it('separates genuine received C key, native path hold and route certification',()=>{
  const x=feedback(base);
  expect(x?.line).toContain('NO SAFE ORIGINAL RAPIER/RECAST PATH');
  expect(x?.line).toContain('C RETRY IN 26 NATIVE TICKS');
  expect(x?.canRepeatNow).toBe(false);
  expect(feedback({...base,repeatReady:true,nativeTick:140})?.line)
   .toContain('C REORDER AVAILABLE');
  expect(feedback({...base,
   sourceDecision:'NO_VERIFIED_FRESH_SOURCE_TARGET'})?.line)
   .toContain('NO VERIFIED FRESH INK TARGET');
  expect(feedback({...base,status:'REQUESTED',
   sourceDecision:'REQUESTED_ORIGINAL_CHECK'})?.line)
   .toContain('C RECEIVED · CHECKING ORIGINAL GOAL');
  expect(feedback({...base,status:'MOVING',
   sourceDecision:'ORIGINAL_GOAL_GRANTED'})?.line)
   .toContain('C DISABLED WHILE MOVING');
 });
 it('fails closed for contradictory native status and bogus tick',()=>{
  expect(feedback({...base,status:'ARRIVED'})).toBeNull();
  expect(feedback({...base,lastRealKeyTick:120})).toBeNull();
  expect(feedback({...base,genuineKeyRequests:0})).toBeNull();
  expect(feedback({...base,nativeTick:NaN})).toBeNull();
 });
});
describe('B483 live native B441 A1 command, reuses B471 existing authority',()=>{
 it('only selects the real original B441 player research variant',()=>{
  expect(selected(q())).toBe(true);
  for(const url of Object.values(sourcePlayPortalDestinations(portal)))
   expect(selected(new URL(url).searchParams)).toBe(false);
  const bad=q();
  bad.set('t21W10B193','allyCoop');
  expect(selected(bad)).toBe(false);
  bad.delete('t21W10B193');
  bad.set('t21QaInput','deterministic');
  expect(selected(bad)).toBe(false);
 });
 it('requires real 7/7 native, PLAYING, player and original running practice',()=>{
  expect(may(frame())).toBe(true);
  // Genuine C input stays legal after CLASSIC mission CLEAR during PLAYING.
  expect(may({...frame(),practiceStatus:'CLEAR'})).toBe(true);
  // Objective TIME_UP occurs after 60s while match remains PLAYING (180s).
  expect(may({...frame(),practiceStatus:'TIME_UP'})).toBe(true);
  expect(practiceAllowsA1('CLASSIC','TIME_UP')).toBe(true);
  expect(practiceAllowsA1('ALLY_SYNC','TIME_UP')).toBe(false);
  expect(practiceAllowsA1('CLASSIC','ABORTED')).toBe(false);
  expect(may({...frame(),practiceStatus:'CLEAR',matchState:'TIME_UP'})).toBe(false);
  expect(may({...frame(),practiceStatus:'TIME_UP',matchState:'TIME_UP'})).toBe(false);
  expect(may({...frame(),practiceStatus:'TIME_UP',paused:true})).toBe(false);
  expect(may({...frame(),practiceStatus:'TIME_UP',playerHp:0})).toBe(false);
  expect(may({...frame(),practiceStatus:'TIME_UP',originalCpuRejoins:6})).toBe(false);
  expect(may({...frame(),practiceStatus:'TIME_UP',stopReason:'PHYSICAL_HOLD'})).toBe(false);
  expect(may({...frame(),practiceStatus:'CLEAR',paused:true})).toBe(false);
  expect(may({...frame(),practiceStatus:'CLEAR',originalCpuRejoins:6})).toBe(false);
  for(const delta of [
   {selected:false},{stage:[25,17,26,1]},
   {stage:[24,17,26,0]},{stage:[25,17,25,0]},
   {nativeTick:0},{nativeTick:1.4},{matchState:'STAGING'},
   {matchState:'TIME_UP'},{paused:true},{stopReason:'PHYSICAL_HOLD'},
   {pointerLocked:false},{playerHp:0},{originalCpuRejoins:6},
   {originalCpuRejoins:8},{practiceVariant:'ALLY_SYNC'},
   {practiceStatus:'ARMED'}, {practiceStatus:'IDLE'},
   {practiceStatus:'ABORTED'}
  ])expect(may({...frame(),...delta})).toBe(false);
 });
});
