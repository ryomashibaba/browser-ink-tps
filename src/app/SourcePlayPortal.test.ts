import {describe,it,expect} from 'vitest';
import {sourcePlayPortalDestinations,sourcePlayWeaponModeDestinations,
 sourcePlayPortalReturnUrl,
 sourcePlayFrontlineResearchUrl,sourceReplayHotkeyAction,
 sourceFinishedReplayAction,sourceFinishedReplayHref}
 from './SourcePlayPortal';
import {sourceCoopEligible} from './B193SourceCoopMode';
import {b384SourceCircuitSelected} from './B384SourceCircuit';
import {b389NativeBootWeapon} from './B389NativeSourceRoundReplay';
import {WEAPON_ORDER} from '../weapons/WeaponCatalog';
describe('T21 real playable SOURCE game entry',()=>{
 it('launches authentic existing 12-weapon 180s SOURCE circuit',()=>{
  const d=sourcePlayPortalDestinations('https://example.org/browser-ink-tps/play-source.html');
  const u=new URL(d.circuit);
  expect(u.pathname).toBe('/browser-ink-tps/');
  expect(b384SourceCircuitSelected(u.searchParams)).toBe(true);
  expect(u.searchParams.get('t21W10B203')).toBe('fullRound');
  expect(u.searchParams.get('t21W10B384')).toBe('loadoutCircuit');
 });
 it('also exposes the existing native real-opponent research selection',()=>{
  const d=sourcePlayPortalDestinations('https://example.org/browser-ink-tps/play-source.html');
  const combat=new URL(d.combat);
  expect(combat.searchParams.get('t21W10B192')).toBe('humanCombat');
  expect(combat.searchParams.get('t21W10B183')).toBe('firstDropPlay');
  expect(combat.searchParams.has('t21W10B384')).toBe(false);
 });
 it('includes the existing actual 180s A1 cooperative SOURCE mission',()=>{
  const d=sourcePlayPortalDestinations('https://example.org/browser-ink-tps/play-source.html');
  const coop=new URL(d.coop);
  expect(sourceCoopEligible(coop.searchParams)).toBe(true);
  expect(coop.searchParams.get('t21W10B183')).toBe('firstDropPlay');
  expect(coop.searchParams.get('t21W10B203')).toBe('fullRound');
  expect(coop.searchParams.has('t21W10B192')).toBe(false);
 });
 it('lets authentic SOURCE players leave for menu without inherited QA',()=>{
  const d=sourcePlayPortalDestinations('https://example.org/browser-ink-tps/play-source.html');
  for(const u of Object.values(d))
   expect(sourcePlayPortalReturnUrl(u+'&production=1#inject'))
    .toBe('https://example.org/browser-ink-tps/play-source.html');
  expect(sourcePlayPortalReturnUrl('https://example.org/browser-ink-tps/'))
   .toBe(null);
  expect(sourcePlayPortalReturnUrl('javascript:alert(1)')).toBe(null);
 });
 it('discards injected QA shortcuts and never enables official turf',()=>{
  const d=sourcePlayPortalDestinations(
   'https://example.org/browser-ink-tps/play-source.html?'+
   't21QaInput=deterministic&cpuWarp=1&production=1#fake');
  for(const value of Object.values(d)){
   const u=new URL(value);
   expect(u.origin).toBe('https://example.org');
   expect(u.hash).toBe('');
   expect(u.pathname).toBe('/browser-ink-tps/');
   for(const key of ['t21QaInput','cpuWarp','production',
    'scoreable','t21W10B441','t21W10B448'])
    expect(u.searchParams.has(key)).toBe(false);
  }
 });
 it('refuses invalid or cross-page launch origins',()=>{
  expect(()=>sourcePlayPortalDestinations('javascript:alert(1)'))
   .toThrow('T21_SOURCE_PORTAL_INVALID_ORIGIN');
  expect(()=>sourcePlayPortalDestinations('https://example.org/index.html'))
   .toThrow('T21_SOURCE_PORTAL_INVALID_ORIGIN');
 });
});

