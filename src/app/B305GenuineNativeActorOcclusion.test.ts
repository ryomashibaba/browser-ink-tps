import {describe,it,expect} from 'vitest';
import {b305NativeActorDrawEligible,type B305NativeActorDrawGate}
 from './B305GenuineNativeActorOcclusion';
const base:B305NativeActorDrawGate={
 optIn:true,paused:true,pointerLocked:false,stopped:false,
 fullRound:true,phase:'STAGING',tick:94,shots:10,paintCells:380,
 source:[25,17,26,0],actors:8,visuals:8,originalHumanVisible:8,
 originalActorStyle:true,relocations:0,hiddenAtTick:null,requestHide:true,
 cameraFov:63
};
describe('B305 real source actor-draw attribution only',()=>{
 it('requires same original 25/17/26/0 native painted pause',()=>{
  expect(b305NativeActorDrawEligible(base)).toBe(true);
  expect(b305NativeActorDrawEligible({...base,originalHumanVisible:0,
   requestHide:false,hiddenAtTick:94})).toBe(true);
 });
 it('rejects altered source actor visibility, camera, or fake painted state',()=>{
  for(const bad of [{optIn:false},{paused:false},{pointerLocked:true},
   {stopped:true},{fullRound:false},{phase:'TIME_UP'},{tick:0},
   {shots:0},{paintCells:0},{source:[25,17,26,1] as const},
   {actors:7},{visuals:7},{originalHumanVisible:7},
   {originalActorStyle:false},{relocations:1},{cameraFov:76},
   {hiddenAtTick:93},{requestHide:false}])
   expect(b305NativeActorDrawEligible({...base,...bad})).toBe(false);
 });
});
