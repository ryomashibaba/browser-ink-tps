import {describe,it,expect} from 'vitest';
import {sourcePlayPortalDestinations,sourcePlayPortalReturnUrl}
 from './SourcePlayPortal';
import {sourceCoopEligible} from './B193SourceCoopMode';
import {b384SourceCircuitSelected} from './B384SourceCircuit';
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
