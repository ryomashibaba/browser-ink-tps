import {describe,it,expect} from 'vitest';
import {sourceCoopEligible,sourceCoopNavigationUrl,sourceFullRoundCanArmWhilePaused} from './B193SourceCoopMode';
describe('B204 native 180s paused user mission arming',()=>{
 const v={enabled:true,paused:true,awaitingPointerRelock:true,
  realPointerPreviouslyLocked:true,matchState:'PLAYING' as const,
  practiceStatus:'IDLE' as const,stopReason:null};
 it('admits real paused IDLE only; all other states rejected',()=>{
  expect(sourceFullRoundCanArmWhilePaused(v)).toBe(true);
  for(const key of ['enabled','paused','awaitingPointerRelock','realPointerPreviouslyLocked'] as const)
   expect(sourceFullRoundCanArmWhilePaused({...v,[key]:false})).toBe(false);
  expect(sourceFullRoundCanArmWhilePaused({...v,stopReason:'STOP'})).toBe(false);
  for(const matchState of ['STAGING','TIME_UP'] as const)
   expect(sourceFullRoundCanArmWhilePaused({...v,matchState})).toBe(false);
  for(const practiceStatus of ['ARMED','RUNNING','CLEAR','TIME_UP','ABORTED'] as const)
   expect(sourceFullRoundCanArmWhilePaused({...v,practiceStatus})).toBe(false);
 });
});
describe('B193 original source cooperative play choice',()=>{
 it('explicitly opts in; never silently activates regular previews',()=>{
  expect(sourceCoopEligible(new URLSearchParams(
   't21Play=preview&t21QaDrive=source&t21W10B193=allyCoop'))).toBe(true);
  expect(sourceCoopEligible(new URLSearchParams(
   't21Play=preview&t21W10B193=allyCoop'))).toBe(false);
  expect(sourceCoopEligible(new URLSearchParams(
   't21QaDrive=source&t21W10B193=allyCoop'))).toBe(false);
 });
 it('refuses to mix source opponent combat and allied cooperation',()=>{
  expect(sourceCoopEligible(new URLSearchParams(
   't21Play=preview&t21QaDrive=source&t21W10B193=allyCoop&t21W10B192=humanCombat'
  ))).toBe(false);
 });
 it('retains user-selected 180s round but excludes unsafe experiment flags',()=>{
  const old='https://example.com/game?t21Play=preview&t21QaDrive=source'+
   '&t21W10B193=allyCoop&t21W10B203=fullRound&t21W10B93=upperDetour';
  const next=new URL(sourceCoopNavigationUrl(old,true));
  expect(sourceCoopEligible(next.searchParams)).toBe(true);
  expect(next.searchParams.get('t21W10B203')).toBe('fullRound');
  expect(next.searchParams.has('t21W10B93')).toBe(false);
  expect([...next.searchParams.keys()].sort()).toEqual(
   ['t21Play','t21QaDrive','t21W10B183','t21W10B193','t21W10B203'].sort());
  const solo=new URL(sourceCoopNavigationUrl(next.href,false));
  expect(solo.searchParams.get('t21W10B203')).toBe('fullRound');
  expect(sourceCoopEligible(solo.searchParams)).toBe(false);
 });
 it('reboots original stage and excludes experimental flags',()=>{
  const source='https://example.com/ink?t21Play=preview&t21QaDrive=source'+
   '&t21W10B192=humanCombat&t21W10B137=allyRally';
  const yes=new URL(sourceCoopNavigationUrl(source,true));
  expect(sourceCoopEligible(yes.searchParams)).toBe(true);
  expect(yes.searchParams.get('t21W10B183')).toBe('firstDropPlay');
  expect(yes.searchParams.has('t21W10B192')).toBe(false);
  expect(yes.searchParams.has('t21W10B137')).toBe(false);
  const no=new URL(sourceCoopNavigationUrl(yes.href,false));
  expect(sourceCoopEligible(no.searchParams)).toBe(false);
  expect(no.searchParams.get('t21QaDrive')).toBe('source');
  expect(no.searchParams.has('t21W10B193')).toBe(false);
 });
});

describe('B341 exact research-only A/B source navigation',()=>{
 const source='https://example.com/ink?t21Play=preview&t21QaDrive=source'+
  '&t21W10B341=originalPatchAB&t21W10B64=inkAngleSweep'+
  '&t21W10B178=sourceInkRecovery&t21W10B180=originalUnpaintedPatches';
 it('retains exactly three original-source research flags only with the explicit B341 marker',()=>{
  const next=new URL(sourceCoopNavigationUrl(source,true));
  expect(next.searchParams.get('t21W10B193')).toBe('allyCoop');
  expect(next.searchParams.get('t21W10B341')).toBe('originalPatchAB');
  for(const [k,v] of [
   ['t21W10B64','inkAngleSweep'],['t21W10B178','sourceInkRecovery'],
   ['t21W10B180','originalUnpaintedPatches']
  ] as const)expect(next.searchParams.get(k)).toBe(v);
  expect(next.searchParams.has('t21W10B93')).toBe(false);
  expect(next.searchParams.has('t21W10B192')).toBe(false);
 });
 it('does not preserve incomplete, unmarked or corrupted opt-ins',()=>{
  for(const changed of [
   '&t21W10B341=notCertified',
   '&t21W10B64=invalid',
   '&t21W10B178=invalid',
   '&t21W10B180=invalid'
  ]){
   const u=new URL(source);
   const [key,v]=changed.substring(1).split('=');
   if(!key||!v)throw Error('B341_TEST_MUTATION_INVALID');
   u.searchParams.set(key,v);
   const next=new URL(sourceCoopNavigationUrl(u.href,true));
   for(const k of ['t21W10B341','t21W10B64','t21W10B178','t21W10B180'])
    expect(next.searchParams.has(k)).toBe(false);
  }
 });
});
