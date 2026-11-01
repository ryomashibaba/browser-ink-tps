import {describe,expect,it} from 'vitest';
import {b245InitialSourceView,b247ShouldCompactSourceRadar,
 b245ShouldShowSourceCircuitGoal,b388VisibleNativeDescentWarning,
 b388SuppressDuplicateRampWarning} from './B245SourcePresentation';
describe('B245 original-source player and QA view policy',()=>{
 it('defaults a human 180s SOURCE round to uncluttered player view',()=>{
  expect(b245InitialSourceView('?t21W10B203=fullRound')).toBe('PLAYER');
 });
 it('does not change pinned native QA or ordinary preview',()=>{
  expect(b245InitialSourceView(
   '?t21W10B203=fullRound&t21QaDrive=source&t21QaInput=deterministic'
  )).toBe('QA');
  expect(b245InitialSourceView('?t21Play=preview')).toBe('QA');
 });
 it('allows explicit developer display without changing round authority',()=>{
  expect(b245InitialSourceView(
   '?t21W10B203=fullRound&t21Presentation=qa'
  )).toBe('QA');
 });
});

describe('B247 native radar focus must not be overwritten by 60Hz renders',()=>{
 it('compacts PLAYER READY even before pointer lock, preserving prior source data',()=>{
  expect(b247ShouldCompactSourceRadar(false,true,false)).toBe(true);
  expect(b247ShouldCompactSourceRadar(true,true,false)).toBe(true);
 });
 it('restores FULL for deliberate F8 QA inspection even during pointer lock',()=>{
  expect(b247ShouldCompactSourceRadar(false,false,true)).toBe(false);
  expect(b247ShouldCompactSourceRadar(true,false,true)).toBe(false);
 });
 it('retains legacy QA behavior in non-B245 source sessions',()=>{
  expect(b247ShouldCompactSourceRadar(false,false,false)).toBe(false);
  expect(b247ShouldCompactSourceRadar(true,false,false)).toBe(true);
 });
});

describe('B384 actual SOURCE local mission visible in PLAYER view',()=>{
 const b384='?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround'+
  '&t21W10B183=firstDropPlay&t21W10B192=humanCombat'+
  '&t21W10B203=fullRound&t21W10B384=loadoutCircuit';
 it('preserves B343 established visibility and admits source-only B384',()=>{
  expect(b245ShouldShowSourceCircuitGoal(
   '?t21QaDrive=source&t21W10B183=firstDropPlay'+
   '&t21W10B192=humanCombat&t21W10B343=sourceVolleyAtomic')).toBe(true);
  expect(b245ShouldShowSourceCircuitGoal(b384)).toBe(true);
  expect(b245InitialSourceView(b384)).toBe('PLAYER');
 });
 it('never exposes fake source circuit to incomplete or benchmark-mixed modes',()=>{
  for(const [key,value] of [['t21W10B183','off'],['t21QaDrive','other'],
   ['t21W10B343','sourceVolleyAtomic'],['t21QaInput','deterministic'],
   ['t21W10B384','off']] as const){
   const params=new URLSearchParams(b384);
   params.set(key,value);
   expect(b245ShouldShowSourceCircuitGoal('?'+params.toString())).toBe(false);
  }
  expect(b245ShouldShowSourceCircuitGoal('?t21Play=preview')).toBe(false);
 });
});

describe('B388 live source warning vs persistent QA suspicion',()=>{
 const f=()=>({source12Kit:true,playerView:true,playing:true,paused:false,
  tick:1450,kccGrounded:true as boolean|null,
  originalSupport:'UndertowT21D:right-low-team-a' as string|null,
  unsupportedTicks:0,recordedSuspicions:2,lastDetectionTick:1300 as number|null});
 it('real raised-floor support removes old false warning, F8 QA keeps evidence',()=>{
  expect(b388VisibleNativeDescentWarning(f())).toBe(false);
  expect(b388VisibleNativeDescentWarning({...f(),playerView:false})).toBe(true);
 });
 it('only recent native unsupported descent may warn a player',()=>{
  const x={...f(),tick:1310,kccGrounded:false,
   originalSupport:null,unsupportedTicks:12};
  expect(b388VisibleNativeDescentWarning(x)).toBe(true);
  expect(b388VisibleNativeDescentWarning({...x,tick:1430})).toBe(false);
  expect(b388VisibleNativeDescentWarning({...x,paused:true})).toBe(false);
  expect(b388VisibleNativeDescentWarning({...x,unsupportedTicks:0})).toBe(false);
 });
 it('only redundant adjacent ramp label suppressed, not true source edge',()=>{
  const x={source12Kit:true,playerView:true,grounded:true,
   footId:'UndertowT21D:right-low-team-a',
   circuitCleared:true,rampState:'ADJACENT_TO_ORIGINAL_RAMP'};
  expect(b388SuppressDuplicateRampWarning(x)).toBe(true);
  for(const y of [{...x,playerView:false},
   {...x,rampState:'CRITICAL_SOURCE_EDGE'},
   {...x,grounded:false},{...x,circuitCleared:false}])
   expect(b388SuppressDuplicateRampWarning(y)).toBe(false);
 });
});
