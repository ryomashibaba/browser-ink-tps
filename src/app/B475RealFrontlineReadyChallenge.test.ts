import {describe,it,expect} from 'vitest';
import {b475MayArmRealSourceFrontlineReady,b475RealFrontlineReadyMode}
 from './B475RealFrontlineReadyChallenge';
import {sourcePlayPortalDestinations,sourcePlayFrontlineResearchUrl}
 from './SourcePlayPortal';
const portal='https://example.org/browser-ink-tps/play-source.html';
const p=()=>new URL(sourcePlayFrontlineResearchUrl(portal)).searchParams;
const frame=()=>({
 stage:[25,17,26,0] as readonly number[],nativeTick:0,
 paused:true,fullRound:true,everLockedPointer:false,pointerLocked:false,
 matchState:'STAGING',practiceStatus:'IDLE',variant:'CLASSIC',
 stopReason:null as string|null
});
describe('B475 genuine READY B441 player-controlled SOURCE local objective',()=>{
 it('allows only the actual original 180s human combat frontline research',()=>{
  expect(b475RealFrontlineReadyMode(p())).toBe(true);
  expect(b475MayArmRealSourceFrontlineReady(p(),frame())).toBe(true);
  const choices=sourcePlayPortalDestinations(portal);
  for(const url of Object.values(choices))
   expect(b475RealFrontlineReadyMode(new URL(url).searchParams)).toBe(false);
 });
 it('never arms non-source, deterministic QA, shooter budget or co-op',()=>{
  for(const [k,v] of [
   ['t21Play','production'],['t21QaDrive','other'],
   ['t21W10B112',''],['t21W10B183',''],
   ['t21W10B192',''],['t21W10B203',''],
   ['t21W10B441',''],['t21W10B193','allyCoop'],
   ['t21W10B343','sourceVolleyAtomic'],
   ['t21W10B384','loadoutCircuit'],
   ['t21QaInput','deterministic']
  ] as const){
   const q=p();q.set(k,v);
   expect(b475MayArmRealSourceFrontlineReady(q,frame())).toBe(false);
  }
 });
 it('requires actual source geometry, fresh paused 0-tick READY and IDLE',()=>{
  for(const change of [
   {stage:[26,17,26,0]},{stage:[25,17,26,1]},
   {nativeTick:1},{paused:false},{fullRound:false},
   {everLockedPointer:true},{pointerLocked:true},
   {matchState:'PLAYING'},{matchState:'TIME_UP'},
   {practiceStatus:'ARMED'},{practiceStatus:'CLEAR'},
   {variant:'ALLY_SYNC'},{variant:'SWITCHBACK'},
   {stopReason:'PHYSICAL_STOP'}
  ]){
   expect(b475MayArmRealSourceFrontlineReady(p(),{
    ...frame(),...change
   })).toBe(false);
  }
 });
});
