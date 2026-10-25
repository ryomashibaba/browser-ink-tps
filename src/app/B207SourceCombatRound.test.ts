import {describe,it,expect} from 'vitest';
import {b207CombatRoundUrl} from './B207SourceCombatRound';
describe('B207 real native 180s combat world selection',()=>{
 it('starts an original source-only human combat round, never scoreable',()=>{
  const q=new URL(b207CombatRoundUrl('https://example.org/game')).searchParams;
  expect(Object.fromEntries(q.entries())).toEqual({
   t21Play:'preview',t21QaDrive:'source',t21W10B183:'firstDropPlay',
   t21W10B192:'humanCombat',t21W10B112:'humanGround',
   t21W10B203:'fullRound'});
 });
 it('discards former ally and unauthenticated QA stage shortcuts',()=>{
  const u=new URL(b207CombatRoundUrl('https://example.org/game?'+
   't21W10B193=allyCoop&t21QaInput=deterministic&'+
   't21W10B93=upperDetour&cpuWarp=1&production=1#legacy'));
  expect(u.hash).toBe('');
  for(const key of ['t21W10B193','t21QaInput','t21W10B93',
   'cpuWarp','production'])expect(u.searchParams.has(key)).toBe(false);
 });
 it('fails closed for non-browser navigation URLs',()=>{
  expect(()=>b207CombatRoundUrl('javascript:alert(1)')).toThrow('B207_INVALID_NAVIGATION_ORIGIN');
 });
});
