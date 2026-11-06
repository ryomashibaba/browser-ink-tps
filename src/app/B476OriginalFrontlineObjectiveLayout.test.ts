import {describe,it,expect} from 'vitest';
import {b476OriginalFrontlineObjectiveLayout}
 from './B476OriginalFrontlineObjectiveLayout';
const ready=()=>({
 selected:true,originalStage:[25,17,26,0] as readonly number[],
 nativeTick:0,matchState:'STAGING',
 paused:true,pointerLocked:false,practiceStatus:'IDLE',
 stopReason:null as string|null
});
describe('B476 real B475 player HUD is readable without covering B464',()=>{
 it('places the actual ready button left, full size and interactive',()=>{
  expect(b476OriginalFrontlineObjectiveLayout(ready())).toMatchObject({
   location:'BOTTOM_LEFT',compact:false,phase:'READY',officialWinner:'NONE'
  });
 });
 it('compacts only while genuine pointer-locked SOURCE play is active',()=>{
  const active={...ready(),nativeTick:1280,matchState:'PLAYING',
   paused:false,pointerLocked:true,practiceStatus:'RUNNING'};
  expect(b476OriginalFrontlineObjectiveLayout(active)).toMatchObject({
   location:'BOTTOM_LEFT',compact:true,phase:'LIVE'
  });
  expect(b476OriginalFrontlineObjectiveLayout({...active,practiceStatus:'ARMED'}))
   .toMatchObject({compact:true,phase:'WAIT_REAL_7_CPU'});
  expect(b476OriginalFrontlineObjectiveLayout({...active,practiceStatus:'CLEAR'}))
   .toMatchObject({compact:true,phase:'CLEAR'});
  for(const change of [
   {pointerLocked:false},{paused:true},{matchState:'TIME_UP'},
   {practiceStatus:'IDLE'}, {stopReason:'REAL_RAPIER_HOLD'}
  ])expect(b476OriginalFrontlineObjectiveLayout({...active,...change})?.compact)
   .toBe(false);
 });
 it('refuses fabricated stage, invalid native clock or unselected mode',()=>{
  for(const change of [
   {selected:false},{originalStage:[25,17,26,1]},
   {originalStage:[24,17,26,0]},{originalStage:[25,17,25,0]},
   {nativeTick:-1},{nativeTick:1.5},{matchState:'BAD'},
   {practiceStatus:'FORGED'}
  ])expect(b476OriginalFrontlineObjectiveLayout({...ready(),...change}))
   .toBeNull();
 });
});
