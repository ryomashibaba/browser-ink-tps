import {describe,it,expect} from 'vitest';
import {b399ActorIntersectsCameraAim,B399_CLEAR_SIGHT_AUTHORITY,
 b399NativeRealVAllowed}
 from './B399NativeCameraAimClearance';
const eye={x:0,y:0,z:0},forward={x:0,y:0,z:-1};
describe('F5 SOURCE in-round visual-only aim clearance',()=>{
 it.each(['circuit','combat','coop','frontline'])(
  'enables genuine native V toggle in canonical %s only',mode=>{
   const x={code:'KeyV',mode,fullRound:true,stage:[25,17,26,0],
    phase:'PLAYING',paused:false,stopped:false,locked:true,hp:100,
    repeat:false,modified:false,editing:false};
   expect(b399NativeRealVAllowed(x)).toBe(true);
   for(const bad of [{...x,mode:null},{...x,stage:[25,17,26,1]},
    {...x,stage:[25,17,27,0]},{...x,code:'KeyG'},
    {...x,phase:'TIME_UP'},{...x,paused:true},{...x,stopped:true},
    {...x,locked:false},{...x,hp:0},{...x,repeat:true},
    {...x,modified:true},{...x,editing:true},
    {...x,fullRound:false}])
    expect(b399NativeRealVAllowed(bad)).toBe(false);
  });

 it('masks only nearby actors at actual camera center line',()=>{
  expect(b399ActorIntersectsCameraAim(eye,forward,{x:0,y:0,z:-1})).toBe(true);
  expect(b399ActorIntersectsCameraAim(eye,forward,{x:1.2,y:0,z:-1})).toBe(false);
  expect(b399ActorIntersectsCameraAim(eye,forward,{x:0,y:0,z:1})).toBe(false);
  expect(b399ActorIntersectsCameraAim(eye,forward,{x:0,y:0,z:-8})).toBe(false);
  expect(b399ActorIntersectsCameraAim(eye,forward,{x:0,y:0,z:-8},false,'PLAYER')).toBe(true);
  expect(b399ActorIntersectsCameraAim(eye,forward,{x:0,y:0,z:-9},false,'PLAYER')).toBe(false);
 });
 it('uses exit hysteresis and rejects invalid geometry',()=>{
  const actor={x:.70,y:0,z:-1.8};
  expect(b399ActorIntersectsCameraAim(eye,forward,actor,false)).toBe(false);
  expect(b399ActorIntersectsCameraAim(eye,forward,actor,true)).toBe(true);
  // Reproduce the 6.4m native shoulder camera rather than a fake 1m eye.
  const nativeEye={x:.72,y:1.88,z:6.26};
  const nativeForward={x:-.039,y:-.208,z:-.977};
  const player={x:0,y:0,z:0};
  expect(b399ActorIntersectsCameraAim(nativeEye,nativeForward,
   player,false,'PLAYER')).toBe(true);
  expect(b399ActorIntersectsCameraAim(nativeEye,nativeForward,
   player,false,'ALLY')).toBe(false);
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