describe('optional CPU B441/B448 original front game selection',()=>{
 it('adds only strict real existing CPU research flags to original combat URL',()=>{
  const page='https://example.org/browser-ink-tps/play-source.html';
  const mode=new URL(sourcePlayFrontlineResearchUrl(page));
  const normal=new URL(sourcePlayPortalDestinations(page).combat);
  expect(mode.origin).toBe(normal.origin);
  expect(mode.pathname).toBe(normal.pathname);
  for(const [key,value] of normal.searchParams)
   expect(mode.searchParams.get(key)).toBe(value);
  expect(mode.searchParams.get('t21W10B441')).toBe('sourceFrontline');
  expect(mode.searchParams.get('t21W10B448')).toBe('realA3Front');
  for(const name of ['production','scoreable','t21QaInput','t21W10B193'])
   expect(mode.searchParams.has(name)).toBe(false);
  expect(sourcePlayPortalReturnUrl(mode.href)).toBe(page);
 });
 it('default 3 game modes are untouched, user-injected params discarded',()=>{
  const page='http://127.0.0.1:4173/browser-ink-tps/play-source.html';
  const original=sourcePlayPortalDestinations(page);
  expect(Object.keys(original).sort()).toEqual(['circuit','combat','coop']);
  for(const u of Object.values(original)){
   expect(new URL(u).searchParams.has('t21W10B441')).toBe(false);
   expect(new URL(u).searchParams.has('t21W10B448')).toBe(false);
  }
  const opt=sourcePlayFrontlineResearchUrl(page+'?cpuWarp=1&scoreable=7#inject');
  expect(opt).not.toContain('cpuWarp');
  expect(opt).not.toContain('scoreable');
  expect(opt).not.toContain('#inject');
 });
 it('rejects unsafe origin and an unrelated page',()=>{
  expect(()=>sourcePlayFrontlineResearchUrl('javascript:alert(1)')).toThrow();
  expect(()=>sourcePlayFrontlineResearchUrl('https://example.org/index.html')).toThrow();
 });
});


