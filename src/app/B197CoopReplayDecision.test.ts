import {describe,it,expect} from 'vitest';
import {b197CoopReplayDecision as decide} from './B197CoopReplayDecision';
import {sourceCoopNavigationUrl,sourceCoopEligible} from './B193SourceCoopMode';
const check=(practiceStatus:'IDLE'|'ARMED'|'RUNNING'|'CLEAR'|'TIME_UP'|'ABORTED',
 originalSourceCoop=true,sessionEnded=false,nativeStopped=false)=>decide({
 practiceStatus,originalSourceCoop,sessionEnded,nativeStopped});
describe('B197 replay only genuine original A1 source cooperative games',()=>{
 it('does not restart world or reset score while a real challenge is active',()=>{
  for(const state of ['IDLE','ARMED','RUNNING'] as const){
   const d=check(state);
   expect(d.replay).toBe(false);expect(d.buttonText).toBe('');
   expect(d.mayTeleportActiveActors).toBe(false);
  }
 });
 it('offers fresh Rapier/Recast CPU release after cleared and interrupted play',()=>{
  for(const state of ['CLEAR','TIME_UP','ABORTED'] as const){
   const d=check(state);
   expect(d.replay).toBe(true);
   expect(d.buttonText).toContain('FRESH SOURCE WORLD');
   expect(d.guidance).toContain('ESC');
   expect(d.originalScoreable).toBe(0);
   expect(d.officialWinner).toBe('NONE');
  }
 });
 it('cannot accidentally enable replay on historical isolated QA practice',()=>{
  for(const s of ['CLEAR','TIME_UP','ABORTED'] as const)
   expect(check(s,false).replay).toBe(false);
  expect(check('RUNNING',true,true).replay).toBe(true);
  expect(check('ARMED',true,false,true).replay).toBe(true);
 });
 it('fresh browser navigation only keeps explicitly selected real ally mode',()=>{
  const u=new URL(sourceCoopNavigationUrl(
   'https://example.test/game?t21Play=preview&t21QaDrive=source'+
   '&t21W10B193=allyCoop&t21W10B112=humanGround&t21W10B192=humanCombat',true));
  expect(sourceCoopEligible(u.searchParams)).toBe(true);
  expect(u.searchParams.get('t21W10B183')).toBe('firstDropPlay');
  expect(u.searchParams.has('t21W10B112')).toBe(false);
  expect(u.searchParams.has('t21W10B192')).toBe(false);
 });
});
