/**
 * F4: narrow observational classification of ORIGINAL SOURCE floor authority.
 * NOT a floor reconstruction, visibility certification, nav/score/winner
 * permission, or substitute for original v7.2.0 collision Face/flags.
 *
 * Separates actual registered Rapier support from the pinned F3E optical
 * triangles at the exact sample height. A visual triangle is NOT a floor.
 */
import {Vec3} from 'playcanvas';
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {auditF3eSourceCoverage} from './UndertowF3EOriginalSourceCoverage';

export const F4_FOOT_HEIGHT_TOLERANCE_METERS=.22;
export type F4FloorSample={id:string;x:number;z:number;footY:number};
export type F4FloorClassification=
 'REGISTERED_COLLISION_RENDER_DECLARED'|
 'REGISTERED_COLLISION_RENDER_NOT_DECLARED'|
 'PINNED_OPTICAL_TRIANGLE_ONLY_NO_RAPIER_SUPPORT'|
 'NO_REGISTERED_OR_PINNED_OPTICAL_AT_THIS_FOOT_HEIGHT';
export type F4FloorObservation={
 id:string;point:readonly [number,number,number];
 classification:F4FloorClassification;
 originalRapierSupportId:string|null;
 originalRapierHitFootGapMeters:number|null;
 originalRapierColliderHasOwnRender:boolean;
 opticalOnlySourceComponents:readonly string[];
 originalStage:'25/17/26/0';runtimeAddedSolids:0;
 inferredFloorAuthorized:false;originalVersionCollisionCertified:false;
};
type SourceTriangle={id:string;vertices:readonly StageVector3[]};
/** Exact vertical XZ intersection, no snapping, triangulation or interpolation
 * of any original collision geometry. The interpolated Y is observational.
 */
export function f4OriginalTriangleAtFootHeight(
 vertices:readonly StageVector3[],
 x:number,z:number,footY:number,tolerance=F4_FOOT_HEIGHT_TOLERANCE_METERS
):boolean{
 if(![x,z,footY,tolerance].every(Number.isFinite)||tolerance<0)
  throw Error('F4_INVALID_SOURCE_HEIGHT_PROBE');
 for(let i=0;i+2<vertices.length;i+=3){
  const a=vertices[i]!,b=vertices[i+1]!,c=vertices[i+2]!;
  const den=(b[2]-c[2])*(a[0]-c[0])+
   (c[0]-b[0])*(a[2]-c[2]);
  if(!Number.isFinite(den)||Math.abs(den)<1e-9)continue;
  const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den;
  const v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den;
  const w=1-u-v;
  if(u< -1e-7||v< -1e-7||w< -1e-7)continue;
  const triangleY=u*a[1]+v*b[1]+w*c[1];
  if(Number.isFinite(triangleY)&&Math.abs(triangleY-footY)<=tolerance)
   return true;
 }
 return false;
}
export function inspectF4OriginalSourceFloorCorridor(
 stage:StageDefinition,physics:RapierStagePhysics,
 samples:readonly F4FloorSample[]
):readonly F4FloorObservation[]{
 const {parts}=auditF3eSourceCoverage(stage);
 if(stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26||samples.length>64)
  throw Error('F4_ORIGINAL_STAGE_OR_BATCH_UNAUTHORIZED');
 // F3E is optical even for categories that look like flat floors.
 // This filter excludes known WALL/SUPPORT/HIGH decorations, not collision.
 const optical:SourceTriangle[]=parts.filter(p=>
  ['CONCRETE','SLOPE','GLASS','DETAIL'].includes(p.shade))
  .map(p=>({id:p.id,vertices:p.vertices}));
 const results:F4FloorObservation[]=[];
 for(const sample of samples){
  if(!sample.id||!Number.isFinite(sample.x)||
     !Number.isFinite(sample.z)||!Number.isFinite(sample.footY))
   throw Error('F4_BAD_NATIVE_FOOT_SAMPLE');
  const body=new Vec3(sample.x,
   sample.footY+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
   sample.z);
  const ray=physics.castCharacterFootSupport(
   body,PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN');
  const gap=ray?sample.footY-ray.point.y:null;
  // An arbitrary lower surface 1m below is not valid near-height foot
  // support and MUST NOT get promoted as a walkable next step.
  const support=ray&&gap!==null&&Math.abs(gap)<=
   F4_FOOT_HEIGHT_TOLERANCE_METERS?ray:null;
  const solid=support?stage.solids.find(s=>s.id===support.solidId):null;
  if(support&&!solid)throw Error('F4_UNKNOWN_REGISTERED_RAPIER_SUPPORT');
  const originalVisible=!!solid?.render||
   !!solid&&stage.paintSurfaces.some(s=>s.backingSolidId===solid.id);
  const refs=optical.filter(p=>f4OriginalTriangleAtFootHeight(
   p.vertices,sample.x,sample.z,sample.footY)).map(p=>p.id);
  const classification:F4FloorClassification=support?
   originalVisible?'REGISTERED_COLLISION_RENDER_DECLARED':
    'REGISTERED_COLLISION_RENDER_NOT_DECLARED':
   refs.length>0?'PINNED_OPTICAL_TRIANGLE_ONLY_NO_RAPIER_SUPPORT':
    'NO_REGISTERED_OR_PINNED_OPTICAL_AT_THIS_FOOT_HEIGHT';
  results.push({
   id:sample.id,point:[sample.x,sample.footY,sample.z],
   classification,originalRapierSupportId:support?.solidId??null,
   originalRapierHitFootGapMeters:support?Number(gap!.toFixed(6)):null,
   originalRapierColliderHasOwnRender:!!solid?.render,
   opticalOnlySourceComponents:refs,originalStage:'25/17/26/0',
   runtimeAddedSolids:0,inferredFloorAuthorized:false,
   originalVersionCollisionCertified:false
  });
 }
 return results;
}