describe('genuine SOURCE 180s R-key replay never resets the live native world',()=>{
 const d=sourcePlayPortalDestinations(
  'https://example.org/browser-ink-tps/play-source.html');
 const valid=(href:string)=>({
  href,code:'KeyR',repeat:false,modified:false,editing:false,
  matchState:'TIME_UP',stopped:false,pointerLocked:false,
  originalSolids:25,originalPaint:17,originalLinks:26,scoreable:0,
  finishedVisible:true,canClick:true
 });
 it('uses existing genuine B384/A1 replay, combat gets only a new-world reload',()=>{
  expect(sourceReplayHotkeyAction(valid(d.circuit))).toBe('CLICK_REAL_REPLAY');
  expect(sourceReplayHotkeyAction(valid(d.coop))).toBe('CLICK_REAL_REPLAY');
  expect(sourceReplayHotkeyAction(valid(d.combat))).toBe('RELOAD_NATIVE_SOURCE_WORLD');
  expect(sourceReplayHotkeyAction(valid(
   sourcePlayFrontlineResearchUrl(
    'https://example.org/browser-ink-tps/play-source.html'))))
   .toBe('RELOAD_NATIVE_SOURCE_WORLD');
 });
 it('never accepts R during STAGING, PLAYING, paused/review or stopped states',()=>{
  for(const href of Object.values(d)){
   for(const state of ['STAGING','PLAYING','INVALID']){
    expect(sourceReplayHotkeyAction({...valid(href),matchState:state}))
     .toBe('BLOCK');
   }
   for(const key of ['stopped','pointerLocked','editing','repeat',
    'modified'] as const)
    expect(sourceReplayHotkeyAction({...valid(href),[key]:true}))
     .toBe('BLOCK');
   expect(sourceReplayHotkeyAction({...valid(href),canClick:false}))
    .toBe('BLOCK');
   expect(sourceReplayHotkeyAction({...valid(href),finishedVisible:false}))
    .toBe('BLOCK');
  }
 });

 it('allows only a real unlocked cooperative CLEAR to use fresh-world R; NEVER STAGING or active practice',()=>{
  const q=valid(d.coop);
  const eligible={...q,matchState:'PLAYING',finishedVisible:false,
   canClick:false,practiceStatus:'CLEAR',coOpReplayVisible:true};
  expect(sourceReplayHotkeyAction(eligible)).toBe('NAVIGATE_FRESH_COOP_CLEAR');
  for(const altered of [
   {practiceStatus:'RUNNING'},{practiceStatus:'ARMED'},
   {practiceStatus:'IDLE'},{matchState:'STAGING'},
   {coOpReplayVisible:false},{pointerLocked:true},{stopped:true},
   {originalSolids:24},{originalPaint:16},{originalLinks:25},
   {scoreable:1},{repeat:true},{modified:true},{editing:true}
  ])expect(sourceReplayHotkeyAction({...eligible,...altered})).toBe('BLOCK');
  for(const suffix of ['&production=1','&t21QaInput=1',
   '&t21W10B389=unapproved','&t21W10B389=ink-saber&t21W10B389=ink-saber',
   '&t21W10B441=sourceFrontline'])
   expect(sourceReplayHotkeyAction({...eligible,href:q.href+suffix})).toBe('BLOCK');
  const selected=sourcePlayWeaponModeDestinations(
   'https://example.org/browser-ink-tps/play-source.html','ink-saber');
  expect(sourceReplayHotkeyAction({...eligible,href:selected.coop}))
   .toBe('NAVIGATE_FRESH_COOP_CLEAR');
  expect(sourceReplayHotkeyAction({...eligible,href:d.combat})).toBe('BLOCK');
  expect(sourceReplayHotkeyAction({...eligible,href:d.circuit})).toBe('BLOCK');
 });
 it('never treats missing/forged SOURCE geometry or score authority as replay',()=>{
  const q=valid(d.circuit);
  expect(sourceReplayHotkeyAction({...q,originalSolids:24})).toBe('BLOCK');
  expect(sourceReplayHotkeyAction({...q,originalPaint:18})).toBe('BLOCK');
  expect(sourceReplayHotkeyAction({...q,originalLinks:25})).toBe('BLOCK');
  expect(sourceReplayHotkeyAction({...q,scoreable:1})).toBe('BLOCK');
  expect(sourceReplayHotkeyAction({...q,originalSolids:undefined}))
   .toBe('BLOCK');
  expect(sourceReplayHotkeyAction({...q,href:q.href+'&production=1'}))
   .toBe('BLOCK');
  expect(sourceReplayHotkeyAction({...q,href:q.href+'&t21QaInput=warp'}))
   .toBe('BLOCK');
  expect(sourceReplayHotkeyAction({...q,href:'https://example.org/'}))
   .toBe('UNRELATED');
  expect(sourceReplayHotkeyAction({...q,code:'KeyW'})).toBe('UNRELATED');
 });
});


