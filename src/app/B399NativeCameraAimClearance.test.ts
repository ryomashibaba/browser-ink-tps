import {describe,it,expect} from 'vitest';
import {b399ActorIntersectsCameraAim,B399_CLEAR_SIGHT_AUTHORITY}
 from './B399NativeCameraAimClearance';
const eye={x:0,y:0,z:0},forward={x:0,y:0,z:-1};
describe('F5 SOURCE in-round visual-only aim clearance',()=>{
 it('masks only nearby actors at actual camera center line',()=>{
  expect(b399ActorIntersectsCameraAim(eye,forward,{x:0,y:0,z:-1})).toBe(true);
  expect(b399ActorIntersectsCameraAim(eye,forward,{x:1.2,y:0,z:-1})).toBe(false);
  expect(b399ActorIntersectsCameraAim(eye,forward,{x:0,y:0,z:1})).toBe(false);
  expect(b399ActorIntersectsCameraAim(eye,forward,{x:0,y:0,z:-8})).toBe(false);
 });
 it('uses exit hysteresis and rejects invalid geometry',()=>{
  const actor={x:.65,y:0,z:-1.8};
  expect(b399ActorIntersectsCameraAim(eye,forward,actor,false)).toBe(false);
  expect(b399ActorIntersectsCameraAim(eye,forward,actor,true)).toBe(true);
  expect(b399ActorIntersectsCameraAim(eye,{x:0,y:0,z:0},actor,true)).toBe(false);
  expect(b399ActorIntersectsCameraAim(eye,forward,{...actor,x:NaN},true)).toBe(false);
 });
 it('retains 25/17/26/0 and never hides enemy or simulates damage',()=>{
  expect(B399_CLEAR_SIGHT_AUTHORITY).toMatchObject({
   renderOnly:true,sourceOnly:true,productionAuthorized:false,
   originalSolids:25,originalPaintSurfaces:17,originalNavLinks:26,
   scoreable:0,enemyActorsHidden:0,newActorBodies:0,
   gameplayDamageModified:false,artAccepted:false
  });
 });
});
