import {describe,it,expect} from 'vitest';
import {b207CombatRoundUrl} from './B207SourceCombatRound';
import {b389NativeBootWeapon} from './B389NativeSourceRoundReplay';
import {DEFAULT_WEAPON_ID,WEAPON_ORDER} from '../weapons/WeaponCatalog';
import {sourceCanonicalPlayableMode,sourceFinishedReplayHref} from './SourcePlayPortal';
describe('B207 real native 180s combat world selection',()=>{
 it('starts an original source-only human combat round, never scoreable',()=>{
  const q=new URL(b207CombatRoundUrl('https://example.org/game')).searchParams;
  expect(Object.fromEntries(q.entries())).toEqual({
   t21Play:'preview',t21QaDrive:'source',t21W10B183:'firstDropPlay',
   t21W10B192:'humanCombat',t21W10B112:'humanGround',
   t21W10B203:'fullRound'});
 });
 it('takes every genuine 12-weapon human selection into a new 180s combat world',()=>{
  for(const id of WEAPON_ORDER){
   const url=b207CombatRoundUrl('https://example.org/game?'+
    't21W10B389=forged&production=1&cpuWarp=1#old',id);
   const u=new URL(url),p=u.searchParams;
   expect(u.hash).toBe('');
   expect(u.pathname).toBe('/game');
   expect(p.get('t21W10B203')).toBe('fullRound');
   expect(p.get('t21W10B192')).toBe('humanCombat');
   expect(p.has('production')).toBe(false);
   expect(p.has('cpuWarp')).toBe(false);
   expect(p.get('t21W10B389')).toBe(id===DEFAULT_WEAPON_ID?null:id);
   expect(b389NativeBootWeapon(p)).toBe(id===DEFAULT_WEAPON_ID?null:id);
  }
 });
 it('rejects an unknown weapon instead of passing it to the new native world',()=>{
  expect(()=>b207CombatRoundUrl('https://example.org/game','fake'))
   .toThrow('B207_UNKNOWN_NATIVE_SELECTED_WEAPON');
  expect(()=>b207CombatRoundUrl('https://example.org/game',''))
   .toThrow('B207_UNKNOWN_NATIVE_SELECTED_WEAPON');
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
 it('normalizes real index.html game entry so 180s TIME_UP has a working next match',()=>{
  for(const id of [DEFAULT_WEAPON_ID,WEAPON_ORDER[3]]){
   const u=new URL(b207CombatRoundUrl(
    'https://example.org/browser-ink-tps/index.html?oldQa=1#legacy',id));
   expect(u.pathname).toBe('/browser-ink-tps/');
   expect(u.searchParams.has('oldQa')).toBe(false);
   expect(sourceCanonicalPlayableMode(u.href)).toBe('combat');
   const fresh=sourceFinishedReplayHref({
    href:u.href,weaponId:id,matchState:'TIME_UP',stopped:false,
    pointerLocked:false,originalSolids:25,originalPaint:17,
    originalLinks:26,scoreable:0,finishedVisible:true,canClick:true
   });
   expect(fresh).not.toBeNull();
   expect(sourceCanonicalPlayableMode(fresh!)).toBe('combat');
   expect(new URL(fresh!).pathname).toBe('/browser-ink-tps/');
  }
 });
});
