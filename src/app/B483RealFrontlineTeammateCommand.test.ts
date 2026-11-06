import {describe,it,expect} from 'vitest';
import {b483RealFrontlineTeammateCommandSelected as selected,
 b483MayRequestTrueFrontlineA1Order as may} from './B483RealFrontlineTeammateCommand';
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
  for(const delta of [
   {selected:false},{stage:[25,17,26,1]},
   {stage:[24,17,26,0]},{stage:[25,17,25,0]},
   {nativeTick:0},{nativeTick:1.4},{matchState:'STAGING'},
   {matchState:'TIME_UP'},{paused:true},{stopReason:'PHYSICAL_HOLD'},
   {pointerLocked:false},{playerHp:0},{originalCpuRejoins:6},
   {originalCpuRejoins:8},{practiceVariant:'ALLY_SYNC'},
   {practiceStatus:'ARMED'}, {practiceStatus:'CLEAR'}
  ])expect(may({...frame(),...delta})).toBe(false);
 });
});
