import {describe,it,expect} from 'vitest';
import {sourceCoopEligible,sourceCoopNavigationUrl} from './B193SourceCoopMode';
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