describe('SOURCE real TIME_UP replay buttons never call legacy in-world reset',()=>{
 const portal='https://example.org/browser-ink-tps/play-source.html';
 const d=sourcePlayPortalDestinations(portal);
 const genuine=(href:string)=>({
  href,matchState:'TIME_UP',stopped:false,pointerLocked:false,
  originalSolids:25,originalPaint:17,originalLinks:26,
  scoreable:0,finishedVisible:true,canClick:true
 });
 it('keeps original genuine A1/weapon replay and reloads genuine enemy mode',()=>{
  expect(sourceFinishedReplayAction(genuine(d.coop)))
   .toBe('CLICK_REAL_REPLAY');
  expect(sourceFinishedReplayAction(genuine(d.circuit)))
   .toBe('CLICK_REAL_REPLAY');
  expect(sourceFinishedReplayAction(genuine(d.combat)))
   .toBe('RELOAD_NATIVE_SOURCE_WORLD');
  expect(sourceFinishedReplayAction(genuine(
   sourcePlayFrontlineResearchUrl(portal))))
   .toBe('RELOAD_NATIVE_SOURCE_WORLD');
 });
 it('fails closed on live or invalid game evidence, never resets CPU/paint',()=>{
  for(const url of Object.values(d)){
   const v=genuine(url);
   for(const state of ['STAGING','PLAYING']){
    expect(sourceFinishedReplayAction({...v,matchState:state}))
     .toBe('BLOCK');
   }
   expect(sourceFinishedReplayAction({...v,stopped:true})).toBe('BLOCK');
   expect(sourceFinishedReplayAction({...v,pointerLocked:true})).toBe('BLOCK');
   expect(sourceFinishedReplayAction({...v,scoreable:1})).toBe('BLOCK');
   expect(sourceFinishedReplayAction({...v,originalLinks:25}))
    .toBe('BLOCK');
   expect(sourceFinishedReplayAction({...v,finishedVisible:false}))
    .toBe('BLOCK');
   expect(sourceFinishedReplayAction({...v,canClick:false}))
    .toBe('BLOCK');
   expect(sourceFinishedReplayAction({...v,href:v.href+'&t21QaInput=1'}))
    .toBe('BLOCK');
   expect(sourceFinishedReplayAction({...v,href:v.href+'&production=1'}))
    .toBe('BLOCK');
  }
 });
 it('does not permit unrelated preview or malformed enemy modes',()=>{
  const v=genuine(d.combat);
  expect(sourceFinishedReplayAction({...v,href:'https://example.org/'}))
   .toBe('BLOCK');
  expect(sourceFinishedReplayAction({...v,href:v.href.replace(
   't21W10B183=firstDropPlay','t21W10B183=unknown')}))
   .toBe('BLOCK');
  expect(sourceFinishedReplayAction({...v,href:v.href+'&t21W10B384=unknown'}))
   .toBe('BLOCK');
  expect(sourceFinishedReplayAction({...v,href:v.href+'&t21W10B193=allyCoop'}))
   .toBe('BLOCK');
 });
});

describe('B472 genuine SOURCE-mode-wide initial human weapon, not new gameplay authority',()=>{
 const page='https://example.org/browser-ink-tps/play-source.html';
 it('every one of 12 real kits can enter every one of four SOURCE modes',()=>{
  for(const id of WEAPON_ORDER){
   const all=sourcePlayWeaponModeDestinations(page,id);
   expect(Object.keys(all).sort()).toEqual(
    ['circuit','combat','coop','frontline']);
   for(const [mode,href] of Object.entries(all)){
    const u=new URL(href);
    expect(u.origin).toBe('https://example.org');
    expect(u.pathname).toBe('/browser-ink-tps/');
    expect(u.searchParams.get('t21W10B203')).toBe('fullRound');
    expect(u.searchParams.has('production')).toBe(false);
    expect(u.searchParams.has('scoreable')).toBe(false);
    expect(u.searchParams.has('t21QaInput')).toBe(false);
    expect(u.searchParams.get('t21W10B389')).toBe(
     id==='pulse-sprayer'?null:id);
    expect(b389NativeBootWeapon(u.searchParams)).toBe(
     id==='pulse-sprayer'?null:id);
    expect(u.searchParams.has('t21W10B441')).toBe(mode==='frontline');
    expect(u.searchParams.has('t21W10B448')).toBe(mode==='frontline');
   }
  }
 });
 it('default mode URL is unchanged when no player changes kit',()=>{
  const native=sourcePlayPortalDestinations(page);
  const all=sourcePlayWeaponModeDestinations(page,'pulse-sprayer');
  expect(all.circuit).toBe(native.circuit);
  expect(all.combat).toBe(native.combat);
  expect(all.coop).toBe(native.coop);
  expect(all.frontline).toBe(sourcePlayFrontlineResearchUrl(page));
  expect(()=>sourcePlayWeaponModeDestinations(page,'fake-unapproved-kit'))
   .toThrow('T21_SOURCE_UNKNOWN_NATIVE_WEAPON');
 });
 it('rejects fake QA, conflicting modes, duplicates and mixed frontline flags',()=>{
  const all=sourcePlayWeaponModeDestinations(page,'ink-saber');
  const bad:Array<(p:URLSearchParams)=>void>=[
   p=>p.append('t21W10B389','ink-saber'),
   p=>p.set('t21QaInput','deterministic'),
   p=>p.set('production','true'),
   p=>p.set('scoreable','true'),
   p=>p.set('cpuWarp','1'),
   p=>p.set('t21W10B193','invalid-mixed-mode'),
   p=>p.set('t21W10B192','fake'),
   p=>p.delete('t21W10B183'),
   p=>p.set('t21W10B203','notFull'),
   p=>p.set('t21W10B389','made-up'),
   p=>p.set('t21W10B441','untrusted-source-front'),
  ];
  for(const mode of ['combat','coop','frontline'] as const){
   for(const corrupt of bad){
    const p=new URL(all[mode]).searchParams;corrupt(p);
    expect(b389NativeBootWeapon(p)).toBe(null);
   }
  }
 });
 it('circuit replay semantics remain B384, never start a fake new world',()=>{
  const url=new URL(sourcePlayWeaponModeDestinations(page,'ink-saber').circuit);
  expect(b384SourceCircuitSelected(url.searchParams)).toBe(true);
  expect(b389NativeBootWeapon(url.searchParams)).toBe('ink-saber');
  expect(sourceFinishedReplayAction({
   href:url.href,matchState:'PLAYING',stopped:false,
   pointerLocked:true,originalSolids:25,originalPaint:17,
   originalLinks:26,scoreable:0,finishedVisible:true,canClick:true
  })).toBe('BLOCK');
 });
});

