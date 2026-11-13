/** Genuine SOURCE 25/17/26/0 Rapier-foot paint verification only.
 * Never mutates actors, stage, navigation, clock or score. */
import {Vec3} from 'playcanvas';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import type {StageRayHit} from '../physics/RapierStagePhysics';

export function sourceNativeMeleePaintFoot(body:Vec3,grounded:boolean,
 support:Pick<StageRayHit,'point'|'solidId'>|null):Vec3|null{
 if(!grounded||!support||!support.solidId||
   ![body.x,body.y,body.z,support.point.x,support.point.y,
     support.point.z].every(Number.isFinite))return null;
 const gap=body.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters-
   support.point.y;
 return Math.abs(gap)<=.12?support.point.clone():null;
}

/** Each original 17-surface ID is its registered 25-solid ID + ':paint'.
 * Reject false adjacent projection, unsupported height and wall-crossing. */
export function sourceNativeMeleeStampAllowed(foot:Vec3,target:Vec3,
 surfaceId:string,support:Pick<StageRayHit,'point'|'solidId'>|null,
 blockerDistance:number|null):boolean{
 if(!support||!support.solidId||surfaceId!==support.solidId+':paint'||
   ![foot.x,foot.y,foot.z,target.x,target.y,target.z,
     support.point.x,support.point.y,support.point.z].every(Number.isFinite)||
   Math.abs(support.point.y-target.y)>.12)return false;
 const len=Math.hypot(support.point.x-foot.x,
   support.point.y-foot.y,support.point.z-foot.z);
 return blockerDistance===null||
   Number.isFinite(blockerDistance)&&blockerDistance>=Math.max(0,len-.025);
}
