/**
 * T21 V28 / STAGE Issue #13.
 *
 * Narrow repair for the known SOURCE first-drop landing case: a straight
 * interpolation of two original Recast polyline vertices can have a Y that
 * is NOT the native closest-poly height at that same XZ. Only that
 * interpolation mismatch may be resolved. Never alter a native waypoint,
 * create terrain, move an actor, or certify a whole-body KCC route.
 *
 * B495/B496: physical first-drop landing top is project Y=3; the rejected
 * B2/B4 first samples had interpolated Y~3.28 while genuine Rapier hit the
 * existing registered landing. A full original B496 ray pass was only
 * 50/60 routes: the remaining ten MUST stay blocked.
 */
import {Vec3} from 'playcanvas';
import {stageSolidTriangleWorldVertices} from '../StageTriangleMesh';
import {UNDERTOW_RIGHT_LOW_ROUTE_RAMPS} from './UndertowSpillwayRouteRampGeometry';
import type {RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import {SurfaceFlags} from '../../ink/types';
import {
 stageSolidCollisionEnabled,stageSolidNavigationEnabled,
 type StageDefinition
} from '../StageDefinition';

const MAX_XZ_NATIVE_REPROJECTION_METERS=.01;
const ORIGINAL_GROUND_GAP_METERS=.25;
const ORIGINAL_SOURCE_FACE_Y_TOLERANCE_METERS=.025;

/** A single registered landing collision observation, never route authority. */
export interface NativeOriginalLandingFootProof{
 readonly originalSolidId:string;
 readonly physicalLandingY:number;
 readonly actualNativeY:number;
 readonly interpolatedNativeY:number;
 readonly projectionXZErrorMeters:number;
 readonly actualPhysicalGapMeters:number;
 readonly sameOriginalSourceFace:true;
 readonly newTerrainAuthorized:false;
 readonly newOffmeshLinkAuthorized:false;
 readonly realKccRouteCertified:false;
}

export function originalNativeLandingFootReprojection(
 stage:StageDefinition,
 physics:RapierStagePhysics,
 nav:RecastStageNavigation,
 raw:Readonly<{x:number;y:number;z:number}>,
 sideSign:1|-1
):NativeOriginalLandingFootProof|null{
 // This correction only applies to the already-registered first-drop landing
 // and the known original source QA stage. Not a global tolerance increase.
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26||
    stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0)||
    ![raw.x,raw.y,raw.z].every(Number.isFinite)||
    (sideSign!==1&&sideSign!==-1)||
    raw.z*sideSign<33||raw.y<2.5||raw.y>5.5)return null;
 const id='UndertowT21D:first-drop-landing-'+
  (sideSign===1?'positive-z':'negative-z');
 const solid=stage.solids.find(s=>s.id===id);
 if(!solid||!solid.footprint||solid.triangleMesh||
    solid.rotationEulerDegrees?.some(angle=>angle!==0)||
    !stageSolidCollisionEnabled(solid)||
    !stageSolidNavigationEnabled(solid))return null;
 const registeredTopY=solid.center[1]+solid.size[1]*.5;
 if(!Number.isFinite(registeredTopY))return null;
 // Never grant by projecting to a different XZ corridor or another height
 // layer. Native projection does not provide true polygon membership by ID;
 // corroborate it with the exact ORIGINAL SOURCE landing collider below.
 const projection=nav.auditNavMeshProjection(
  new Vec3(raw.x,raw.y,raw.z));
 const point=projection.nearestPoint;
 if(!projection.success||!point||
    ![point.x,point.y,point.z].every(Number.isFinite)||
    point.y<2.5||point.y>5.5||
    point.z*sideSign<33)return null;
 const dxz=Math.hypot(point.x-raw.x,point.z-raw.z);
 if(!Number.isFinite(dxz)||dxz>MAX_XZ_NATIVE_REPROJECTION_METERS)
  return null;
 const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const hit=physics.castCharacterFootSupport(
  new Vec3(raw.x,point.y+offset,raw.z),offset,'HUMAN');
 if(!hit||hit.solidId!==id||
    !Number.isFinite(hit.point.y)||
    Math.abs(hit.point.y-registeredTopY)>
     ORIGINAL_SOURCE_FACE_Y_TOLERANCE_METERS)return null;
 // Keep exactly the old 0.25m physical clearance, referenced to the
 // REAL nearest native height, not invented as a bigger 0.28m tolerance.
 const actualPhysicalGapMeters=point.y-hit.point.y;
 if(actualPhysicalGapMeters<0||
    actualPhysicalGapMeters>ORIGINAL_GROUND_GAP_METERS)
  return null;
 return {
  originalSolidId:id,
  physicalLandingY:hit.point.y,
  actualNativeY:point.y,
  interpolatedNativeY:raw.y,
  projectionXZErrorMeters:dxz,
  actualPhysicalGapMeters,
  sameOriginalSourceFace:true,
  newTerrainAuthorized:false,
  newOffmeshLinkAuthorized:false,
  realKccRouteCertified:false
 };
}


