import {describe,it,expect} from 'vitest';
import {b480FocusedSourcePracticeCss} from './B245SourcePresentation';

describe('B480 restore REAL B441 practice only, no source authority change',()=>{
 const genuine='?t21Play=preview&t21QaDrive=source&'+
  't21W10B112=humanGround&t21W10B183=firstDropPlay&'+
  't21W10B192=humanCombat&t21W10B203=fullRound&'+
  't21W10B441=sourceFrontline';
 it('reverses old global important hide only for actual B476 compact',()=>{
  const css=b480FocusedSourcePracticeCss(genuine);
  expect(css).toContain('data-t21-b476-compact="true"');
  expect(css).toContain('display:block!important');
  expect(css).toContain('data-t21-b245-presentation="PLAYER"');
  expect(css).toContain('data-t21-b338-phase="PLAYING"');
  expect(css).toContain('#t21-f3-b245-view-toggle');
  expect(css).toContain('bottom:200px!important');
  expect(css).not.toContain('source-score');
 });
 it('leaves all other native SOURCE, A1, QA and production hidden',()=>{
  for(const [key,value] of [
   ['t21W10B441','none'],['t21W10B192','none'],
   ['t21W10B203','off'],['t21QaInput','deterministic'],
   ['t21W10B384','loadoutCircuit'],
   ['t21W10B193','allyCoop'],['t21Play','production'],
   ['t21QaDrive','other'],['t21W10B343','sourceVolleyAtomic']
  ] as const){
   const p=new URLSearchParams(genuine);p.set(key,value);
   expect(b480FocusedSourcePracticeCss('?'+p.toString())).toBe('');
  }
  expect(b480FocusedSourcePracticeCss('?t21Play=preview')).toBe('');
 });
});
