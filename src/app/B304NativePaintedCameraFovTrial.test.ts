import {describe,it,expect} from 'vitest';
import {B304_REAL_FOV,b304CameraEligible,type B304CameraGate}
 from './B304NativePaintedCameraFovTrial';
const base:B304CameraGate={optIn:true,paused:true,pointerLocked:false,
 stopped:false,originalFullRound:true,phase:'STAGING',nativeTick:94,
 shots:10,paintCells:380,source:[25,17,26,0],renderMeshes:17,
 visibleMeshes:17,originalActors:true,relocatedActors:0,
 current:'ORIGINAL',requested:'WIDE',startedAtTick:null,currentFov:63};
describe('B304 true camera FOV-only source-paint A-B-C-A',()=>{
 it('pins normal gameplay optics and bounded study candidates',()=>{
  expect(B304_REAL_FOV.ORIGINAL).toBe(63);
  expect(B304_REAL_FOV.WIDE).toBe(76);
  expect(B304_REAL_FOV.FOCUS).toBe(52);
 });
 it('allows only same native tick with exact previous lens',()=>{
  expect(b304CameraEligible(base)).toBe(true);
  const b={...base,current:'WIDE' as const,requested:'FOCUS' as const,
   currentFov:76,startedAtTick:94};
  expect(b304CameraEligible(b)).toBe(true);
  expect(b304CameraEligible({...b,current:'FOCUS',
   requested:'ORIGINAL',currentFov:52})).toBe(true);
  expect(b304CameraEligible({...base,requested:'FOCUS'})).toBe(false);
  expect(b304CameraEligible({...b,nativeTick:95})).toBe(false);
  expect(b304CameraEligible({...b,currentFov:63})).toBe(false);
 });
 it('requires authentic original frozen input and source boundary',()=>{
  for(const bad of [{optIn:false},{paused:false},{pointerLocked:true},
   {stopped:true},{originalFullRound:false},{phase:'TIME_UP'},
   {shots:0},{paintCells:0},{nativeTick:0},
   {source:[25,17,26,1] as const},{renderMeshes:16},
   {visibleMeshes:16},{originalActors:false},{relocatedActors:1},
   {currentFov:NaN}])
   expect(b304CameraEligible({...base,...bad})).toBe(false);
 });
});