/** SOURCE FloorConcrete03 slope only: validate true native nearest height at
 * the SAME XZ against the exact original registered triangle and real
 * Rapier HUMAN collider. Does not grant a path or move a physical actor.
 * Pinned B450 genuine B2/B4: raw interpolated Y can rise 0.45–0.84m
 * above this known slope while nearest true Recast Y stays 0.13–0.16m
 * above the exact original Rapier face. Never enlarge the 0.25m bound. */
export interface NativeOriginalRampFootProof{
 readonly originalSolidId:string;
 readonly originalTriangleFaceY:number;
 readonly realRapierFaceY:number;
 readonly actualNativeY:number;
 readonly interpolatedNativeY:number;
 readonly projectionXZErrorMeters:number;
 readonly actualPhysicalGapMeters:number;
 readonly originalGeometryUnchanged:true;
 readonly completePhysicalKccRouteCertified:false;
 readonly newFloorOrOffmeshLinkAuthorized:false;
}

export function originalNativeRampFootReprojection(
 stage:StageDefinition,
 physics:RapierStagePhysics,
 nav:RecastStageNavigation,
 raw:Readonly<{x:number;y:number;z:number}>,
 sideSign:1|-1
):NativeOriginalRampFootProof|null{
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26||
    stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0)||
    ![raw.x,raw.y,raw.z].every(Number.isFinite)||
    (sideSign!==1&&sideSign!==-1)||
    raw.z*sideSign<33||raw.y<2.5||raw.y>5.5)return null;
 const expected=UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.find(
  x=>x.side===(sideSign===1?'POSITIVE_Z':'NEGATIVE_Z'));
 if(!expected)return null;
 const originalSolidId='UndertowT21D:'+expected.id;
 const solid=stage.solids.find(s=>s.id===originalSolidId);
 if(!solid||!solid.triangleMesh||
    solid.triangleMesh.indices.length!==6||
    !stageSolidCollisionEnabled(solid)||
    !stageSolidNavigationEnabled(solid))return null;
 // This corridor correction is valid only for the already authenticated
 // exact two source triangles (NOT another slope with a similar name).
 const world=stageSolidTriangleWorldVertices(solid);
 if(world.length!==expected.mesh.vertices.length||
    world.some((v,i)=>v.some((n,j)=>
     !Number.isFinite(n)||Math.abs(n-expected.mesh.vertices[i]![j]!)>.00001))||
    solid.triangleMesh.indices.some((v,i)=>
     v!==expected.mesh.indices[i]))return null;
 let triangleY:number|null=null;
 for(let i=0;i<solid.triangleMesh.indices.length;i+=3){
  const a=world[solid.triangleMesh.indices[i]!]!;
  const b=world[solid.triangleMesh.indices[i+1]!]!;
  const c=world[solid.triangleMesh.indices[i+2]!]!;
  const den=(b[2]-c[2])*(a[0]-c[0])+
   (c[0]-b[0])*(a[2]-c[2]);
  if(Math.abs(den)<1e-9)continue;
  const u=((b[2]-c[2])*(raw.x-c[0])+
   (c[0]-b[0])*(raw.z-c[2]))/den;
  const v=((c[2]-a[2])*(raw.x-c[0])+
   (a[0]-c[0])*(raw.z-c[2]))/den;
  const w=1-u-v;
  if(Math.min(u,v,w)<-0.0001||
     Math.max(u,v,w)>1.0001)continue;
  triangleY=u*a[1]+v*b[1]+w*c[1];
  break;
 }
 if(triangleY===null||!Number.isFinite(triangleY))return null;
 const projection=nav.auditNavMeshProjection(
  new Vec3(raw.x,raw.y,raw.z));
 const actual=projection.nearestPoint;
 if(!projection.success||!actual||
    ![actual.x,actual.y,actual.z].every(Number.isFinite)||
    actual.z*sideSign<33||
    actual.y<2.5||actual.y>5.5)return null;
 const snapXZ=Math.hypot(actual.x-raw.x,actual.z-raw.z);
 if(!Number.isFinite(snapXZ)||
    snapXZ>MAX_XZ_NATIVE_REPROJECTION_METERS)return null;
 const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const hit=physics.castCharacterFootSupport(
  new Vec3(raw.x,actual.y+offset,raw.z),offset,'HUMAN');
 if(!hit||hit.solidId!==originalSolidId||
    !Number.isFinite(hit.point.y)||
    Math.abs(hit.point.y-triangleY)>
     ORIGINAL_SOURCE_FACE_Y_TOLERANCE_METERS)return null;
 const gap=actual.y-hit.point.y;
 if(!Number.isFinite(gap)||gap<0||
    gap>ORIGINAL_GROUND_GAP_METERS)return null;
 return {originalSolidId,originalTriangleFaceY:triangleY,
  realRapierFaceY:hit.point.y,actualNativeY:actual.y,
  interpolatedNativeY:raw.y,projectionXZErrorMeters:snapXZ,
  actualPhysicalGapMeters:gap,originalGeometryUnchanged:true,
  completePhysicalKccRouteCertified:false,
  newFloorOrOffmeshLinkAuthorized:false};
}

