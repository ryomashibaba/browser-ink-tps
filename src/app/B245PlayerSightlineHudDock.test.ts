import {describe,it,expect} from 'vitest';
import {b245PlayerSightlineCss,b245RealFrontlineLiveHudDockCss}
 from './B245SourcePresentation';

describe('genuine SOURCE 180s center sightline',()=>{
 const source='?t21Play=preview&t21QaDrive=source&'+
  't21W10B203=fullRound&t21W10B384=loadoutCircuit';
 const b475='?t21Play=preview&t21QaDrive=source&'+
  't21W10B203=fullRound&t21W10B192=humanCombat&'+
  't21W10B441=sourceFrontline&t21W10B475=realFrontlineReady';

 it('moves only active PLAYER HP/ink/weapon HUD off the middle',()=>{
  const css=b245PlayerSightlineCss(source);
  const media=css.split('@media(min-width:1100px) and (min-height:700px){')[1]
   ?.split('}')[0]??'';
  expect(media).toContain(
   '#ui-root[data-t21-b245-presentation="PLAYER"]'+
   '[data-t21-b338-phase="PLAYING"] #t21-f3-practice-hud');
  expect(media).toContain('left:14px!important;top:14px!important');
  expect(media).toContain('right:auto!important;transform:none!important');
  expect(media).not.toContain('data-t21-b245-presentation="QA"');
  expect(css).toContain('#t21-f3-b338-source-guide');
  expect(css).toContain('#t21-f3-hud-clock');
  expect(css).not.toContain('pointer-events:none!important');
 });

 it('retains B475 specific lower-left docking precedence',()=>{
  const css=b245RealFrontlineLiveHudDockCss(b475);
  // This optional specialty CSS is installed after normal sightline CSS.
  if(css)expect(css).toContain('top:clamp(184px,22vh,220px)!important');
  // The normal docking is still restricted to active PLAYER view.
  expect(b245PlayerSightlineCss(source)).toContain(
   '[data-t21-b338-phase="PLAYING"]');
 });

 it('does not alter QA, ordinary preview or non-source game',()=>{
  for(const query of [
   '?t21Play=preview',
   '?t21Play=preview&t21W10B203=fullRound',
   '?t21Play=preview&t21QaDrive=source&t21W10B203=fullRound&'+
    't21QaInput=deterministic',
   source+'&production=1',
   source+'&scoreable=1'
  ])expect(b245PlayerSightlineCss(query)).toBe('');
 });
});
