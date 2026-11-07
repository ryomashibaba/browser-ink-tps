import {describe,it,expect} from 'vitest';
import {b480FocusedSourcePracticeCss,b245PlayerSightlineCss} from './B245SourcePresentation';

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

describe('original SOURCE F3/F5 PLAYER sightline, without F8/score authority',()=>{
 const genuine='?t21Play=preview&t21QaDrive=source&'+
  't21W10B192=humanCombat&t21W10B203=fullRound&'+
  't21W10B441=sourceFrontline';
 it('reduces active PLAYER panel area while preserving actual source HUD',()=>{
  const css=b245PlayerSightlineCss(genuine);
  expect(css).toContain('data-t21-b245-presentation="PLAYER"');
  expect(css).toContain('data-t21-b338-phase="PLAYING"');
  expect(css).toContain('#t21-f3-practice-hud');
  expect(css).toContain('width:min(306px');
  expect(css).toContain('#t21-f3-hud-clock');
  expect(css).toContain('#t21-f3-b464-real-cpu-frontline');
  expect(css).toContain('height:27px');
  expect(css).toContain('#t21-f3-b25-paint-run');
  // A1 genuine CLEAR: the left practice card duplicates the 180s timer
  // in the real 1600x900 screenshot. Its DATA and live ink/paint panels
  // must survive; only redundant text should collapse in PLAYER.
  expect(css).toContain('[data-t21-b411-active="true"]');
  expect(css).toContain('[data-t21-b195-real-source-clear="true"]');
  expect(css).toContain('#t21-f3-b195-next');
  expect(css).toContain('#t21-f3-b195-time');
  expect(css).toContain('#t21-f3-b414-native-ink');
  expect(css).toContain('#t21-f3-b417-paint-contest');
  expect(css).not.toContain('#t21-f3-b414-native-ink{display:none');
  expect(css).not.toContain('#t21-f3-b417-paint-contest{display:none');
  expect(css).not.toContain('data-t21-b245-presentation="QA"');
  for(const critical of ['t21-f3-hud-hp-bar','t21-f3-hud-ink-bar',
   't21-f3-hud-cpu','t21-f3-b84-danger','t21-f3-b82-splat-notice',
   't21-f3-b245-view-toggle']){
   expect(css).not.toContain('#'+critical+'{display:none');
  }
 });
 it('never applies to pinned deterministic, non-source or production UI',()=>{
  for(const [k,v] of [
   ['t21QaInput','deterministic'],['t21Play','production'],
   ['t21W10B203','off'],['t21QaDrive','other']
  ] as const){
   const q=new URLSearchParams(genuine);q.set(k,v);
   expect(b245PlayerSightlineCss('?'+q.toString())).toBe('');
  }
  for(const k of ['production','scoreable']){
   const q=new URLSearchParams(genuine);q.set(k,'true');
   expect(b245PlayerSightlineCss('?'+q.toString())).toBe('');
  }
  expect(b245PlayerSightlineCss('?t21Play=preview')).toBe('');
 });
 it('applies to original 12-kit, A1 co-op and existing B448 study',()=>{
  for(const [k,v] of [
    ['t21W10B384','loadoutCircuit'],
    ['t21W10B193','allyCoop'],['t21W10B448','realA3Front']
   ] as const){
   const q=new URLSearchParams(genuine);q.set(k,v);
   expect(b245PlayerSightlineCss('?'+q.toString()))
    .toContain('#t21-f3-practice-hud');
  }
 });
});