/**
 * STAGE #13: existing registered right-low flat support only.
 * Corrects a source-native polyline interpolated Y against genuine Recast
 * nearest Y at exactly the same XZ and the ORIGINAL Rapier HUMAN collider.
 * No new terrain, off-mesh link, center route, actor motion, or KCC approval.
 */
export interface NativeOriginalRightLowFootProof {
 readonly originalSolidId:string;
 readonly physicalFloorY:number;
 readonly actualNativeY:number;
 readonly interpolatedNativeY:number;
 readonly projectionXZErrorMeters:number;
 readonly actualPhysicalGapMeters:number;
 readonly originalRegisteredRightLowFootprint:true;
 readonly newTerrainAuthorized:false;
 readonly newOffmeshLinkAuthorized:false;
 readonly realKccRouteCertified:false;
}
export function originalNativeRightLowFootReprojection(
 stage:StageDefinition,physics:RapierStagePhysics,nav:RecastStageNavigation,
 raw:Readonly<{x:number;y:number;z:number}>,sideSign:1|-1
):NativeOriginalRightLowFootProof|null{
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26||
    stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0)||
    ![raw.x,raw.y,raw.z].every(Number.isFinite)||
    (sideSign!==1&&sideSign!==-1)||
    raw.z*sideSign<33||raw.y<2.5||raw.y>5.5)return null;
 const id='UndertowT21D:right-low-team-'+(sideSign===1?'a':'b');
 const solid=stage.solids.find(s=>s.id===id);
 if(!solid||!solid.footprint||solid.triangleMesh||
    solid.rotationEulerDegrees?.some(angle=>angle!==0)||
    !solid.render||solid.footprint.cellSizeMeters!==.125||
    !stageSolidCollisionEnabled(solid)||!stageSolidNavigationEnabled(solid)||
    Math.abs(solid.center[1]+solid.size[1]*.5-4.5)>.000001||
    !stage.paintSurfaces.some(p=>p.backingSolidId===id&&
      (p.flags&SurfaceFlags.Floor)!==0))return null;
 const projection=nav.auditNavMeshProjection(new Vec3(raw.x,raw.y,raw.z));
 const point=projection.nearestPoint;
 if(!projection.success||!point||
    ![point.x,point.y,point.z].every(Number.isFinite)||
    point.y<2.5||point.y>5.5||point.z*sideSign<33)return null;
 const dxz=Math.hypot(point.x-raw.x,point.z-raw.z);
 if(!Number.isFinite(dxz)||dxz>MAX_XZ_NATIVE_REPROJECTION_METERS)
  return null;
 const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const hit=physics.castCharacterFootSupport(
  new Vec3(raw.x,point.y+offset,raw.z),offset,'HUMAN');
 if(!hit||hit.solidId!==id||!Number.isFinite(hit.point.y)||
    Math.abs(hit.point.y-4.5)>ORIGINAL_SOURCE_FACE_Y_TOLERANCE_METERS)
  return null;
 const gap=point.y-hit.point.y;
 if(!Number.isFinite(gap)||gap<0||gap>ORIGINAL_GROUND_GAP_METERS)
  return null;
 return {originalSolidId:id,physicalFloorY:hit.point.y,
  actualNativeY:point.y,interpolatedNativeY:raw.y,
  projectionXZErrorMeters:dxz,actualPhysicalGapMeters:gap,
  originalRegisteredRightLowFootprint:true,
  newTerrainAuthorized:false,newOffmeshLinkAuthorized:false,
  realKccRouteCertified:false};
}
