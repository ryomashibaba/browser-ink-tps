import {describe,it,expect} from 'vitest';
import {b480FocusedSourcePracticeCss,b245PlayerSightlineCss} from './B245SourcePresentation';
import {b476OriginalFrontlineObjectiveLayout} from './B476OriginalFrontlineObjectiveLayout';

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
 it('Issue #11: SOURCE STAGING B25 start and F8 never share left dock in PLAYER',()=>{
  const realReady=b476OriginalFrontlineObjectiveLayout({
   selected:true,originalStage:[25,17,26,0],
   nativeTick:0,matchState:'STAGING',paused:true,
   pointerLocked:false,practiceStatus:'IDLE',stopReason:null
  });
  expect(realReady).toMatchObject({location:'BOTTOM_LEFT',
   compact:false,phase:'READY',userReadOnly:true});
  const css=b480FocusedSourcePracticeCss(genuine);
  const f8Selector='#ui-root[data-t21-b245-presentation="PLAYER"] '+
   '#t21-f3-b245-view-toggle';
  expect(css).toContain(f8Selector);
  const f8Rule=css.slice(css.indexOf(f8Selector)+f8Selector.length);
  expect(f8Rule).toMatch(/^ \{left:auto!important;right:14px!important;bottom:200px!important;\}/);
  // A PLAYING-only F8 dock could never protect the genuine STAGING click.
  expect(css).not.toContain(
   '[data-t21-b338-phase="PLAYING"] #t21-f3-b245-view-toggle');
  expect(f8Rule).not.toContain('display:none');
  expect(f8Rule).not.toContain('pointer-events:none');
  // A QA-mode F8 may NOT return to the historical x=225 bottom
  // position: the genuine B475 B25 start card spans x12..268 at bottom16
  // and its button can sit underneath the higher-z F8 toggle.
  const qaSelector='#ui-root[data-t21-b245-presentation="QA"] '+
   '#t21-f3-b245-view-toggle';
  expect(css).toContain(qaSelector);
  const qaRule=css.slice(css.indexOf(qaSelector)+qaSelector.length);
  expect(qaRule).toMatch(/^ \{left:auto!important;right:14px!important;bottom:200px!important;\}/);
  expect(qaRule).not.toContain('pointer-events:none');
  expect(qaRule).not.toContain('display:none');
  // The original live compact B25 progress rule remains PLAYING-only.
  expect(css).toContain(
   '[data-t21-b338-phase="PLAYING"] #t21-f3-b25-paint-run');
 });
 it('keeps both F8 views on the same safe dock independent of phase',()=>{
  const css=b480FocusedSourcePracticeCss(genuine);
  const selector=(mode:'PLAYER'|'QA')=>
   '#ui-root[data-t21-b245-presentation="'+mode+'"] '+
   '#t21-f3-b245-view-toggle';
  for(const mode of ['PLAYER','QA'] as const){
   const start=css.indexOf(selector(mode));
   expect(start).toBeGreaterThan(-1);
   const rule=css.slice(start+selector(mode).length,
    css.indexOf('}',start)+1);
   expect(rule).toContain('right:14px!important');
   expect(rule).toContain('bottom:200px!important');
   expect(rule).toContain('left:auto!important');
   expect(selector(mode)).not.toContain('data-t21-b338-phase');
   expect(rule).not.toMatch(/display\s*:\s*none/);
   expect(rule).not.toMatch(/pointer-events\s*:\s*none/);
  }
  // QA still receives full B25, not a fake click via pointer-events.
  expect(css).not.toContain('#t21-f3-b25-start');
  expect(css).not.toContain('z-index:');
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
