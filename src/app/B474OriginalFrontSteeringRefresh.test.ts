import {describe,it,expect} from 'vitest';
import {b474OriginalFrontSteeringRefreshSelected} from './B474OriginalFrontSteeringRefresh';
import {sourcePlayPortalDestinations,sourcePlayFrontlineResearchUrl}
 from './SourcePlayPortal';
import {shouldReissueOriginalSourceNativeTarget as refresh,
 SOURCE_NATIVE_REFRESH_THINK_CYCLES} from '../ai/OriginalSourceNativeTargetRefresh';
const page='https://example.org/browser-ink-tps/play-source.html';
const selected=()=>new URL(sourcePlayFrontlineResearchUrl(page)).searchParams;
describe('B474 original CPU Crowd duplicate-target suppression, research-only',()=>{
 it('enables genuine B441 player research and the existing B440 physical co-op witness',()=>{
  expect(b474OriginalFrontSteeringRefreshSelected(selected())).toBe(true);
  const q=new URLSearchParams('t21Play=preview&t21QaDrive=source&'+
   't21W10B183=firstDropPlay&t21W10B193=allyCoop&'+
   't21W10B203=fullRound&t21W10B441=sourceFrontline');
  expect(b474OriginalFrontSteeringRefreshSelected(q)).toBe(true);
  q.delete('t21W10B441');
  expect(b474OriginalFrontSteeringRefreshSelected(q)).toBe(false);
 });
 it('leaves all three normal SOURCE modes, QA overrides and source shooter untouched',()=>{
  const d=sourcePlayPortalDestinations(page);
  for(const url of Object.values(d))
   expect(b474OriginalFrontSteeringRefreshSelected(
    new URL(url).searchParams)).toBe(false);
  for(const [key,value] of [
   ['t21QaInput','deterministic'],['t21W10B343','sourceVolleyAtomic'],
   ['t21QaDrive','other'],['t21Play','production'],
   ['t21W10B203',''],['t21W10B441',''],
   ['t21W10B193','allyCoop']
  ] as const){
   const q=selected();q.set(key,value);
   expect(b474OriginalFrontSteeringRefreshSelected(q)).toBe(false);
  }
 });
 it('uses B35 bounded same-agent source goal policy, not arbitrary route grants',()=>{
  expect(SOURCE_NATIVE_REFRESH_THINK_CYCLES).toBe(4);
  const old={x:2,y:4,z:45,repeatedThinkCycles:0,sameAgent:true};
  expect(refresh(old,{x:2,y:4,z:45})).toBe(false);
  expect(refresh({...old,repeatedThinkCycles:3},{x:2,y:4,z:45})).toBe(true);
  expect(refresh(old,{x:3,y:4,z:45})).toBe(true);
  expect(refresh({...old,sameAgent:false},{x:2,y:4,z:45})).toBe(true);
 });
});
