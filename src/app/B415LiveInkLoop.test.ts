import {describe,it,expect} from 'vitest';
import {b415StartNativeInkLoop,b415StepNativeInkLoop,
 b415ReadableInstruction,b415CanonicalOriginalRoundEnabled,type B415NativeFrame}
 from './B415LiveInkLoop';

const frame=(tick:number,shots:number,ink:number,
 mode='HUMAN',relation='NEUTRAL',recovery='LOCKED'):B415NativeFrame=>({
 tick,shots,ink,mode,relation,recovery,
 source:'25/17/26/0',scoreable:0,officialWinner:'NONE',
 playing:true,paused:false
});
describe('B415 real native source-only practice ink economy',()=>{
 it.each(['combat','circuit','coop','frontline'])(
  'allows existing native ink lesson in canonical %s with frozen source',
  mode=>{
   const base={canonicalMode:mode,fullRound:true,source:[25,17,26,0],
    matchState:'PLAYING',paused:false,stopped:false,officialWinner:'NONE'};
   expect(b415CanonicalOriginalRoundEnabled(base)).toBe(true);
   for(const invalid of [
    {...base,source:[25,17,27,0]},
    {...base,source:[25,17,26,1]},
    {...base,fullRound:false},{...base,paused:true},
    {...base,stopped:true},{...base,matchState:'TIME_UP'},
    {...base,officialWinner:'TEAM_A'}
   ])expect(b415CanonicalOriginalRoundEnabled(invalid)).toBe(false);
   expect(b415CanonicalOriginalRoundEnabled({...base,canonicalMode:null}))
    .toBe(false);
  }
 );

 it('requires real consecutive shots + consumption, OWN squid gain and human re-shot',()=>{
  const first=frame(2400,60,100);
  const original=structuredClone(first);
  let state=b415StartNativeInkLoop(first);
  state=b415StepNativeInkLoop(state,frame(2450,68,92.4));
  expect(state.stage).toBe('REFILL');
  state=b415StepNativeInkLoop(state,frame(2460,68,92,'SQUID','OWN','SQUID_OWN'));
  expect(state.stage).toBe('REFILL');
  state=b415StepNativeInkLoop(state,frame(2470,68,96,'SQUID','OWN','SQUID_OWN'));
  expect(state.stage).toBe('RESHOOT');
  state=b415StepNativeInkLoop(state,frame(2480,68,96,'HUMAN','OWN','HUMAN'));
  expect(state.stage).toBe('RESHOOT');
  state=b415StepNativeInkLoop(state,frame(2540,77,88.5));
  expect(state.stage).toBe('COMPLETE');
  expect(state.completedTick).toBe(2540);
  expect(state.officialTurfResult).toBe(false);
  expect(state.sourceOnly).toBe(true);
  expect(b415ReadableInstruction(state.stage)).toContain('UNSCORED');
  expect(first).toEqual(original);
 });
 it('cannot credit a dry fire, human idle refill, enemy ink or a fake turf mask',()=>{
  const first=frame(2500,60,85);
  let x=b415StartNativeInkLoop(first);
  x=b415StepNativeInkLoop(x,frame(2600,60,70));
  expect(x.stage).toBe('SPEND');
  x=b415StepNativeInkLoop(x,frame(2610,65,65));
  expect(x.stage).toBe('REFILL');
  x=b415StepNativeInkLoop(x,frame(2620,65,70,'HUMAN','OWN','HUMAN'));
  x=b415StepNativeInkLoop(x,frame(2630,65,72,'SQUID','ENEMY','SQUID_OWN'));
  x=b415StepNativeInkLoop(x,frame(2640,65,74,'SQUID','ENEMY','SQUID_OWN'));
  expect(x.stage).toBe('REFILL');
  x=b415StepNativeInkLoop(x,{...frame(2650,65,75,'SQUID','OWN','SQUID_OWN'),
   scoreable:1});
  expect(x.stage).toBe('HOLD');
  expect(x.completedTick).toBe(null);
 });
 it('keeps one native tick from counting twice and resets on new match tick/shot rollback',()=>{
  let x=b415StartNativeInkLoop(frame(4000,200,100));
  x=b415StepNativeInkLoop(x,frame(4001,210,90));
  expect(x.stage).toBe('REFILL');
  const duplicate=b415StepNativeInkLoop(x,frame(4001,220,50,'SQUID','OWN','SQUID_OWN'));
  expect(duplicate).toEqual(x);
  const newRound=b415StepNativeInkLoop(x,frame(0,0,100));
  expect(newRound.stage).toBe('SPEND');
  expect(newRound.shotsSpent).toBe(0);
  expect(newRound.firstTick).toBe(0);
 });
});
