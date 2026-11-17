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
