import {describe,it,expect} from 'vitest';
import {sourceCoopEligible,sourceCoopNavigationUrl,sourceFullRoundCanArmWhilePaused,
 sourceOriginalCoopCanArmAtReady,b423UseRealSourceWorldReplay} from './B193SourceCoopMode';
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

 it('keeps the already-authorized real 12-weapon choice across fresh co-op replay only',()=>{
  const base='https://example.com/browser-ink-tps/?t21Play=preview&t21QaDrive=source'+
   '&t21W10B183=firstDropPlay&t21W10B193=allyCoop&t21W10B203=fullRound';
  for(const kit of ['ink-saber','twin-comets']){
   const u=new URL(sourceCoopNavigationUrl(base+'&t21W10B389='+kit,true));
   expect(u.searchParams.get('t21W10B389')).toBe(kit);
   expect(u.searchParams.get('t21W10B193')).toBe('allyCoop');
   expect(u.searchParams.get('t21W10B203')).toBe('fullRound');
   expect(u.searchParams.has('scoreable')).toBe(false);
  }
  for(const suspect of ['fake-kit','ink-saber&t21W10B389=ink-saber']){
   const u=new URL(sourceCoopNavigationUrl(base+'&t21W10B389='+suspect,true));
   expect(u.searchParams.has('t21W10B389')).toBe(false);
  }
  const switchOff=new URL(sourceCoopNavigationUrl(base+'&t21W10B389=ink-saber',false));
  expect(switchOff.searchParams.has('t21W10B389')).toBe(false);
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

describe('Real A1 co-op READY one-click mission arming',()=>{
 const fresh={fullRound:true,originalCoop:true,paused:true,
  everLockedRealPointer:false,nativeTick:0,matchState:'STAGING' as const,
  practiceStatus:'IDLE' as const,stopReason:null};
 it('permits only explicit fresh original A1 world at frozen tick 0',()=>{
  expect(sourceOriginalCoopCanArmAtReady(fresh)).toBe(true);
  for(const k of ['fullRound','originalCoop','paused'] as const)
   expect(sourceOriginalCoopCanArmAtReady({...fresh,[k]:false})).toBe(false);
  expect(sourceOriginalCoopCanArmAtReady({...fresh,everLockedRealPointer:true})).toBe(false);
  expect(sourceOriginalCoopCanArmAtReady({...fresh,nativeTick:1})).toBe(false);
  for(const matchState of ['PLAYING','TIME_UP'] as const)
   expect(sourceOriginalCoopCanArmAtReady({...fresh,matchState})).toBe(false);
  for(const practiceStatus of ['ARMED','RUNNING','CLEAR','TIME_UP','ABORTED'] as const)
   expect(sourceOriginalCoopCanArmAtReady({...fresh,practiceStatus})).toBe(false);
  expect(sourceOriginalCoopCanArmAtReady({...fresh,stopReason:'STOP'})).toBe(false);
 });
});

describe('B423 frontmost terminal UI cannot use an in-place source replay',()=>{
 const fresh=()=>new URLSearchParams('t21Play=preview&t21QaDrive=source&'+
  't21W10B183=firstDropPlay&t21W10B193=allyCoop&t21W10B203=fullRound');
 it('requires true full-round co-op TIME_UP, never mid-game reset',()=>{
  expect(b423UseRealSourceWorldReplay(fresh(),'TIME_UP')).toBe(true);
  expect(b423UseRealSourceWorldReplay(fresh(),'PLAYING')).toBe(false);
  expect(b423UseRealSourceWorldReplay(fresh(),'STAGING')).toBe(false);
 });
 it('does not route unrelated combat or legacy modes through co-op',()=>{
  for(const [k,val] of [
   ['t21QaDrive','other'],['t21Play','other'],
   ['t21W10B193','no'],['t21W10B203','practice'],
   ['t21W10B192','humanCombat']
  ] as const){
   const p=fresh();p.set(k,val);
   expect(b423UseRealSourceWorldReplay(p,'TIME_UP')).toBe(false);
  }
 });
});