describe('Sprint A genuine four-mode 180s same-kit new-world replay',()=>{
 const portal='https://example.org/browser-ink-tps/play-source.html';
 const finished=(href:string,weaponId:string)=>({
  href,weaponId,matchState:'TIME_UP',stopped:false,
  pointerLocked:false,originalSolids:25,originalPaint:17,
  originalLinks:26,scoreable:0,finishedVisible:true,canClick:true
 });
 it('uses the ACTUAL READY weapon for all 12 kits and 4 original SOURCE modes',()=>{
  for(const initial of WEAPON_ORDER){
   const all=sourcePlayWeaponModeDestinations(portal,initial);
   for(const current of WEAPON_ORDER){
    const next=sourcePlayWeaponModeDestinations(portal,current);
    for(const mode of Object.keys(all) as Array<keyof typeof all>){
     const newWorld=sourceFinishedReplayHref(finished(all[mode],current));
     expect(newWorld).toBe(next[mode]);
     const params=new URL(newWorld!).searchParams;
     expect(params.get('t21W10B203')).toBe('fullRound');
     expect(params.has('scoreable')).toBe(false);
     expect(params.has('production')).toBe(false);
    }
   }
  }
 });
 it('cannot replay while live, stopped, locked or SOURCE authority differs',()=>{
  const all=sourcePlayWeaponModeDestinations(portal,'ink-saber');
  for(const url of Object.values(all)){
   const good=finished(url,'pulse-sprayer');
   for(const altered of [
    {matchState:'PLAYING'},{stopped:true},{pointerLocked:true},
    {originalSolids:24},{originalPaint:16},{originalLinks:25},
    {scoreable:1},{finishedVisible:false},{canClick:false},
    {weaponId:'unapproved-weapon'}
   ])expect(sourceFinishedReplayHref({...good,...altered})).toBe(null);
   for(const tail of ['&production=1','&scoreable=1',
    '&t21QaInput=deterministic','&cpuWarp=1',
    '&t21W10B389=ink-saber','#unsafe']){
    expect(sourceFinishedReplayHref(
     finished(url+tail,'ink-saber'))).toBe(null);
   }
  }
 });
 it('never promotes incomplete B441/B448 frontline or combined game flags',()=>{
  const original=sourcePlayWeaponModeDestinations(portal,'ink-saber').frontline;
  const played=sourceFinishedReplayHref(finished(original,'pulse-sprayer'));
  const q=new URL(played!).searchParams;
  expect(q.get('t21W10B441')).toBe('sourceFrontline');
  expect(q.get('t21W10B448')).toBe('realA3Front');
  expect(q.has('t21W10B389')).toBe(false);
  expect(sourceFinishedReplayHref(finished(
   original.replace('&t21W10B448=realA3Front',''),'ink-saber'))).toBe(null);
  expect(sourceFinishedReplayHref(finished(
   original+'&t21W10B193=allyCoop','ink-saber'))).toBe(null);
 });
});
