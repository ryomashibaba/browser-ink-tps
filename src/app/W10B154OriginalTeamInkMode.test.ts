import {describe,it,expect} from 'vitest';
import {b154OriginalTeamInkOptIn as enabled}
 from './W10B154OriginalTeamInkMode';
const full='?t21Play=preview&t21QaDrive=source&t21W10B137=allyRally'+
 '&t21W10B150=allyInk&t21W10B154=teamCoverage';
describe('B154 combined seven-CPU original ink is strictly source QA opt-in',()=>{
 it('enables only with all exact original-source QA flags',()=>{
  expect(enabled(new URLSearchParams(full))).toBe(true);
 });
 it('cannot alter ordinary preview, stable T20, ally-only or fixed default',()=>{
  for(const query of [
   '?t21Play=preview&t21W10B154=teamCoverage',
   '?t21Play=preview&t21QaDrive=source&t21W10B154=teamCoverage',
   '?t21Play=preview&t21QaDrive=source&t21W10B137=allyRally&t21W10B150=allyInk',
   '?t21Play=preview&t21QaDrive=source&t21W10B137=allyRally',
   '?t21Play=production&t21QaDrive=source&t21W10B137=allyRally&t21W10B150=allyInk&t21W10B154=teamCoverage',
   full.replace('teamCoverage','auto'),
   full.replace('t21QaDrive=source','t21QaDrive=fake'),
   full.replace('t21W10B150=allyInk','t21W10B150=none')
  ])expect(enabled(new URLSearchParams(query))).toBe(false);
 });
});
