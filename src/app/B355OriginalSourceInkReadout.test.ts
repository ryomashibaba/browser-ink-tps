import {describe,it,expect} from 'vitest';
import {b355OriginalSourceInkReadout as view} from './B355OriginalSourceInkReadout';
import type {B76HumanSourceView} from './UndertowF3HumanInkCoach';
const row=(ink:number,recoveryState:string,dry=0):B76HumanSourceView=>({
 state:'REAL_SOURCE_PAINT',windowNativeTicks:180,actualObservedTick:1145,
 humanAcceptedShots3s:10,actualHumanChangedCells3s:449,
 dryFireAttempts3s:dry,actualHumanInkTotal:449,
 playerInkPercent:ink,recoveryState,
 originalScoreableSurfaces:0,officialWinner:'NONE',
 inferredProjectileHitRate:false,original4v4Certified:false
});
const source={enabled:true,matchState:'PLAYING',paused:false,stopReason:null};
describe('B355 existing genuine B76 native resource presentation',()=>{
 it('distinguishes actual recovery lock, HUMAN and own-ink SQUID',()=>{
  expect(view(row(90,'LOCKED'),source)?.mode).toBe('RECOVERY_DELAY');
  expect(view(row(96,'HUMAN'),source)?.mode).toBe('HUMAN_REFILL');
  expect(view(row(22,'SQUID_OWN'),source)?.mode).toBe('SQUID_OWN_REFILL');
  expect(view(row(100,'HUMAN'),source)?.mode).toBe('READY');
 });
 it('never invents bullets or own-ink evidence, dry fire needs actual attempts',()=>{
  expect(view(row(20,'NONE'),source)?.mode).toBe('LOW_INK');
  expect(view(row(20,'NONE',1),source)?.mode).toBe('ACTUAL_DRY_FIRE');
  expect(view(row(20,'NONE',0),source)?.label).toContain('NO SCORE');
 });
 it('fails closed on QA authority, pause, unverified or disabled',()=>{
  expect(view(row(70,'HUMAN'),{...source,enabled:false})).toBeNull();
  expect(view(row(70,'HUMAN'),{...source,paused:true})).toBeNull();
  expect(view(row(70,'HUMAN'),{...source,matchState:'TIME_UP'})).toBeNull();
  expect(view({...row(70,'HUMAN'),originalScoreableSurfaces:1} as unknown as B76HumanSourceView,source)).toBeNull();
  expect(view({...row(70,'HUMAN'),state:'HOLD'},source)).toBeNull();
  expect(view({...row(70,'HUMAN'),playerInkPercent:Infinity},source)).toBeNull();
 });
});
